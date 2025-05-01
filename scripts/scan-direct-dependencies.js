import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..'); // 项目根目录

// --- 新增：解析命令行参数 ---
const args = process.argv.slice(2);
const modeArg = args.find(arg => arg.startsWith('--mode='));
const mode = modeArg ? modeArg.split('=')[1] : 'strict'; // 默认 strict
console.log(`Running in ${mode} mode.`);
// --- 结束：解析命令行参数 ---

const directoriesToScan = [
    path.join(projectRoot, 'src'),
    path.join(projectRoot, 'source')
];
const ignoreDirs = [
    path.join(projectRoot, 'src', 'toolBox', 'base', 'deps'),
    // 考虑是否允许 useNode/useElectron 内部 require
    // path.join(projectRoot, 'src', 'toolBox', 'base', 'useNode'),
    // path.join(projectRoot, 'src', 'toolBox', 'base', 'useElectron'),
];
// Node.js 内建模块列表 (不完全，可按需补充)
const nodeBuiltins = ['fs', 'path', 'os', 'crypto', 'http', 'https', 'url', 'zlib', 'stream', 'util', 'assert', 'async_hooks', 'events'];
// 查找 require('node_builtin') - 注意双反斜杠转义
const nodeBuiltinRequireRegex = new RegExp(`require\\(\\s*['"](${nodeBuiltins.join('|')})['"]\\s*\\)`, 'g');
// 查找 import ... from 'package_name' 或 import ... from '../non_relative_or_static'
// 排除相对路径 './', '../' 和 deps 目录 - 注意正则中的路径分隔符和转义
const npmOrStaticImportRegex = /import(?:["'\s]*(?:[\w*{}\n\r\t, ]+)from\s*)?(['"])(?![.\/])(?!src\/toolBox\/base\/deps\/)([^'"\/][^'"]*)\1/g;
// 查找 require('package_name') 或 require('../non_relative_or_static')
// 排除相对路径 './', '../' 和 deps 目录 - 注意正则中的路径分隔符和转义
const npmOrStaticRequireRegex = /require\(\s*(['"])(?![.\/])(?!src\/toolBox\/base\/deps\/)([^'"\/][^'"]*)\1\s*\)/g;
// 查找 import ... from '../static/...'
const staticPathImportRegex = /import.*?from\s+(['"])(?:\.\.\/)*static\/.*?\1/g;
// 查找 require('../static/...')
const staticPathRequireRegex = /require\(\s*(['"])(?:\.\.\/)*static\/.*?\1\s*\)/g;


let illegalImportsFound = [];
const toolBoxDir = path.join(projectRoot, 'src', 'toolBox').replace(/\\/g, '/'); // 标准化路径
const toolBoxDepsDir = path.join(toolBoxDir, 'base', 'deps').replace(/\\/g, '/'); // 标准化路径

async function scanDirectory(dir) {
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            // 检查是否应忽略此目录或文件
            if (ignoreDirs.some(ignoreDir => fullPath.startsWith(ignoreDir)) || entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'scripts') { // 添加 scripts 忽略
                continue;
            }

            if (entry.isDirectory()) {
                await scanDirectory(fullPath);
            } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.vue'))) { // 同时检查 .js 和 .vue 文件
                await scanFile(fullPath);
            }
        }
    } catch (error) {
        // 忽略读取不存在目录的错误，比如空的 source 目录
        if (error.code !== 'ENOENT') {
             console.error(`Error scanning directory ${dir}:`, error);
        }
    }
}

async function scanFile(filePath) {
    const relativeFilePath = path.relative(projectRoot, filePath).replace(/\\/g, '/'); // 获取标准化相对路径

    // --- 新增：宽松模式判断 ---
    if (mode === 'loose') {
        const isInToolBox = relativeFilePath.startsWith('src/toolBox/');
        const isInToolBoxDeps = relativeFilePath.startsWith('src/toolBox/base/deps/');

        // 如果在 toolBox 下但不在 deps 下，则跳过检查
        if (isInToolBox && !isInToolBoxDeps) {
            // console.log(`[Loose Mode] Skipping checks for: ${relativeFilePath}`); // 可选：添加日志
            return;
        }
        // 如果在 deps 下或不在 toolBox 下，则继续检查（默认行为）
    }
    // --- 结束：宽松模式判断 ---

    try {
        const content = await fs.readFile(filePath, 'utf-8');
        const lines = content.split('\n');
        let isAllowedRequireContext = false; // filePath.includes(path.join('src','toolBox', 'base', 'useNode')) || filePath.includes(path.join('src','toolBox', 'base', 'useElectron'));

        lines.forEach((line, index) => {
            const lineNumber = index + 1;
            let match;

            // 检查直接的 npm 包导入 或 非deps目录/非相对路径导入
            while ((match = npmOrStaticImportRegex.exec(line)) !== null) {
                 // 过滤掉指向 deps 的合法情况（理论上正则已处理，双重保险）
                // 同时过滤掉 Node.js 内建模块的导入 (如 import fs from 'fs') - 让 require 检查来处理
                 const moduleName = match[2];
                 if (!nodeBuiltins.includes(moduleName) && !match[0].includes('src/toolBox/base/deps/')) {
                     illegalImportsFound.push({ file: filePath, line: lineNumber, code: line.trim(), type: 'Direct NPM/External Import' });
                 }
            }
             npmOrStaticImportRegex.lastIndex = 0; // Reset regex state


            // 检查直接的 static 路径导入
             while ((match = staticPathImportRegex.exec(line)) !== null) {
                 illegalImportsFound.push({ file: filePath, line: lineNumber, code: line.trim(), type: 'Direct Static Import' });
             }
             staticPathImportRegex.lastIndex = 0;

            // 检查直接的 npm 包 require 或 非deps/非相对路径 require
            while ((match = npmOrStaticRequireRegex.exec(line)) !== null) {
                 const moduleName = match[2];
                 if (!nodeBuiltins.includes(moduleName) && !match[0].includes('src/toolBox/base/deps/')) {
                     illegalImportsFound.push({ file: filePath, line: lineNumber, code: line.trim(), type: 'Direct NPM/External Require' });
                 }
            }
             npmOrStaticRequireRegex.lastIndex = 0;

            // 检查直接的 static 路径 require
             while ((match = staticPathRequireRegex.exec(line)) !== null) {
                 illegalImportsFound.push({ file: filePath, line: lineNumber, code: line.trim(), type: 'Direct Static Require' });
             }
             staticPathRequireRegex.lastIndex = 0;


            // 检查 Node.js 内建模块的 require (需要排除 useNode/useElectron 等目录)
            if (!isAllowedRequireContext) {
                while ((match = nodeBuiltinRequireRegex.exec(line)) !== null) {
                    // 进一步检查确认不是 useNode 或 useElectron 内部的合法 require
                     const relativePath = path.relative(projectRoot, filePath).replace(/\\/g, '/');
                     // 精确排除 useNode 和 useElectron 目录
                    if (!relativePath.startsWith('src/toolBox/base/deps/') &&
                        !relativePath.startsWith('src/toolBox/base/platform/node/') && 
                        !relativePath.startsWith('src/toolBox/base/platform/electron/')) {
                         illegalImportsFound.push({ file: filePath, line: lineNumber, code: line.trim(), type: 'Direct Node Builtin Require' });
                         console.warn(`Potential direct node dependency in ${filePath}: ${match[1]}. Consider using wrappers in 'src/toolBox/base/deps/' or appropriate wrappers in 'src/toolBox/base/platform/node/' / 'src/toolBox/base/platform/electron/'.`);
                     }
                }
                 nodeBuiltinRequireRegex.lastIndex = 0;
            }
        });
    } catch (error) {
        console.error(`Error scanning file ${filePath}:`, error);
    }
}

async function runScan() {
    console.log('Scanning for direct dependency imports/requires...');
    for (const dir of directoriesToScan) {
        await scanDirectory(dir);
    }

    if (illegalImportsFound.length > 0) {
        console.warn(`\nFound ${illegalImportsFound.length} direct dependency references that need refactoring:`);
        // 去重并排序，让报告更清晰
        const uniqueIssues = Array.from(new Map(illegalImportsFound.map(item => [`${item.file}:${item.line}`, item])).values())
                                 .sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);

        let currentFile = '';
        uniqueIssues.forEach(issue => {
            const relativePath = path.relative(projectRoot, issue.file).replace(/\\/g, '/');
            if (relativePath !== currentFile) {
                console.log(`\n--- ${relativePath} ---`);
                currentFile = relativePath;
            }
            console.log(`  [L${issue.line}] (${issue.type}): ${issue.code}`);
        });
        console.warn(`\nPlease refactor these imports/requires to use the standard entry points in 'src/toolBox/base/deps/' or appropriate wrappers in 'src/toolBox/base/platform/node/' / 'src/toolBox/base/platform/electron/'.`);
        process.exitCode = 1; // Exit with error code if issues found
    } else {
        console.log('\nScan complete. No direct dependency references found outside allowed directories. Great job! ✅');
    }
}

runScan(); 