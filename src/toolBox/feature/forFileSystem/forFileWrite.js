/**
 * @fileoverview 文件写入工具
 * @module toolBox/feature/forFileSystem/forFileWrite
 * @description 提供文件写入相关的功能。
 */

/**
 * 异步覆盖保存文件内容
 * @param {string} newPath - 文件路径
 * @param {Buffer | string} processedBuffer - 要写入的内容
 * @returns {Promise<void>}
 */
export const 覆盖保存 = async (newPath, processedBuffer) => {
    // 注意: 此处使用了 window.require，可能特定于 Electron 渲染进程环境
    const fs = window.require('fs').promises;
    await fs.writeFile(newPath, processedBuffer);
};

// 提供中文别名 (如果需要，可以在这里添加)
// export { 覆盖保存 as coverSave }; 