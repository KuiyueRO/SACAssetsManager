/**
 * @fileOverview Miscellaneous utility functions for working with Semantic Versioning (SemVer).
 * Includes sorting, filtering, range checks, analysis, and other helpful tools.
 */

import {
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
    buildMetadata as coreBuildMetadata, // Renamed to avoid conflict
    isValid,
    clean,
    format as coreFormat, // Renamed to avoid conflict
    make
} from './computeSemverCore.js';

import {
    satisfies,
    parseRange
} from './computeSemverRange.js';

import {
    inc,
    diff
} from './computeSemverModification.js';

import { cachedParse } from './internal/semverCache.js'; // For functions needing cached parsing implicitly

// --- Sorting ---

/**
 * Sorts an array of SemVer version strings.
 *
 * @param {string[]} versions Array of version strings.
 * @param {boolean} [ascending=true] If true, sorts in ascending order (lowest to highest). If false, sorts descending.
 * @returns {string[]} A new array with sorted versions. Invalid versions are filtered out before sorting.
 */
export const sort = (versions, ascending = true) => {
    if (!Array.isArray(versions)) return [];
    // Filter out potentially invalid versions before sorting might be safer
    const validVersions = versions.filter(isValid);
    return [...validVersions].sort((a, b) => {
        const result = compareVersions(a, b);
        // Handle null results from compareVersions if necessary (e.g., treat as equal or sort to end)
        return ascending ? result : (result === null ? 0 : -result);
    });
};

/**
 * Reverses the order of a sorted array of SemVer version strings.
 * Assumes the input array is already sorted, otherwise the result is just the reversed input.
 *
 * @param {string[]} versions A sorted array of version strings.
 * @returns {string[]} A new array with the versions in reverse order.
 */
export const rsort = (versions) => {
    if (!Array.isArray(versions)) return [];
     // Simply reverse the array, assuming it's already sorted correctly
    return [...versions].reverse();
};


// --- Range and Satisfaction Helpers ---

/**
 * Checks if a version is outside a given range, either lower or higher.
 * Note: The accuracy for complex range types (involving OR, complex comparators)
 * is currently limited and might return false negatives (fail to identify outside status).
 *
 * @param {string} version The version string to check.
 * @param {string} range The SemVer range string.
 * @param {'<' | '>'} hilo Specifies whether to check if the version is lower ('<') or higher ('>') than the range.
 * @returns {boolean} True if the version is definitively determined to be outside the range in the specified direction.
 */
export const outside = (version, range, hilo) => {
    if (!isValid(version)) return false; // Invalid versions can't be outside

    const satisfiesRange = satisfies(version, range);

    if (satisfiesRange) {
        return false; // If it satisfies the range, it's not outside
    }

    // If it doesn't satisfy, need to determine if it's lower or higher than the range bounds
    const parsedRange = parseRange(range);
    if (!parsedRange || parsedRange.type === 'invalid' || parsedRange.type === 'any') {
        return false; // Cannot determine outside status for invalid or 'any' ranges
    }

    // Find min and max possible satisfying versions for comparison (simplistic approach)
    // This is complex. A simpler check might be needed.
    // Let's try comparing against the lowest possible bound and highest possible bound implied by the range.

    // Placeholder: A full implementation requires calculating the range's bounds accurately.
    // For now, a basic check based on simple comparators might work partially.
    if (parsedRange.type === 'exact') {
        const comparison = compareVersions(version, parsedRange.version);
        if (hilo === '<') return comparison < 0;
        if (hilo === '>') return comparison > 0;
    }

    // TODO: Implement robust logic for complex ranges (comparatorSet, or)
    // This requires finding the effective min/max of the range.
    // For example, for '>1.0.0 <2.0.0 || >3.0.0 <4.0.0'
    // If hilo='<', check if version < 1.0.0 OR (version < 3.0.0 AND version >= 2.0.0)
    // If hilo='>', check if version >= 4.0.0 OR (version >= 2.0.0 AND version < 3.0.0)

    // Temporary simplified return for unsatisfied versions:
    // Assume if it doesn't satisfy, we need more info to determine which side it falls on.
    // Or, make assumptions based on the hilo direction (potentially incorrect).
    // Let's return false for now, indicating inability to determine accurately for complex ranges.

    // Attempt a very basic check for simple comparator sets
    if (parsedRange.type === 'comparatorSet' && parsedRange.comparators.length > 0) {
         let minBound = null;
         let maxBound = null;
         // Very naive bound finding
         parsedRange.comparators.forEach(c => {
             if (c.operator.includes('>') && (!minBound || gt(c.version, minBound))) {
                 minBound = c.version;
             }
              if (c.operator.includes('<') && (!maxBound || lt(c.version, maxBound))) {
                 maxBound = c.version;
             }
         });

        if (hilo === '<' && minBound && lt(version, minBound)) return true;
        if (hilo === '>' && maxBound && gt(version, maxBound)) return true;
    }

    return false; // Default if unable to determine definitively
};

