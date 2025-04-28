/**
 * @fileoverview Provides a function to draw horizontal and vertical rulers on canvas elements.
 */

/**
 * Draws horizontal and vertical rulers on the provided canvas elements.
 *
 * @param {object} params - The parameters for drawing the rulers.
 * @param {HTMLCanvasElement} params.horizontalRulerRef - The canvas element for the horizontal ruler.
 * @param {HTMLCanvasElement} params.verticalRulerRef - The canvas element for the vertical ruler.
 * @param {HTMLElement} params.containerRef - The container element to determine ruler dimensions.
 * @param {boolean} [params.isRepeat=true] - Whether to actually draw the rulers. If false, the function returns early.
 * @param {string} [params.bgColor='#2c2c2c'] - Background color of the rulers.
 * @param {string} [params.scaleColor='#fff'] - Color of the scale lines and text.
 * @param {string} [params.font='10px Arial'] - Font used for the ruler labels.
 * @param {number} [params.pixelsPerUnit=100] - How many pixels represent one unit (e.g., meter).
 * @param {string} [params.unitLabel='m'] - The label for the units (e.g., 'm' for meters).
 * @param {number} [params.majorTickInterval=1] - Interval for major ticks with labels.
 * @param {number} [params.minorTickInterval=0.5] - Interval for minor ticks.
 * @param {number} [params.majorTickHeight=15] - Height/Width of major ticks.
 * @param {number} [params.minorTickHeight=10] - Height/Width of minor ticks.
 */
export const drawCanvasRulers = (params) => {
    const {
        horizontalRulerRef,
        verticalRulerRef,
        containerRef,
        isRepeat = true, // Default to true if not provided
        bgColor = '#2c2c2c',
        scaleColor = '#fff',
        font = '10px Arial',
        pixelsPerUnit = 100,
        unitLabel = 'm',
        majorTickInterval = 1,
        minorTickInterval = 0.5,
        majorTickHeight = 15,
        minorTickHeight = 10
        // realSize, uvScale, imageAspectRatio are removed as they were unused
    } = params;

    if (!isRepeat || !horizontalRulerRef || !verticalRulerRef || !containerRef) {
         console.warn('drawCanvasRulers: Missing required refs or isRepeat is false.');
         return; // Exit if refs are missing or drawing is disabled
    }

    // Basic validation
    if (pixelsPerUnit <= 0 || minorTickInterval <= 0 || majorTickInterval <= 0) {
        console.error('drawCanvasRulers: Invalid parameters (pixelsPerUnit, tick intervals must be positive).');
        return;
    }

    // --- Draw Horizontal Ruler ---
    const drawHorizontalRuler = () => {
        const hCanvas = horizontalRulerRef;
        const hCtx = hCanvas.getContext('2d');
        if (!hCtx) return; // Exit if context cannot be obtained

        const canvasWidth = containerRef.clientWidth;
        hCanvas.width = canvasWidth;
        hCanvas.height = 30; // Keep height fixed for now, could be a parameter

        // Fill background
        hCtx.fillStyle = bgColor;
        hCtx.fillRect(0, 0, hCanvas.width, hCanvas.height);

        // Set scale style
        hCtx.strokeStyle = scaleColor;
        hCtx.fillStyle = scaleColor;
        hCtx.font = font;
        hCtx.textAlign = 'center';
        hCtx.textBaseline = 'bottom'; // Align text better

        const totalUnits = canvasWidth / pixelsPerUnit;
        for (let i = 0; i <= totalUnits; i += minorTickInterval) {
            const x = i * pixelsPerUnit;
            let tickHeight = minorTickHeight;

            // Check if it's a major tick (handle floating point inaccuracies)
            if (Math.abs(i % majorTickInterval) < 1e-9 || Math.abs((i % majorTickInterval) - majorTickInterval) < 1e-9) {
                tickHeight = majorTickHeight;
                hCtx.fillText(`${i}${unitLabel}`, x, hCanvas.height - tickHeight - 2); // Adjust text position slightly
            }

            hCtx.beginPath();
            hCtx.moveTo(x, hCanvas.height);
            hCtx.lineTo(x, hCanvas.height - tickHeight);
            hCtx.stroke();
        }
    };

    // --- Draw Vertical Ruler ---
    const drawVerticalRuler = () => {
        const vCanvas = verticalRulerRef;
        const vCtx = vCanvas.getContext('2d');
        if (!vCtx) return; // Exit if context cannot be obtained

        const canvasHeight = containerRef.clientHeight;
        vCanvas.width = 30; // Keep width fixed for now
        vCanvas.height = canvasHeight;

        // Fill background
        vCtx.fillStyle = bgColor;
        vCtx.fillRect(0, 0, vCanvas.width, vCanvas.height);

        // Set scale style
        vCtx.strokeStyle = scaleColor;
        vCtx.fillStyle = scaleColor;
        vCtx.font = font;
        // Align text for vertical ruler
        vCtx.textAlign = 'center'; // Center the text horizontally relative to rotation point
        vCtx.textBaseline = 'middle'; // Center the text vertically relative to rotation point

        const totalUnits = canvasHeight / pixelsPerUnit;
        for (let i = 0; i <= totalUnits; i += minorTickInterval) {
            const y = i * pixelsPerUnit;
            let tickWidth = minorTickHeight;

             // Check if it's a major tick
            if (Math.abs(i % majorTickInterval) < 1e-9 || Math.abs((i % majorTickInterval) - majorTickInterval) < 1e-9) {
                 tickWidth = majorTickHeight;
                // Draw rotated text
                vCtx.save();
                vCtx.translate(vCanvas.width - tickWidth - 10, y); // Position for text (adjust x offset)
                vCtx.rotate(-Math.PI / 2);
                vCtx.fillText(`${i}${unitLabel}`, 0, 0); // Draw text at (0,0) relative to translated/rotated origin
                vCtx.restore();
            }

            vCtx.beginPath();
            vCtx.moveTo(vCanvas.width, y);
            vCtx.lineTo(vCanvas.width - tickWidth, y);
            vCtx.stroke();
        }
    };

    try {
         drawHorizontalRuler();
         drawVerticalRuler();
    } catch (error) {
         console.error("Error drawing rulers:", error);
    }
}; 