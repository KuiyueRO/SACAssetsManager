/**
 * @fileoverview 自动图像亮度/对比度调整 (类似于自动色阶/曝光)
 * 包含基于直方图分析和蒙特卡洛采样的复杂调整算法。
 * 迁移自 src/utils/image/adjust/exposure*.js，并根据方案 C 重构。
 */

// ------------------- 辅助函数 (部分借鉴自 exposure.js) ------------------- 

/**
 * 评估图像的有效动态范围（忽略少量极亮/极暗像素）。
 * @param {number[]} brightnessHistogram - 亮度直方图数组 (长度 256)。
 * @param {number} [confidence=0.95] - 用于确定忽略阈值的置信度。
 * @returns {number} 评估出的动态范围 (0-255)。
 */
function evaluateDynamicRange(brightnessHistogram, confidence = 0.95) {
    const totalPixels = brightnessHistogram.reduce((a, b) => a + b, 0);
    if (totalPixels === 0) return 0;
    // 计算需要忽略的像素数量阈值
    const ignoreThreshold = Math.max(1, Math.floor(totalPixels * (1 - confidence) / 2)); // 分摊到两端
    
    let cumulativeCount = 0;
    let minBrightness = 0;
    for (let i = 0; i < 256; i++) {
        cumulativeCount += brightnessHistogram[i];
        if (cumulativeCount > ignoreThreshold) {
            minBrightness = i;
            break;
        }
    }
    
    cumulativeCount = 0;
    let maxBrightness = 255;
    for (let i = 255; i >= 0; i--) {
        cumulativeCount += brightnessHistogram[i];
        if (cumulativeCount > ignoreThreshold) {
            maxBrightness = i;
            break;
        }
    }
    
    return Math.max(0, maxBrightness - minBrightness);
}

/**
 * 检测直方图中高光和阴影区域的像素比例（或数量）。
 * @param {number[]} brightnessHistogram - 亮度直方图。
 * @returns {{highlightPixels: number, shadowPixels: number}} 包含高光和阴影像素数量的对象。
 */
function detectHighlightsShadows(brightnessHistogram) {
    const highlightThreshold = 240;
    const shadowThreshold = 15;
    let highlightPixels = 0;
    let shadowPixels = 0;
    for (let i = highlightThreshold; i < 256; i++) {
        highlightPixels += brightnessHistogram[i];
    }
    for (let i = 0; i <= shadowThreshold; i++) {
        shadowPixels += brightnessHistogram[i];
    }
    return { highlightPixels, shadowPixels };
}

/**
 * 使用蒙特卡洛采样估算图像的平均亮度。
 * @param {Uint8ClampedArray} buffer - RGBA 像素数据。
 * @param {number} width - 图像宽度。
 * @param {number} height - 图像高度。
 * @param {number} [sampleCount=10000] - 采样点数量。
 * @returns {number} 估算的平均亮度 (0-255)。
 */
function estimateAverageBrightness(buffer, width, height, sampleCount = 10000) {
    const totalPixels = width * height;
    const actualSampleCount = Math.min(sampleCount, totalPixels);
    if (actualSampleCount === 0) return 128; // 避免除零

    let totalLuminance = 0;
    for (let i = 0; i < actualSampleCount; i++) {
        // 随机选择一个像素
        const randomPixelIndex = Math.floor(Math.random() * totalPixels);
        const bufferIndex = randomPixelIndex * 4;
        const r = buffer[bufferIndex];
        const g = buffer[bufferIndex + 1];
        const b = buffer[bufferIndex + 2];
        // 计算亮度
        const luminance = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        totalLuminance += luminance;
    }
    
    return totalLuminance / actualSampleCount;
}

/**
 * 蒙特卡洛采样，用于局部亮度分析。
 * @param {Uint8ClampedArray} buffer - RGBA 像素数据。
 * @param {number} width - 图像宽度。
 * @param {number} height - 图像高度。
 * @param {number} sampleCount - 采样数量。
 * @returns {Array<{r: number, g: number, b: number}>} 采样点颜色数组。
 */