/**
 * Returns the maximum version from a list that satisfies a given range.
 *
 * @param {string[]} versions An array of version strings.
 * @param {string} range The SemVer range string.
 * @param {object} [options] Options object (currently unused, for future extensions like includePrerelease).
 * @returns {string | null} The highest satisfying version, or null if none satisfy or input is invalid.
 */
export const maxSatisfying = (versions, range, options = {}) => {
    if (!Array.isArray(versions)) return null;
    let max = null;
    for (const version of versions) {
        if (satisfies(version, range /*, options */)) {
            if (max === null || gt(version, max)) {
                max = version;
            }
        }
    }
    return max;
};

/**
 * Returns the minimum version from a list that satisfies a given range.
 *
 * @param {string[]} versions An array of version strings.
 * @param {string} range The SemVer range string.
 * @param {object} [options] Options object (currently unused).
 * @returns {string | null} The lowest satisfying version, or null if none satisfy or input is invalid.
 */
export const minSatisfying = (versions, range, options = {}) => {
     if (!Array.isArray(versions)) return null;
    let min = null;
    for (const version of versions) {
        if (satisfies(version, range /*, options */)) {
            if (min === null || lt(version, min)) {
                min = version;
            }
        }
    }
    return min;
};

/**
 * Returns the minimum valid version from a list.
 * Useful for finding the lowest version in a collection.
 *
 * @param {string[]} versions An array of version strings.
 * @returns {string | null} The lowest valid version string in the array, or null if the array is empty or contains no valid versions.
 */
export const minVersion = (versions) => {
    if (!Array.isArray(versions) || versions.length === 0) return null;
    return sort(versions)[0]; // Sort ascending and take the first valid one
};


/**
 * Filters a list of versions, returning only valid SemVer versions.
 *
 * @param {string[]} versions Array of potentially invalid version strings.
 * @returns {string[]} Array containing only the valid SemVer versions.
 */
export const validVersions = (versions) => {
    if (!Array.isArray(versions)) return [];
    return versions.filter(isValid);
};

/**
 * Filters a list of versions based on a condition (range string or filter function).
 *
 * @param {string[]} versions Array of version strings.
 * @param {string | Function} condition A SemVer range string or a function that takes a version string and returns a boolean.
 * @returns {string[]} Array containing versions that meet the condition. Invalid versions in the input array are implicitly filtered out.
 */
export const filterVersions = (versions, condition) => {
    if (!Array.isArray(versions)) return [];
    if (typeof condition === 'function') {
        return versions.filter(v => isValid(v) && condition(v));
    }
    if (typeof condition === 'string') {
         return versions.filter(v => satisfies(v, condition));
    }
    return []; // Invalid condition
};

// --- Version Analysis ---

/**
 * Attempts to interpret a potentially messy version string as a valid SemVer string.
 * Tries cleaning and parsing. Returns the canonical valid SemVer string if successful.
 *
 * @param {string | number} version The version string or number to coerce.
 * @param {object} [options] Options object (currently unused).
 * @returns {string | null} A valid SemVer string (e.g., '1.2.0' from 'v1.2'), or null if coercion fails.
 */
export const coerce = (version, options = {}) => {
    if (version === null || version === undefined) return null;
    let versionString = String(version);

    // Try direct parse first
    const parsed = cachedParse(versionString);
    if (parsed) return parsed.version; // Use the canonical version from parse

    // Try cleaning then parsing
    const cleaned = clean(versionString);
    if (cleaned) {
        const parsedClean = cachedParse(cleaned);
        if (parsedClean) return parsedClean.version;
    }

    // Basic heuristic for simple numbers or incomplete versions often found
     // e.g., '1' -> '1.0.0', '1.2' -> '1.2.0'
     // This logic is partly covered by `clean`, but can be made more explicit here if needed.
     if (/^\d+$/.test(versionString)) return `${versionString}.0.0`;
     if (/^\d+\.\d+$/.test(versionString)) return `${versionString}.0`;

    return null; // Coercion failed
};

