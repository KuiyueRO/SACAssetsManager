import { brushImageProcessor } from './useBrushSampler.js'
import { mixer } from '../useWebGpu/useGpuMixer.js'
import { brushConfigs, BRUSH_TYPES } from './configs.js'
import { drawCircle, drawRectangle } from '../useDrawingUtils.js'

/**
 * 工厂函数：根据配置创建笔刷绘制函数
 * @param {object} config - 笔刷配置对象
 * @returns {function} - 笔刷绘制函数
 */
const createBrush = (config) => {
    // console.log(config)
    return async (ctx, brushSamples, startX, startY, endX, endY, color, size, opacity, pressure = 1, velocity = 0) => {
        ctx.save()
        try {
            const dx = endX - startX
            const dy = endY - startY
            const distance = Math.sqrt(dx * dx + dy * dy)
            const angle = Math.atan2(dy, dx)
            const effectiveSize = calculateEffectiveSize(config, size, pressure)
            const effectiveOpacity = calculateEffectiveOpacity(config, opacity, pressure, velocity)
            ctx.globalAlpha = effectiveOpacity
            if (config.compositeOperation) {
                ctx.globalCompositeOperation = config.compositeOperation
            }
            if (config.type === BRUSH_TYPES.SHAPE) {
                drawShapeBrush(ctx, config, startX, startY, endX, endY, effectiveSize)
            } else {
                const sample = selectBrushSample(brushSamples, pressure, velocity, config)
                if (sample) {
                    await drawImageBrush(ctx, sample, config, startX, startY, distance, angle, effectiveSize)
                } else {
                    console.error('无效的笔刷样本')
                }
            }
        } catch (error) {
            console.error('笔刷绘制失败:', error)
        } finally {
            ctx.restore()
        }
    }
}

/**
 * 根据压力、速度和配置选择合适的笔刷样本
 * @param {object} samples - 包含笔刷样本的对象或数组
 * @param {number} pressure - 压力值 (0-1)
 * @param {number} velocity - 速度值
 * @param {object} config - 笔刷配置
 * @returns {ImageBitmap|HTMLImageElement|null} - 选中的笔刷样本
 */
function selectBrushSample(samples, pressure, velocity, config) {

    if (config.type === BRUSH_TYPES.SHAPE) {
        return null; // 形状笔刷不需要样本
    }

    if (!samples) {
        console.error('笔刷样本为空')
        return null
    }

    // 新的变体系统 (variants 数组)
    if (samples.variants && Array.isArray(samples.variants)) {
        const intensityFactor = pressure * (1 + velocity * 0.2) // 综合考虑压力和速度
        // 随机选择一个变体，强度越高，越倾向于后面的变体（如果设计如此）
        const index = Math.min(
            samples.variants.length - 1,
            Math.floor(Math.random() * samples.variants.length + intensityFactor * 2) // 示例性计算，可调整
        )
        const selectedSample = samples.variants[index] || samples.variants[0] // Fallback
        return selectedSample
    }

    // 向后兼容旧系统 (单个 base 样本)
    const sample = samples.base || samples // 如果 samples 不是对象而是直接的样本
    return sample
}

/**
 * 计算笔刷的有效大小 (考虑基础大小、压力敏感度)
 * @param {object} config - 笔刷配置
 * @param {number} size - 用户设置的基础大小
 * @param {number} pressure - 压力值
 * @returns {number} - 最终绘制时的大小
 */
function calculateEffectiveSize(config, size, pressure) {
    const baseSize = size * config.sizeMultiplier
    return config.pressureSensitive ? baseSize * pressure : baseSize
}

/**
 * 计算笔刷的有效不透明度 (考虑基础不透明度、压力、速度、墨水流动等)
 * @param {object} config - 笔刷配置
 * @param {number} opacity - 用户设置的基础不透明度
 * @param {number} pressure - 压力值
 * @param {number} velocity - 速度值
 * @returns {number} - 最终绘制时的不透明度
 */