function samplePixelsMonteCarlo(buffer, width, height, sampleCount) {
    const samples = [];
    const totalPixels = width * height;
    const actualSampleCount = Math.min(sampleCount, totalPixels);

    for (let i = 0; i < actualSampleCount; i++) {
        const randomPixelIndex = Math.floor(Math.random() * totalPixels);
        const bufferIndex = randomPixelIndex * 4;
        samples.push({
            r: buffer[bufferIndex],
            g: buffer[bufferIndex + 1],
            b: buffer[bufferIndex + 2]
        });
    }
    return samples;
}

/**
 * 评估局部动态范围（基于采样点的亮度分布）。
 * @param {Array<{r: number, g: number, b: number}>} samples - 采样点。
 * @param {number} numBins - 划分的亮度区间数量。
 * @returns {number} 评估出的局部动态范围。
 */
function evaluateLocalDynamicRange(samples, numBins = 16) {
    if (samples.length === 0) return 128; // 默认值
    const localBrightnessStats = new Array(numBins).fill(0);
    const binSize = 256 / numBins;

    for (const point of samples) {
        const brightness = Math.round(0.299 * point.r + 0.587 * point.g + 0.114 * point.b);
        const binIndex = Math.min(numBins - 1, Math.floor(brightness / binSize)); // 确保不越界
        localBrightnessStats[binIndex]++;
    }

    const totalSamples = samples.length;
    const effectiveBinThreshold = totalSamples * 0.02; // 2% 阈值

    let minBin = 0;
    for (let i = 0; i < numBins; i++) {
        if (localBrightnessStats[i] > effectiveBinThreshold) {
            minBin = i;
            break;
        }
    }

    let maxBin = numBins - 1;
    for (let i = numBins - 1; i >= 0; i--) {
        if (localBrightnessStats[i] > effectiveBinThreshold) {
            maxBin = i;
            break;
        }
    }

    // 返回估计的亮度范围 (0-255)
    return Math.max(binSize, (maxBin - minBin + 1) * binSize); 
}

/**
 * 计算局部调整系数。
 * @param {number} localDynamicRange - 评估出的局部动态范围。
 * @returns {number} 调整系数。
 */
function calculateLocalAdjustmentFactor(localDynamicRange) {
    const baselineDynamicRange = 128;
    // 避免除零
    const range = Math.max(1, localDynamicRange); 
    return Math.min(1.5, Math.max(0.5, baselineDynamicRange / range));
}

/**
 * 计算直方图方差 (借鉴自 exposure.js)。
 */
function calculateVariance(histogram, mean, totalPixels) {
    if (totalPixels === 0) return 0;
    let variance = 0;
    for (let i = 0; i < 256; i++) {
        variance += Math.pow(i - mean, 2) * histogram[i];
    }
    return variance / totalPixels;
}

/**
 * 分析直方图特征 (借鉴自 exposure.js)。
 */
function analyzeHistogramFeatures(histogram) {
    const totalPixels = histogram.reduce((a, b) => a + b, 0);
    if (totalPixels === 0) {
        return { mean: 128, variance: 0, dynamicRange: 0, highlights: 0, shadows: 0 };
    }

    let sum = 0;
    for (let i = 0; i < 256; i++) {
        sum += i * histogram[i];
    }
    const mean = sum / totalPixels;
    const variance = calculateVariance(histogram, mean, totalPixels);
    const dynamicRange = evaluateDynamicRange(histogram);
    const { highlightPixels, shadowPixels } = detectHighlightsShadows(histogram);

    return {
        mean,
        variance,
        dynamicRange,
        highlights: highlightPixels / totalPixels, // 返回比例
        shadows: shadowPixels / totalPixels,    // 返回比例
    };
}

/**
 * 根据图像分析结果设定目标曝光调整值 (借鉴并简化 exposure.js 逻辑)。
 */
