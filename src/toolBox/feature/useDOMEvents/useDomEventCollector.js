import { keyedDebounce } from '../../base/useEcma/forFunctions/forDebounce.js'; // 导入 keyedDebounce

// 状态存储
const observers = new Map();
const throttleTimers = new Map();
const debounceTimers = new Map(); // 用于 keyedDebounce

// 工具函数
const matchXPath = (element, xpath) => {
  try {
    const result = document.evaluate(
      xpath, 
      document, 
      null, 
      XPathResult.FIRST_ORDERED_NODE_TYPE, 
      null
    );
    return result.singleNodeValue === element;
  } catch (e) {
    console.error('XPath匹配错误:', e);
    return false;
  }
};

const createEventHandler = (callback, options) => (event) => {
  // 特征匹配检查
  if (options.xpath && !matchXPath(event.target, options.xpath)) return;
  if (options.selector && !event.target.matches(options.selector)) return;

  // 节流处理
  if (options.throttle) {
    const throttleKey = `${event.type}-${event.target.id || 'anonymous'}-${options.throttle}`;
    if (throttleTimers.has(throttleKey)) return;

    throttleTimers.set(throttleKey, true);
    setTimeout(() => throttleTimers.delete(throttleKey), options.throttle);
    // 节流后仍然可以执行后续逻辑 (包括可能的防抖或直接回调)
  }

  // 防抖处理 - 使用 keyedDebounce
  if (options.debounce) {
    // 为每个目标、事件类型和回调组合生成唯一的 key
    // 注意：如果 callback 函数本身是动态生成的匿名函数，这个 key 可能不够稳定
    // 更可靠的 key 可能需要基于 addListener 调用时的上下文
    const debounceKey = `${event.type}-${event.target.id || 'anonymous'}-${callback.toString().slice(0, 50)}`;

    // 调用 keyedDebounce，传入 timers Map 和当前事件
    keyedDebounce(callback, options.debounce, debounceKey, debounceTimers, event);
    return; // 防抖激活时，阻止后续的直接 callback 调用
  }

  // 如果没有防抖或节流阻止，直接调用回调
  if (!options.throttle || !throttleTimers.has(`${event.type}-${event.target.id || 'anonymous'}-${options.throttle}`)) {
      callback(event);
  }
};

// 主要API函数
export const addListener = (target, eventType, callback, options = {}) => {
  const element = typeof target === 'string' 
    ? document.querySelector(target) 
    : target;
  
  if (!element) {
    console.warn(`无法找到目标元素: ${target}`);
    return;
  }

  const handler = createEventHandler(callback, options);
  element.addEventListener(eventType, handler);
  
  const observerKey = `${eventType}-${options.xpath || options.selector || 'direct'}`;
  observers.set(observerKey, { element, eventType, handler });
};

export const dispose = () => {
  observers.forEach(({ element, eventType, handler }) => {
    element.removeEventListener(eventType, handler);
  });
  
  observers.clear();
  throttleTimers.clear();
  // 清理 debounceTimers 中的所有待执行计时器
  debounceTimers.forEach(timeoutId => clearTimeout(timeoutId));
  debounceTimers.clear();
};

// 使用示例:
// import { addListener, dispose } from './domEventCollector';
// 
// // 基于选择器监听点击事件(带节流)
// addListener('.btn', 'click', (e) => {
//   console.log('按钮点击:', e.target);
// }, { throttle: 300 });
// 
// // 基于XPath监听鼠标移动事件(带防抖)
// addListener(
//   document,
//   'mousemove',
//   (e) => { console.log('鼠标移动:', e.clientX, e.clientY); },
//   { xpath: '//div[@class="container"]', debounce: 200 }
// );