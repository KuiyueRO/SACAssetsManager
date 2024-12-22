import { ARTBOARD } from '../utils/artboardPosition.js'
import { rectLayer } from '../layers/rectLayer.js'
import { textLayer } from '../layers/textLayer.js'
import { gridLayer } from '../layers/gridLayer.js'
import { imageLayer } from '../layers/imageLayer.js'
import { adjustmentLayer } from '../layers/adjustmentLayer.js'

// 基础调整参数配置
const BASE_ADJUSTMENTS = [
  {
    key: 'x',
    label: 'X 坐标',
    component: 'NumberInput',
    min: -5000,
    max: 5000,
    step: 1
  },
  {
    key: 'y',
    label: 'Y 坐标',
    component: 'NumberInput',
    min: -5000,
    max: 5000,
    step: 1
  },
  {
    key: 'width',
    label: '宽度',
    component: 'NumberInput',
    min: 1,
    max: 5000,
    step: 1
  },
  {
    key: 'height',
    label: '高度',
    component: 'NumberInput',
    min: 1,
    max: 5000,
    step: 1
  },
  {
    key: 'rotation',
    label: '旋转',
    component: 'NumberInput',
    min: -360,
    max: 360,
    step: 1
  },
  {
    key: 'opacity',
    label: '不透明度',
    component: 'NumberInput',
    min: 0,
    max: 100,
    step: 1
  }
]

// 定义所有支持的图层类型及其配置
export const LAYER_TYPES = {
  rect: {
    ...rectLayer,
    group: 'shape' // 形状组
  },
  text: {
    ...textLayer,
    group: 'content' // 内容组
  },
  grid: {
    ...gridLayer,
    group: 'background' // 背景组
  },
  image: {
    ...imageLayer,
    group: 'content' // 内容组
  },
  adjustment: {
    ...adjustmentLayer,
    group: 'effect' // 效果组
  }
}

// 本地图层类型注册表
const localLayerTypes = new Map()

// 图层画廊预设项
export const galleryPresets = [
  // 添加文件夹类型
  { type: 'folder', name: '文件夹', icon: '📁', render: null }
]

// 默认图层名称映射
export const defaultLayerNames = {
  folder: '新建文件夹'
}

// 定义工具组配置
export const TOOL_GROUPS = {
  content: {
    name: '内容',
    icon: '📝',
    order: 1
  },
  shape: {
    name: '形状',
    icon: '⬡',
    order: 2
  },
  background: {
    name: '背景',
    icon: '🎨',
    order: 3
  },
  effect: {
    name: '效果',
    icon: '✨',
    order: 4
  }
}

// 注册新的图层类型
function registerLayerType(type, config) {
  if (localLayerTypes.has(type)) {
    console.warn(`图层类型 "${type}" 已存在，将被覆盖`)
  }
  
  // 合并基础调整参数和自定义调整参数
  const adjustments = [...BASE_ADJUSTMENTS]
  
  // 根据图层类型添加特定的调整参数
  if (config.adjustments?.length) {
    config.adjustments.forEach(adj => {
      // 检查是否已存在同名参数
      const existingIndex = adjustments.findIndex(a => a.key === adj.key)
      if (existingIndex >= 0) {
        // 如果存在，则用自定义配置覆盖
        adjustments[existingIndex] = { ...adjustments[existingIndex], ...adj }
      } else {
        // 如果不存在，则添加新参数
        adjustments.push(adj)
      }
    })
  }
  
  // 设置默认配置
  const defaultConfig = {
    x: ARTBOARD.WIDTH / 2,
    y: ARTBOARD.HEIGHT / 2,
    width: 200,
    height: 100,
    rotation: 0,
    opacity: 100,
    ...config.defaultConfig
  }
  
  const layerConfig = {
    name: config.name || '未命名图层',
    icon: config.icon || '❓',
    group: config.group || 'content', // 添加分组属性
    defaultConfig,
    adjustments,
    render: config.render || null,
    presets: config.presets || [] // 添加预设支持
  }
  
  localLayerTypes.set(type, layerConfig)

  // 更新画廊预设
  const presetIndex = galleryPresets.findIndex(preset => preset.type === type)
  const preset = {
    type,
    name: layerConfig.name,
    icon: layerConfig.icon,
    render: layerConfig.render,
    adjustments: layerConfig.adjustments,
    defaultConfig: layerConfig.defaultConfig
  }
  
  if (presetIndex >= 0) {
    galleryPresets[presetIndex] = preset
  } else {
    galleryPresets.push(preset)
  }

  // 更新默认图层名称
  defaultLayerNames[type] = layerConfig.name
}

// 在文件开头初始化时加载默认图层类型
Object.entries(LAYER_TYPES).forEach(([type, config]) => {
  registerLayerType(type, config)
})

// 获取默认图层配置
export const getDefaultConfig = (type) => {
  const layerType = localLayerTypes.get(type)
  if (!layerType) return {}
  return { ...layerType.defaultConfig }
}

// 从加载器加载图层类型
export async function loadLayerTypesFromLoader(loader) {
  if (!loader || typeof loader.getLayerTypes !== 'function') {
    throw new Error('无效的加载器：缺少 getLayerTypes 方法')
  }

  try {
    const customLayerTypes = await loader.getLayerTypes()
    customLayerTypes.forEach(({ type, config }) => {
      registerLayerType(type, config)
    })
  } catch (error) {
    console.error('加载自定义图层类型时出错：', error)
    throw error
  }
}

// 从管线配置创建预设
export const createPresetFromPipe = (pipe) => {
  if (!pipe || !pipe.type) {
    throw new Error('无效的管线配置')
  }

  const layerType = localLayerTypes.get(pipe.type)
  const preset = galleryPresets.find(p => p.type === pipe.type)
  
  return {
    type: pipe.type,
    name: defaultLayerNames[pipe.type] || '未命名图层',
    icon: layerType?.icon || '❓',
    render: layerType?.render || null,
    adjustments: preset?.adjustments || layerType?.adjustments || [],
    config: {
      ...getDefaultConfig(pipe.type),
      ...pipe.config
    }
  }
}

// 修改获取分组预设的方法
export const getGroupPresets = (group) => {
  // 从所有已注册的图层类型中获取指定分组的预设
  const groupPresets = []
  for (const [type, config] of localLayerTypes.entries()) {
    if (config.group === group) {
      if (config.presets && config.presets.length) {
        // 如果有预设，处理每个预设
        const layerPresets = config.presets.map(preset => ({
          ...preset,
          layerType: type,
          type: 'file',
          config: {
            ...config.defaultConfig, // 合并图层类型的默认配置
            ...preset.config        // 允许预设覆盖默认值
          }
        }))
        groupPresets.push(...layerPresets)
      } else {
        // 如果没有预设，使用图层类型本身作为默认预设
        groupPresets.push({
          name: config.name,
          icon: config.icon,
          layerType: type,
          type: 'file',
          config: { ...config.defaultConfig }
        })
      }
    }
  }
  return groupPresets
}

// 修改获取图层类型配置的方法
export const getLayerTypeConfig = (type) => {
  return localLayerTypes.get(type) || LAYER_TYPES[type]
}
  