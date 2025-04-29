/**
 * @fileoverview 计算瀑布流布局相关几何指标 (列数、边距、间距)
 * @module toolBox/base/useMath/geometry/computeMasonryLayoutMetrics
 */

/**
 * 根据容器宽度、目标项宽度、表格视图阈值和可选的列间距计算瀑布流布局的列数、左右边距和列间距。
 *
 * @param {number} containerWidth - 容器的总宽度。
 * @param {number} targetItemWidth - 布局项的目标宽度。
 * @param {number} tableViewThreshold - (可选) 切换到单列表格视图的宽度阈值。如果 `targetItemWidth` 小于此值或大于等于 `containerWidth`，则强制为单列布局。
 * @param {number} [inputGutter] - (可选) 手动指定的列间距。如果提供且有效 (0 <= inputGutter <= targetItemWidth / 2)，则使用此值；否则，将根据 `targetItemWidth` 计算默认值 (targetItemWidth / 6)。
 * @returns {{columnCount: number, paddingLR: number, gutter: number}} 返回包含列数、左右边距和最终使用的列间距的对象。
 *   - columnCount: 计算得出的列数 (至少为 1)。
 *   - paddingLR: 左右两边的总边距除以 2 (可能为 0)。
 *   - gutter: 最终使用的列间距 (单列时为 0)。
 */
export function computeMasonryLayoutMetrics(containerWidth, targetItemWidth, tableViewThreshold = 0, inputGutter) {
    // 强制单列的情况
    if (targetItemWidth < tableViewThreshold || targetItemWidth >= containerWidth) {
        return { columnCount: 1, paddingLR: 0, gutter: 0 };
    }

    // 初步计算最大可能的列数（至少为1）
    let columnCount = Math.max(Math.floor(containerWidth / targetItemWidth), 1);
    let gutter;

    // 确定列间距
    if (typeof inputGutter === 'number' && inputGutter >= 0 && inputGutter <= targetItemWidth / 2) {
        gutter = inputGutter; // 使用有效的传入值
    } else {
        gutter = targetItemWidth / 6; // 默认列间距
    }

    // 循环减少列数，直到左右边距 >= 0
    let paddingLR = -1;
    while (paddingLR < 0 && columnCount > 0) {
        const totalItemsWidth = targetItemWidth * columnCount;
        const totalGutterWidth = gutter * Math.max(0, columnCount - 1); // 列间距总宽度
        paddingLR = (containerWidth - totalItemsWidth - totalGutterWidth) / 2;

        if (paddingLR < 0) {
            columnCount--; // 减少列数
        }
    }

    // 如果最终计算出0列（理论上不可能，因为初始至少为1），则强制为1列
    if (columnCount <= 0) {
        columnCount = 1;
        paddingLR = 0;
        gutter = 0; // 单列无间距
    }
     // 如果只有一列，边距和间距都应为0
     if (columnCount === 1) {
        paddingLR = 0;
        gutter = 0;
    }


    return { columnCount, paddingLR, gutter };
}

// --- 兼容旧名称 ---
/** @deprecated 请使用 computeMasonryLayoutMetrics */
export const 根据宽度和尺寸计算列数和边距 = computeMasonryLayoutMetrics; 