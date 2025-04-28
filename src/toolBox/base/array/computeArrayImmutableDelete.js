/**
 * @fileoverview Immutable array deletion utility functions.
 * Provides various methods to remove elements from an array without modifying the original.
 * Includes standard, optimized, cached, lazy, and asynchronous versions.
 * Most functions are curried: `(params) => (array) => newArray`.
 */

// --- Basic Deletion Functions ---

/**
 * Curried: Removes an element at the specified index.
 * @param {number} index - The index to remove.
 * @returns {function(Array<T>): Array<T>} A function that takes an array and returns a new array without the element at the index.
 * @template T
 */
export const computeArrayWithoutIndex = (index) => (arr) => {
  if (!Array.isArray(arr) || index < 0 || index >= arr.length) {
    return arr; // Return original array if index is invalid or array is not an array
  }
  // Efficient immutable removal using slice
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
};

/**
 * Curried: Removes the first occurrence of a specified item.
 * @param {T} item - The item to remove.
 * @returns {function(Array<T>): Array<T>} A function that takes an array and returns a new array without the first occurrence of the item.
 * @template T
 */
export const computeArrayWithoutFirst = (item) => (arr) => {
  if (!Array.isArray(arr)) return arr;
  const index = arr.indexOf(item);
  return index === -1 ? arr : computeArrayWithoutIndex(index)(arr); // Reuse computeArrayWithoutIndex
};

/**
 * Curried: Removes all occurrences of a specified item. Uses Array.prototype.filter.
 * @param {T} item - The item to remove.
 * @returns {function(Array<T>): Array<T>} A function that takes an array and returns a new array without any occurrences of the item.
 * @template T
 */
export const computeArrayWithoutAll = (item) => (arr) => {
  if (!Array.isArray(arr)) return arr;
  return arr.filter(element => element !== item);
};

/**
 * Curried: Removes elements within a specified range (start inclusive, end exclusive).
 * @param {number} start - The starting index (inclusive).
 * @returns {function(number): function(Array<T>): Array<T>} A function that takes the end index.
 * @template T
 */
export const computeArrayWithoutRange = (start) => (end) => (arr) => {
  if (!Array.isArray(arr) || start < 0 || end > arr.length || start >= end) {
    return arr;
  }
  // Efficient immutable removal using slice
  return [...arr.slice(0, start), ...arr.slice(end)];
};

/**
 * Removes the first element of the array.
 * @param {Array<T>} arr - The input array.
 * @returns {Array<T>} A new array without the first element.
 * @template T
 */
export const computeArrayWithoutFirstElement = (arr) => {
  if (!Array.isArray(arr) || arr.length === 0) return arr;
  return arr.slice(1); // slice(1) is efficient and immutable
};

/**
 * Removes the last element of the array.
 * @param {Array<T>} arr - The input array.
 * @returns {Array<T>} A new array without the last element.
 * @template T
 */
export const computeArrayWithoutLastElement = (arr) => {
  if (!Array.isArray(arr) || arr.length === 0) return arr;
  return arr.slice(0, -1); // slice(0, -1) is efficient and immutable
};

/**
 * Removes all nullish values (null or undefined) from the array.
 * @param {Array<T>} arr - The input array.
 * @returns {Array<T>} A new array without null or undefined values.
 * @template T
 */
export const computeArrayWithoutNullish = (arr) => {
  if (!Array.isArray(arr)) return arr;
  return arr.filter(item => item != null);
};

/**
 * Removes all falsy values (false, 0, '', null, undefined, NaN) from the array.
 * @param {Array<T>} arr - The input array.
 * @returns {Array<T>} A new array without falsy values.
 * @template T
 */
export const computeArrayWithoutFalsy = (arr) => {
  if (!Array.isArray(arr)) return arr;
  return arr.filter(Boolean);
};

/**
 * Curried: Removes elements based on a predicate function.
 * @param {function(T, number, Array<T>): boolean} predicate - Function called for each element. If it returns true, the element is removed.
 * @returns {function(Array<T>): Array<T>} A function that takes an array and returns a new filtered array.
 * @template T
 */
export const computeArrayWithoutPredicate = (predicate) => (arr) => {
  if (!Array.isArray(arr) || typeof predicate !== 'function') return arr;
  // Keep elements where the predicate is false
  return arr.filter((item, index, self) => !predicate(item, index, self));
};

// --- Unique Element Functions ---

/**
 * Removes duplicate primitive values from an array.
 * @param {Array<T>} arr - The input array.
 * @returns {Array<T>} A new array with unique elements.
 * @template T
 */
export const computeArrayUnique = (arr) => {
  if (!Array.isArray(arr)) return arr;
  return [...new Set(arr)];
};

