/**
 * @fileoverview 从 Buffer 或 Blob 创建 ImageBitmap。
 */

/**
 * 从包含图像数据的 Buffer 或 Blob 创建一个 ImageBitmap 对象。
 * ImageBitmap 可用于在 Canvas 或 Web Worker 中高效绘制图像。
 *
 * @param {ArrayBuffer | Blob} source - 包含图像数据的 ArrayBuffer 或 Blob。
 * @param {object} [options={}] - 创建选项。
 * @param {string} [options.mimeType='image/png'] - 图像数据的 MIME 类型。如果输入是 Blob 且已有类型，将优先使用 Blob 的类型。
 * @returns {Promise<ImageBitmap>} 一个 Promise，resolve 时返回创建的 ImageBitmap 对象。
 * @throws {Error} 如果输入类型不受支持或创建失败，则抛出错误。
 */
export async function createImageBitmapFromSource(source, options = {}) {
    let { mimeType = 'image/png' } = options;
    let blobSource;

    // 1. 确定 Blob 源
    if (source instanceof Blob) {
        // 如果输入已经是 Blob，直接使用
        blobSource = source;
        // 如果 Blob 有类型且用户未指定 mimeType 或指定了默认值，优先使用 Blob 的类型
        if (blobSource.type && (!options.mimeType || options.mimeType === 'image/png')) {
            mimeType = blobSource.type;
            console.warn(`输入是带有类型 '${mimeType}' 的 Blob，将忽略 options.mimeType 并使用此类型。`);
        }
        // 如果用户明确指定了与 Blob 类型不同的 mimeType，则以用户的为准（虽然可能不匹配）
        // 这里可以加一个警告
        if(options.mimeType && options.mimeType !== 'image/png' && blobSource.type && blobSource.type !== options.mimeType) {
             console.warn(`输入 Blob 类型为 '${blobSource.type}'，但 options.mimeType 指定为 '${options.mimeType}'，将以指定类型创建 ImageBitmap，可能导致错误。`);
             mimeType = options.mimeType; // 确认使用用户指定的
        }
    } else if (source instanceof ArrayBuffer || source instanceof Uint8Array) {
        // 如果输入是 Buffer 或 TypedArray，创建 Blob
        if (!mimeType || typeof mimeType !== 'string') {
            throw new Error('从 ArrayBuffer 创建时必须提供有效的 mimeType 选项。');
        }
        blobSource = new Blob([source], { type: mimeType });
    } else {
        throw new Error('不支持的输入源类型，期望 ArrayBuffer、Uint8Array 或 Blob。');
    }

    // 2. 验证 MIME 类型 (简单检查)
    if (!mimeType.startsWith('image/')) {
         console.warn(`提供的 MIME 类型 '${mimeType}' 可能不是有效的图像类型。`);
    }

    // 3. 使用 createImageBitmap 创建 ImageBitmap
    try {
        // createImageBitmap API 通常比创建 Image 对象再绘制到 Canvas 更高效
        const bitmap = await createImageBitmap(blobSource);
        return bitmap;
    } catch (error) {
        console.error(`创建 ImageBitmap 失败 (类型: ${mimeType}):`, error);
        throw new Error(`创建 ImageBitmap 失败: ${error instanceof Error ? error.message : String(error)}`);
    }
} 