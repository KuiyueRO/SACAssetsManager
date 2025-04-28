/**
 * @file K-Means 聚类算法用于颜色分析
 * 提供 K-Means++ 算法实现，以及使用不同颜色距离度量的便捷函数。
 */

import {
    computeCIEDE2000DifferenceRGBA
} from "./useColorSimilarity.js";
import {
    computeCIE76Difference
} from "./useColorSimilarity.js"; // CIE76 暂时在这里也导入，虽然下面的便捷函数没用它

/**
 * 计算两个数值数组之间的欧氏距离的平方。
 * 省略了最终的平方根计算，因为对于比较距离大小而言是不必要的，可以提高性能。
 * @param {number[]} a - 第一个数组。
 * @param {number[]} b - 第二个数组。
 * @returns {number} 欧氏距离的平方。
 */
function computeEuclideanDistanceSquared(a, b) {
    let sum = 0;
    // 只比较 RGB 前三个通道
    const len = Math.min(a.length, b.length, 3);
    for (let i = 0; i < len; i++) {
        const diff = a[i] - b[i];
        sum += diff * diff;
    }
    return sum;
}

/**
 * 使用 K-Means++ 初始化中心点。
 * @param {Array<number>} data - 输入数据，格式为 [r1, g1, b1, a1, r2, g2, b2, a2, ...]。
 * @param {number} k - 聚类数量。
 * @returns {Array<Array<number>>} 初始化后的中心点数组。
 */
function initializeCentersKMeansPP(data, k) {
    const centers = [];
    const numPoints = data.length / 4;
    if (numPoints === 0) return [];

    // 1. 随机选择第一个中心点
    const firstCenterIndex = Math.floor(Math.random() * numPoints);
    centers.push([data[firstCenterIndex * 4], data[firstCenterIndex * 4 + 1], data[firstCenterIndex * 4 + 2]]);

    const distances = new Array(numPoints).fill(Infinity);

    // 2. 选择剩余的 k-1 个中心点
    for (let i = 1; i < k; i++) {
        let totalDistance = 0;
        // 计算每个点到最近中心点的距离平方
        for (let j = 0; j < numPoints; j++) {
            const point = [data[j * 4], data[j * 4 + 1], data[j * 4 + 2]];
            const distSq = computeEuclideanDistanceSquared(point, centers[centers.length - 1]);
            distances[j] = Math.min(distances[j], distSq);
            totalDistance += distances[j];
        }

        // 按距离平方概率选择下一个中心点
        const randVal = Math.random() * totalDistance;
        let sum = 0;
        let nextCenterIndex = -1;
        for (let j = 0; j < numPoints; j++) {
            sum += distances[j];
            if (sum >= randVal) {
                nextCenterIndex = j;
                break;
            }
        }
        // 处理极端情况或最后一个点
        if (nextCenterIndex === -1) {
             nextCenterIndex = numPoints - 1;
        }
        centers.push([data[nextCenterIndex * 4], data[nextCenterIndex * 4 + 1], data[nextCenterIndex * 4 + 2]]);
    }
    return centers;
}

/**
 * 将一个点分配到最近的中心点。
 * @param {number[]} point - 数据点 [r, g, b]。
 * @param {Array<Array<number>>} centers - 中心点数组。
 * @param {Function} distanceFn - 计算距离的函数。
 * @returns {number} 分配到的聚类的索引。
 */
function assignToNearestCluster(point, centers, distanceFn) {
    let minDistance = Infinity;
    let assignedCluster = 0;
    for (let j = 0; j < centers.length; j++) {
        // 确保中心点有效
        if (!centers[j]) continue;
        const distance = distanceFn(point, centers[j]);
        if (distance < minDistance) {
            minDistance = distance;
            assignedCluster = j;
        }
    }
    return assignedCluster;
}

/**
 * 更新聚类中心点。
 * @param {Array<number>} data - 输入数据。
 * @param {number[]} assignments - 每个点分配到的聚类索引。
 * @param {number} k - 聚类数量。
 * @returns {Array<Array<number>>} 更新后的中心点数组。
 */
function updateClusterCenters(data, assignments, k) {
    const sums = Array(k).fill(null).map(() => [0, 0, 0]);
    const counts = Array(k).fill(0);
    const numPoints = assignments.length;

    for (let i = 0; i < numPoints; i++) {
        const clusterIdx = assignments[i];
        if (clusterIdx === -1) continue; // 跳过未分配的点 (理论上不应发生)
        const dataIndex = i * 4;
        sums[clusterIdx][0] += data[dataIndex];
        sums[clusterIdx][1] += data[dataIndex + 1];
        sums[clusterIdx][2] += data[dataIndex + 2];
        counts[clusterIdx]++;
    }

    return sums.map((sum, i) =>
        counts[i] > 0 ? sum.map(x => x / counts[i]) : null // 返回 null 表示空簇
    ).filter(center => center !== null); // 过滤掉空簇
}

/**
 * 计算每个簇包含的点数。
 * @param {number[]} assignments - 点分配数组。
 * @param {number} k - 原始 K 值。
 * @returns {number[]} 每个簇的点数数组。
 */