/**
 * Checks if a version is considered stable (major version > 0 and no prerelease tags).
 * Adheres to the SemVer specification where 0.x versions are for initial development (not stable).
 *
 * @param {string} version The version string to check.
 * @returns {boolean} True if the version has major > 0 and no prerelease identifiers.
 */
export const isStable = (version) => {
    const parsed = cachedParse(version);
    // Standard definition: Major > 0 and no prerelease tags.
    // Some might consider 0.x.y stable if x > 0, but standard semver treats 0.x as initial development.
    return parsed ? parsed.major > 0 && parsed.prerelease.length === 0 : false;
};

/**
 * Checks if a version has a specific prerelease identifier or sequence of identifiers.
 *
 * @param {string} version The version string (e.g., '1.2.3-beta.1').
 * @param {string} identifier The prerelease identifier to check for (e.g., 'beta', or 'beta.1').
 * @returns {boolean} True if the version's prerelease part contains the specified identifier/sequence.
 */
export const hasPreRelease = (version, identifier) => {
    const pre = prerelease(version); // From core, gets the array
    if (!pre || pre.length === 0) return false;

    // Check if the identifier string exists as a whole part or sequence
    const identifierParts = identifier.split('.');
    if (identifierParts.length === 1) {
        return pre.includes(identifier);
    } else {
         // Check for sequence match
         const preString = pre.join('.');
         return preString.includes(identifier); // Simple substring check might be sufficient
         // For exact sequence match:
         /*
         for (let i = 0; i <= pre.length - identifierParts.length; i++) {
             let match = true;
             for (let j = 0; j < identifierParts.length; j++) {
                 // Need type coercion check? parse converts numeric parts
                 if (String(pre[i + j]) !== identifierParts[j]) {
                     match = false;
                     break;
                 }
             }
             if (match) return true;
         }
         return false;
         */
    }
};

/**
 * Checks if a version string strictly adheres to the SemVer 2.0.0 format without any modifications or cleaning.
 * Differs from `isValid` which checks if a version *can be interpreted* as valid SemVer (potentially after cleaning).
 *
 * @param {string} version The version string.
 * @returns {boolean} True if the string exactly matches the SemVer regex and represents the same value as parsed.
 */
export const isStrictlySemver = (version) => {
  if (typeof version !== 'string') return false;
  // Use the regex from core directly if needed, but parse result implies validity
  // const SEMVER_REGEX = /.../; // Get from core or define here?
  // return SEMVER_REGEX.test(version);
  // Or check if parse returns non-null AND the raw input matches the parsed version
  const parsed = parse(version); // Use non-cached core parse for strictness?
  return parsed !== null && parsed.raw === parsed.version;
};

/**
 * Parses a version string using extended rules, potentially allowing non-standard formats like dates or simple integers.
 * Useful for handling version strings from sources that don't strictly follow SemVer.
 *
 * @param {string} version The version string.
 * @param {object} [options] Parsing options: `{ allowDate?: boolean, allowInteger?: boolean }`.
 * @returns {object | null} Parsed object with a `format` field ('semver', 'semver-cleaned', 'date', 'integer') and relevant version data, or null if no known format matches.
 */
export const extendedParse = (version, options = {}) => {
    // Try standard parse first
    let parsed = parse(version);
    if (parsed) return { ...parsed, format: 'semver' };

    // Try clean + parse
    const cleaned = clean(version);
    if (cleaned && cleaned !== version) {
         parsed = parse(cleaned);
         if (parsed) return { ...parsed, original: version, format: 'semver-cleaned' };
    }

    // Add specific non-standard format checks based on options
    if (options.allowDate) {
        const dateMatch = /^(\d{4})[.-]?(\d{2})[.-]?(\d{2})/.exec(version);
        if (dateMatch) {
             const [, year, month, day] = dateMatch;
             // Basic validation
             if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
                return {
                    format: 'date',
                    year: parseInt(year, 10),
                    month: parseInt(month, 10),
                    day: parseInt(day, 10),
                    version: `${year}.${month}.${day}`, // Normalized form
                    raw: version
                 };
             }
        }
    }

    // Add more parsers here (e.g., simple integer version)
    if (options.allowInteger && /^\d+$/.test(version)) {
        return {
            format: 'integer',
            value: parseInt(version, 10),
            version: version,
            raw: version
        };
    }


    return null; // No known format matched
};


