/**
 * @fileoverview 提供将 JavaScript 对象格式化为字符串的工具函数，支持灵活配置。
 */

// --- 内部辅助函数 ---

/**
 * 格式化数组。
 * @param {Array<*>} arr 要格式化的数组。
 * @param {number} level 当前递归层级。
 * @param {string} indent 缩进字符串。
 * @param {boolean} deepFormat 是否进行深度格式化（带换行和缩进）。
 * @returns {string} 格式化后的数组字符串。
 * @private
 */
const formatArrayInternal = (arr, level = 0, indent = '  ', deepFormat = false) => {
  if (deepFormat) {
    const indentSpace = indent.repeat(level + 1);
    const closingIndent = indent.repeat(level);
    // 递归调用 formatValueInternal 来格式化数组项
    const formattedItems = arr.map(item => 
      formatValueInternal(item, level + 1, indent, deepFormat)
    );
    return `[\n${indentSpace}${formattedItems.join(`,\n${indentSpace}`)}\n${closingIndent}]`;
  }
  // 非深度格式化时，简单连接或让 formatValueInternal 处理
  return arr.map(item => formatValueInternal(item, level, indent, false)).join(', ');
};

/**
 * 格式化对象。
 * @param {object} obj 要格式化的对象。
 * @param {number} level 当前递归层级。
 * @param {string} indent 缩进字符串。
 * @param {boolean} deepFormat 是否进行深度格式化（带换行和缩进）。
 * @returns {string} 格式化后的对象字符串。
 * @private
 */
const formatObjectInternal = (obj, level = 0, indent = '  ', deepFormat = false) => {
  if (deepFormat) {
    const indentSpace = indent.repeat(level + 1);
    const closingIndent = indent.repeat(level);
    // 递归调用 formatValueInternal 来格式化对象的值
    const formattedEntries = Object.entries(obj)
      .map(([k, v]) => `${k}: ${formatValueInternal(v, level + 1, indent, deepFormat)}`);
    return `{\n${indentSpace}${formattedEntries.join(`,\n${indentSpace}`)}\n${closingIndent}}`;
  }
  // 非深度格式化时，对于简单对象，可以考虑 JSON.stringify，但为了行为统一，
  // 也可以像数组一样处理，或者直接返回某种标记
  // 此处保持与原逻辑一致，使用 JSON.stringify
  try {
    return JSON.stringify(obj); 
  } catch (e) {
    return '[object Object]'; // 处理循环引用等序列化错误
  }
};

/**
 * 格式化任意类型的值。
 * @param {*} value 要格式化的值。
 * @param {number} level 当前递归层级。
 * @param {string} indent 缩进字符串。
 * @param {boolean} deepFormat 是否进行深度格式化。
 * @returns {string} 格式化后的值字符串。
 * @private
 */
const formatValueInternal = (value, level = 0, indent = '  ', deepFormat = false) => {
  if (Array.isArray(value)) {
    return formatArrayInternal(value, level, indent, deepFormat);
  }
  // 检查是否为普通对象，排除 null
  if (typeof value === 'object' && value !== null) {
    // 简单检查，避免格式化 Date, RegExp 等特殊对象
    if (Object.prototype.toString.call(value) === '[object Object]') {
       return formatObjectInternal(value, level, indent, deepFormat);
    }
  }
  // 对字符串进行转义处理，避免在 JSON 或其他格式中出现问题
  if (typeof value === 'string') {
      // 简单的 JSON 字符串转义，或根据需要自定义
      return JSON.stringify(value); 
  }
  // 其他原始类型直接转字符串
  return String(value);
};


/**
 * 处理单个键值对，应用处理器和格式化。
 * @param {string} key 键。
 * @param {*} value 值。
 * @param {object} options 配置选项。
 * @returns {string} 处理并格式化后的键值对字符串。
 * @private
 */
