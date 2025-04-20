/**
 * @fileoverview Utilities for handling combined continuous events (e.g., Ctrl+DoubleClick).
 */

import { checkKeyState } from '../../base/forEvent/keyStateEvents.js';
import { addContinuousEventListener, createMultiClickListener } from '../../base/forEvent/continuousEvents.js'; // Import base continuous listener

/**
 * @typedef {Object} CombinedContinuousEventOptions
 * @property {string[]} [requiredKeys=[]] - List of required key codes/mouse buttons.
 * @property {string[]} [forbiddenKeys=[]] - List of forbidden key codes/mouse buttons.
 * @property {number} [interval=300] - Time interval (ms) for detecting continuous events.
 * @property {number} [maxTriggers=0] - Maximum triggers to detect (0 for unlimited).
 * @property {boolean} [preventDefault=false] - Whether to prevent default event behavior.
 * @property {boolean} [stopPropagation=false] - Whether to stop event propagation.
 */

/**
 * Adds an event listener that triggers when a specific event (e.g., 'click') occurs continuously
 * while certain key/mouse button states are met.
 *
 * Example: Detect Ctrl + Double Click.
 *
 * @param {EventTarget} element - The target element.
 * @param {string} eventType - The event type to listen for (e.g., 'click').
 * @param {function(number, ?KeyboardEvent, Event): void} callback - Callback function. Receives trigger count, the keyboard event state at the time of the trigger, and the target event.
 * @param {CombinedContinuousEventOptions} [options={}] - Configuration options.
 * @returns {Function} A function to remove the event listener.
 */
export function addCombinedContinuousEventListener(element, eventType, callback, options = {}) {
    const {
        requiredKeys = [],
        forbiddenKeys = [],
        interval = 300,
        maxTriggers = 0,
        preventDefault = false,
        stopPropagation = false
    } = options;

    let currentKeyboardStateEvent = null; // Store the keyboard event active *during* the sequence

    // Handler for the base continuous event listener
    const handleContinuousEvent = (triggerCount, event) => {
        // Check key state *at the moment the target event fires*
        // We use the stored keyboard state from keydown
        if (checkKeyState(currentKeyboardStateEvent, event, requiredKeys, forbiddenKeys)) {
             if (preventDefault) {
                event.preventDefault();
                currentKeyboardStateEvent?.preventDefault();
             }
             if (stopPropagation) {
                event.stopPropagation();
                currentKeyboardStateEvent?.stopPropagation();
             }
            callback(triggerCount, currentKeyboardStateEvent, event);
        } else {
            // If key state doesn't match when the event happens, don't trigger callback
            // The continuous listener state will reset automatically via its timeout
        }
    };

    // Listener for the continuous event (e.g., click, dblclick)
    const removeContinuousListener = addContinuousEventListener(
        element,
        eventType,
        interval,
        handleContinuousEvent,
        { maxTriggers: maxTriggers, preventDefault: false, stopPropagation: false } // Handle prevention inside our callback
    );

    // Track keyboard state globally on the element while the listener is active
    const handleKeyDown = (event) => {
        // Simple state tracking: just store the last keydown event.
        // More complex scenarios might need a Set of currently pressed keys.
        currentKeyboardStateEvent = event;
    };
    const handleKeyUp = (event) => {
        // Clear state if the specific key is released.
        // If requiring multiple keys, this needs refinement.
        if (currentKeyboardStateEvent?.code === event.code) {
             currentKeyboardStateEvent = null;
        }
    };
     const handleBlur = () => {
          currentKeyboardStateEvent = null;
     };

    element.addEventListener('keydown', handleKeyDown);
    element.addEventListener('keyup', handleKeyUp);
    element.addEventListener('blur', handleBlur, true); // Reset on blur

    // Return combined cleanup function
    return () => {
        removeContinuousListener(); // Clean up the continuous listener
        try {
             element.removeEventListener('keydown', handleKeyDown);
             element.removeEventListener('keyup', handleKeyUp);
             element.removeEventListener('blur', handleBlur, true);
        } catch(e) {
             console.warn("Could not remove combined event key state listeners, element might be gone.", e);
        }
    };
}

/** Convenience wrapper for combined continuous click events. */
export function addCombinedContinuousClickListener(element, callback, options = {}) {
    return addCombinedContinuousEventListener(element, 'click', callback, options);
}

/**
 * Creates an event handler for multi-click scenarios combined with key state requirements.
 *
 * @param {CombinedContinuousEventOptions} [options={}] - Options including key state and interval.
 * @param {Array<function(?KeyboardEvent, Event): void>} callbacks - Array of callbacks indexed by click count (1-based).
 * @returns {function(EventTarget): Function} A function that takes an element and returns a cleanup function.
 */
export function createCombinedMultiClickListener(options = {}, callbacks = []) {
    const { interval = 300, ...keyOptions } = options; // Separate interval for multi-click

    return function attachToElement(element) {
         return addCombinedContinuousClickListener(element, (triggerCount, keyboardEvent, event) => {
             const currentCallback = callbacks[triggerCount - 1];
             if (currentCallback) {
                 currentCallback(keyboardEvent, event);
             }
         }, { interval, ...keyOptions });
     };
} 