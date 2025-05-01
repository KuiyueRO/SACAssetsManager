import { useSharp } from '../../base/useDeps/useSharp.js'; // Corrected import
import { fromHexToRgb, fromRgbToHex, fromRgbToHsl, fromHslToRgb } from "../../../base/forColor/colorSpace.js" // Adjusted path
import { computeMixedPigmentsRgb } from "../../../base/forColor/mixColor.js" // Adjusted path
import { fromURL } from "../../../base/useDeps/sharpInterface/useSharp/toSharp.js" // Adjusted path, assuming sharpInterface is under useDeps
import { 添加水彩效果, 创建纯色图片 } from "../../../base/useDeps/sharpInterface/useSharp/effect.js" // Adjusted path
import { GPU图像平均颜色分析器 } from "../../../feature/forImage/analyze/calculateAverage.js" // Adjusted path, assuming forImage is feature level
import { bufferToImageBitmap } from "../../../feature/forImage/toImage/buffer.js" // Adjusted path

const 计算不透明度级别 = (当前索引, 变体总数) => {
    return 0.4 + (1.2 * (当前索引 / (变体总数 - 1)))
}
// 计算噪声级别
const 计算噪声级别 = (当前索引, 变体总数) => {
    return 0.1 + (
        0.35 * (1 + Math.sin(当前索引 * Math.PI / (变体总数 / 4))) +
        (当前索引 / 变体总数) * 0.35
    )
}

