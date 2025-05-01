/**
 * @fileoverview Re-exports the 'pdf2pic' library using require.
 * Provides a consistent ESM export interface for PDF to image conversion.
 */
// Use require to import the CJS module from node_modules
const pdf2pic = require('pdf2pic');

// Use export to provide an ESM interface
export { pdf2pic };

// Note: pdf2pic might require native dependencies like Ghostscript or ImageMagick.
// Ensure they are correctly installed in the environment. 