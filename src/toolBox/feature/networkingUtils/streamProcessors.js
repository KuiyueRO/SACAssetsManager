/**
 * @fileoverview 提供处理特定格式（data: JSON\n）流式 Fetch 响应的功能。
 */

/**
 * 创建一个从 Fetch Response Body 读取文本块的可读流。
 * @param {Response} response - Fetch 响应对象。
 * @returns {ReadableStream<string>} 一个解析 UTF-8 文本块的可读流。
 * @private
 */
function _createUtf8TextStream(response) {
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
                    try {
                        controller.enqueue(new TextDecoder('utf-8', { fatal: true }).decode(value));
                    } catch (error) {
                        console.error('Failed to decode UTF-8 chunk:', error);
                        controller.error(error); // 向上层传递解码错误
                    }
                    push();
                }).catch(error => {
                    console.error('Error reading response body stream:', error);
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
 * 处理单个文本块，尝试解析 "data: JSON" 格式。
 * @param {string} chunk - 当前处理的文本块。
 * @param {string} buffer - 上一次未处理完的缓冲内容。
 * @param {(action: string, data?: any) => void} callback - 回调函数。
 * @param {number} currentTotal - 当前已知的总数。
 * @param {number} currentStep - 当前处理步数。
 * @param {number} callbackStep - 触发 stepCallback 的步长。
 * @returns {{ buffer: string, total: number, step: number }} 更新后的状态。
 * @private
 */
function _processJsonDataChunk(chunk, buffer, callback, currentTotal, currentStep, callbackStep) {
    let newBuffer = buffer + chunk;
    let total = currentTotal;
    let step = currentStep;

    // 按行分割处理，保留最后不完整的行到缓冲区
    const lines = newBuffer.split('\n');
    newBuffer = lines.pop() || ''; // 最后一部分可能不完整，放回缓冲区

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('data:')) {
            const jsonDataString = trimmedLine.substring(5).trim();
            if (jsonDataString) {
                try {
                    const json = JSON.parse(jsonDataString);
                    // 检查是否有 walkCount 更新总数
                    if (json.walkCount !== undefined && json.walkCount !== total) {
                        total = json.walkCount;
                        callback('updateTotal', total);
                    } else {
                        // 推送解析到的数据
                        callback('pushData', json);
                        step += 1;
                        // 达到步长，触发回调
                        if (step >= callbackStep) {
                            callback('stepCallback');
                            step = 0;
                        }
                    }
                } catch (e) {
                    console.warn('Failed to parse JSON data chunk:', jsonDataString, e);
                    // 解析失败，暂时不回调错误，可以选择性地将错误行回调出去
                    // callback('parseError', { line: trimmedLine, error: e });
                }
            }
        } else if (trimmedLine) {
            // 非 data: 开头的非空行可以忽略或报告
            // console.log('Ignoring non-data line:', trimmedLine);
        }
    }

    return { buffer: newBuffer, total, step };
}

/**
 * 读取文本流并按行处理 "data: JSON" 格式的数据。
 * @param {ReadableStreamDefaultReader<string>} reader - 文本流读取器。
 * @param {(action: string, data?: any) => void} callback - 回调函数。
 * @param {number} callbackStep - 触发 stepCallback 的步长。
 * @private
 */
async function _readAndProcessStream(reader, callback, callbackStep) {
    let buffer = '';
    let total = 0;
    let step = 0;
    try {
        while (true) {
            const { value, done } = await reader.read();
            if (done) {
                // 流结束时处理可能残留在缓冲区的内容
                if (buffer.trim()) {
                    ({ buffer, total, step } = _processJsonDataChunk( '', buffer, callback, total, step, callbackStep));
                    if(buffer.trim()){ // 如果处理完还有残留，说明最后一行格式有问题
                        // console.warn('Unprocessed buffer at stream end:', buffer);
                    }
                }
                callback('complete');
                // console.log('Stream complete');
                break;
            }
            ({ buffer, total, step } = _processJsonDataChunk(value, buffer, callback, total, step, callbackStep));
        }
    } catch (error) {
        console.error('Error reading or processing stream:', error);
        callback('error', error);
    } finally {
        // 确保 reader 被释放（尽管在此处调用 releaseLock 可能不是最佳实践）
        // reader.releaseLock(); 
    }
}

