/**
 * @fileOverview Core functions for parsing, comparing, and validating Semantic Versioning (SemVer) strings.
 * This file provides the fundamental building blocks for SemVer operations.
 * It focuses on pure computation without side effects like caching or configuration management.
 */

import { cachedParse } from './internal/semverCache.js'; // Import cachedParse

// Regular expression for parsing SemVer strings according to the spec (https://semver.org/)
const SEMVER_REGEX = /^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$/;

// Comparison identifiers for prerelease tags
const COMPARE_IDENT = {
  '<': -1,
  '=': 0,
  '>': 1,
};

// --- Core Parsing Logic (Internal, not directly cached) ---
/**
 * Internal parsing function. DO NOT EXPORT OR USE DIRECTLY outside this file typically.
 * Use the exported `parse` (which is cachedParse) or other helpers.
 */
const coreParse = (versionStr) => {
  if (typeof versionStr !== 'string') {
    return null;
  }

  // Trim and potentially remove leading 'v' or '=' if configuration allows (though config is handled elsewhere)
  // For core, assume input is relatively clean or handled upstream.
  const cleanedVersionStr = versionStr.trim().replace(/^[v=]+/, '');

  const match = SEMVER_REGEX.exec(cleanedVersionStr);
  if (!match) {
    return null;
  }

  const [, major, minor, patch, prerelease, buildmetadata] = match;

  const result = {
    major: parseInt(major, 10),
    minor: parseInt(minor, 10),
    patch: parseInt(patch, 10),
    prerelease: prerelease ? prerelease.split('.').map(part => {
        // Convert numeric prerelease identifiers to numbers
        if (/^(0|[1-9]\\d*)$/.test(part)) {
            return parseInt(part, 10);
        }
        return part;
    }) : [],
    buildmetadata: buildmetadata ? buildmetadata.split('.') : [],
    version: cleanedVersionStr, // Store the cleaned version
    raw: versionStr, // Store the original input
  };

  return result;
};

// --- Exported Functions (Using Cache or Core Logic) ---

/**
 * Parses a Semantic Version string into a structured object using a cache.
 * Conforms to the SemVer 2.0.0 specification.
 *
 * @param {string} versionStr The version string to parse (e.g., "1.2.3-beta.1+build.4").
 * @returns {object | null} A structured object representing the version, or null if the string is invalid.
 * The object contains: { major: number, minor: number, patch: number, prerelease: (string|number)[], buildmetadata: string[], version: string, raw: string }
 */
export const parse = cachedParse; // Export cachedParse as the primary parse function

/**
 * Cleans a version string by trimming whitespace, removing leading 'v' or '=',
 * and attempting to correct common invalid formats (e.g., '1' -> '1.0.0', '1.2' -> '1.2.0').
 *
 * @param {string} version The potentially messy version string.
 * @returns {string | null} The cleaned version string adhering closer to SemVer format, or null if it cannot be reasonably cleaned.
 */
export const clean = (version) => {
  if (typeof version !== 'string') return null;

  // Trim and remove leading 'v' or '='
  let cleaned = version.trim().replace(/^[=v]+/, '');

  // Check if it's already a valid SemVer string after basic cleaning
  const match = SEMVER_REGEX.exec(cleaned);
  if (match) {
    return cleaned; // Return the matched version directly
  }

  // Attempt to fix incomplete versions
  if (/^\d+$/.test(cleaned)) {
    return `${cleaned}.0.0`;
  }
  if (/^\d+\.\d+$/.test(cleaned)) {
    return `${cleaned}.0`;
  }
  // If it looks like major.minor.patch already but failed regex (maybe invalid chars), return null
  if (/^\d+\.\d+\.\d+/.test(cleaned)) {
     // Re-test the strictly numeric part to avoid returning invalid strings like '1.2.3foo'
     const strictMatch = /^(\d+\.\d+\.\d+)/.exec(cleaned);
     if (strictMatch && SEMVER_REGEX.test(strictMatch[1])) {
       return strictMatch[1];
     }
     // Otherwise, it's likely invalid despite the pattern
     return null;
  }

  // Attempt to handle formats like 'v1.2', '1.2b2'
  // This part is more heuristic and might need refinement based on expected inputs
  const basicVersionMatch = /^v?(\d+)(?:\.(\d+))?(?:\.(\d+))?(.*)$/.exec(cleaned);
  if (basicVersionMatch) {
    const [, maj, min = '0', pat = '0', extra] = basicVersionMatch;
    const baseVersion = `${maj}.${min}.${pat}`;

    // If it's a simple numeric version after extraction, return it
    if (!extra && SEMVER_REGEX.test(baseVersion)) {
        return baseVersion;
    }

    // Handle potential prerelease/build parts (simple heuristic)
    if (extra && /^[.+a-zA-Z0-9-]+$/.test(extra)) {
        let combined = baseVersion;
        // Ensure separator ('-' or '+') is present if needed
        if (extra.startsWith('-') || extra.startsWith('+')) {
            combined += extra;
        } else {
            // Assume prerelease if it doesn't start with '+'
            combined += '-' + extra;
        }
        // Final check if the combined string is now valid
        if (SEMVER_REGEX.test(combined)) {
            return combined;
        }
    }
    // If extra part exists but doesn't form a valid version, return null or baseVersion?
    // Returning baseVersion might be too lenient. Let's stick to stricter cleaning.
    if (SEMVER_REGEX.test(baseVersion)) {
      return baseVersion; // Return just the numeric part if extra is invalid
    }
  }

  // If no cleaning strategy worked, return null
  return null;
};

