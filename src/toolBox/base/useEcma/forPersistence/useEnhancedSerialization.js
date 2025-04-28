/**
 * @fileoverview Advanced serialization utilities supporting complex JavaScript types,
 * circular references, chunking, async operations, compression, URL safety,
 * and potentially binary formats.
 */

// ===== Enhanced Serialization for Complex Types =====

/**
 * Serializes data to a JSON string, enhancing standard JSON.stringify to support
 * types like undefined, Function, Symbol, BigInt, Error, Date, RegExp, Map, Set,
 * TypedArray, ArrayBuffer, and handling circular references.
 *
 * @param {*} data The data to serialize.
 * @param {object} [options={}] Serialization options.
 * @param {boolean} [options.handleCircular=true] Whether to handle circular references.
 * @param {boolean} [options.handleFunctions=true] Whether to serialize functions (as string representations).
 * @param {boolean} [options.handleSymbols=true] Whether to serialize symbols (as descriptions).
 * @param {number | string} [options.space] JSON.stringify spacing argument.
 * @param {boolean} [options.handleDom=false] Whether to serialize DOM elements (as basic descriptions).
 * @returns {string} The enhanced JSON string.
 */
export function enhancedSerialize(data, options = {}) {
  const {
    handleCircular = true,
    handleFunctions = true,
    handleSymbols = true,
    space = undefined,
    handleDom = false,
  } = options;

  // Map to track seen objects for circular reference handling
  const seen = handleCircular ? new Map() : null;
  let circularIdCounter = 0;

  return JSON.stringify(data, function replacer(key, value) {
    // --- Handle simple types first ---
    if (value === undefined) {
      return { __type: 'undefined' };
    }
    if (typeof value === 'bigint') {
      return { __type: 'bigint', value: value.toString() };
    }
    if (typeof value === 'symbol' && handleSymbols) {
      return { __type: 'symbol', description: value.description || '' };
    }

    // --- Handle object types ---
    if (typeof value === 'object' && value !== null) {
      // Handle circular references
      if (handleCircular && seen.has(value)) {
        return { __type: 'circular', id: seen.get(value) };
      }
      if (handleCircular) {
         const id = circularIdCounter++;
         seen.set(value, id);
      }

      // Handle specific object instances
      if (value instanceof Date) {
        return { __type: 'date', iso: value.toISOString() };
      }
      if (value instanceof RegExp) {
        return { __type: 'regexp', source: value.source, flags: value.flags };
      }
      if (value instanceof Error) {
        return {
          __type: 'error',
          name: value.name,
          message: value.message,
          stack: value.stack, // Note: stack serialization might vary across environments
        };
      }
      if (value instanceof Map) {
        // Recursively serialize Map entries
        return { __type: 'map', entries: Array.from(value.entries(), ([k, v]) => [replacer(null, k), replacer(null, v)]) };
      }
      if (value instanceof Set) {
        // Recursively serialize Set values
        return { __type: 'set', values: Array.from(value.values(), v => replacer(null, v)) };
      }
      if (value instanceof ArrayBuffer) {
         // Efficiently convert ArrayBuffer to base64 string? Or byte array?
         // For now, using byte array for simplicity, could be optimized.
         return { __type: 'arraybuffer', data: Array.from(new Uint8Array(value)) };
      }
      // Check for TypedArray (excluding DataView which has different structure)
      if (ArrayBuffer.isView(value) && !(value instanceof DataView)) {
         return {
           __type: 'typedarray',
           name: value.constructor.name, // e.g., "Uint8Array"
           // Convert typed array elements to standard numbers for JSON
           array: Array.from(value),
         };
      }
      if (handleDom && value instanceof Element) {
          // Basic descriptive serialization, not a full DOM representation
          return {
            __type: 'dom',
            tagName: value.tagName,
            id: value.id,
            className: value.className,
            // innerHTML could be huge and complex, maybe omit by default or truncate?
            // innerHTML: value.innerHTML, // Consider implications
          };
      }
    }

    // --- Handle functions ---
    if (typeof value === 'function' && handleFunctions) {
      return {
        __type: 'function',
        name: value.name || 'anonymous',
        body: value.toString(),
      };
    }

    // Default handling for other types
    return value;
  }, space);
}

