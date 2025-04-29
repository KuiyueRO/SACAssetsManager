/**
 * @fileoverview 提供文件列表流处理相关功能，将文件路径列表转换为文件状态信息
 */

/**
 * 创建一个文件列表转换流。将文件路径列表转换为文件状态对象。
 * 此函数适用于Node.js环境，使用Transform流处理数据。
 * 
 * @param {Function} statProvider - 提供文件状态信息的函数，接收文件路径并返回Promise<Object>
 * @returns {Transform} 返回一个Transform流，用于处理文件路径列表
 */
export function createFileListToStatsStream(statProvider) {
  if (typeof require !== 'function') {
    throw new Error('createFileListToStatsStream requires Node.js environment with stream support');
  }
  
  // 确保statProvider是一个函数
  if (typeof statProvider !== 'function') {
    throw new Error('statProvider must be a function');
  }
  
  let buffer = '';
  const { Transform } = require('stream');
  
  const transformStream = new Transform({
    objectMode: true,
    transform(chunk, encoding, callback) {
      (async () => {
        try {
          buffer += chunk.toString();
          const lines = buffer.split('\n').filter(line => line.trim());
          
          // 清空buffer，仅保留最后一行（可能不完整）
          const lastLine = lines.pop() || '';
          buffer = lastLine;
          
          // 处理每一行
          for (const line of lines) {
            try {
              const stat = await statProvider(line);
              this.push(stat);
            } catch (err) {
              console.warn('Failed to get stats for file:', line, err);
            }
          }
          
          callback();
        } catch (err) {
          callback(err);
        }
      })();
    },
    flush(callback) {
      // 处理buffer中可能剩余的最后一行
      (async () => {
        if (buffer.trim()) {
          try {
            const stat = await statProvider(buffer);
            this.push(stat);
          } catch (err) {
            console.warn('Failed to get stats for last file:', buffer, err);
          }
        }
        callback();
      })();
    }
  });
  
  return transformStream;
}

/**
 * 创建一个文件列表转换流（中文命名版本）
 * 
 * @param {Function} 状态提供器 - 提供文件状态信息的函数
 * @returns {Transform} 返回一个转换流
 */
export function 创建文件列表转状态流(状态提供器) {
  return createFileListToStatsStream(状态提供器);
}

/**
 * 同步处理文件列表并转换为状态对象
 * 
 * @param {string[]} filePaths - 文件路径列表
 * @param {Function} statProvider - 状态提供函数
 * @returns {Promise<Object[]>} 文件状态对象列表
 */
export async function processFileListToStats(filePaths, statProvider) {
  if (!Array.isArray(filePaths)) {
    throw new Error('filePaths must be an array');
  }
  
  if (typeof statProvider !== 'function') {
    throw new Error('statProvider must be a function');
  }
  
  const results = [];
  
  for (const path of filePaths) {
    try {
      const stat = await statProvider(path);
      results.push(stat);
    } catch (err) {
      console.warn('Failed to get stats for file:', path, err);
    }
  }
  
  return results;
}

/**
 * 同步处理文件列表并转换为状态对象（中文命名版本）
 * 
 * @param {string[]} 文件路径列表 - 文件路径列表
 * @param {Function} 状态提供器 - 状态提供函数
 * @returns {Promise<Object[]>} 文件状态对象列表
 */
export async function 处理文件列表转状态(文件路径列表, 状态提供器) {
  return processFileListToStats(文件路径列表, 状态提供器);
} 