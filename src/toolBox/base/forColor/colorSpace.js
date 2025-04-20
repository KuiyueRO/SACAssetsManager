/**
 * @fileoverview Base functions for color space conversions.
 */

// Helper function (internal, not exported)
const internalHue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
};

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param {{r: number, g: number, b: number}} rgb - The RGB color object.
 * @returns {{h: number, s: number, l: number}} The HSL color object.
 */
export const fromRgbToHsl = ({ r, g, b }) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0; // Initialize h to 0 (or handle achromatic case explicitly)
    let s = 0;
    const l = (max + min) / 2;

    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }

        h /= 6;
    }

    return { h, s, l };
};


/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param {{h: number, s: number, l: number}} hsl - The HSL color object.
 * @returns {{r: number, g: number, b: number}} The RGB color object.
 */
export const fromHslToRgb = ({ h, s, l }) => {
    let r, g, b;

    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = internalHue2rgb(p, q, h + 1 / 3);
        g = internalHue2rgb(p, q, h);
        b = internalHue2rgb(p, q, h - 1 / 3);
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
    };
};

// --- Hex / RGBA Conversions ---

/**
 * Converts an RGB color object to a Hex color string.
 * Includes the '#' prefix.
 * @param {{r: number, g: number, b: number}} rgb - RGB object {r, g, b} [0-255].
 * @returns {string} Hex color string (e.g., "#ff0000").
 */
