/**
 * @fileoverview 提供与 D5 Render 素材文件 (.d5a) 交互的函数，主要用于处理缩略图。
 * 依赖 Node.js 环境 (fs, path) 和封装的 ZIP 工具。
 */

// 从 base/platform 导入 ZIP 和 FS 工具
import { addFileToZip, saveBufferToFile, extractFileFromZip, hasEntryInZip } from '../../base/platform/node/forZipUtils.js';
// 不再需要直接导入 useJsZipDep 或 require('jszip')

// 延迟加载 Node.js 模块 (仅保留 fs 和 path, 因为 forZipUtils 内部处理了 JSZip)
let fs, path;
function ensureNodeModules() {
    if (!fs || !path) {
        if (typeof require === 'function') {
            fs = require('fs').promises; // 使用 promises
            path = require('path');
        } else {
            throw new Error('Node.js modules (fs, path) are not available.');
        }
    }
}

// --- D5A 特定函数 ---

/**
 * 将指定的缩略图文件写入 D5A 文件 (ZIP 格式) 中，替换或添加为 'icon.jpg'。
 * @async
 * @param {string} d5aFilePath - D5A 文件的路径。
 * @param {string} thumbnailPath - 缩略图文件的路径。
 * @param {object} [callbacks={}] - 包含 onSuccess 和 onError 回调的对象。
 * @param {function(string): Promise<void>} [callbacks.onSuccess] - 成功时的回调。
 * @param {function(string): Promise<void>} [callbacks.onError] - 失败时的回调。
 * @returns {Promise<boolean>} 写入成功返回 true，失败返回 false。
 */
export const useD5a_replaceThumbnail = async (d5aFilePath, thumbnailPath, callbacks = {}) => {
    ensureNodeModules();
    let d5aExists = false, thumbExists = false;
    try {
        await fs.access(d5aFilePath);
        d5aExists = true;
        await fs.access(thumbnailPath);
        thumbExists = true;
    } catch (err) { /* 文件不存在 */ }

    if (d5aFilePath?.endsWith('.d5a') && d5aExists && thumbExists) {
        try {
            // 使用导入的 addFileToZip
            await addFileToZip(d5aFilePath, thumbnailPath, 'icon.jpg');
            const successMsg = `Successfully wrote thumbnail ${thumbnailPath} to ${d5aFilePath}`;
            if (callbacks.onSuccess) {
                try { await callbacks.onSuccess(successMsg); } catch (e) { console.error("onSuccess callback error:", e); }
            }
            return true;
        } catch (error) {
            const errorMsg = `Failed to write thumbnail to ${d5aFilePath}: ${error}`;
            console.error(errorMsg);
            if (callbacks.onError) {
                 try { await callbacks.onError(errorMsg); } catch (e) { console.error("onError callback error:", e); }
            }
            return false;
        }
    } else {
        const reason = !d5aFilePath?.endsWith('.d5a') ? "Not a .d5a file" :
                       !d5aExists ? "D5A file not found" :
                       !thumbExists ? "Thumbnail file not found" : "Unknown reason";
        const errorMsg = `Skipping thumbnail write for ${d5aFilePath}: ${reason}.`;
        console.warn(errorMsg);
         if (callbacks.onError) {
             try { await callbacks.onError(errorMsg); } catch (e) { console.error("onError callback error:", e); }
         }
        return false;
    }
};

/**
 * 根据 D5A 文件路径，计算其约定的缓存缩略图路径 (.cache/icon.jpg)。
 * @param {string} d5aAssetPath - D5A 文件的路径。
 * @returns {string | null} 返回计算出的缩略图路径，如果输入无效则返回 null。
 */
export const computeD5a_getCacheThumbnailPath = (d5aAssetPath) => {
    ensureNodeModules(); // 仍然需要 path
    if (typeof d5aAssetPath !== 'string' || !d5aAssetPath.endsWith('.d5a')) {
        return null;
    }
    try {
        const dirname = path.dirname(d5aAssetPath);
        const cacheDir = path.join(dirname, '.cache');
        return path.join(cacheDir, 'icon.jpg').replace(/\\/g, '/');
    } catch (error) {
        console.error("Error computing cache thumbnail path:", error);
        return null;
    }
};

