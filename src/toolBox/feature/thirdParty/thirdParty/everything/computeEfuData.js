/**
 * @fileoverview 解析 Everything 文件列表 (.efu) 的纯函数。
 */

const WINDOWS_TICK = 10000000; // 100纳秒间隔
const SECONDS_BETWEEN_1601_AND_1970 = 11644473600;

/**
 * 将 Windows 文件时间戳 (自 1601-01-01 UTC 以来的 100 纳秒数) 转换为 Unix 时间戳 (毫秒)。
 * @param {string | number | null | undefined} windowsTimestamp - Windows 时间戳字符串或数字。
 * @returns {number | null} 返回对应的 Unix 时间戳 (毫秒)，如果输入无效则返回 null。
 */
export const computeUnixTimestampFromWindows = (windowsTimestamp) => {
    if (windowsTimestamp === null || windowsTimestamp === undefined || windowsTimestamp === '') {
        return null;
    }
    const timestampNum = Number(windowsTimestamp);
    if (isNaN(timestampNum)) {
        return null;
    }
    // 进行计算，注意浮点数精度问题，但对于时间戳通常足够
    const unixTimestampSeconds = timestampNum / WINDOWS_TICK - SECONDS_BETWEEN_1601_AND_1970;
    return Math.round(unixTimestampSeconds * 1000); // 转换为毫秒并四舍五入
};

/**
 * @typedef {object} EfuEntry
 * @property {string} id - 生成的 ID (localEntrie_ + path)。
 * @property {string} name - 文件名。
 * @property {string} path - 完整路径 (使用 / 分隔符)。
 * @property {number} size - 文件大小 (字节)。
 * @property {number | null} mtimeMs - 修改时间的 Unix 时间戳 (毫秒)。
 * @property {number | null} ctimeMs - 创建时间的 Unix 时间戳 (毫秒)。
 * @property {string} type - 固定为 'file'。
 * // 其他从 EFU 文件解析出的原始字段 (小写，移除了空格)
 */

/**
 * 解析 EFU (Everything File List) 文件内容的字符串。
 * EFU 本质上是 CSV 格式，第一行是带引号的头。
 * @param {string} content - EFU 文件的完整内容字符串。
 * @returns {EfuEntry[]} 返回解析后的文件条目对象数组。
 */
export const computeEfuDataFromString = (content) => {
    if (typeof content !== 'string' || content.trim().length === 0) {
        return [];
    }

    const lines = content.trim().split(/\r?\n/); // 按行分割，兼容 Windows 和 Unix 换行符
    if (lines.length < 2) {
        return []; // 至少需要标题行和一行数据
    }

    // 解析标题行，移除引号并转换为小写，移除空格，便于作为 key
    const headers = lines[0]
        .split(',')
        .map(header => header.replace(/"/g, '').trim().toLowerCase().replace(/\s+/g, ''));

    const filenameIndex = headers.indexOf('filename');
    const sizeIndex = headers.indexOf('size');
    const dateModifiedIndex = headers.indexOf('datemodified');
    const dateCreatedIndex = headers.indexOf('datecreated');

    if (filenameIndex === -1) {
        console.error("EFU header is missing 'Filename' column.");
        return []; // 必须要有 Filename 列
    }

    const parsedData = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.length === 0) continue; // 跳过空行

        // 简单的 CSV 行解析，假设值中不包含逗号或引号
        // TODO: Implement a more robust CSV parsing if values can contain commas/quotes.
        const values = line.split(',').map(value => value.replace(/"/g, '').trim());

        const entry = {};
        headers.forEach((header, index) => {
            // 将所有原始字段存入，键为处理后的 header
            entry[header] = values[index] || '';
        });

        const fullPath = (entry.filename || '').replace(/\\/g, '/');
        const name = fullPath.split('/').pop() || '';
        const size = Number(entry.size) || 0;
        const mtimeMs = computeUnixTimestampFromWindows(entry.datemodified);
        const ctimeMs = computeUnixTimestampFromWindows(entry.datecreated);

        parsedData.push({
            // 添加我们标准化的字段
            id: `localEntrie_${fullPath}`.replace(/\s/g, '_'),
            name: name,
            path: fullPath,
            size: size,
            mtimeMs: mtimeMs,
            ctimeMs: ctimeMs,
            type: 'file', // 假设 EFU 只包含文件？
            ...entry // 同时保留原始解析出的所有字段
        });
    }

    return parsedData;
}; 