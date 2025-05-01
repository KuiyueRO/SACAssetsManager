import { getImageFromURL } from '../../../feature/forImageLoading/fromURL.js'; // 确认路径
import { useSharp } from '../../base/useDeps/useSharp.js'; // 假设 Sharp 依赖封装
import { brushConfigs } from './brushes/configs.js';
import { brushImageProcessor } from './brushes/useBrushSampler.js'; // Updated import path

// 缓存处理过的笔刷图像 { [toolName_color_opacity]: processedImage }
const processedBrushCache = new Map();

/**
 * 加载并处理所有在配置中定义的笔刷样本图像。
 * @returns {Promise<Map<string, HTMLImageElement|ImageBitmap>>} 返回一个包含已加载和处理的基础笔刷样本的 Map。
 */
async function loadAndProcessBrushSamples() {
    const loadedSamples = new Map();
    const sharp = await useSharp(); // 获取 Sharp 实例
    if (!sharp) {
        console.error('Sharp 依赖未能加载，无法处理笔刷图像。');
        return loadedSamples;
    }

    try {
        const loadPromises = Object.entries(brushConfigs)
            .filter(([key, config]) => config.type === 'image' && config.brushPath)
            .map(async ([key, config]) => {
                try {
                    // 1. 加载原始图像
                    const originalImageBuffer = await sharp(config.brushPath).png().toBuffer(); // 确保是 buffer

                    // 2. 调整尺寸 (可选，如果需要统一基础尺寸)
                    let resizedBuffer = originalImageBuffer;
                    if (config.brushSize) {
                        resizedBuffer = await sharp(originalImageBuffer)
                            .resize(config.brushSize.width, config.brushSize.height, {
                                fit: 'contain',
                                background: { r: 0, g: 0, b: 0, alpha: 0 }
                            })
                            .png()
                            .toBuffer();
                    }

                    // 3. 转换为浏览器可用的格式 (ImageBitmap 或 HTMLImageElement)
                    // 注意：Node 环境的 Sharp buffer 不能直接在浏览器用，需要转换
                    // 这里假设有一个工具函数可以做到这一点，或者直接加载原始路径
                    // 暂时先直接加载原始路径，因为 Sharp 处理主要用于着色
                    const browserImage = await getImageFromURL(config.brushPath);
                    loadedSamples.set(config.name, browserImage); // 存储原始样本供后续处理
                    console.log(`加载笔刷样本: ${config.name}`);
                } catch (err) {
                    console.error(`加载或处理笔刷 ${config.name} (${config.brushPath}) 失败:`, err);
                }
            });
        await Promise.all(loadPromises);
    } catch (error) {
        console.error('加载笔刷样本过程中出错:', error);
    }
    return loadedSamples;
}

/**
 * 获取（或创建并缓存）特定颜色和透明度的处理后笔刷图像。
 * @param {string} toolName - 工具名称 (如 'marker', 'watercolor')
 * @param {string} color - 颜色值 (如 '#RRGGBB')
 * @param {number} opacity - 不透明度 (0-1)
 * @param {Map<string, HTMLImageElement|ImageBitmap>} baseSamples - 包含基础笔刷样本的 Map
 * @returns {Promise<HTMLImageElement|ImageBitmap|null>} 处理后的笔刷图像，如果失败则返回 null
 */
async function getProcessedBrush(toolName, color, opacity, baseSamples) {
    const config = brushConfigs[toolName];
    if (!config || config.type !== 'image') {
        return null; // 仅处理图像类型笔刷
    }

    const cacheKey = `${toolName}_${color}_${opacity.toFixed(2)}`;
    if (processedBrushCache.has(cacheKey)) {
        return processedBrushCache.get(cacheKey);
    }

    const baseSample = baseSamples.get(toolName);
    if (!baseSample) {
        console.error(`找不到工具 ${toolName} 的基础笔刷样本。`);
        return null;
    }

    try {
        // TODO: 这里的 brushImageProcessor 需要确认其实现和依赖
        // 它之前似乎直接依赖 Sharp，需要改造为使用 useSharp
        // 现在 useBrushSampler 内部已经使用了 useSharp
        const processedImage = await brushImageProcessor.processColoredBrush(
            config.brushPath, // 或者直接传递 baseSample Buffer？需要看 processor 实现
            color,
            opacity,
            {
                width: config.brushSize?.width, // 使用可选链
                height: config.brushSize?.height,
                effect: toolName === 'watercolor' ? 'watercolor' : null // 示例效果
            }
        );

        if (processedImage) {
            processedBrushCache.set(cacheKey, processedImage);
            return processedImage;
        } else {
            console.error(`处理笔刷 ${toolName} (${color}, ${opacity}) 失败。`);
            return null;
        }
    } catch (error) {
        console.error(`处理笔刷 ${toolName} 时出错:`, error);
        return null;
    }
}

/**
 * 清除处理后的笔刷缓存。
 */
function clearProcessedBrushCache() {
    processedBrushCache.clear();
    // Clear internal cache of brushImageProcessor as well
    brushImageProcessor.clearCache();
}

export const useBrushProcessor = {
    loadAndProcessBrushSamples,
    getProcessedBrush,
    clearProcessedBrushCache
}; 