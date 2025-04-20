/**
 * @fileoverview Provides functions for computing perceptual hashes (pHash) of images
 * and calculating the similarity between hashes.
 */

/**
 * Computes the 2D Discrete Cosine Transform (DCT) for a given square data array.
 * This is an internal helper function for pHash calculation.
 *
 * @param {Float64Array} data - The input data array (e.g., grayscale pixel values), assumed square.
 * @param {number} N - The dimension of the square data array (width or height).
 * @returns {Float64Array} The DCT coefficients.
 */
function computeDCT2D(data, N) {
    const output = new Float64Array(N * N);
    const piOver2N = Math.PI / (2 * N);
    const sqrt1_N = 1 / Math.sqrt(N);
    const sqrt2_N = Math.sqrt(2 / N);

    for (let u = 0; u < N; u++) {
        for (let v = 0; v < N; v++) {
            let sum = 0;
            for (let i = 0; i < N; i++) {
                for (let j = 0; j < N; j++) {
                    sum += data[i * N + j] *
                           Math.cos((2 * i + 1) * u * piOver2N) *
                           Math.cos((2 * j + 1) * v * piOver2N);
                }
            }
            // Apply normalization factors
            const cu = (u === 0) ? sqrt1_N : sqrt2_N;
            const cv = (v === 0) ? sqrt1_N : sqrt2_N;
            output[u * N + v] = cu * cv * sum;
        }
    }
    return output;
}


/**
 * Computes the perceptual hash (pHash) for a given image data array.
 * Assumes the input data is from a square, resized, grayscale image.
 *
 * @param {Uint8ClampedArray|Uint8Array|number[]} data - Flat array of pixel data (RGBA format).
 * @param {number} thumbnailSize - The width/height of the square thumbnail image the data represents.
 * @param {number} [dctSize=8] - The size of the DCT matrix to use (typically 8).
 * @returns {string} The computed pHash as a binary string.
 * @throws {Error} If the input data length doesn't match the expected RGBA length for the thumbnail size.
 */
export function computeImagePHash(data, thumbnailSize, dctSize = 8) {
    const expectedLength = thumbnailSize * thumbnailSize * 4;
    if (data.length !== expectedLength) {
        throw new Error(`Input data length (${data.length}) does not match expected RGBA length (${expectedLength}) for thumbnail size ${thumbnailSize}`);
    }
    if (dctSize <= 0 || dctSize > thumbnailSize) {
         throw new Error(`dctSize (${dctSize}) must be between 1 and thumbnailSize (${thumbnailSize})`);
    }

    // 1. Convert to grayscale
    const grayData = new Float64Array(thumbnailSize * thumbnailSize);
    for (let i = 0, j = 0; i < data.length; i += 4, j++) {
        // Using standard luminance calculation
        grayData[j] = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    }

    // 2. Compute DCT
    // Note: The original code's DCT implementation might differ slightly from standard definitions.
    // Using the provided computeDCT2D function.
    const dctCoeffs = computeDCT2D(grayData, thumbnailSize);

    // 3. Extract low-frequency DCT coefficients (top-left dctSize x dctSize)
    const dctLowFreq = new Float64Array(dctSize * dctSize);
    for (let i = 0; i < dctSize; i++) {
        for (let j = 0; j < dctSize; j++) {
            dctLowFreq[i * dctSize + j] = dctCoeffs[i * thumbnailSize + j];
        }
    }

    // 4. Calculate the average DCT value (excluding the DC component at [0,0])
    let total = 0;
    for(let k = 1; k < dctLowFreq.length; k++) { // Start from 1 to exclude DC
        total += dctLowFreq[k];
    }
    const avgDct = total / (dctSize * dctSize - 1);

    // 5. Generate the hash based on whether DCT coeffs are above or below average
    let hash = '';
    for (let i = 0; i < dctLowFreq.length; i++) {
        hash += dctLowFreq[i] > avgDct ? '1' : '0';
    }

    return hash;
}

/**
 * Computes the similarity between two pHash strings based on Hamming distance.
 *
 * @param {string} hash1 - The first pHash string.
 * @param {string} hash2 - The second pHash string.
 * @returns {number} The similarity score (0 to 1), where 1 means identical.
 * @throws {Error} If the hash strings have different lengths.
 */
export function computeHashSimilarity(hash1, hash2) {
    if (hash1.length !== hash2.length) {
        throw new Error(`Hash lengths differ (${hash1.length} vs ${hash2.length}), cannot compute similarity.`);
    }
    if (hash1.length === 0) {
        return 1.0; // Empty hashes are considered identical
    }

    let distance = 0;
    for (let i = 0; i < hash1.length; i++) {
        if (hash1[i] !== hash2[i]) {
            distance++;
        }
    }

    // Similarity = 1 - (normalized Hamming distance)
    const similarity = 1 - (distance / hash1.length);
    return similarity;
} 