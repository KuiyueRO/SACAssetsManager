/**
 * @fileoverview Provides utility functions for grouping array elements.
 */

/**
 * Groups elements of an array based on the value of a specified property key.
 *
 * @param {Array<Object>} array - The array of objects to group.
 * @param {string | number | symbol} key - The property key to group by.
 * @param {Object} [defaultGroups={}] - An initial object to which groups will be added.
 * @returns {Object.<string, Array<Object>>} An object where keys are the unique values of the specified property,
 *   and values are arrays of objects belonging to that group.
 */
export const computeGroupBy = (array, key, defaultGroups = {}) => {
    if (!Array.isArray(array)) throw new TypeError('First argument must be an array.');
    if (key === null || key === undefined) throw new TypeError('Key cannot be null or undefined.');

    // Use a new object based on defaultGroups to ensure immutability if defaultGroups is reused
    const initialGroups = { ...defaultGroups };

    return array.reduce((groups, item) => {
        // Ensure item is an object and has the key, handle non-objects gracefully
        const groupKey = (item && typeof item === 'object' && key in item) ? item[key] : undefined;
        const groupKeyValue = String(groupKey); // Ensure keys are strings

        if (!groups[groupKeyValue]) {
            groups[groupKeyValue] = [];
        }
        groups[groupKeyValue].push(item);
        return groups;
    }, initialGroups);
};

/**
 * Filters an array based on allowed values for a specific key and then groups the filtered elements.
 *
 * @param {Array<Object>} array - The array of objects to filter and group.
 * @param {string | number | symbol} key - The property key to filter and group by.
 * @param {Array<any>} allowedValues - An array of values. Only items whose property value for the key
 *   is included in this array will be grouped.
 * @param {Object} [defaultGroups={}] - An initial object to which groups will be added.
 * @returns {Object.<string, Array<Object>>} An object containing the grouped elements that matched the allowed values.
 */
export const computeGroupByAllowedValues = (array, key, allowedValues, defaultGroups = {}) => {
    if (!Array.isArray(array)) throw new TypeError('First argument must be an array.');
    if (key === null || key === undefined) throw new TypeError('Key cannot be null or undefined.');
    if (!Array.isArray(allowedValues)) throw new TypeError('Allowed values must be an array.');

    const allowedSet = new Set(allowedValues);
    const initialGroups = { ...defaultGroups };

    return array.reduce((groups, item) => {
        if (item && typeof item === 'object' && key in item) {
            const groupKey = item[key];
            // Group only if the value is in the allowed set
            if (allowedSet.has(groupKey)) {
                 const groupKeyValue = String(groupKey);
                 if (!groups[groupKeyValue]) {
                     groups[groupKeyValue] = [];
                 }
                 groups[groupKeyValue].push(item);
            }
        }
        return groups;
    }, initialGroups);
};

/**
 * Groups elements of an array based on multiple property keys, creating nested groups.
 *
 * @param {Array<Object>} array - The array of objects to group.
 * @param {Array<string | number | symbol>} keys - An array of property keys to group by, in order of nesting.
 * @returns {Object | Array<Object>} A nested object representing the multi-level groups,
 *   or the original array if the keys array is empty.
 */
export const computeGroupByMultipleKeys = (array, keys) => {
    if (!Array.isArray(array)) throw new TypeError('First argument must be an array.');
    if (!Array.isArray(keys)) throw new TypeError('Keys must be an array.');

    if (!keys.length) return array.slice(); // Return a copy if no keys

    // Helper function for recursive grouping
    const groupRecursively = (currentArray, remainingKeys) => {
        if (!remainingKeys.length || !Array.isArray(currentArray)) {
            return currentArray; // Base case: no more keys or not an array
        }

        const [currentKey, ...nextKeys] = remainingKeys;
        const grouped = computeGroupBy(currentArray, currentKey); // Group by the current key

        // If there are more keys, recurse into each group
        if (nextKeys.length > 0) {
            Object.keys(grouped).forEach(groupKey => {
                grouped[groupKey] = groupRecursively(grouped[groupKey], nextKeys);
            });
        }
        return grouped;
    };

    return groupRecursively(array, keys);
}; 