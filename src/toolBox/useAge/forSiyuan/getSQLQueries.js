/**
 * @fileoverview 生成用于查询思源笔记数据库的 SQL 语句。
 * 注意：这些函数生成的 SQL 语句依赖于思源的特定数据库表结构（如 blocks, assets, spans）。
 * 对输入参数进行了基础的清理以降低 SQL 注入风险，但不保证完全安全。
 */

/**
 * 基础 SQL 参数清理函数。移除单引号和分号。
 * @param {string} input - 输入字符串。
 * @returns {string} 清理后的字符串。
 */
const sanitizeSqlParam = (input) => {
    if (typeof input !== 'string') return '';
    // 简单移除单引号和分号，可以根据需要扩展
    return input.replace(/[';]/g, '');
};

/**
 * 将 ID 数组格式化为 SQL 'IN' 子句的内容。
 * @param {string[]} idArray - 块 ID 数组。
 * @returns {string} 格式化后的字符串，例如 "'id1','id2'"。
 */
const formatIdArrayForSqlIn = (idArray) => {
    if (!Array.isArray(idArray) || idArray.length === 0) return '';
    // 清理每个 ID 并用逗号和单引号连接
    return idArray.map(id => `'${sanitizeSqlParam(id)}'`).join(',');
};


/**
 * 生成查询特定 ID 块信息的 SQL 语句。
 * @param {string[]} idArray - 块 ID 数组。
 * @returns {string} 查询块信息的 SQL 语句，如果 idArray 无效则返回空字符串。
 * @example getSqlQuery_BlocksByIds(['id1', 'id2']) => "select * from blocks where id in ('id1','id2')"
 */
export const getSqlQuery_BlocksByIds = (idArray) => {
    const sanitizedIds = formatIdArrayForSqlIn(idArray);
    if (!sanitizedIds) return '';
    return `select * from blocks where id in (${sanitizedIds})`;
};

/**
 * 生成按笔记本查询附件信息的 SQL 语句。
 * @param {string} box - 笔记本 ID。
 * @param {number} [limit=100] - 返回数量限制。
 * @param {number} [offset=0] - 返回偏移量。
 * @returns {string} 查询附件信息的 SQL 语句。
 * @example getSqlQuery_AssetsByBox('boxId', 50, 10) => "select * from assets where box = 'boxId' limit 50 offset 10"
 */
export const getSqlQuery_AssetsByBox = (box, limit = 100, offset = 0) => {
    const sanitizedBox = sanitizeSqlParam(box);
    // 确保 limit 和 offset 是数字
    const numLimit = Number.isInteger(limit) && limit > 0 ? limit : 100;
    const numOffset = Number.isInteger(offset) && offset >= 0 ? offset : 0;
    return `select * from assets where box = '${sanitizedBox}' limit ${numLimit} offset ${numOffset}`;
};

/**
 * 生成查询所有附件信息的 SQL 语句。
 * @param {number} [limit=100] - 返回数量限制。
 * @param {number} [offset=0] - 返回偏移量。
 * @returns {string} 查询所有附件信息的 SQL 语句。
 * @example getSqlQuery_AllAssets(50) => "select * from assets limit 50 offset 0"
 */
export const getSqlQuery_AllAssets = (limit = 100, offset = 0) => {
    const numLimit = Number.isInteger(limit) && limit > 0 ? limit : 100;
    const numOffset = Number.isInteger(offset) && offset >= 0 ? offset : 0;
    return `select * from assets limit ${numLimit} offset ${numOffset}`;
};

/**
 * 生成按文档 ID 查询其下所有子文档附件的 SQL 语句。
 * @param {string} docId - 文档 ID。
 * @param {number} [limit=100] - 返回数量限制。
 * @param {number} [offset=0] - 返回偏移量。
 * @returns {string} 查询子文档附件的 SQL 语句。
 * @example getSqlQuery_ChildAssetsByDocId('doc123') => "select * from assets where root_id = 'doc123' limit 100 offset 0"
 * // 注意：这里假定用 root_id 关联附件和文档是正确的，待确认思源结构。
 */
export const getSqlQuery_ChildAssetsByDocId = (docId, limit = 100, offset = 0) => {
    // FIXME: The original implementation used `docpath like '%${docId}%'`.
    // Assuming `root_id` is the correct field for relating assets to their containing document.
    // This needs verification against the actual Siyuan database schema.
    const sanitizedDocId = sanitizeSqlParam(docId);
    const numLimit = Number.isInteger(limit) && limit > 0 ? limit : 100;
    const numOffset = Number.isInteger(offset) && offset >= 0 ? offset : 0;
    // return `select * from assets where docpath like '%${sanitizedDocId}%' limit ${numLimit} offset ${numOffset}`; // Original assumption
    return `select * from assets where root_id = '${sanitizedDocId}' limit ${numLimit} offset ${numOffset}`; // Current assumption
};

/**
 * 生成按文档 ID 查询其下 'file://' 类型链接的 SQL 语句。
 * @param {string} docId - 文档 ID。
 * @param {number} [limit=100] - 返回数量限制。
 * @param {number} [offset=0] - 返回偏移量。
 * @returns {string} 查询 file 链接的 SQL 语句。
 */
export const getSqlQuery_FileLinksByDocId = (docId, limit = 100, offset = 0) => {
    const sanitizedDocId = sanitizeSqlParam(docId);
    // TODO: Validate the markdown LIKE pattern for robustness against edge cases.
    const numLimit = Number.isInteger(limit) && limit > 0 ? limit : 100;
    const numOffset = Number.isInteger(offset) && offset >= 0 ? offset : 0;
    return `
    SELECT *
    FROM spans
    WHERE type = "textmark a"
      AND markdown LIKE "%](file:///%"
      AND root_id = "${sanitizedDocId}"
    LIMIT ${numLimit} OFFSET ${numOffset}`;
}; 