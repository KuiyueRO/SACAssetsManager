/**
 * @fileoverview Provides a function to asynchronously append elements from a source
 * (potentially an async iterable) to a target array.
 */

/**
 * Asynchronously iterates over a source iterable (sync or async) and appends
 * each element to the target array.
 * **Warning:** This function mutates the target array.
 *
 * This is particularly useful when the source is an async iterable (e.g., from an
 * async generator or a stream) as it correctly handles awaiting each element.
 *
 * @param {Iterable<T> | AsyncIterable<T>} sourceIterable - The iterable (sync or async) whose elements will be appended.
 * @param {Array<T>} targetArray - The array to which elements will be appended.
 * @returns {Promise<void>} A promise that resolves when all elements have been appended.
 * @template T
 * @throws {TypeError} If targetArray is not an array.
 *
 * @example
 * async function* asyncNumbers() { yield 1; yield 2; }
 * const target = [0];
 * await appendAsyncIterable(asyncNumbers(), target);
 * // target is now [0, 1, 2]
 *
 * const source = [3, 4];
 * await appendAsyncIterable(source, target);
 * // target is now [0, 1, 2, 3, 4]
 */
export async function appendAsyncIterable(sourceIterable, targetArray) {
    if (!Array.isArray(targetArray)) {
        throw new TypeError('Target must be an array.');
    }
    // sourceIterable type check is implicitly handled by for-await-of

    try {
        for await (let element of sourceIterable) {
            targetArray.push(element);
        }
    } catch (error) {
        // Provide context to the error
        console.error("Error during async iteration or push:", error);
        throw new Error(`Failed to append elements: ${error.message}`);
    }
} 