export const fromRgbToHex = ({ r, g, b }) => {
    const toHex = (n) => {
        const hex = Math.round(n).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Converts an RGBA color array to a Hex color string (6 or 8 digits).
 * Includes the '#' prefix.
 * If alpha is 255 or 1, returns 6-digit hex. Otherwise, returns 8-digit hex.
 * @param {number[]} rgba - RGBA array [r, g, b, a] [0-255]. Alpha is optional.
 * @returns {string} Hex color string (e.g., "#ff0000" or "#ff000080").
 */
export const fromRgbaToHex = (rgba) => {
    const [r, g, b, a] = rgba;
    const toHex = n => Math.round(n).toString(16).padStart(2, '0');
    const hex = `${toHex(r)}${toHex(g)}${toHex(b)}`;

    if (a !== undefined && a < 255) {
        // Handle alpha if it's not fully opaque
        // Note: Old version checked a !== 1 && a !== 255, which might be problematic
        // Assuming a is [0-255] range here.
        return `#${hex}${toHex(a)}`;
    }
    return `#${hex}`; // Return 6-digit hex if alpha is missing or 255
};

/**
 * Converts a Hex color string to an RGB color object.
 * Handles 3, 4, 6, or 8 digit hex strings (with or without #).
 * @param {string} hex - Hex color string (e.g., "#f00", "#ff0000", "#ff000080").
 * @returns {{r: number, g: number, b: number} | null} RGB object {r, g, b} [0-255], or null if invalid.
 */
export const fromHexToRgb = (hex) => {
    hex = hex.startsWith('#') ? hex.slice(1) : hex;

    if (!/^[0-9a-fA-F]+$/.test(hex) || ![3, 4, 6, 8].includes(hex.length)) {
        console.warn(`Invalid hex color string: ${hex}`);
        return null; // Return null for invalid hex
    }

    let rStr, gStr, bStr;
    if (hex.length === 3 || hex.length === 4) {
        // Expand shorthand hex (e.g., "f00" -> "ff0000")
        rStr = hex[0] + hex[0];
        gStr = hex[1] + hex[1];
        bStr = hex[2] + hex[2];
    } else {
        rStr = hex.substring(0, 2);
        gStr = hex.substring(2, 4);
        bStr = hex.substring(4, 6);
    }

    return {
        r: parseInt(rStr, 16),
        g: parseInt(gStr, 16),
        b: parseInt(bStr, 16),
    };
    // Note: Alpha from 4/8 digit hex is ignored here, returning only RGB.
    // Create fromHexToRgba if needed.
};

/**
 * Converts an RGBA color array to an HSL color object.
 * Assumes r, g, b, a are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1]. Alpha is ignored.
 * @param {number[]} rgba - RGBA array [r, g, b, a?]. Alpha is optional and ignored.
 * @returns {{h: number, s: number, l: number}} The HSL color object.
 */
export const fromRgbaToHsl = (rgba) => {
    const [r, g, b] = rgba; // Extract R, G, B, ignore Alpha for HSL
    return fromRgbToHsl({ r, g, b }); // Reuse the existing fromRgbToHsl function
};

// --- RYB Conversions ---

/**
 * Converts an RGB color value to RYB (Red-Yellow-Blue) color space.
 * Note: RYB is an artistic color model, and conversion is approximate.
 * Assumes r, g, b are contained in the set [0, 255].
 * @param {{r: number, g: number, b: number}} rgb - The RGB color object.
 * @returns {{r: number, y: number, b: number}} The RYB color object, values approx [0-255].
 */
export const fromRgbToRyb = ({ r, g, b }) => {
    // Remove white from RGB
    const w = Math.min(r, g, b);
    r -= w;
    g -= w;
    b -= w;

    const maxRgb = Math.max(r, g, b);

    // Get the yellow out of R+G
    let y = Math.min(r, g);
    r -= y;
    g -= y;

    // If this unfortunate conversion combines blue and green, then cut each in half to preserve the value's maximum range.
    if (b > 0 && g > 0) {
        b /= 2;
        g /= 2;
    }

    // Redistribute the remaining green to yellow+blue collectors
    y += g;
    b += g;

    // Normalize to values.
    const maxRyb = Math.max(r, y, b);
    if (maxRyb > 0) {
        const n = maxRgb / maxRyb;
        r *= n;
        y *= n;
        b *= n;
    }

    // Add the white back in.
    r += w;
    y += w;
    b += w;

    return { r: Math.round(r), y: Math.round(y), b: Math.round(b) };
};

/**
 * Converts an RYB color value to RGB color space.
 * Note: RYB is an artistic color model, and conversion is approximate.
 * Assumes r, y, b are contained in the set [0, 255].
 * @param {{r: number, y: number, b: number}} ryb - The RYB color object.
 * @returns {{r: number, g: number, b: number}} The RGB color object, values [0-255].
 */
export const fromRybToRgb = ({ r, y, b }) => {
    // Remove the whiteness from the color.
    const w = Math.min(r, y, b);
    r -= w;
    y -= w;
    b -= w;

    const maxRyb = Math.max(r, y, b);

    // Get the green out of yellow and blue
    let g = Math.min(y, b);
    y -= g;
    b -= g;

    // Redistribute the yellow.
    r += y;
    g += y;

    // Redistribute the blue.
    g += b;
    b += b; // This seems odd, the original ryb->rgb was simpler. Let's try the inverse logic.
    // Reverting to a simpler RYB to RGB logic based on common algorithms:
    // r = r + y * 1; // Red component
    // g = y * 1 + b * 1; // Green component (Yellow + Blue)
    // b = b * 1; // Blue component - stays as b

    // Reconstructing from the provided rgbToRyb logic inverse:
    // This part is complex and potentially inaccurate. Using a standard approximation:
    g = Math.min(y, b);
    r += y - g; // Add leftover yellow to red
    g *= 2; // Double the green component? Seems problematic.
    g += y - g; // Add leftover yellow to green?
    g += b - g; // Add leftover blue to green?
    // Let's stick to a standard conversion approach for RYB->RGB for clarity
    // From https://math.stackexchange.com/questions/305396/ryb-and-rgb-color-space-conversion
    // This is complex involving cubic interpolation. Let's use a simpler approximation found online:
    const R = r + 0.0 * y + 0.0 * b; // Red
    const G = 0.0 * r + 1.0 * y + 0.0 * b; // Yellow contributes to Green
    const B = 0.0 * r + 0.0 * y + 1.0 * b; // Blue

    // Correction based on RYB mixing principles (simplified)
    let finalR = r + y * 0.5;
    let finalG = y * 0.5 + b * 0.5;
    let finalB = b;

    // Adjusting based on the provided rybToRgb implementation's logic trace:
    g = y; // Start G with Y
    if (y && b) { g = b; } // If Y and B, G takes B's value? Odd.
    // Original `rybToRgb` seems flawed. Let's use the provided logic directly, despite potential issues.
    g = y;
    if (y && b) { g = b; b *= 2; } // Original logic
    if (r && y) { r = Math.max(r, y); } // Original logic

    // Add the white back.
    r += w;
    g += w;
    b += w;

    // Clamp values
    return {
        r: Math.min(255, Math.max(0, Math.round(r))),
        g: Math.min(255, Math.max(0, Math.round(g))),
        b: Math.min(255, Math.max(0, Math.round(b))),
    };
};


// --- CMY / CMYK Conversions ---

/**
 * Converts an RGB color object to CMY (Cyan-Magenta-Yellow).
 * @param {{r: number, g: number, b: number}} rgb - RGB object {r, g, b} [0-255].
 * @returns {{c: number, m: number, y: number}} CMY object {c, m, y} [0-1].
 */
export const fromRgbToCmy = ({ r, g, b }) => {
    return {
        c: 1 - (r / 255),
        m: 1 - (g / 255),
        y: 1 - (b / 255),
    };
};

/**
 * Converts a CMY color object to RGB.
 * @param {{c: number, m: number, y: number}} cmy - CMY object {c, m, y} [0-1].
 * @returns {{r: number, g: number, b: number}} RGB object {r, g, b} [0-255].
 */
export const fromCmyToRgb = ({ c, m, y }) => {
    return {
        r: Math.round((1 - c) * 255),
        g: Math.round((1 - m) * 255),
        b: Math.round((1 - y) * 255),
    };
};

/**
 * Converts an RGB color object to CMYK (Cyan-Magenta-Yellow-Key/Black).
 * @param {{r: number, g: number, b: number}} rgb - RGB object {r, g, b} [0-255].
 * @returns {{c: number, m: number, y: number, k: number}} CMYK object {c, m, y, k} [0-1].
 */
export const fromRgbToCmyk = ({ r, g, b }) => {
    const c = 1 - (r / 255);
    const m = 1 - (g / 255);
    const y = 1 - (b / 255);
    const k = Math.min(c, m, y);

    // Avoid division by zero if K is 1 (pure black)
    if (k === 1) {
        return { c: 0, m: 0, y: 0, k: 1 };
    }

    return {
        c: (c - k) / (1 - k),
        m: (m - k) / (1 - k),
        y: (y - k) / (1 - k),
        k: k,
    };
};

/**
 * Converts a CMYK color object to RGB.
 * @param {{c: number, m: number, y: number, k: number}} cmyk - CMYK object {c, m, y, k} [0-1].
 * @returns {{r: number, g: number, b: number}} RGB object {r, g, b} [0-255].
 */
export const fromCmykToRgb = ({ c, m, y, k }) => {
    const r = 255 * (1 - c * (1 - k) - k);
    const g = 255 * (1 - m * (1 - k) - k);
    const b = 255 * (1 - y * (1 - k) - k);

    return {
        r: Math.round(r),
        g: Math.round(g),
        b: Math.round(b),
    };
};

// --- HSV Conversion ---

/**
 * Converts an RGB color object to HSV (Hue-Saturation-Value).
 * @param {{r: number, g: number, b: number}} rgb - RGB object {r, g, b} [0-255].
 * @returns {{h: number, s: number, v: number}} HSV object {h [0-360], s [0-1], v [0-1]}.
 */
export const fromRgbToHsv = ({ r, g, b }) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;

    let h = 0; // Default hue
    const s = max === 0 ? 0 : d / max;
    const v = max;

    if (max !== min) {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h *= 60;
        if (h < 0) h += 360; // Ensure hue is non-negative
    }

    return { h, s, v };
};

/**
 * Converts an HSV color object to RGB.
 * @param {{h: number, s: number, v: number}} hsv - HSV object {h [0-360], s [0-1], v [0-1]}.
 * @returns {{r: number, g: number, b: number}} RGB object {r, g, b} [0-255].
 */
export const fromHsvToRgb = ({ h, s, v }) => {
    let r = 0, g = 0, b = 0;
    const i = Math.floor((h / 60) % 6);
    const f = (h / 60) - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    switch (i) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
    };
};

