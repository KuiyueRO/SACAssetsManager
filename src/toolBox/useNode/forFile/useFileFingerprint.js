/**
 * @fileoverview Provides tools for calculating fast file fingerprints using XXHash3 and sampling.
 * Includes UltraFastFingerprint class for calculating fingerprints and walkAndHash for directory traversal.
 */

// Adjusted import path for requirePluginDeps
import { requirePluginDeps } from "../../useAge/forSiyuan/usePluginRequire.js";
import { open } from 'fs/promises'; // Use direct import
import fs from 'fs/promises'; // Use direct import for fs.stat, fs.readFile
import path from 'path'; // Import path module
import { performance } from 'perf_hooks'; // Import performance

// Attempt to load xxhash-addon, handle potential errors
let XXHash3;
try {
    XXHash3 = requirePluginDeps('xxhash-addon').XXHash3;
    if (!XXHash3 || typeof XXHash3.hash !== 'function') {
         throw new Error('XXHash3.hash function not found in xxhash-addon');
    }
} catch (error) {
    console.error("Failed to load 'xxhash-addon'. Fingerprinting features will be limited or unavailable.", error);
    // Provide a fallback or throw a more specific error if essential
    XXHash3 = null; // Indicate that the hash function is unavailable
}


const PAGE_SIZE = 4096; // Often the default OS page size

/**
 * Manages a pool of aligned buffers for efficient I/O.
 */
class AlignedBufferPool {
    constructor(blockSize, poolSize) {
        this.blockSize = blockSize;
        this.poolSize = poolSize;
        this.buffers = [];
        this.freeBuffers = [];

        this.initialize();
    }

    initialize() {
        try {
            for (let i = 0; i < this.poolSize; i++) {
                // Node.js Buffer.alloc is already optimized, alignment concerns less critical than in C/C++
                const buffer = Buffer.alloc(this.blockSize); // Use alloc instead of allocUnsafe for safety
                this.buffers.push(buffer);
                this.freeBuffers.push(buffer);
            }
        } catch (error) {
            console.error("Failed to initialize buffer pool:", error);
            // Handle initialization error, maybe throw or degrade gracefully
        }
    }

    // allocateAlignedBuffer removed as Buffer.alloc is sufficient in Node.js

    acquire() {
        if (this.freeBuffers.length > 0) {
            return this.freeBuffers.pop();
        }
        // Optionally create a new buffer if pool is empty, or throw/wait
        console.warn("Buffer pool depleted, allocating new buffer.");
        return Buffer.alloc(this.blockSize);
    }

    release(buffer) {
        if (this.freeBuffers.length < this.poolSize) {
            // Optionally clear the buffer before releasing: buffer.fill(0);
            this.freeBuffers.push(buffer);
        }
        // If pool is full, the buffer will be garbage collected
    }

    destroy() {
        this.buffers = [];
        this.freeBuffers = [];
        // Explicitly nullify to help GC, though likely not strictly necessary
    }
}


/**
 * Calculates ultra-fast fingerprints for files using sampling and XXHash3.
 */
export class UltraFastFingerprint {
    constructor(options = {}) {
        if (!XXHash3) {
            throw new Error("XXHash3 is not available. UltraFastFingerprint cannot be initialized.");
        }

        this.options = {
            blockSize: PAGE_SIZE, // Size of blocks to read
            samplingStrategy: {
                smallFileThreshold: 32 * 1024,   // Up to 32KB: hash entire file
                mediumFileThreshold: 512 * 1024, // Up to 512KB: hash start, middle, end
                largeFileThreshold: 10 * 1024 * 1024, // Up to 10MB: hash start, 2 middle samples, end
                // Larger than 10MB: hash start, 3 middle samples, end
            },
            bufferPool: {
                size: 16, // Number of buffers in the pool
            },
            ...options
        };

        // Use the loaded XXHash3 function
        this.hashFunction = (buffer) => XXHash3.hash(buffer).toString('hex');

        this.bufferPool = new AlignedBufferPool(
            this.options.blockSize,
            this.options.bufferPool.size
        );
    }

     /**
      * Calculates the fingerprint for a given file path based on its size.
      * @param {string} filePath - Path to the file.
      * @returns {Promise<string>} - The calculated hex fingerprint.
      * @throws {Error} If fingerprinting fails.
      */
    async calculateFingerprint(filePath) {
        let stats;
        try {
            stats = await fs.stat(filePath);
        } catch (error) {
             if (error.code === 'ENOENT') {
                 throw new Error(`File not found: ${filePath}`);
             }
            throw new Error(`Failed to get stats for ${filePath}: ${error.message}`);
        }

        const size = stats.size;

        try {
            if (size === 0) {
                 // Handle empty files: return a predefined hash or hash an empty buffer
                 return this.hashFunction(Buffer.alloc(0));
            } else if (size <= this.options.samplingStrategy.smallFileThreshold) {
                return this.calculateSmallFileFingerprint(filePath, size);
            } else if (size <= this.options.samplingStrategy.mediumFileThreshold) {
                return this.calculateMediumFileFingerprint(filePath, size);
            } else {
                return this.calculateLargeFileFingerprint(filePath, size);
            }
        } catch (error) {
            // Catch errors from specific calculation methods
            throw new Error(`Failed to calculate fingerprint for ${filePath}: ${error.message}`);
        }
    }

