/**
 * @fileoverview 创建和管理 WebGPU 纹理资源用于 LUT 应用。
 * @module resources
 */

/**
 * 创建 LUT 应用所需的 WebGPU 纹理。
 * @param {GPUDevice} device - WebGPU 设备实例。
 * @param {object} image - 包含图像尺寸信息的对象。
 * @param {number} image.width - 图像宽度。
 * @param {number} image.height - 图像高度。
 * @returns {{inputTexture: GPUTexture, lutTexture: GPUTexture, outputTexture: GPUTexture}} 包含创建的纹理的对象。
 */
export function createTextures(device, image) {
    if (!device || !image || !image.width || !image.height) {
        throw new Error("Missing required arguments for createTextures.");
    }

    // 输入纹理：用于存储原始图像数据
    const inputTexture = device.createTexture({
        size: [image.width, image.height, 1], // 2D 纹理，深度为 1
        format: 'rgba8unorm', // 常见的 8 位无符号归一化 RGBA 格式
        usage: GPUTextureUsage.TEXTURE_BINDING | // 可在绑定组中使用
               GPUTextureUsage.COPY_DST,        // 可作为拷贝目的地（用于上传数据）
    });

    // LUT 纹理：用于存储 3D 颜色查找表
    // TODO: LUT size (32) 硬编码, 应该根据实际 LUT 数据调整
    const lutTexture = device.createTexture({
        size: [32, 32, 32], // 3D 纹理，大小为 32x32x32
        dimension: '3d',
        format: 'rgba8unorm', // 与输入/输出格式一致
        usage: GPUTextureUsage.TEXTURE_BINDING | // 可在绑定组中使用
               GPUTextureUsage.COPY_DST,        // 可作为拷贝目的地（用于上传数据）
    });

    // 输出纹理：用于存储计算着色器的结果
    const outputTexture = device.createTexture({
        size: [image.width, image.height, 1],
        format: 'rgba8unorm',
        usage: GPUTextureUsage.STORAGE_BINDING | // 可作为存储纹理绑定（着色器可写入）
               GPUTextureUsage.COPY_SRC,        // 可作为拷贝源（用于读取结果）
    });

    return { inputTexture, lutTexture, outputTexture };
}

/**
 * 销毁创建的纹理资源，释放 GPU 内存。
 * @param {object} textures - 包含要销毁纹理的对象。
 * @param {GPUTexture} textures.inputTexture - 输入纹理。
 * @param {GPUTexture} textures.outputTexture - 输出纹理。
 * @param {GPUTexture} textures.lutTexture - LUT 纹理。
 */
export function destroyResources(textures) {
    // 使用 Optional Chaining 确保即使某个纹理不存在或已销毁也不会报错
    textures?.inputTexture?.destroy();
    textures?.lutTexture?.destroy();
    textures?.outputTexture?.destroy();
} 