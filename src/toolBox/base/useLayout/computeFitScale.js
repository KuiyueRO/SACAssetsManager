/**
 * @fileoverview Provides utilities for calculating scaling factors to fit an object
 * (like an image) within a container according to different fit modes.
 */

/**
 * Defines constants for different fitting modes.
 * - `CONTAIN`: Scales the object down to fit within the container while preserving aspect ratio.
 * - `COVER`: Scales the object up to cover the entire container while preserving aspect ratio (cropping may occur).
 * - `STRETCH`: Scales the object to fill the container, potentially distorting the aspect ratio.
 * - `AUTO`: Behaves like `CONTAIN` if aspect ratios are similar, otherwise behaves like `COVER`.
 * @enum {string}
 */
export const FitModeType = Object.freeze({
    CONTAIN: 'contain',
    COVER: 'cover',
    STRETCH: 'stretch',
    AUTO: 'auto'
});

// Internal lookup table for calculation methods based on fit mode.
const calculationMethods = {
    [FitModeType.CONTAIN]: (scaleX, scaleY) => {
        const containScale = Math.min(scaleX, scaleY);
        return { scaleX: containScale, scaleY: containScale };
    },
    [FitModeType.COVER]: (scaleX, scaleY) => {
        const coverScale = Math.max(scaleX, scaleY);
        return { scaleX: coverScale, scaleY: coverScale };
    },
    [FitModeType.STRETCH]: (scaleX, scaleY) => {
        return { scaleX: scaleX, scaleY: scaleY };
    },
    [FitModeType.AUTO]: (scaleX, scaleY, objAspectRatio, containerAspectRatio) => {
        // Determine if aspect ratios are "similar" (e.g., within 20% difference)
        const ratioDifference = Math.abs(objAspectRatio - containerAspectRatio) / containerAspectRatio;
        const autoScale = ratioDifference < 0.2
            ? Math.min(scaleX, scaleY) // Similar aspect ratio, use contain
            : Math.max(scaleX, scaleY); // Different aspect ratio, use cover
        return { scaleX: autoScale, scaleY: autoScale };
    }
};

/**
 * Calculates the horizontal and vertical scaling factors needed to fit an object
 * (e.g., an image) into a container based on specified dimensions and fit mode.
 *
 * @param {number} objWidth - The width of the object.
 * @param {number} objHeight - The height of the object.
 * @param {number} containerWidth - The width of the container.
 * @param {number} containerHeight - The height of the container.
 * @param {FitModeType[keyof FitModeType]} [fitMode=FitModeType.CONTAIN] - The fitting mode to use.
 * @returns {{scaleX: number, scaleY: number}} An object containing the horizontal (scaleX)
 *                                                and vertical (scaleY) scaling factors.
 * @throws {Error} If any dimension is zero or negative, or if an invalid fitMode is provided.
 */
export function computeFitScale(
    objWidth,
    objHeight,
    containerWidth,
    containerHeight,
    fitMode = FitModeType.CONTAIN
) {
    if (objWidth <= 0 || objHeight <= 0 || containerWidth <= 0 || containerHeight <= 0) {
        throw new Error('All dimension arguments must be positive numbers.');
    }

    const calculate = calculationMethods[fitMode];
    if (!calculate) {
        throw new Error(`Unsupported fit mode: ${fitMode}. Valid modes are: ${Object.values(FitModeType).join(', ')}`);
    }

    const scaleX = containerWidth / objWidth;
    const scaleY = containerHeight / objHeight;
    const objAspectRatio = objWidth / objHeight;
    const containerAspectRatio = containerWidth / containerHeight;

    return calculate(scaleX, scaleY, objAspectRatio, containerAspectRatio);
} 