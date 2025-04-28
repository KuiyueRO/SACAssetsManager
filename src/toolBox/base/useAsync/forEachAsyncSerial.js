/**
 * @fileoverview Provides an asynchronous forEach function that executes callbacks serially.
 */

/**
 * Executes a provided asynchronous callback function once for each array element in sequence,
 * waiting for the promise returned by the callback to resolve before proceeding to the next element.
 *
 * @param {Array<T>} array - The array to iterate over.
 * @param {function(T, number, Array<T>): Promise<void>} callback - An async function to execute for each element,
 *   taking three arguments: element, index, array.
 * @returns {Promise<void>} A promise that resolves when all callbacks have completed.
 * @template T
 * @throws {TypeError} If the first argument is not an array or the second is not a function.
 *
 * @example
 * const items = [1, 2, 3];
 * await forEachAsyncSerial(items, async (item) => {
 *   console.log('Start:', item);
 *   await new Promise(r => setTimeout(r, 100)); // Simulate async work
 *   console.log('End:', item);
 * });
 * // Logs: Start: 1, End: 1, Start: 2, End: 2, Start: 3, End: 3
 */
export async function forEachAsyncSerial(array, callback) {
    if (!Array.isArray(array)) {
        throw new TypeError('First argument must be an array.');
    }
    if (typeof callback !== 'function') {
        throw new TypeError('Second argument must be an async function.');
    }

    for (let i = 0; i < array.length; i++) {
        // Await the callback for the current element before proceeding
        await callback(array[i], i, array);
    }
} 