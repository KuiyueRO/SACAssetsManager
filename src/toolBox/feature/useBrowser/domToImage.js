/**
 * @fileoverview Provides functionality to convert DOM elements or HTML strings to images.
 */

// Assuming dom-to-image library is wrapped/re-exported here
import { domToImage } from '../../base/useDeps/useDomToImage.js/fromDom-to-image.js';

/**
 * Creates a temporary, off-screen container for rendering HTML content.
 * @param {string} content - HTML content string.
 * @param {object} styles - Style object for the container.
 * @param {string} [styles.fontFamily] - Font family.
 * @param {number} [styles.size] - Font size in pixels.
 * @param {string} [styles.color] - Text color.
 * @param {number} [styles.lineHeight] - Line height.
 * @param {number} [styles.letterSpacing] - Letter spacing in pixels.
 * @param {number} [styles.padding] - Padding in pixels.
 * @param {number} [styles.opacity] - Opacity (0-1).
 * @param {boolean} [styles.htmlContent=false] - Whether the content is raw HTML or plain text.
 * @param {string} [styles.cssText] - Additional CSS text.
 * @returns {HTMLElement} The created container element.
 * @private
 */
const _createTempContainer = (content, styles = {}) => {
    const container = document.createElement('div');
    container.style.cssText = `
        position: fixed; /* Use fixed to position relative to viewport */
        top: -9999px; /* Position off-screen */
        left: -9999px;
        visibility: hidden; /* Hide the element */
        pointer-events: none;
        /* z-index: -1; Might not be necessary if positioned off-screen */
        /* Ensure background is transparent for accurate capture */
        background-color: transparent;
        /* Use width: max-content for auto-sizing based on content */
        width: max-content;
        max-width: 90vw; /* Add a max-width to prevent excessive sizes */
      `;

    // Handle potentially unsafe HTML content carefully
    if (styles.htmlContent) {
        // Basic sanitization or use a proper sanitizer library if available
        // For now, just set innerHTML
        container.innerHTML = content;
    } else {
        container.textContent = content; // Safer for plain text
    }

    // Apply specific styles
    const styleProps = {
        fontFamily: styles.fontFamily || 'sans-serif',
        fontSize: styles.size ? `${styles.size}px` : '16px',
        color: styles.color || '#000000',
        lineHeight: styles.lineHeight || 'normal',
        letterSpacing: styles.letterSpacing ? `${styles.letterSpacing}px` : 'normal',
        padding: styles.padding ? `${styles.padding}px` : '0',
        opacity: styles.opacity !== undefined ? String(styles.opacity) : '1',
        whiteSpace: 'pre', // Use pre to respect spaces and line breaks in textContent
    };

    for (const [key, value] of Object.entries(styleProps)) {
        container.style[key] = value;
    }

    // Append additional custom CSS
    if (styles.cssText) {
        container.style.cssText += styles.cssText;
    }

    return container;
};

/**
 * Converts a DOM container element to a PNG image data URL using dom-to-image.
 * @param {HTMLElement} container - The DOM container element.
 * @returns {Promise<string>} A promise that resolves with the image data URL (PNG format).
 * @private
 */
const _convertContainerToImage = async (container) => {
    // Ensure the element is fully rendered before capturing
    await new Promise(resolve => requestAnimationFrame(resolve));
    // A small delay might sometimes help ensure styles are applied
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
        // Options for dom-to-image
        const options = {
            bgcolor: 'transparent', // Capture with transparent background
            // Ensure fonts are loaded (if possible, use font loading detection)
            // width: container.offsetWidth, // Explicitly set dimensions
            // height: container.offsetHeight,
            style: {
                // Override potentially problematic styles during capture
                transform: 'none',
                transformOrigin: '0 0',
                // Add any other style overrides needed for capture
            },
            // Add font embedding or other options if needed
        };
        return await domToImage.toPng(container, options);
    } catch (error) {
        console.error('Error converting DOM to image:', error);
        throw error; // Re-throw the error
    }
};

/**
 * Converts an HTML string or plain text content with specified styles into a PNG image data URL.
 * It creates a temporary off-screen element, renders the content, captures it as an image,
 * and then removes the temporary element.
 *
 * @param {string} content - The HTML content string or plain text.
 * @param {object} styles - Style object for the content (see _createTempContainer for details).
 * @returns {Promise<string>} A promise that resolves with the PNG image data URL.
 */
export const createImageFromDom = async (content, styles = {}) => {
    const container = _createTempContainer(content, styles);
    document.body.appendChild(container);

    try {
        // Recalculate width/height after appending, as max-content depends on layout
        // This might be needed by dom-to-image if it doesn't calculate automatically
        // const width = container.offsetWidth;
        // const height = container.offsetHeight;
        // Note: Explicit dimensions might clip content if calculated too early.
        // dom-to-image usually handles this well.

        return await _convertContainerToImage(container);
    } finally {
        // Ensure the temporary container is always removed
        if (document.body.contains(container)) {
            document.body.removeChild(container);
        }
    }
}; 