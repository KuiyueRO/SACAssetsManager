/**
 * @fileoverview 在 Canvas 2D 上下文绘制矩形边框及可选的控制点。
 */

/**
 * @typedef {object} RectUnitTransform
 * @property {{x: number, y: number}} origin - 矩形左上角（旋转前）的坐标。
 * @property {number} rotation - 矩形的旋转角度（弧度）。
 */

/**
 * @typedef {object} RectUnit
 * @property {RectUnitTransform} transform - 矩形的变换信息。
 * @property {number} width - 矩形的宽度。
 * @property {number} height - 矩形的高度。
 */

/**
 * @typedef {object} DrawRectOptions
 * @property {number[]} [dashPattern=[5, 5]] - 边框虚线模式。
 * @property {string} [strokeColor='rgba(255, 0, 0, 0.8)'] - 边框颜色。
 * @property {number} [lineWidth=3] - 边框线宽。
 * @property {boolean} [showHandles=false] - 是否显示控制点。
 * @property {number} [handleSize=8] - 控制点大小。
 */

/**
 * 在 Canvas 2D 上下文中绘制矩形单元的边框和可选的控制点。
 * 会根据 rectUnit.transform.rotation 旋转画布进行绘制。
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D 渲染上下文。
 * @param {RectUnit} rectUnit - 包含位置、尺寸和旋转信息的矩形对象。
 * @param {DrawRectOptions} [options={}] - 绘制选项。
 */
export const drawRectOutline = (ctx, rectUnit, options = {}) => {
    const {
        dashPattern = [5, 5],
        strokeColor = 'rgba(255, 0, 0, 0.8)',
        lineWidth = 3,
        showHandles = false,
        handleSize = 8
    } = options;

    if (!ctx || typeof ctx.save !== 'function') {
        console.error("Invalid CanvasRenderingContext2D provided.");
        return;
    }
    if (!rectUnit || !rectUnit.transform || !rectUnit.transform.origin) {
        console.error("Invalid rectUnit provided.");
        return;
    }

    ctx.save();

    // 应用旋转
    // 注意：旋转中心是 Canvas 的原点 (0,0)，如果需要围绕矩形中心旋转，需要先 translate
    // 但原代码似乎是直接旋转，这里保持一致，但标注潜在问题
    // TODO: Verify if rotation logic should be around rect center instead of canvas origin.
    if (rectUnit.transform.rotation) {
      ctx.rotate(rectUnit.transform.rotation);
    }

    // 绘制主边框
    ctx.setLineDash(dashPattern);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;

    ctx.beginPath();
    ctx.rect(
        rectUnit.transform.origin.x,
        rectUnit.transform.origin.y,
        rectUnit.width,
        rectUnit.height
    );
    ctx.stroke();

    // 绘制控制点 (在同样的旋转状态下绘制)
    if (showHandles) {
        ctx.setLineDash([]); // 实线
        ctx.fillStyle = strokeColor;

        // 定义矩形的四个角（相对于其 origin）
        const corners = [
            { x: rectUnit.transform.origin.x, y: rectUnit.transform.origin.y },
            { x: rectUnit.transform.origin.x + rectUnit.width, y: rectUnit.transform.origin.y },
            { x: rectUnit.transform.origin.x + rectUnit.width, y: rectUnit.transform.origin.y + rectUnit.height },
            { x: rectUnit.transform.origin.x, y: rectUnit.transform.origin.y + rectUnit.height }
        ];

        const handleRadius = handleSize / 2;
        corners.forEach(corner => {
            ctx.beginPath();
            ctx.arc(corner.x, corner.y, handleRadius, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    ctx.restore();
}; 