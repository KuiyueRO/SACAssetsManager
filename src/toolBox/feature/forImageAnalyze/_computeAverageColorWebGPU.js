/**
 * @fileoverview 使用 WebGPU 计算图像平均颜色的辅助函数。
 */

/**
 * 获取计算平均颜色的 WebGPU 计算着色器 (WGSL) 代码。
 * 它会将高于 alpha 阈值的像素颜色写入存储缓冲区。
 */
function getAverageColorComputeShaderCode() {
    return `
        @group(0) @binding(0) var input_texture : texture_2d<f32>;
        // 输出缓冲区，每个像素 RGBA 存储为 f32
        @group(0) @binding(1) var<storage, read_write> output_buffer : array<f32>;

        struct Params {
            alpha_threshold : f32, // 阈值在 [0, 1] 范围
            width : u32,
            height : u32,
            // padding : u32, // 如果需要对齐可以添加
        };
        @group(0) @binding(2) var<uniform> params : Params;

        @compute @workgroup_size(16, 16)
        fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
            if (global_id.x >= params.width || global_id.y >= params.height) {
                return;
            }

            let coords = vec2<i32>(global_id.xy);
            let texel = textureLoad(input_texture, coords, 0);
            
            // 计算存储缓冲区的索引 (每个像素占 4 个 f32)
            let pixel_index = (global_id.y * params.width + global_id.x) * 4u;
            
            if (texel.a >= params.alpha_threshold) { // 直接比较 [0,1] 范围的 alpha
                output_buffer[pixel_index]     = texel.r;
                output_buffer[pixel_index + 1u] = texel.g;
                output_buffer[pixel_index + 2u] = texel.b;
                output_buffer[pixel_index + 3u] = texel.a;
            } else {
                // 对于低于阈值的像素，写入 0 或特殊值（例如 -1）以便后续区分？
                // 当前写入 0，后续 CPU 处理时需要判断 alpha 是否 > 0 来计数。
                output_buffer[pixel_index]     = 0.0;
                output_buffer[pixel_index + 1u] = 0.0;
                output_buffer[pixel_index + 2u] = 0.0;
                output_buffer[pixel_index + 3u] = 0.0; // 写入 0 alpha
            }
        }
    `;
}

/**
 * 在 CPU 端处理从 GPU 返回的像素数据，计算平均颜色。
 * @param {Float32Array} pixelData - 从 GPU 存储缓冲区读取的像素数据 (RGBA f32 数组)。
 * @returns {{r: number, g: number, b: number, a: number}}
 */
function processGpuResults(pixelData) {
    let sumR = 0, sumG = 0, sumB = 0, sumA = 0;
    let validPixelCount = 0;

    for (let i = 0; i < pixelData.length; i += 4) {
        const a = pixelData[i + 3];
        // 检查 alpha 是否大于 0 (因为低于阈值的像素被写入了 0)
        if (a > 0.0) { 
            sumR += pixelData[i];
            sumG += pixelData[i + 1];
            sumB += pixelData[i + 2];
            sumA += a;
            validPixelCount++;
        }
    }

    if (validPixelCount === 0) {
        return { r: 0, g: 0, b: 0, a: 0 };
    }

    // 将平均值从 [0, 1] 转换回 [0, 255]
    return {
        r: Math.round((sumR / validPixelCount) * 255),
        g: Math.round((sumG / validPixelCount) * 255),
        b: Math.round((sumB / validPixelCount) * 255),
        // 平均 alpha 保持 [0, 255] 范围
        a: Math.round((sumA / validPixelCount) * 255),
    };
}

/**
 * 使用 WebGPU 计算图像的平均颜色。
 * @param {ImageBitmap|ImageData} imageSource - 输入图像。
 * @param {GPUDevice} device - WebGPU 设备实例。
 * @param {object} [options={}] - 计算选项。
 * @param {number} [options.alphaThreshold=0.1] - Alpha 阈值 [0, 1]。
 * @returns {Promise<{r: number, g: number, b: number, a: number}>} 平均颜色对象 (RGBA, 0-255)。
 */
