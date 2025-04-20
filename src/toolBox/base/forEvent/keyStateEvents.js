/**
 * @fileoverview Utilities for checking keyboard and mouse button states during events.
 */

/**
 * @typedef {Object} KeyStateOptions
 * @property {string[]} [requiredKeys=[]] - List of key codes (KeyboardEvent.code) or mouse buttons ('LeftButton', 'RightButton', 'MiddleButton') that *must* be pressed.
 * @property {string[]} [forbiddenKeys=[]] - List of key codes or mouse buttons that *must not* be pressed.
 */

/**
 * Checks if the required keys/buttons are pressed and forbidden keys/buttons are not pressed,
 * based on the provided keyboard and mouse event states.
 *
 * Note: This relies on the state of the events *at the time they occurred*.
 * For real-time state checking, a different mechanism tracking pressed keys is needed.
 *
 * @param {?KeyboardEvent} keyboardEvent - The keyboard event (or null).
 * @param {?MouseEvent} mouseEvent - The mouse event (or null).
 * @param {string[]} [requiredKeys=[]] - Array of required KeyboardEvent.code or mouse button names.
 * @param {string[]} [forbiddenKeys=[]] - Array of forbidden KeyboardEvent.code or mouse button names.
 * @returns {boolean} True if the key state matches the requirements, false otherwise.
 */
export function checkKeyState(keyboardEvent, mouseEvent, requiredKeys = [], forbiddenKeys = []) {
    const currentlyPressed = new Set();

    // Add keyboard keys (consider modifier keys like Shift, Ctrl, Alt, Meta separately if needed)
    if (keyboardEvent) {
        // Add the specific key code
        if (keyboardEvent.code) {
            currentlyPressed.add(keyboardEvent.code);
        }
        // Add modifier keys
        if (keyboardEvent.shiftKey) currentlyPressed.add('Shift'); // Use common names
        if (keyboardEvent.ctrlKey) currentlyPressed.add('Control');
        if (keyboardEvent.altKey) currentlyPressed.add('Alt');
        if (keyboardEvent.metaKey) currentlyPressed.add('Meta'); // Command on Mac, Windows key on Win
    }

    // Add mouse buttons (Note: MouseEvent.buttons is a bitmask)
    if (mouseEvent) {
        if (mouseEvent.buttons & 1) currentlyPressed.add('LeftButton');
        if (mouseEvent.buttons & 2) currentlyPressed.add('RightButton');
        if (mouseEvent.buttons & 4) currentlyPressed.add('MiddleButton');
        // Add modifier keys from mouse event as well, as they might be relevant
        if (mouseEvent.shiftKey) currentlyPressed.add('Shift');
        if (mouseEvent.ctrlKey) currentlyPressed.add('Control');
        if (mouseEvent.altKey) currentlyPressed.add('Alt');
        if (mouseEvent.metaKey) currentlyPressed.add('Meta');
    }

    // Check forbidden keys
    if (forbiddenKeys.some(key => currentlyPressed.has(key))) {
        return false;
    }

    // Check required keys
    // Use Set for efficient lookup
    const requiredSet = new Set(requiredKeys);
    for (const reqKey of requiredSet) {
        if (!currentlyPressed.has(reqKey)) {
            return false; // A required key is missing
        }
    }

    return true; // All conditions met
}


/**
 * @typedef {Object} KeyStateEventListenerOptions
 * @property {string[]} [requiredKeys=[]] - List of required key codes/mouse buttons.
 * @property {string[]} [forbiddenKeys=[]] - List of forbidden key codes/mouse buttons.
 * @property {boolean} [preventDefault=false] - Whether to call preventDefault on the triggering event(s).
 * @property {boolean} [stopPropagation=false] - Whether to call stopPropagation on the triggering event(s).
 */

/**
 * Adds event listeners to track keyboard and mouse button presses and triggers a callback
 * when the key state matches the specified requirements.
 * This version triggers whenever *any* relevant key/button event occurs and the state matches.
 *
 * @param {EventTarget} element - The target element.
 * @param {function(?KeyboardEvent, ?MouseEvent): void} callback - Callback function. Receives the latest keyboard and mouse events that triggered the state check.
 * @param {KeyStateEventListenerOptions} [options={}] - Configuration options.
 * @returns {Function} A function to remove the event listeners.
 */
export function addKeyStateEventListener(element, callback, options = {}) {
    const {
        requiredKeys = [],
        forbiddenKeys = [],
        preventDefault = false,
        stopPropagation = false
    } = options;

    let currentKeyboardEvent = null;
    let currentMouseEvent = null;

    // Check state and trigger callback if conditions met
    const checkAndTrigger = () => {
        if (checkKeyState(currentKeyboardEvent, currentMouseEvent, requiredKeys, forbiddenKeys)) {
            if (preventDefault) {
                currentKeyboardEvent?.preventDefault();
                currentMouseEvent?.preventDefault();
            }
            if (stopPropagation) {
                currentKeyboardEvent?.stopPropagation();
                currentMouseEvent?.stopPropagation();
            }
            callback(currentKeyboardEvent, currentMouseEvent);
        }
    };

    // Keyboard event handlers
    const handleKeyDown = (event) => {
        currentKeyboardEvent = event;
        checkAndTrigger();
    };
    const handleKeyUp = () => {
        // Reset on keyup, assuming combinations require simultaneous press
        currentKeyboardEvent = null;
        // Optionally re-check state if mouse buttons are still held
        // checkAndTrigger();
    };

    // Mouse event handlers
    const handleMouseDown = (event) => {
        currentMouseEvent = event;
        checkAndTrigger();
    };
    const handleMouseUp = () => {
        // Reset on mouseup
        currentMouseEvent = null;
        // Optionally re-check state if keyboard keys are still held
        // checkAndTrigger();
    };

    // Add event listeners
    element.addEventListener('keydown', handleKeyDown);
    element.addEventListener('keyup', handleKeyUp);
    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mouseup', handleMouseUp);
    // Consider adding blur/focusout listeners to reset state when element loses focus
    const handleBlur = () => {
         currentKeyboardEvent = null;
         currentMouseEvent = null;
    };
    element.addEventListener('blur', handleBlur, true); // Use capture phase for blur

    // Return cleanup function
    return () => {
         try {
             element.removeEventListener('keydown', handleKeyDown);
             element.removeEventListener('keyup', handleKeyUp);
             element.removeEventListener('mousedown', handleMouseDown);
             element.removeEventListener('mouseup', handleMouseUp);
             element.removeEventListener('blur', handleBlur, true);
         } catch(e) {
             console.warn("Could not remove key state event listeners, element might be gone.", e);
         }
    };
} 