/**
 * @file Canvas 形状遮罩生成工具
 * 提供创建各种几何形状 Canvas 遮罩的功能。
 */

/**
 * 初始化画布并设置基本参数
 * @param {number} size - 画布的宽度和高度
 * @returns {CanvasRenderingContext2D} 初始化后的2D渲染上下文
 */
const initCanvas = (size) => {
  // Note: This function assumes it runs in a browser environment with DOM access.
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = size;
  tempCanvas.height = size;
  const ctx = tempCanvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D context');
  }
  ctx.clearRect(0, 0, size, size);
  ctx.translate(size / 2, size / 2);
  return ctx;
};

/**
 * 创建形状遮罩 Canvas 元素。
 * @param {string|{type: string, sides?: number}} shape - 形状类型 ('circle', 'square', 'hexagon', 'polygon' 等) 或形状对象 (例如 { type: 'polygon', sides: 5 })。
 * @param {number} size - 画布尺寸 (正方形)。
 * @param {boolean} [forClipping=false] - 是否用于裁剪 (影响描边和填充)。
 * @param {number} [nodeStrokeWidth=0] - 节点的描边宽度。
 * @param {string} [nodeStrokeColor='black'] - 节点的描边颜色。
 * @param {{scale: number}} [nodeTransform={scale: 1}] - 节点的变换信息，主要用于缩放描边宽度。
 * @returns {HTMLCanvasElement} 包含绘制形状的 Canvas 元素。
 */
export const createShapeMask = (
  shape,
  size,
  forClipping = false,
  nodeStrokeWidth = 0, // Default stroke width to 0
  nodeStrokeColor = 'black', // Default stroke color
  nodeTransform = { scale: 1 } // Default transform
) => {
  const ctx = initCanvas(size);
  // Ensure scale is not zero to avoid division by zero
  const scale = nodeTransform.scale === 0 ? 1 : nodeTransform.scale;
  const scaledStrokeWidth = nodeStrokeWidth / scale;
  drawShape(ctx, shape, size, scaledStrokeWidth);
  applyStyle(ctx, forClipping, nodeStrokeWidth, nodeStrokeColor, scaledStrokeWidth);
  return ctx.canvas;
};

// ... (rest of the content from mask.js) ...

/**
 * 绘制指定形状
 * @param {CanvasRenderingContext2D} ctx - 2D渲染上下文
 * @param {string|{type: string, sides?: number}} shape - 形状类型或形状对象
 * @param {number} size - 画布尺寸
 * @param {number} scaledStrokeWidth - 缩放后的描边宽度
 */
const drawShape = (ctx, shape, size, scaledStrokeWidth) => {
  ctx.beginPath();
  const shapeType = typeof shape === 'object' ? shape.type : shape;
  switch (shapeType) {
    case 'circle':
      drawCircle(ctx, size, scaledStrokeWidth);
      break;
    case 'square':
      drawSquare(ctx, size, scaledStrokeWidth);
      break;
    case 'rectangle':
      drawRectangle(ctx, size, scaledStrokeWidth);
      break;
    case 'hexagon':
      drawHexagon(ctx, size, scaledStrokeWidth);
      break;
    case 'triangle':
      drawTriangle(ctx, size, scaledStrokeWidth);
      break;
    case 'star':
      drawStar(ctx, size, scaledStrokeWidth);
      break;
    case 'diamond':
      drawDiamond(ctx, size, scaledStrokeWidth);
      break;
    case 'octagon':
      drawOctagon(ctx, size, scaledStrokeWidth);
      break;
    case 'ellipse':
      drawEllipse(ctx, size, scaledStrokeWidth);
      break;
    case 'cross':
      drawCross(ctx, size, scaledStrokeWidth);
      break;
    case 'arrow':
      drawArrow(ctx, size, scaledStrokeWidth);
      break;
    case 'heart':
      drawHeart(ctx, size, scaledStrokeWidth);
      break;
    case 'cloud':
      drawCloud(ctx, size, scaledStrokeWidth);
      break;
    case 'polygon':
      drawRegularPolygon(ctx, size, scaledStrokeWidth, shape.sides || 6);
      break;
    default:
      console.warn(`Unknown shape type: ${shapeType}. Drawing circle instead.`);
      drawCircle(ctx, size, scaledStrokeWidth); // Fallback to circle
  }
};

// --- Shape Drawing Functions --- //

/**
 * 绘制圆形路径（不填充或描边）
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} size
 * @param {number} strokeWidth
 */
const drawCircle = (ctx, size, strokeWidth) => {
  // Adjust radius for stroke width to keep the shape within bounds
  const radius = Math.max(0, size / 2 - strokeWidth / 2);
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
};

/**
 * 绘制方形路径
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} size
 * @param {number} strokeWidth
 */
const drawSquare = (ctx, size, strokeWidth) => {
  const half = Math.max(0, size / 2 - strokeWidth / 2);
  ctx.rect(-half, -half, half * 2, half * 2);
};

