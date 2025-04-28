/**
 * @fileOverview Functions for modifying and comparing Semantic Versioning (SemVer) strings.
 * Includes version incrementing and difference calculation.
 */

import { parse, make } from './computeSemverCore.js';

/**
 * Increments a SemVer version string based on the specified release type.
 *
 * @param {string} version The current version string.
 * @param {'major' | 'minor' | 'patch' | 'premajor' | 'preminor' | 'prepatch' | 'prerelease'} release The type of increment.
 * @param {string} [identifier] The identifier to use for prerelease increments (defaults based on context or 'alpha').
 * @param {string} [identifierBase] DEPRECATED: Not used by standard semver incrementing logic.
 * @returns {string | null} The new incremented version string, or null if the input version is invalid.
 */
export const inc = (version, release, identifier, identifierBase /* legacy/unused */) => {
    const parsed = parse(version);
    if (!parsed) return null;

    let { major: maj, minor: min, patch: pat, prerelease: pre, buildmetadata: build } = parsed;
    // Reset build metadata on any increment according to semver spec
    build = [];

    switch (release) {
        case 'major':
            // If 0.x.x or prerelease of 1.0.0, bump major to 1.
            if (maj === 0 || (pre.length > 0 && min === 0 && pat === 0)) {
                maj++;
                min = 0;
                pat = 0;
                pre = [];
            } else {
                maj++;
                min = 0;
                pat = 0;
                pre = [];
            }
            break;
        case 'minor':
             // If 0.0.x or prerelease of 0.1.0/1.1.0 etc., bump minor.
            if ((maj === 0 && min === 0) || (pre.length > 0 && pat === 0)) {
                 min++;
                 pat = 0;
                 pre = [];
            } else {
                min++;
                pat = 0;
                pre = [];
            }
            break;
        case 'patch':
            // If a prerelease version, just remove prerelease tags.
            if (pre.length > 0) {
                pre = [];
            } else {
                pat++;
            }
            break;
        case 'premajor':
            maj++;
            min = 0;
            pat = 0;
            pre = [identifier || '0']; // Default prerelease to '0' for pre bumps
            break;
        case 'preminor':
            min++;
            pat = 0;
            pre = [identifier || '0'];
            break;
        case 'prepatch':
            pat++;
            pre = [identifier || '0'];
            break;
        case 'prerelease':
            if (pre.length === 0) {
                // If not currently a prerelease, increment patch and add prerelease id
                pat++;
                pre = [identifier || '0'];
            } else {
                // Already a prerelease.
                // Find the last numeric identifier to increment.
                let i = pre.length - 1;
                while (i >= 0 && typeof pre[i] !== 'number') {
                    i--;
                }

                if (i >= 0 && pre[i] !== undefined) {
                    // Increment the numeric identifier.
                    pre[i]++;
                } else {
                    // No numeric identifier found, or identifier mismatch?
                    // Append new identifier or default '0'.
                    // Check if the new identifier matches the existing one(s).
                    if (identifier && pre.includes(identifier)){
                        // If identifier exists, find last number and increment it or add 0
                         let lastNumIndex = -1;
                         for(let k=pre.length-1; k>=0; k--) {
                             if(typeof pre[k] === 'number') {
                                 lastNumIndex = k;
                                 break;
                             }
                         }
                         if(lastNumIndex !== -1) {
                             pre[lastNumIndex]++;
                         } else {
                             pre.push(0);
                         }
                    } else if (identifier) {
                         // New identifier provided, start with 0
                         pre = [identifier, 0];
                    } else {
                        // No identifier, append 0
                         pre.push(0);
                    }
                }
            }
            break;
        default:
            return null; // Invalid release type
    }

    // Use the 'make' function to construct the final version string
    return make(maj, min, pat, pre, build);
};

/**
 * Calculates the difference type between two SemVer versions.
 *
 * @param {string} v1 The first version string.
 * @param {string} v2 The second version string.
 * @returns {'major' | 'minor' | 'patch' | 'prerelease' | 'build' | null} The most significant difference type,
 *          'build' if only build metadata differs, or null if versions are identical or invalid.
 */
export const diff = (v1, v2) => {
    const parsedV1 = parse(v1);
    const parsedV2 = parse(v2);

    if (!parsedV1 || !parsedV2) {
        // Cannot compare if either version is invalid
        return null;
    }

    // Use compareVersions for primary comparison, then check specifics
    const comparison = compareVersions(v1, v2);

    if (eq(v1, v2)) { // Strict equality including prerelease
         // Check if only build metadata differs
         const build1 = parsedV1.buildmetadata.join('.');
         const build2 = parsedV2.buildmetadata.join('.');
         return build1 === build2 ? null : 'build';
    }

    // Determine difference based on parsed components
    if (parsedV1.major !== parsedV2.major) return 'major';
    if (parsedV1.minor !== parsedV2.minor) return 'minor';
    if (parsedV1.patch !== parsedV2.patch) return 'patch';

    // If major, minor, patch are same, difference must be in prerelease
    return 'prerelease';
}; 