function calculateEffectiveOpacity(config, opacity, pressure, velocity) {
    let effectiveOpacity = opacity * config.opacity

    // 模拟墨水流动效果（速度快时可能变淡）
    if (config.inkFlow) {
        effectiveOpacity *= (1 - Math.random() * config.inkFlow * velocity)
    }

    // 如果需要，可以在这里加入压力对不透明度的影响
    // if (config.opacityPressureSensitive) { ... }

    return Math.max(0, Math.min(1, effectiveOpacity)); // 确保在 0-1 范围
}

/**
 * 绘制使用图像样本的笔刷笔触 (分段绘制)
 * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
 * @param {ImageBitmap|HTMLImageElement} sample - 笔刷样本图像
 * @param {object} config - 笔刷配置
 * @param {number} startX - 起始点 X
 * @param {number} startY - 起始点 Y
 * @param {number} distance - 笔触长度
 * @param {number} angle - 笔触角度
 * @param {number} effectiveSize - 计算后的有效大小
 */
async function drawImageBrush(ctx, sample, config, startX, startY, distance, angle, effectiveSize) {
    const spacing = config.spacing * effectiveSize
    const numPoints = Math.max(1, Math.floor(distance / spacing)) // 至少绘制一个点

    // 如果距离小于等于一个间距，只绘制一个点
    if (numPoints <= 1) {
        await drawBrushPoint(ctx, sample, startX, startY, angle, effectiveSize, config)
        return
    }

    const drawOperations = []
    for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints
        const x = startX + (distance * t * Math.cos(angle))
        const y = startY + (distance * t * Math.sin(angle))

        // 添加随机抖动
        const jitter = config.jitter || 0
        const offsetX = jitter ? (Math.random() - 0.5) * jitter * effectiveSize : 0
        const offsetY = jitter ? (Math.random() - 0.5) * jitter * effectiveSize : 0

        // 计算每个点的旋转角度 (基础角度 + 随机角度抖动)
        let pointAngle = angle
        if (config.angleJitter) {
            pointAngle += (Math.random() - 0.5) * config.angleJitter
        }

        // 异步绘制每个点（如果 drawBrushPoint 是异步的）
        drawOperations.push(
            drawBrushPoint(
                ctx,
                sample,
                x + offsetX,
                y + offsetY,
                pointAngle,
                effectiveSize,
                config
            )
        )
    }

    // 等待所有点绘制完成（如果是异步的）
    // 注意：如果点非常多且绘制复杂，可以考虑分批 await 或其他优化
    await Promise.all(drawOperations);
}

/**
 * 在指定位置绘制单个笔刷点
 * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
 * @param {ImageBitmap|HTMLImageElement|null} sample - 笔刷样本图像 (形状笔刷为 null)
 * @param {number} x - 绘制中心点 X
 * @param {number} y - 绘制中心点 Y
 * @param {number} angle - 旋转角度
 * @param {number} size - 笔刷大小
 * @param {object} config - 笔刷配置
 */
