/**
 * @fileoverview WebGPU Uniform Buffer 数据准备工具。
 * 将 JavaScript 对象格式化为符合 WGSL 内存布局和对齐规则的 ArrayBuffer。
 */

/**
 * WGSL 类型信息，包含大小（字节）和对齐要求（字节）。
 * 参考 WebGPU 标准布局规则 (例如 std140 的简化版本或 WebGPU 自身的布局规则)。
 * 注意：WebGPU 的具体布局规则可能比这里定义的更复杂，特别是对于数组和结构体嵌套。
 * 这个实现主要处理基本类型和向量的对齐。
 */
const WGSL_TYPE_INFO = {
    'f32': { size: 4, align: 4 },
    'i32': { size: 4, align: 4 },
    'u32': { size: 4, align: 4 }, // 添加 u32 支持
    'vec2f': { size: 8, align: 8 },
    'vec2i': { size: 8, align: 8 },
    'vec2u': { size: 8, align: 8 },
    'vec3f': { size: 12, align: 16 }, // vec3 对齐要求通常是 16
    'vec3i': { size: 12, align: 16 },
    'vec3u': { size: 12, align: 16 },
    'vec4f': { size: 16, align: 16 },
    'vec4i': { size: 16, align: 16 },
    'vec4u': { size: 16, align: 16 },
    // 可以在这里添加 mat 类型等
};

/**
 * 获取 WGSL 数据类型的默认值。
 * @param {string} type - WGSL 类型字符串。
 * @returns {number | number[] | null} 类型的默认值，未知类型返回 null。
 */
function getDefaultValueForType(type) {
    switch (type) {
        case 'f32': return 0.0;
        case 'i32': return 0;
        case 'u32': return 0;
        case 'vec2f': case 'vec2i': case 'vec2u': return [0, 0];
        case 'vec3f': case 'vec3i': case 'vec3u': return [0, 0, 0];
        case 'vec4f': case 'vec4i': case 'vec4u': return [0, 0, 0, 0]; 
        default: 
            console.warn(`未知的 WGSL 类型 "${type}"，无法获取默认值。`);
            return null;
    }
}

/**
 * 格式化 JavaScript 对象为符合 WebGPU Uniform Buffer 布局规则的 ArrayBuffer。
 * 
 * @param {Record<string, string>} uniformLayout - Uniform 布局定义对象。
 *                                                键是 uniform 变量名，值是 WGSL 类型字符串 (如 'f32', 'vec3f')。
 *                                                字段顺序必须与 WGSL 结构体中定义的顺序一致。
 * @param {Record<string, number | number[]>} params - 包含实际参数值的对象。
 *                                                      如果参数缺失，将使用对应类型的默认值。
 * @returns {ArrayBuffer | null} 包含格式化数据的 ArrayBuffer，可直接用于 writeBuffer。
 *                               如果布局或参数无效，可能返回 null。
 */
export function formatUniformBufferData(uniformLayout, params = {}) {
    if (typeof uniformLayout !== 'object' || uniformLayout === null) {
        console.error('formatUniformBufferData: uniformLayout 必须是一个对象。');
        return null;
    }

    const layoutEntries = Object.entries(uniformLayout);
    if (layoutEntries.length === 0) {
        console.warn('formatUniformBufferData: uniformLayout 为空。');
        return new ArrayBuffer(0); // 返回空 buffer
    }

    // 估算需要的总大小并处理对齐
    let currentOffset = 0;
    const fieldInfo = layoutEntries.map(([name, type]) => {
        const typeInfo = WGSL_TYPE_INFO[type];
        if (!typeInfo) {
            throw new Error(`formatUniformBufferData: 不支持的 WGSL 类型 "${type}" 在字段 "${name}" 中。`);
        }
        // 计算对齐后的偏移
        const align = typeInfo.align;
        const alignedOffset = Math.ceil(currentOffset / align) * align;
        const info = { name, type, ...typeInfo, offset: alignedOffset };
        currentOffset = alignedOffset + typeInfo.size;
        return info;
    });

    // 计算最终 buffer 大小 (需要按最大对齐项或 16 字节对齐？通常 Uniform Buffer 需要对齐到 16 或 256)
    // 这里简单地按最后一个元素的结束位置，并对齐到 16
    const totalSize = Math.ceil(currentOffset / 16) * 16; 
    if (totalSize === 0) {
         return new ArrayBuffer(0);
    }

    const buffer = new ArrayBuffer(totalSize);
    const dataView = new DataView(buffer);

    // 写入数据
    for (const { name, type, size, offset } of fieldInfo) {
        let value = params[name] ?? getDefaultValueForType(type);
        
        // 如果默认值获取失败（未知类型），跳过此字段
        if (value === null) continue;

        // 确保值是数组格式（对于向量）
        const isVector = type.startsWith('vec');
        if (isVector && !Array.isArray(value)) {
            console.warn(`formatUniformBufferData: 字段 "${name}" (${type}) 期望一个数组，但收到了 ${typeof value}。将使用默认值。`);
            value = getDefaultValueForType(type);
        }
        
        // 根据类型写入数据
        let elementsToWrite = [];
        let writeFunc = null;
        let elementSize = 4;

        switch (type) {
            case 'f32': 
                elementsToWrite = [value]; 
                writeFunc = dataView.setFloat32.bind(dataView);
                break;
            case 'i32': 
                elementsToWrite = [value]; 
                writeFunc = dataView.setInt32.bind(dataView);
                break;
             case 'u32': 
                elementsToWrite = [value]; 
                writeFunc = dataView.setUint32.bind(dataView);
                break;
            case 'vec2f': elementsToWrite = value.slice(0, 2); writeFunc = dataView.setFloat32.bind(dataView); break;
            case 'vec2i': elementsToWrite = value.slice(0, 2); writeFunc = dataView.setInt32.bind(dataView); break;
            case 'vec2u': elementsToWrite = value.slice(0, 2); writeFunc = dataView.setUint32.bind(dataView); break;
            case 'vec3f': elementsToWrite = value.slice(0, 3); writeFunc = dataView.setFloat32.bind(dataView); break; // size 12
            case 'vec3i': elementsToWrite = value.slice(0, 3); writeFunc = dataView.setInt32.bind(dataView); break;
            case 'vec3u': elementsToWrite = value.slice(0, 3); writeFunc = dataView.setUint32.bind(dataView); break;
            case 'vec4f': elementsToWrite = value.slice(0, 4); writeFunc = dataView.setFloat32.bind(dataView); break;
            case 'vec4i': elementsToWrite = value.slice(0, 4); writeFunc = dataView.setInt32.bind(dataView); break;
            case 'vec4u': elementsToWrite = value.slice(0, 4); writeFunc = dataView.setUint32.bind(dataView); break;
            default: 
                // 已在上面检查过，理论上不会到这里
                console.error(`formatUniformBufferData: 内部错误，无法处理类型 ${type}`);
                continue;
        }
        
        // 写入每个元素
        for (let i = 0; i < elementsToWrite.length; i++) {
            // 写入数据时需要指定 littleEndian (通常为 true)
            writeFunc(offset + i * elementSize, elementsToWrite[i], true);
        }
    }

    return buffer;
} 