/**
 * Attempts to standardize various version formats (like dates or integers) into a SemVer-compatible string.
 * The conversion logic (e.g., date to SemVer) is opinionated and might need adjustment based on requirements.
 *
 * @param {string} version The non-standard version string.
 * @returns {string | null} A SemVer string if standardization is possible, otherwise null.
 */
export const standardize = (version) => {
     const parsed = extendedParse(version, { allowDate: true, allowInteger: true });
     if (!parsed) return null;

     switch (parsed.format) {
         case 'semver':
         case 'semver-cleaned':
             return parsed.version;
         case 'date':
             // Convert YYYY.MM.DD to 0.YYYYMM.DD or similar SemVer compatible if needed
             // Or treat as major.minor.patch? Let's use 0.YYYYMM.DD
             const monthStr = String(parsed.month).padStart(2, '0');
             const dayStr = String(parsed.day).padStart(2, '0');
             // Using 0. makes it invalid semver technically if year > 0
             // Maybe use major.minor.patch directly? year.month.day
             // return make(parsed.year, parsed.month, parsed.day); // This seems more logical
              // Let's try year.month.day and ensure clean handles it?
              return clean(`${parsed.year}.${parsed.month}.${parsed.day}`);

         case 'integer':
             // Convert integer N to N.0.0
             return `${parsed.value}.0.0`;
         default:
             return null;
     }
};

// --- Set Operations ---

/**
 * Computes the intersection of multiple arrays of version strings.
 * Returns only the valid SemVer versions present in *all* input arrays.
 *
 * @param {...string[]} versionLists Two or more arrays of version strings.
 * @returns {string[]} A sorted array containing unique versions present in all input arrays.
 */
export const intersect = (...versionLists) => {
    if (versionLists.length === 0) return [];
    if (versionLists.length === 1) return validVersions(versionLists[0]); // Return valid versions from the single list

    // Validate and convert all inputs to sets of valid versions
    const validSets = versionLists.map(list => new Set(validVersions(list)));

    if (validSets.some(set => set.size === 0)) return []; // If any list has no valid versions, intersection is empty

    // Start with the first set and intersect with the rest
    let intersection = new Set(validSets[0]);

    for (let i = 1; i < validSets.length; i++) {
        intersection = new Set([...intersection].filter(version => validSets[i].has(version)));
        if (intersection.size === 0) break; // Early exit if intersection becomes empty
    }

    return sort(Array.from(intersection)); // Return sorted array
};

/**
 * Computes the difference between the first array and subsequent arrays of version strings.
 * Returns valid versions from the first array that are not present in any of the subsequent arrays.
 *
 * @param {string[]} baseList The base array of versions.
 * @param {...string[]} listsToRemove Arrays of versions to remove from the base list.
 * @returns {string[]} A sorted array containing unique versions from the base list not present in other lists.
 */
export const difference = (baseList, ...listsToRemove) => {
    if (!Array.isArray(baseList)) return [];

    const baseSet = new Set(validVersions(baseList));
    if (baseSet.size === 0) return [];

    const setsToRemove = listsToRemove.map(list => new Set(validVersions(list)));

    for (const setToRemove of setsToRemove) {
        for (const version of setToRemove) {
            baseSet.delete(version);
        }
        if (baseSet.size === 0) break; // Early exit
    }

    return sort(Array.from(baseSet));
};

/**
 * Computes the union of multiple arrays of version strings.
 * Returns all unique valid SemVer versions from all input arrays.
 *
 * @param {...string[]} versionLists Arrays of version strings.
 * @returns {string[]} An array containing unique valid versions from all input arrays, sorted.
 */
export const union = (...versionLists) => {
    const combined = new Set();
    for (const list of versionLists) {
        if (Array.isArray(list)) {
            for (const version of validVersions(list)) {
                combined.add(version);
            }
        }
    }
    return sort(Array.from(combined));
};


// --- Advanced Analysis & Manipulation ---

/**
 * Generates a list of potential next versions based on the current version using the 'inc' function.
 *
 * @param {string} version The current version string.
 * @returns {object} An object mapping release types ('major', 'minor', 'patch', 'premajor', 'preminor', 'prepatch', 'prerelease') to potential next version strings, or null if increment fails.
 */
export const nextVersions = (version) => {
    if (!isValid(version)) return {};
    const types = ['major', 'minor', 'patch', 'premajor', 'preminor', 'prepatch', 'prerelease'];
    const next = {};
    types.forEach(type => {
         // Passing undefined for identifier uses default logic in inc
        next[type] = inc(version, type, undefined);
    });
    return next;
};

