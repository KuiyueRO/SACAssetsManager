/**
 * @fileoverview Provides tools for calculating fast file fingerprints using XXHash3 and sampling.
 * Includes UltraFastFingerprint class for calculating fingerprints and walkAndHash for directory traversal.
 */

// Adjusted import path for requirePluginDeps
import { requirePluginDeps } from "../../../useAge/forSiyuan/usePluginRequire.js";
// Use window.require for Node.js built-ins
const fs = window.require('fs').promises;
const path = window.require('path');

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

    acquire() {
        if (this.freeBuffers.length > 0) {
            return this.freeBuffers.pop();
        }
        // Optionally handle pool exhaustion: wait or allocate new buffer temporarily
        console.warn("Buffer pool exhausted. Consider increasing pool size or handling allocation differently.");
        // For now, allocate a new buffer if pool is empty (less efficient)
        return Buffer.alloc(this.blockSize);
    }

    release(buffer) {
        // Basic check to prevent adding foreign buffers or duplicates
        if (this.buffers.includes(buffer) && !this.freeBuffers.includes(buffer)) {
            this.freeBuffers.push(buffer);
        } else if (!this.buffers.includes(buffer)) {
            // If it's a temporary buffer allocated outside the pool, just let GC handle it
            // console.log("Released a buffer not belonging to the pool.");
        } else {
            // console.warn("Attempted to release a buffer already in the free pool.");
        }
    }

    destroy() {
        this.buffers = [];
        this.freeBuffers = [];
        // Perform any other necessary cleanup
    }
}

/**
 * Options for UltraFastFingerprint.
 */
const DEFAULT_OPTIONS = {
    blockSize: 64 * 1024, // 64KB block size for reading
    bufferPoolSize: 4,    // Number of buffers in the pool
    samplingStrategy: {
        // Strategy for sampling large files
        largeFileThreshold: 1 * 1024 * 1024, // 1MB threshold for large file sampling
    },
    hashFunction: (buffer) => {
        if (!XXHash3) {
            console.error("XXHash3 is unavailable. Cannot compute hash.");
            // Fallback strategy: maybe use a different hash or return a specific error/value
            // For now, throwing an error as hashing is the core purpose
            throw new Error("XXHash3 unavailable");
        }
        // Assuming XXHash3.hash takes a Buffer and returns the hash
        return XXHash3.hash(buffer).toString('hex'); // Example: return hex string
    },
};

/**
 * Provides ultra-fast file fingerprinting using XXHash3 and file sampling.
 */
export class UltraFastFingerprint {
    constructor(options = {}) {
        this.options = { ...DEFAULT_OPTIONS, ...options };
        if (!XXHash3 && !this.options.hashFunction) {
            throw new Error("XXHash3 unavailable and no custom hash function provided.");
        }
        this.hashFunction = this.options.hashFunction;
        this.bufferPool = new AlignedBufferPool(this.options.blockSize, this.options.bufferPoolSize);
    }

    /**
     * Calculates the fingerprint for a given file path.
     * @param {string} filePath - The path to the file.
     * @returns {Promise<string>} - The calculated fingerprint hash.
     */
    async calculateFingerprint(filePath) {
        let fileHandle;
        let buffer;
        try {
            const stats = await fs.stat(filePath);
            const fileSize = stats.size;

            if (fileSize === 0) {
                // Consistent hash for empty files
                return this.hashFunction(Buffer.alloc(0));
            }

            fileHandle = await fs.open(filePath, 'r');
            buffer = this.bufferPool.acquire();

            if (fileSize <= this.options.blockSize) {
                // Read the whole file if it fits in one block
                const { bytesRead } = await fileHandle.read(buffer, 0, fileSize, 0);
                if (bytesRead !== fileSize) {
                    throw new Error(`Read error: expected ${fileSize}, got ${bytesRead}`);
                }
                // Hash the actual bytes read
                return this.hashFunction(buffer.slice(0, bytesRead));
            }

            // --- Sampling for larger files ---
            const samplePositions = this.getSamplePositions(fileSize, this.options.blockSize);
            const samples = [];

            for (const position of samplePositions) {
                // Ensure we don't read past the end of the file
                const bytesToRead = Math.min(this.options.blockSize, fileSize - position);
                const sampleBuffer = Buffer.allocUnsafe(bytesToRead); // Use allocUnsafe for temp sample buffers

                const { bytesRead } = await fileHandle.read(sampleBuffer, 0, bytesToRead, position);

                if (bytesRead !== bytesToRead) {
                    console.warn(`Sampling read warning for ${filePath} at pos ${position}: expected ${bytesToRead}, got ${bytesRead}`);
                    // Handle partial reads if necessary, e.g., continue with what was read or error
                    if (bytesRead === 0) continue; // Skip if nothing was read
                    samples.push(sampleBuffer.slice(0, bytesRead)); // Use only the bytes actually read
                } else {
                    samples.push(sampleBuffer);
                }
            }

            if (samples.length === 0) {
                // This might happen if all reads failed or were zero bytes
                throw new Error(`Failed to read any samples for file: ${filePath}`);
            }

            // Combine samples and file size, then hash
            return this.hashSamples(samples, fileSize);

        } catch (error) {
            console.error(`Error calculating fingerprint for ${filePath}:`, error);
            throw error; // Re-throw the error for the caller to handle
        } finally {
            if (buffer) {
                this.bufferPool.release(buffer);
            }
            if (fileHandle) {
                await fileHandle.close().catch(closeError => console.error(`Error closing file ${filePath}:`, closeError));
            }
        }
    }

    /** Determines the positions within the file to read samples from. */
    getSamplePositions(fileSize, blockSize) {
        const positions = [0]; // Always include the start of the file

        // Determine number of samples based on file size; adjust logic as needed
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
        const startTime = globalThis.performance.now(); // Use globalThis.performance
        try {
            const hash = await fingerprintInstance.calculateFingerprint(filePath);
            const endTime = globalThis.performance.now(); // Use globalThis.performance
            console.log(`Hashed ${filePath} in ${(endTime - startTime).toFixed(2)} ms`);
            result = { path: filePath, hash };
        } catch (error) {
            const endTime = globalThis.performance.now(); // Use globalThis.performance
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