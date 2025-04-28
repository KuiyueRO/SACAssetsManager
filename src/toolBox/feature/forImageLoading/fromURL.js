/**
 * @fileoverview 从 URL 加载图像。
 */

/**
 * 从指定的 URL 加载单个图像。
 * @param {string} url - 图像的 URL。
 * @returns {Promise<HTMLImageElement>} 一个 Promise，resolve 时返回加载成功的 HTMLImageElement。
 */
export function getImageFromURL(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve(img);
        };
        img.onerror = (error) => {
            // 提供更具体的错误信息
            reject(new Error(`加载图像失败: ${url} - ${error instanceof ErrorEvent ? error.message : '未知错误'}`));
        };
        // 设置 crossOrigin 允许加载跨域图片（如果服务器响应头允许）
        img.crossOrigin = 'anonymous';
        img.src = url;
    });
}

/**
 * 从一组 URL 批量加载图像。
 * @param {string[]} urls - 包含图像 URL 的数组。
 * @returns {Promise<HTMLImageElement[]>} 一个 Promise，resolve 时返回包含所有成功加载的 HTMLImageElement 的数组。
 *                                       如果任何一个图像加载失败，整个 Promise 将被 reject。
 */
export function batchGetImagesFromURLs(urls) {
    if (!Array.isArray(urls)) {
        return Promise.reject(new TypeError('输入必须是一个 URL 数组。'));
    }
    const promises = urls.map(url => getImageFromURL(url)); // 修正调用
    return Promise.all(promises);
} 