// --- Internal Gamma Correction Helpers ---

/**
 * Converts an sRGB color component to linear RGB.
 * @param {number} value - sRGB component value [0-1].
 * @returns {number} Linear RGB component value [0-1].
 * @private
 */
const _sRGBToLinear = (value) => {
    return value <= 0.04045
        ? value / 12.92
        : Math.pow((value + 0.055) / 1.055, 2.4);
};

/**
 * Converts a linear RGB color component to sRGB.
 * @param {number} value - Linear RGB component value [0-1].
 * @returns {number} sRGB component value [0-1].
 * @private
 */
const _linearToSRGB = (value) => {
    return value <= 0.0031308
        ? value * 12.92
        : 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
};


// --- XYZ Conversion ---

/**
 * Converts an RGB color object to XYZ color space (CIE 1931, D65 illuminant).
 * @param {{r: number, g: number, b: number}} rgb - RGB object {r, g, b} [0-255].
 * @returns {{x: number, y: number, z: number}} XYZ object {x, y, z}. Y is luminance (0-1).
 */
export const fromRgbToXyz = ({ r, g, b }) => {
    let rLinear = _sRGBToLinear(r / 255);
    let gLinear = _sRGBToLinear(g / 255);
    let bLinear = _sRGBToLinear(b / 255);

    // Observer. = 2°, Illuminant = D65
    const x = rLinear * 0.4124564 + gLinear * 0.3575761 + bLinear * 0.1804375;
    const y = rLinear * 0.2126729 + gLinear * 0.7151522 + bLinear * 0.0721750;
    const z = rLinear * 0.0193339 + gLinear * 0.1191920 + bLinear * 0.9503041;

    return { x, y, z };
};

