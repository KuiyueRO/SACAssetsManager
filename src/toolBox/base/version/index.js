/**
 * @fileOverview Entry point for the SemVer utility module.
 * Exports all public functions for parsing, comparing, validating, modifying,
 * and working with Semantic Versioning strings and ranges.
 */

// Core functions
export {
    parse,
    compareVersions,
    gt,
    lt,
    gte,
    lte,
    eq,
    neq,
    major,
    minor,
    patch,
    prerelease,
    buildMetadata,
    isValid,
    clean,
    format,
    make
} from './computeSemverCore.js';

// Range functions
export {
    satisfies,
    validRange,
    parseRange // Exporting parseRange might be useful for advanced users
} from './computeSemverRange.js';

// Modification functions
export {
    inc,
    diff
} from './computeSemverModification.js';

// Configuration functions
export {
    configure,
    getConfig
} from './useSemverConfig.js';

// Utility functions
export {
    sort,
    rsort,
    outside,
    maxSatisfying,
    minSatisfying,
    minVersion,
    validVersions,
    filterVersions,
    coerce,
    isStable,
    hasPreRelease,
    isStrictlySemver,
    extendedParse,
    standardize,
    intersect,
    difference,
    union,
    nextVersions,
    findVersionGaps,
    explainRange,
    rangesOverlap,
    analyzeVersionPattern,
    batchProcess,
    compatibilityAssessment,
    upgradePath,
    migrateLegacyVersion,
    safeInc,
    translateVersion,
    healthCheck
    // Note: compareVersionsLocalized is also exported from Utils if needed
} from './computeSemverUtils.js';

// Cache control functions (exported from the internal module via Utils or directly?)
// Re-exporting them here for a complete public API surface.
export {
    clearParseCache,
    resizeParseCache,
    getCacheStats
} from './internal/semverCache.js'; 