/**
 * Finds gaps in a sorted list of versions based on expected increments (major, minor, or patch).
 * Note: The gap detection logic is basic and might not perfectly handle all prerelease scenarios.
 *
 * @param {string[]} versions A sorted array of version strings.
 * @param {'major' | 'minor' | 'patch'} [type='patch'] The type of gap to look for (difference between consecutive versions).
 * @returns {Array<{from: string, to: string, gapType: string}>} An array describing the found gaps where the difference between 'from' and 'to' is larger than the specified 'type'.
 */
export const findVersionGaps = (versions, type = 'patch') => {
    if (!Array.isArray(versions) || versions.length < 2) return [];

    const sortedValid = sort(versions);
    const gaps = [];

    for (let i = 1; i < sortedValid.length; i++) {
        const v1 = sortedValid[i - 1];
        const v2 = sortedValid[i];
        const p1 = parse(v1);
        const p2 = parse(v2);

        if (!p1 || !p2) continue; // Skip if parsing fails

        let expectedNext = null;
        if (type === 'major') expectedNext = inc(v1, 'major');
        else if (type === 'minor') expectedNext = inc(v1, 'minor');
        else expectedNext = inc(v1, 'patch'); // Default to patch

        // Check if v2 is the expected next version or later
        // A simple check: if v2 > expectedNext, there might be a gap.
        // A more robust check would involve analyzing the diff.
        const diffType = diff(v1, v2);

        if (diffType) { // If versions are different
             if (type === 'major' && diffType === 'major' && gt(v2, expectedNext)) {
                 gaps.push({ from: v1, to: v2, gapType: 'major' });
             } else if (type === 'minor' && (diffType === 'major' || (diffType === 'minor' && gt(v2, expectedNext)))) {
                  gaps.push({ from: v1, to: v2, gapType: 'minor' });
             } else if (type === 'patch' && diffType !== 'prerelease' && diffType !== 'build' && gt(v2, expectedNext)) {
                 // Assuming patch gaps mean major, minor, or patch jumps larger than 1 patch
                 gaps.push({ from: v1, to: v2, gapType: 'patch' });
             }
             // TODO: Refine gap detection logic, especially around prereleases.
        }
    }
    return gaps;
};

/**
 * Provides a human-readable explanation of a SemVer range string.
 * The explanation is based on the parsed structure and might be basic for complex ranges.
 *
 * @param {string} range The SemVer range string.
 * @returns {string} A textual explanation of the range (e.g., '>=1.2.0 and <1.3.0') or an error message if the range is invalid.
 */
export const explainRange = (range) => {
    const parsed = parseRange(range);
    if (!parsed || parsed.type === 'invalid') return `Invalid range: ${range}`;

    const explainParsed = (p) => {
        switch (p.type) {
            case 'exact': return `Exactly version ${p.version}`;
            case 'any': return 'Any version';
            case 'comparatorSet':
                return p.comparators.map(c => {
                    let explanation = `${c.operator} ${c.version}`;
                    if (c.upperBound) {
                        explanation += ` (implicitly and ${c.upperBound.operator} ${c.upperBound.version})`;
                    }
                    return explanation;
                }).join(' and ');
            case 'or':
                return p.ranges.map(r => `(${explainParsed(r)})`).join(' or ');
            // Add cases for specific implied ranges like ^, ~ if parseRange retains them
            // Example (if parseRange stored type='compatible'):
            // case 'compatible': return `Compatible with version ${p.version} (^${p.version})`
            default: return `Unknown range type: ${range}`;
        }
    };

    return explainParsed(parsed);
};


/**
 * Checks if two SemVer ranges potentially overlap (i.e., if there might be at least one version satisfying both).
 * Note: This check is basic, using boundary point testing. It may return false positives (saying there's overlap when none exists for complex, disjoint OR ranges) and false negatives (missing overlaps in complex cases).
 * It is NOT a guarantee of overlap, only an indication based on simple checks.
 *
 * @param {string} range1 The first range string.
 * @param {string} range2 The second range string.
 * @returns {boolean} True if the ranges might overlap based on boundary checks, false if definitely not or if inputs are invalid.
 */
