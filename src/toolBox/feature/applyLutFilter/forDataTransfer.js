/**
 * @fileoverview 提供 WebGPU 数据传输的辅助函数 (纹理上传和结果读取)。
 * @module forDataTransfer
 */

/**
 * 将图像和 LUT 数据上传到 GPU 纹理。
 * @param {GPUDevice} device - WebGPU 设备实例。
 * @param {object} textures - 包含目标纹理的对象。
 * @param {GPUTexture} textures.inputTexture - 输入图像纹理。
 * @param {GPUTexture} textures.lutTexture - 3D LUT 纹理。
 * @param {object} image - 包含图像数据和尺寸的对象。
 * @param {Uint8Array} image.data - 图像像素数据 (RGBA)。
 * @param {number} image.width - 图像宽度。
 * @param {number} image.height - 图像高度。
 * @param {Uint8Array} lutData - LUT 数据 (RGBA)。
 */
export async function uploadData(device, textures, image, lutData) {
    if (!device || !textures || !image || !lutData) {
        throw new Error("Missing required arguments for uploadData.");
    }
    if (!textures.inputTexture || !textures.lutTexture) {
        throw new Error("Missing required textures (input, lut).");
    }

    // 上传图像数据到输入纹理
    device.queue.writeTexture(
        { texture: textures.inputTexture }, // 目标纹理
        image.data,                        // 源数据
        { bytesPerRow: image.width * 4 },   // 数据布局：每行字节数
        { width: image.width, height: image.height } // 写入尺寸
    );

    // 上传 LUT 数据到 3D LUT 纹理
    // TODO: LUT size (32) 硬编码, 应该根据实际 LUT 数据调整
    const lutSize = 32;
    device.queue.writeTexture(
        { texture: textures.lutTexture },           // 目标纹理
        lutData,                                   // 源数据
        { bytesPerRow: lutSize * 4, rowsPerImage: lutSize }, // 数据布局 (3D)
        { width: lutSize, height: lutSize, depthOrArrayLayers: lutSize } // 写入尺寸 (3D)
    );
}

/**
 * 从 GPU 纹理读取计算结果到 Uint8Array。
 * @param {GPUDevice} device - WebGPU 设备实例。
 * @param {GPUTexture} texture - 包含结果的源纹理。
 * @param {number} width - 结果图像的宽度。
 * @param {number} height - 结果图像的高度。
 * @returns {Promise<Uint8Array>} 包含处理结果的像素数据。
 */
export async function readResult(device, texture, width, height) {
    if (!device || !texture || !width || !height) {
        throw new Error("Missing required arguments for readResult.");
    }

    // 创建一个 Buffer 用于接收从 Texture 复制的数据
    const resultBuffer = device.createBuffer({
        size: width * height * 4, // RGBA 格式
        usage: GPUBufferUsage.COPY_DST | // 可作为拷贝目的地
               GPUBufferUsage.MAP_READ    // 允许 CPU 读取
    });

    // 创建指令编码器
    const commandEncoder = device.createCommandEncoder();
    
    // 添加从 Texture 拷贝到 Buffer 的指令
    commandEncoder.copyTextureToBuffer(
        { texture: texture },                          // 源纹理
        { buffer: resultBuffer, bytesPerRow: width * 4 }, // 目标 Buffer 和布局
        { width: width, height: height, depthOrArrayLayers: 1 } // 拷贝尺寸
    );

    // 提交指令到 GPU 执行
    device.queue.submit([commandEncoder.finish()]);

    // 等待 GPU 完成并将 Buffer 映射到 CPU 可读内存
    await resultBuffer.mapAsync(GPUMapMode.READ);

    // 获取映射后的内存范围 (ArrayBuffer)
    const mappedRange = resultBuffer.getMappedRange();
    
    // 从映射范围创建一个新的 Uint8Array 副本
    // 必须创建副本，因为 unmap 后 mappedRange 会失效
    const resultData = new Uint8Array(mappedRange.slice(0)); 

    // 解除 Buffer 映射
    resultBuffer.unmap();
    
    // 销毁临时 Buffer
    resultBuffer.destroy();

    return resultData;
} 