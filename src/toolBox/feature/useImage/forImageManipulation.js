/**
 * @fileoverview Provides image manipulation functions using the Sharp library.
 * Note: These functions operate on file paths and assume Sharp is available in the Node.js environment.
 */

import { plugin } from '../../../../source/asyncModules.js'; // Path might need adjustment based on final location
const workspaceDir = window.siyuan.config.system.workspaceDir;
const sharpPath = require('path').join(workspaceDir, 'data', 'plugins', plugin.name, 'node_modules', 'sharp');
// Attempt to require sharp, handle potential errors if not found
let sharp;
try {
    sharp = require(sharpPath);
} catch (error) {
    console.error("Failed to load Sharp library. Image manipulation features will be unavailable.", error);
    // Set sharp to null or a mock object to prevent further errors if desired
    sharp = null;
}

/**
 * Compresses an image file.
 *
 * @param {string} inputPath - Path to the input image file.
 * @param {string} outputPath - Path to save the compressed image file.
 * @param {number} quality - Compression quality (0-100, specific meaning depends on format).
 * @param {number} compressionLevel - Compression level (specific meaning depends on format, e.g., PNG 0-9).
 * @param {'jpg'|'jpeg'|'webp'|'png'} format - The target image format.
 * @returns {Promise<string>} Path to the output file on success, empty string on failure.
 */
export const compressImageFile = async (inputPath, outputPath, quality, compressionLevel, format) => {
    if (!sharp) return ''; // Guard against Sharp not being loaded
    try {
        let sharpInstance = sharp(inputPath);

        switch (format.toLowerCase()) {
            case 'jpg':
            case 'jpeg':
                sharpInstance = sharpInstance.jpeg({ quality: quality });
                break;
            case 'webp':
                sharpInstance = sharpInstance.webp({ quality: quality });
                break;
            case 'png':
            default:
                sharpInstance = sharpInstance.png({
                    compressionLevel: compressionLevel,
                    quality: quality
                });
                break;
        }

        await sharpInstance.toFile(outputPath);
        console.log(`Image ${inputPath} compressed successfully to ${outputPath}`);
        return outputPath;
    } catch (error) {
        console.error(`Error compressing image ${inputPath}:`, error);
        return '';
    }
};

/**
 * Resizes an image file.
 *
 * @param {string} inputPath - Path to the input image file.
 * @param {string} outputPath - Path to save the resized image file.
 * @param {object} options - Resizing options.
 * @param {number} [options.width] - Target width.
 * @param {number} [options.height] - Target height.
 * @param {'cover'|'contain'|'fill'|'inside'|'outside'} [options.fit='cover'] - How the image should be resized to fit the dimensions.
 * @returns {Promise<string>} Path to the output file on success, empty string on failure.
 */
export const resizeImageFile = async (inputPath, outputPath, options = {}) => {
    if (!sharp) return '';
    try {
        const { width, height, fit = 'cover' } = options;
        await sharp(inputPath)
            .resize(width, height, { fit })
            .toFile(outputPath);
         console.log(`Image ${inputPath} resized successfully to ${outputPath}`);
        return outputPath;
    } catch (error) {
        console.error(`Error resizing image ${inputPath}:`, error);
        return '';
    }
};

/**
 * Adds a text watermark to an image file.
 *
 * @param {string} inputPath - Path to the input image file.
 * @param {string} outputPath - Path to save the watermarked image file.
 * @param {string} watermarkText - The text to use as a watermark.
 * @param {object} [options={}] - Watermark options.
 * @param {number} [options.fontSize=48] - Font size of the watermark text.
 * @param {string} [options.color='rgba(255, 255, 255, 0.5)'] - Color of the watermark text.
 * @param {'north'|'northeast'|'east'|'southeast'|'south'|'southwest'|'west'|'northwest'|'center'} [options.position='southeast'] - Position (gravity) of the watermark.
 * @returns {Promise<string>} Path to the output file on success, empty string on failure.
 */
