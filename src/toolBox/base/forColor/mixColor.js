/**
 * @fileoverview Provides functions for mixing colors.
 */

import { fromRgbToHsl, fromHslToRgb } from './colorSpace.js';

/**
 * Mixes two pigment colors based on HSL color space interpolation.
 * This simulates subtractive mixing more intuitively for pigments than simple RGB average.
 *
 * @param {{r: number, g: number, b: number}} color1 - The first RGB color object.
 * @param {{r: number, g: number, b: number}} color2 - The second RGB color object.
 * @param {number} [ratio=0.5] - The mixing ratio (0 to 1). 0 means color1, 1 means color2.
 * @returns {{r: number, g: number, b: number}} The resulting mixed RGB color object.
 */
export const computeMixedPigmentsRgb = (color1, color2, ratio = 0.5) => {
    const hsl1 = fromRgbToHsl(color1);
    const hsl2 = fromRgbToHsl(color2);

    let h1 = hsl1.h * 360;
    let h2 = hsl2.h * 360;

    // Adjust hue difference to take the shortest path
    if (Math.abs(h1 - h2) > 180) {
        if (h1 > h2) h2 += 360;
        else h1 += 360;
    }

    // Mix hue linearly on the adjusted scale
    const hue = ((h1 * (1 - ratio) + h2 * ratio) % 360) / 360;

    // Mix saturation using root mean square for a potentially richer result
    const sat = Math.sqrt(
        hsl1.s ** 2 * (1 - ratio) + hsl2.s ** 2 * ratio
    );

    // Mix lightness non-linearly, potentially darkening slightly like pigments
    // The power 0.8 slightly boosts lightness compared to linear, adjust if needed
    const light = Math.min(1,
        (hsl1.l ** (1 / 0.8) * (1 - ratio) + hsl2.l ** (1 / 0.8) * ratio) ** 0.8
        // Original implementation used: Math.pow(hsl1.l * (1 - ratio) + hsl2.l * ratio, 0.8)
        // The above alternative provides a different mixing curve for lightness.
    );

    const rgb = fromHslToRgb({ h: hue, s: sat, l: light });

    return {
        r: Math.round(rgb.r),
        g: Math.round(rgb.g),
        b: Math.round(rgb.b),
    };
}; 