function determineTargetExposure(features) {
    const { mean, variance, dynamicRange, highlights, shadows } = features;
    const idealMean = 128;
    const idealDynamicRange = 200;
    
    // 基于均值的调整
    const brightnessDiff = idealMean - mean;
    let targetExposure = brightnessDiff * 0.3; // 基础调整因子

    // 基于动态范围的调整
    if (dynamicRange < idealDynamicRange) {
        targetExposure += (idealDynamicRange - dynamicRange) * 0.05;
    }

    // 基于高光/阴影的调整 (使用比例)
    if (highlights > 0.01 && shadows < 0.01) { // 过曝倾向
        targetExposure -= highlights * 10; // 降低曝光
    } else if (shadows > 0.01 && highlights < 0.01) { // 欠曝倾向
        targetExposure += shadows * 10; // 增加曝光
    }

    // 基于方差微调 (低方差说明对比度低，可能需要增加调整)
    // if (variance < 2000) { // 阈值可调
    //     targetExposure *= 1.1;
    // }

    // 限制调整范围，例如 [-30, 30]
    return Math.max(-30, Math.min(30, targetExposure));
}


// ------------------- 核心调整函数 (已重构) -------------------

/**
 * 应用自动亮度/对比度调整算法。
 * 注意：此函数是计算密集型的，并且如果 iterations > 1，会依赖传入的 computeHistogramFunc。
 *
 * @param {ImageData} imageData - 输入的 ImageData 对象 (会被修改)。
 * @param {number[]} initialBrightnessHistogram - 初始的亮度直方图。
 * @param {Function} computeHistogramFunc - 一个异步函数，接收 ImageData，返回 Promise<{brightness: number[], ...} | null>。
 *                                         用于在迭代中重新计算直方图。
 * @param {object} [options={}] - 调整选项。
 * @param {number} [options.intensity=1.0] - 调整强度 (0-2)。
 * @param {number} [options.iterations=1] - 调整迭代次数。
 * @param {number} [options.sampleCount=50000] - 用于分析的蒙特卡洛采样点数量。
 * @returns {Promise<ImageData>} 返回调整后的 ImageData 对象 (注意：输入对象已被修改)。
 */