export const addWatermarkToFile = async (inputPath, outputPath, watermarkText, options = {}) => {
    if (!sharp) return '';
    try {
        const {
            fontSize = 48,
            color = 'rgba(255, 255, 255, 0.5)',
            position = 'southeast' // uses sharp's gravity options
        } = options;

        // Simple SVG for text watermark
        const svg = `
            <svg width="500" height="100"> 
                <text x="50%" y="50%" font-family="sans-serif" 
                    font-size="${fontSize}" fill="${color}" 
                    text-anchor="middle" dominant-baseline="middle">
                    ${watermarkText}
                </text>
            </svg>
        `;

        await sharp(inputPath)
            .composite([{
                input: Buffer.from(svg),
                gravity: position
            }])
            .toFile(outputPath);
         console.log(`Watermark added to ${inputPath}, saved as ${outputPath}`);
        return outputPath;
    } catch (error) {
        console.error(`Error adding watermark to image ${inputPath}:`, error);
        return '';
    }
};

/**
 * Converts the format of an image file.
 *
 * @param {string} inputPath - Path to the input image file.
 * @param {string} outputPath - Path to save the converted image file.
 * @param {'webp'|'png'|'jpeg'|'jpg'} targetFormat - The desired output format.
 * @returns {Promise<string>} Path to the output file on success, empty string on failure.
 */
export const convertImageFormat = async (inputPath, outputPath, targetFormat) => {
    if (!sharp) return '';
    try {
        const image = sharp(inputPath);
        switch (targetFormat.toLowerCase()) {
            case 'webp':
                await image.webp().toFile(outputPath);
                break;
            case 'png':
                await image.png().toFile(outputPath);
                break;
            case 'jpeg':
            case 'jpg':
                await image.jpeg().toFile(outputPath);
                break;
            default:
                throw new Error(`Unsupported target format for conversion: ${targetFormat}`);
        }
         console.log(`Image ${inputPath} converted to ${targetFormat} and saved as ${outputPath}`);
        return outputPath;
    } catch (error) {
        console.error(`Error converting image format for ${inputPath}:`, error);
        return '';
    }
};

/**
 * Rotates and/or flips an image file.
 *
 * @param {string} inputPath - Path to the input image file.
 * @param {string} outputPath - Path to save the transformed image file.
 * @param {object} [options={}] - Transformation options.
 * @param {number} [options.angle=0] - Rotation angle (0, 90, 180, 270).
 * @param {boolean} [options.flip=false] - Flip horizontally (across Y-axis).
 * @param {boolean} [options.flop=false] - Flop vertically (across X-axis).
 * @returns {Promise<string>} Path to the output file on success, empty string on failure.
 */
export const transformImageFile = async (inputPath, outputPath, options = {}) => {
    if (!sharp) return '';
    try {
        const { angle = 0, flip = false, flop = false } = options;
        let image = sharp(inputPath);

        // Apply rotation only if angle is non-zero and valid
        if ([90, 180, 270].includes(angle)) {
             image = image.rotate(angle);
        } else if (angle !== 0) {
             console.warn(`Invalid rotation angle ${angle} for ${inputPath}. Only 0, 90, 180, 270 are supported.`);
        }

        if (flip) image = image.flip();
        if (flop) image = image.flop();

        await image.toFile(outputPath);
         console.log(`Image ${inputPath} transformed and saved as ${outputPath}`);
        return outputPath;
    } catch (error) {
        console.error(`Error transforming image ${inputPath}:`, error);
        return '';
    }
};

/**
 * Crops an image file to a specified region.
 *
 * @param {string} inputPath - Path to the input image file.
 * @param {string} outputPath - Path to save the cropped image file.
 * @param {object} region - The region to extract.
 * @param {number} region.left - Pixels from the left edge.
 * @param {number} region.top - Pixels from the top edge.
 * @param {number} region.width - Width of the region.
 * @param {number} region.height - Height of the region.
 * @returns {Promise<string>} Path to the output file on success, empty string on failure.
 */
export const cropImageFile = async (inputPath, outputPath, region) => {
    if (!sharp) return '';
    try {
        const { left, top, width, height } = region;
        // Basic validation for region
        if (left == null || top == null || width == null || height == null || width <= 0 || height <= 0) {
            throw new Error('Invalid crop region provided.');
        }
        await sharp(inputPath)
            .extract({ left, top, width, height })
            .toFile(outputPath);
         console.log(`Image ${inputPath} cropped and saved as ${outputPath}`);
        return outputPath;
    } catch (error) {
        console.error(`Error cropping image ${inputPath}:`, error);
        return '';
    }
};

