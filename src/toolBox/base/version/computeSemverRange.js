/**
 * @fileOverview Functions for parsing and evaluating Semantic Versioning (SemVer) ranges.
 * Provides capabilities to check if a version satisfies a given range expression (e.g., '>=1.2.3 <2.0.0 || ^3.0.0').
 */

import {
    compareVersions,
    gt,
    lt,
    gte,
    lte,
    eq,
    isValid,
    parse as parseVersion, // Rename to avoid conflict
    clean
} from './computeSemverCore.js';

// Define COMPARATORS locally, perhaps move to a constants file later if needed
const COMPARATORS = {
    '===': (a, b) => a === b,
    '!==': (a, b) => a !== b,
    '=': (a, b) => a === b, // Alias for ===
    '!=': (a, b) => a !== b, // Alias for !===
    '>': (a, b) => a > b,
    '>=': (a, b) => a >= b,
    '<': (a, b) => a < b,
    '<=': (a, b) => a <= b,
};

// --- Internal Helper Functions ---

/**
 * Parses a single comparator expression string (e.g., '>=1.2.3', '~1.2', '^0.0.x').
 * Handles various syntaxes including basic operators, tilde (~), caret (^), and simple wildcards.
 *
 * @param {string} comp The comparator string.
 * @returns {object | null} An object representing the comparator { operator, version, [upperBound] }, or null if invalid.
 *                          upperBound is added for wildcard ranges like '1.2.x'.
 */
function parseComparator(comp) {
    comp = comp.trim();

    // Special case: any version
    if (comp === '*' || comp === 'x' || comp === 'X') {
        return { operator: '>=', version: '0.0.0' };
    }

    // Handle tilde ranges (~)
    if (comp.startsWith('~')) {
        const versionPart = comp.substring(1);
        const cleanedVersion = clean(versionPart);
        const parsed = parseVersion(cleanedVersion);
        if (!parsed) return null;

        let maxMinor, maxPatch;
        if (parsed.minor === undefined) { // ~1 becomes >=1.0.0 <2.0.0
            maxMinor = parsed.major + 1;
            maxPatch = 0;
        } else { // ~1.2 becomes >=1.2.0 <1.3.0, ~1.2.3 becomes >=1.2.3 <1.3.0
            maxMinor = parsed.minor + 1;
            maxPatch = 0;
        }
        return {
            operator: '>=',
            version: `${parsed.major}.${parsed.minor || 0}.${parsed.patch || 0}`,
            upperBound: { operator: '<', version: `${parsed.major}.${maxMinor}.${maxPatch}` }
        };
    }

    // Handle caret ranges (^)
    if (comp.startsWith('^')) {
        const versionPart = comp.substring(1);
        const cleanedVersion = clean(versionPart);
        const parsed = parseVersion(cleanedVersion);
        if (!parsed) return null;

        let nextMajor = parsed.major + 1;
        let nextMinor = parsed.minor + 1;
        let nextPatch = parsed.patch + 1;

        let upperOperator = '<';
        let upperBoundVersion;

        if (parsed.major !== 0 || parsed.minor === undefined) { // ^1.x.x, ^1.2.x, ^1.2.3 => >=1.x.x <(major+1).0.0
             upperBoundVersion = `${nextMajor}.0.0`;
        } else if (parsed.minor !== 0 || parsed.patch === undefined) { // ^0.1.x, ^0.1.2 => >=0.1.x <0.(minor+1).0
            upperBoundVersion = `0.${nextMinor}.0`;
        } else { // ^0.0.x => >=0.0.x <0.0.(patch+1)
             upperBoundVersion = `0.0.${nextPatch}`;
        }
        // Handle ^0.0.0 edge case
        if(parsed.major === 0 && parsed.minor === 0 && parsed.patch === 0 && parsed.prerelease.length === 0) {
             return { operator: '=', version: '0.0.0' };
        }

        return {
            operator: '>=',
            version: `${parsed.major}.${parsed.minor || 0}.${parsed.patch || 0}`,
            upperBound: { operator: upperOperator, version: upperBoundVersion }
        };
    }

    // Handle partial wildcards (e.g., 1.x, 1.2.x)
    // Regex to capture major, minor (optional, digit or x), patch (optional, digit or x)
    const wildcardMatch = /^(\d+)(?:\.([xX*]|\d+))?(?:\.([xX*]|\d+))?$/.exec(comp);
    if (wildcardMatch) {
        const [, major, minor = 'x', patch = 'x'] = wildcardMatch;
        const mj = parseInt(major, 10);

        if (minor === 'x' || minor === 'X' || minor === '*') {
            // 1.x => >=1.0.0 <2.0.0
            return {
                operator: '>=',
                version: `${mj}.0.0`,
                upperBound: { operator: '<', version: `${mj + 1}.0.0` }
            };
        }

        const mn = parseInt(minor, 10);
        if (patch === 'x' || patch === 'X' || patch === '*') {
            // 1.2.x => >=1.2.0 <1.3.0
            return {
                operator: '>=',
                version: `${mj}.${mn}.0`,
                upperBound: { operator: '<', version: `${mj}.${mn + 1}.0` }
            };
        }
        // 1.2.3 (treat as exact match)
        const pt = parseInt(patch, 10);
        return { operator: '=', version: `${mj}.${mn}.${pt}` };
    }

    // Handle basic operators (>, >=, <, <=, =)
    const ops = Object.keys(COMPARATORS).sort((a, b) => b.length - a.length); // Prioritize longer operators like '>='
    let operator = '='; // Default to equals if no operator found
    let versionStr = comp;

    for (const op of ops) {
        if (comp.startsWith(op)) {
            operator = op;
            versionStr = comp.substring(op.length).trim();
            break;
        }
    }

    const cleaned = clean(versionStr);
    if (!cleaned || !isValid(cleaned)) return null; // Version part must be valid

    return { operator, version: cleaned };
}

