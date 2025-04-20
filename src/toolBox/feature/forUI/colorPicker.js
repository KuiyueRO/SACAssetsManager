/**
 * @fileoverview Provides utility functions for creating simple color picker UI elements.
 */

/**
 * Creates a basic color picker panel with preset swatches and a custom color input.
 *
 * @param {function(string): void} onSelect - Callback function invoked when a color is selected. Receives the selected hex color string.
 * @returns {HTMLDivElement} The color picker panel element.
 */
export function createColorPickerPanel(onSelect) {
    const colorPanel = document.createElement('div');
    colorPanel.className = 'sac-color-picker-panel';
    // Basic styling, can be customized via CSS
    colorPanel.style.cssText = 'display: flex; flex-wrap: wrap; gap: 5px; padding: 10px; background-color: var(--b3-theme-background, #fff); border: 1px solid var(--b3-theme-separator-color, #ccc); border-radius: 4px; width: fit-content; max-width: 150px;';

    // Preset colors list (Consider making this configurable)
    const presetColors = [
        '#FF0000', '#FF7F00', '#FFFF00', '#00FF00',
        '#00FFFF', '#0000FF', '#8B00FF', '#FF00FF',
        '#000000', '#404040', '#808080', '#C0C0C0',
        '#FFFFFF', '#800000', '#808000', '#008000',
        '#800080', '#008080', '#000080', '#4B0082'
    ];

    // Add preset color swatches
    presetColors.forEach(color => {
        const colorSwatch = document.createElement('div');
        colorSwatch.className = 'sac-color-swatch';
        colorSwatch.style.cssText = `
            width: 20px;
            height: 20px;
            background-color: ${color};
            cursor: pointer;
            border-radius: 3px;
            border: 1px solid var(--b3-theme-on-background, #ccc);
            box-sizing: border-box; /* Ensure border is included in size */
        `;
        colorSwatch.setAttribute('data-color', color);
        colorSwatch.title = color; // Add tooltip
        colorSwatch.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent panel closing if inside a dropdown
            if (typeof onSelect === 'function') {
                onSelect(color);
            }
        });
        colorPanel.appendChild(colorSwatch);
    });

    // Add custom color input (native browser color picker)
    const customColorContainer = document.createElement('div');
    customColorContainer.style.cssText = 'margin-top: 8px; width: 100%; display: flex; align-items: center; gap: 5px;';

    const customColorLabel = document.createElement('span');
    customColorLabel.textContent = 'Custom:';
    customColorLabel.style.fontSize = '12px';

    const customColorInput = document.createElement('input');
    customColorInput.type = 'color';
    customColorInput.style.cssText = 'flex-grow: 1; height: 25px; cursor: pointer; border: 1px solid var(--b3-theme-separator-color, #ccc);';
    customColorInput.addEventListener('input', (e) => { // Use 'input' for live preview
        e.stopPropagation();
        if (typeof onSelect === 'function') {
            onSelect(e.target.value);
        }
    });

    customColorContainer.appendChild(customColorLabel);
    customColorContainer.appendChild(customColorInput);
    colorPanel.appendChild(customColorContainer);

    return colorPanel;
}

/**
 * Creates a simple button that triggers the native browser color picker when clicked.
 *
 * @param {string} [initialColor='#000000'] - The initial color value (hex format).
 * @param {function(string): void} [onChange] - Callback function invoked when the color changes. Receives the new hex color string.
 * @returns {HTMLButtonElement} The color picker button element.
 */
export function createColorPickerButton(initialColor = '#000000', onChange) {
    const button = document.createElement('button');
    button.className = 'sac-color-button';
    button.type = 'button'; // Explicitly set type
    button.style.cssText = `
        width: 24px;
        height: 24px;
        border-radius: 4px;
        border: 1px solid var(--b3-theme-separator-color, #ccc);
        background-color: ${initialColor};
        cursor: pointer;
        padding: 0;
        vertical-align: middle; /* Align better with text */
    `;
    button.title = `Current color: ${initialColor}. Click to change.`;

    // Store the input element to avoid recreating it every time
    const input = document.createElement('input');
    input.type = 'color';
    input.style.display = 'none'; // Hide the actual input
    input.value = initialColor;

    input.addEventListener('change', (e) => {
        const newColor = e.target.value;
        button.style.backgroundColor = newColor;
        button.title = `Current color: ${newColor}. Click to change.`;
        if (typeof onChange === 'function') {
            onChange(newColor);
        }
    });

    // Append the hidden input to the body once
    document.body.appendChild(input);

    button.addEventListener('click', () => {
        input.value = button.style.backgroundColor; // Sync input value before opening
        input.click(); // Trigger the hidden input
    });

    // Cleanup the input when the button is removed (optional but good practice)
    const observer = new MutationObserver((mutationsList, obs) => {
        for(const mutation of mutationsList) {
            if (mutation.removedNodes) {
                mutation.removedNodes.forEach(node => {
                    if (node === button) {
                        input.remove();
                        obs.disconnect(); // Stop observing
                    }
                });
            }
        }
    });

    // Observe the button's parent for removal
    // Need to wait until the button is added to the DOM
    queueMicrotask(() => {
         if (button.parentElement) {
             observer.observe(button.parentElement, { childList: true });
         }
    });


    return button;
} 