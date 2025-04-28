/**
 * @fileoverview 使用 WebGPU 实现 LUT (颜色查找表) 效果的核心处理器。
 * @module lutProcessor
 */
import { initializeWebGPU } from './webgpuSetup.js';
import { createTextures, destroyResources } from './resources.js';
import { createComputePipeline, createBindGroup } from './pipeline.js';
export {uploadData,readResult} from './forDataTransfer.js'

/**
 * 使用 LUT 处理图像
 * @param {Object} image - 输入图像对象
 * @param {Uint8Array} image.data - 图像像素数据
 * @param {number} image.width - 图像宽度
 * @param {number} image.height - 图像高度
 * @param {Uint8Array} lutData - LUT 数据
 * @param {number} [intensity=1.0] - LUT 效果强度 (0.0 到 1.0)
 * @returns {Promise<{success: boolean, result?: Uint8Array, error?: string}>} 处理结果
 */
export async function processImageWithLUT(image, lutData, intensity = 1.0) {
    let resources = null;
    try {
        if (!image || !lutData) {
            throw new Error('输入图像或 LUT 数据无效');
        }
        const { device } = await initializeWebGPU();
        const textures = createTextures(device, image);
        resources = textures;
        const uniformBuffer = device.createBuffer({
            size: 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        device.queue.writeBuffer(
            uniformBuffer,
            0,
            new Float32Array([intensity])
        );
        const pipeline = createComputePipeline(device);
        const bindGroup = createBindGroup(device, pipeline, textures, uniformBuffer);
        await uploadData(device, textures, image, lutData); // HACK: 来自 forDataTransfer.js
        const commandEncoder = device.createCommandEncoder();
        const computePass = commandEncoder.beginComputePass();
        computePass.setPipeline(pipeline);
        computePass.setBindGroup(0, bindGroup);
        computePass.dispatchWorkgroups(
            Math.ceil(image.width / 8),
            Math.ceil(image.height / 8)
        );
        computePass.end();
        device.queue.submit([commandEncoder.finish()]);
        const resultData = await readResult( // HACK: 来自 forDataTransfer.js
            device,
            textures.outputTexture,
            image.width,
            image.height
        );
        destroyResources(textures);
        uniformBuffer.destroy();
        return { success: true, result: resultData };
    } catch (error) {
        console.error('LUT 处理失败:', error);
        if (resources) {
            destroyResources(resources);
        }
        return { success: false, error: error.message };
    }
}

/**
 * 处理图像和 LUT 文件路径, 获取数据。
 * @param {string} imagePath - 图像文件路径
 * @param {string} lutPath - LUT 文件路径
 * @returns {Promise<{
 *   image: { data: Uint8Array, width: number, height: number, blob: Blob, blobURL: string, fileName: string, fileSize: number },
 *   lut: { data: Uint8Array, blob: Blob, blobURL: string, fileName: string, fileSize: number }
 * }>}
 */
export async function processFiles(imagePath, lutPath) {
    try {
        // 并行处理图像和 LUT 文件
        const [imageResult, lutResult] = await Promise.all([
            processImageFile(imagePath),
            processLUTFile(lutPath)
        ]);
        return {
            image: imageResult,
            lut: lutResult
        };
    } catch (error) {
        console.error('处理文件时发生错误:', error);
        throw new Error(`文件处理失败: ${error.message}`);
    }
}

/**
 * 处理图像文件
 * @private
 * @param {string} imagePath - 图像文件路径
 * @returns {Promise<{data: Uint8Array, width: number, height: number, blob: Blob, blobURL: string, fileName: string, fileSize: number}>}
 */
async function processImageFile(imagePath) {
    try {
        // 获取文件基本信息
        console.log(`Processing image: ${imagePath}`);
        const response = await fetch(imagePath);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const blob = await response.blob();
        const fileName = imagePath.split('/').pop();
        const blobURL = URL.createObjectURL(blob);
        const fileSize = blob.size;
        // 加载图像并获取像素数据
        const image = await createImageBitmap(blob);
        const canvas = new OffscreenCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('无法获取 OffscreenCanvas 2D context');
        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0, image.width, image.height);
        return {
            data: imageData.data,
            width: image.width,
            height: image.height,
            blob,
            blobURL,
            fileName,
            fileSize
        };
    } catch (error) {
        console.error(`处理图像文件失败 (${imagePath}):`, error);
        throw new Error(`处理图像文件失败: ${error.message}`);
    }
}

/**
 * 处理 LUT 文件
 * @private
 * @param {string} lutPath - LUT 文件路径
 * @returns {Promise<{data: Uint8Array, blob: Blob, blobURL: string, fileName: string, fileSize: number}>}
 */
async function processLUTFile(lutPath) {
    try {
        // 获取文件基本信息
        console.log(`Processing LUT: ${lutPath}`);
        const response = await fetch(lutPath);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const blob = await response.blob();
        const fileName = lutPath.split('/').pop();
        const blobURL = URL.createObjectURL(blob);
        const fileSize = blob.size;
        // 读取.cube文件内容
        const text = await blob.text();
        const lutData = parseCubeFile(text);
        // 验证解析后的LUT数据 (假设 lutSize 总是 32)
        const lutSize = 32;
        const expectedSize = lutSize * lutSize * lutSize * 4; // RGBA 格式
        if (lutData.length !== expectedSize) {
            console.warn(`解析后的LUT数据大小不符合预期 (预期 ${expectedSize}, 实际 ${lutData.length}) - 文件可能不是 32x32x32?`);
            // 暂时不抛出错误，允许不同大小的 LUT，但着色器可能需要调整
        }
        return {
            data: lutData,
            blob,
            blobURL,
            fileName,
            fileSize
        };
    } catch (error) {
        console.error(`处理 LUT 文件失败 (${lutPath}):`, error);
        throw new Error(`处理 LUT 文件失败: ${error.message}`);
    }
}

/**
 * 解析 .cube 格式的 LUT 文件
 * @private
 * @param {string} content - .cube 文件的文本内容
 * @returns {Uint8Array} 解析后的 LUT 数据数组 (RGBA 格式)
 */
function parseCubeFile(content) {
    const lines = content.split('\n');
    let lutSize = 0;
    let domainMin = [0, 0, 0];
    let domainMax = [1, 1, 1];
    const dataLines = [];

    // 首先解析头部信息和数据行
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine === '' || trimmedLine.startsWith('#')) continue;
        if (trimmedLine.startsWith('TITLE')) continue;

        const parts = trimmedLine.split(/\s+/);
        const command = parts[0];

        if (command === 'LUT_3D_SIZE') {
            lutSize = parseInt(parts[1]);
            if (isNaN(lutSize) || lutSize <= 0) {
                throw new Error(`无效的 LUT_3D_SIZE: ${parts[1]}`);
            }
        } else if (command === 'DOMAIN_MIN') {
            domainMin = parts.slice(1).map(Number);
            if (domainMin.length !== 3 || domainMin.some(isNaN)) {
                throw new Error(`无效的 DOMAIN_MIN: ${trimmedLine}`);
            }
        } else if (command === 'DOMAIN_MAX') {
            domainMax = parts.slice(1).map(Number);
            if (domainMax.length !== 3 || domainMax.some(isNaN)) {
                throw new Error(`无效的 DOMAIN_MAX: ${trimmedLine}`);
            }
        } else if (parts.length === 3 && parts.every(p => !isNaN(Number(p)))) {
            // 认为是数据行
            dataLines.push(parts.map(Number));
        } else {
            console.warn(`忽略无法解析的行: ${trimmedLine}`);
        }
    }

    if (lutSize === 0) {
        // 尝试从数据行数猜测 LUT 大小 (立方根)
        const estimatedSize = Math.cbrt(dataLines.length);
        if (Number.isInteger(estimatedSize) && estimatedSize > 0) {
            lutSize = estimatedSize;
            console.warn(`未找到 LUT_3D_SIZE, 从数据行数猜测大小为: ${lutSize}`);
        } else {
            throw new Error('无法确定 LUT 大小 (未找到 LUT_3D_SIZE 或无法从数据行数猜测)');
        }
    }

    const expectedCount = lutSize * lutSize * lutSize;
    if (dataLines.length !== expectedCount) {
        throw new Error(`LUT 数据点数量 (${dataLines.length}) 与声明的大小 (${lutSize}^3 = ${expectedCount}) 不符`);
    }

    // 创建适当大小的数组并填充数据
    const lutData = new Uint8Array(expectedCount * 4); // RGBA
    let currentIndex = 0;
    const range = domainMax.map((max, i) => max - domainMin[i]);
    // 检查 range 是否包含 0，避免除以零
    if (range.some(r => r === 0)) {
        throw new Error('DOMAIN_MIN 和 DOMAIN_MAX 定义的范围无效 (存在零宽度维度)');
    }

    for (const [r, g, b] of dataLines) {
        // 根据 domain 范围进行归一化, 并 clamp 到 [0, 1]
        const normalizedR = Math.max(0, Math.min(1, (r - domainMin[0]) / range[0]));
        const normalizedG = Math.max(0, Math.min(1, (g - domainMin[1]) / range[1]));
        const normalizedB = Math.max(0, Math.min(1, (b - domainMin[2]) / range[2]));

        lutData[currentIndex++] = Math.round(normalizedR * 255);
        lutData[currentIndex++] = Math.round(normalizedG * 255);
        lutData[currentIndex++] = Math.round(normalizedB * 255);
        lutData[currentIndex++] = 255; // Alpha 设置为 255
    }

    return lutData;
}

