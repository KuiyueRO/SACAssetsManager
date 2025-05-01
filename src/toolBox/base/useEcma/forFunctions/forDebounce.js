/**
 * @fileoverview 防抖相关函数集
 * 提供多种防抖策略，包括标准防抖、带 Key 的防抖和基于执行时间的智能防抖。
 */

// 存储智能防抖封装函数的映射表
const 封装表 = new Map();

/**
 * 智能防抖函数（不推荐常规使用，适用于需要根据历史执行时间动态调整防抖间隔的特殊场景）
 * 会自动计算函数平均执行时间并据此防抖。
 * @param {Function} 原始函数 需要防抖的原始函数
 * @param {Function} [失败回调] 当防抖阻止函数执行时的回调
 * @param {number} [预期平均时间=0] 预期的函数执行平均时间（用于首次执行判断）
 * @returns {Function} 防抖后的函数
 */
export function 智能防抖(原始函数, 失败回调, 预期平均时间 = 0) {
  if (!封装表.has(原始函数)) {
    let 封装数据 = {
      上次执行时间: 0,
      总实际执行时间: 0,
      执行次数: 0,
      平均执行时间: 0
    };
    封装表.set(原始函数, 封装数据);
    let _预期平均时间 = 预期平均时间 ? 预期平均时间 : 0
    let 封装函数 = (...args) => {
      const 当前时间 = Date.now();
      const 当次执行间隔 = 当前时间 - 封装数据.上次执行时间;
      if (当次执行间隔 < Math.max(封装数据.平均执行时间, _预期平均时间)) {
        失败回调 instanceof Function ? 失败回调(当次执行间隔, 封装数据.平均执行时间) : null;
        return undefined; // 阻断函数的执行
      }
      封装数据.上次执行时间 = 当前时间; // 更新上次执行时间
      let 执行结果 = 原始函数(...args);
      // 检查函数是否是异步的
      if (执行结果 instanceof Promise) {
        // 如果函数是异步的，就返回一个异步函数
        return 执行结果.then(result => {
          const 实际执行时间 = Date.now() - 当前时间;
          封装数据.执行次数++;
          封装数据.总实际执行时间 += 实际执行时间;
          封装数据.平均执行时间 = 封装数据.总实际执行时间 / 封装数据.执行次数;
          return result;
        });
      } else {
        // 如果函数是同步的，就直接返回执行结果
        const 实际执行时间 = Date.now() - 当前时间;
        封装数据.执行次数++;
        封装数据.总实际执行时间 += 实际执行时间;
        封装数据.平均执行时间 = 封装数据.总实际执行时间 / 封装数据.执行次数;
        return 执行结果;
      }
    };
    封装表.get(原始函数).封装函数 = 封装函数;
    return 封装函数;
  } else {
    return 封装表.get(原始函数).封装函数;
  }
}

/**
 * 标准防抖函数 (推荐)
 * 在最后一次触发事件后等待指定时间再执行函数。
 * 适用于大多数 UI 事件处理，如输入框搜索建议、窗口大小调整等。
 * @param {Function} func 需要防抖的函数
 * @param {number} [wait=15] 防抖等待时间 (毫秒)
 * @returns {Function} 防抖后的函数，该函数内部维护自己的计时器。
 */
export function 防抖(func, wait = 15) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * 带 Key 的防抖函数 (推荐，用于需要独立管理的防抖场景)
 * 使用外部 Map 来存储不同 Key 对应的计时器，允许为不同的上下文独立防抖。
 * 适用于事件委托、动态生成的监听器等需要区分防抖实例的场景。
 * @param {Function} func 需要防抖的函数。
 * @param {number} wait 防抖等待时间 (毫秒)。
 * @param {string | number | Symbol} key 用于区分不同防抖实例的唯一标识。
 * @param {Map<string | number | Symbol, NodeJS.Timeout>} timersMap 外部传入的、用于存储计时器的 Map 对象。
 * @param {...any} args 传递给原始函数的参数。
 */
export function keyedDebounce(func, wait, key, timersMap, ...args) {
  if (typeof func !== 'function') {
    console.error('keyedDebounce: func must be a function.');
    return;
  }
  if (timersMap instanceof Map !== true) {
    console.error('keyedDebounce: timersMap must be an instance of Map.');
    return;
  }

  // 清除之前为同一个 key 设置的计时器
  const existingTimeout = timersMap.get(key);
  if (existingTimeout) {
    clearTimeout(existingTimeout);
  }

  // 设置新的计时器
  const newTimeout = setTimeout(() => {
    // 执行函数
    func.apply(this, args);
    // 执行完毕后从 Map 中移除计时器记录 (可选，取决于是否需要知道哪些key在等待)
    timersMap.delete(key);
  }, wait);

  // 将新的计时器存入 Map
  timersMap.set(key, newTimeout);
}

/**
 * 标准防抖函数（英文别名，推荐）
 */
export const debounce = 防抖; 