/**
 * Compares two prerelease identifier arrays (e.g., ['beta', 1] vs ['beta', 2]).
 * Follows SemVer 2.0.0 spec rules for prerelease precedence.
 * - Identifiers consisting of only digits are compared numerically.
 * - Identifiers with letters or hyphens are compared lexically in ASCII sort order.
 * - Numeric identifiers always have lower precedence than non-numeric identifiers.
 * - A larger set of pre-release fields has a higher precedence than a smaller set, if all preceding identifiers are equal.
 *
 * @param {(string|number)[]} prerelease1 First prerelease array.
 * @param {(string|number)[]} prerelease2 Second prerelease array.
 * @returns {number} -1 if prerelease1 < prerelease2, 0 if equal, 1 if prerelease1 > prerelease2.
 */
const comparePrerelease = (prerelease1, prerelease2) => {
  const len1 = prerelease1.length;
  const len2 = prerelease2.length;
  const minLen = Math.min(len1, len2);

  for (let i = 0; i < minLen; i++) {
    const id1 = prerelease1[i];
    const id2 = prerelease2[i];
    const type1 = typeof id1;
    const type2 = typeof id2;

    if (id1 === id2) continue; // Identical identifiers

    if (type1 === 'number' && type2 === 'string') return COMPARE_IDENT['<']; // Numeric < Non-numeric
    if (type1 === 'string' && type2 === 'number') return COMPARE_IDENT['>']; // Non-numeric > Numeric

    // Both numeric or both string
    if (id1 < id2) return COMPARE_IDENT['<'];
    if (id1 > id2) return COMPARE_IDENT['>'];
  }

  // If all compared identifiers are equal, the longer array has higher precedence
  if (len1 < len2) return COMPARE_IDENT['<'];
  if (len1 > len2) return COMPARE_IDENT['>'];

  return COMPARE_IDENT['=']; // Arrays are identical
};

/**
 * Compares two semantic versions (v1 and v2).
 * Uses cached parsing internally.
 *
 * @param {string | object} v1 The first version string or parsed version object.
 * @param {string | object} v2 The second version string or parsed version object.
 * @returns {number | null} Returns:
 *         1 if v1 > v2
 *         -1 if v1 < v2
 *         0 if v1 === v2
 *         null if either version is invalid.
 */
