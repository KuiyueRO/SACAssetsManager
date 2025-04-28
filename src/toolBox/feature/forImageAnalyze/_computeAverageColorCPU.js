/**
 * @fileoverview 使用纯 CPU 计算图像的平均颜色。
 */

/**
 * 计算图像数据（忽略透明像素）的平均 RGBA 颜色。
 * @param {ImageData} imageData - 输入的 ImageData 对象。
 * @param {object} [options={}] - 计算选项。
 * @param {number} [options.alphaThreshold=0.1] - Alpha 阈值，低于此值的像素将被忽略。
 *                                               注意：CPU 实现中 alphaThreshold 作用于 0-255 范围。
 *                                               为了与 GPU [0,1] 范围行为近似，传入的 [0,1] 阈值会被乘以 255。
 * @returns {{r: number, g: number, b: number, a: number} | null} 平均颜色对象 (RGBA, 0-255)，如果无有效像素则返回 null。
 */
export function computeAverageColorCPU(imageData, options = {}) {
    const { alphaThreshold = 0.1 } = options;
    const threshold = Math.round(alphaThreshold * 255); // 将 [0,1] 阈值转换为 [0,255]

    if (!imageData || !(imageData.data instanceof Uint8ClampedArray)) {
        console.error('computeAverageColorCPU: 无效的 ImageData 输入。');
        return null;
    }

    const data = imageData.data;
    let sumR = 0, sumG = 0, sumB = 0, sumA = 0;
    let validPixelCount = 0;

    for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3];
        if (a >= threshold) { // 使用转换后的阈值比较
            sumR += data[i];
            sumG += data[i + 1];
            sumB += data[i + 2];
            sumA += a; // 累加 alpha 值用于计算平均 alpha
            validPixelCount++;
        }
    }

    if (validPixelCount === 0) {
        console.warn('computeAverageColorCPU: 图像中没有找到高于 alpha 阈值的有效像素。');
        return { r: 0, g: 0, b: 0, a: 0 }; // 或者返回 null，根据需要决定
    }

    return {
        r: Math.round(sumR / validPixelCount),
        g: Math.round(sumG / validPixelCount),
        b: Math.round(sumB / validPixelCount),
        a: Math.round(sumA / validPixelCount), // 返回平均 alpha 值 (0-255)
    };
} 