/**
 * Deserializes a JSON string created by enhancedSerialize back into its original data structure.
 *
 * @param {string} jsonString - The JSON string to deserialize.
 * @param {object} [options={}] - Deserialization options.
 * @param {boolean} [options.evalFunctions=false] - WARNING: If true, attempts to reconstruct functions using eval (Security Risk!).
 * @param {boolean} [options.reviveSymbols=true] - Whether to recreate Symbols (true) or return string representations (false).
 * @returns {*} The deserialized data.
 * @throws {Error} If JSON parsing fails.
 */
export function enhancedDeserialize(jsonString, options = {}) {
  const {
    evalFunctions = false,
    reviveSymbols = true,
  } = options;

  // Map to store object references for circular dependency resolution
  const refs = new Map(); // Maps original ID to the reconstructed object/placeholder
  const circularPlaceholders = []; // Stores info about where circular refs need to be patched

  // First pass: Parse JSON and reconstruct objects, identify circular placeholders
  const result = JSON.parse(jsonString, function reviver(key, value) {
    if (value && typeof value === 'object') {
      // Check for our special type marker
      if (value.__type) {
        switch(value.__type) {
          case 'undefined': return undefined;
          case 'bigint': return BigInt(value.value);
          case 'symbol': return reviveSymbols ? Symbol(value.description) : `Symbol(${value.description})`;
          case 'date': return new Date(value.iso);
          case 'regexp': return new RegExp(value.source, value.flags);
          case 'error':
            const error = new Error(value.message);
            error.name = value.name;
            error.stack = value.stack;
            return error;
          case 'map':
            // Create Map first, then populate (needed if values have circular refs)
            const map = new Map();
            // Store ref early if it might be circular
            if (value.id !== undefined) refs.set(value.id, map);
            value.entries.forEach(([k, v]) => map.set(k, v));
            return map;
          case 'set':
            // Create Set first
            const set = new Set();
             if (value.id !== undefined) refs.set(value.id, set);
            value.values.forEach(v => set.add(v));
            return set;
          case 'arraybuffer':
             const buffer = new Uint8Array(value.data).buffer;
             if (value.id !== undefined) refs.set(value.id, buffer);
             return buffer;
          case 'typedarray':
            // Ensure the constructor exists (e.g., in Node vs Browser)
            const TypedArrayConstructor = (typeof window !== 'undefined' ? window : global)[value.name];
            if (TypedArrayConstructor) {
                const typedArray = new TypedArrayConstructor(value.array);
                if (value.id !== undefined) refs.set(value.id, typedArray);
                return typedArray;
            } else {
                 console.warn(`TypedArray constructor ${value.name} not found. Returning plain array.`);
                 return value.array;
            }
          case 'function':
            if (evalFunctions) {
              console.warn('Using eval to deserialize functions. Ensure the source is trusted.');
              try {
                // SECURITY RISK: Only use with trusted data!
                return eval(`(${value.body})`);
              } catch (e) {
                console.error(`Failed to deserialize function "${value.name || 'anonymous'}":`, e);
                return function CorruptedFunction(...args) { throw new Error('Deserialized function is corrupted.'); };
              }
            } else {
              // Return a placeholder function
              return function PlaceholderFunction(...args) { console.warn(`Function ${value.name || 'anonymous'} was serialized but evalFunctions is false.`); };
            }
          case 'dom':
             // Return a simple descriptor, not a real DOM element
             return {
                __dom_serialized__: true,
                tagName: value.tagName,
                id: value.id,
                className: value.className,
                // Avoid storing potentially huge innerHTML if not needed
             };
           case 'circular':
             // Store the placeholder's parent and key, and the target ref ID
             circularPlaceholders.push({ parent: this, key: key, refId: value.id });
             // Return a temporary placeholder (could be null or a specific object)
             return null; // Or some unique placeholder object
        }
      }
      // If it's a regular object that might be a circular ref target, store it.
      // This assumes the 'id' property was added during serialization if handleCircular was true.
      // TODO: Need a reliable way to link object to its original ID during serialization if not using __type.
      // For now, this relies on the circular placeholder mechanism.
    }
    return value;
  });

  // Second pass: Resolve circular references
  // TODO: Implement the logic to patch circular references.
  // Iterate through circularPlaceholders.
  // For each placeholder, find the target object in `refs` using `refId`.
  // Assign the target object to `placeholder.parent[placeholder.key]`. 
  console.warn('enhancedDeserialize: Circular reference resolution is not yet fully implemented.');

  return result;
}

