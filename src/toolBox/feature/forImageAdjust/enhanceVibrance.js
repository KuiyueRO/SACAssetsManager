/**
 * @fileoverview 图像自然饱和度增强 (Vibrance)
 * 提供统一接口，自动选择 WebGPU 或 CPU 实现。
 */

import { enhanceVibranceCPU } from './_enhanceVibranceCPU.js';
import { enhanceVibranceWebGPU } from './_enhanceVibranceWebGPU.js';

// 复用或共享来自 computeHistogram 的 getGPUDevice 函数？
// 为了模块独立性，暂时在这里重新定义，或者后续提取到公共模块。
let gpuDevice = null;
let isGPUCheckComplete = false;

async function getGPUDevice() {
    if (isGPUCheckComplete) {
        return gpuDevice;
    }
    try {
        if (navigator.gpu) {
            const adapter = await navigator.gpu.requestAdapter();
            if (adapter) {
                gpuDevice = await adapter.requestDevice();
                console.log('WebGPU device for vibrance initialized.');
            } else {
                console.warn('WebGPU adapter not found for vibrance.');
            }
        } else {
            console.warn('WebGPU not supported for vibrance.');
        }
    } catch (error) {
        console.error('Failed to initialize WebGPU device for vibrance:', error);
        gpuDevice = null;
    }
    isGPUCheckComplete = true;
    return gpuDevice;
}

/**
 * 增强图像的自然饱和度。
 * 自动选择最高效的可用方法 (WebGPU > CPU)。
 * 
 * @param {ImageBitmap | ImageData} imageSource - 输入图像数据源。
 * @param {object} [options={}] - 调整选项。
 * @param {number} [options.intensity=1.3] - 饱和度强度 (建议范围 1.0 - 2.0)。
 * @param {boolean} [options.protectSkin=true] - 是否启用肤色保护。
 * @param {boolean} [options.smartAdjust=true] - 是否根据亮度智能调整强度。
 * @param {boolean} [options.useGPU=true] - 是否优先尝试使用 GPU (如果可用)。
 * @returns {Promise<ImageData | {data: Uint8ClampedArray, width: number, height: number} | null>} 
 *          返回包含处理后像素数据的新 ImageData 对象。
 *          如果在 Worker 等无法创建 ImageData 的环境，返回 {data, width, height}。
 *          失败时返回 null。
 */
export async function enhanceVibrance(imageSource, options = {}) {
    const { useGPU = true, ...adjustOptions } = options;
    const startTime = performance.now();

    if (!(imageSource instanceof ImageBitmap) && !(imageSource instanceof ImageData)) {
        console.error('enhanceVibrance: 输入必须是 ImageBitmap 或 ImageData。');
        return null;
    }

    // 尝试使用 WebGPU
    if (useGPU) {
        const device = await getGPUDevice();
        if (device) {
            try {
                console.log(`使用 WebGPU 增强自然饱和度...`);
                const resultImageData = await enhanceVibranceWebGPU(imageSource, device, adjustOptions);
                const duration = performance.now() - startTime;
                console.log(`WebGPU 自然饱和度增强完成，耗时: ${duration.toFixed(2)} ms`);
                return resultImageData;
            } catch (error) {
                console.error('WebGPU 自然饱和度增强失败，将降级到 CPU:', error);
                // GPU 失败，自动降级到 CPU 
            }
        }
    }

    // 降级到 CPU 计算
    try {
        console.log(`使用 CPU 增强自然饱和度...`);
        // CPU 版本需要 ImageData 输入
        let imageDataInput;
        if (imageSource instanceof ImageBitmap) {
            const canvas = new OffscreenCanvas(imageSource.width, imageSource.height);
            const ctx = canvas.getContext('2d');
             if (!ctx) throw new Error('无法获取 OffscreenCanvas 2D context 用于 CPU 处理');
            ctx.drawImage(imageSource, 0, 0);
            imageDataInput = ctx.getImageData(0, 0, imageSource.width, imageSource.height);
        } else {
            imageDataInput = imageSource; // 已经是 ImageData
        }

        const result = enhanceVibranceCPU(imageDataInput, adjustOptions);
        const duration = performance.now() - startTime;
        console.log(`CPU 自然饱和度增强完成，耗时: ${duration.toFixed(2)} ms`);
        return result;
    } catch (error) {
        console.error('CPU 自然饱和度增强失败:', error);
        return null;
    }
} 