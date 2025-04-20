/**
 * @fileoverview Provides functions for analyzing image colors, such as checking for purity.
 */

/**
 * Checks if an image loaded from a given path is likely a pure (or near-pure) color
 * by sampling pixels and comparing their color values.
 *
 * @param {string} imagePath - The path or URL of the image to check.
 * @param {object} [options={}] - Optional parameters.
 * @param {number} [options.sampleSize=100] - The approximate number of pixels to sample across the image.
 * @param {number} [options.colorThreshold=0] - The maximum allowed difference (0-255) for each RGB channel
 *                                                between the sampled pixels and the base color. A threshold of 0
 *                                                checks for absolute purity among sampled points.
 * @returns {Promise<boolean>} A promise that resolves to true if the image is considered pure color
 *                             based on sampling, false otherwise (including load errors).
 */
export function checkImagePurityBySampling(imagePath, options = {}) {
    const { sampleSize = 100, colorThreshold = 0 } = options;

    return new Promise((resolve) => {
        const img = new Image();

        img.onload = () => {
            let canvas = null;
            let ctx = null;
            try {
                canvas = document.createElement('canvas');
                ctx = canvas.getContext('2d', { willReadFrequently: true }); // Optimization hint
                if (!ctx) {
                     console.warn('Could not get 2D context for purity check', imagePath);
                     resolve(false);
                     return;
                }

                canvas.width = img.naturalWidth; // Use naturalWidth for accuracy
                canvas.height = img.naturalHeight;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const width = canvas.width;
                const height = canvas.height;

                if (width === 0 || height === 0) {
                    resolve(false); // Cannot sample a zero-dimension image
                    return;
                }

                // Calculate sampling step, ensuring at least 1 pixel step
                const stepX = Math.max(1, Math.floor(width / Math.sqrt(sampleSize)));
                const stepY = Math.max(1, Math.floor(height / Math.sqrt(sampleSize)));

                // Get the color of the first pixel (top-left) as the base color
                const baseImageData = ctx.getImageData(0, 0, 1, 1).data;
                const baseR = baseImageData[0];
                const baseG = baseImageData[1];
                const baseB = baseImageData[2];
                // We ignore alpha for purity check for now

                // Sample pixels and compare colors
                for (let y = 0; y < height; y += stepY) {
                    for (let x = 0; x < width; x += stepX) {
                        const pixelData = ctx.getImageData(x, y, 1, 1).data;
                        const r = pixelData[0];
                        const g = pixelData[1];
                        const b = pixelData[2];

                        // Check if the color difference exceeds the threshold
                        if (
                            Math.abs(r - baseR) > colorThreshold ||
                            Math.abs(g - baseG) > colorThreshold ||
                            Math.abs(b - baseB) > colorThreshold
                        ) {
                            resolve(false); // Color difference found, not pure
                            return;
                        }
                    }
                }

                // All sampled pixels are within the threshold, consider it pure
                resolve(true);

            } catch (error) {
                console.error('Error processing image for purity check:', imagePath, error);
                resolve(false); // Error during canvas processing
            } finally {
                 // Clean up canvas resources if possible (though usually garbage collected)
                 if (canvas) {
                     canvas.width = 0;
                     canvas.height = 0;
                 }
            }
        };

        img.onerror = (errorEvent) => {
            // Log the specific error if possible
            let errorMsg = 'Unknown error';
            if (typeof errorEvent === 'string') {
                errorMsg = errorEvent;
            } else if (errorEvent && errorEvent.message) {
                errorMsg = errorEvent.message;
            } else if (errorEvent && errorEvent.type) {
                errorMsg = `Event type: ${errorEvent.type}`;
            }
            console.error('Failed to load image for purity check:', imagePath, errorMsg);
            resolve(false); // Image loading failed
        };

        // Start loading the image
        try {
             // Handle potential SecurityErrors if path is cross-origin and CORS isn't set
             img.crossOrigin = "Anonymous"; // Attempt to enable CORS
             img.src = imagePath;
        } catch (e) {
             console.error('Error setting image src (potential CORS issue?):', imagePath, e);
             resolve(false);
        }
    });
} 