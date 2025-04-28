/**
 * @fileoverview 使用 WebGPU 计算图像直方图的辅助函数
 */

const MAX_TEXTURE_SIZE = 2048; // 假设的 WebGPU 最大纹理尺寸 (实际应查询设备限制)

// ------------------- 数据准备与调整 ------------------- 

/**
 * 从 ImageBitmap 或 ImageData 获取像素数据和尺寸。
 * @param {ImageBitmap|ImageData} imageSource 
 * @returns {{width: number, height: number, data: Uint8ClampedArray}}
 */
function getImageData(imageSource) {
    let width, height, data;
    if (imageSource instanceof ImageBitmap) {
        width = imageSource.width;
        height = imageSource.height;
        // 从 ImageBitmap 获取像素数据需要绘制到 Canvas
        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('无法获取 OffscreenCanvas 2D context');
        ctx.drawImage(imageSource, 0, 0);
        const imageDataObj = ctx.getImageData(0, 0, width, height);
        data = imageDataObj.data;
    } else if (imageSource instanceof ImageData) {
        width = imageSource.width;
        height = imageSource.height;
        data = imageSource.data;
    } else {
        throw new Error('不支持的图像源类型，期望 ImageBitmap 或 ImageData');
    }
    return { width, height, data };
}

/**
 * 调整输入图像数据以适应 WebGPU 处理，处理超大图像分块。
 * 注意：当前实现假定 MAX_TEXTURE_SIZE，实际应用中应查询 device.limits.maxTextureDimension2D
 * @param {ImageBitmap|ImageData} imageSource - 输入图像对象
 * @returns {{width: number, height: number, data: Uint8ClampedArray, needsSplit: boolean, blocks?: {numBlocksX: number, numBlocksY: number, maxSize: number}}}
 */
function prepareImageDataForWebGPU(imageSource) {
    const { width, height, data } = getImageData(imageSource);
    const needsSplit = width > MAX_TEXTURE_SIZE || height > MAX_TEXTURE_SIZE;

    if (needsSplit) {
        console.warn(`图像尺寸 (${width}x${height}) 超出 MAX_TEXTURE_SIZE (${MAX_TEXTURE_SIZE})，将进行分块处理。`);
        const numBlocksX = Math.ceil(width / MAX_TEXTURE_SIZE);
        const numBlocksY = Math.ceil(height / MAX_TEXTURE_SIZE);
        return {
            width, height, data,
            needsSplit: true,
            blocks: {
                numBlocksX,
                numBlocksY,
                maxSize: MAX_TEXTURE_SIZE
            }
        };
    }

    // 对于不需要分块的图像，直接返回原始数据
    return { width, height, data, needsSplit: false };
    // 注意：原代码中 adjustBufferDimensions 还包含填充逻辑，这里暂时简化，假设 WebGPU 可以处理非对齐尺寸。
    // 如果需要填充，需要在这里实现并将 paddedPixels 信息传递下去。
}

// ------------------- WebGPU 核心计算 -------------------

/**
 * 获取 WebGPU 计算着色器 (WGSL) 代码。
 * 使用原子操作计算 R, G, B 和亮度直方图。
 */
function getComputeShaderCode() {
    // 使用 ITU-R BT.601 标准计算亮度，与 CPU 实现保持一致
    return `
    @group(0) @binding(0) var inputTexture: texture_2d<f32>;
    // 输出缓冲区：4个通道（R, G, B, Brightness），每个通道256个 bin
    @group(0) @binding(1) var<storage, read_write> outputBuffer: array<atomic<u32>>;

    @compute @workgroup_size(16, 16)
    fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
        let dims = textureDimensions(inputTexture);
        let coord = vec2<u32>(global_id.xy);
        
        // 防止越界访问
        if (coord.x >= u32(dims.x) || coord.y >= u32(dims.y)) {
            return;
        }

        let texCoord = vec2<i32>(coord);
        // textureLoad 返回 rgba vec4<f32>，值在 [0.0, 1.0]
        let color = textureLoad(inputTexture, texCoord, 0);
        
        // 将 [0.0, 1.0] 范围的颜色值转换为 [0, 255] 的整数索引
        let r_index = u32(clamp(color.r * 255.0, 0.0, 255.0));
        let g_index = u32(clamp(color.g * 255.0, 0.0, 255.0));
        let b_index = u32(clamp(color.b * 255.0, 0.0, 255.0));
        // Alpha 通道也计算直方图
        let a_index = u32(clamp(color.a * 255.0, 0.0, 255.0)); 
        // 亮度计算
        let brightness = u32(clamp((0.299 * color.r + 0.587 * color.g + 0.114 * color.b) * 255.0, 0.0, 255.0));
        
        // 原子增加对应 bin 的计数
        // R: 0-255, G: 256-511, B: 512-767, A: 768-1023, Brightness: 1024-1279
        atomicAdd(&outputBuffer[r_index], 1u);
        atomicAdd(&outputBuffer[g_index + 256u], 1u);
        atomicAdd(&outputBuffer[b_index + 512u], 1u);
        atomicAdd(&outputBuffer[a_index + 768u], 1u); 
        atomicAdd(&outputBuffer[brightness + 1024u], 1u);
    }
`;
}

