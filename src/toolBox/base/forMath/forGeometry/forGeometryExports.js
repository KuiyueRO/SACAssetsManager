import { 计算点距离和角度,按距离采样点序列 } from "./forPointsAndVectors.js";
export { 计算点距离和角度,按距离采样点序列 }
export { xywhRect2ltwhRect } from "./useCoordinates/useLTWHExports.js";
export { ltwhRect2xywhRect } from "./useCoordinates/useXYWHExports.js";

// 导出点和向量相关函数 (包含新旧版本)
export {
    computeDistanceAngle,
    computeDistanceAngleLegacy,
    samplePointsByInterval,
    samplePointsByDistanceRange,
    normalizeVector // 从 forPointsAndVectors.js 重新导出
} from "./forPointsAndVectors.js";

// 导出边界格式转换函数
export * from "./forBoundaryFormat.js";

// 导出通用几何计算函数
export * from "./computeGeometry.js";