const brushImageProcessor = {
    cache: new Map(),
    sharpCache: new Map(),
    currentBrush: null,
    processingQueue: new Map(),
    pickupHistory: [],
    flowEffects: {
        active: new Set(),
        gravity: 0.2,        // 保持重力
        tension: 0.4,        // 保持表面张力
        viscosity: 0.92,     // 保持粘度
        maxFlowDistance: 50, // 减小最大流动距离
        minOpacity: 0.05,    // 降低最小不透明度
    },

    // 添加节流控制
    lastPickupTime: 0,
    pickupThrottleInterval: 50, // 50ms 的节流间隔


    async processColoredBrush(brushImagePath, color, opacity, options = {}) {
        const cacheKey = `${brushImagePath}-${color}`

        // 检查缓存
        if (this.currentBrush?.cacheKey === cacheKey) {
            return this.currentBrush.variants
        }

        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey)
            this.currentBrush = {
                cacheKey,
                variants: cached,
                brushImagePath,
                opacity,
                options: { ...options }  // 保存完整的选项
            }
            return cached
        }

        if (this.processingQueue.has(cacheKey)) {
            return this.processingQueue.get(cacheKey)
        }

        const sharp = await useSharp(); // Get sharp instance
        if (!sharp) {
            console.error('Sharp dependency failed to load');
            throw new Error('Sharp dependency failed to load');
        }

        let processingPromise = (async () => {
            try {
                // 检查 Sharp 对象缓存
                let sharpObj
                if (this.sharpCache.has(brushImagePath)) {
                    sharpObj = this.sharpCache.get(brushImagePath).clone() // 克隆缓存的 Sharp 对象
                } else {
                    // Use the fromURL function which should internally use the sharp instance
                    sharpObj = await fromURL(sharp, brushImagePath) 
                    if(!sharpObj) throw new Error(`Failed to load image with Sharp: ${brushImagePath}`);
                    this.sharpCache.set(brushImagePath, sharpObj.clone()) // 存储一个克隆副本
                }

                const rgb = fromHexToRgb(color)
                if (!rgb) throw new Error('无效的颜色值')

                // 确保有有效的尺寸
                const width = options.width || 100
                const height = options.height || 100

                let alphaChannel = await sharpObj
                    .extractChannel(3)
                    .resize(width, height, {
                        fit: 'contain',
                        background: { r: 0, g: 0, b: 0, alpha: 0 }
                    })

                const variants = await this.generateVariants(alphaChannel, opacity, {
                    ...options,
                    rgb,
                    width,
                    height
                })

                // 保存完整的状态
                this.currentBrush = {
                    cacheKey,
                    variants,
                    brushImagePath,
                    opacity,
                    options: { ...options, width, height }
                }

                this.cache.set(cacheKey, variants)
                return variants
            } catch (error) {
                console.error('处理笔刷图片失败:', error)
                throw error // Re-throw the error after logging
            } finally {
                if (this.processingQueue.get(cacheKey) === processingPromise) {
                    this.processingQueue.delete(cacheKey)
                }
            }
        })()

        this.processingQueue.set(cacheKey, processingPromise)
        return await processingPromise
    },



    clearCache() {
        this.cache.clear()
        this.sharpCache.clear()
        this.currentBrush = null
        this.processingQueue.clear()
    },

    async generateVariants(alphaChannel, opacity, options) {
        const { rgb } = options
        const variants = []
        const variantCount = 5
        let currentIndex = 0
        await this.generateInitialVariants(variants, alphaChannel, opacity, options, 5)
        const generateRemainingVariants = async (deadline) => {
            while (currentIndex < variantCount && deadline.timeRemaining() > 0) {
                const opacityLevel = 计算不透明度级别(currentIndex, variantCount)
                const noiseLevel = 计算噪声级别(currentIndex, variantCount)

                try {
                    const variant = await this.processBaseImage(
                        alphaChannel,
                        opacity * opacityLevel,
                        {
                            ...options,
                            rgb,
                            effect: 'watercolor',
                            noiseLevel
                        }
                    )
                    variants.push(variant)
                } catch (error) {
                    console.error('生成变体失败:', error)
                }

                currentIndex++
            }

            // 如果还有变体需要生成，继续请求闲时回调
            if (currentIndex < variantCount) {
                requestIdleCallback(generateRemainingVariants)
            }
        }
        requestIdleCallback(generateRemainingVariants)
        const getRandomVariant = () => {
            return variants[Math.floor(Math.random() * variants.length)]
        }
        return {
            variants,
            getRandomVariant,
            isComplete: () => currentIndex >= variantCount,
            getProgress: () => currentIndex / variantCount
        }
    },

    // 生成初始变体的辅助方法
    async generateInitialVariants(variants, alphaChannel, opacity, options, count) {
        const { rgb } = options
        const variantCount = 5
        for (let i = 0; i < count; i++) {
            const opacityLevel = 0.4 + (1.2 * (i / (variantCount - 1)))
            const noiseLevel = 0.1 + (
                0.35 * (1 + Math.sin(i * Math.PI / (variantCount / 4))) +
                (i / variantCount) * 0.35
            )
            const variant = await this.processBaseImage(
                alphaChannel,
                opacity * opacityLevel,
                {
                    ...options,
                    rgb,
                    effect: 'watercolor',
                    noiseLevel
                }
            )
            variants.push(variant)
        }
    },

    async processBaseImage(alphaChannel, opacity, options) {
        const { width, height, rgb } = options
        const sharp = await useSharp(); // Get sharp instance again for effects
        if (!sharp) {
            throw new Error('Sharp dependency failed to load for processBaseImage');
        }

        if (!width || !height) {
            throw new Error('必须指定有效的宽度和高度')
        }

        let processedAlpha
        if (options.effect === 'watercolor') {
            // Pass sharp instance to the effect function
            processedAlpha = await 添加水彩效果(sharp, alphaChannel, opacity, options) 
        } else {
            processedAlpha = await alphaChannel.linear(opacity, 0) // Assuming alphaChannel is a sharp object
        }

        // Pass sharp instance to the image creation function
        const buffer = await 创建纯色图片(sharp, rgb, processedAlpha, options) 
        return await bufferToImageBitmap(buffer) // Assuming bufferToImageBitmap works with the buffer from 创建纯色图片
    },

    // 修改: 记录沾染事件
    async recordPickup(timestamp, position, ctx, pressure) {
        // 添加节流控制
        if (timestamp - this.lastPickupTime < this.pickupThrottleInterval) {
            return false;
        }
        this.lastPickupTime = timestamp;

        const RADIUS = 5
        const SIZE = RADIUS * 2
        const x = Math.max(0, Math.floor(position.x - RADIUS))
        const y = Math.max(0, Math.floor(position.y - RADIUS))
        const 颜色分析器 = await this.getGPUAnalyzer()
        try {
            const imageData = ctx.getImageData(x, y, SIZE, SIZE)
            const { 平均颜色: color, 平均透明度: averageAlpha } = await 颜色分析器.计算平均颜色(
                imageData.data,
                SIZE,
                SIZE
            )
            if (averageAlpha <= 0.15) return false
            const historyEntry = {
                timestamp,
                position: { x: position.x, y: position.y },
                color,
                pressure: Math.min(pressure, 1),
                alpha: Math.min(averageAlpha, 0.9)
            }
            this.pickupHistory.unshift(historyEntry)
            this.pickupHistory.length = Math.min(this.pickupHistory.length, 10) // 减少历史记录长度
            return averageAlpha > 0.3
                ? Promise.all([
                    this.updateBrushVariants(color), // 更新变体颜色
                    this.addFlowEffect(position, color, pressure)
                ])
                : false
        } catch (error) {
            console.error('颜色沾染失败:', error)
            return false
        } finally {
            this._ensureCleanup()
        }
    },

    // 确保 GPU 资源被清理
    async getGPUAnalyzer() {
        if (!this.gpuAnalyzer) {
            this.gpuAnalyzer = new GPU图像平均颜色分析器()
            await this.gpuAnalyzer.init()
        }
        return this.gpuAnalyzer
    },
    _ensureCleanup() {
        if (this.cleanupTimeout) {
            clearTimeout(this.cleanupTimeout)
        }
        this.cleanupTimeout = setTimeout(() => {
            if (this.gpuAnalyzer) {
                this.gpuAnalyzer.destroy()
                this.gpuAnalyzer = null
                console.log('GPU Analyzer cleaned up due to inactivity.')
            }
            // 清理流动效果等其他资源
            this.flowEffects.active.clear();
            if (this.flowAnimationId) {
                cancelAnimationFrame(this.flowAnimationId);
                this.flowAnimationId = null;
            }
        }, 30000) // 30秒无活动后清理
    },

    // 更新笔刷变体以反映沾染的颜色
    async processPickupEffects() {
        if (this.pickupHistory.length === 0) return;

        // 计算混合颜色（简化：取最近一次沾染）
        const latestPickup = this.pickupHistory[0];
        const mixedColor = computeMixedPigmentsRgb(this.currentBrush.options.rgb, latestPickup.color, latestPickup.alpha); // 假设有颜色混合函数
        
        // TODO: 需要一种更精细的方式来更新变体，而不是重新生成所有变体
        // 暂时先用混合后的颜色重新生成
        if (this.currentBrush) {
            await this.updateBrushVariants(mixedColor);
        }
    },

    async updateBrushVariants(mixedColor) {
         const sharp = await useSharp();
        if (!sharp || !this.currentBrush) return; // 确保 Sharp 和当前笔刷存在

        const { brushImagePath, opacity, options } = this.currentBrush;
        const cacheKey = `${brushImagePath}-${fromRgbToHex(mixedColor)}`; // 使用新颜色生成 cacheKey

        // 检查是否已有此颜色的缓存
        if (this.cache.has(cacheKey)) {
            this.currentBrush.variants = this.cache.get(cacheKey);
            return; // 直接使用缓存
        }

        // 如果正在处理这个颜色，等待完成
        if (this.processingQueue.has(cacheKey)) {
            await this.processingQueue.get(cacheKey);
             if (this.cache.has(cacheKey)) {
                this.currentBrush.variants = this.cache.get(cacheKey);
             }
            return;
        }

        // 需要重新生成变体
        console.log(`Updating brush variants for color: ${fromRgbToHex(mixedColor)}`);
        let updatePromise = (async () => {
            try {
                let sharpObj = this.sharpCache.get(brushImagePath)?.clone();
                if (!sharpObj) {
                     sharpObj = await fromURL(sharp, brushImagePath);
                     if (!sharpObj) throw new Error(`Failed to load base image for variant update: ${brushImagePath}`);
                     this.sharpCache.set(brushImagePath, sharpObj.clone());
                }

                let alphaChannel = await sharpObj.extractChannel(3).resize(options.width, options.height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });

                const newVariants = await this.generateVariants(alphaChannel, opacity, {
                    ...options,
                    rgb: mixedColor, // 使用混合后的颜色
                });

                this.cache.set(cacheKey, newVariants);
                this.currentBrush.variants = newVariants;
                this.currentBrush.cacheKey = cacheKey; // 更新当前笔刷的 cacheKey

            } catch (error) {
                console.error('更新笔刷变体失败:', error);
            } finally {
                 if (this.processingQueue.get(cacheKey) === updatePromise) {
                    this.processingQueue.delete(cacheKey);
                 }
            }
        })();
        this.processingQueue.set(cacheKey, updatePromise);
        await updatePromise;
    },
    
    addFlowEffect(position, color, pressure, options = {}) {
        const flowEffect = {
            id: Date.now() + Math.random(),
            droplets: [],
            createdAt: Date.now(),
            initialPressure: pressure,
            baseColor: color,
            ...options // 允许覆盖默认参数
        };

        // 根据压力和配置创建初始水滴
        const initialDroplets = Math.ceil(pressure * 5); // 示例：压力越大，初始水滴越多
        this.addDroplets(flowEffect, initialDroplets, position, color, pressure * 0.8);

        this.flowEffects.active.add(flowEffect);
        if (!this.flowAnimationId) {
            this.startFlowAnimation();
        }
    },

    addDroplets(flowEffect, count, centerPos, baseColor, initialOpacity) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * 5; // 初始扩散半径
            flowEffect.droplets.push({
                x: centerPos.x + Math.cos(angle) * radius,
                y: centerPos.y + Math.sin(angle) * radius,
                vx: (Math.random() - 0.5) * 0.5, // 初始速度
                vy: (Math.random() - 0.5) * 0.5 + this.flowEffects.gravity * 0.2, // 加一点初始重力影响
                opacity: initialOpacity * (0.5 + Math.random() * 0.5), // 随机化初始透明度
                size: 2 + Math.random() * 3, // 初始大小
                color: baseColor, // 初始颜色
                life: 1.0, // 生命周期
                canSplit: true, // 是否可以分裂
                splitCooldown: 10 // 分裂冷却时间
            });
        }
    },
    
    startFlowAnimation() {
        if (this.flowAnimationId) return;
        const animate = () => {
            if (this.flowEffects.active.size === 0) {
                this.flowAnimationId = null;
                return; // 没有活动效果，停止动画
            }
            this.updateFlowEffects();
            // TODO: 需要获取当前的 Canvas Context 来进行绘制
            // this.renderFlowEffects(currentContext); 
            this.flowAnimationId = requestAnimationFrame(animate);
        };
        this.flowAnimationId = requestAnimationFrame(animate);
    },

    updateFlowEffects() {
        const now = Date.now();
        const activeEffects = this.flowEffects.active;
        const gravity = this.flowEffects.gravity;
        const tension = this.flowEffects.tension;
        const viscosity = this.flowEffects.viscosity;
        const maxFlowDistance = this.flowEffects.maxFlowDistance;
        const minOpacity = this.flowEffects.minOpacity;

        activeEffects.forEach(effect => {
            effect.droplets = effect.droplets.filter(droplet => {
                // 应用重力
                droplet.vy += gravity * 0.016; // 假设 60fps

                // 应用粘滞力/阻力
                droplet.vx *= viscosity;
                droplet.vy *= viscosity;
                
                // 更新位置
                droplet.x += droplet.vx;
                droplet.y += droplet.vy;
                
                // 模拟表面张力（使水滴趋向于聚集，简化模型）
                // let centerForceX = (effect.droplets[0]?.x || droplet.x) - droplet.x;
                // let centerForceY = (effect.droplets[0]?.y || droplet.y) - droplet.y;
                // droplet.vx += centerForceX * tension * 0.001;
                // droplet.vy += centerForceY * tension * 0.001;

                // 生命周期衰减 & 透明度降低
                droplet.life -= 0.005; // 示例衰减率
                droplet.opacity = Math.max(minOpacity, droplet.opacity * 0.995);
                
                // 检查是否超出最大流动距离（简化）
                // const distSq = (droplet.x - effect.droplets[0]?.x)^2 + (droplet.y - effect.droplets[0]?.y)^2;
                // if (distSq > maxFlowDistance * maxFlowDistance) droplet.life = 0;
                
                // 水滴分裂逻辑
                if (droplet.canSplit && droplet.life < 0.7 && droplet.splitCooldown <= 0 && Math.random() < 0.05) {
                    this.splitDroplet(effect, droplet);
                    droplet.canSplit = false; // 分裂一次后不再分裂
                }
                droplet.splitCooldown = Math.max(0, droplet.splitCooldown -1);

                return droplet.life > 0 && droplet.opacity > minOpacity;
            });

            if (effect.droplets.length === 0) {
                activeEffects.delete(effect);
            }
        });
    },

    splitDroplet(effect, parentDroplet) {
        const numNewDroplets = 2 + Math.floor(Math.random() * 2); // 分裂成 2-3 个新水滴
        for (let i = 0; i < numNewDroplets; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 0.5;
            effect.droplets.push({
                x: parentDroplet.x,
                y: parentDroplet.y,
                vx: parentDroplet.vx + Math.cos(angle) * speed,
                vy: parentDroplet.vy + Math.sin(angle) * speed,
                opacity: parentDroplet.opacity * (0.6 + Math.random() * 0.3), // 新水滴透明度略低
                size: parentDroplet.size * (0.5 + Math.random() * 0.3), // 新水滴更小
                color: parentDroplet.color,
                life: parentDroplet.life * (0.7 + Math.random() * 0.2), // 生命周期缩短
                canSplit: false, // 新分裂出的不再分裂
                splitCooldown: 0
            });
        }
    },

    renderFlowEffects(ctx) {
        if (!ctx) return;
        ctx.save();
        ctx.globalCompositeOperation = 'source-over'; // 或者适合水彩的混合模式

        this.flowEffects.active.forEach(effect => {
            effect.droplets.forEach(droplet => {
                ctx.beginPath();
                ctx.arc(droplet.x, droplet.y, droplet.size, 0, Math.PI * 2);
                const gradient = ctx.createRadialGradient(droplet.x, droplet.y, 0, droplet.x, droplet.y, droplet.size);
                const [r, g, b] = droplet.color;
                gradient.addColorStop(0, `rgba(${r},${g},${b},${droplet.opacity * 0.8})`); // 中心更实
                gradient.addColorStop(1, `rgba(${r},${g},${b},0)`); // 边缘羽化
                ctx.fillStyle = gradient;
                // ctx.fillStyle = `rgba(${droplet.color[0]}, ${droplet.color[1]}, ${droplet.color[2]}, ${droplet.opacity})`;
                ctx.fill();
            });
        });

        ctx.restore();
    },

}

// Export the processor object
export { brushImageProcessor }; 