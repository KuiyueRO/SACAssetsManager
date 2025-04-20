/**
 * @fileoverview 提供创建可链式调用对象代理的工具函数。
 */

/**
 * 创建一个可链式调用的对象代理。
 * 
 * 此代理允许原始对象上的方法在没有返回值时支持链式调用。
 * 同时，访问非函数属性会返回一个特殊函数，调用该函数（带参数）可以链式地设置该属性的值。
 * 
 * @template T extends object
 * @param {T} obj - 要代理的原始对象。
 * @returns {T & {$raw: T}} 返回一个代理对象，该对象支持链式调用，
 * 并包含一个 `$raw` 属性以访问原始对象。
 * 
 * @example
 * const builder = createChainableProxy({
 *   _value: '',
 *   setValue(val) { this._value = val; }, // 无返回值，支持链式
 *   append(str) { this._value += str; }, // 无返回值，支持链式
 *   getValue() { return this._value; }    // 有返回值，中断链式
 * });
 * 
 * const result = builder.setValue('Hello').append(' World').getValue(); // result is 'Hello World'
 * builder.append('!').$raw._value; // 原始对象的值变为 'Hello World!'
 * 
 * // 链式设置属性示例
 * builder._value('New Value').append(' Again'); 
 * console.log(builder.$raw._value); // 'New Value Again'
 */
export const createChainableProxy = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    throw new Error('Input must be an object.');
  }

  return new Proxy(obj, {
    /**
     * 获取属性的处理器。
     * @param {T} target - 目标对象。
     * @param {string | symbol} prop - 属性名。
     * @param {any} receiver - 代理对象本身。
     * @returns {any} 属性值或经过包装的函数。
     */
    get(target, prop, receiver) {
      // 允许访问原始对象
      if (prop === '$raw') {
        return target;
      }

      const value = Reflect.get(target, prop, receiver); // 使用 Reflect 更安全

      // 如果属性是函数，包装它以支持链式调用
      if (typeof value === 'function') {
        return (...args) => {
          const result = value.apply(target, args);
          // 如果原函数没有返回值(undefined)，则返回代理以继续链式调用
          // 否则返回原函数的实际返回值
          return result === undefined ? receiver : result;
        };
      }

      // 如果属性不是函数，返回一个特殊的设置器函数以支持链式属性设置
      // 注意：这种行为可能不符合直觉，但保留原逻辑
      return (...args) => {
        if (args.length > 0) {
          // 使用 Reflect 设置属性更安全
          Reflect.set(target, prop, args[0], receiver); 
        }
        // 总是返回代理以继续链式调用
        return receiver; 
      };
    },

    /**
     * 设置属性的处理器。
     * @param {T} target - 目标对象。
     * @param {string | symbol} prop - 属性名。
     * @param {any} value - 要设置的值。
     * @param {any} receiver - 代理对象本身。
     * @returns {boolean} 返回设置是否成功。
     */
    set(target, prop, value, receiver) {
      // 使用 Reflect 设置属性更安全
      return Reflect.set(target, prop, value, receiver);
    }
  });
}; 