/**
 * Curried: Removes duplicate objects from an array based on the value of a specified key.
 * Keeps the first occurrence of each unique key value.
 * @param {string | number} key - The key whose value is used to determine uniqueness.
 * @returns {function(Array<object>): Array<object>} A function that takes an array of objects.
 */
export const computeArrayUniqueByKey = (key) => (arr) => {
  if (!Array.isArray(arr) || key === undefined || key === null) return arr;
  const seen = new Set();
  return arr.filter(item => {
    // Ensure item is an object and has the key
    if (typeof item !== 'object' || item === null || !(key in item)) {
        return true; // Keep items that don't have the key? Or filter them? Let's keep them.
    }
    const value = item[key];
    // Handle potential objects used as keys in Set correctly? Set coerces keys.
    // For primitive values this is fine. For object values, Set checks reference equality.
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
};


// --- Optimized & Specialized Deletion ---

/**
 * Curried: High-performance removal of all occurrences of a specific primitive item.
 * Uses a Map to track indices to keep, potentially faster than filter for sparse removals.
 * @param {T} item - The primitive item to remove.
 * @returns {function(Array<T>): Array<T>} A function that takes an array.
 * @template T
 */
export const computeArrayWithoutAllOptimized = (item) => (arr) => {
  if (!Array.isArray(arr)) return arr;

  const keepValues = [];
  let removed = false;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] !== item) {
      keepValues.push(arr[i]);
    } else {
      removed = true;
    }
  }

  return removed ? keepValues : arr; // Return original array if nothing was removed
};


/**
 * Curried: Removes elements based on a predicate using index mapping.
 * Potentially more efficient than filter for large arrays where many elements are removed.
 * @param {function(T, number, Array<T>): boolean} predicate - Function called for each element. If true, the element is removed.
 * @returns {function(Array<T>): Array<T>} A function that takes an array.
 * @template T
 */
export const computeArrayWithoutPredicateIndexed = (predicate) => (arr) => {
  if (!Array.isArray(arr) || typeof predicate !== 'function') return arr;

  const keepIndices = [];
  for (let i = 0; i < arr.length; i++) {
    if (!predicate(arr[i], i, arr)) {
      keepIndices.push(i);
    }
  }

  if (keepIndices.length === arr.length) return arr; // No elements removed
  if (keepIndices.length === 0) return []; // All elements removed

  // Create new array based on kept indices
  const result = new Array(keepIndices.length);
  for (let i = 0; i < keepIndices.length; i++) {
    result[i] = arr[keepIndices[i]];
  }

  return result;
};

/**
 * Curried: Removes multiple specified items efficiently using a Set for lookup.
 * @param {Array<T>} itemsToRemove - An array of items to remove.
 * @returns {function(Array<T>): Array<T>} A function that takes the array to filter.
 * @template T
 */
export const computeArrayWithoutItems = (itemsToRemove) => (arr) => {
  if (!Array.isArray(arr) || !Array.isArray(itemsToRemove)) return arr;
  if (itemsToRemove.length === 0) return arr; // Nothing to remove

  const removeSet = new Set(itemsToRemove);
  return arr.filter(element => !removeSet.has(element));
};

// --- Large Array / Specialized Context Deletion ---

/**
 * Curried: Removes all occurrences of an item by processing the array in chunks.
 * Reduces peak memory usage for very large arrays compared to a single filter operation.
 * @param {T} item - The item to remove.
 * @param {number} [chunkSize=10000] - The size of chunks to process.
 * @returns {function(Array<T>): Array<T>} A function that takes an array.
 * @template T
 */
export const computeArrayWithoutItemChunked = (item, chunkSize = 10000) => (arr) => {
  if (!Array.isArray(arr)) return arr;
  const effectiveChunkSize = Math.max(1, chunkSize); // Ensure positive chunk size

  // Optimization: if array is smaller than chunk size, use standard filter
  if (arr.length <= effectiveChunkSize) {
    return arr.filter(element => element !== item);
  }

  const result = [];
  for (let i = 0; i < arr.length; i += effectiveChunkSize) {
    const chunk = arr.slice(i, i + effectiveChunkSize);
    // Filter the chunk and push results
    // This still creates intermediate arrays, but potentially smaller ones
    result.push(...chunk.filter(element => element !== item));
  }

  // Check if anything was actually removed to potentially return original array reference
  // This check might be costly itself. For simplicity, always return the new result array.
  // if (result.length === arr.length) return arr;

  return result;
};

/**
 * Curried: Lazily removes elements based on a predicate, returning an iterator.
 * Avoids creating a new array immediately, useful for large arrays or chained operations.
 * @param {function(T, number, Array<T>): boolean} predicate - Function called for each element. If true, the element is skipped.
 * @returns {function(Array<T>): IterableIterator<T>} A function that takes an array and returns a generator.
 * @template T
 */