/**
 * Tests if a version satisfies a single parsed comparator object.
 *
 * @param {string} version The version string to test.
 * @param {object} comparator The parsed comparator object from `parseComparator`.
 * @returns {boolean} True if the version satisfies the comparator.
 */
function testComparator(version, comparator) {
    if (!isValid(version)) return false; // Cannot satisfy if version itself is invalid

    const { operator, version: compVersion, upperBound } = comparator;

    const comparisonResult = compareVersions(version, compVersion);
    if (comparisonResult === null) return false; // Comparison failed

    // Check the main operator
    const mainCheck = COMPARATORS[operator](comparisonResult, 0);
    if (!mainCheck) return false;

    // If there's an upper bound (from wildcards, ~, ^), check that too
    if (upperBound) {
        const upperComparisonResult = compareVersions(version, upperBound.version);
        if (upperComparisonResult === null) return false; // Comparison failed
        return COMPARATORS[upperBound.operator](upperComparisonResult, 0);
    }

    return true; // Main check passed and no upper bound or upper bound check passed
}

/**
 * Recursively parses a version range string into a structured representation.
 * Handles simple ranges, comparators, OR (| |), AND (space-separated), hyphen ranges, and parentheses.
 *
 * @param {string} range The range string to parse.
 * @param {number} [depth=0] Recursion depth tracker to prevent infinite loops/stack overflows.
 * @returns {object} A structured object representing the parsed range, or { type: 'invalid' }.
 *          Possible types: 'exact', 'any', 'range', 'comparatorSet', 'or', 'invalid'.
 */
