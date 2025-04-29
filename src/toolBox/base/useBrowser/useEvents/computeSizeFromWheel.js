/**
 * @fileoverview 根据滚轮事件计算尺寸 (常用于缩放)
 * @module toolBox/base/useBrowser/useEvents/computeSizeFromWheel
 */

/**
 * 根据滚轮事件和 Ctrl 键状态计算新的尺寸值。
 * 如果未按下 Ctrl 键，则返回原始尺寸。
 * @param {number} currentSize - 当前尺寸值
 * @param {WheelEvent} event - 滚轮事件对象
 * @param {number} [max=1024] - 允许的最大尺寸
 * @param {number} [min=32] - 允许的最小尺寸
 * @returns {number} 计算后的新尺寸值或原始尺寸值
 */
export function computeSizeFromWheel(currentSize, event, max = 1024, min = 32) {
    if (event.ctrlKey) {
        // 根据滚轮方向调整尺寸，deltaY < 0 是向上滚（放大），> 0 是向下滚（缩小）
        // 除以 10 是一个缩放因子，可以调整
        let newSize = parseInt(currentSize) - event.deltaY / 10;
        newSize = Math.max(min, Math.min(max, newSize));
        return newSize;
    }
    return currentSize;
}

// 保持旧的函数名作为别名以兼容（可选，但建议重构调用处）
/** @deprecated 请使用 computeSizeFromWheel */
export const 从滚轮事件计算 = computeSizeFromWheel; 