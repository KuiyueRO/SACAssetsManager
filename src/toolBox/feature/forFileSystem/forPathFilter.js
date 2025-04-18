/**
 * @fileoverview 文件路径过滤工具
 * @module toolBox/feature/forFileSystem/forPathFilter
 * @description 提供判断文件路径是否应被忽略的功能。
 */

/**
 * 需要忽略的目录或路径片段列表
 * 注意：包含 Windows 系统目录、回收站、版本控制目录、缓存目录等。
 */
export const ignoreDir = [
    '$recycle',
    '$trash',
    '.git',
    '.sac',
    '$RECYCLE.BIN',
    '#recycle',
    '.pnpm-store',
    'System Volume Information',
    'Windows/WinSxS', // 正斜杠路径
    'Windows\\WinSxS', // 反斜杠路径 (需转义)
    'temp',
    '\\repo\\objects', // 适用于 Windows 共享路径或特定场景
    '/repo/objects'  // 适用于 Linux/macOS 路径
];

/**
 * 判断路径是否应被排除（忽略大小写）
 * @param {string} path - 要检查的文件或目录路径
 * @returns {boolean} 如果路径包含 ignoreDir 中的任何片段，则返回 true
 */
export const 判定路径排除 = (path) => {
    if (typeof path !== 'string' || !path) {
        return false; // 对于无效输入直接返回 false
    }
    const lowerCasePath = path.toLowerCase();
    for (let dir of ignoreDir) {
        // 对列表中的每一项也转换为小写进行比较
        if (lowerCasePath.indexOf(dir.toLowerCase()) !== -1) {
            return true;
        }
    }
    return false;
};

// 提供中文别名
export { 判定路径排除 as isPathIgnored }; 