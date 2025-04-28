/**
 * @fileoverview Provides asynchronous utility functions for handling duplicates in arrays,
 * optimized for large arrays to avoid blocking the main thread.
 */

/**
 * Asynchronously creates a new array with duplicate elements removed.
 * Only the first occurrence of each element is kept.
 *
 * @param {Array<T>} array - The source array.
 * @param {number} [chunkSize=10000] - The size of chunks processed asynchronously.
 * @returns {Promise<Array<T>>} A promise resolving to the array with duplicates removed.
 * @template T
 */
export const computeUniqueAsync = async (array, chunkSize = 10000) => {
    if (!Array.isArray(array)) throw new TypeError('Input must be an array.');
    const uniqueSet = new Set();
    for (let i = 0; i < array.length; i += chunkSize) {
        // Yield control to the event loop before processing the chunk
        await new Promise(resolve => setTimeout(resolve, 0));
        const currentChunk = array.slice(i, Math.min(i + chunkSize, array.length));
        currentChunk.forEach(item => uniqueSet.add(item));
    }
    return Array.from(uniqueSet);
};

/**
 * Asynchronously creates a new array with duplicate objects removed based on a property key.
 * If multiple objects share the same key value, the last one encountered in the array is kept.
 *
 * @param {Array<Object>} array - The source array of objects.
 * @param {string | number | symbol} key - The property key to check for uniqueness.
 * @param {number} [chunkSize=10000] - The size of chunks processed asynchronously.
 * @returns {Promise<Array<Object>>} A promise resolving to the array with duplicates removed by key.
 */
export const computeUniqueByPropertyAsync = async (array, key, chunkSize = 10000) => {
    if (!Array.isArray(array)) throw new TypeError('Input must be an array.');
    if (key === null || key === undefined) throw new TypeError('Key cannot be null or undefined.');

    const uniqueMap = new Map();
    for (let i = 0; i < array.length; i += chunkSize) {
        await new Promise(resolve => setTimeout(resolve, 0));
        const currentChunk = array.slice(i, Math.min(i + chunkSize, array.length));
        currentChunk.forEach(item => {
            if (item && typeof item === 'object' && key in item) {
                uniqueMap.set(item[key], item);
            } else {
                 console.warn(`Item at index (within chunk) is not an object or does not have key '${String(key)}'. Skipping.`);
                 // Decide if you want to add items without the key, or items that are not objects
                 // uniqueMap.set(undefined, item); // Example: Group items without the key under 'undefined'
            }
        });
    }
    return Array.from(uniqueMap.values());
};

/**
 * Asynchronously finds all elements that appear more than once in the array.
 *
 * @param {Array<T>} array - The source array.
 * @param {number} [chunkSize=10000] - The size of chunks processed asynchronously.
 * @returns {Promise<Array<T>>} A promise resolving to an array containing unique duplicate elements.
 * @template T
 */
export const getDuplicateElementsAsync = async (array, chunkSize = 10000) => {
    if (!Array.isArray(array)) throw new TypeError('Input must be an array.');
    const countMap = new Map();
    for (let i = 0; i < array.length; i += chunkSize) {
        await new Promise(resolve => setTimeout(resolve, 0));
        const currentChunk = array.slice(i, Math.min(i + chunkSize, array.length));
        currentChunk.forEach(item => {
            countMap.set(item, (countMap.get(item) || 0) + 1);
        });
    }
    // Filter items with count > 1 and return the unique items
    return Array.from(countMap.entries())
        .filter(([_, count]) => count > 1)
        .map(([value, _]) => value);
};

/**
 * Asynchronously creates a new array keeping only the last occurrence of each element.
 *
 * @param {Array<T>} array - The source array.
 * @param {number} [chunkSize=10000] - The size of chunks processed asynchronously.
 * @returns {Promise<Array<T>>} A promise resolving to the array with only last occurrences kept.
 * @template T
 */
export const getUniqueLastOccurrenceAsync = async (array, chunkSize = 10000) => {
    if (!Array.isArray(array)) throw new TypeError('Input must be an array.');
    // Process in reverse to easily keep the last occurrence (which becomes the first in reversed array)
    const reversedArray = array.slice().reverse(); // Use slice() to avoid mutating original
    const uniqueReversed = await computeUniqueAsync(reversedArray, chunkSize);
    // Reverse the result back to original order
    return uniqueReversed.reverse();
}; 