/**
 * @fileoverview Provides a function to find and remove the first element
 * matching a condition in an array (mutates the original array).
 */

/**
 * Finds the first element in an array that satisfies the provided testing function,
 * removes it from the original array, and returns the removed element.
 * **Warning:** This function mutates the original array.
 *
 * @param {Array<T>} array - The array to search and modify.
 * @param {function(T, number, Array<T>): boolean} filterFn - Function to execute on each value in the array,
 *   taking three arguments: element, index, array. Returns true if the element should be removed.
 * @returns {T | undefined} The removed element, or undefined if no element satisfies the condition.
 * @template T
 */
export function modifyRemoveFirstMatch(array, filterFn) {
    if (!Array.isArray(array)) {
        throw new TypeError('First argument must be an array.');
    }
    if (typeof filterFn !== 'function') {
        throw new TypeError('Second argument must be a function.');
    }

    const index = array.findIndex(filterFn); // Use findIndex for efficiency

    if (index !== -1) {
        // splice returns an array of removed elements, we want the first (and only) one
        const removedElement = array.splice(index, 1)[0];
        return removedElement;
    }

    return undefined; // No element found
} 