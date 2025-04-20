/**
 * @fileoverview 提供颜色亮度计算相关的工具函数。
 */

import { fromHexToRgb } from './colorSpace.js'; // Import the conversion function

/**
 * 定义可用的亮度计算标准。
 * - YIQ: (默认) 基于 NTSC 电视标准，常用且快速。
 * - REC709: 用于 HDTV 的标准。
 * - REC2020: 用于 UHDTV 的标准。
 * - HSP: 基于人眼对颜色的感知模型。
 */
export const LUMINANCE_METHODS = {
  YIQ: 'YIQ', // Also CIE standard luminance
  REC709: 'REC709',
  REC2020: 'REC2020',
  HSP: 'HSP',
};

/**
 * 计算给定 RGB 颜色对象的亮度值。
 *
 * @param {{r: number, g: number, b: number}} rgb - RGB 颜色对象 {r, g, b} [0-255]。
 * @param {string} [method=LUMINANCE_METHODS.YIQ] - 使用的亮度计算方法。
 * @returns {number | null} 计算出的亮度值 (0-255 范围)。如果方法无效则返回 null。
 */
export const computeRgbLuminance = (rgb, method = LUMINANCE_METHODS.YIQ) => {
  if (!rgb || typeof rgb.r !== 'number' || typeof rgb.g !== 'number' || typeof rgb.b !== 'number') {
    console.warn('computeRgbLuminance: 输入必须是有效的 RGB 对象。', rgb);
    return null;
  }
  const { r, g, b } = rgb;

  // 归一化到 0-1 用于某些计算
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  let luminance;

  switch (method) {
    case LUMINANCE_METHODS.YIQ:
      // L = 0.299*R + 0.587*G + 0.114*B
      luminance = (r * 299 + g * 587 + b * 114) / 1000;
      break;
    case LUMINANCE_METHODS.REC709:
      // L = 0.2126*R + 0.7152*G + 0.0722*B (Using normalized values)
      luminance = (0.2126 * rNorm + 0.7152 * gNorm + 0.0722 * bNorm) * 255;
      break;
    case LUMINANCE_METHODS.REC2020:
      // L = 0.2627*R + 0.6780*G + 0.0593*B (Using normalized values)
      luminance = (0.2627 * rNorm + 0.6780 * gNorm + 0.0593 * bNorm) * 255;
      break;
    case LUMINANCE_METHODS.HSP:
      // L = sqrt(0.299*R^2 + 0.587*G^2 + 0.114*B^2)
      luminance = Math.sqrt(
        0.299 * (r * r) +
        0.587 * (g * g) +
        0.114 * (b * b)
      );
      break;
    default:
      console.warn('computeRgbLuminance: 未知的亮度计算方法。', method);
      return null;
  }

  // Clamp result to 0-255
  return Math.min(255, Math.max(0, luminance));
};


/**
 * 计算给定十六进制颜色字符串的亮度值。
 *
 * @param {string} hexColor - 十六进制颜色字符串 (例如 "#RRGGBB" 或 "RRGGBB")。
 * @param {string} [method=LUMINANCE_METHODS.YIQ] - 使用的亮度计算方法。
 * @returns {number | null} 计算出的亮度值 (0-255 范围)。如果输入格式无效则返回 null。
 */
export const computeHexLuminance = (hexColor, method = LUMINANCE_METHODS.YIQ) => {
  const rgb = fromHexToRgb(hexColor);
  if (!rgb) {
    // Warning handled by fromHexToRgb
    return null;
  }
  return computeRgbLuminance(rgb, method);
}; 