export const compareVersions = (v1, v2) => {
  // Use cachedParse (exported as parse) for string inputs
  const parsedV1 = typeof v1 === 'object' && v1 !== null ? v1 : parse(v1);
  const parsedV2 = typeof v2 === 'object' && v2 !== null ? v2 : parse(v2);

  if (!parsedV1 || !parsedV2) {
    // Consider how to handle invalid input - strict mode might throw, non-strict might return null/0
    // For now, return null to indicate comparison failure due to invalid input.
    return null;
  }

  // Compare Major, Minor, Patch
  if (parsedV1.major > parsedV2.major) return COMPARE_IDENT['>'];
  if (parsedV1.major < parsedV2.major) return COMPARE_IDENT['<'];
  if (parsedV1.minor > parsedV2.minor) return COMPARE_IDENT['>'];
  if (parsedV1.minor < parsedV2.minor) return COMPARE_IDENT['<'];
  if (parsedV1.patch > parsedV2.patch) return COMPARE_IDENT['>'];
  if (parsedV1.patch < parsedV2.patch) return COMPARE_IDENT['<'];

  // If main versions are equal, compare prerelease identifiers
  const prereleaseCompare = comparePrerelease(parsedV1.prerelease, parsedV2.prerelease);
    // Note: SemVer spec says a version without prerelease has *higher* precedence than one with.
    // However, comparePrerelease handles the case where one/both arrays are empty correctly based on length.
    // e.g., 1.0.0 > 1.0.0-alpha because len1=0, len2=1 -> returns 1 (>) via length comparison rule after loop.
  if (prereleaseCompare !== COMPARE_IDENT['=']) {
    return prereleaseCompare;
  }


  // If everything including prerelease is equal, they are identical versions
  return COMPARE_IDENT['='];
};


/**
 * Checks if version v1 is greater than version v2.
 * @param {string} v1 First version string.
 * @param {string} v2 Second version string.
 * @returns {boolean | null} True if v1 > v2, false otherwise. Null if comparison fails.
 */
export const gt = (v1, v2) => {
    const comparison = compareVersions(v1, v2);
    return comparison === null ? null : comparison > 0;
};

/**
 * Checks if version v1 is less than version v2.
 * @param {string} v1 First version string.
 * @param {string} v2 Second version string.
 * @returns {boolean | null} True if v1 < v2, false otherwise. Null if comparison fails.
 */
export const lt = (v1, v2) => {
    const comparison = compareVersions(v1, v2);
    return comparison === null ? null : comparison < 0;
};

/**
 * Checks if version v1 is equal to version v2.
 * @param {string} v1 First version string.
 * @param {string} v2 Second version string.
 * @returns {boolean | null} True if v1 === v2, false otherwise. Null if comparison fails.
 */
export const eq = (v1, v2) => {
    const comparison = compareVersions(v1, v2);
    return comparison === null ? null : comparison === 0;
};

/**
 * Checks if version v1 is greater than or equal to version v2.
 * @param {string} v1 First version string.
 * @param {string} v2 Second version string.
 * @returns {boolean | null} True if v1 >= v2, false otherwise. Null if comparison fails.
 */
export const gte = (v1, v2) => {
    const comparison = compareVersions(v1, v2);
    return comparison === null ? null : comparison >= 0;
};

/**
 * Checks if version v1 is less than or equal to version v2.
 * @param {string} v1 First version string.
 * @param {string} v2 Second version string.
 * @returns {boolean | null} True if v1 <= v2, false otherwise. Null if comparison fails.
 */
export const lte = (v1, v2) => {
    const comparison = compareVersions(v1, v2);
    return comparison === null ? null : comparison <= 0;
};

/**
 * Checks if version v1 is not equal to version v2.
 * @param {string} v1 First version string.
 * @param {string} v2 Second version string.
 * @returns {boolean | null} True if v1 !== v2, false otherwise. Null if comparison fails.
 */
export const neq = (v1, v2) => {
    const comparison = compareVersions(v1, v2);
    return comparison === null ? null : comparison !== 0;
};

/**
 * Checks if a version string is valid according to SemVer 2.0.0 rules.
 * Uses cached parsing.
 * @param {string} version The version string to validate.
 * @returns {boolean} True if the version string is valid, false otherwise.
 */
export const isValid = (version) => {
  return parse(version) !== null; // Uses cachedParse via exported parse
};

/**
 * Extracts the major version number from a version string.
 * Uses cached parsing.
 * @param {string} version The version string.
 * @returns {number | null} The major version number, or null if the version is invalid.
 */
export const major = (version) => {
  const parsed = parse(version); // Uses cachedParse
  return parsed ? parsed.major : null;
};

/**
 * Extracts the minor version number from a version string.
 * Uses cached parsing.
 * @param {string} version The version string.
 * @returns {number | null} The minor version number, or null if the version is invalid.
 */
export const minor = (version) => {
  const parsed = parse(version); // Uses cachedParse
  return parsed ? parsed.minor : null;
};

/**
 * Extracts the patch version number from a version string.
 * Uses cached parsing.
 * @param {string} version The version string.
 * @returns {number | null} The patch version number, or null if the version is invalid.
 */