    /** Hashes the entire content of small files. */
    async calculateSmallFileFingerprint(filePath, size) {
        try {
             const buffer = await fs.readFile(filePath);
             return this.hashFunction(buffer);
        } catch (error) {
             throw new Error(`Reading small file ${filePath}: ${error.message}`);
        }
    }

    /** Hashes samples from the start, middle, and end of medium files. */
    async calculateMediumFileFingerprint(filePath, size) {
        const positions = [
            0,
            Math.floor(size / 2),
            Math.max(0, size - this.options.blockSize) // Ensure end pos is not negative
        ];
        const uniquePositions = [...new Set(positions)].sort((a, b) => a - b); // Remove duplicates (e.g., if size < blockSize*2)
        const samples = await this.readFileSamples(filePath, uniquePositions, size);
        return this.hashSamples(samples, size);
    }

    /** Hashes samples from the start, end, and several points in between for large files. */
    async calculateLargeFileFingerprint(filePath, size) {
        const positions = this.calculateSamplePositions(size);
        const samples = await this.readFileSamples(filePath, positions, size);
        return this.hashSamples(samples, size);
    }

    /** Reads samples from specified positions in the file. */
    async readFileSamples(filePath, positions, fileSize) {
        let fileHandle;
        let buffer = null; // Initialize buffer to null
        try {
            fileHandle = await this.openFileOptimized(filePath);
            buffer = this.bufferPool.acquire(); // Acquire buffer from pool
            const samples = [];
            const blockSize = this.options.blockSize;

            for (let i = 0; i < positions.length; i++) {
                const position = positions[i];
                // Ensure reading does not go beyond file size
                const bytesToRead = Math.min(blockSize, fileSize - position);

                if (bytesToRead <= 0) continue; // Skip if position is at or beyond EOF

                 // Read exactly bytesToRead into the buffer at offset 0
                const { bytesRead } = await fileHandle.read(buffer, 0, bytesToRead, position);

                if (bytesRead > 0) {
                    // Create a new buffer containing only the bytes read
                    samples.push(Buffer.from(buffer.slice(0, bytesRead)));
                }
            }
            return samples;
        } catch (error) {
             throw new Error(`Reading samples from ${filePath}: ${error.message}`);
        } finally {
            if (buffer) this.bufferPool.release(buffer); // Release buffer back to pool
            if (fileHandle) await fileHandle.close(); // Ensure file handle is closed
        }
    }

     /** Opens a file for reading. Can be extended for platform-specific optimizations. */
    async openFileOptimized(filePath) {
        try {
             // 'r' mode is sufficient, O_DIRECT is complex and platform-specific
             return await open(filePath, 'r');
        } catch (error) {
             throw new Error(`Opening file ${filePath}: ${error.message}`);
        }
    }

    // readAligned removed as fileHandle.read with position is sufficient

    /** Calculates sample positions based on file size and strategy. */
    calculateSamplePositions(fileSize) {
        const positions = [0]; // Always include the start
        const blockSize = this.options.blockSize;
        let sampleCount = 2; // Default for large files threshold

        if (fileSize > this.options.samplingStrategy.largeFileThreshold) {
            sampleCount = 3; // More samples for very large files
        }

        // Calculate positions between start and end block
        if (fileSize > blockSize * 2) { // Ensure there's space between start and end blocks
             const innerRange = fileSize - 2 * blockSize;
             const step = Math.floor(innerRange / (sampleCount + 1));
             for (let i = 1; i <= sampleCount; i++) {
                 positions.push(blockSize + i * step);
             }
        }

        // Always include the start of the last block if file is larger than one block
        if (fileSize > blockSize) {
            positions.push(Math.max(0, fileSize - blockSize));
        }

        // Remove duplicates and sort
        return [...new Set(positions)].sort((a, b) => a - b);
    }

    /** Combines samples and file size into a single buffer and hashes it. */
    hashSamples(samples, fileSize) {
        if (samples.length === 0) {
             // Handle cases where no samples were read (e.g., error or zero size file handled earlier)
             console.warn("hashSamples called with empty samples array.");
             return this.hashFunction(Buffer.alloc(0)); // Or handle as appropriate
        }
        // Calculate total length needed: sum of sample lengths + 8 bytes for file size
        const totalLength = samples.reduce((acc, sample) => acc + sample.length, 0) + 8;
        const combinedBuffer = Buffer.allocUnsafe(totalLength); // Unsafe is ok here as we overwrite entirely

        let offset = 0;
        for (const sample of samples) {
            sample.copy(combinedBuffer, offset);
            offset += sample.length;
        }

        // Append the file size as a 64-bit little-endian unsigned integer
        try {
             combinedBuffer.writeBigUInt64LE(BigInt(fileSize), offset);
        } catch (e) {
             console.error(`Error writing file size ${fileSize} to buffer:`, e);
             // Handle potential BigInt errors for extremely large sizes if necessary
             // Fallback or rethrow might be needed
             throw new Error(`Failed to write file size to buffer: ${e.message}`);
        }


        return this.hashFunction(combinedBuffer);
    }

