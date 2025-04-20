/**
 * @fileoverview 底层文件系统操作工具
 * @module toolBox/feature/forFileSystem/forLowLevelOperation
 * @description 提供一些更底层或使用旧 API 风格的文件系统操作功能。
 * 注意：这些函数可能涉及直接的文件修改（如删除），请谨慎使用。
 */

const fs = require('fs');
const path = require('path');

/**
 * 创建一个安全的回调函数包装器，防止回调中的错误中断主流程。
 * @param {Function} callback - 原始回调函数
 * @returns {Function} 安全的回调函数，会捕获并打印回调中的错误。
 * @private
 */
function 安全回调包装器(callback) {
    // 如果传入的不是函数，则返回一个空操作函数
    if (typeof callback !== 'function') {
        return (...args) => {}; 
    }
    return (...args) => {
        try {
            callback(...args);
        } catch (error) {
            console.error('执行回调时发生错误:', error, callback);
        }
    };
}

/**
 * 递归遍历目录，直接删除所有与指定文件名匹配的文件。
 * 
 * @param {string} directory - 要遍历的起始目录路径。
 * @param {string} filenameToDelete - 要删除的文件名 (完全匹配)。
 * @param {Object} [callbacks={}] - 包含不同情况的回调函数集合。
 * @param {function(Error): void} [callbacks.onError] - 处理遍历或状态获取错误。
 * @param {function(string): void} [callbacks.onFileFound] - 当找到匹配文件名的文件时调用 (删除前)。
 * @param {function(string): void} [callbacks.onDeleteSuccess] - 当成功删除文件时调用。
 * @param {function(string, Error): void} [callbacks.onDeleteFailure] - 当删除文件失败时调用。
 */
export function 递归直接删除指定文件名(directory, filenameToDelete, callbacks = {}) {
    const safeCallbacks = {
        onError: 安全回调包装器(callbacks.onError || console.error),
        onFileFound: 安全回调包装器(callbacks.onFileFound || console.log),
        onDeleteSuccess: 安全回调包装器(callbacks.onDeleteSuccess || console.log),
        onDeleteFailure: 安全回调包装器(callbacks.onDeleteFailure || console.error)
    };

    fs.readdir(directory, (readErr, files) => {
        if (readErr) {
            safeCallbacks.onError(new Error(`无法读取目录 ${directory}: ${readErr.message}`));
            return;
        }

        files.forEach((file) => {
            const fullPath = path.join(directory, file);

            // 使用 lstat 避免处理符号链接指向的目标
            fs.lstat(fullPath, (statErr, stats) => { 
                if (statErr) {
                    safeCallbacks.onError(new Error(`无法获取文件状态 ${fullPath}: ${statErr.message}`));
                    return;
                }

                if (stats.isDirectory()) {
                    // 递归调用处理子目录
                    递归直接删除指定文件名(fullPath, filenameToDelete, callbacks); 
                } else if (stats.isFile() && file === filenameToDelete) {
                    safeCallbacks.onFileFound(fullPath);
                    fs.unlink(fullPath, (unlinkErr) => {
                        if (unlinkErr) {
                            safeCallbacks.onDeleteFailure(fullPath, new Error(`删除文件失败 ${fullPath}: ${unlinkErr.message}`));
                        } else {
                            safeCallbacks.onDeleteSuccess(fullPath);
                        }
                    });
                }
                // 其他类型的文件（如符号链接）将被忽略
            });
        });
    });
}

// 提供中文别名
export { 递归直接删除指定文件名 as removeFilesRecursivelyByName }; 