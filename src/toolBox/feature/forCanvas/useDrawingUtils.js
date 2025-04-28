/**
 * @file Canvas 基础绘图工具函数
 */

/**
 * 在 Canvas 上下文的指定点绘制一个指定方向的箭头。
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D 渲染上下文。
 * @param {{x: number, y: number}} point - 箭头的尖端坐标。
 * @param {'left' | 'right' | 'top' | 'bottom'} side - 箭头指向相对于 point 的方向。
 */
export const drawArrow = (ctx, point, side) => {
  const arrowSize = 8;
  ctx.save(); // 保存当前状态
  ctx.beginPath();

  // 根据锚点方向调整箭头方向
  switch (side) {
    case 'left':
      ctx.moveTo(point.x, point.y);
      ctx.lineTo(point.x + arrowSize, point.y - arrowSize);
      ctx.lineTo(point.x + arrowSize, point.y + arrowSize);
      break;
    case 'right':
      ctx.moveTo(point.x, point.y);
      ctx.lineTo(point.x - arrowSize, point.y - arrowSize);
      ctx.lineTo(point.x - arrowSize, point.y + arrowSize);
      break;
    case 'top':
      ctx.moveTo(point.x, point.y);
      ctx.lineTo(point.x - arrowSize, point.y + arrowSize);
      ctx.lineTo(point.x + arrowSize, point.y + arrowSize);
      break;
    case 'bottom':
      ctx.moveTo(point.x, point.y);
      ctx.lineTo(point.x - arrowSize, point.y - arrowSize);
      ctx.lineTo(point.x + arrowSize, point.y - arrowSize);
      break;
  }

  ctx.closePath();
  // 允许外部设置填充样式，这里不再硬编码
  // ctx.fillStyle = '#67C23A';
  ctx.fill();
  ctx.restore(); // 恢复状态
};

/**
 * 在 Canvas 上下文的原点 (0,0) 绘制一个指定直径的实心圆。
 * 注意：此函数会修改当前的 fillStyle。
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D 渲染上下文。
 * @param {number} diameter - 圆的直径。
 */
export function drawCircle(ctx, diameter) {
  ctx.beginPath();
  ctx.arc(0, 0, diameter / 2, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * 在 Canvas 上下文的原点 (0,0) 绘制一个指定宽高的实心矩形（中心对齐原点）。
 * 注意：此函数会修改当前的 fillStyle。
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D 渲染上下文。
 * @param {number} width - 矩形的宽度。
 * @param {number} height - 矩形的高度。
 */
export function drawRectangle(ctx, width, height) {
  ctx.beginPath();
  ctx.rect(-width / 2, -height / 2, width, height);
  ctx.fill();
} 