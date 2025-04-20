/**
 * @fileoverview Provides a simple function to compute a hash based on image pixel data.
 */

/**
 * Computes a simple hash string based on the grayscale values of image pixel data.
 * This hash is suitable for quick equality checks but not for similarity comparisons.
 *
 * @param {Uint8ClampedArray|Uint8Array|number[]} data - Flat array of pixel data (RGBA format).
 * @returns {string} A hexadecimal hash string.
 */
export const computeImageDataHash = (data) => {
    let hash = 0;
    // Process pixel data in RGBA chunks
    for (let i = 0; i < data.length; i += 4) {
        // Calculate grayscale value using standard luminance formula
        const gray = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) | 0; // '| 0' truncates to integer
        // Combine the grayscale value into the hash using a simple rolling hash algorithm (djb2 variation?)
        hash = ((hash << 5) - hash + gray) | 0; // '| 0' keeps the hash as a 32-bit integer
    }
    // Convert the final integer hash to a hexadecimal string
    return hash.toString(16);
}; 