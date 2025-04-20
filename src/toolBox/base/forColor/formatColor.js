/**
 * @fileoverview 提供颜色数组到 CSS 字符串格式的转换函数。
 */

/**
 * 将 RGBA 数组转换为 CSS rgba() 字符串。
 * @param {number[]} rgba - 包含红、绿、蓝、透明度通道值的数组，例如 [255, 0, 0, 0.5]。
 * @returns {string | null} CSS rgba 字符串，例如 "rgba(255,0,0,0.5)"。如果输入无效则返回 null。
 */
export const fromRgbaArrayToString = (rgba) => {
  if (!Array.isArray(rgba) || rgba.length < 4 || rgba.slice(0, 4).some(c => typeof c !== 'number')) {
    console.warn('fromRgbaArrayToString: 输入必须是至少包含4个数字的数组。', rgba);
    return null;
  }
  return `rgba(${Math.round(rgba[0])},${Math.round(rgba[1])},${Math.round(rgba[2])},${rgba[3]})`;
};

/**
 * 将 RGB 数组转换为 CSS rgb() 字符串。
 * @param {number[]} rgb - 包含红、绿、蓝通道值的数组，例如 [255, 0, 0]。
 * @returns {string | null} CSS rgb 字符串，例如 "rgb(255,0,0)"。如果输入无效则返回 null。
 */
export const fromRgbArrayToString = (rgb) => {
  if (!Array.isArray(rgb) || rgb.length < 3 || rgb.slice(0, 3).some(c => typeof c !== 'number')) {
    console.warn('fromRgbArrayToString: 输入必须是至少包含3个数字的数组。', rgb);
    return null;
  }
  return `rgb(${Math.round(rgb[0])},${Math.round(rgb[1])},${Math.round(rgb[2])})`;
}; 