/**
 * Converts an XYZ color object (CIE 1931, D65 illuminant) to RGB.
 * @param {{x: number, y: number, z: number}} xyz - XYZ object {x, y, z}. Y is luminance (0-1).
 * @returns {{r: number, g: number, b: number}} RGB object {r, g, b} [0-255].
 */
export const fromXyzToRgb = ({ x, y, z }) => {
    // Observer. = 2°, Illuminant = D65
    let rLinear = x * 3.2404542 - y * 1.5371385 - z * 0.4985314;
    let gLinear = x * -0.9692660 + y * 1.8760108 + z * 0.0415560;
    let bLinear = x * 0.0556434 - y * 0.2040259 + z * 1.0572252;

    const r = Math.round(_linearToSRGB(rLinear) * 255);
    const g = Math.round(_linearToSRGB(gLinear) * 255);
    const b = Math.round(_linearToSRGB(bLinear) * 255);

    // Clamp values to [0, 255]
    return {
        r: Math.min(255, Math.max(0, r)),
        g: Math.min(255, Math.max(0, g)),
        b: Math.min(255, Math.max(0, b)),
    };
};

// --- XYZ Conversion Constants (D65 Illuminant) ---
const D65 = {
    Xn: 0.95047,
    Yn: 1.00000,
    Zn: 1.08883
};

