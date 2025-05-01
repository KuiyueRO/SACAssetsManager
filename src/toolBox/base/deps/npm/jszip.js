/**
 * @fileoverview Re-exports the 'jszip' library using require.
 * Provides a consistent ESM export interface.
 */
// Use require to import the CJS module from node_modules
const JSZip = require('jszip');

// Use export to provide an ESM interface to the rest of the codebase
export { JSZip };

// Alternatively, if require syntax is strictly needed in the target file:
// const JSZip = require('jszip');
// module.exports = { JSZip };
// However, sticking to ESM exports is generally preferred if possible. 