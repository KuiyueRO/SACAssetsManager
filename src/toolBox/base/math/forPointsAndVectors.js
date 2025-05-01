/**
 * @fileoverview 提供点、向量相关的几何计算函数。
 */

/**
 * 计算两点之间的距离和角度。
 * @param {number[]} point1 - 第一个点 [x1, y1]。
 * @param {number[]} point2 - 第二个点 [x2, y2]。
 * @returns {{distance: number, angle: number}} 包含距离和角度（度数）的对象。
 */
export const computeDistanceAngle = (point1, point2) => {
    if (!Array.isArray(point1) || point1.length < 2 || !Array.isArray(point2) || point2.length < 2) {
        console.error("computeDistanceAngle: 输入点格式错误，应为 [x, y] 数组。");
        return { distance: 0, angle: 0 };
    }
    const dx = point2[0] - point1[0];
    const dy = point2[1] - point1[1];
    const distance = Math.hypot(dx, dy); // 使用 Math.hypot 更简洁
    const angle = Math.atan2(dy, dx) * 180 / Math.PI; // 结果为度数
    return { distance, angle };
};

/**
 * (旧版本，已迁移)
 * 计算两点之间的距离和角度（弧度）。
 * @param {number} startX - 起点 x 坐标。
 * @param {number} startY - 起点 y 坐标。
 * @param {number} endX - 终点 x 坐标。
 * @param {number} endY - 终点 y 坐标。
 * @returns {{distance: number, angle: number}} 包含距离和角度（弧度）的对象。
 * @deprecated 请使用 computeDistanceAngle 并注意角度单位为度数。
 */
export const computeDistanceAngleLegacy = (startX, startY, endX, endY) => {
    const dx = endX - startX;
    const dy = endY - startY;
    return {
        distance: Math.hypot(dx, dy),
        angle: Math.atan2(dy, dx) // 结果为弧度
    };
};

/**
 * 沿点序列按固定间隔距离进行插值采样。
 * @param {Array<number[]>} points - 点序列 [[x1,y1], [x2,y2], ...]。
 * @param {number} distance - 采样间隔距离。
 * @returns {Array<number[]>} 采样后的点序列。
 */
export const samplePointsByInterval = (points, distance) => {
    if (!Array.isArray(points) || points.length < 2 || typeof distance !== 'number' || distance <= 0) {
        console.error("samplePointsByInterval: 输入参数错误。");
        return points; // 返回原始点或空数组
    }
    
    const result = [points[0]];
    let accumulatedDistance = 0;
    let remainingDistanceInSegment = 0; // 在当前段中还需要前进的距离
    
    for (let i = 1; i < points.length; i++) {
        const prev = points[i-1];
        const curr = points[i];
        const segmentDx = curr[0] - prev[0];
        const segmentDy = curr[1] - prev[1];
        const segmentLength = Math.hypot(segmentDx, segmentDy);

        if (segmentLength <= 0) continue; // 跳过重合的点

        // 计算从上一个采样点到当前线段起点的距离
        let distToStartOfSegment = remainingDistanceInSegment > 0 ? remainingDistanceInSegment : distance;
        
        let currentDistInSegment = 0;
        while(currentDistInSegment + distToStartOfSegment <= segmentLength){
             currentDistInSegment += distToStartOfSegment;
             const ratio = currentDistInSegment / segmentLength;
             const x = prev[0] + ratio * segmentDx;
             const y = prev[1] + ratio * segmentDy;
             result.push([x, y]);
             distToStartOfSegment=distance; //下一个采样点距离为distance
        }
        remainingDistanceInSegment = distToStartOfSegment-(segmentLength-currentDistInSegment);
    }
    
    return result;
};

/**
 * (旧版本，已迁移)
 * 根据距离范围对点序列进行过滤采样。
 * 如果当前点与上一个采样点的距离在 [minDistance, maxDistance] 范围内，则采样当前点。
 * @param {Array<{x: number, y: number}>} originalPoints - 原始点坐标对象数组。
 * @param {number} minDistance - 最小采样距离阈值。
 * @param {number} maxDistance - 最大采样距离阈值。
 * @returns {Array<{x: number, y: number}>} 采样后的点序列（对象数组）。
 * @deprecated 功能与 samplePointsByInterval 不同，如有需要请单独使用。
 */
export const samplePointsByDistanceRange = (originalPoints, minDistance, maxDistance) => {
    if (!Array.isArray(originalPoints)) {
        console.error("samplePointsByDistanceRange: 输入点序列必须是数组。");
        return [];
    }
    return originalPoints.reduce((sampledPoints, currentPoint) => {
        if (sampledPoints.length === 0) {
            sampledPoints.push(currentPoint);
            return sampledPoints;
        }
        const previousSampledPoint = sampledPoints[sampledPoints.length - 1];
        // 检查点对象格式
        if (typeof currentPoint?.x !== 'number' || typeof currentPoint?.y !== 'number' ||
            typeof previousSampledPoint?.x !== 'number' || typeof previousSampledPoint?.y !== 'number') {
             console.warn('samplePointsByDistanceRange: 点对象格式不符合 {x: number, y: number}');
             return sampledPoints; // 跳过格式错误的点
        }
        const spatialDistance = Math.hypot(currentPoint.x - previousSampledPoint.x, currentPoint.y - previousSampledPoint.y);

        if (spatialDistance >= minDistance && spatialDistance <= maxDistance) {
            sampledPoints.push(currentPoint);
        }
        return sampledPoints;
    }, []);
};

// --- 向量相关占位或导出 ---
// 假设向量归一化函数已在 forVectors/forNormalization.js 中定义
// import { normalizeVector } from "./forVectors/forNormalization.js"; // 注意：移动后需要修改路径或移除

/**
 * 向量归一化 (重新导出) - 这个导出需要移除，因为 normalizeVector 会直接从 computeVectorNormalization.js (原 forNormalization.js) 导入
 * @function
 * @param {number[]} vector - 要归一化的向量 [x, y, ...]。
 * @returns {number[]} 归一化后的向量。
 * @deprecated
 */
// export { normalizeVector }; // 需要移除或注释掉 