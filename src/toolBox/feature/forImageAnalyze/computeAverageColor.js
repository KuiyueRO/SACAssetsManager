/**
 * @fileoverview 计算图像平均颜色 (RGBA)
 * 提供统一接口，自动选择 WebGPU 或 CPU 实现。
 */

import { computeAverageColorCPU } from './_computeAverageColorCPU.js';
import { computeAverageColorWebGPU } from './_computeAverageColorWebGPU.js';

// WebGPU 设备缓存 (与 computeHistogram 共享或独立)
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
                console.log('WebGPU device for average color initialized.');
            } else {
                console.warn('WebGPU adapter not found for average color.');
            }
        } else {
            console.warn('WebGPU not supported for average color.');
        }
    } catch (error) {
        console.error('Failed to initialize WebGPU device for average color:', error);
        gpuDevice = null;
    }
    isGPUCheckComplete = true;
    return gpuDevice;
}

/**
 * 计算图像的平均颜色 (RGBA)。
 * 自动选择最高效的可用方法 (WebGPU > CPU)。
 * 
 * @param {ImageBitmap | ImageData} imageSource - 输入图像数据源。
 * @param {object} [options={}] - 计算选项。
 * @param {number} [options.alphaThreshold=0.1] - Alpha 阈值 (0-1)，低于此值的像素将被忽略。
 * @param {boolean} [options.useGPU=true] - 是否优先尝试使用 GPU (如果可用)。
 * @returns {Promise<{r: number, g: number, b: number, a: number} | null>} 
 *          返回平均颜色对象 (RGBA, 0-255)，或在失败时返回 null。
 */
export async function computeAverageColor(imageSource, options = {}) {
    const { useGPU = true, alphaThreshold = 0.1 } = options;
    const startTime = performance.now();

    if (!(imageSource instanceof ImageBitmap) && !(imageSource instanceof ImageData)) {
        console.error('computeAverageColor: 输入必须是 ImageBitmap 或 ImageData。');
        return null;
    }

    // 尝试使用 WebGPU
    if (useGPU) {
        const device = await getGPUDevice();
        if (device) {
            try {
                console.log('使用 WebGPU 计算平均颜色...');
                const averageColor = await computeAverageColorWebGPU(imageSource, device, { alphaThreshold });
                const duration = performance.now() - startTime;
                console.log(`WebGPU 平均颜色计算完成，耗时: ${duration.toFixed(2)} ms`);
                return averageColor;
            } catch (error) {
                console.error('WebGPU 计算平均颜色失败，将降级到 CPU:', error);
                // GPU 失败，自动降级到 CPU 
            }
        }
    }

    // 降级到 CPU 计算
    try {
        console.log('使用 CPU 计算平均颜色...');
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

        const averageColor = computeAverageColorCPU(imageDataInput, { alphaThreshold });
        const duration = performance.now() - startTime;
        console.log(`CPU 平均颜色计算完成，耗时: ${duration.toFixed(2)} ms`);
        return averageColor;
    } catch (error) {
        console.error('CPU 计算平均颜色失败:', error);
        return null;
    }
} 