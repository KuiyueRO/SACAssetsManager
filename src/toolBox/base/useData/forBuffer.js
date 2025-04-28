// ... existing code ...

/**
 * Checks if the input object is like a Buffer or can be converted to one,
 * suitable for representing image data (e.g., Buffer, ArrayBuffer, TypedArray).
 * @param {*} data - The input data to check.
 * @returns {boolean} True if the data is Buffer-like, false otherwise.
 */
export function isImageDataBufferLike(data) {
  return (
    Buffer.isBuffer(data) || // Is Node.js Buffer
    data instanceof ArrayBuffer || // Is ArrayBuffer
    ArrayBuffer.isView(data) // Is TypedArray (like Uint8Array)
  );
}

/**
 * Converts various Buffer-like data types into a Node.js Buffer.
 * Handles Buffer, ArrayBuffer, and TypedArrays.
 * @param {*} data - The input data (assumed to have passed isImageDataBufferLike).
 * @returns {Buffer|null} The converted Node.js Buffer, or null if conversion fails or input is invalid.
 */
export function getBufferFromImageDataLike(data) {
  try {
    if (Buffer.isBuffer(data)) {
      return data;
    }
    if (data instanceof ArrayBuffer) {
      return Buffer.from(data);
    }
    if (ArrayBuffer.isView(data)) {
      // Create a Buffer referencing the same memory as the TypedArray
      return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
    }
    console.warn('getBufferFromImageDataLike: Unsupported data type:', typeof data);
    return null;
  } catch (error) {
    console.error('getBufferFromImageDataLike: Error converting data to Buffer:', error);
    return null;
  }
}

/**
 * Reads a File object and returns its content as an ArrayBuffer.
 *
 * @param {File} file - The File object to read.
 * @returns {Promise<ArrayBuffer>} A promise that resolves with the ArrayBuffer content of the file.
 * @throws {Error} If the input is not a File object or reading fails.
 */
export const getFileAsArrayBuffer = async (file) => {
    if (!(file instanceof File)) {
        throw new Error('Input must be a File object.');
    }
    // file.arrayBuffer() is the standard way to get the content as ArrayBuffer
    return await file.arrayBuffer();
};