/**
 * 从 D5A 文件数据 (Buffer) 中异步提取缩略图 ('icon.jpg')。
 * 这个函数现在不直接处理 ZIP，而是调用 extractFileFromZip (理论上应该先将文件Buffer存为临时ZIP再提取，或者直接操作Buffer，但目前 extractFileFromZip 需要路径)
 * **注意: 当前实现无法直接处理 Buffer，需要调整或使用其他方法。**
 * 暂时保留，但标记为需要重构或移除。
 * @async
 * @deprecated 无法直接从 Buffer 提取，需要重构。
 * @param {Buffer} d5aData - D5A 文件的 Buffer 数据。
 * @returns {Promise<Buffer|null>} 返回缩略图的 Buffer 数据，如果未找到或失败则返回 null。
 */
export const fromD5aData_extractThumbnail = async (d5aData) => {
    console.error("fromD5aData_extractThumbnail is deprecated and cannot directly extract from Buffer with current tools. Please use fromD5aFile_extractThumbnail instead or refactor ZIP tools to support buffer operations.");
    return null;
    /* // 原有逻辑，依赖直接的 JSZip
    ensureNodeModules();
    if (!(d5aData instanceof Buffer)) {
        console.error("Invalid data provided. Expected Buffer.");
        return null;
    }
    try {
        const zip = await JSZip.loadAsync(d5aData); // 依赖 JSZip
        const iconFile = zip.file('icon.jpg');
        if (!iconFile) {
            console.warn("'icon.jpg' not found in D5A data.");
            return null;
        }
        return await iconFile.async('nodebuffer');
    } catch (error) {
        console.error('Failed to extract thumbnail from D5A data:', error);
        return null;
    }
    */
};

/**
 * 从 D5A 文件路径异步读取文件并提取缩略图 ('icon.jpg')。
 * 可以选择将缩略图保存到指定路径或直接返回 Buffer。
 * @async
 * @param {string} d5aFilePath - D5A 文件的路径。
 * @param {string} [outputPath=null] - 可选的输出文件路径。如果提供，缩略图会保存到此路径。
 * @returns {Promise<string|null>} 如果提供了 outputPath 并成功保存，返回 outputPath；如果失败或未找到，返回 null。
 *                        (不再返回 Buffer，因为 fromD5aData_extractThumbnail 已弃用)
 */
export const fromD5aFile_extractThumbnail = async (d5aFilePath, outputPath = null) => {
    ensureNodeModules(); // 需要 fs 访问权限检查
    if (!outputPath) {
        console.error("outputPath must be provided for fromD5aFile_extractThumbnail.");
        return null; // 必须提供输出路径
    }

    try {
        // 检查 D5A 文件是否存在且可读
        await fs.access(d5aFilePath, fs.constants.R_OK);

        // 检查 icon.jpg 是否在 ZIP 中
        const iconExists = await hasEntryInZip(d5aFilePath, 'icon.jpg');
        if (!iconExists) {
             console.warn(`Thumbnail ('icon.jpg') not found in D5A file: ${d5aFilePath}`);
             return null;
        }

        // 使用 extractFileFromZip 提取
        await extractFileFromZip(d5aFilePath, 'icon.jpg', outputPath);
        return outputPath; // 返回保存路径

    } catch (error) {
        // hasEntryInZip 或 extractFileFromZip 中的错误已记录
        console.error(`Failed to extract or save thumbnail from D5A file: ${d5aFilePath} to ${outputPath}:`, error);
        return null;
    }
};

// --- 流程函数保持不变，因为它们依赖上面修改过的函数 ---

/**
 * @typedef {object} ProcessD5aThumbnailOptions
 * @property {object} asset - 资源对象。
 * @property {string} asset.path - D5A 文件的路径。
 * @property {boolean} [skipConfirmation=false] - 是否跳过确认步骤。
 * @property {object} [callbacks={}] - 包含 onSuccess 和 onError 回调的对象。
 */

/**
 * @typedef {object} ProcessD5aThumbnailResult
 * @property {boolean} success - 操作是否最终成功。
 * @property {boolean} processed - 是否执行了写入操作 (即使失败也算 processsed)。
 * @property {boolean} [needsConfirmation] - 是否需要用户确认 (仅当 skipConfirmation=false 且找到缩略图时)。
 * @property {string} [d5aPath] - D5A 文件路径 (仅当 needsConfirmation=true)。
 * @property {string} [thumbnailPath] - 找到的缓存缩略图路径 (仅当 needsConfirmation=true)。
 */

