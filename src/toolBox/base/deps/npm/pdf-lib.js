/**
 * @fileoverview Re-exports the 'pdf-lib' library using require.
 * Provides a consistent ESM export interface for PDF manipulation.
 */
// Use require to import the CJS module from node_modules
const { PDFDocument } = require('pdf-lib');

// Use export to provide an ESM interface
export { PDFDocument };

// pdf-lib exports many other things. If needed, require and export them explicitly. 