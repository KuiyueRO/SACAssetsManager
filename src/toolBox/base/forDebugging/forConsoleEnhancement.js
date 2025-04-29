// Assuming the dependency will be moved to toolBox/utils/computeStackInfo.js
// import { getCallerLocation } from '../utils/computeStackInfo.js'; // Old incorrect path
import { getCallerLocation } from '../useEcma/forDebugging/useStackTrace.js'; // Corrected path

const CONSOLE_CLEARED_MESSAGE = '控制台已清空'; // Extracted constant
const MAX_LOG_LENGTH = 10000;

/**
 * Enhances the global console.log function to include caller location and limit log length.
 * Overwrites `console.log`. Returns a function to restore the original behavior.
 *
 * @returns {Function} A function that, when called, restores the original console.log.
 */
export function forEnhanceConsoleLog() {
    let logCount = 0;
    const originalConsoleLog = console.log;

    console.log = function(...args) {
        // Increment log count
        logCount++;

        // Check log length limit
        if (logCount > MAX_LOG_LENGTH) {
            // Using originalConsoleLog here to avoid infinite loop if console.clear also uses console.log
            // However, console.clear() itself doesn't typically log.
            console.clear();
            logCount = 0;
            // Log the cleared message using the original function to avoid prefixing
            originalConsoleLog(CONSOLE_CLEARED_MESSAGE);
        }

        // Get caller location
        // Assuming getCallerLocation is robust enough
        const callerInfo = getCallerLocation();

        // Prepend caller info to arguments
        const newArgs = callerInfo ? [`[${callerInfo}]`, ...args] : args;

        // Call the original console.log method
        originalConsoleLog.apply(console, newArgs);
    };

    // Return a function to restore the original console.log
    return function restoreConsoleLog() {
        console.log = originalConsoleLog;
    };
} 