/**
 * 使用 Fetch API 获取流式响应，并处理特定格式（data: JSON\n）的 JSON 数据。
 * 
 * 通过回调函数通知处理过程中的各种事件：
 * - 'updateTotal': (total: number) => void - 当接收到包含 walkCount 的数据时，通知总数更新。
 * - 'pushData': (jsonData: any) => void - 每成功解析一个 JSON 数据对象时调用。
 * - 'stepCallback': () => void - 处理的数据达到指定步长 `callbackStep` 时调用。
 * - 'complete': () => void - 流处理完成时调用。
 * - 'error': (error: Error) => void - 发生网络错误或流处理错误时调用。
 * 
 * @param {string} url - 请求的数据接口地址。
 * @param {(action: string, data?: any) => void} callback - 处理事件的回调函数。
 * @param {number} [callbackStep=10] - 触发 'stepCallback' 的步长，默认为 10。
 * @param {AbortSignal} [signal] - 可选的 AbortSignal，用于中止 Fetch 请求。
 * @param {RequestInit} [options={}] - 可选的 Fetch 请求选项 (如 method, headers, body)。
 */
export async function processJsonStream(url, callback, callbackStep = 10, signal, options = {}) {
    if (!url || typeof callback !== 'function') {
        console.error('processJsonStream requires a valid URL and callback function.');
        return;
    }

    try {
        const response = await fetch(url, { signal, ...options });

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }
        if (!response.body) {
            throw new Error('Response body is missing.');
        }

        const textStream = _createUtf8TextStream(response);
        const reader = textStream.getReader();

        await _readAndProcessStream(reader, callback, callbackStep);

    } catch (error) {
        // 捕获 fetch 本身或流创建/读取过程中的错误
        if (error.name === 'AbortError') {
            console.log('Fetch aborted.');
            // Abort 不视为错误回调，是正常取消操作
        } else {
            console.error('Error fetching or processing stream:', error);
            callback('error', error);
        }
    }
}

// --- 兼容旧接口部分 --- 

/**
 * 创建兼容旧接口的回调函数。
 * 旧接口回调函数签名可能为: callback(totalOrDataOrUndefined), callback()
 * @param {Array} targetArray - 用于存储 `pushData` 事件中数据的数组。
 * @param {Function} originalCallback - 原始的回调函数。
 * @param {number} callbackStep - 触发原始回调函数的步长（近似模拟）。
 * @returns {(action: string, data?: any) => void} 新的兼容回调函数。
 * @deprecated 推荐使用 processJsonStream 并直接处理新回调事件。
 */
export function createLegacyCallbackAdapter(targetArray, originalCallback, callbackStep) {
    let _step = 0;
    return function (action, data) {
        if (typeof originalCallback !== 'function') return;

        try {
            switch (action) {
                case 'pushData':
                    if(Array.isArray(targetArray)){
                        targetArray.push(data);
                    }
                    _step++;
                    if (_step >= callbackStep) {
                        originalCallback(); // 旧步长回调，不传递参数
                        _step = 0;
                    }
                    break;
                case 'updateTotal':
                    originalCallback(data); // 旧更新总数回调，传递总数
                    break;
                case 'stepCallback':
                    // 新的回调，旧接口不需要处理
                    break;
                case 'complete':
                    // 确保最后不足一个步长的数据也能触发一次回调
                    if (_step > 0) {
                        originalCallback();
                    }
                    originalCallback(); // 旧完成回调，不传递参数
                    break;
                case 'error':
                    console.error("Error received in legacy adapter:", data);
                    // 旧接口可能没有错误处理，这里仅打印日志
                    break;
            }
        } catch (e) {
            console.error("Error executing legacy callback:", e);
        }
    };
}

/**
 * 兼容旧接口的 processJsonStream 函数。
 * @deprecated 推荐使用 processJsonStream 并适配新的回调接口。
 * @param {string} url - 数据接口地址。
 * @param {Array} targetArray - 推送目标数组。
 * @param {Function} originalCallback - 原始回调函数。
 * @param {number} [callbackStep=10] - 回调步长。
 * @param {AbortSignal} [signal] - AbortSignal。
 * @param {RequestInit} [options={}] - Fetch 选项。
 */
export async function processJsonStreamLegacy(url, targetArray, originalCallback, callbackStep = 10, signal, options = {}) {
    console.warn('processJsonStreamLegacy is deprecated. Please migrate to processJsonStream.');
    const compatibleCallback = createLegacyCallbackAdapter(targetArray, originalCallback, callbackStep);
    return processJsonStream(url, compatibleCallback, callbackStep, signal, options);
}