function parseRangeRecursive(range, depth = 0) {
    const MAX_DEPTH = 10;
    if (depth > MAX_DEPTH) {
        console.error("SemVer range parsing exceeded max depth:", range);
        return { type: 'invalid', original: range, reason: 'Nesting too deep' };
    }
    if (!range || typeof range !== 'string') {
        return { type: 'invalid', original: range, reason: 'Invalid input type' };
    }

    range = range.trim();

    // 1. Handle OR (||) - Highest precedence split
    // Need to respect parentheses when splitting
    let parenLevel = 0;
    let splitIndex = -1;
    const orParts = [];
    let currentPartStart = 0;

    for (let i = 0; i < range.length; i++) {
        if (range[i] === '(') parenLevel++;
        else if (range[i] === ')') parenLevel--;
        else if (range[i] === '|' && range[i + 1] === '|' && parenLevel === 0) {
            orParts.push(range.substring(currentPartStart, i).trim());
            i++; // Skip the second |
            currentPartStart = i + 1;
        }
    }
    orParts.push(range.substring(currentPartStart).trim());

    if (orParts.length > 1) {
        const parsedOrs = orParts.map(part => parseRangeRecursive(part, depth + 1)).filter(p => p.type !== 'invalid');
        if (parsedOrs.length === 0) return { type: 'invalid', original: range, reason: 'Invalid OR components' };
        return { type: 'or', ranges: parsedOrs, original: range };
    }
    // If no OR split, continue with the single part (orParts[0])
    range = orParts[0];

    // 2. Handle Hyphen Ranges (e.g., 1.2.3 - 2.3.4)
    // Ensure it's not part of a prerelease tag
    const hyphenMatch = range.match(/^\s*([^- ]+)\s+-\s+([^- ]+)\s*$/);
    if (hyphenMatch) {
        const minVersionStr = clean(hyphenMatch[1]);
        const maxVersionStr = clean(hyphenMatch[2]);

        if (minVersionStr && maxVersionStr && isValid(minVersionStr) && isValid(maxVersionStr)) {
            if (gt(minVersionStr, maxVersionStr)) {
                 return { type: 'invalid', original: range, reason: 'Hyphen range min > max' };
            }
            // Convert hyphen range 'min - max' to '>=min <=max'
            const minComp = { operator: '>=', version: minVersionStr };
            const maxComp = { operator: '<=', version: maxVersionStr };
            return { type: 'comparatorSet', comparators: [minComp, maxComp], original: range };
        }
         // If versions are not valid, treat as simple comparator string later
    }

    // 3. Handle Parentheses - Recursively parse content inside
    if (range.startsWith('(') && range.endsWith(')')) {
        // Basic check for balanced parentheses
        let level = 0;
        let balanced = true;
        for (let i = 0; i < range.length; i++) {
            if (range[i] === '(') level++;
            else if (range[i] === ')') level--;
            if (level < 0 || (level === 0 && i < range.length - 1)) {
                balanced = false;
                break;
            }
        }
        if (level === 0 && balanced) {
             // Recursively parse the content inside the outer parentheses
             return parseRangeRecursive(range.substring(1, range.length - 1), depth + 1);
        }
        // If parentheses are unbalanced or structure is complex, treat as comparator string
    }

    // 4. Handle Space-Separated Comparators (AND)
    // Split by spaces, but be careful about spaces within versions (shouldn't happen with clean versions)
    const comparators = range.split(/\s+/).filter(Boolean);
    const parsedComparators = [];

    for (const compStr of comparators) {
        const parsedComp = parseComparator(compStr);
        if (!parsedComp) {
            // Check if it looks like a simple valid version (implies '=')
            const cleaned = clean(compStr);
            if (cleaned && isValid(cleaned)) {
                parsedComparators.push({ operator: '=', version: cleaned });
            } else {
                return { type: 'invalid', original: range, reason: `Invalid comparator: ${compStr}` };
            }
        } else {
            parsedComparators.push(parsedComp);
        }
    }

    if (parsedComparators.length === 0) {
         // Handle '*' case explicitly if it wasn't caught by parseComparator
         if (range === '*' || range === 'x' || range === 'X') {
            return { type: 'any', original: range };
         }
        return { type: 'invalid', original: range, reason: 'No valid comparators found' };
    }
    if (parsedComparators.length === 1 && parsedComparators[0].operator === '>=' && parsedComparators[0].version === '0.0.0' && !parsedComparators[0].upperBound) {
        return { type: 'any', original: range }; // Matches '*' essentially
    }
    // If only one comparator, and it's '=', treat as 'exact'
    if (parsedComparators.length === 1 && parsedComparators[0].operator === '=') {
       return { type: 'exact', version: parsedComparators[0].version, original: range };
    }


    return { type: 'comparatorSet', comparators: parsedComparators, original: range };
}


// --- Exported Functions ---

/**
 * Parses a SemVer range string into a structured, easily evaluatable object.
 * This acts as a public entry point, calling the recursive parser.
 *
 * @param {string} range The version range string (e.g., '>=1.0.0 <2.0.0 || ^3.0.0').
 * @returns {object} The parsed range object, or an object with type 'invalid'.
 */
export const parseRange = (range) => {
    return parseRangeRecursive(range, 0);
};


/**
 * Checks if a given version satisfies a parsed range object.
 * @param {string} version The version string to check.
 * @param {object} parsedRange The parsed range object from `parseRange`.
 * @returns {boolean} True if the version satisfies the range, false otherwise.
 */
function checkParsedRange(version, parsedRange) {
     if (!isValid(version)) return false;
     if (!parsedRange || parsedRange.type === 'invalid') return false;

     switch (parsedRange.type) {
         case 'exact':
             return eq(version, parsedRange.version);
         case 'any':
             return true;
         case 'comparatorSet':
             // ALL comparators in the set must be satisfied (AND)
             return parsedRange.comparators.every(comp => testComparator(version, comp));
         case 'or':
             // ANY of the sub-ranges must be satisfied (OR)
             return parsedRange.ranges.some(subRange => checkParsedRange(version, subRange));
         // 'range' type is implicitly handled by converting to comparatorSet in parseRangeRecursive
         default:
             return false;
     }
}

/**
 * Checks if a given version satisfies a specified SemVer range string.
 *
 * @param {string} version The version string to check (e.g., '1.2.4').
 * @param {string} range The SemVer range string (e.g., '^1.2.3', '>=2.0.0 <3.1.0').
 * @returns {boolean} True if the version satisfies the range, false otherwise.
 */
export const satisfies = (version, range) => {
    const parsedRange = parseRange(range);
    return checkParsedRange(version, parsedRange);
};


/**
 * Validates a SemVer range string.
 *
 * @param {string} range The range string to validate.
 * @returns {string | null} Returns the cleaned, potentially simplified, original range string if valid, otherwise null.
 *                         Note: It doesn't fully normalize the range, just validates its parsability.
 */
export const validRange = (range) => {
    const parsed = parseRange(range);
    // Return the original (trimmed) string if parsing didn't result in 'invalid'
    // This matches the behavior of some popular libraries where validRange returns the input if valid.
    return (parsed && parsed.type !== 'invalid') ? parsed.original || range.trim() : null;
}; 