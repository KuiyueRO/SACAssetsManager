/**
 * @fileoverview 使用纯 CPU 实现自然饱和度增强。
 */

/**
 * 调整单个像素的自然饱和度（CPU 实现）。
 * @param {number} r 红色通道值 (0-255)。
 * @param {number} g 绿色通道值 (0-255)。
 * @param {number} b 蓝色通道值 (0-255)。
 * @param {number} intensity 饱和度强度 (例如 1.0 表示不变, 1.5 表示增强 50%)。
 * @param {boolean} protectSkin 是否启用肤色保护。
 * @param {boolean} smartAdjust 是否根据亮度智能调整强度。
 * @returns {[number, number, number]} 处理后的 [R, G, B] 值。
 */
function adjustPixelVibrance(r, g, b, intensity, protectSkin, smartAdjust) {
    // 归一化到 [0, 1]
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;

    // 计算亮度 (保持与原 adjust.js 一致的系数)
    const luminance = 0.299 * rNorm + 0.587 * gNorm + 0.114 * bNorm;

    // 肤色检测 (逻辑来自原 adjust.js 的 saturateKernel)
    // 注意：这个肤色检测逻辑可能比较粗糙，仅作迁移保留。
    const isSkin = protectSkin &&
                   (r > 95 && g > 40 && b > 20) &&
                   (Math.max(r, g, b) - Math.min(r, g, b) > 15) &&
                   (Math.abs(r - g) > 15) && (r > g) && (r > b);

    // 根据是否为肤色调整饱和度强度
    // 原代码中对肤色强度做了限制 Math.min(intensity * 0.5, 1.2)
    // 这里简化为减半，如果需要精确限制 1.2 需要额外处理
    const actualIntensity = isSkin ? 1 + (intensity - 1) * 0.5 : intensity;

    // 根据亮度智能调整强度 (逻辑来自原 adjust.js)
    const factor = smartAdjust
        ? 1 + (actualIntensity - 1) * (1 - Math.abs(luminance - 0.5) * 2)
        : actualIntensity;

    // 应用饱和度调整 (将像素颜色向亮度值移动或远离亮度值)
    // newColor = Luminance + (Color - Luminance) * factor
    let newR = luminance + (rNorm - luminance) * factor;
    let newG = luminance + (gNorm - luminance) * factor;
    let newB = luminance + (bNorm - luminance) * factor;

    // 转换回 [0, 255] 并限制范围
    newR = Math.max(0, Math.min(255, Math.round(newR * 255)));
    newG = Math.max(0, Math.min(255, Math.round(newG * 255)));
    newB = Math.max(0, Math.min(255, Math.round(newB * 255)));

    return [newR, newG, newB];
}

/**
 * 使用 CPU 对 ImageData 进行自然饱和度增强。
 * @param {ImageData} imageData - 输入的 ImageData 对象。
 * @param {object} options - 调整选项。
 * @param {number} [options.intensity=1.3] - 饱和度强度。
 * @param {boolean} [options.protectSkin=true] - 是否启用肤色保护。
 * @param {boolean} [options.smartAdjust=true] - 是否根据亮度智能调整强度。
 * @returns {ImageData} 返回一个新的包含处理后像素数据的 ImageData 对象。
 */
export function enhanceVibranceCPU(imageData, options = {}) {
    const { intensity = 1.3, protectSkin = true, smartAdjust = true } = options;
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    // 创建新的像素数据数组，避免修改原始数据
    const newData = new Uint8ClampedArray(data.length);

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3]; // Alpha 通道保持不变

        const [newR, newG, newB] = adjustPixelVibrance(r, g, b, intensity, protectSkin, smartAdjust);

        newData[i] = newR;
        newData[i + 1] = newG;
        newData[i + 2] = newB;
        newData[i + 3] = a; // 保持 Alpha 不变
    }

    // 返回包含新数据的 ImageData 对象
    // 注意：在 Worker 中可能无法直接创建 ImageData，需要调用者处理
    try {
        return new ImageData(newData, width, height);
    } catch (e) {
        // 如果在 Worker 等环境无法创建 ImageData，则返回原始数组和尺寸
        console.warn("无法创建 ImageData 对象，可能在 Worker 环境中。将返回处理后的像素数组和尺寸。");
        return { data: newData, width, height };
    }
} 