export async function applyAutoBrightnessContrast(imageData, initialBrightnessHistogram, computeHistogramFunc, options = {}) {
    const { intensity = 1.0, iterations = 1, sampleCount = 50000 } = options;
    // 验证输入
    if (!imageData || !(imageData.data instanceof Uint8ClampedArray) || !imageData.width || !imageData.height) {
        throw new Error('applyAutoBrightnessContrast: 无效的 ImageData 输入。');
    }
    if (!Array.isArray(initialBrightnessHistogram) || initialBrightnessHistogram.length !== 256) {
         throw new Error('applyAutoBrightnessContrast: 无效的 initialBrightnessHistogram 输入。');
    }
    if (iterations > 1 && typeof computeHistogramFunc !== 'function') {
         throw new Error('applyAutoBrightnessContrast: 当 iterations > 1 时，必须提供 computeHistogramFunc。');
    }

    const { data, width, height } = imageData;
    const totalPixels = width * height;
    const channels = 4; // Assume RGBA

    let currentBrightnessHistogram = [...initialBrightnessHistogram]; // 复制一份

    for (let iter = 0; iter < iterations; iter++) {
        console.log(`自动亮度/对比度调整 - 第 ${iter + 1} 次迭代`);
        const startTimeIter = performance.now();

        // 1. 计算累积分布函数 (CDF)
        const cdf = new Array(256).fill(0);
        cdf[0] = currentBrightnessHistogram[0];
        for (let i = 1; i < 256; i++) {
            cdf[i] = cdf[i - 1] + currentBrightnessHistogram[i];
        }
        const cdfMin = cdf.find(value => value > 0) || 0;
        // 防止除零，如果 totalPixels 等于 cdfMin (例如全黑图像的部分情况)
        const cdfRange = Math.max(1, totalPixels - cdfMin); 
        // if (cdfRange <= 0) {
        //      console.warn("CDF range is zero or negative, skipping pixel adjustment in this iteration.");
        //      // 这里不 break，允许后续分析和可能的 targetExposure 调整生效
        //      // 但基于 CDF 的调整会失效
        // }

        // 2. 蒙特卡洛采样与局部亮度分析
        const samples = samplePixelsMonteCarlo(data, width, height, sampleCount);
        const localDynamicRange = evaluateLocalDynamicRange(samples);
        const localAdjustmentFactor = calculateLocalAdjustmentFactor(localDynamicRange);

        // 3. 全局图像分析
        const globalDynamicRange = evaluateDynamicRange(currentBrightnessHistogram);
        const { highlightPixels, shadowPixels } = detectHighlightsShadows(currentBrightnessHistogram);
        const averageBrightness = estimateAverageBrightness(data, width, height, sampleCount);

        // 4. 设定目标曝光
        const targetExposure = determineTargetExposure(
            averageBrightness,
            globalDynamicRange,
            highlightPixels,
            shadowPixels
        );
        console.log(`  迭代 ${iter + 1}: AvgBright=${averageBrightness.toFixed(1)}, GlobalDR=${globalDynamicRange}, LocalDR=${localDynamicRange.toFixed(1)}, TargetExp=${targetExposure.toFixed(1)}`);

        // 5. 逐像素应用调整 (直接修改 imageData.data)
        for (let i = 0; i < data.length; i += channels) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            // const a = data[i + 3]; // Alpha 不变

            const originalBrightness = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

            // 目标亮度计算 (基于直方图均衡化，CDF 映射)
            // 防止 cdfRange 为 0 导致除零
            const targetBrightnessBase = (cdfRange > 0) ? ((cdf[originalBrightness] - cdfMin) / cdfRange) * 255 : originalBrightness;
            
            // 保护高光和暗部 (使用权重混合原始亮度和目标亮度)
            const normalizedBrightness = originalBrightness / 255;
            const protectionFactor = Math.pow(Math.abs(normalizedBrightness - 0.5) * 2, 0.5);
            const targetBrightness = originalBrightness * protectionFactor + targetBrightnessBase * (1 - protectionFactor);

            // S 型曲线调整亮度变化
            const x = originalBrightness / 255;
            const sCurve = 1 / (1 + Math.exp(-8 * (x - 0.5))); // 温和 S 曲线

            // 计算亮度调整量
            const brightnessAdjustmentBase = intensity * (targetBrightness - originalBrightness + targetExposure);
            const brightnessAdjustment = brightnessAdjustmentBase * (0.5 + sCurve * 0.5);

            // 结合局部调整因子
            const fineAdjustment = brightnessAdjustment * (1 + (localAdjustmentFactor * globalDynamicRange / 255) * 0.2);

            // 限制调整幅度，避免过度调整
            const baseLimit = 45; // 限制调整幅度
            const dynamicLimit = baseLimit * (1 - Math.pow(Math.abs(originalBrightness - 128) / 128, 2));
            const limitedAdjustment = Math.max(-dynamicLimit, Math.min(dynamicLimit, fineAdjustment)); 

            // 应用调整到 RGB 通道
            data[i] = Math.max(0, Math.min(255, Math.round(r + limitedAdjustment)));
            data[i + 1] = Math.max(0, Math.min(255, Math.round(g + limitedAdjustment)));
            data[i + 2] = Math.max(0, Math.min(255, Math.round(b + limitedAdjustment)));
            // data[i + 3] = a; // Alpha 保持不变
        }
        
        console.log(`  迭代 ${iter + 1} 像素调整完成，耗时: ${(performance.now() - startTimeIter).toFixed(2)} ms`);

        // 如果不是最后一次迭代，重新计算直方图
        if (iter < iterations - 1) {
             const histogramStartTime = performance.now();
             // 调用传入的函数计算直方图
             // 注意：computeHistogramFunc 需要能处理当前被修改的 imageData
             const newHistogramResult = await computeHistogramFunc(imageData);
             if (!newHistogramResult || !newHistogramResult.brightness) {
                 console.error(`迭代 ${iter + 1} 失败：无法重新计算直方图。`);
                 break; // 无法继续迭代
             }
             currentBrightnessHistogram = newHistogramResult.brightness;
             console.log(`  迭代 ${iter + 1} 直方图重新计算完成，耗时: ${(performance.now() - histogramStartTime).toFixed(2)} ms`);
        }
    }

    // 注意：函数直接修改了输入的 imageData.data
    return imageData;
} 