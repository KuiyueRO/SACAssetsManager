/**
 * @file 生成基于 HSL 色彩空间的配色方案工具函数
 */

import { fromRgbToHsl, fromHslToRgb } from '../../base/forColor/colorSpace.js';

/**
 * 计算给定 RGB 颜色的互补色。
 * @param {{r: number, g: number, b: number}} rgb - 原始 RGB 颜色值对象。
 * @returns {{r: number, g: number, b: number}} 互补色的 RGB 颜色值对象。
 */
export function computeComplementaryColor(rgb) {
    const hsl = fromRgbToHsl(rgb);
    if (!hsl) return rgb; // 转换失败则返回原色
    const complementaryHue = (hsl.h + 0.5) % 1;
    return fromHslToRgb({ h: complementaryHue, s: hsl.s, l: hsl.l });
}

/**
 * 计算给定 RGB 颜色的分裂互补色方案。
 * @param {{r: number, g: number, b: number}} rgb - 原始 RGB 颜色值对象。
 * @param {number} [angle=30] - 分裂角度（度数，默认30度）。
 * @returns {Array<{r: number, g: number, b: number}>} 包含三个颜色的数组：原色和两个分裂互补色。
 */
export function computeSplitComplementaryScheme(rgb, angle = 30) {
    const hsl = fromRgbToHsl(rgb);
    if (!hsl) return [rgb, rgb, rgb]; // 转换失败则返回原色
    const complementaryHue = (hsl.h + 0.5) % 1;
    const angleInHue = angle / 360;
    const split1 = (complementaryHue + angleInHue) % 1;
    const split2 = (complementaryHue - angleInHue + 1) % 1;

    return [
        rgb,
        fromHslToRgb({ h: split1, s: hsl.s, l: hsl.l }),
        fromHslToRgb({ h: split2, s: hsl.s, l: hsl.l })
    ];
}

/**
 * 计算给定 RGB 颜色的三色组（三角形）配色方案。
 * @param {{r: number, g: number, b: number}} rgb - 原始 RGB 颜色值对象。
 * @returns {Array<{r: number, g: number, b: number}>} 包含三个颜色的数组。
 */
export function computeTriadicScheme(rgb) {
    const hsl = fromRgbToHsl(rgb);
    if (!hsl) return [rgb, rgb, rgb];
    const triad1 = (hsl.h + 1/3) % 1;
    const triad2 = (hsl.h + 2/3) % 1;

    return [
        rgb,
        fromHslToRgb({ h: triad1, s: hsl.s, l: hsl.l }),
        fromHslToRgb({ h: triad2, s: hsl.s, l: hsl.l })
    ];
}

/**
 * 计算给定 RGB 颜色的四色组（四角形/矩形）配色方案。
 * @param {{r: number, g: number, b: number}} rgb - 原始 RGB 颜色值对象。
 * @returns {Array<{r: number, g: number, b: number}>} 包含四个颜色的数组。
 */
export function computeTetradicScheme(rgb) {
    const hsl = fromRgbToHsl(rgb);
    if (!hsl) return [rgb, rgb, rgb, rgb];
    const tetrad1 = (hsl.h + 0.25) % 1;
    const tetrad2 = (hsl.h + 0.5) % 1;
    const tetrad3 = (hsl.h + 0.75) % 1;

    return [
        rgb,
        fromHslToRgb({ h: tetrad1, s: hsl.s, l: hsl.l }),
        fromHslToRgb({ h: tetrad2, s: hsl.s, l: hsl.l }),
        fromHslToRgb({ h: tetrad3, s: hsl.s, l: hsl.l })
    ];
}

/**
 * 计算给定 RGB 颜色的类比色配色方案。
 * @param {{r: number, g: number, b: number}} rgb - 原始 RGB 颜色值对象。
 * @param {number} [angle=30] - 角度间隔（度数，默认30度）。
 * @returns {Array<{r: number, g: number, b: number}>} 包含三个颜色的数组：原色和两个类比色。
 */
export function computeAnalogousScheme(rgb, angle = 30) {
    const hsl = fromRgbToHsl(rgb);
    if (!hsl) return [rgb, rgb, rgb];
    const angleInHue = angle / 360;
    const analogous1 = (hsl.h + angleInHue) % 1;
    const analogous2 = (hsl.h - angleInHue + 1) % 1;

    return [
        rgb,
        fromHslToRgb({ h: analogous1, s: hsl.s, l: hsl.l }),
        fromHslToRgb({ h: analogous2, s: hsl.s, l: hsl.l })
    ];
} 