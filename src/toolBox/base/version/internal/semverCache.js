/**
 * @fileOverview Internal LRU Cache mechanism for SemVer parsing results.
 * This is intended for internal use by the SemVer utility functions to improve performance.
 */

import { parse as coreParse } from '../computeSemverCore.js';

// --- LRUCache Class (Least Recently Used) ---

class LRUCache {
    constructor(capacity) {
        this.capacity = capacity > 0 ? capacity : 500; // Ensure capacity is positive
        this.cache = new Map();
        // this.usage = new Map(); // Usage count might be overkill for simple LRU
        // this.lastUsed = new Map(); // Implicitly handled by access order
        this.accessOrder = []; // Stores keys in access order (most recent at the end)
    }

    get(key) {
        if (!this.cache.has(key)) return null;

        // Move the accessed key to the end of the accessOrder list
        this.updateAccessOrder(key);
        return this.cache.get(key);
    }

    set(key, value) {
        if (this.capacity <= 0) return; // Do nothing if cache is disabled

        // If key already exists, update value and move it to the end
        if (this.cache.has(key)) {
            this.cache.set(key, value);
            this.updateAccessOrder(key);
            return;
        }

        // Check capacity before adding a new item
        if (this.cache.size >= this.capacity) {
            this.evict();
        }

        // Add the new item
        this.cache.set(key, value);
        this.accessOrder.push(key); // Add to the end (most recently used)
    }

    updateAccessOrder(key) {
        const index = this.accessOrder.indexOf(key);
        if (index > -1) {
            // Remove from current position
            this.accessOrder.splice(index, 1);
        }
        // Add to the end
        this.accessOrder.push(key);
    }

    evict() {
        // Remove the least recently used item (the first element in accessOrder)
        if (this.accessOrder.length > 0) {
            const oldestKey = this.accessOrder.shift(); // Remove from the beginning
            this.cache.delete(oldestKey);
        }
    }

    clear() {
        this.cache.clear();
        this.accessOrder.length = 0;
    }

    has(key) {
        return this.cache.has(key);
    }

    get size() {
        return this.cache.size;
    }

    // Simple stats, can be expanded if needed
    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.capacity,
            // hits: cacheStats.hits, // Stats are now managed outside the class
            // misses: cacheStats.misses,
        };
    }
}

// --- Cache Instance and Wrapper Function ---

// TODO: Make MAX_CACHE_SIZE configurable via a settings/configure function
let MAX_CACHE_SIZE = 500; // Default cache size
let parseCache = new LRUCache(MAX_CACHE_SIZE);

// Cache statistics object
const cacheStats = {
    hits: 0,
    misses: 0,
    resets: 0 // Track how many times the cache is cleared or resized
};

/**
 * A cached version of the core SemVer parse function.
 * Uses an LRU cache to store results and improve performance for repeated parsing of the same version string.
 *
 * @param {string} version The version string to parse.
 * @returns {object | null} The parsed version object (from cache or core parse), or null if invalid.
 */
export const cachedParse = (version) => {
    if (parseCache.capacity <= 0) { // Bypass cache if disabled
        cacheStats.misses++;
        return coreParse(version);
    }

    const cached = parseCache.get(version);
    if (cached !== null && cached !== undefined) { // Check for explicit null/undefined
        cacheStats.hits++;
        return cached;
    }

    cacheStats.misses++;
    const result = coreParse(version);
    // Only cache valid parse results (result !== null)
    if (result !== null) {
        parseCache.set(version, result);
    }
    return result;
};

/**
 * Clears the SemVer parsing cache.
 */
export const clearParseCache = () => {
    parseCache.clear();
    cacheStats.hits = 0;
    cacheStats.misses = 0;
    cacheStats.resets++;
};

/**
 * Resizes the SemVer parsing cache.
 * Existing entries might be evicted if the new size is smaller.
 *
 * @param {number} newSize The desired new capacity of the cache.
 */
export const resizeParseCache = (newSize) => {
    const oldCapacity = parseCache.capacity;
    MAX_CACHE_SIZE = newSize > 0 ? newSize : 0; // Ensure non-negative

    // If size is decreasing drastically, might be better to just create a new cache
    // For simplicity, let the existing cache handle eviction if needed.
    parseCache.capacity = MAX_CACHE_SIZE;

    // Evict excess items if new size is smaller than current size
    while (parseCache.size > parseCache.capacity && parseCache.size > 0) {
        parseCache.evict();
    }
    cacheStats.resets++;
    // Note: Hits/misses are not reset on resize
};


/**
 * Retrieves statistics about the SemVer parsing cache.
 *
 * @returns {object} An object containing cache statistics (size, maxSize, hits, misses, resets).
 */
export const getCacheStats = () => {
    return {
        ...parseCache.getStats(),
        hits: cacheStats.hits,
        misses: cacheStats.misses,
        resets: cacheStats.resets
    };
}; 