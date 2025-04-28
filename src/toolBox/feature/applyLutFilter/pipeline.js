/**
 * @fileoverview 创建 WebGPU 计算管线和绑定组用于 LUT 应用。
 * @module pipeline
 */

import { lutShader } from './lutShader.js';

/**
 * 创建用于 LUT 计算的 WebGPU 计算管线。
 * @param {GPUDevice} device - WebGPU 设备实例。
 * @returns {GPUComputePipeline} 计算管线。
 */
export function createComputePipeline(device) {
    if (!device) throw new Error("GPUDevice is required to create compute pipeline.");
    
    const shaderModule = device.createShaderModule({
        code: lutShader // 从 lutShader.js 导入着色器代码
    });

    return device.createComputePipeline({
        layout: 'auto', // 自动推断管线布局
        compute: {
            module: shaderModule,
            entryPoint: 'main' // 指定着色器入口函数名
        }
    });
}

/**
 * 创建用于 LUT 计算的资源绑定组。
 * @param {GPUDevice} device - WebGPU 设备实例。
 * @param {GPUComputePipeline} pipeline - 计算管线实例。
 * @param {object} textures - 包含输入、输出和 LUT 纹理的对象。
 * @param {GPUTexture} textures.inputTexture - 输入图像纹理。
 * @param {GPUTexture} textures.outputTexture - 输出图像纹理。
 * @param {GPUTexture} textures.lutTexture - 3D LUT 纹理。
 * @param {GPUBuffer} uniformBuffer - 包含效果强度等 Uniform 数据的 Buffer。
 * @returns {GPUBindGroup} 资源绑定组。
 */
export function createBindGroup(device, pipeline, textures, uniformBuffer) {
    if (!device || !pipeline || !textures || !uniformBuffer) {
        throw new Error("Missing required arguments for createBindGroup.");
    }
    if (!textures.inputTexture || !textures.outputTexture || !textures.lutTexture) {
        throw new Error("Missing required textures (input, output, lut).");
    }

    const lutSampler = device.createSampler({
        magFilter: 'linear',    // 放大时使用线性过滤
        minFilter: 'linear',    // 缩小时使用线性过滤
        mipmapFilter: 'linear', // Mipmap 过滤 (如果使用 mipmap)
        addressModeU: 'clamp-to-edge', // U 坐标超出范围时 clamp 到边缘
        addressModeV: 'clamp-to-edge', // V 坐标
        addressModeW: 'clamp-to-edge'  // W 坐标 (用于 3D 纹理)
    });

    return device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0), // 使用管线的第一个绑定组布局
        entries: [
            {
                binding: 0, // 对应 WGSL @binding(0)
                resource: textures.inputTexture.createView(), // 输入纹理视图
            },
            {
                binding: 1, // 对应 WGSL @binding(1)
                resource: textures.lutTexture.createView(),   // LUT 纹理视图
            },
            {
                binding: 2, // 对应 WGSL @binding(2)
                resource: textures.outputTexture.createView(),// 输出纹理视图
            },
            {
                binding: 3, // 对应 WGSL @binding(3)
                resource: lutSampler,                       // LUT 采样器
            },
            {
                binding: 4, // 对应 WGSL @binding(4)
                resource: { buffer: uniformBuffer },         // Uniform Buffer
            },
        ],
    });
} 