export const rangesOverlap = (range1, range2) => {
    const p1 = parseRange(range1);
    const p2 = parseRange(range2);

    if (!p1 || p1.type === 'invalid' || !p2 || p2.type === 'invalid') {
        return false; // Invalid ranges cannot overlap meaningfully here
    }
    if (p1.type === 'any' || p2.type === 'any') {
        return true; // 'any' overlaps with everything (except maybe invalid)
    }

    // A simple check: test boundary points of one range against the other.
    // This is NOT exhaustive or fully correct, especially for OR ranges or complex exclusions.
    // TODO: Implement a more robust interval tree or constraint-based approach for accuracy.

    const getTestPoints = (parsedRange) => {
        const points = new Set();
        if (parsedRange.type === 'exact') {
            points.add(parsedRange.version);
        } else if (parsedRange.type === 'comparatorSet') {
            parsedRange.comparators.forEach(c => {
                points.add(c.version); // Check the comparator version itself
                 // Add versions slightly above/below boundary? Inc/dec patch? Very complex.
                 const nextP = inc(c.version, 'patch');
                 const nextPre = inc(c.version, 'prerelease'); // If it's like >=1.2.3-beta.1
                 if(nextP) points.add(nextP);
                 if(nextPre) points.add(nextPre);
                 // Need lower bounds too - requires a 'dec' function or careful manipulation
            });
        } else if (parsedRange.type === 'or') {
            parsedRange.ranges.forEach(r => getTestPoints(r).forEach(p => points.add(p)));
        }
        return points;
    };

    const points1 = getTestPoints(p1);
    const points2 = getTestPoints(p2);

    // Check if any point from range1 satisfies range2 OR any point from range2 satisfies range1
    for (const p of points1) {
        if (satisfies(p, range2)) return true;
    }
    for (const p of points2) {
        if (satisfies(p, range1)) return true;
    }

     // Add checks for simple range containment e.g., ^1.0.0 vs ^1.2.0
     if (p1.type === 'exact' && satisfies(p1.version, range2)) return true;
     if (p2.type === 'exact' && satisfies(p2.version, range1)) return true;

    // Default to false if no overlap found with simple checks
    // This is likely an UNDERestimation of overlaps for complex ranges.
    return false;
};

/**
 * Analyzes a list of versions to identify basic patterns.
 * Provides counts of unique major/minor versions, stable versions, and common prerelease tags.
 *
 * @param {string[]} versions An array of version strings (preferably sorted chronologically, though function sorts internally by version).
 * @returns {object} An analysis result object containing counts and patterns (e.g., { count: number, uniqueMajors: number, stableCount: number, prereleaseTags: {...} }). Returns { pattern: 'insufficient data' } if fewer than 2 valid versions are provided.
 */
export const analyzeVersionPattern = (versions) => {
    if (!Array.isArray(versions) || versions.length < 2) return { pattern: 'insufficient data' };
    const sorted = sort(versions); // Ensure sorted
    // Basic analysis: count majors, minors, patches, prereleases
    const majors = new Set();
    const minors = new Set();
    const patches = new Set();
    const prereleases = new Map();
    let stableCount = 0;

    sorted.forEach(v => {
        const p = parse(v);
        if (p) {
            majors.add(p.major);
            minors.add(`${p.major}.${p.minor}`);
            patches.add(p.version); // Use full version for patch uniqueness? Or major.minor.patch?
            if (p.prerelease.length > 0) {
                const key = p.prerelease[0]; // Simple check based on first tag
                prereleases.set(key, (prereleases.get(key) || 0) + 1);
            } else {
                stableCount++;
            }
        }
    });

    return {
        count: sorted.length,
        uniqueMajors: majors.size,
        uniqueMinors: minors.size,
        uniquePatches: patches.size, // Might be same as count if all unique
        stableCount: stableCount,
        prereleaseTags: Object.fromEntries(prereleases.entries()),
        // TODO: Add frequency analysis (e.g., time between releases if timestamps available)
    };
};

/**
 * Applies a given operation function to each version in a list.
 *
 * @param {string[]} versions List of version strings.
 * @param {Function} operation A function to apply to each version. It will receive the version string as its first argument, followed by any additional arguments provided to `batchProcess`.
 * @param {...any} args Additional arguments to pass to the operation function after the version string.
 * @returns {any[]} An array containing the results of applying the operation function to each version.
 */
export const batchProcess = (versions, operation, ...args) => {
     if (!Array.isArray(versions) || typeof operation !== 'function') return [];
     return versions.map(v => operation(v, ...args));
};

// --- Compatibility and Migration ---

