/**
 * @fileoverview 文件路径扩展名处理工具
 * @module toolBox/feature/forFileSystem/forPathExtension
 * @description 提供获取和处理文件扩展名的功能。
 */

/**
 * 从文件路径中获取小写的文件扩展名
 * @param {string} filePath - 文件路径 (兼容正反斜杠)
 * @returns {string} 小写的文件扩展名，如果没有扩展名则返回空字符串
 */
export function getFileExtension(filePath) {
    if (typeof filePath !== 'string' || !filePath) {
        return '';
    }
    // 获取文件名（去除路径）
    const fileName = filePath.split('/').pop().split('\\').pop();
    // 查找最后一个点号的位置
    const lastDotIndex = fileName.lastIndexOf('.');
    // 如果存在点号且不在开头，返回小写的扩展名，否则返回空字符串
    return (lastDotIndex > 0) ? fileName.slice(lastDotIndex + 1).toLowerCase() : '';
}

/**
 * 从路径对象数组中提取所有唯一的文件扩展名
 * @param {Array<{path: string, type?: string}>} pathObjects - 包含路径和可选类型的对象数组
 * @returns {string[]} 包含所有唯一扩展名（小写）和 'note' (如果存在) 的数组
 */
export const extractFileExtensions = (pathObjects) => {
    const uniqueExtensions = new Set();
    if (!Array.isArray(pathObjects)) {
        return []; // 处理无效输入
    }
    pathObjects.forEach(arg => {
        if (arg && typeof arg.path === 'string') {
            if (arg.type === 'note') {
                uniqueExtensions.add('note');
            } else {
                const fileExtension = getFileExtension(arg.path);
                if (fileExtension) {
                    uniqueExtensions.add(fileExtension);
                }
            }
        }
    });
    return Array.from(uniqueExtensions);
};

// 提供中文别名
export { getFileExtension as 获取文件扩展名 };
export { extractFileExtensions as 提取文件扩展名集合 }; 