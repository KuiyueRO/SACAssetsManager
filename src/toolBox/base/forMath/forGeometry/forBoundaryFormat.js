/**
 * @fileoverview 提供几何边界框格式转换工具函数 (LTRB <-> XYWH)。
 */

/**
 * 将 LTRB (Left, Top, Right, Bottom) 边界格式转换为 XYWH (X, Y, Width, Height) 格式。
 * @param {{left: number, top: number, right: number, bottom: number}} bounds - LTRB 边界对象。
 * @returns {{x: number, y: number, width: number, height: number} | null} XYWH 格式对象。如果输入无效则返回 null。
 */
export const fromLtrbToXywh = (bounds) => {
  if (!bounds || typeof bounds !== 'object' ||
      typeof bounds.left !== 'number' || typeof bounds.top !== 'number' ||
      typeof bounds.right !== 'number' || typeof bounds.bottom !== 'number') {
    console.warn('fromLtrbToXywh: 无效的 LTRB 边界格式数据', bounds);
    return null;
  }

  return {
    x: bounds.left,
    y: bounds.top,
    width: bounds.right - bounds.left,
    height: bounds.bottom - bounds.top
  };
};

/**
 * 将 XYWH (X, Y, Width, Height) 格式转换为 LTRB (Left, Top, Right, Bottom) 边界格式。
 * @param {{x: number, y: number, width: number, height: number}} xywh - XYWH 格式对象。
 * @returns {{left: number, top: number, right: number, bottom: number} | null} LTRB 边界对象。如果输入无效则返回 null。
 */
export const fromXywhToLtrb = (xywh) => {
  if (!xywh || typeof xywh !== 'object' ||
      typeof xywh.x !== 'number' || typeof xywh.y !== 'number' ||
      typeof xywh.width !== 'number' || typeof xywh.height !== 'number') {
    console.warn('fromXywhToLtrb: 无效的 XYWH 格式数据', xywh);
    return null;
  }

  return {
    left: xywh.x,
    top: xywh.y,
    right: xywh.x + xywh.width,
    bottom: xywh.y + xywh.height
  };
}; 