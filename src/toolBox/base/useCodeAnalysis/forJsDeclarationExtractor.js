/**
 * @fileoverview 提供从 JavaScript 代码中提取顶层声明（变量、函数、导入、导出）的功能。
 * @module forJsDeclarationExtractor
 */

import { parseCodeToAST } from '../useDeps/useBabel/useBabelExports.js'; // 更新导入路径

// 处理变量声明
function handleVariableDeclaration(declarations, node) {
    node.declarations.forEach(decl => {
        if (decl.id.type === 'Identifier') {
            declarations.add(decl.id.name);
        }
    });
}

// 处理函数声明
function handleFunctionDeclaration(declarations, node) {
    if (node.id) {
        declarations.add(node.id.name);
    }
}

// 处理导入声明
function handleImportDeclaration(declarations, node) {
    node.specifiers.forEach(spec => {
        declarations.add(spec.local.name);
    });
}

// 处理导出声明
function handleExportDeclaration(declarations, node) {
    if (node.declaration?.type === 'VariableDeclaration') {
        handleVariableDeclaration(declarations, node.declaration);
    }
}

// 过滤声明
function filterDeclarations(declarations) {
    const VUE_RUNTIME_INJECTIONS = new Set([
        'defineProps',
        'defineEmits',
        'defineExpose',
        'defineOptions',
        'defineSlots',
        'defineModel',
        'withDefaults',
        'useSlots',
        'useAttrs'
    ]);

    return Array.from(declarations)
        .filter(name =>
            !name.startsWith('_') &&
            !VUE_RUNTIME_INJECTIONS.has(name) &&
            name !== 'undefined' &&
            name !== 'null'
        )
        .join(', ');
}

/**
 * 提取给定 JavaScript 代码字符串中顶层声明的变量和函数名。
 * 
 * @param {string} code - 要分析的 JavaScript 代码。
 * @returns {string} 过滤后，以逗号分隔的声明名称字符串；如果解析失败则返回空字符串。
 */
export function extractDeclaredVarsInNodeDefine(code) {
    try {
        const ast = parseCodeToAST(code);
        const declarations = new Set();

        ast.program.body.forEach(node => {
            switch (node.type) {
                case 'VariableDeclaration':
                    handleVariableDeclaration(declarations, node);
                    break;
                case 'FunctionDeclaration':
                    handleFunctionDeclaration(declarations, node);
                    break;
                case 'ImportDeclaration':
                    handleImportDeclaration(declarations, node);
                    break;
                case 'ExportNamedDeclaration':
                    handleExportDeclaration(declarations, node);
                    break;
            }
        });

        return filterDeclarations(declarations);
    } catch (error) {
        console.error('解析声明失败:', error);
        return '';
    }
} 