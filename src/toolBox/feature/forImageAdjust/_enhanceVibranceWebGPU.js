/**
 * @fileoverview 使用 WebGPU 实现自然饱和度增强的辅助函数。
 */

// ------------------- 数据准备 (复用或调整) -------------------

// 复用 getImageData 和 prepareImageDataForWebGPU (如果需要分块)，
// 但 WebGPU 调整通常不需要像直方图那样严格的分块处理，可以处理大纹理，
// 但需要注意数据上传和处理的性能。
// 这里暂时假设调用者会传入可以直接用于纹理的 ImageData 或 ImageBitmap。

// ------------------- WebGPU 核心计算 -------------------

/**
 * 获取自然饱和度增强的 WebGPU 计算着色器 (WGSL) 代码。
 */
function getVibranceComputeShaderCode() {
    return `
    struct Options {
        intensity: f32,
        protectSkin: u32, // 0 for false, 1 for true
        smartAdjust: u32, // 0 for false, 1 for true
        // 可以添加其他参数，如肤色检测阈值等
    };

    @group(0) @binding(0) var inputTexture: texture_2d<f32>;
    @group(0) @binding(1) var outputTexture: texture_storage_2d<rgba8unorm, write>;
    @group(0) @binding(2) var<uniform> options: Options;

    // 简单的肤色检测函数 (基于原 adjust.js 逻辑)
    fn isSkinTone(r: f32, g: f32, b: f32) -> bool {
        let r_u8 = u32(r * 255.0);
        let g_u8 = u32(g * 255.0);
        let b_u8 = u32(b * 255.0);
        return (r_u8 > 95u && g_u8 > 40u && b_u8 > 20u) &&
               (max(r_u8, max(g_u8, b_u8)) - min(r_u8, min(g_u8, b_u8)) > 15u) &&
               (abs(i32(r_u8) - i32(g_u8)) > 15) && (r_u8 > g_u8) && (r_u8 > b_u8);
    }

    @compute @workgroup_size(16, 16)
    fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
        let dims = textureDimensions(outputTexture);
        let coord = vec2<u32>(global_id.xy);

        // 防止越界访问
        if (coord.x >= u32(dims.x) || coord.y >= u32(dims.y)) {
            return;
        }

        let texCoord = vec2<i32>(coord);
        let originalColor = textureLoad(inputTexture, texCoord, 0);
        let r = originalColor.r;
        let g = originalColor.g;
        let b = originalColor.b;
        let a = originalColor.a; // 保持 alpha

        // 计算亮度 (ITU-R BT.601)
        let luminance = 0.299 * r + 0.587 * g + 0.114 * b;

        var actualIntensity = options.intensity;
        if (options.protectSkin != 0u && isSkinTone(r, g, b)) {
            // 肤色强度减半 (可以根据需要调整因子或添加阈值)
            actualIntensity = 1.0 + (options.intensity - 1.0) * 0.5;
            // clamp(actualIntensity, 1.0, 1.2); // 如果需要精确限制最大值
        }

        var factor = actualIntensity;
        if (options.smartAdjust != 0u) {
            factor = 1.0 + (actualIntensity - 1.0) * (1.0 - abs(luminance - 0.5) * 2.0);
        }

        // 应用饱和度调整
        var newR = luminance + (r - luminance) * factor;
        var newG = luminance + (g - luminance) * factor;
        var newB = luminance + (b - luminance) * factor;
        
        // Clamp 结果到 [0, 1] 范围
        newR = clamp(newR, 0.0, 1.0);
        newG = clamp(newG, 0.0, 1.0);
        newB = clamp(newB, 0.0, 1.0);

        // 写入输出纹理
        textureStore(outputTexture, coord, vec4<f32>(newR, newG, newB, a));
    }
`;
}

/**
 * 使用 WebGPU 对图像进行自然饱和度增强。
 * @param {ImageBitmap|ImageData} imageSource - 输入图像。
 * @param {GPUDevice} device - WebGPU 设备实例。
 * @param {object} options - 调整选项。
 * @param {number} [options.intensity=1.3] - 饱和度强度。
 * @param {boolean} [options.protectSkin=true] - 是否启用肤色保护。
 * @param {boolean} [options.smartAdjust=true] - 是否根据亮度智能调整强度。
 * @returns {Promise<ImageData>} 返回包含处理后像素数据的 ImageData 对象。
 */
export async function enhanceVibranceWebGPU(imageSource, device, options = {}) {
    const { intensity = 1.3, protectSkin = true, smartAdjust = true } = options;

    let inputTexture = null;
    let outputTexture = null;
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
                usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT, // RENDER_ATTACHMENT 用于 copyExternalImageToTexture
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
             throw new Error('WebGPU enhanceVibrance 需要 ImageBitmap 或 ImageData 输入');
        }

        // 2. 创建输出纹理 (Storage Texture)
        outputTexture = device.createTexture({
            size: [width, height],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.COPY_SRC,
        });

        // 3. 创建 Uniform Buffer 传递选项
        const optionsArray = new Float32Array([intensity]); // 使用 f32 传递 intensity
        const flagsArray = new Uint32Array([protectSkin ? 1 : 0, smartAdjust ? 1 : 0]); // 使用 u32 传递布尔标志
        const uniformBufferSize = optionsArray.byteLength + flagsArray.byteLength;
        uniformBuffer = device.createBuffer({
            size: uniformBufferSize, // 至少需要 16 字节对齐，这里简化处理
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        device.queue.writeBuffer(uniformBuffer, 0, optionsArray);
        device.queue.writeBuffer(uniformBuffer, optionsArray.byteLength, flagsArray);

        // 4. 创建计算管线
        const computeModule = device.createShaderModule({
            code: getVibranceComputeShaderCode(),
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
                { binding: 1, resource: outputTexture.createView() },
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

        // 7. 将结果从输出纹理复制到 Buffer 以便读取
        const bytesPerRow = Math.ceil(width * 4 / 256) * 256; // 确保对齐
        const resultBufferSize = bytesPerRow * height;
        resultBuffer = device.createBuffer({
            size: resultBufferSize,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        });
        commandEncoder.copyTextureToBuffer(
            { texture: outputTexture },    // source
            { buffer: resultBuffer, bytesPerRow }, // destination
            { width, height }             // copySize
        );
        device.queue.submit([commandEncoder.finish()]);

        // 8. 读取结果
        await resultBuffer.mapAsync(GPUMapMode.READ);
        const resultData = new Uint8ClampedArray(resultBuffer.getMappedRange().slice(0)); // slice(0) 创建副本
        
        // 从 Buffer 中提取实际像素数据（去除可能的行对齐填充）
        const finalPixelData = new Uint8ClampedArray(width * height * 4);
        for (let y = 0; y < height; y++) {
            const sourceOffset = y * bytesPerRow;
            const targetOffset = y * width * 4;
            finalPixelData.set(resultData.subarray(sourceOffset, sourceOffset + width * 4), targetOffset);
        }

        // 创建 ImageData 对象
        return new ImageData(finalPixelData, width, height);

    } catch (error) {
        console.error('WebGPU 自然饱和度增强失败:', error);
        throw error; // 重新抛出错误，让调用者知道 GPU 失败
    } finally {
        // 9. 清理资源
        if (resultBuffer) resultBuffer.unmap();
        if (inputTexture) inputTexture.destroy();
        if (outputTexture) outputTexture.destroy();
        if (resultBuffer) resultBuffer.destroy();
        if (uniformBuffer) uniformBuffer.destroy();
    }
} 