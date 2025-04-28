/**
 * @fileoverview Provides functions for explicit type conversions between common JavaScript types.
 */

/**
 * Converts a string value to a number.
 * Uses the standard Number() constructor.
 * @param {string} value - The string to convert.
 * @returns {number} The resulting number (can be NaN if conversion fails).
 */
export function fromStringToNumber(value) {
    if (typeof value !== 'string') {
        console.warn(`fromStringToNumber expected a string, received ${typeof value}.`);
        // Attempt conversion anyway, Number() handles various types
    }
    return Number(value);
}

/**
 * Converts a string value (expected to be 'true' or 'false') to a boolean.
 * Only 'true' (case-insensitive) is converted to true, others to false.
 * @param {string} value - The string to convert.
 * @returns {boolean} The resulting boolean.
 */
export function fromStringToBoolean(value) {
    if (typeof value !== 'string') {
        console.warn(`fromStringToBoolean expected a string, received ${typeof value}.`);
        return false; // Or throw error?
    }
    return value.toLowerCase() === 'true';
}

/**
 * Parses a JSON string into an Array.
 * @param {string} jsonString - The JSON string representing an array.
 * @returns {Array | null} The parsed array, or null if parsing fails or the result is not an array.
 */
export function fromStringToArray(jsonString) {
    if (typeof jsonString !== 'string') {
        console.warn(`fromStringToArray expected a JSON string, received ${typeof jsonString}.`);
        return null;
    }
    try {
        const parsed = JSON.parse(jsonString);
        if (Array.isArray(parsed)) {
            return parsed;
        } else {
            console.warn('Parsed JSON string is not an array.');
            return null;
        }
    } catch (error) {
        console.error('Error parsing JSON string to array:', error);
        return null;
    }
}

/**
 * Converts a number value to a string.
 * Uses the standard String() constructor.
 * @param {number} value - The number to convert.
 * @returns {string} The resulting string.
 */
export function fromNumberToString(value) {
    if (typeof value !== 'number') {
        console.warn(`fromNumberToString expected a number, received ${typeof value}.`);
        // Attempt conversion anyway
    }
    return String(value);
}

/**
 * Converts a boolean value to a string ('true' or 'false').
 * Uses the standard toString() method.
 * @param {boolean} value - The boolean to convert.
 * @returns {string} The resulting string ('true' or 'false').
 */
export function fromBooleanToString(value) {
    if (typeof value !== 'boolean') {
        console.warn(`fromBooleanToString expected a boolean, received ${typeof value}.`);
        // Attempt conversion for truthy/falsy?
    }
    return String(value);
}

/**
 * Converts an array into a JSON string representation.
 * @param {Array} array - The array to convert.
 * @param {number | string} [space] - Optional spacing for JSON.stringify.
 * @returns {string | null} The JSON string, or null if input is not an array or stringify fails.
 */
export function fromArrayToString(array, space) {
    if (!Array.isArray(array)) {
        console.warn(`fromArrayToString expected an array, received ${typeof array}.`);
        return null;
    }
    try {
        return JSON.stringify(array, null, space);
    } catch (error) {
        console.error('Error stringifying array:', error);
        return null;
    }
}

// --- Explicit Type Conversion Dispatcher ---

const convertersMap = {
    'string-number': fromStringToNumber,
    'string-boolean': fromStringToBoolean,
    'string-array': fromStringToArray,
    'number-string': fromNumberToString,
    'boolean-string': fromBooleanToString,
    'array-string': fromArrayToString,
    // Add more conversions as needed, e.g., number-boolean?
};

/**
 * Performs explicit type conversion between supported types.
 *
 * @param {*} value - The value to convert.
 * @param {'string' | 'number' | 'boolean' | 'array'} fromType - The source type.
 * @param {'string' | 'number' | 'boolean' | 'array'} toType - The target type.
 * @returns {*} The converted value, or the original value if types are the same or conversion is not supported/fails.
 */
export function computeExplicitTypeConversion(value, fromType, toType) {
    if (fromType === toType) {
        return value;
    }

    const converterKey = `${fromType}-${toType}`;
    const converter = convertersMap[converterKey];

    if (!converter) {
        console.warn(`No converter found for ${fromType} to ${toType}`);
        return value; // Return original value if no converter exists
    }

    try {
        return converter(value);
    } catch (error) {
        // Errors during conversion might be expected depending on input
        console.warn(`Error converting ${fromType} to ${toType}: ${error.message}`);
        return value; // Return original value on conversion error
    }
} 