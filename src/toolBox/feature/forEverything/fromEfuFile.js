/**
 * @fileoverview 提供从 EFU 文件或文件系统读取信息的函数。
 * 依赖 Node.js 环境 (fs)。
 */
import { computeEfuDataFromString } from './computeEfuData.js';

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
 * 从指定的 EFU 文件路径读取内容并解析。
 * @async
 * @param {string} filePath - EFU 文件的路径。
 * @returns {Promise<import('./computeEfuData.js').EfuEntry[]>} 返回解析后的文件条目对象数组。
 * @throws {Error} 如果文件读取或解析失败。
 */
export async function fromEfuFile_parseContent(filePath) {
    ensureNodeModules();
    if (typeof filePath !== 'string' || filePath.length === 0) {
        throw new Error("Invalid file path provided.");
    }
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        return computeEfuDataFromString(content);
    } catch (error) {
        console.error(`Error reading or parsing EFU file ${filePath}:`, error);
        throw error; // Re-throw the error
    }
}

/**
 * @typedef {object} FileStatInfo
 * @property {string} filePath - 文件的完整路径 (使用 / 分隔符)。
 * @property {number} size - 文件大小 (字节)。
 * @property {number} mtimeMs - 修改时间的 Unix 时间戳 (毫秒)。
 * @property {number} ctimeMs - 创建时间的 Unix 时间戳 (毫秒)。
 * @property {boolean} isFile - 是否是文件。
 * @property {boolean} isDirectory - 是否是目录。
 */

/**
 * 获取单个文件的状态信息。
 * @async
 * @param {string} filePath - 文件的路径。
 * @returns {Promise<FileStatInfo | null>} 返回包含文件信息的对象，如果文件不存在或读取失败则返回 null。
 */
export async function fromFs_getFileStats(filePath) {
    ensureNodeModules();
     if (typeof filePath !== 'string' || filePath.length === 0) {
        console.error("Invalid file path provided to getFileStats.");
        return null;
    }
    try {
        const stats = await fs.stat(filePath);
        return {
            filePath: filePath.replace(/\\/g, '/'),
            size: stats.size,
            mtimeMs: stats.mtimeMs,
            ctimeMs: stats.ctimeMs,
            isFile: stats.isFile(),
            isDirectory: stats.isDirectory(),
        };
    } catch (error) {
        // 如果文件不存在 (ENOENT)，则静默处理返回 null，其他错误则打印
        if (error.code !== 'ENOENT') {
            console.error(`Error getting stats for file ${filePath}:`, error);
        }
        return null;
    }
}

/**
 * 批量获取文件状态信息。
 * @async
 * @param {string[]} filePaths - 文件路径数组。
 * @returns {Promise<FileStatInfo[]>} 返回包含成功获取到的文件信息的对象数组 (失败的会被过滤掉)。
 */
export async function fromFs_getBatchFileStats(filePaths) {
    if (!Array.isArray(filePaths)) {
         console.error("Invalid input: filePaths must be an array.");
        return [];
    }
    // 并行获取文件状态
    const results = await Promise.allSettled(filePaths.map(fp => fromFs_getFileStats(fp)));

    // 过滤掉失败的或为 null 的结果，并提取成功的值
    return results
        .filter(result => result.status === 'fulfilled' && result.value !== null)
        .map(result => result.value);
} 