/**
 * 清理通过 processFiles 或 processLUTFile/processImageFile 创建的 Blob URL。
 * @param {...string | null | undefined} blobURLs - 要清理的 blob URL 数组。
 */
export function cleanupFiles(...blobURLs) {
    blobURLs.forEach(url => {
        if (typeof url === 'string' && url.startsWith('blob:')) {
            try {
                URL.revokeObjectURL(url);
                // console.log(`Revoked Blob URL: ${url}`);
            } catch (e) {
                console.error(`Failed to revoke Blob URL: ${url}`, e);
            }
        }
    });
}

/**
 * 加载图像和 LUT 文件，并使用 LUT 处理图像。
 * 这是 `processImageWithLUT` 和 `processFiles` 的组合入口点。
 * @param {string} imagePath - 图像文件路径
 * @param {string} lutPath - LUT 文件路径
 * @param {number} [intensity=1.0] - LUT 效果强度 (0.0 到 1.0)
 * @returns {Promise<{success: boolean, result?: Uint8Array, imageInfo?: object, lutInfo?: object, error?: string}>} 处理结果，包含原始文件信息。
 */
export async function processImageWithLUTFile(imagePath, lutPath, intensity = 1.0) {
    let fileResources = null;
    try {
        fileResources = await processFiles(imagePath, lutPath);
        const lutResult = await processImageWithLUT(
            fileResources.image,
            fileResources.lut.data,
            intensity
        );

        if (lutResult.success) {
            return {
                success: true,
                result: lutResult.result,
                imageInfo: { // 返回一些文件信息供参考
                    fileName: fileResources.image.fileName,
                    fileSize: fileResources.image.fileSize,
                    width: fileResources.image.width,
                    height: fileResources.image.height,
                    blobURL: fileResources.image.blobURL // 注意：这个 URL 需要调用方在适当时候 revoke
                },
                lutInfo: {
                    fileName: fileResources.lut.fileName,
                    fileSize: fileResources.lut.fileSize,
                    blobURL: fileResources.lut.blobURL // 注意：这个 URL 需要调用方在适当时候 revoke
                }
            };
        } else {
            // 如果 LUT 处理失败，清理已创建的 Blob URL
            cleanupFiles(fileResources.image.blobURL, fileResources.lut.blobURL);
            return { success: false, error: lutResult.error };
        }
    } catch (error) {
        console.error('处理图像与 LUT 文件失败:', error);
        // 如果在 processFiles 阶段失败，可能还没有 blobURL
        if (fileResources) {
            cleanupFiles(fileResources.image?.blobURL, fileResources.lut?.blobURL);
        }
        return { success: false, error: error.message };
    }
}

/**
 * 清理 processImageWithLUTFile 返回结果中的 Blob URL。
 * @param {object} result - processImageWithLUTFile 返回的成功结果对象。
 */
export function cleanupPreview(result) {
    if (result && result.success) {
        cleanupFiles(result.imageInfo?.blobURL, result.lutInfo?.blobURL);
    }
} 