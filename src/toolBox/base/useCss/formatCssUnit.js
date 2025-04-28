/**
 * @description 提供 CSS 长度单位格式化函数。
 */

// 长度单位
export const px = (value) => `${value}px`;
export const em = (value) => `${value}em`;
export const rem = (value) => `${value}rem`;
export const percent = (value) => `${value}%`;
export const per = percent; // 别名
export const vw = (value) => `${value}vw`;
export const vh = (value) => `${value}vh`;
export const vmin = (value) => `${value}vmin`;
export const vmax = (value) => `${value}vmax`;
export const ch = (value) => `${value}ch`;
export const ex = (value) => `${value}ex`;

// 绝对长度单位
export const cm = (value) => `${value}cm`;
export const mm = (value) => `${value}mm`;
export const inch = (value) => `${value}in`;
export const pt = (value) => `${value}pt`;
export const pc = (value) => `${value}pc`;

// 无单位值
export const none = (value) => `${value}`; 