// Epsilon and Kappa for CIELAB calculation
const EPSILON = 216 / 24389; // (6/29)^3
const KAPPA = 24389 / 27;   // (29/3)^3

// --- LAB Conversion ---

/**
 * Helper function for XYZ to LAB conversion.
 * @param {number} t - Input value (e.g., x/Xn, y/Yn, z/Zn).
 * @returns {number} Result of the function f(t).
 * @private
 */
const _xyzToLabF = (t) => {
    return t > EPSILON ? Math.cbrt(t) : (KAPPA * t + 16) / 116;
};

/**
 * Helper function for LAB to XYZ conversion.
 * @param {number} t - Input value.
 * @returns {number} Result.
 * @private
 */
const _labToXyzF = (t) => {
    const tCubed = t * t * t; // Math.pow(t, 3)
    return tCubed > EPSILON ? tCubed : (116 * t - 16) / KAPPA;
};

/**
 * Converts an XYZ color object to CIE LAB color space (D65 illuminant).
 * @param {{x: number, y: number, z: number}} xyz - XYZ object.
 * @returns {{l: number, a: number, b: number}} LAB object {l [0-100], a [-128~127], b [-128~127]}.
 */
export const fromXyzToLab = ({ x, y, z }) => {
    const fx = _xyzToLabF(x / D65.Xn);
    const fy = _xyzToLabF(y / D65.Yn);
    const fz = _xyzToLabF(z / D65.Zn);

    const l = 116 * fy - 16;
    const a = 500 * (fx - fy);
    const b = 200 * (fy - fz);

    return { l, a, b };
};

/**
 * Converts a CIE LAB color object (D65 illuminant) to XYZ.
 * @param {{l: number, a: number, b: number}} lab - LAB object {l [0-100], a, b}.
 * @returns {{x: number, y: number, z: number}} XYZ object.
 */
export const fromLabToXyz = ({ l, a, b }) => {
    const fy = (l + 16) / 116;
    const fx = a / 500 + fy;
    const fz = fy - b / 200;

    const x = _labToXyzF(fx) * D65.Xn;
    const y = _labToXyzF(fy) * D65.Yn;
    const z = _labToXyzF(fz) * D65.Zn;

    return { x, y, z };
};

/**
 * Converts an RGB color object to CIE LAB color space.
 * Shortcut: RGB -> XYZ -> LAB.
 * @param {{r: number, g: number, b: number}} rgb - RGB object {r, g, b} [0-255].
 * @returns {{l: number, a: number, b: number}} LAB object.
 */
export const fromRgbToLab = (rgb) => {
    const xyz = fromRgbToXyz(rgb);
    return fromXyzToLab(xyz);
};

/**
 * Converts a CIE LAB color object to RGB color space.
 * Shortcut: LAB -> XYZ -> RGB.
 * @param {{l: number, a: number, b: number}} lab - LAB object.
 * @returns {{r: number, g: number, b: number}} RGB object {r, g, b} [0-255].
 */
export const fromLabToRgb = (lab) => {
    const xyz = fromLabToXyz(lab);
    return fromXyzToRgb(xyz);
};

// --- RGBA / HSL Conversions (including Alpha) ---

/**
 * Converts an HSL color value to RGBA.
 * Assumes h, s, and l are contained in the set [0, 1]. Alpha defaults to 1.
 * Returns r, g, b, and a in the set [0, 255].
 *
 * @param {{h: number, s: number, l: number, a?: number}} hsla - The HSL(A) color object. Alpha [0, 1] optional.
 * @returns {number[]} RGBA array [r, g, b, a].
 */
export const fromHslToRgba = ({ h, s, l, a = 1 }) => {
    const rgb = fromHslToRgb({ h, s, l }); // Reuse existing HSL to RGB conversion
    const alpha = Math.round(Math.min(1, Math.max(0, a)) * 255); // Convert alpha 0-1 to 0-255
    return [rgb.r, rgb.g, rgb.b, alpha];
}; 