/**
 * 批量在画布上绘制点
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D上下文
 * @param {Array<{x: number, y: number}>} points - 点的数组
 * @param {Object} style - 样式配置
 * @param {string} style.fillColor - 填充颜色（默认黑色）
 * @param {string} style.strokeColor - 边框颜色（默认无）
 * @param {number} style.radius - 半径（默认3）
 * @param {number} style.strokeWidth - 边框宽度（默认0）
 */
export function 在画布上下文批量绘制点(ctx, points, style = {}) {
    // 默认样式
    const pointStyle = {
        fillColor: 'black',
        strokeColor: null,
        radius: 3,
        strokeWidth: 0,
        ...style
    };

    // 保存当前上下文状态
    ctx.save();
    
    // 设置填充样式
    ctx.fillStyle = pointStyle.fillColor;
    
    // 如果有描边
    if (pointStyle.strokeColor) {
        ctx.strokeStyle = pointStyle.strokeColor;
        ctx.lineWidth = pointStyle.strokeWidth;
    }
    
    // 批量绘制所有点
    for (const point of points) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, pointStyle.radius, 0, Math.PI * 2);
        ctx.fill();
        
        if (pointStyle.strokeColor) {
            ctx.stroke();
        }
    }
    
    // 恢复上下文状态
    ctx.restore();
}

/**
 * 在画布上绘制带标签的点
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D上下文
 * @param {Array<{x: number, y: number, label: string}>} labeledPoints - 带标签的点数组
 * @param {Object} style - 样式配置
 * @param {string} style.fillColor - 点的填充颜色
 * @param {string} style.textColor - 文本颜色
 * @param {string} style.font - 文本字体
 * @param {number} style.radius - 点的半径
 * @param {number} style.padding - 文本与点之间的间距
 */
export function 在画布上下文批量绘制带标签的点(ctx, labeledPoints, style = {}) {
    // 默认样式
    const labelStyle = {
        fillColor: 'blue',
        textColor: 'black',
        font: '12px Arial',
        radius: 3,
        padding: 5,
        ...style
    };
    
    // 保存上下文状态
    ctx.save();
    
    // 设置文本样式
    ctx.font = labelStyle.font;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = labelStyle.textColor;
    
    // 绘制每个点及其标签
    for (const point of labeledPoints) {
        // 绘制点
        ctx.beginPath();
        ctx.fillStyle = labelStyle.fillColor;
        ctx.arc(point.x, point.y, labelStyle.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制标签
        ctx.fillStyle = labelStyle.textColor;
        ctx.fillText(point.label, point.x + labelStyle.radius + labelStyle.padding, point.y);
    }
    
    // 恢复上下文状态
    ctx.restore();
} 