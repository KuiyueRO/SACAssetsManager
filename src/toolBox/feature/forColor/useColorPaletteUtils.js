/**
 * @file 颜色调色板相关工具函数
 */

/**
 * 将新颜色数组中的唯一颜色（以数组形式表示，如 [r,g,b] 或 [r,g,b,a]）添加到现有调色板数组中。
 * 会过滤掉新颜色中值为 null 或 undefined 的项，以及与现有调色板中颜色完全相同的项。
 *
 * @param {Array<Array<number>>} existingPallet - 现有的调色板，每个元素是一个颜色数组。
 * @param {Array<Array<number>|null|undefined>} newColors - 要添加的新颜色数组，可能包含 null 或 undefined。
 * @returns {Array<Array<number>>} 合并了唯一新颜色的新调色板数组。
 */
export const addUniquePalletColors = (existingPallet, newColors) => {
    // 创建现有颜色的字符串集合，以便快速查找
    // 注意：这种方法对于非常大的调色板可能效率不高，但对于典型尺寸是可接受的
    // 将颜色数组转换为逗号分隔的字符串作为 Set 的键
    const existingColorSet = new Set(existingPallet.map(color => color.join(',')));

    const uniqueNewColors = newColors.filter(color => {
        // 过滤掉 null 或 undefined 的颜色
        if (!color) {
            return false;
        }
        // 检查新颜色是否已存在于 Set 中
        const colorString = color.join(',');
        return !existingColorSet.has(colorString);
    });

    // 返回合并后的数组
    return [...existingPallet, ...uniqueNewColors];
}; 