/**
 * 笔刷类型定义
 */
export const BRUSH_TYPES = {
    MARKER: 'marker', // 标记类（可能使用图像，但行为像标记笔）
    IMAGE: 'image',   // 基于图像样本的笔刷
    SHAPE: 'shape'    // 基于几何形状的笔刷
}

/**
 * 创建用于 UI 的工具按钮配置数组
 * @returns {Array<object>} 包含所有笔刷配置的数组
 */
export const createToolButtonConfigs = () => {
    return Object.entries(brushConfigs).map(([key, config]) => config)
}

/**
 * 尖头马克笔配置
 */
export const 尖头马克笔_config = {
    type: BRUSH_TYPES.IMAGE,
    opacity: 1, // 基础不透明度
    spacing: 1, // 笔触间距（相对于笔刷大小）
    sizeMultiplier: 10, // 基础大小乘数
    // usePigment: true, // 是否启用颜料混合（需要 WebGPU 支持）
    name: 'marker', // 内部名称
    label: '尖头马克笔', // UI 显示名称
    defaultColor: '#e24a4a', // 默认颜色
    defaultSize: 1, // 默认大小 (相对值)
    defaultOpacity: 0.6, // 默认不透明度
    brushSize: { width: 20, height: 20 }, // 笔刷样本图像的基础尺寸
    brushPath: '/plugins/SACAssetsManager/assets/brushes/marker.png' // 笔刷样本图像路径
}

/**
 * 宽头马克笔/荧光笔配置
 */
export const 宽头马克笔_config = {
    type: BRUSH_TYPES.IMAGE,
    opacity: 1 / 30, // 较低的基础不透明度以模拟叠加效果
    spacing: 5, // 较大的间距
    sizeMultiplier: 15,
    name: 'wideMaker',
    label: '荧光笔',
    defaultColor: '#f7d147',
    defaultSize: 1,
    defaultOpacity: 0.3,
    brushSize: { width: 30, height: 30 },
    brushPath: '/plugins/SACAssetsManager/assets/brushes/wide-marker.png',
    compositeOperation: 'multiply' // 使用正片叠底模拟荧光笔效果
}

/**
 * 水彩笔配置
 */
export const 水彩笔_config = {
    type: BRUSH_TYPES.IMAGE,
    opacity: 0.1, // 非常低的基础不透明度
    spacing: 0.08, // 非常小的间距以实现平滑过渡
    sizeMultiplier: 20,
    pressureSensitive: true, // 对压力敏感
    pickupEnabled: true, // 启用颜色沾染（高级功能，可能需要额外实现）
    pickupRadius: 20, // 沾染影响半径
    pickupDecay: 0.95, // 沾染衰减率
    flowEnabled: true, // 启用流动效果（可能需要额外实现）
    usePigment: true, // 启用颜料混合（需要 WebGPU 支持）
    name: 'watercolor',
    label: '水彩笔',
    defaultColor: '#4a90e2',
    defaultSize: 1,
    defaultOpacity: 0.2,
    brushSize: { width: 40, height: 40 },
    brushPath: '/plugins/SACAssetsManager/assets/brushes/watercolor.png',
    compositeOperation: 'multiply' // 水彩通常也使用类似乘法的混合
}

/**
 * 铅笔配置
 */
export const 铅笔_config = {
    type: BRUSH_TYPES.IMAGE,
    opacity: 1,
    spacing: 2,
    sizeMultiplier: 5,
    pressureSensitive: true,
    name: 'pencil',
    label: '铅笔',
    defaultColor: '#2c3e50',
    defaultSize: 1,
    defaultOpacity: 0.8,
    brushSize: { width: 10, height: 10 },
    brushPath: '/plugins/SACAssetsManager/assets/brushes/pencil.png'
}

/**
 * 钢笔配置 (形状笔刷)
 */
export const 钢笔_config = {
    type: BRUSH_TYPES.SHAPE,
    opacity: 1,
    spacing: 0.1, // 非常小的间距，接近连续线条
    shape: 'circle', // 形状为圆形
    sizeMultiplier: 1, // 大小直接由用户控制
    pressureSensitive: true, // 大小受压力影响
    name: 'pen',
    label: '钢笔',
    defaultColor: '#000000',
    defaultSize: 1,
    defaultOpacity: 1.0,
    brushSize: { width: 2, height: 2 } // 基础大小
}

/**
 * 鸭嘴笔配置 (形状笔刷)
 */
