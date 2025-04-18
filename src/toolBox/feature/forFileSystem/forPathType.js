/**
 * @fileoverview 文件路径类型判断工具
 * @module toolBox/feature/forFileSystem/forPathType
 * @description 提供判断文件路径类型的功能。
 */

// 定义支持的图片文件后缀名列表
const imageExtensions = [
    'png',
    'jpg',
    'jpeg',
    'gif',
    'bmp',
    'tiff',
    'ico',
    'webp'
];

/**
 * 判断路径是否指向一个图片文件（基于后缀名）
 * @param {string} path - 文件路径
 * @returns {boolean} 如果是图片路径则返回 true
 */
export function isImagePath(path) {
    if (typeof path !== 'string' || !path) {
        return false;
    }
    const extension = path.split('.').pop()?.toLowerCase(); // Consider case insensitivity
    return extension ? imageExtensions.includes(extension) : false;
}

// 提供中文别名
export { isImagePath as is路径为图片 }; 