/**
 * @file 计算颜色相似度的工具函数
 * 包含 CIE76 和带缓存的 CIEDE2000 (RGBA 输入) 色差计算方法。
 */

import { fromRgbToLab } from '../../base/forColor/colorSpace.js';
import { CIEDE2000 } from '../forColors/useCIEDE2000.js'; // 直接从源文件导入

/**
 * 计算两个 RGB 颜色之间的 CIE76 色差。
 * 这是基于 RGB 空间欧氏距离的简单计算。
 * @param {number[]} color1 - 第一个颜色数组 [r, g, b]。
 * @param {number[]} color2 - 第二个颜色数组 [r, g, b]。
 * @returns {number} CIE76 色差值。
 */
export function computeCIE76Difference(color1, color2) {
    let r1 = color1[0];
    let g1 = color1[1];
    let b1 = color1[2];

    let r2 = color2[0];
    let g2 = color2[1];
    let b2 = color2[2];

    let deltaR = r1 - r2;
    let deltaG = g1 - g2;
    let deltaB = b1 - b2;
    let deltaE = Math.sqrt(deltaR * deltaR + deltaG * deltaG + deltaB * deltaB);

    return deltaE;
}

// 内部缓存，用于存储 CIEDE2000 计算结果
const ciede2000Cache = new Map();

/**
 * 计算两个 RGBA 颜色之间的 CIEDE2000 色差，并使用缓存。
 * CIEDE2000 是更符合人类视觉感知的色差算法。
 * Alpha 通道被忽略。
 * @param {number[]} pix1 - 第一个颜色数组 [r, g, b, a?]。
 * @param {number[]} pix2 - 第二个颜色数组 [r, g, b, a?]。
 * @returns {number} CIEDE2000 色差值。转换失败时返回 100。
 */
export function computeCIEDE2000DifferenceRGBA(pix1, pix2) {
    // 对输入进行取整，确保缓存键的一致性
    const p1 = pix1.slice(0, 3).map(Math.floor);
    const p2 = pix2.slice(0, 3).map(Math.floor);

    const key1 = p1.join(',');
    const key2 = p2.join(',');
    // 生成规范的缓存键，顺序不影响结果
    const cacheKey = key1 < key2 ? key1 + '|' + key2 : key2 + '|' + key1;

    if (ciede2000Cache.has(cacheKey)) {
        return ciede2000Cache.get(cacheKey);
    }

    // 转换为 LAB 对象
    const rgb1 = { r: p1[0], g: p1[1], b: p1[2] };
    const rgb2 = { r: p2[0], g: p2[1], b: p2[2] };

    const lab1 = fromRgbToLab(rgb1);
    const lab2 = fromRgbToLab(rgb2);

    if (!lab1 || !lab2) {
        console.warn("computeCIEDE2000DifferenceRGBA: RGB to LAB 转换失败", { rgb1, rgb2, lab1, lab2 });
        return 100; // 转换失败，返回最大差异值
    }

    // 计算 CIEDE2000 色差
    const result = CIEDE2000(lab1, lab2);
    ciede2000Cache.set(cacheKey, result);
    return result;
}

/**
 * 清除 CIEDE2000 计算缓存。
 */
export function clearCIEDE2000Cache() {
    ciede2000Cache.clear();
} 