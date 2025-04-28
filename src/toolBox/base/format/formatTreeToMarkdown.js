/**
 * @fileoverview 将树状结构数据格式化为 Markdown 字符串 (列表或段落)。
 */

/**
 * @typedef {object} TreeNode
 * @property {string} name - 节点名称。
 * @property {string} path - 节点的绝对路径。
 * @property {boolean} isDirectory - 是否为目录。
 * @property {number} [size] - 文件大小 (字节，目录可能没有)。
 * @property {Date} mtime - 修改时间。
 * @property {TreeNode[]} [children] - 子节点数组 (目录可能有)。
 */

/**
 * @typedef {object} FormatOptions
 * @property {string} [dirIcon='📁'] - 目录图标。
 * @property {string} [fileIcon='📄'] - 文件图标。
 * @property {string} [indentString='    '] - 列表缩进字符串。
 * @property {boolean} [encodeLinkPath=true] - 是否对 file:/// 链接路径进行 encodeURI。
 */

/**
 * 递归地将文件树结构格式化为 Markdown 无序列表。
 * @param {TreeNode[]} tree - 文件树节点数组。
 * @param {number} [depth=0] - 当前递归深度 (用于缩进)。
 * @param {FormatOptions} [options={}] - 格式化选项。
 * @returns {string} 生成的 Markdown 列表字符串。
 */
export const formatTreeToMarkdownList = (tree, depth = 0, options = {}) => {
    const {
        dirIcon = '📁',
        fileIcon = '📄',
        indentString = '    ',
        encodeLinkPath = true
    } = options;

    let content = '';
    if (!Array.isArray(tree)) return content;

    for (const node of tree) {
        if (!node || typeof node.name !== 'string' || typeof node.path !== 'string') continue;

        const indent = indentString.repeat(depth);
        const icon = node.isDirectory ? dirIcon : fileIcon;
        // 安全地处理可选的 size 属性
        const sizeText = typeof node.size === 'number' && !node.isDirectory ? ` (${node.size} bytes)` : '';
        const mtimeText = node.mtime instanceof Date ? node.mtime.toISOString().split('T')[0] : 'invalid date';
        const absolutePath = node.path.replace(/\\/g, '/');

        // TODO: Review if encodeURI is sufficient for file paths in Siyuan or if a more specific encoding is needed.
        const encodedPath = encodeLinkPath ? encodeURI(absolutePath) : absolutePath;
        const linkText = node.isDirectory ? node.name : `[${node.name}](file:///${encodedPath})`;

        content += `${indent}- ${icon} ${linkText}${sizeText} - 修改日期: ${mtimeText}\n`;

        if (node.children && node.children.length > 0) {
            content += formatTreeToMarkdownList(node.children, depth + 1, options);
        }
    }
    return content;
};

/**
 * 将文件树结构格式化为 Markdown 段落 (每个条目后有两个换行)。
 * @param {TreeNode[]} tree - 文件树节点数组。
 * @param {FormatOptions} [options={}] - 格式化选项 (只使用图标和链接编码)。
 * @returns {string} 生成的 Markdown 段落字符串。
 */
export const formatTreeToMarkdownParagraphs = (tree, options = {}) => {
    const {
        dirIcon = '📁',
        fileIcon = '📄',
        encodeLinkPath = true
    } = options;

    let content = '';
    if (!Array.isArray(tree)) return content;

    for (const node of tree) {
        if (!node || typeof node.name !== 'string' || typeof node.path !== 'string') continue;

        const icon = node.isDirectory ? dirIcon : fileIcon;
        const sizeText = typeof node.size === 'number' && !node.isDirectory ? ` (${node.size} bytes)` : '';
        const mtimeText = node.mtime instanceof Date ? node.mtime.toISOString().split('T')[0] : 'invalid date';
        const absolutePath = node.path.replace(/\\/g, '/');

        const encodedPath = encodeLinkPath ? encodeURI(absolutePath) : absolutePath;
        const linkText = node.isDirectory ? node.name : `[${node.name}](file:///${encodedPath})`;

        content += `${icon} ${linkText}${sizeText} - 修改日期: ${mtimeText}\n\n`; // 段落用双换行

        // 注意：段落格式通常不递归显示子项，如果需要递归，逻辑需调整
        // if (node.children && node.children.length > 0) {
        //     content += formatTreeToMarkdownParagraphs(node.children, options);
        // }
    }
    // 移除末尾多余的换行符
    return content.trimEnd();
}; 