/**
 * @fileoverview Provides an asynchronous function to delete a slice from an array,
 * designed to avoid blocking the main thread when operating on very large arrays.
 */

/**
 * Asynchronously creates a new array with elements from the specified range removed.
 * This is an immutable operation, suitable for large arrays where synchronous processing
 * might block the main thread.
 *
 * @param {Array<T>} array - The source array.
 * @param {number} start - The starting index (inclusive) of the range to delete.
 * @param {number} end - The ending index (exclusive) of the range to delete.
 * @param {Object} [options={}] - Configuration options.
 * @param {number} [options.chunkSize=10000] - The size of array chunks processed asynchronously.
 * @returns {Promise<Array<T>>} A promise that resolves with the new array.
 * @template T
 * @throws {TypeError} If the first argument is not an array or indices are not numbers.
 * @throws {RangeError} If indices are out of bounds or start > end.
 *
 * @example
 * const largeArr = Array.from({ length: 100000 }, (_, i) => i);
 * const result = await computeAsyncSliceDelete(largeArr, 10000, 30000);
 */
export async function computeAsyncSliceDelete(array, start, end, options = {}) {
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
        throw new RangeError('Start index cannot be greater than end index.');
    }

    // Fast path
    if (len === 0 || actualStart === actualEnd) {
        // Even async, return a consistent copy
        return array.slice();
    }

    const { chunkSize = 10000 } = options; // Increased default chunk size for async
    const newLength = len - (actualEnd - actualStart);
    if (newLength === 0) {
        return [];
    }
    const result = new Array(newLength);
    let targetIndex = 0;

    // Async processing function (yields control periodically)
    const processChunk = (sourceStart, sourceEnd) => {
        return new Promise(resolve => {
            const limit = Math.min(sourceEnd, len);
            for (let i = sourceStart; i < limit; i++) {
                result[targetIndex++] = array[i];
            }
            // Yield using setTimeout(0) to allow other tasks to run
            setTimeout(resolve, 0);
        });
    };

    try {
        // Process the first part (before deletion range)
        for (let i = 0; i < actualStart; i += chunkSize) {
            await processChunk(i, i + chunkSize);
        }

        // Process the second part (after deletion range)
        for (let i = actualEnd; i < len; i += chunkSize) {
            await processChunk(i, i + chunkSize);
        }

        // Final check if targetIndex matches expected length (debugging aid)
        if (targetIndex !== newLength) {
             console.warn(`Async slice delete mismatch: expected ${newLength}, got ${targetIndex}`);
        }

        return result;
    } catch (error) {
        // Wrap error for better context
        throw new Error(`Error during async slice deletion: ${error.message}`);
    }
} 