/**
 * Assesses the compatibility between two versions based on SemVer rules, assuming an upgrade context.
 * Checks for breaking changes (major version bumps, or minor/patch bumps in 0.x versions).
 * Considers downgrades as incompatible.
 *
 * @param {string} currentVersion The current version string.
 * @param {string} targetVersion The target version string.
 * @returns {'major' | 'minor' | 'patch' | 'prerelease' | 'compatible' | 'incompatible' | 'unknown'}
 *          - 'major': Breaking change (major version differs, > 0).
 *          - 'minor': Likely compatible (new features, same major).
 *          - 'patch': Compatible (bug fixes, same major.minor).
 *          - 'prerelease': Compatibility depends on prerelease tags (treated as compatible if target >= current).
 *          - 'compatible': Versions are effectively the same or target is a compatible prerelease/stable transition.
 *          - 'incompatible': Breaking change (major=0 bump, downgrade).
 *          - 'unknown': If either version is invalid.
 */
export const compatibilityAssessment = (currentVersion, targetVersion) => {
    const p1 = parse(currentVersion);
    const p2 = parse(targetVersion);

    if (!p1 || !p2) return 'unknown'; // Cannot assess if versions are invalid

    // Generally, compatibility depends on the perspective (upgrading vs downgrading)
    // Let's assume assessing compatibility *if upgrading from current to target*
    if (p1.major !== p2.major) {
        // Major version 0 is special (breaking changes expected with minor bumps)
        if (p1.major === 0 || p2.major === 0) {
            return 'incompatible'; // Any change in 0.x is potentially breaking
        }
        return 'major'; // Breaking change according to SemVer
    }
    // Major versions are the same
    if (p1.minor !== p2.minor) {
        // If target minor is lower, it's likely breaking (removing features)
        if (p2.minor < p1.minor) return 'incompatible';
        return 'minor'; // New features, should be backward compatible
    }
    // Major and minor are the same
    if (p1.patch !== p2.patch) {
         // If target patch is lower, it's technically compatible but might indicate issues
        if (p2.patch < p1.patch) return 'incompatible'; // Downgrading patch?
        return 'patch'; // Bug fixes, should be compatible
    }

    // Versions are identical up to patch level. Check prerelease.
    // Upgrading from stable to prerelease is compatible (but pre).
    // Upgrading from prerelease to stable is compatible.
    // Upgrading between prereleases depends on identifiers.
    const pre1 = p1.prerelease.length > 0;
    const pre2 = p2.prerelease.length > 0;
    if (!pre1 && !pre2) return 'compatible'; // Identical stable versions
    if (!pre1 && pre2) return 'compatible'; // Stable to prerelease of same version
    if (pre1 && !pre2) return 'compatible'; // Prerelease to stable release of same version
    if (pre1 && pre2) {
         // Compare prerelease tags - assume compatible if target >= current prerelease
         return compareVersions(currentVersion, targetVersion) <= 0 ? 'compatible' : 'incompatible';
    }

    return 'unknown'; // Should not be reached
};


/**
 * Finds a potential upgrade path (sequence of versions) between a current and target version,
 * given a list of available versions. Basic implementation finds versions > current and <= target.
 *
 * @param {string} currentVersion The starting version string.
 * @param {string} targetVersion The desired target version string.
 * @param {string[]} availableVersions An array of available version strings.
 * @returns {string[]} A sorted array of valid versions representing a possible upgrade path (including target if available), or an empty array if no path is needed or possible.
 */
export const upgradePath = (currentVersion, targetVersion, availableVersions = []) => {
    if (!isValid(currentVersion) || !isValid(targetVersion) || !Array.isArray(availableVersions)) {
        return [];
    }
    if (gte(currentVersion, targetVersion)) return []; // Already at or above target

    const validAvailable = sort(validVersions(availableVersions));

    // Filter versions strictly between current and target
    const path = validAvailable.filter(v =>
        gt(v, currentVersion) && lte(v, targetVersion)
    );

    // Ensure target is included if it was in availableVersions
    // The filter already includes it if lte(v, targetVersion)

    // Return the sorted path
    return path;
     // TODO: Could be enhanced to find paths avoiding known incompatible versions,
     // or prioritizing specific intermediate releases.
};

/**
 * Migrates a legacy version string to SemVer based on provided rules.
 * This is a placeholder and requires specific mapping rules to be implemented.
 *
 * @param {string} legacyVersion The old version string (e.g., '1.5', '20231026').
 * @param {object} [mappingRules={}] Rules to convert legacy format (e.g., `{ type: 'twoPartToZeroMajor' }`).
 * @returns {string | null} The converted SemVer string, or null if no applicable rule is found or conversion fails.
 */