export async function computeAverageColorWebGPU(imageSource, device, options = {}) {
    const { alphaThreshold = 0.1 } = options;

    let inputTexture = null;
    let outputBuffer = null;
    let resultBuffer = null;
    let uniformBuffer = null;
    let width, height;

    try {
        // 1. 获取图像尺寸和创建输入纹理
        if (imageSource instanceof ImageBitmap) {
            width = imageSource.width;
            height = imageSource.height;
            inputTexture = device.createTexture({
                size: [width, height],
                format: 'rgba8unorm',
                usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT, 
            });
            device.queue.copyExternalImageToTexture(
                { source: imageSource }, 
                { texture: inputTexture }, 
                [width, height]
            );
        } else if (imageSource instanceof ImageData) {
            width = imageSource.width;
            height = imageSource.height;
            inputTexture = device.createTexture({
                size: [width, height],
                format: 'rgba8unorm',
                usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
            });
            device.queue.writeTexture(
                { texture: inputTexture },
                imageSource.data,
                { bytesPerRow: width * 4, rowsPerImage: height },
                { width, height, depthOrArrayLayers: 1 }
            );
        } else {
             throw new Error('computeAverageColorWebGPU 需要 ImageBitmap 或 ImageData 输入');
        }

        // 2. 创建输出缓冲区 (存储 RGBA f32)
        const outputBufferSize = width * height * 4 * 4; 
        outputBuffer = device.createBuffer({
            size: outputBufferSize,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
        });

        // 3. 创建 Uniform Buffer 传递参数
        // 需要 16 字节对齐: alpha(f32=4) + width(u32=4) + height(u32=4) + padding(u32=4) = 16 bytes
        const uniformBufferSize = 16;
        uniformBuffer = device.createBuffer({
            size: uniformBufferSize,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        // 使用 DataView 精确写入不同类型的数据
        const uniformData = new ArrayBuffer(uniformBufferSize);
        const uniformView = new DataView(uniformData);
        uniformView.setFloat32(0, alphaThreshold, true); // true for little-endian
        uniformView.setUint32(4, width, true);
        uniformView.setUint32(8, height, true);
        // uniformView.setUint32(12, 0, true); // Padding
        device.queue.writeBuffer(uniformBuffer, 0, uniformData);

        // 4. 创建计算管线
        const computeModule = device.createShaderModule({
            code: getAverageColorComputeShaderCode(),
        });
        const pipeline = await device.createComputePipelineAsync({
            layout: 'auto',
            compute: {
                module: computeModule,
                entryPoint: 'main',
            },
        });

        // 5. 创建绑定组
        const bindGroup = device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: inputTexture.createView() },
                { binding: 1, resource: { buffer: outputBuffer } },
                { binding: 2, resource: { buffer: uniformBuffer } },
            ],
        });

        // 6. 记录命令并提交
        const commandEncoder = device.createCommandEncoder();
        const computePass = commandEncoder.beginComputePass();
        computePass.setPipeline(pipeline);
        computePass.setBindGroup(0, bindGroup);
        const workgroupSizeX = 16;
        const workgroupSizeY = 16;
        computePass.dispatchWorkgroups(
            Math.ceil(width / workgroupSizeX),
            Math.ceil(height / workgroupSizeY)
        );
        computePass.end();

        // 7. 将结果从 storage buffer 复制到 mappable buffer
        resultBuffer = device.createBuffer({
            size: outputBufferSize,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        });
        commandEncoder.copyBufferToBuffer(
            outputBuffer, 0, resultBuffer, 0, outputBufferSize
        );
        device.queue.submit([commandEncoder.finish()]);

        // 8. 读取结果并处理
        await resultBuffer.mapAsync(GPUMapMode.READ);
        // slice() 创建副本，这样可以立即 unmap
        const resultData = new Float32Array(resultBuffer.getMappedRange().slice(0)); 
        resultBuffer.unmap(); // 尽快 unmap
        
        const averageColor = processGpuResults(resultData);
        return averageColor;

    } catch (error) {
        console.error('WebGPU 计算平均颜色失败:', error);
        throw error; 
    } finally {
        // 9. 清理资源 (Unmap 已在读取后完成)
        if (inputTexture) inputTexture.destroy();
        if (outputBuffer) outputBuffer.destroy();
        if (resultBuffer) resultBuffer.destroy();
        if (uniformBuffer) uniformBuffer.destroy();
    }
} 