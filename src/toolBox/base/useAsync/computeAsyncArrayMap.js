/**
 * @fileoverview Provides an asynchronous map function for arrays that yields
 * control to the event loop before processing each item, suitable for large arrays
 * and potentially long-running (even if async) mapping functions to prevent blocking.
 */

/**
 * Asynchronously maps each element of an array using a provided asynchronous mapping function,
 * yielding control before each mapping operation.
 *
 * @param {Array<T>} array - The array to map over.
 * @param {function(T, number, Array<T>): Promise<U>} mappingFunction - An async function that accepts an element,
 *   index, and the array, and returns a promise resolving to the mapped value.
 * @returns {Promise<Array<U>>} A promise resolving to the new array with mapped values.
 * @template T, U
 * @throws {TypeError} If the first argument is not an array or the second is not a function.
 *
 * @example
 * const urls = ['url1', 'url2', 'url3'];
 * const fetchData = async (url) => { 
 *   // fetch logic returning promise, e.g.:
 *   // const response = await fetch(url);
 *   // return await response.json();
 *   return url; // Placeholder for example
 * };
 * const results = await computeMapAsync(urls, fetchData);
 */
export const computeMapAsync = async (array, mappingFunction) => {
    if (!Array.isArray(array)) {
        throw new TypeError('First argument must be an array.');
    }
    if (typeof mappingFunction !== 'function') {
        throw new TypeError('Second argument must be an async function.');
    }

    // Use Promise.all for concurrency, but yield before each map call
    const results = await Promise.all(
        array.map(async (item, index, arr) => {
            // Yield control before potentially starting the mapping task
            await new Promise(resolve => setTimeout(resolve, 0));
            // Await the potentially async mapping function
            return await mappingFunction(item, index, arr);
        })
    );
    return results;
}; 