/**
 * 处理单个图像块（或完整图像）的直方图计算。
 * @param {{data: Uint8ClampedArray, width: number, height: number}} blockInfo - 图像块信息。
 * @param {GPUDevice} device - WebGPU 设备实例。
 * @returns {Promise<{r: number[], g: number[], b: number[], a: number[], brightness: number[]}>} 直方图结果。
 */
async function computeHistogramForBlock(blockInfo, device) {
    const { data, width, height } = blockInfo;
    const bufferSize = 256 * 5 * 4; // 5通道 (R,G,B,A,Brightness), 每个通道256个u32 (4字节)

    let outputBuffer = null;
    let resultBuffer = null;
    let texture = null;

    try {
        // 1. 创建缓冲区
        outputBuffer = device.createBuffer({
            size: bufferSize,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
        });
        resultBuffer = device.createBuffer({
            size: bufferSize,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        });

        // 2. 创建纹理并上传数据
        texture = device.createTexture({
            size: [width, height],
            format: 'rgba8unorm', // 图像数据是 RGBA 格式
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
        });
        device.queue.writeTexture(
            { texture },
            data,
            { bytesPerRow: width * 4, rowsPerImage: height },
            { width, height, depthOrArrayLayers: 1 }
        );

        // 3. 创建计算管线
        const computeModule = device.createShaderModule({
            code: getComputeShaderCode(),
        });
        const pipeline = await device.createComputePipelineAsync({
            layout: 'auto',
            compute: {
                module: computeModule,
                entryPoint: 'main',
            },
        });

        // 4. 创建绑定组
        const bindGroup = device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [
                {
                    binding: 0,
                    resource: texture.createView(),
                },
                {
                    binding: 1,
                    resource: { buffer: outputBuffer },
                },
            ],
        });

        // 5. 记录命令并提交
        const commandEncoder = device.createCommandEncoder();
        const computePass = commandEncoder.beginComputePass();
        computePass.setPipeline(pipeline);
        computePass.setBindGroup(0, bindGroup);
        // 计算工作组数量 (假设 workgroup_size 为 16x16)
        const workgroupSizeX = 16;
        const workgroupSizeY = 16;
        computePass.dispatchWorkgroups(
            Math.ceil(width / workgroupSizeX),
            Math.ceil(height / workgroupSizeY)
        );
        computePass.end();

        // 将结果从 storage buffer 复制到 mappable buffer
        commandEncoder.copyBufferToBuffer(
            outputBuffer, 0, resultBuffer, 0, bufferSize
        );
        device.queue.submit([commandEncoder.finish()]);

        // 6. 读取结果
        await resultBuffer.mapAsync(GPUMapMode.READ);
        const resultsArrayBuffer = resultBuffer.getMappedRange();
        // 使用 Int32Array 或 Uint32Array 读取原子计数器结果
        const results = new Uint32Array(resultsArrayBuffer.slice(0)); // slice(0) 创建副本

        // 解析结果到直方图对象
        const histogram = {
            r: Array.from(results.slice(0, 256)),
            g: Array.from(results.slice(256, 512)),
            b: Array.from(results.slice(512, 768)),
            a: Array.from(results.slice(768, 1024)),
            brightness: Array.from(results.slice(1024, 1280))
        };

        return histogram;

    } catch (error) {
        console.error('WebGPU 直方图块计算失败:', error);
        throw error; // 重新抛出错误
    } finally {
        // 7. 清理资源
        if (resultBuffer) resultBuffer.unmap(); // 确保 unmap 在 destroy 之前
        if (texture) texture.destroy();
        if (outputBuffer) outputBuffer.destroy();
        if (resultBuffer) resultBuffer.destroy();
    }
}

// ------------------- 大图像处理 -------------------

/**
 * 从完整图像数据中提取指定块的像素数据。
 * @param {Uint8ClampedArray} fullData - 完整图像 RGBA 数据。
 * @param {number} fullWidth - 完整图像宽度。
 * @param {number} fullHeight - 完整图像高度。
 * @param {number} blockXIndex - 块的 X 索引。
 * @param {number} blockYIndex - 块的 Y 索引。
 * @param {number} blockWidth - 块的宽度。
 * @param {number} blockHeight - 块的高度。
 * @param {number} blockSize - 用于计算起始位置的块大小 (MAX_TEXTURE_SIZE)。
 * @returns {Uint8ClampedArray} 提取出的块数据。
 */
