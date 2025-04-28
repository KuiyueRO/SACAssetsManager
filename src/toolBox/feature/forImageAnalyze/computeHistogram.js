/**
 * @fileoverview 计算图像像素直方图 (R, G, B, Alpha, Brightness)
 * 提供统一接口，自动选择 WebGPU 或 CPU 实现。
 */

import { computeHistogramCPU } from './_computeHistogramCPU.js';
import { computeHistogramWebGPU } from './_computeHistogramWebGPU.js';

// 全局缓存 WebGPU 设备实例，避免重复请求
let gpuDevice = null;
let isGPUCheckComplete = false;

/**
 * 尝试初始化 WebGPU 设备。
 * @returns {Promise<GPUDevice | null>} 返回 GPUDevice 实例或 null。
 */
async function getGPUDevice() {
    if (isGPUCheckComplete) {
        return gpuDevice;
    }
    try {
        if (navigator.gpu) {
            const adapter = await navigator.gpu.requestAdapter();
            if (adapter) {
                // 检查是否支持所需特性 (例如 storage textures, atomics)
                // 这里暂时省略特性检查，实际应用中可能需要添加
                gpuDevice = await adapter.requestDevice();
                console.log('WebGPU device initialized.');
            } else {
                console.warn('WebGPU adapter not found.');
            }
        } else {
            console.warn('WebGPU not supported in this browser/environment.');
        }
    } catch (error) {
        console.error('Failed to initialize WebGPU device:', error);
        gpuDevice = null; // 确保出错时 device 为 null
    }
    isGPUCheckComplete = true;
    return gpuDevice;
}

/**
 * 从 ImageBitmap 或 ImageData 中提取像素数据。
 * @param {ImageBitmap | ImageData} imageSource 
 * @returns {{width: number, height: number, data: Uint8ClampedArray | null}}
 */
function extractPixelData(imageSource) {
    try {
        if (imageSource instanceof ImageBitmap) {
            const canvas = new OffscreenCanvas(imageSource.width, imageSource.height);
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                 console.error('无法获取 OffscreenCanvas 2D context');
                 return { width: imageSource.width, height: imageSource.height, data: null };
            }
            ctx.drawImage(imageSource, 0, 0);
            return ctx.getImageData(0, 0, imageSource.width, imageSource.height);
        } else if (imageSource instanceof ImageData) {
            return { width: imageSource.width, height: imageSource.height, data: imageSource.data };
        }
        // 支持直接传入 Buffer 或 TypedArray
        else if (imageSource instanceof Uint8Array || imageSource instanceof Uint8ClampedArray) {
            // 需要知道宽高才能处理 Buffer/TypedArray，这里假设调用者会传入 ImageData 或 ImageBitmap
            console.warn('Direct Buffer/TypedArray input is not fully supported without width/height. Please provide ImageData or ImageBitmap.');
            // 尝试从 buffer 猜测宽高可能非常不可靠，暂时不支持
             return { width: 0, height: 0, data: imageSource }; // 返回原始数据，但宽高未知
        } else {
            console.error('不支持的图像源类型，期望 ImageBitmap, ImageData, Uint8Array, 或 Uint8ClampedArray');
            return { width: 0, height: 0, data: null };
        }
    } catch (error) {
        console.error("提取像素数据时出错:", error);
        return { width: 0, height: 0, data: null };
    }
}

/**
 * 计算图像的像素直方图。
 * 自动选择最高效的可用方法 (WebGPU > CPU)。
 * 
 * @param {ImageBitmap | ImageData | Uint8Array | Uint8ClampedArray} imageSource - 输入图像数据源。
 * @param {object} [options={}] - 计算选项。
 * @param {boolean} [options.useGPU=true] - 是否优先尝试使用 GPU (如果可用)。
 * @returns {Promise<{r: number[], g: number[], b: number[], a: number[], brightness: number[]} | null>} 返回包含各通道直方图的对象，或在失败时返回 null。
 */
export async function computeHistogram(imageSource, options = {}) {
    const { useGPU = true } = options;
    const startTime = performance.now();

    const { width, height, data: pixelData } = extractPixelData(imageSource);

    if (!pixelData || pixelData.length === 0 || width === 0 || height === 0) {
        console.error('无法从输入源获取有效的像素数据或尺寸。');
        return null;
    }

    // 尝试使用 WebGPU
    if (useGPU) {
        const device = await getGPUDevice();
        if (device) {
            try {
                console.log(`使用 WebGPU 计算直方图 (${width}x${height})...`);
                // WebGPU 实现需要 ImageData 或 ImageBitmap 来确定尺寸并创建纹理
                 if (!(imageSource instanceof ImageData) && !(imageSource instanceof ImageBitmap)) {
                     console.warn('WebGPU 实现需要 ImageData 或 ImageBitmap 输入以确定尺寸，尝试从提取的数据创建 ImageData。');
                     // 如果原始输入是 Buffer/TypedArray，我们没有宽高，无法调用 WebGPU
                     // 这里需要 imageSource 本身就是 ImageData 或 ImageBitmap
                     if (imageSource instanceof ImageData || imageSource instanceof ImageBitmap) {
                         const histogram = await computeHistogramWebGPU(imageSource, device);
                         const duration = performance.now() - startTime;
                         console.log(`WebGPU 直方图计算完成，耗时: ${duration.toFixed(2)} ms`);
                         return histogram;
                     } else {
                          console.error('WebGPU 计算失败：无法从 Buffer/TypedArray 获取尺寸。');
                     }
                 } else {
                      const histogram = await computeHistogramWebGPU(imageSource, device);
                      const duration = performance.now() - startTime;
                      console.log(`WebGPU 直方图计算完成，耗时: ${duration.toFixed(2)} ms`);
                      return histogram;
                 }

            } catch (error) {
                console.error('WebGPU 直方图计算失败，将降级到 CPU:', error);
                // GPU 失败，自动降级到 CPU (如果 pixelData 有效)
            }
        }
    }

    // 降级到 CPU 计算
    try {
        console.log(`使用 CPU 计算直方图 (${width}x${height})...`);
        const histogram = computeHistogramCPU(pixelData);
        const duration = performance.now() - startTime;
        console.log(`CPU 直方图计算完成，耗时: ${duration.toFixed(2)} ms`);
        return histogram;
    } catch (error) {
        console.error('CPU 直方图计算失败:', error);
        return null;
    }
} 