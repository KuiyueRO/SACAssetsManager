/**
 * @fileoverview 提供流过滤功能，可根据条件过滤流中的数据项
 */

/**
 * 创建一个用于过滤流数据的转换流
 * 此函数适用于Node.js环境，使用Transform流处理数据
 * 
 * @param {Function|Object} filter - 过滤函数或包含test方法的过滤器对象
 * @param {Object} [options] - Transform流的选项
 * @param {boolean} [options.objectMode=true] - 是否以对象模式处理数据
 * @param {boolean} [options.includeMatchesOnly=true] - 是否只包含匹配的数据项
 * @returns {Transform} 返回一个Transform流，用于过滤数据
 */
export function createFilterStream(filter, options = {}) {
  if (typeof require !== 'function') {
    throw new Error('createFilterStream requires Node.js environment with stream support');
  }
  
  const { objectMode = true, includeMatchesOnly = true } = options;
  
  // 创建统一的过滤器接口
  let normalizedFilter;
  
  if (typeof filter === 'function') {
    normalizedFilter = {
      test: filter
    };
  } else if (filter && typeof filter.test === 'function') {
    normalizedFilter = filter;
  } else {
    throw new Error('Filter must be a function or an object with a test method');
  }
  
  const { Transform } = require('stream');
  
  const transformStream = new Transform({
    objectMode,
    transform(chunk, encoding, callback) {
      try {
        const isMatch = normalizedFilter.test(chunk);
        
        if (isMatch || !includeMatchesOnly) {
          this.push(chunk);
        }
        
        callback();
      } catch (err) {
        callback(err);
      }
    }
  });
  
  return transformStream;
}

/**
 * 创建一个用于过滤流数据的转换流（中文命名版本）
 * 
 * @param {Function|Object} 过滤器 - 过滤函数或包含test方法的过滤器对象
 * @param {Object} [选项] - Transform流的选项
 * @returns {Transform} 返回一个Transform流
 */
export function 创建过滤流(过滤器, 选项 = {}) {
  return createFilterStream(过滤器, 选项);
}

/**
 * 用于内存中数组的过滤函数，不依赖Node.js流
 * 
 * @param {Array} items - 要过滤的数据项数组
 * @param {Function} filterFn - 过滤函数，返回true保留数据项
 * @returns {Array} 过滤后的数组
 */
export function filterItems(items, filterFn) {
  if (!Array.isArray(items)) {
    throw new Error('Items must be an array');
  }
  
  if (typeof filterFn !== 'function') {
    throw new Error('Filter must be a function');
  }
  
  return items.filter(filterFn);
}

/**
 * 用于内存中数组的过滤函数（中文命名版本）
 * 
 * @param {Array} 数据项 - 要过滤的数据项数组
 * @param {Function} 过滤函数 - 过滤函数
 * @returns {Array} 过滤后的数组
 */
export function 过滤数据项(数据项, 过滤函数) {
  return filterItems(数据项, 过滤函数);
}

/**
 * 创建一个通用的过滤器对象
 * 
 * @param {Function} testFn - 测试函数，用于判断数据项是否匹配
 * @returns {Object} 包含test方法的过滤器对象
 */
export function createFilter(testFn) {
  if (typeof testFn !== 'function') {
    throw new Error('Test function must be a function');
  }
  
  return {
    test: testFn
  };
}

/**
 * 创建一个通用的过滤器对象（中文命名版本）
 * 
 * @param {Function} 测试函数 - 测试函数
 * @returns {Object} 包含test方法的过滤器对象
 */
export function 创建过滤器(测试函数) {
  return createFilter(测试函数);
} 