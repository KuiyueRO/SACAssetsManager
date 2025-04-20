/**
 * @fileoverview Utilities for handling continuous events like double clicks, triple clicks, etc.
 */

/**
 * @typedef {Object} ContinuousEventListenerOptions
 * @property {number} [maxTriggers=0] - Maximum number of triggers to detect (0 means unlimited).
 * @property {boolean} [preventDefault=false] - Whether to call preventDefault on the event.
 * @property {boolean} [stopPropagation=false] - Whether to call stopPropagation on the event.
 */

/**
 * Creates a state manager for tracking continuous events.
 * @returns {[Function, Function]} An array containing [updateState function, resetState function].
 *   - updateState(interval): Updates the trigger count based on the time since the last trigger. Returns the current trigger count.
 *   - resetState(): Resets the trigger count and last trigger time.
 * @private
 */
function createContinuousEventState() {
    let lastTriggerTime = 0;
    let triggerCount = 0;

    const updateState = (interval) => {
        const now = Date.now();
        const timeDiff = now - lastTriggerTime;

        triggerCount = timeDiff < interval ? triggerCount + 1 : 1;
        lastTriggerTime = now;

        return triggerCount;
    };

    const resetState = () => {
        triggerCount = 0;
        lastTriggerTime = 0;
    };

    return [updateState, resetState];
}

/**
 * Adds an event listener that triggers a callback for continuous events within a specified interval.
 * For example, detecting double-clicks or triple-clicks.
 *
 * @param {EventTarget} element - The target element to attach the listener to.
 * @param {string} eventType - The type of event to listen for (e.g., 'click', 'mousemove', 'keydown').
 * @param {number} interval - The maximum time interval (in milliseconds) between consecutive events to be considered continuous.
 * @param {function(number, Event): void} callback - The callback function. Receives the trigger count (1 for first, 2 for second, etc.) and the event object.
 * @param {ContinuousEventListenerOptions} [options={}] - Configuration options.
 * @returns {Function} A function to remove the event listener.
 */
export function addContinuousEventListener(element, eventType, interval, callback, options = {}) {
    const { maxTriggers = 0, preventDefault = false, stopPropagation = false } = options;
    const [updateEventState, resetEventState] = createContinuousEventState();
    let timer = null;

    const handleEvent = (event) => {
        if (preventDefault) {
            event.preventDefault();
        }
        if (stopPropagation) {
            event.stopPropagation();
        }

        if (timer) {
            clearTimeout(timer);
        }

        const currentTriggerCount = updateEventState(interval);

        // Trigger immediately if max triggers is reached
        if (maxTriggers > 0 && currentTriggerCount === maxTriggers) {
            callback(currentTriggerCount, event);
            resetEventState();
            return;
        }

        // Wait for the next potential trigger
        timer = setTimeout(() => {
            callback(currentTriggerCount, event);
            resetEventState();
            timer = null; // Clear timer reference after execution
        }, interval);
    };

    element.addEventListener(eventType, handleEvent);

    // Return cleanup function
    return () => {
        if (timer) {
            clearTimeout(timer);
        }
        // Ensure listener removal even if element might be gone
        try {
             element.removeEventListener(eventType, handleEvent);
        } catch (e) {
             console.warn("Could not remove continuous event listener, element might be gone.", e);
        }
    };
}

/** Convenience wrapper for continuous click events. */
export const addContinuousClickListener = (element, interval, callback, options) =>
    addContinuousEventListener(element, 'click', interval, callback, options);

/** Convenience wrapper for continuous mousemove events. */
export const addContinuousMoveListener = (element, interval, callback, options) =>
    addContinuousEventListener(element, 'mousemove', interval, callback, options);

/** Convenience wrapper for continuous keydown events. */
export const addContinuousKeyListener = (element, interval, callback, options) =>
    addContinuousEventListener(element, 'keydown', interval, callback, options);

/**
 * Creates an event handler function for multi-click scenarios (e.g., single, double, triple click).
 *
 * @param {number} [interval=300] - The time interval (ms) to detect continuous clicks.
 * @param {Array<function(Event): void>} callbacks - An array of callback functions. Index 0 for single click, 1 for double, etc.
 * @returns {function(Event): void} An event handler function suitable for addEventListener('click', ...).
 */
export function createMultiClickListener(interval = 300, callbacks = []) {
    const [updateEventState, resetEventState] = createContinuousEventState();
    let timer = null;

    return function handleClick(event) {
        if (timer) {
            clearTimeout(timer);
        }

        const currentTriggerCount = updateEventState(interval);
        const currentCallback = callbacks[currentTriggerCount - 1]; // Array is 0-indexed

        if (currentCallback) {
            // Set a timer. If no more clicks come within the interval, execute the callback.
            timer = setTimeout(() => {
                currentCallback(event);
                resetEventState();
                timer = null;
            }, interval);
        } else {
            // If no callback for this click count, reset immediately
            resetEventState();
        }
    };
} 