async function drawBrushPoint(ctx, sample, x, y, angle, size, config) {
    const width = size * (config.widthMultiplier || 1)
    const height = size * (config.heightMultiplier || 1)
    try {
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(angle + (config.angle || 0) * Math.PI / 180) // 应用基础旋转和动态旋转

        // 处理随机散布效果
        if (config.spreadFactor) {
            const spread = size * config.spreadFactor * Math.random()
            ctx.translate(spread * (Math.random() - 0.5), spread * (Math.random() - 0.5))
        }

        // 处理笔刷纹理效果（随机降低透明度模拟）
        if (config.textureStrength) {
            ctx.globalAlpha *= (1 - Math.random() * config.textureStrength)
        }

        if (config.type === BRUSH_TYPES.SHAPE) {
            // 几何形状笔刷直接绘制
            switch (config.shape) {
                case 'circle':
                    drawCircle(ctx, width) // Pass diameter (width)
                    break
                case 'rectangle':
                    drawRectangle(ctx, width, height) // Pass width and height for centered rect
                    break
                // 可以添加更多形状
                default:
                    drawCircle(ctx, width) // Default to circle with diameter
            }
        } else if (sample) {
            // 图像样本笔刷
            const transform = ctx.getTransform()
            ctx.resetTransform() // 重置变换以便在世界坐标系下操作
            const transformedX = transform.e - width / 2 // 计算左上角 X
            const transformedY = transform.f - height / 2 // 计算左上角 Y

            if(config.usePigment && mixer){ // 检查 mixer 是否可用
                // 使用 GPU 混合颜色 (需要 mixer 模块)
                // 注意: 大量 await 可能影响性能，考虑是否可以批量处理或非阻塞
                await mixer.mixColors(ctx, sample, transformedX, transformedY, width, height)
            } else {
                // 常规绘制图像样本
                ctx.drawImage(sample, transformedX, transformedY, width, height)
            }
        }
    } catch (error) {
        console.error('绘制笔刷点失败:', error)
    } finally {
        ctx.restore()
    }
}

/**
 * 绘制形状笔刷的笔触 (分段绘制)
 * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
 * @param {object} config - 笔刷配置
 * @param {number} startX - 起始点 X
 * @param {number} startY - 起始点 Y
 * @param {number} endX - 结束点 X
 * @param {number} endY - 结束点 Y
 * @param {number} effectiveSize - 计算后的有效大小
 */
function drawShapeBrush(ctx, config, startX, startY, endX, endY, effectiveSize) {
    const dx = endX - startX
    const dy = endY - startY
    const distance = Math.sqrt(dx * dx + dy * dy)
    const angle = Math.atan2(dy, dx)
    const spacing = config.spacing * effectiveSize
    const numPoints = Math.max(1, Math.floor(distance / spacing))

    // Set fillStyle once before drawing points for shape brushes
    // Assuming color is passed via ctx properties like fillStyle or strokeStyle setup before calling the main brush function
    // If color needs to be explicitly passed, the signature of drawShapeBrush and drawBrushPoint needs adjustment.
    // Example: ctx.fillStyle = ctx.canvas.fillStyle; // Or some other way color is managed

    if (numPoints <= 1) {
        drawBrushPoint(ctx, null, startX, startY, angle, effectiveSize, config) // sample 为 null
        return
    }

    for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints
        const x = startX + (distance * t * Math.cos(angle))
        const y = startY + (distance * t * Math.sin(angle))
        drawBrushPoint(ctx, null, x, y, angle, effectiveSize, config) // sample 为 null
    }
}

/**
 * 导出各种预设的笔刷绘制函数
 */
export const 尖头马克笔 = createBrush(brushConfigs.尖头马克笔)
export const 宽头马克笔 = createBrush(brushConfigs.宽头马克笔)
export const 水彩笔 = createBrush(brushConfigs.水彩笔)
export const 铅笔 = createBrush(brushConfigs.铅笔)
export const 钢笔 = createBrush(brushConfigs.钢笔)
export const 鸭嘴笔 = createBrush(brushConfigs.鸭嘴笔)
export const 毛笔 = createBrush(brushConfigs.毛笔)
export const 粉笔 = createBrush(brushConfigs.粉笔)
export const 油画笔 = createBrush(brushConfigs.油画笔)
export const 喷枪 = createBrush(brushConfigs.喷枪)
export const 蜡笔 = createBrush(brushConfigs.蜡笔)
export const 针管笔 = createBrush(brushConfigs.针管笔)

// TODO: brushImageProcessor 的导出和使用需要重新评估，它似乎与 Sharp 耦合较深。
// 如果笔刷处理逻辑移到 feature 层，这里可能不需要导出它。
export { brushImageProcessor } from './useBrushSampler.js' // 暂时保留，待确认 