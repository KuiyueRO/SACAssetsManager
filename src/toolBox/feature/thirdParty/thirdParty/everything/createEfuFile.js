/**
 * @fileoverview 创建 Everything 文件列表 (.efu) 文件的函数。
 * 依赖 Node.js 环境 (fs)。
 */

// 延迟加载 Node.js 模块
let fs;
function ensureNodeModules() {
    if (!fs) {
        if (typeof require === 'function') {
            fs = require('fs').promises; // 使用 promise 版本
        } else {
            throw new Error('Node.js modules (fs) are not available.');
        }
    }
}

/**
 * @typedef {object} EfuFileEntryInput
 * @property {string} filePath - 文件的完整路径。
 * @property {number} size - 文件大小 (字节)。
 * @property {number} mtimeMs - 修改时间的 Unix 时间戳 (毫秒)。
 * @property {number} ctimeMs - 创建时间的 Unix 时间戳 (毫秒)。
 */

/**
 * 根据文件条目信息数组，格式化为 EFU 文件内容的字符串。
 * @param {EfuFileEntryInput[]} fileEntries - 文件信息对象数组。
 * @returns {string} EFU 文件格式的字符串 (CSV)。
 */
export const formatEfuContent = (fileEntries) => {
    if (!Array.isArray(fileEntries)) {
        return ''; // 返回空字符串或标准的 EFU 头部？
    }
    const headers = '"Filename","Size","Date Modified","Date Created"';
    const contentLines = fileEntries.map(entry => {
        if (!entry || typeof entry.filePath !== 'string') {
            return null; // 跳过无效条目
        }
        // 路径需要是 Windows 风格的反斜杠吗？EFU 规范是怎样的？
        // 原代码是替换成 /，但保存时没替换回来。
        // 这里假设 EFU 需要反斜杠，但最好确认。
        // TODO: Verify required path separator for EFU format (\ or /).
        const filename = entry.filePath.replace(/\//g, '\\'); // 假设需要 \\

        // 时间戳需要转换为 Windows 时间戳格式吗？
        // 原代码直接用了毫秒数，这里也暂时保持一致。
        // TODO: Verify required timestamp format for EFU (Windows timestamp or Unix ms?).
        const size = entry.size ?? 0;
        const dateModified = entry.mtimeMs ?? 0;
        const dateCreated = entry.ctimeMs ?? 0;

        // EFU 格式要求值必须用引号括起来吗？原代码只有 Filename 加了引号
        // 这里只给 Filename 加引号以匹配原 `EfuFileHandler` 的逻辑
        // TODO: Verify quoting rules for EFU format.
        return `"${filename}",${size},${dateModified},${dateCreated}`;
    }).filter(line => line !== null); // 过滤掉无效条目产生的 null

    return [headers, ...contentLines].join('\n');
};

/**
 * 根据提供的文件信息创建并保存 EFU 文件。
 * @async
 * @param {EfuFileEntryInput[]} fileEntries - 包含文件路径、大小和时间戳信息的对象数组。
 * @param {string} targetFilePath - 要保存的 EFU 文件的完整路径。
 * @returns {Promise<void>} 操作完成时解析的 Promise。
 * @throws {Error} 如果文件写入失败。
 */
export async function createEfuFile(fileEntries, targetFilePath) {
    ensureNodeModules();
    if (typeof targetFilePath !== 'string' || targetFilePath.length === 0) {
        throw new Error("Invalid target file path provided.");
    }
    try {
        const efuContent = formatEfuContent(fileEntries);
        await fs.writeFile(targetFilePath, efuContent, 'utf-8');
        console.log(`EFU file list successfully saved to ${targetFilePath}`);
    } catch (error) {
        console.error(`Error saving EFU file list to ${targetFilePath}:`, error);
        throw error; // Re-throw the error
    }
} 