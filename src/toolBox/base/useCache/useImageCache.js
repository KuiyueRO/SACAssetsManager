/**
 * @file 图像内存缓存工具
 * 提供简单的内存缓存机制来存储和检索已加载的图像。
 */

import { getImageFromURL } from "../../feature/forImageLoading/fromURL.js"; // <--- 更新相对导入路径

const imageCache = new Map();

/**
 * 预加载或从缓存中获取图像。
 * @param {string} src - 图像的 URL。
 * @returns {Promise<HTMLImageElement>} 一个 Promise，resolve 时返回加载或缓存的 HTMLImageElement。
 */
export function preloadImage(src) {
    if (imageCache.has(src)) {
        return Promise.resolve(imageCache.get(src));
    }
    return getImageFromURL(src).then(img => {
        imageCache.set(src, img);
        return img;
    });
}

/**
 * 检查指定的图像 URL 是否已存在于缓存中。
 * @param {string} src - 图像的 URL。
 * @returns {boolean} 如果图像已缓存则返回 true，否则返回 false。
 */
export function isImageCached(src) {
    return imageCache.has(src);
}

/**
 * 从缓存中清除图像。
 * @param {string} [src] - 可选。要清除的特定图像的 URL。如果省略，则清除所有缓存的图像。
 */
export function clearImageCache(src) {
    if (src) {
        imageCache.delete(src);
    } else {
        imageCache.clear();
    }
} 