export const patch = (version) => {
  const parsed = parse(version); // Uses cachedParse
  return parsed ? parsed.patch : null;
};

/**
 * Extracts the prerelease identifiers from a version string.
 * Uses cached parsing.
 * @param {string} version The version string.
 * @returns {(string|number)[] | null} An array of prerelease identifiers, or null if the version is invalid.
 * Returns an empty array if there are no prerelease identifiers.
 */
export const prerelease = (version) => {
  const parsed = parse(version); // Uses cachedParse
  return parsed ? parsed.prerelease : null;
};

/**
 * Extracts the build metadata identifiers from a version string.
 * Uses cached parsing. Note: Build metadata does not affect version precedence.
 * @param {string} version The version string.
 * @returns {string[] | null} An array of build metadata identifiers, or null if the version is invalid.
 * Returns an empty array if there is no build metadata.
 */
export const buildMetadata = (version) => {
    const parsed = parse(version); // Uses cachedParse
    return parsed ? parsed.buildmetadata : null;
};

/**
 * Formats a parsed version object back into a standard SemVer string.
 * Omits build metadata as it's often not needed in formatted output unless specified.
 * @param {object} parsedVersion A parsed version object (from `parse`).
 * @param {boolean} [includeBuild=false] Whether to include build metadata in the output string.
 * @returns {string | null} The formatted SemVer string, or null if the input object is invalid.
 */
export const format = (parsedVersion, includeBuild = false) => {
    if (!parsedVersion || typeof parsedVersion !== 'object' ||
        !('major' in parsedVersion && 'minor' in parsedVersion && 'patch' in parsedVersion)) {
        return null;
    }

    let versionString = `${parsedVersion.major}.${parsedVersion.minor}.${parsedVersion.patch}`;

    if (parsedVersion.prerelease && parsedVersion.prerelease.length > 0) {
        versionString += `-${parsedVersion.prerelease.join('.')}`;
    }

    if (includeBuild && parsedVersion.buildmetadata && parsedVersion.buildmetadata.length > 0) {
        versionString += `+${parsedVersion.buildmetadata.join('.')}`;
    }

    return versionString;
};

/**
 * Creates a SemVer version string from individual components.
 *
 * @param {number} major The major version number.
 * @param {number} minor The minor version number.
 * @param {number} patch The patch version number.
 * @param {(string|number)[] | string} [prerelease] Prerelease identifiers (array or dot-separated string).
 * @param {string[] | string} [buildmetadata] Build metadata identifiers (array or dot-separated string).
 * @returns {string | null} The constructed SemVer string, or null if basic components are invalid.
 */
export const make = (major, minor, patch, prerelease = [], buildmetadata = []) => {
    if (typeof major !== 'number' || typeof minor !== 'number' || typeof patch !== 'number' ||
        major < 0 || minor < 0 || patch < 0 ||
        !Number.isInteger(major) || !Number.isInteger(minor) || !Number.isInteger(patch)) {
        return null; // Basic components must be non-negative integers
    }

    let versionString = `${major}.${minor}.${patch}`;

    const formatPart = (part) => Array.isArray(part) ? part.join('.') : (typeof part === 'string' ? part : '');

    const prereleaseStr = formatPart(prerelease);
    if (prereleaseStr) {
        // Rudimentary validation for prerelease characters
        if (!/^[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*$/.test(prereleaseStr) && prereleaseStr !== '') {
           // console.warn(`Invalid prerelease string: ${prereleaseStr}`); // Or handle more strictly
           return null; // Invalid prerelease format
        }
        versionString += `-${prereleaseStr}`;
    }

    const buildStr = formatPart(buildmetadata);
    if (buildStr) {
       // Rudimentary validation for build metadata characters
        if (!/^[0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*$/.test(buildStr) && buildStr !== '') {
           // console.warn(`Invalid build metadata string: ${buildStr}`);
            return null; // Invalid build metadata format
        }
        versionString += `+${buildStr}`;
    }

    // Final validation against the regex to ensure full compliance
    if (!SEMVER_REGEX.test(versionString)) {
        // This case might indicate issues in construction logic or invalid complex identifiers
       // console.warn(`Constructed version failed final validation: ${versionString}`);
        return null;
    }


    return versionString;
}; 