// ===== Chunking for Large Data =====

/**
 * Serializes data into multiple chunks of a specified size.
 * Useful for streaming or storing large JSON payloads.
 *
 * @param {*} data - The data to serialize.
 * @param {number} [chunkSize=1024*1024] - The approximate size (in bytes) of each chunk.
 * @param {object} [serializeOptions={}] - Options passed to enhancedSerialize.
 * @returns {Array<string>} An array of JSON string chunks.
 */
export function chunkSerialize(data, chunkSize = 1 * 1024 * 1024, serializeOptions = {}) {
  // Serialize the entire data first using enhancedSerialize
  const serialized = enhancedSerialize(data, serializeOptions);
  const totalLength = serialized.length;
  const chunks = [];

  for (let i = 0; i < totalLength; i += chunkSize) {
    chunks.push(serialized.substring(i, Math.min(i + chunkSize, totalLength)));
  }

  return chunks;
}

/**
 * Deserializes data that was previously serialized into chunks.
 *
 * @param {Array<string>} chunks - An array of JSON string chunks.
 * @param {object} [deserializeOptions={}] - Options passed to enhancedDeserialize.
 * @returns {*} The deserialized data.
 */
export function chunkDeserialize(chunks, deserializeOptions = {}) {
  if (!Array.isArray(chunks)) {
    throw new TypeError('Input must be an array of string chunks.');
  }
  // Join the chunks back into a single string
  const jsonString = chunks.join('');
  // Deserialize the combined string
  return enhancedDeserialize(jsonString, deserializeOptions);
}

// ===== Async Operations =====

/**
 * Asynchronously serializes data using enhancedSerialize.
 * Currently wraps the synchronous version in a Promise.
 * Could be extended to use Web Workers for true background serialization.
 *
 * @param {*} data - The data to serialize.
 * @param {object} [options={}] - Options passed to enhancedSerialize.
 * @returns {Promise<string>} A promise resolving to the JSON string.
 */
export function asyncSerialize(data, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      resolve(enhancedSerialize(data, options));
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Asynchronously deserializes data using enhancedDeserialize.
 * Currently wraps the synchronous version in a Promise.
 * Could be extended for background processing.
 *
 * @param {string} jsonString - The JSON string to deserialize.
 * @param {object} [options={}] - Options passed to enhancedDeserialize.
 * @returns {Promise<*>} A promise resolving to the deserialized data.
 */
export function asyncDeserialize(jsonString, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      resolve(enhancedDeserialize(jsonString, options));
    } catch (error) {
      reject(error);
    }
  });
}

// ===== Compression =====

/**
 * Serializes data and then compresses it using the Compression Streams API (if available).
 * TODO: Implement corresponding deserialize function with DecompressionStream.
 *
 * @param {*} data - The data to serialize and compress.
 * @param {object} [serializeOptions={}] - Options for enhancedSerialize.
 * @param {'gzip' | 'deflate' | 'deflate-raw'} [format='gzip'] - Compression format.
 * @returns {Promise<ReadableStream<Uint8Array> | string>} A Promise resolving to a ReadableStream
 *          of the compressed data, or the original JSON string if CompressionStream is not supported.
 */