function extractBlockData(fullData, fullWidth, fullHeight, blockXIndex, blockYIndex, blockWidth, blockHeight, blockSize) {
    const blockData = new Uint8ClampedArray(blockWidth * blockHeight * 4);
    const startX = blockXIndex * blockSize;
    const startY = blockYIndex * blockSize;

    for (let y = 0; y < blockHeight; y++) {
        const sourceY = startY + y;
        // 优化内存复制
        const sourceOffset = (sourceY * fullWidth + startX) * 4;
        const targetOffset = (y * blockWidth) * 4;
        const rowData = fullData.subarray(sourceOffset, sourceOffset + blockWidth * 4);
        blockData.set(rowData, targetOffset);
    }

    return blockData;
}

/**
 * 将单个块的直方图合并到总直方图中。
 * @param {{r: number[], g: number[], b: number[], a: number[], brightness: number[]}} totalHistogram - 总直方图 (会被修改)。
 * @param {{r: number[], g: number[], b: number[], a: number[], brightness: number[]}} blockHistogram - 单个块的直方图。
 */
function mergeHistograms(totalHistogram, blockHistogram) {
    const channels = ['r', 'g', 'b', 'a', 'brightness'];
    channels.forEach(channel => {
        for (let i = 0; i < 256; i++) {
            totalHistogram[channel][i] += blockHistogram[channel][i];
        }
    });
}

/**
 * 处理需要分块的大尺寸图像。
 * @param {{width: number, height: number, data: Uint8ClampedArray, blocks: {numBlocksX: number, numBlocksY: number, maxSize: number}}} imageDataInfo - 包含图像信息和分块设置的对象。
 * @param {GPUDevice} device - WebGPU 设备实例。
 * @returns {Promise<{r: number[], g: number[], b: number[], a: number[], brightness: number[]}>} 合并后的总直方图。
 */
async function computeHistogramForLargeImage(imageDataInfo, device) {
    const { width, height, data, blocks } = imageDataInfo;
    const { numBlocksX, numBlocksY, maxSize } = blocks;

    // 初始化总直方图
    const totalHistogram = {
        r: new Array(256).fill(0),
        g: new Array(256).fill(0),
        b: new Array(256).fill(0),
        a: new Array(256).fill(0),
        brightness: new Array(256).fill(0)
    };

    console.log(`开始分块处理直方图: ${numBlocksX} x ${numBlocksY} 块`);
    const startTime = performance.now();

    // 串行处理块以避免可能的设备资源限制，或者可以考虑并行但需要更复杂的资源管理
    for (let blockY = 0; blockY < numBlocksY; blockY++) {
        for (let blockX = 0; blockX < numBlocksX; blockX++) {
            const blockStartTime = performance.now();
            // 计算当前块的实际尺寸
            const blockWidth = Math.min(maxSize, width - blockX * maxSize);
            const blockHeight = Math.min(maxSize, height - blockY * maxSize);

            // 提取块数据
            const blockData = extractBlockData(data, width, height, blockX, blockY, blockWidth, blockHeight, maxSize);

            // 处理单个块
            const blockHistogram = await computeHistogramForBlock({
                data: blockData,
                width: blockWidth,
                height: blockHeight
            }, device);

            // 合并直方图数据
            mergeHistograms(totalHistogram, blockHistogram);
            console.log(`块 (${blockX}, ${blockY}) 处理完成，耗时: ${(performance.now() - blockStartTime).toFixed(2)} ms`);
        }
    }

    console.log(`所有块处理完成，总耗时: ${(performance.now() - startTime).toFixed(2)} ms`);
    return totalHistogram;
}

// ------------------- 导出主函数 -------------------

/**
 * 使用 WebGPU 计算图像直方图的主入口函数。
 * @param {ImageBitmap|ImageData} imageSource - 输入图像。
 * @param {GPUDevice} device - WebGPU 设备实例。
 * @returns {Promise<{r: number[], g: number[], b: number[], a: number[], brightness: number[]}>} 直方图数据。
 */
export async function computeHistogramWebGPU(imageSource, device) {
    if (!device) {
        throw new Error('WebGPU device is required.');
    }

    const imageDataInfo = prepareImageDataForWebGPU(imageSource);

    if (imageDataInfo.needsSplit) {
        // 处理大图像
        return await computeHistogramForLargeImage(imageDataInfo, device);
    } else {
        // 处理普通大小图像
        return await computeHistogramForBlock(imageDataInfo, device);
    }
    // 注意：原代码中的 correctHistogram 逻辑（处理填充）在此简化版本中未包含。
    // 如果 prepareImageDataForWebGPU 进行了填充，则需要在返回前调用校正函数。
} 