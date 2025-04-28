/**
 * @fileoverview Utilities for inspecting the JavaScript call stack.
 */

/**
 * Regular expression to parse stack trace lines from different JS engines.
 * Attempts to capture function name, file path, line number, and column number.
 * Handles formats like:
 *   at func (file:line:col)
 *   at file:line:col
 *   at async func (file:line:col)
 *   ...and variations with/without function names, protocols, etc.
 */
const STACK_LINE_REGEX = /at(?: async)?\s+(?:(.*?)?\s+\()?(?:.*?\/)?([^:/\s)]+):(\d+):(\d+)\)?/i;

/**
 * Gets the location (file, line, column) of the caller from the call stack.
 * @param {number} [stackIndex=2] - The index in the stack trace to inspect.
 *    0: current function (getCallerLocation)
 *    1: immediate caller
 *    2: caller of the immediate caller (usually the desired one)
 * @returns {string} A formatted string 'filepath:line:column' or '未知位置' if parsing fails.
 */
export function getCallerLocation(stackIndex = 2) {
    const error = new Error();
    // Ensure stack property is available and is a string
    if (!error.stack || typeof error.stack !== 'string') {
        return '未知位置 (无堆栈信息)';
    }

    const stackLines = error.stack.split('\n');

    // Adjust index because the first line is usually 'Error' message
    const targetLineIndex = stackIndex + 1;

    if (stackLines.length <= targetLineIndex) {
        return '未知位置 (堆栈太浅)';
    }

    const callerLine = stackLines[targetLineIndex].trim();
    const matches = callerLine.match(STACK_LINE_REGEX);

    if (matches && matches[2] && matches[3] && matches[4]) {
        // matches[1] is function name (optional)
        const file = matches[2];
        const line = matches[3];
        const column = matches[4];
        return `${file}:${line}:${column}`;
    } else {
        // Fallback or log parsing failure if needed
        console.warn("Failed to parse stack line:", callerLine);
        return `未知位置 (${callerLine})`; // Return raw line if parsing fails
    }
}

/**
 * A higher-order function that wraps an original function to add call stack tracing.
 * When the wrapped function is called, it first gets the caller's location
 * and then invokes a wrapper function with the original function, caller location,
 * and original arguments.
 *
 * @param {Function} originalFn - The function to wrap.
 * @param {function(Function, string, ...any): any} wrapperFn - The function that receives
 *   `originalFn`, `callerLocation`, and the original arguments (`...args`).
 *   It's responsible for calling `originalFn` if needed.
 * @returns {Function} The enhanced function with stack trace capability.
 * @throws {TypeError} If originalFn or wrapperFn are not functions.
 */
export function addStackTrace(originalFn, wrapperFn) {
    if (typeof originalFn !== 'function') {
        throw new TypeError('Original function must be a function.');
    }
    if (typeof wrapperFn !== 'function') {
        throw new TypeError('Wrapper function must be a function.');
    }

    return function(...args) {
        // Get the location of the *caller* of this wrapped function
        const callerLocation = getCallerLocation(3); // stackIndex 3: original caller -> wrappedFn -> here
        // Use .call to preserve `this` context if the wrapped function uses it
        return wrapperFn.call(this, originalFn, callerLocation, ...args);
    };
} 