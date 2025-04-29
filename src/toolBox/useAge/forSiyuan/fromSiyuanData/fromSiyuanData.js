/**
 * @fileoverview 提供从思源笔记获取数据的函数。
 */

// 注意：此文件中的函数可能依赖于全局或注入的 `kernelApi` 对象来执行 SQL 查询。
// 在不同环境中使用时需要确保 `kernelApi` 可用。
// import { kernelApi } from "../path/to/kernelApi"; // 实际项目中需要正确引入 kernelApi

/**
 * 根据素材路径数组查询对应的笔记信息（通过执行 SQL）。
 * @async
 * @param {string[]} assetPaths - 素材路径数组。
 * @returns {Promise<Array>} 返回包含素材所在笔记信息的数组。
 * @throws {Error} 如果 `kernelApi` 不可用或 SQL 执行失败，则可能抛出错误。
 */
export const fromSiyuan_getAssetNotesByPaths = async (assetPaths) => {
    // 确保 kernelApi 可用
    if (typeof kernelApi === 'undefined' || !kernelApi.sql) {
        console.error("kernelApi is not available or does not have sql method.");
        throw new Error("kernelApi is not available for SQL execution.");
    }

    // TODO: Consider SQL injection vulnerability if assetPaths elements are not sanitized.
    if (!Array.isArray(assetPaths) || assetPaths.length === 0) {
        return []; // Return empty array for invalid or empty input
    }
    const sql = `select * from assets where path in ('${assetPaths.join("','")}')`;
    try {
        const result = await kernelApi.sql({ stmt: sql });
        return result;
    } catch (error) {
        console.error("Error executing SQL in fromSiyuan_getAssetNotesByPaths:", error);
        throw error; // Re-throw the error for upstream handling
    }
};

/**
 * @typedef {object} DailyCount
 * @property {string} date - 日期字符串 (YYYY-MM-DD)。
 * @property {number} count - 当日计数。
 */

/**
 * 查询指定日期范围内每天创建的文档数量。
 * @async
 * @param {string} [startDate] - 开始日期 (YYYY-MM-DD)，可选。
 * @param {string} [endDate] - 结束日期 (YYYY-MM-DD)，可选。
 * @returns {Promise<DailyCount[]>} 返回按日期排序的每日文档计数的数组。
 * @throws {Error} 如果 kernelApi 不可用或 SQL 执行失败。
 */
export const fromSiyuan_getDailyDocCount = async (startDate, endDate) => {
    // 确保 kernelApi 可用
    // 注意：原代码使用的是 kernelApi.SQL，这里假设存在或统一为 kernelApi.sql
    if (typeof kernelApi === 'undefined' || typeof kernelApi.sql !== 'function') {
        console.error("kernelApi.sql is not available.");
        throw new Error("kernelApi.sql is not available for SQL execution.");
    }

    // 构建 SQL 查询
    // 使用参数化查询防止 SQL 注入是最佳实践，但 kernelApi 可能不支持
    // TODO: Verify if kernelApi.sql supports parameterized queries.
    let sql = `
        SELECT
          strftime('%Y-%m-%d', created, 'unixepoch', 'localtime') as date,
          count(*) as count
        FROM blocks
        WHERE type = 'd'
    `;
    const params = [];
    if (startDate) {
        // Assuming kernelApi.sql uses ? for placeholders if it supports params
        // sql += ` AND created >= strftime('%s', ?)`;
        // params.push(startDate);
        // If not, use string interpolation carefully (potential injection risk)
         sql += ` AND created >= strftime('%s', '${startDate}')`;
    }
    if (endDate) {
        // sql += ` AND created <= strftime('%s', ?)`;
        // params.push(endDate);
        sql += ` AND created <= strftime('%s', '${endDate}')`;
    }
    sql += `
        GROUP BY date
        ORDER BY date ASC
    `;

    try {
        // const results = await kernelApi.sql({ stmt: sql, params: params }); // If params supported
        const results = await kernelApi.sql({ stmt: sql }); // If no params support
        // 确保返回的是预期格式
        if (!Array.isArray(results)) {
             console.error("SQL query did not return an array:", results);
             return [];
        }
        // 验证数据结构 (可选)
        return results.map(item => ({ date: item.date, count: Number(item.count) || 0 }));
    } catch (error) {
        console.error("Error executing SQL in fromSiyuan_getDailyDocCount:", error);
        throw error;
    }
}; 