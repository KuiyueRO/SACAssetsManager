/**
 * @fileoverview Provides utility functions for managing DOM element focus.
 */

/**
 * Sets focus to a given element, applies a specific CSS class for visual feedback,
 * and ensures the element is scrolled into view.
 * Removes the 'focused' class from any previously focused element.
 * Note: This function has side effects (DOM manipulation, class changes, scrolling).
 *
 * @param {HTMLElement} element The DOM element to focus.
 */
export function setFocus(element) {
    if (!element || typeof element.focus !== 'function') {
        console.warn('setFocus: Invalid element provided.');
        return;
    }
    // Only proceed if the element isn't already marked as focused by this logic
    if (!element.classList.contains('focused')) {
        try {
            element.focus();
            // Remove the 'focused' class from all other elements
            document.querySelectorAll('.focused').forEach(el => {
                if (el !== element) { // Avoid removing from the target element if somehow added elsewhere
                    el.classList.remove('focused');
                }
            });
            // Add the 'focused' class to the target element
            element.classList.add('focused');
            // Ensure the element is in view
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (error) {
            console.error('Error setting focus:', error, element);
        }
    }
} 