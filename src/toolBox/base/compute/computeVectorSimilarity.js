/**
 * @fileoverview 计算向量相似度的工具函数。
 */

/**
 * 计算两个数值向量之间的余弦相似度。
 * 余弦相似度衡量两个向量方向的相似程度，值域为 [-1, 1]。
 * 1 表示方向完全相同，-1 表示方向完全相反，0 表示方向正交。
 * 函数假定输入向量是非零向量。
 *
 * @param {number[]} vectorA - 第一个数值向量 (数组)。
 * @param {number[]} vectorB - 第二个数值向量 (数组)。两个向量的维度必须相同。
 * @returns {number | null} 两个向量的余弦相似度。如果向量维度不匹配或计算出错（如除以零），则返回 null。
 */
export function computeCosineSimilarity(vectorA, vectorB) {
    if (!Array.isArray(vectorA) || !Array.isArray(vectorB) || vectorA.length !== vectorB.length) {
        console.error('computeCosineSimilarity: 输入必须是两个维度相同的数组。');
        return null;
    }

    const dimension = vectorA.length;
    if (dimension === 0) {
        return 1; // 空向量认为是相似的
    }

    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < dimension; i++) {
        const valA = vectorA[i];
        const valB = vectorB[i];
        dotProduct += valA * valB;
        magnitudeA += valA * valA;
        magnitudeB += valB * valB;
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) {
        // 如果任一向量是零向量，无法计算余弦相似度
        // 在实践中，可以根据场景返回 0 或 1，或抛出错误。
        // 这里选择返回 0，表示没有明确的相似方向。
        // console.warn('computeCosineSimilarity: 至少一个输入向量是零向量。');
        return 0; 
    }

    const similarity = dotProduct / (magnitudeA * magnitudeB);

    // 处理浮点数精度问题，确保结果在 [-1, 1] 区间内
    return Math.max(-1, Math.min(1, similarity));
} 