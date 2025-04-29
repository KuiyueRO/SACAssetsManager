/**
 * 兼容层 - 请使用新路径: src/toolBox/feature/networkingUtils/streamHandlers.js
 * @deprecated 此文件已被移动到工具箱，请更新导入路径
 */

import { handleDataStream, createStreamController } from '../../../../src/toolBox/feature/networkingUtils/streamHandlers.js';

/**
 * @deprecated 请使用 handleDataStream 和 createStreamController 替代
 */
export class DataStreamHandler {
  constructor(options, callback) {
    console.warn('DataStreamHandler 已弃用，请使用 handleDataStream 替代');
    this.options = options;
    this.callback = callback;
    this.signal = options.signal || createStreamController().signal;
    this._isInitialized = false;
  }
  
  async fetchData() {
    if (this._isInitialized) return;
    this._isInitialized = true;
    
    const { url, method, body, headers } = this.options;
    const { onData, onProgress, onComplete, onError } = this.callback;
    
    return handleDataStream({
      url,
      method,
      body,
      headers,
      signal: this.signal,
      onData, 
      onProgress,
      onComplete,
      onError
    });
  }
  
  cancel() {
    if (this.signal && this.signal.abort) {
      this.signal.abort();
    }
  }
}