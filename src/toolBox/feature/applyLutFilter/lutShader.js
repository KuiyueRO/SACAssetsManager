/**
 * @fileoverview WebGPU 计算着色器 (WGSL)，用于应用 3D LUT。
 * @module lutShader
 */
export const lutShader = `
    struct Params {
        intensity: f32 // LUT 效果强度
    }

    // 绑定组 0
    @group(0) @binding(0) var inputTexture: texture_2d<f32>;           // 输入图像纹理
    @group(0) @binding(1) var lutTexture: texture_3d<f32>;             // 3D LUT 纹理 (32x32x32)
    @group(0) @binding(2) var outputTexture: texture_storage_2d<rgba8unorm, write>; // 输出图像纹理 (可写)
    @group(0) @binding(3) var lutSampler: sampler;                   // LUT 纹理采样器
    @group(0) @binding(4) var<uniform> params: Params;               // Uniform 参数 (效果强度)

    @compute @workgroup_size(8, 8) // 每个工作组处理 8x8 像素
    fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
        let dims = textureDimensions(inputTexture); // 获取输入纹理尺寸
        let coords = vec2<u32>(global_id.xy);      // 当前处理的像素坐标

        // 边界检查，防止越界访问
        if (coords.x >= dims.x || coords.y >= dims.y) {
            return;
        }

        // 加载原始像素颜色 (rgba)
        let originalColor = textureLoad(inputTexture, vec2<i32>(coords), 0);

        // 计算在 3D LUT 纹理中的采样坐标
        // (31.0/32.0) * (0.5/32.0) 是一种常见的中心采样方法，确保采样点落在 LUT 单元格中心
        // TODO: 应该根据实际 LUT size 调整，目前硬编码为 32
        let lutCoord = originalColor.rgb * (31.0/32.0) + (0.5/32.0);

        // 使用采样器从 LUT 纹理中采样颜色
        let lutColor = textureSampleLevel(lutTexture, lutSampler, lutCoord, 0.0);

        // 根据强度混合原始颜色和 LUT 颜色
        let newColor = mix(originalColor, lutColor, params.intensity);

        // 将混合后的颜色 (保留原始 alpha) 写入输出纹理
        textureStore(outputTexture, coords, vec4<f32>(newColor.rgb, originalColor.a));
    }
`; 