/**
 * 处理单个 D5A 文件的缩略图写入流程。
 * 1. 检查文件和缓存缩略图是否存在。
 * 2. 如果需要确认，返回确认信息。
 * 3. 如果跳过确认或已确认，执行写入。
 * @async
 * @param {ProcessD5aThumbnailOptions} options - 处理选项。
 * @returns {Promise<ProcessD5aThumbnailResult>}
 */
export const useD5a_processSingleThumbnail = async (options = {}) => {
    ensureNodeModules(); // 需要 fs 和 path
    const { asset, skipConfirmation = false, callbacks = {} } = options;

    if (!asset || typeof asset.path !== 'string' || !asset.path.endsWith('.d5a')) {
        return { success: false, processed: false };
    }

    const d5aPath = asset.path;
    let d5aExists = false;
    try {
         await fs.access(d5aPath);
         d5aExists = true;
    } catch (error) {
        console.warn(`D5A file not found: ${d5aPath}`);
        return { success: false, processed: false };
    }

    const iconPath = computeD5a_getCacheThumbnailPath(d5aPath);
    if (!iconPath) {
         console.warn(`Could not determine cache thumbnail path for ${d5aPath}`);
         return { success: false, processed: false };
    }

    let thumbExists = false;
    try {
        await fs.access(iconPath);
        thumbExists = true;
    } catch (error) { /* 缓存缩略图不存在 */ }

    if (thumbExists) {
        if (!skipConfirmation) {
            // 需要确认
            return {
                success: false,
                processed: false,
                needsConfirmation: true,
                d5aPath: d5aPath,
                thumbnailPath: iconPath
            };
        } else {
            // 跳过确认，直接写入
            const writeSuccess = await useD5a_replaceThumbnail(d5aPath, iconPath, callbacks);
            return { success: writeSuccess, processed: true };
        }
    } else {
        // 缓存缩略图不存在，无需处理
        console.log(`Cache thumbnail not found for ${d5aPath}, skipping write.`);
        return { success: true, processed: false }; // 认为成功，因为无需操作
    }
};

/**
 * @typedef {object} ProcessD5aBatchThumbnailOptions
 * @property {Array<object>} assets - 资源对象数组。
 * @property {boolean} [skipConfirmation=false] - 是否跳过所有确认。
 * @property {object} [callbacks={}] - 包含 onProgress, onSuccess, onError 的回调。
 * @property {function(number, number, string): void} [callbacks.onProgress] - 进度回调 (当前索引, 总数, 当前文件路径)。
 * @property {function(Array<ProcessD5aThumbnailResult>): void} [callbacks.onSuccess] - 全部处理完成后的回调。
 * @property {function(Error): void} [callbacks.onError] - 发生意外错误时的回调。
 */

/**
 * 批量处理 D5A 文件的缩略图写入。
 * @async
 * @param {ProcessD5aBatchThumbnailOptions} options - 批量处理选项。
 * @returns {Promise<Array<ProcessD5aThumbnailResult>>} 返回每个文件的处理结果数组。
 */
export const useD5a_processBatchThumbnails = async (options = {}) => {
    ensureNodeModules();
    const { assets, skipConfirmation = false, callbacks = {} } = options;
    const results = [];
    const total = assets?.length ?? 0;

    if (!Array.isArray(assets)) {
        console.error("Invalid input: assets must be an array.");
        if (callbacks.onError) callbacks.onError(new Error("Invalid input: assets must be an array."));
        return results;
    }

    for (let i = 0; i < total; i++) {
        const asset = assets[i];
        if (callbacks.onProgress) {
            try { callbacks.onProgress(i + 1, total, asset?.path ?? 'unknown'); } catch (e) { console.error("onProgress callback error:", e); }
        }
        try {
            const result = await useD5a_processSingleThumbnail({
                asset,
                skipConfirmation,
                callbacks // 单个文件的成功/失败回调也传递下去
            });
            results.push(result);
        } catch (error) {
            console.error(`Error processing asset ${asset?.path}:`, error);
            results.push({ success: false, processed: false }); // 记录处理失败
             if (callbacks.onError) {
                 // 只报告错误，不中断批量处理？还是应该中断？目前不中断
                 try { callbacks.onError(error); } catch (e) { console.error("onError callback error:", e); }
             }
        }
    }

    if (callbacks.onSuccess) {
        try { callbacks.onSuccess(results); } catch (e) { console.error("onSuccess callback error:", e); }
    }
    return results;
}; 