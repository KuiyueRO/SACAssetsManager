/**
 * @fileoverview 提供路径检查相关的工具函数。
 */

/**
 * 判断给定的路径是否是思源笔记的资产路径（以 'assets/' 开头）。
 * 
 * @param {string} path 要检查的路径字符串。
 * @returns {boolean} 如果路径是思源资产路径则返回 true，否则返回 false。
 */
export const isSiyuanAssetPath = (path) => {
  // 确保 path 是有效的字符串再进行判断
  return typeof path === 'string' && path.startsWith('assets/');
};

/**
 * A list of common image file extensions (lowercase, including dot).
 * @type {Set<string>}
 */
const COMMON_IMAGE_EXTENSIONS = new Set([
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tif', '.tiff', '.svg', '.avif'
]);

/**
 * Checks if a given file path likely points to an image file based on its extension.
 * This is a basic check and doesn't guarantee the file is a valid image.
 *
 * @param {string} filePath - The file path string.
 * @returns {boolean} True if the extension matches a common image format, false otherwise.
 */
export const isImagePathByExtension = (filePath) => {
    if (typeof filePath !== 'string' || !filePath) {
        return false;
    }
    // Extract extension using string manipulation (works in browser and Node)
    const lastDotIndex = filePath.lastIndexOf('.');
    if (lastDotIndex === -1 || lastDotIndex === filePath.length - 1) {
        return false; // No extension or ends with a dot
    }
    const extension = filePath.substring(lastDotIndex).toLowerCase();
    return COMMON_IMAGE_EXTENSIONS.has(extension);
}; 