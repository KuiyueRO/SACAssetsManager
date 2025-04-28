/**
 * @file Canvas 事件相关工具函数
 */

/**
 * 根据鼠标事件和 Canvas 元素获取事件在 Canvas 上的相对坐标。
 * 会考虑 Canvas 的 CSS 尺寸和实际绘图尺寸之间的缩放。
 * @param {MouseEvent|PointerEvent|TouchEvent} e - 鼠标、指针或触摸事件对象。需要包含 clientX 和 clientY。
 * @param {HTMLCanvasElement} canvas - 目标 Canvas 元素。
 * @returns {{x: number, y: number}} 包含 x 和 y 坐标的对象。
 */
export const 获取事件canvas坐标 = (e, canvas) => {
  const rect = canvas.getBoundingClientRect();
  // 处理 canvas.width/height 为 0 的情况，避免除以零
  const scaleX = rect.width === 0 ? 1 : canvas.width / rect.width;
  const scaleY = rect.height === 0 ? 1 : canvas.height / rect.height;
  // 对于 TouchEvent，可能需要取 e.touches[0]
  const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
  const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  };
}; 