function calculateClusterCounts(assignments, k) {
    const counts = Array(k).fill(0);
    for (let i = 0; i < assignments.length; i++) {
        if (assignments[i] !== -1) {
            counts[assignments[i]]++;
        }
    }
    return counts;
}

/**
 * K-Means++ 聚类算法实现。
 *
 * @param {Array<number>} data - 输入数据，格式为 [r1, g1, b1, a1, r2, g2, b2, a2, ...]。Alpha 通道被忽略。
 * @param {number} k - 聚类数量。
 * @param {Function} distanceFn - 用于计算两个点（颜色）之间距离的函数。
 * @param {number} [maxIterations=100] - 最大迭代次数。
 * @param {boolean} [withPercent=false] - 是否在结果中包含每个簇的百分比。
 * @returns {{centers: Array<Object>|Array<Array<number>>, assignments: Array<number>}} 包含中心点和分配结果的对象。
 *          如果 withPercent 为 true, centers 是 [{color: [r,g,b], count: number, percent: number}, ...]
 *          如果 withPercent 为 false, centers 是 [[r,g,b], ...]
 *          中心点按簇大小降序排列。
 */
export function computeKMeansPlusPlusClusters(
    data,
    k,
    distanceFn,
    maxIterations = 100,
    withPercent = false
) {
    const numPoints = data.length / 4;
    if (numPoints === 0 || k <= 0) {
        return { centers: [], assignments: [] };
    }
    k = Math.min(k, numPoints); // K 不能超过点的数量

    // 1. 初始化中心点
    let centers = initializeCentersKMeansPP(data, k);
    let assignments = new Array(numPoints).fill(-1);
    let previousAssignments = new Array(numPoints).fill(-2);

    // 2. 迭代优化
    for (let iteration = 0; iteration < maxIterations; iteration++) {
        let changed = false;

        // E-step: 分配点到最近的中心点
        for (let i = 0; i < numPoints; i++) {
            const point = [data[i * 4], data[i * 4 + 1], data[i * 4 + 2]];
            const assignedCluster = assignToNearestCluster(point, centers, distanceFn);
            if (assignments[i] !== assignedCluster) {
                 assignments[i] = assignedCluster;
                 changed = true;
            }
        }

        // 检查收敛或无变化
        if (!changed) {
            // console.log(`K-Means++ converged after ${iteration + 1} iterations.`);
            break;
        }
        
        // 可以在此检查 previousAssignments === assignments 来判断是否收敛，但上面的 !changed 效率更高
        // previousAssignments = [...assignments];

        // M-step: 更新中心点
        centers = updateClusterCenters(data, assignments, centers.length); // 使用当前实际中心点数量
        k = centers.length; // 更新 k 值，可能因空簇而减少
        if (k === 0) {
             console.warn("K-Means++ resulted in 0 clusters.");
             return { centers: [], assignments: [] };
        }
    }

    // 3. 计算最终的簇大小并排序
    const counts = calculateClusterCounts(assignments, k);
    const totalPoints = numPoints; // data.length / 4

    const sortedCenters = centers.map((center, index) => ({
        color: center.map(Math.round), // 四舍五入颜色值
        count: counts[index] || 0,
        percent: totalPoints > 0 ? (counts[index] || 0) / totalPoints : 0
    }))
    // 按 count 降序，然后按 R, G, B 升序（确保排序稳定性）
    .sort((a, b) => b.count - a.count || a.color[0] - b.color[0] || a.color[1] - b.color[1] || a.color[2] - b.color[2]);

    return {
        centers: withPercent ? sortedCenters : sortedCenters.map(item => item.color),
        assignments
    };
}

/**
 * 使用 K-Means++ 和欧氏距离（平方）对颜色数据进行聚类。
 *
 * @param {Array<number>} data - 输入颜色数据 [r1, g1, b1, a1, ...]。
 * @param {number} k - 聚类数量。
 * @param {number} [maxIterations=100] - 最大迭代次数。
 * @param {boolean} [withPercent=false] - 是否返回带百分比的中心点。
 * @returns {{centers: Array<Object>|Array<Array<number>>, assignments: Array<number>}} 聚类结果。
 */
export function computeKMeansClustersEuclidean(
    data,
    k,
    maxIterations = 100,
    withPercent = false
) {
    // 使用欧氏距离平方进行比较，可以省略 sqrt
    return computeKMeansPlusPlusClusters(data, k, computeEuclideanDistanceSquared, maxIterations, withPercent);
}

/**
 * 使用 K-Means++ 和 CIEDE2000 距离对颜色数据进行聚类。
 *
 * @param {Array<number>} data - 输入颜色数据 [r1, g1, b1, a1, ...]。
 * @param {number} k - 聚类数量。
 * @param {number} [maxIterations=100] - 最大迭代次数。
 * @param {boolean} [withPercent=false] - 是否返回带百分比的中心点。
 * @returns {{centers: Array<Object>|Array<Array<number>>, assignments: Array<number>}} 聚类结果。
 */
export function computeKMeansClustersCIEDE2000(
    data,
    k,
    maxIterations = 100,
    withPercent = false
) {
    // 注意：computeCIEDE2000DifferenceRGBA 内部有缓存
    return computeKMeansPlusPlusClusters(data, k, computeCIEDE2000DifferenceRGBA, maxIterations, withPercent);
} 