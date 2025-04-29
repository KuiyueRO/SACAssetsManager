/**
 * @fileoverview 提供处理通用数据流的功能，以函数式风格实现数据流的获取和处理。
 */

/**
 * 创建可读流从响应体读取
 * @param {Response} response - Fetch 响应对象
 * @returns {ReadableStream<Uint8Array>} 一个可读流
 * @private
 */
function _createReadableStream(response) {
  if (!response.body) {
    throw new Error('Response body is null.');
  }
  
  const reader = response.body.getReader();
  return new ReadableStream({
    start(controller) {
      function push() {
        reader.read().then(({ value, done }) => {
          if (done) {
            controller.close();
            return;
          }
          controller.enqueue(value);
          push();
        }).catch(error => {
          console.error('Error reading response body:', error);
          controller.error(error);
        });
      }
      push();
    },
    cancel(reason) {
      console.log('Stream reading cancelled:', reason);
      return reader.cancel(reason);
    }
  });
}

/**
 * 处理流数据并调用适当的回调
 * @param {ReadableStreamDefaultReader<Uint8Array>} reader - 流读取器
 * @param {Object} callbacks - 回调函数对象
 * @param {Function} [callbacks.onData] - 处理数据的回调
 * @param {Function} [callbacks.onProgress] - 进度更新的回调
 * @param {Function} [callbacks.onComplete] - 完成时的回调
 * @param {Function} [callbacks.onError] - 错误处理的回调
 * @private
 */
async function _processStream(reader, callbacks) {
  const { onData = () => {}, onProgress = () => {}, onComplete = () => {}, onError = () => {} } = callbacks;
  let buffer = new Uint8Array();
  
  try {
    while (true) {
      const { value, done } = await reader.read();
      
      if (done) {
        onComplete();
        return;
      }
      
      // 合并新数据到缓冲区
      buffer = new Uint8Array([...buffer, ...value]);
      onProgress();
      
      // 传递数据给回调处理
      onData(buffer);
    }
  } catch (error) {
    console.error('Error processing stream:', error);
    onError(error);
  }
}

/**
 * 获取并处理数据流
 * 
 * @param {Object} options - 请求选项
 * @param {string} options.url - 请求URL
 * @param {string} [options.method='GET'] - HTTP方法
 * @param {Object|string} [options.body] - 请求体
 * @param {Object} [options.headers] - 请求头
 * @param {AbortSignal} [options.signal] - 中止信号
 * @param {Object} callbacks - 回调函数对象
 * @param {Function} [callbacks.onData] - 处理数据的回调
 * @param {Function} [callbacks.onProgress] - 进度更新的回调
 * @param {Function} [callbacks.onComplete] - 完成时的回调
 * @param {Function} [callbacks.onError] - 错误处理的回调
 * @returns {Promise<void>}
 */
export async function fetchDataStream(options, callbacks) {
  const { url, method = 'GET', body, headers, signal } = options;
  const { onError = () => {} } = callbacks;
  
  try {
    const response = await fetch(url, {
      method,
      body,
      headers,
      signal,
    });
    
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
    }
    
    const stream = _createReadableStream(response);
    const reader = stream.getReader();
    
    await _processStream(reader, callbacks);
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Fetch aborted.');
    } else {
      console.error('Error fetching data stream:', error);
      onError(error);
    }
  }
}

/**
 * 创建中止控制器并附加信号处理
 * @returns {AbortController} 中止控制器
 */
export function createStreamController() {
  return new AbortController();
}

/**
 * 处理数据流及控制参数
 * 
 * @typedef {Object} StreamHandlingOptions
 * @property {string} url - 请求URL
 * @property {string} [method='GET'] - HTTP方法
 * @property {Object|string} [body] - 请求体
 * @property {Object} [headers] - 请求头
 * @property {AbortSignal} [signal] - 中止信号
 * @property {Function} [onData] - 处理数据的回调
 * @property {Function} [onProgress] - 进度更新的回调
 * @property {Function} [onComplete] - 完成时的回调
 * @property {Function} [onError] - 错误处理的回调
 */

/**
 * 获取并处理数据流（简化接口）
 * @param {StreamHandlingOptions} options - 流处理选项
 * @returns {Promise<void>}
 */
export async function handleDataStream(options) {
  const { url, method, body, headers, signal, onData, onProgress, onComplete, onError } = options;
  
  const fetchOptions = { url, method, body, headers, signal };
  const callbacks = { onData, onProgress, onComplete, onError };
  
  return fetchDataStream(fetchOptions, callbacks);
}

/**
 * 获取并处理数据流（中文命名版本）
 * @param {StreamHandlingOptions} 选项 - 流处理选项
 * @returns {Promise<void>}
 */
export async function 处理数据流(选项) {
  return handleDataStream(选项);
}

/**
 * 创建中止控制器（中文命名版本）
 * @returns {AbortController} 中止控制器
 */
export function 创建流控制器() {
  return createStreamController();
} 