/**
 * 绘制矩形路径
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} size
 * @param {number} strokeWidth
 */
const drawRectangle = (ctx, size, strokeWidth) => {
  const width = Math.max(0, size - strokeWidth);
  const height = Math.max(0, size * 0.66 - strokeWidth);
  ctx.rect(-width / 2, -height / 2, width, height);
};

/**
 * 绘制六边形路径
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} size
 * @param {number} strokeWidth
 */
const drawHexagon = (ctx, size, strokeWidth) => {
  const radius = Math.max(0, size / 2 - strokeWidth / 2);
  for (let i = 0; i < 6; i++) {
    const angle = i * Math.PI / 3;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
};

/**
 * 绘制三角形路径
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} size
 * @param {number} strokeWidth
 */
const drawTriangle = (ctx, size, strokeWidth) => {
  const r = Math.max(0, size / 2 - strokeWidth / 2);
  ctx.moveTo(0, -r);
  ctx.lineTo(r * Math.cos(Math.PI / 6), r * Math.sin(Math.PI / 6));
  ctx.lineTo(-r * Math.cos(Math.PI / 6), r * Math.sin(Math.PI / 6));
  ctx.closePath();
};

/**
 * 绘制星形路径
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} size
 * @param {number} strokeWidth
 */
const drawStar = (ctx, size, strokeWidth) => {
  const outerRadius = Math.max(0, size / 2 - strokeWidth / 2);
  const innerRadius = outerRadius * 0.4;
  const points = 5;

  ctx.moveTo(0, -outerRadius); // Start at the top point
  for (let i = 0; i < points; i++) {
    // Outer point
    let angle = Math.PI / points * (2 * i) - Math.PI / 2;
    ctx.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
    // Inner point
    angle += Math.PI / points;
    ctx.lineTo(Math.cos(angle) * innerRadius, Math.sin(angle) * innerRadius);
  }
  ctx.closePath();
};


/**
 * 绘制菱形路径
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} size
 * @param {number} strokeWidth
 */
const drawDiamond = (ctx, size, strokeWidth) => {
  const half = Math.max(0, size / 2 - strokeWidth / 2);
  ctx.moveTo(0, -half);
  ctx.lineTo(half, 0);
  ctx.lineTo(0, half);
  ctx.lineTo(-half, 0);
  ctx.closePath();
};

/**
 * 绘制八边形路径
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} size
 * @param {number} strokeWidth
 */
const drawOctagon = (ctx, size, strokeWidth) => {
  const radius = Math.max(0, size / 2 - strokeWidth / 2);
  for (let i = 0; i < 8; i++) {
    const angle = i * Math.PI / 4;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
};

/**
 * 绘制椭圆路径
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} size
 * @param {number} strokeWidth
 */
const drawEllipse = (ctx, size, strokeWidth) => {
  const radiusX = Math.max(0, size / 2 - strokeWidth / 2);
  const radiusY = Math.max(0, (size / 2 - strokeWidth / 2) * 0.6);
  ctx.ellipse(0, 0, radiusX, radiusY, 0, 0, Math.PI * 2);
};

/**
 * 绘制十字形路径
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} size
 * @param {number} strokeWidth
 */
const drawCross = (ctx, size, strokeWidth) => {
  const length = Math.max(0, size / 2 - strokeWidth / 2);
  const width = length * 0.25;

  ctx.moveTo(-width, -length);
  ctx.lineTo(width, -length);
  ctx.lineTo(width, -width);
  ctx.lineTo(length, -width);
  ctx.lineTo(length, width);
  ctx.lineTo(width, width);
  ctx.lineTo(width, length);
  ctx.lineTo(-width, length);
  ctx.lineTo(-width, width);
  ctx.lineTo(-length, width);
  ctx.lineTo(-length, -width);
  ctx.lineTo(-width, -width);
  ctx.closePath();
};

/**
 * 绘制箭头路径
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} size
 * @param {number} strokeWidth
 */
const drawArrow = (ctx, size, strokeWidth) => {
  const length = Math.max(0, size / 2 - strokeWidth / 2);
  const headWidth = length * 0.4; // Width of the arrowhead
  const shaftWidth = headWidth * 0.5; // Width of the shaft
  const headLength = length * 0.5; // Length of the arrowhead part

  ctx.moveTo(0, -length); // Tip of the arrow
  ctx.lineTo(headWidth, -length + headLength); // Right corner of arrowhead base
  ctx.lineTo(shaftWidth, -length + headLength); // Right side of shaft top
  ctx.lineTo(shaftWidth, length); // Bottom right of shaft
  ctx.lineTo(-shaftWidth, length); // Bottom left of shaft
  ctx.lineTo(-shaftWidth, -length + headLength); // Left side of shaft top
  ctx.lineTo(-headWidth, -length + headLength); // Left corner of arrowhead base
  ctx.closePath();
};

/**
 * 绘制心形路径
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} size
 * @param {number} strokeWidth
 */
const drawHeart = (ctx, size, strokeWidth) => {
  // Scale factor based on size, adjusted for stroke width
  const effectiveRadius = Math.max(0, size / 2 - strokeWidth / 2);
  const scale = effectiveRadius / 12; // Original heart was roughly 24 units high

  ctx.moveTo(0, 2 * scale); // Bottom point of the heart

  // Left curve
  ctx.bezierCurveTo(
    -10 * scale, -8 * scale, // Control point 1
    -12 * scale, -5 * scale, // Control point 2, adjusted slightly
    0, -10 * scale // Top indent point, adjusted slightly
  );

  // Right curve (mirror image)
   ctx.bezierCurveTo(
    12 * scale, -5 * scale, // Control point 1
    10 * scale, -8 * scale, // Control point 2
    0, 2 * scale // Back to the bottom point
  );
  ctx.closePath();
};

/**
 * 绘制云朵路径
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} size
 * @param {number} strokeWidth
 */
const drawCloud = (ctx, size, strokeWidth) => {
    const r = Math.max(0, size * 0.15 - strokeWidth / 2); // Base radius
    const offsetX = size * 0.1;
    const offsetY = size * 0.05;

    ctx.arc(-r * 1.8 - offsetX, r * 0.5 + offsetY, r * 1.2, 0, Math.PI * 2); // Leftmost bubble
    ctx.arc(-r * 0.5 - offsetX, -r * 0.8 + offsetY, r * 1.5, 0, Math.PI * 2); // Top-left bubble
    ctx.arc(r * 1.5 + offsetX, -r * 0.5 + offsetY, r * 1.3, 0, Math.PI * 2); // Top-right bubble
    ctx.arc(r * 2.0 + offsetX, r * 0.8 + offsetY, r, 0, Math.PI * 2); // Rightmost bubble
    ctx.ellipse(0, r * 1.2 + offsetY, size * 0.4, size * 0.15, 0, 0, Math.PI * 2); // Bottom base
    // Note: This creates separate paths. For a single cloud outline, need lineTo/arcTo.
    // Let's try a single path approach
    ctx.beginPath();
    const baseWidth = size * 0.8 - strokeWidth;
    const baseHeight = size * 0.3 - strokeWidth;
    const bubbleRadius = size * 0.18 - strokeWidth / 2;

    ctx.ellipse(0, size * 0.1, baseWidth / 2, baseHeight / 2, 0, 0, Math.PI * 2); // Base ellipse (hidden)
    // Let's draw bubbles instead
    ctx.moveTo(0, 0); // Start somewhere center-ish
    ctx.arc(-size * 0.25, size * 0.1, bubbleRadius * 1.1, Math.PI * 0.8, Math.PI * 1.9);
    ctx.arc(0, -size * 0.1, bubbleRadius * 1.3, Math.PI * 1.2, Math.PI * 0.1, false);
    ctx.arc(size * 0.25, size * 0.05, bubbleRadius * 1.0, Math.PI * 1.6, Math.PI * 0.6, false);
    ctx.arc(size * 0.1, size * 0.2, bubbleRadius * 0.9, 0, Math.PI ); // Bottom curve part
    ctx.closePath();


};

/**
 * 绘制正多边形路径
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} size
 * @param {number} strokeWidth
 * @param {number} sides
 */
const drawRegularPolygon = (ctx, size, strokeWidth, sides) => {
  const radius = Math.max(0, size / 2 - strokeWidth / 2);
  sides = Math.max(3, sides); // Ensure at least 3 sides
  const angleStep = (Math.PI * 2) / sides;

  ctx.moveTo(radius, 0); // Start at (radius, 0)
  for (let i = 1; i <= sides; i++) {
    const angle = i * angleStep;
    ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
  }
  // ctx.closePath(); // Already closed by lineTo the start
};

// --- Styling --- //

/**
 * 应用样式到画布（填充或描边）
 * @param {CanvasRenderingContext2D} ctx - 2D渲染上下文
 * @param {boolean} forClipping - 如果为 true，则只填充白色（用于裁剪）。否则，应用描边和填充（如果宽度>0）。
 * @param {number} nodeStrokeWidth - 原始节点描边宽度（用于判断是否需要描边）。
 * @param {string} nodeStrokeColor - 描边颜色。
 * @param {number} scaledStrokeWidth - 缩放后的描边宽度。
 */
const applyStyle = (ctx, forClipping, nodeStrokeWidth, nodeStrokeColor, scaledStrokeWidth) => {
  if (forClipping) {
    ctx.fillStyle = 'white'; // Use white for clipping masks
    ctx.fill();
  } else {
    // Fill with white first to ensure stroke is drawn correctly if path isn't closed
    ctx.fillStyle = 'white';
    ctx.fill();
    if (nodeStrokeWidth > 0) {
      ctx.lineWidth = scaledStrokeWidth;
      ctx.strokeStyle = nodeStrokeColor;
      ctx.stroke();
    }
  }
}; 