export const migrateLegacyVersion = (legacyVersion, mappingRules = {}) => {
    // Example rule: map A.B to 0.A.B
    if (mappingRules.type === 'twoPartToZeroMajor' && /^\d+\.\d+$/.test(legacyVersion)) {
        return `0.${legacyVersion}`;
    }
    // Add more complex mapping rules based on patterns or lookup tables
    console.warn("migrateLegacyVersion is a placeholder. Implement specific rules.");
    return null;
};


/**
 * A safer wrapper around the 'inc' function.
 * Currently acts as a simple alias for 'inc', but could be extended to add options
 * like error handling modes (e.g., return null vs. throw on invalid input).
 *
 * @param {string} version The current version string.
 * @param {'major' | 'minor' | 'patch' | 'premajor' | 'preminor' | 'prepatch' | 'prerelease'} [type='patch'] The increment type.
 * @param {object} [options] Options object (placeholder, currently unused).
 * @returns {string | null} The incremented version string, or null on failure (if input version is invalid or type is invalid).
 */
export const safeInc = (version, type = 'patch', options = {}) => {
    // Could add try-catch or validation based on options
    return inc(version, type);
};

/**
 * Translates a SemVer string to a different representation based on a naming scheme (e.g., codenames).
 * This is a placeholder; requires a specific naming scheme definition.
 *
 * @param {string} version The SemVer string.
 * @param {object} [namingScheme={}] A map or rules for translation (e.g., `{ "1.0.0": "Titan", "^2.0.0": "Jupiter" }`).
 * @returns {string} The translated name based on the scheme, or the original version string if no match is found.
 */
export const translateVersion = (version, namingScheme = {}) => {
    if (namingScheme[version]) {
        return namingScheme[version];
    }
    // Add more complex matching (e.g., ranges to codenames)
    return version;
};


/**
 * Performs basic health checks on the SemVer library's core functions and cache.
 * Useful for diagnostics or ensuring the library is functioning as expected.
 * Note: Uses require for cache functions internally for simplicity in this standalone check function.
 *
 * @returns {object} An object with status ('OK', 'WARN', 'ERROR'), a list of individual checks performed, and a list of errors encountered.
 */
export const healthCheck = () => {
    // Need to import cache functions if not already implicitly available
    // Assuming they are available via the main index or direct import if needed
    // For clarity, let's ensure they are imported:
    const { clearParseCache: clearCache, getCacheStats: getStats } = require('./internal/semverCache.js');
    // NOTE: Using require here for simplicity in this example edit.
    // Proper ES6 import should be at the top of the file.

    let status = 'OK';
    const checks = [];
    const errors = [];

    // Check core functions
    try {
        checks.push('Parse: ' + (parse('1.2.3') ? 'OK' : 'FAIL'));
        checks.push('Compare: ' + (compareVersions('1.2.3', '1.2.4') < 0 ? 'OK' : 'FAIL'));
        checks.push('Satisfies: ' + (satisfies('1.3.0', '^1.2.3') ? 'OK' : 'FAIL'));
        checks.push('Inc: ' + (inc('1.2.3', 'patch') === '1.2.4' ? 'OK' : 'FAIL'));
    } catch (e) {
        status = 'ERROR';
        errors.push(`Core function test failed: ${e.message}`);
    }

    // Check cache (basic)
    try {
        clearCache();
        cachedParse('5.5.5'); // Use cachedParse directly
        const stats = getStats();
        checks.push('Cache Size: ' + (stats.size === 1 ? 'OK' : 'FAIL'));
        checks.push('Cache Hits/Misses: ' + (stats.hits === 0 && stats.misses === 1 ? 'OK' : 'FAIL'));
        cachedParse('5.5.5');
        const stats2 = getStats();
        checks.push('Cache Hit: ' + (stats2.hits === 1 ? 'OK' : 'FAIL'));
        clearCache(); // Clean up
    } catch (e) {
         status = 'WARN'; // Cache issues might not be critical error
         errors.push(`Cache test failed: ${e.message}`);
    }

    return { status, checks, errors };
};

/*
// --- Functions previously excluded ---
// format: Use coreFormat from computeSemverCore.js
// buildMetadata: Use coreBuildMetadata from computeSemverCore.js
// clearParseCache & getCacheStats: Use functions from internal/semverCache.js (exported via index)
// createRange: Simple function, can be implemented inline where needed.
// parseComplexRange: Covered by parseRange in computeSemverRange.js
*/

// Final cleanup: Remove the entire comment block above. 