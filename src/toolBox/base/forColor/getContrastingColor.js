/**
 * @fileoverview Provides functions to determine contrasting colors.
 */

import { computeHexLuminance } from "./computeColorLuminance.js";

// Default threshold for deciding between black and white text.
// Based on typical luminance range [0, 255].
const DEFAULT_LUMINANCE_THRESHOLD = 128;

/**
 * Determines whether black or white text provides better contrast against a given background color.
 *
 * @param {string} hexBackgroundColor - The background color in hex format (e.g., "#RRGGBB" or "RRGGBB").
 * @param {number} [luminanceThreshold=DEFAULT_LUMINANCE_THRESHOLD] - The luminance threshold (0-255) to switch between black and white text.
 * @returns {string} '#000000' (black) or '#ffffff' (white).
 */
export const getContrastingTextColor = (hexBackgroundColor, luminanceThreshold = DEFAULT_LUMINANCE_THRESHOLD) => {
    const luminance = computeHexLuminance(hexBackgroundColor);

    // Default to black if luminance calculation fails (e.g., invalid input)
    if (luminance === null) {
        console.warn('getContrastingTextColor: Could not compute luminance for background color. Defaulting to black text.', hexBackgroundColor);
        return '#000000';
    }

    return luminance >= luminanceThreshold ? '#000000' : '#ffffff';
}; 