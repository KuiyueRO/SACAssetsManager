/**
 * @fileOverview Configuration management for SemVer utility functions.
 * Allows setting global options like cache size and strict mode.
 */

import { resizeParseCache, clearParseCache } from './internal/semverCache.js';

// Default configuration options
const DEFAULT_CONFIG = {
    strictMode: true,   // Currently unused, placeholder for future stricter parsing/validation
    cacheSize: 500,     // Default size for the LRU cache used in parsing
    allowV: true,       // Currently unused, `clean` function handles 'v' prefix regardless
    // i18n options placeholder - functionality not implemented yet
    i18n: {
        enabled: false,
        locale: 'en' // Default to English
    }
};

// Runtime configuration, initialized with defaults
let currentConfig = { ...DEFAULT_CONFIG };

/**
 * Retrieves the current SemVer configuration.
 * Returns a copy to prevent direct modification.
 *
 * @returns {object} A copy of the current configuration object.
 */
export const getConfig = () => {
    // Return a deep copy to prevent modification of nested objects like i18n
    return JSON.parse(JSON.stringify(currentConfig));
};

/**
 * Sets global configuration options for the SemVer utilities.
 *
 * @param {object} options An object containing configuration options to update.
 *                 Available options: `cacheSize` (number).
 *                 Other options like `strictMode`, `allowV`, `i18n` are placeholders for future use.
 * @returns {object} A copy of the updated configuration.
 */
export const configure = (options) => {
    if (!options || typeof options !== 'object') {
        return getConfig(); // Return current config if options are invalid
    }

    let cacheSizeChanged = false;
    const previousCacheSize = currentConfig.cacheSize;

    Object.keys(options).forEach(key => {
        if (key in currentConfig) {
            if (key === 'i18n' && typeof options[key] === 'object' && options[key] !== null) {
                // Merge i18n options carefully
                currentConfig.i18n = { ...currentConfig.i18n, ...options[key] };
            } else if (key === 'cacheSize') {
                const newSize = parseInt(options[key], 10);
                if (!isNaN(newSize) && newSize >= 0) {
                    if (newSize !== currentConfig.cacheSize) {
                        currentConfig.cacheSize = newSize;
                        cacheSizeChanged = true;
                    }
                } else {
                     console.warn(`Invalid cacheSize provided: ${options[key]}. Using previous value: ${currentConfig.cacheSize}`);
                }
            } else if (key !== 'i18n') {
                // Update other top-level options
                currentConfig[key] = options[key];
            }
        } else {
            console.warn(`Unknown SemVer configuration option: ${key}`);
        }
    });

    // If cacheSize changed, update the cache module
    if (cacheSizeChanged) {
        // Call resizeParseCache from the cache module
        resizeParseCache(currentConfig.cacheSize);
        // It might make sense to clear the cache completely if the size changes significantly,
        // but resizeParseCache handles eviction. clearParseCache() could be called here too if desired.
        // clearParseCache();
         console.log(`SemVer cache size configured to: ${currentConfig.cacheSize}`);
    }

    return getConfig(); // Return a copy of the new config
}; 