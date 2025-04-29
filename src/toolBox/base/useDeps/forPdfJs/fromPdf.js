/**
 * @fileoverview 使用 pdf.js 库处理 PDF 文件的工具函数。
 * 需要确保 pdfjs-dist 库已加载并可用 (通常通过全局变量 pdfjsLib 或 import)。
 * 部分函数依赖浏览器环境 (Canvas API)。
 */

// import * as pdfjsLib from 'pdfjs-dist/build/pdf';
// // 设置 workerSrc，指向 pdf.worker.js 文件
// pdfjsLib.GlobalWorkerOptions.workerSrc = '/path/to/pdf.worker.js'; // 需要根据实际路径配置

/**
 * 获取 PDF 文件的总页数。
 * @async
 * @param {string | Uint8Array | object} src - PDF 文件的来源，可以是 URL、Uint8Array 或包含 data 的对象。
 * @returns {Promise<number>} 返回一个 Promise，解析为 PDF 的总页数。
 * @throws {Error} 当 PDF 加载失败时抛出错误。
 * @example
 * const url = '/path/to/document.pdf';
 * const pageCount = await getPdfPageCount(url);
 * console.log(pageCount);
 */
export async function getPdfPageCount(src) {
    if (!pdfjsLib) {
        throw new Error('pdfjsLib is not defined. Ensure pdf.js library is loaded.');
    }
    try {
        const loadingTask = pdfjsLib.getDocument(src);
        const pdf = await loadingTask.promise;
        return pdf.numPages;
    } catch (error) {
        console.error('Error loading PDF for page count:', error);
        throw error; // Re-throw the error after logging
    }
}

/**
 * 将 PDF 文件的指定页面渲染为图片的 base64 数据 URL。
 * @async
 * @param {string | Uint8Array | object} src - PDF 文件的来源，可以是 URL、Uint8Array 或包含 data 的对象。
 * @param {number} pageNumber - 需要转换的 PDF 页码 (1-based)。
 * @param {number} [scale=1.5] - 渲染时的缩放比例。
 * @returns {Promise<string>} 返回一个 Promise，解析为图片的 base64 数据 URL。
 * @throws {Error} 当页码无效、PDF 加载失败或 Canvas 不可用时抛出错误。
 * @example
 * const url = '/path/to/document.pdf';
 * const imageDataUrl = await getPdfPageAsImage(url, 1);
 * document.getElementById('myImage').src = imageDataUrl;
 */
export async function getPdfPageAsImage(src, pageNumber, scale = 1.5) {
    if (!pdfjsLib) {
        throw new Error('pdfjsLib is not defined. Ensure pdf.js library is loaded.');
    }
    if (typeof document === 'undefined' || typeof document.createElement !== 'function') {
        throw new Error('Browser environment (document.createElement) is required.');
    }

    try {
        const loadingTask = pdfjsLib.getDocument(src);
        const pdf = await loadingTask.promise;

        if (pageNumber < 1 || pageNumber > pdf.numPages) {
            throw new Error(`Invalid page number: ${pageNumber}. PDF has ${pdf.numPages} pages.`);
        }

        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
             throw new Error('Failed to get 2D context from canvas.');
        }

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };

        await page.render(renderContext).promise;

        // 将 Canvas 转换为图片 data URL
        // 注意：如果 PDF 包含透明度，可能需要考虑 toDataURL('image/png')
        return canvas.toDataURL(); // Defaults to 'image/png'

    } catch (error) {
        console.error(`Error rendering PDF page ${pageNumber}:`, error);
        throw error; // Re-throw the error after logging
    }
} 