export async function compressedSerialize(data, serializeOptions = {}, format = 'gzip') {
    const jsonString = enhancedSerialize(data, serializeOptions);

    if (typeof CompressionStream === 'undefined') {
        console.warn('CompressionStream API not available. Returning uncompressed JSON string.');
        return jsonString; // Fallback if API is not supported
    }

    try {
        const stream = new Blob([jsonString]).stream();
        const compressedStream = stream.pipeThrough(new CompressionStream(format));
        return compressedStream;
         // To get a Blob: new Response(compressedStream).blob()
         // To get ArrayBuffer: new Response(compressedStream).arrayBuffer()
    } catch (error) {
        console.error('Compression failed:', error);
        throw new Error(`Compression failed: ${error.message}`);
    }
}

// TODO: Implement compressedDeserialize(compressedData, format = 'gzip', deserializeOptions = {})
// Needs to handle ReadableStream, Blob, or ArrayBuffer input and use DecompressionStream.
export function compressedDeserialize(/* compressedData, format = 'gzip', deserializeOptions = {} */) {
    console.error('compressedDeserialize is not yet implemented.');
    throw new Error('compressedDeserialize is not yet implemented.');
}


// ===== URL-Safe Serialization =====

/**
 * Serializes data and encodes it into a URL-safe Base64 string.
 *
 * @param {*} data - The data to serialize.
 * @param {object} [serializeOptions={}] - Options for enhancedSerialize.
 * @returns {string} A URL-safe Base64 encoded string.
 */
export function urlSafeSerialize(data, serializeOptions = {}) {
  const jsonString = enhancedSerialize(data, serializeOptions);
  // Encode to Base64 and make it URL-safe
  try {
      const base64 = btoa(unescape(encodeURIComponent(jsonString)));
      return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  } catch (e) {
       console.error("Failed to create URL safe string:", e);
       throw e;
  }
}

/**
 * Deserializes data from a URL-safe Base64 string created by urlSafeSerialize.
 *
 * @param {string} urlString - The URL-safe Base64 encoded string.
 * @param {object} [deserializeOptions={}] - Options for enhancedDeserialize.
 * @returns {*} The deserialized data.
 */
export function urlSafeDeserialize(urlString, deserializeOptions = {}) {
  try {
    // Make Base64 string standard again
    let base64 = urlString.replace(/-/g, '+').replace(/_/g, '/');
    // Pad with '=' chars
    while (base64.length % 4) {
      base64 += '=';
    }
    const jsonString = decodeURIComponent(escape(atob(base64)));
    return enhancedDeserialize(jsonString, deserializeOptions);
  } catch (e) {
     console.error("Failed to decode URL safe string:", e);
     // Provide more context if possible
     if (e instanceof DOMException && e.name === 'InvalidCharacterError') {
         throw new Error('Invalid Base64 string provided for URL deserialization.');
     }
     throw e;
  }
}

// ===== Binary Serialization Placeholder =====

// TODO: Implement actual binary serialization/deserialization (e.g., using MessagePack, CBOR, or custom format)

/**
 * Placeholder for binary serialization.
 * @param {*} data - Data to serialize.
 * @returns {Uint8Array | ArrayBuffer} Placeholder return.
 */
export function binarySerialize(data) {
    console.warn('binarySerialize is a placeholder and does not perform true binary serialization.');
    // Example: Convert enhanced JSON to Uint8Array
    const jsonString = enhancedSerialize(data);
    return new TextEncoder().encode(jsonString);
}

/**
 * Placeholder for binary deserialization.
 * @param {Uint8Array | ArrayBuffer} binaryData - Binary data to deserialize.
 * @returns {*} Deserialized data.
 */
export function binaryDeserialize(binaryData) {
    console.warn('binaryDeserialize is a placeholder and assumes UTF-8 encoded enhanced JSON.');
    // Example: Convert Uint8Array back to enhanced JSON string
    const jsonString = new TextDecoder().decode(binaryData);
    return enhancedDeserialize(jsonString);
} 