/**
 * [Internal] Applies scaling to a Sharp instance based on metadata and scale percentage.
 */
const applyScale = (sharpInstance, metadata, scalePercent) => {
    // Validate scalePercent type and range if necessary
    if (typeof scalePercent === 'number' && scalePercent > 0 && scalePercent < 100) {
        const targetWidth = Math.round(metadata.width * (scalePercent / 100));
        // Use withoutEnlargement to prevent upscaling if original is smaller than target
        sharpInstance.resize({ width: targetWidth, withoutEnlargement: true });
        console.log(`Applied scaling to ${scalePercent}%, target width: ${targetWidth}`);
    } else if (scalePercent !== undefined && scalePercent !== 100) {
        console.warn(`Invalid or no scaling applied. Scale percent: ${scalePercent}`);
    }
};

/**
 * [Internal] Applies compression settings to a Sharp instance based on format and quality.
 */
const applyCompression = (sharpInstance, format, quality) => {
    // Validate quality type and range
    if (typeof quality === 'number' && quality >= 0 && quality <= 100) {
        const qualityValue = Math.round(quality); // Ensure integer
        const currentFormat = format ? format.toLowerCase() : null;
        console.log(`Applying ${currentFormat || 'default'} compression with quality: ${qualityValue}`);

        switch (currentFormat) {
            case 'jpeg':
                sharpInstance.jpeg({ quality: qualityValue });
                break;
            case 'png':
                // PNG quality is complex; map 0-100 to compression level 0-9?
                // Simple mapping: higher quality -> lower compression level
                const compressionLevel = Math.max(0, 9 - Math.floor(qualityValue / 11));
                sharpInstance.png({ quality: qualityValue, compressionLevel: compressionLevel });
                break;
            case 'webp':
                sharpInstance.webp({ quality: qualityValue });
                break;
            default:
                console.warn(`Unsupported format for quality adjustment: ${format}. Defaulting to JPEG.`);
                sharpInstance.jpeg({ quality: qualityValue }); // Or choose not to apply compression
        }
    } else if (quality !== undefined) {
        console.warn(`Invalid or no compression quality applied. Quality: ${quality}`);
    }
};

/**
 * Converts an image buffer to a Base64 encoded data URL, optionally applying scaling and compression.
 *
 * @param {Buffer} buffer - The input image buffer.
 * @param {object} [options={}] - Processing options.
 * @param {number} [options.scale] - Scale percentage (1-99). Applied before compression.
 * @param {number} [options.quality] - Compression quality (0-100).
 * @returns {Promise<string>} A promise resolving to the Base64 data URL (e.g., "data:image/jpeg;base64,...").
 * @throws {Error} If Sharp is not available or processing fails.
 */
export const getImageBufferAsBase64 = async (buffer, options = {}) => {
    if (!sharp) {
        throw new Error('Sharp library is not available. Cannot process image buffer.');
    }
    if (!Buffer.isBuffer(buffer)) {
         throw new Error('Input must be a Buffer.');
    }

    try {
        const sharpInstance = sharp(buffer);
        const metadata = await sharpInstance.metadata();

        // Apply scaling if specified
        if (options.scale !== undefined) {
            applyScale(sharpInstance, metadata, options.scale);
        }

        // Apply compression if specified
        // Note: format for compression is determined from metadata
        if (options.quality !== undefined) {
            applyCompression(sharpInstance, metadata.format, options.quality);
        }

        const processedBuffer = await sharpInstance.toBuffer();
        const outputFormat = (await sharpInstance.metadata()).format || metadata.format || 'jpeg'; // Get format after potential conversion

        return `data:image/${outputFormat};base64,${processedBuffer.toString('base64')}`;
    } catch (error) {
        console.error('Failed to convert image buffer to Base64:', error);
        // Rethrow or return a specific error indicator
        throw new Error(`Image processing failed: ${error.message}`);
    }
}; 