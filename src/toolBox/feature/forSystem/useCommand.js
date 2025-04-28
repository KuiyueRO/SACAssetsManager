/**
 * @fileoverview Provides functionality to execute system commands.
 */

if (!window.require) {
    throw new Error('This module depends on Node.js and should only be called locally.');
}
const { exec } = window.require('child_process');
const fs = window.require('fs');

/**
 * Executes a local command and retrieves the result.
 * @param {string} command - The command to execute.
 * @param {Object} [options={}] - Execution options.
 * @param {string|'buffer'} [options.encoding='utf8'] - The encoding for the output (stdout).
 * @param {boolean} [options.useFile=false] - Whether to read the output from a file instead of stdout.
 * @param {string} [options.outputPath] - The path to the output file (required if useFile is true).
 * @param {string} [options.fileEncoding='utf16le'] - The encoding to use when reading the output file.
 * @returns {Promise<string|Buffer>} A promise that resolves with the command output.
 * @throws {Error} Throws an error if the command execution fails or reading the output file fails.
 */
export async function executeCommand(command, options = {}) {
    const {
        encoding = 'utf8',
        useFile = false,
        outputPath = '',
        fileEncoding = 'utf16le'
    } = options;

    // Validate outputPath if useFile is true
    if (useFile && !outputPath) {
        return Promise.reject(new Error('outputPath is required when useFile is true.'));
    }

    return new Promise((resolve, reject) => {
        exec(command, { encoding }, (error, stdout, stderr) => { // Also capture stderr
            if (error) {
                // Include stderr in the error message for better debugging
                const errorMessage = `Command failed: ${error.message}
Stderr: ${stderr}`;
                reject(new Error(errorMessage));
                return;
            }

            if (useFile) {
                // Ensure the output file exists before attempting to read
                if (!fs.existsSync(outputPath)) {
                    reject(new Error(`Output file not found: ${outputPath}. Stdout: ${stdout}`));
                    return;
                }
                try {
                    // Use readFile for async operation
                    fs.readFile(outputPath, fileEncoding, (readError, output) => {
                        if (readError) {
                            reject(new Error(`Failed to read output file ${outputPath}: ${readError.message}`));
                        } else {
                            resolve(output);
                        }
                    });
                } catch (catchError) { // Catch potential sync errors during setup, though readFile is async
                     reject(new Error(`Error setting up file read for ${outputPath}: ${catchError.message}`));
                }
            } else {
                resolve(stdout);
            }
        });
    });
} 