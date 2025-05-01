/**
 * @fileoverview Re-exports the Node.js built-in 'fs.promises' API using require.
 * Provides a consistent ESM export interface for async file system operations.
 */
// Use require to import the core 'fs' module
const fs = require('fs');

// Extract the promises API
const fsPromises = fs.promises;

// Export the promises API for ESM consumption
export { fsPromises };

// If synchronous methods are needed elsewhere, the core 'fs' could also be exported:
// export { fs as fsSync, fsPromises }; 