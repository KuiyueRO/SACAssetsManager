// ... existing code ...

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