export const 鸭嘴笔_config = {
    type: BRUSH_TYPES.SHAPE,
    opacity: 1,
    spacing: 0.1,
    shape: 'rectangle', // 形状为矩形
    sizeMultiplier: 1,
    widthMultiplier: 4, // 宽度是基础大小的4倍
    heightMultiplier: 1, // 高度是基础大小的1倍
    angle: 45, // 固定角度
    pressureSensitive: false, // 大小通常不受压力影响
    name: 'flatBrush',
    label: '鸭嘴笔',
    defaultColor: '#000000',
    defaultSize: 1,
    defaultOpacity: 1.0,
    brushSize: { width: 8, height: 8 } // 基础大小
}

// --- 其他笔刷配置 (根据需要补充完整属性) ---

export const 毛笔_config = {
    type: BRUSH_TYPES.IMAGE,
    opacity: 0.7,
    spacing: 1,
    sizeMultiplier: 12,
    pressureSensitive: true,
    compositeOperation: 'source-over',
    inkFlow: 0.8, // 墨水流动效果
    spreadFactor: 1.2, // 笔触散开效果
    name: 'calligraphyBrush',
    label: '毛笔',
    brushPath: '/plugins/SACAssetsManager/assets/brushes/calligraphy.png' // 假设路径
    // ... 其他属性
}

export const 粉笔_config = {
    type: BRUSH_TYPES.IMAGE,
    opacity: 0.9,
    spacing: 3,
    sizeMultiplier: 8,
    compositeOperation: 'overlay', // 叠加混合模式模拟粉笔效果
    textureStrength: 0.8, // 纹理强度
    roughness: 0.6, // 粗糙度
    name: 'chalk',
    label: '粉笔',
    brushPath: '/plugins/SACAssetsManager/assets/brushes/chalk.png' // 假设路径
    // ... 其他属性
}

export const 油画笔_config = {
    type: BRUSH_TYPES.IMAGE,
    opacity: 0.95,
    spacing: 4,
    sizeMultiplier: 25,
    compositeOperation: 'hard-light', // 硬光模拟油画厚重感
    paintThickness: 0.8, // 颜料厚度（可能影响混合或纹理）
    blendFactor: 0.6, // 颜色混合因子
    bristleCount: 12, // 笔毛数量（可能影响纹理）
    name: 'oilPaint',
    label: '油画笔',
    brushPath: '/plugins/SACAssetsManager/assets/brushes/oil.png' // 假设路径
    // ... 其他属性
}

export const 喷枪_config = {
    type: BRUSH_TYPES.IMAGE,
    opacity: 0.05, // 很低的不透明度，多次叠加
    spacing: 1,
    sizeMultiplier: 30,
    compositeOperation: 'source-over',
    sprayRadius: 20, // 喷射半径
    falloff: 0.7, // 衰减度
    density: 0.8, // 密度
    name: 'airbrush',
    label: '喷枪',
    brushPath: '/plugins/SACAssetsManager/assets/brushes/airbrush.png' // 假设路径
    // ... 其他属性
}

export const 蜡笔_config = {
    type: BRUSH_TYPES.SHAPE,
    opacity: 0.9,
    spacing: 2,
    shape: 'rectangle',
    widthMultiplier: 3,
    heightMultiplier: 0.8,
    texturePattern: 'grainy', // 纹理模式
    pressureVariation: 0.3, // 压力变化影响（可能影响颜色深浅或纹理）
    edgeRoughness: 0.4, // 边缘粗糙度
    name: 'crayon',
    label: '蜡笔',
    // ... 其他属性
}

export const 针管笔_config = {
    type: BRUSH_TYPES.SHAPE,
    opacity: 1,
    spacing: 0.2,
    shape: 'circle',
    smoothing: 0.9, // 线条平滑度
    minWidth: 0.5, // 最小宽度
    maxWidth: 2, // 最大宽度（受压力影响）
    inkFlow: 0.95, // 墨水流动模拟
    pressureSensitive: true,
    name: 'technicalPen',
    label: '针管笔',
    // ... 其他属性
}

/**
 * 将所有笔刷配置聚合到一个对象中
 */
export const brushConfigs = {
    尖头马克笔: 尖头马克笔_config,
    宽头马克笔: 宽头马克笔_config,
    水彩笔: 水彩笔_config,
    铅笔: 铅笔_config,
    钢笔: 钢笔_config,
    鸭嘴笔: 鸭嘴笔_config,
    毛笔: 毛笔_config,
    粉笔: 粉笔_config,
    油画笔: 油画笔_config,
    喷枪: 喷枪_config,
    蜡笔: 蜡笔_config,
    针管笔: 针管笔_config
} 