const processKeyValuePair = (key, value, options) => {
  const {
    keyProcessor,
    valueProcessor,
    keyValuePairProcessor,
    keyValueSeparator,
    itemSuffix,
    indent,
    deepFormat
  } = options;

  const processedKey = keyProcessor(key);
  const processedValue = valueProcessor(value);
  // 注意：这里的格式化应该只应用于值，而不是整个键值对
  const formattedValue = formatValueInternal(processedValue, 0, indent, deepFormat); 

  const basicKeyValuePair = `${processedKey}${keyValueSeparator}${formattedValue}`; // 不加后缀，后缀由 join 添加

  // 传递上下文给键值对处理器
  return keyValuePairProcessor(basicKeyValuePair, {
    originalKey: key,
    originalValue: value,
    processedKey,
    processedValue,
    formattedValue // 可以传递格式化后的值供参考
  });
};


// --- 导出函数 ---

/**
 * 创建一个预配置的对象格式化函数。
 * 
 * @param {object} config 配置对象。
 * @param {string} [config.keyValueSeparator=': '] 键和值之间的分隔符。
 * @param {string} [config.itemSeparator='\n'] 不同键值对之间的分隔符。
 * @param {string} [config.itemSuffix=';'] 每个键值对的后缀（注意：现在由 itemSeparator 控制分隔）。
 * @param {function(string): string} [config.keyProcessor=(key) => key] 处理键的函数。
 * @param {function(*): *} [config.valueProcessor=(value) => value] 处理值的函数。
 * @param {function(string, object): string} [config.keyValuePairProcessor=(kvPair) => kvPair] 处理最终键值对字符串的函数，可以访问原始和处理后的键值信息。
 * @param {function(string): string} [config.postProcessor=(result) => result] 对最终结果字符串进行后处理的函数。
 * @param {boolean} [config.ignoreNullUndefined=false] 是否忽略值为 null 或 undefined 的键值对。
 * @param {boolean} [config.deepFormat=false] 是否对嵌套的对象和数组进行深度格式化（带缩进和换行）。
 * @param {string} [config.indent='  '] 深度格式化时使用的缩进字符串。
 * @returns {function(object): string} 返回一个接收对象并将其格式化为字符串的函数。
 */
export const createObjectFormatter = ({
  keyValueSeparator = ': ',
  itemSeparator = '\n',
  itemSuffix = ';', // 注意：原逻辑后缀加在每个项目后，现在通过 join 实现分隔，后缀可能需要调整用法或由 keyValuePairProcessor 添加
  keyProcessor = (key) => key,
  valueProcessor = (value) => value,
  keyValuePairProcessor = (kvPair) => kvPair + itemSuffix, // 将后缀移到这里处理
  postProcessor = (result) => result,
  ignoreNullUndefined = false,
  deepFormat = false,
  indent = '  '
} = {}) => {
  // 校验配置（可选）
  if (typeof keyProcessor !== 'function' || typeof valueProcessor !== 'function' ||
      typeof keyValuePairProcessor !== 'function' || typeof postProcessor !== 'function') {
    throw new Error('Invalid processor function provided.');
  }

  const options = {
    keyProcessor,
    valueProcessor,
    keyValuePairProcessor,
    keyValueSeparator,
    itemSuffix, // 传递给 processKeyValuePair 以便 keyValuePairProcessor 使用
    indent,
    deepFormat
  };

  // 返回实际执行格式化的函数
  return (obj = {}) => {
      if (typeof obj !== 'object' || obj === null) {
          console.warn('Input is not a valid object, returning empty string.');
          return '';
      }
      const processedPairs = Object.entries(obj)
          .filter(([_, value]) => !ignoreNullUndefined || (value !== null && value !== undefined))
          .map(([key, value]) => processKeyValuePair(key, value, options));
      
      // 使用 itemSeparator 连接处理后的键值对
      const resultString = processedPairs.join(itemSeparator);

      // 应用后处理器
      return postProcessor(resultString);
  };
};

/**
 * 将对象格式化为 "键: 值;" 形式的字符串，每个键值对占一行。
 * 这是使用 createObjectFormatter 创建的一个预设配置实例。
 * @type {function(object): string}
 */
export const formatObjectAsKeyValueString = createObjectFormatter({
  keyValueSeparator: ': ',
  itemSeparator: '\n',
  itemSuffix: ';', // 后缀由默认的 keyValuePairProcessor 添加
  ignoreNullUndefined: false, // 默认不忽略空值
  deepFormat: false // 默认不深度格式化
}); 