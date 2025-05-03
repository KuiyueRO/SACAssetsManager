/**
 * 思源笔记 Protyle 编辑器相关工具函数
 *
 * @module protyleUtils
 */

/**
 * 处理对话框销毁后的操作, 通常是将选择结果插入编辑器
 *
 * @function insertDialogSelectionIntoProtyle
 * @param {Object} data - 对话框关闭时传递的数据，期望包含 selectedItems 数组
 * @param {Object} protyle - Protyle 编辑器实例
 */
export function insertDialogSelectionIntoProtyle(data, protyle) {
    // 检查 data 和 selectedItems 是否存在
    if (data?.selectedItems && Array.isArray(data.selectedItems)) {
        // 提取有效的文件路径
        const selectedFilePaths = data.selectedItems
            .map(item => item?.data?.path) // 安全访问 data 和 path
            .filter(path => typeof path === 'string' && path); // 过滤掉无效路径

        // 如果有有效路径才插入
        if (selectedFilePaths.length > 0) {
            protyle.focus(); // 确保编辑器获得焦点
            // 插入文件链接
            const linksHTML = selectedFilePaths.map(
                path => {
                    // 提取文件名，处理路径分隔符
                    const filename = path.includes('/') ? path.split('/').pop() : path.split('\\').pop();
                    // 创建符合思源规范的文件链接 span
                    return `<span data-type="a" data-href="file:///${path}">${filename}</span>`;
                }
            ).join("\n"); // 使用换行符连接

            protyle.insert(linksHTML);
        }
    }
} 