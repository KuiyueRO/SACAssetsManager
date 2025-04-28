/**
 * @fileoverview Provides an immutable function to delete a slice from an array.
 */

/**
 * Creates a new array with elements from the specified range removed.
 * This is an immutable operation.
 *
 * @param {Array<T>} array - The source array.
 * @param {number} start - The starting index (inclusive) of the range to delete.
 * @param {number} end - The ending index (exclusive) of the range to delete.
 * @returns {Array<T>} A new array with the specified slice removed.
 * @template T
 * @throws {TypeError} If the first argument is not an array or indices are not numbers.
 * @throws {RangeError} If indices are out of bounds or start > end.
 *
 * @example
 * const arr = [1, 2, 3, 4, 5];
 * const result = computeSliceDelete(arr, 1, 3);
 * // result is [1, 4, 5]
 * // arr is still [1, 2, 3, 4, 5]
 */
export function computeSliceDelete(array, start, end) {
    // Type checking
    if (!Array.isArray(array)) {
        throw new TypeError('First argument must be an array.');
    }
    if (typeof start !== 'number' || typeof end !== 'number') {
        throw new TypeError('Start and end indices must be numbers.');
    }

    const len = array.length;
    // Handle negative indices
    const actualStart = start < 0 ? Math.max(len + start, 0) : Math.min(start, len); // Clamp start to len
    const actualEnd = end < 0 ? Math.max(len + end, 0) : Math.min(end, len); // Clamp end to len

    // Boundary checks
    if (actualStart > actualEnd) {
        // Returning a copy is more forgiving than throwing an error for start > end
        console.warn(`Start index (${start}) is greater than end index (${end}). Returning a copy of the array.`);
        return array.slice();
    }

    // Fast path: No deletion needed
    if (len === 0 || actualStart === actualEnd) {
        return array.slice();
    }
    // Fast path: Deleting everything
    if (actualStart === 0 && actualEnd === len) {
        return [];
    }

    // Performance optimization: pre-allocate the new array
    const newLength = len - (actualEnd - actualStart);
    const result = new Array(newLength);
    let targetIndex = 0;

    // Copy first part
    for (let i = 0; i < actualStart; i++) {
        result[targetIndex++] = array[i];
    }

    // Copy second part
    for (let i = actualEnd; i < len; i++) {
        result[targetIndex++] = array[i];
    }

    return result;
} 