    /**
     * Processes a batch of file paths to calculate fingerprints sequentially.
     * TODO: Implement concurrent processing using the Semaphore.
     * @param {string[]} filePaths - Array of file paths.
     * @returns {Promise<Array<{path: string, hash?: string, error?: Error}>>} - Array of results.
     */
    async processBatch(filePaths) {
        const results = [];
        for (const filePath of filePaths) {
            try {
                const hash = await this.calculateFingerprint(filePath);
                results.push({ path: filePath, hash });
            } catch (error) {
                console.error(`Error processing ${filePath}:`, error);
                results.push({ path: filePath, error });
            }
        }
        return results; // Returns an array of promises when using concurrency
    }

    /** Cleans up resources, like the buffer pool. */
    destroy() {
        this.bufferPool.destroy();
        // Any other cleanup needed
    }
}


// --- Semaphore Implementation ---

/**
 * A basic Semaphore implementation for limiting concurrency.
 */
class Semaphore {
    constructor(maxConcurrency) {
        this.max = maxConcurrency;
        this.available = maxConcurrency;
        this.waiting = [];
    }

    async acquire() {
        if (this.available > 0) {
            this.available--;
            return Promise.resolve(); // Immediately resolve if permits available
        }
        // Otherwise, wait for a permit to be released
        return new Promise(resolve => {
            this.waiting.push(resolve);
        });
    }

    release() {
        this.available++;
        if (this.waiting.length > 0 && this.available > 0) {
             // A permit is available, and someone is waiting
             this.available--; // Grant the permit
             const nextResolve = this.waiting.shift(); // Get the next waiting promise's resolver
             nextResolve(); // Resolve the promise, allowing the waiting task to proceed
        }
         // Ensure available count doesn't exceed max (though should not happen with correct acquire/release)
         if (this.available > this.max) {
            console.warn("Semaphore available count exceeded max. Check acquire/release logic.");
            this.available = this.max;
         }
    }
}


// --- Directory Traversal and Hashing ---

/**
 * Walks a directory recursively, calculates fingerprints for files, and handles concurrency.
 * @param {string} dir - The starting directory path.
 * @param {UltraFastFingerprint} fingerprintInstance - An instance of UltraFastFingerprint.
 * @param {number} [concurrency=4] - Maximum number of files to process concurrently.
 * @returns {Promise<Array<{path: string, hash?: string, error?: Error}>>} - Results for each file.
 */
export async function walkAndHash(dir, fingerprintInstance, concurrency = 4) {
    const semaphore = new Semaphore(concurrency);
    const results = [];
    const filesToProcess = [];

    /** Recursively finds all files within a directory. */
    async function findFiles(currentDir) {
        try {
            const dirents = await fs.readdir(currentDir, { withFileTypes: true });
            const tasks = dirents.map(async (dirent) => {
                const fullPath = path.join(currentDir, dirent.name);
                if (dirent.isDirectory()) {
                    await findFiles(fullPath); // Recurse into subdirectories
                } else if (dirent.isFile()) {
                    filesToProcess.push(fullPath); // Add file path to the list
                }
            });
            await Promise.all(tasks);
        } catch (error) {
            console.error(`Error reading directory ${currentDir}:`, error);
            // Decide how to handle directory read errors (skip, throw, log)
             results.push({ path: currentDir, error: new Error(`Directory read error: ${error.message}`) });
        }
    }

    /** Processes a single file: acquires semaphore, calculates hash, releases semaphore. */
    async function processFile(filePath) {
        await semaphore.acquire(); // Wait for an available permit
        let result;
        const startTime = performance.now();
        try {
            const hash = await fingerprintInstance.calculateFingerprint(filePath);
            const endTime = performance.now();
            console.log(`Hashed ${filePath} in ${(endTime - startTime).toFixed(2)} ms`);
            result = { path: filePath, hash };
        } catch (error) {
            const endTime = performance.now();
            console.error(`Error hashing ${filePath} after ${(endTime - startTime).toFixed(2)} ms:`, error);
            result = { path: filePath, error };
        } finally {
            semaphore.release(); // Release the permit
        }
        return result;
    }

    // 1. Find all files
    await findFiles(dir);

    // 2. Process all found files concurrently
    const processingPromises = filesToProcess.map(filePath => processFile(filePath));

    // 3. Collect results (handle potential errors during processing)
    const settledResults = await Promise.allSettled(processingPromises);

    // Format final results
    settledResults.forEach(settledResult => {
         if (settledResult.status === 'fulfilled') {
             results.push(settledResult.value);
         } else {
             // This should ideally not happen if processFile catches errors, but belt-and-suspenders
             console.error("Unexpected rejection from processFile:", settledResult.reason);
             // Attempt to find the path associated with the error if possible, otherwise log generically
             results.push({ path: 'unknown', error: settledResult.reason });
         }
     });


    return results;
} 