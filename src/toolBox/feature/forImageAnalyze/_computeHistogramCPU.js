/**
 * @fileoverview 使用纯 CPU 计算图像直方图
 */

/**
 * 从像素缓冲区计算图像直方图（纯 CPU 实现）。
 * @param {Uint8Array|Uint8ClampedArray} buffer - RGBA 像素数据。
 * @returns {{r: number[], g: number[], b: number[], a: number[], brightness: number[]}} 直方图数据。
 */
export function computeHistogramCPU(buffer) {
    // 确保输入数据有效
    if (!buffer || !buffer.length) {
        throw new Error('无效的图像数据');
    }

    // 检查数据长度是否为4的倍数（RGBA）
    if (buffer.length % 4 !== 0) {
        throw new Error('图像数据长度必须是4的倍数');
    }

    // 初始化直方图数组
    const histogram = {
        r: new Array(256).fill(0),
        g: new Array(256).fill(0),
        b: new Array(256).fill(0),
        a: new Array(256).fill(0), // 也计算 alpha 通道直方图
        brightness: new Array(256).fill(0)
    };

    // 遍历像素数据
    for (let i = 0; i < buffer.length; i += 4) {
        const r = buffer[i];
        const g = buffer[i + 1];
        const b = buffer[i + 2];
        const a = buffer[i + 3];

        // 计算亮度 (ITU-R BT.709 标准)
        // const brightness = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
        // 保持原代码使用的亮度计算方式 (ITU-R BT.601 标准)
        const brightness = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

        // 累加直方图
        // 不再需要范围检查，因为 Uint8Array/Uint8ClampedArray 的值总是在 0-255
        histogram.r[r]++;
        histogram.g[g]++;
        histogram.b[b]++;
        histogram.a[a]++;
        histogram.brightness[brightness]++;
    }

    return histogram;
} 