export const iterateArrayWithoutPredicate = (predicate) => (arr) => {
  if (!Array.isArray(arr) || typeof predicate !== 'function') {
      // Return an empty iterator or the original array based on desired behavior for invalid input
      return (function*() {})(); // Empty iterator
      // or return arr;
  }

  // Return a generator function
  return (function*() {
    for (let i = 0; i < arr.length; i++) {
      if (!predicate(arr[i], i, arr)) {
        yield arr[i];
      }
    }
  })(); // Immediately invoke the generator function to get the iterator
};


/**
 * Curried: Asynchronously removes all occurrences of an item by processing in chunks.
 * Uses `setTimeout` to yield control to the event loop between chunks, preventing blocking.
 * @param {T} item - The item to remove.
 * @param {number} [chunkSize=5000] - The size of chunks to process.
 * @returns {function(Array<T>): Promise<Array<T>>} An async function that takes an array and returns a Promise resolving to the new array.
 * @template T
 */
export const computeArrayWithoutItemAsync = (item, chunkSize = 5000) => async (arr) => {
  if (!Array.isArray(arr)) return arr;
  const effectiveChunkSize = Math.max(1, chunkSize);

  if (arr.length <= effectiveChunkSize) {
    // For small arrays, run synchronously
    return arr.filter(element => element !== item);
  }

  const result = [];
  for (let i = 0; i < arr.length; i += effectiveChunkSize) {
    // Yield to the event loop before processing the next chunk
    await new Promise(resolve => setTimeout(resolve, 0));

    const chunk = arr.slice(i, i + effectiveChunkSize);
    result.push(...chunk.filter(element => element !== item));
  }

  return result;
};

/**
 * Curried: Removes duplicate primitive values by processing the array in chunks (streaming approach).
 * Suitable for very large arrays where creating a full Set upfront might consume too much memory.
 * @param {number} [chunkSize=10000] - The size of chunks to process.
 * @returns {function(Array<T>): Array<T>} A function that takes an array.
 * @template T
 */
export const computeArrayUniqueStreamed = (chunkSize = 10000) => (arr) => {
  if (!Array.isArray(arr)) return arr;
  const effectiveChunkSize = Math.max(1, chunkSize);

  if (arr.length <= effectiveChunkSize) {
    // Use standard method for smaller arrays
    return [...new Set(arr)];
  }

  const seen = new Set();
  const result = [];
  for (let i = 0; i < arr.length; i += effectiveChunkSize) {
    const end = Math.min(i + effectiveChunkSize, arr.length);
    for (let j = i; j < end; j++) {
      const item = arr[j];
      if (!seen.has(item)) {
        seen.add(item);
        result.push(item);
      }
    }
     // Consider adding an await here if this needs to be async like computeArrayWithoutItemAsync
     // await new Promise(resolve => setTimeout(resolve, 0));
  }

  // Check if anything was removed
  // if (result.length === arr.length) return arr;

  return result;
};


// --- Cached/Memoized Deletion (Use with caution due to side effects) ---

/**
 * Curried: Removes elements based on a predicate, caching the result based on the input array reference.
 * Uses a WeakMap for caching. Only effective if the same array instance is passed multiple times.
 * @param {function(T, number, Array<T>): boolean} predicate - Function called for each element. If true, the element is removed.
 * @returns {function(Array<T>): Array<T>} A memoized function that takes an array.
 * @template T
 */
export const computeArrayWithoutPredicateCached = (predicate) => {
  const cache = new WeakMap();

  return (arr) => {
    if (!Array.isArray(arr) || typeof predicate !== 'function') return arr;

    if (cache.has(arr)) {
      return cache.get(arr);
    }

    const result = arr.filter((item, index, self) => !predicate(item, index, self));
    // Only cache if the result is different from the original array?
    // Or always cache? Let's always cache the computed result for that specific array instance.
    cache.set(arr, result);
    return result;
  };
};

/**
 * Removes duplicate primitive values from an array, caching the result based on the input array reference.
 * Uses a WeakMap for caching. Only effective if the same array instance is passed multiple times.
 * @param {Array<T>} arr - The input array.
 * @returns {Array<T>} A new array with unique elements.
 * @template T
 */
export const computeArrayUniqueMemoized = (() => {
  const cache = new WeakMap();

  return (arr) => {
    if (!Array.isArray(arr)) return arr;

    if (cache.has(arr)) {
      return cache.get(arr);
    }

    const result = [...new Set(arr)];
    cache.set(arr, result);
    return result;
  };
})(); // Immediately invoked function expression to encapsulate cache 