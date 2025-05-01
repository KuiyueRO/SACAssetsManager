/**
 * @fileoverview Re-exports the Node.js built-in 'path' module using require.
 * Provides a consistent ESM export interface for path manipulation.
 */
// Use require to import the core 'path' module
const path = require('path');

// Export the entire path object for ESM consumption
export { path }; 