/**
 * @fileoverview 函数式流水线（管道）工具
 * 提供同步/异步、可变/不可变的函数组合执行能力
 */

import { 深拷贝 } from '../forObjectManagement/forDeepCopy.js';

/**
 * 创建一个顺序执行的函数流水线。
 * 函数数组中的每个函数接收上一个函数的输出（必须是数组）作为参数。
 * @param {Function[]} 函数数组 - 要顺序执行的函数数组。
 * @param {boolean} [自动数组化输出=false] - 如果函数输出不是数组，是否自动将其包装成单元素数组。
 * @param {...*} args - 初始传入第一个函数的参数。
 * @returns {Function} 返回一个无参函数，调用此函数将启动流水线执行。
 */
export function 顺序流水线(函数数组, 自动数组化输出 = false, ...args) {
    if (!Array.isArray(函数数组) || 函数数组.some(fn => typeof fn !== 'function')) {
        throw new TypeError('第一个参数必须是一个函数数组');
    }
    return () => {
        let 中间结果 = args; // 初始参数
        for (let i = 0; i < 函数数组.length; i++) {
            const 当前函数 = 函数数组[i];
            try {
                const result = 当前函数(...中间结果);
                if (Array.isArray(result)) {
                    中间结果 = result;
                } else if (自动数组化输出) {
                    中间结果 = [result];
                } else {
                    throw new Error(`管道函数 #${i} (${当前函数.name || '匿名'}) 的输出不是数组，且未启用自动数组化。`);
                }
            } catch (error) {
                console.error(`顺序流水线在执行函数 #${i} (${当前函数.name || '匿名'}) 时出错:`, error);
                throw error; // 重新抛出错误
            }
        }
        return 中间结果; // 返回最终结果
    }
}

/**
 * 创建一个异步执行的函数流水线。
 * 函数数组中的每个函数（可以是async）接收上一个函数的输出（必须是数组）作为参数。
 * @param {Function[]} 函数数组 - 要异步顺序执行的函数数组。
 * @param {boolean} [自动数组化输出=false] - 如果函数输出不是数组，是否自动将其包装成单元素数组。
 * @param {...*} args - 初始传入第一个函数的参数。
 * @returns {Function} 返回一个无参的 async 函数，调用此函数将启动流水线执行。
 */
export function 异步流水线(函数数组, 自动数组化输出 = false, ...args) {
    if (!Array.isArray(函数数组) || 函数数组.some(fn => typeof fn !== 'function')) {
        throw new TypeError('第一个参数必须是一个函数数组');
    }
    return async () => {
        let 中间结果 = args; // 初始参数
        for (let i = 0; i < 函数数组.length; i++) {
            const 当前函数 = 函数数组[i];
            try {
                const result = await 当前函数(...中间结果);
                if (Array.isArray(result)) {
                    中间结果 = result;
                } else if (自动数组化输出) {
                    中间结果 = [result];
                } else {
                    throw new Error(`管道函数 #${i} (${当前函数.name || '匿名'}) 的输出不是数组，且未启用自动数组化。`);
                }
            } catch (error) {
                console.error(`异步流水线在执行函数 #${i} (${当前函数.name || '匿名'}) 时出错:`, error);
                throw error; // 重新抛出错误
            }
        }
        return 中间结果; // 返回最终结果
    }
}

/**
 * 创建一个顺序执行的不可变函数流水线。
 * 每一步的输入都是上一步输出结果的深拷贝，确保函数不会意外修改共享状态。
 * @param {Function[]} 函数数组 - 要顺序执行的函数数组。
 * @param {boolean} [自动数组化输出=false] - 如果函数输出不是数组，是否自动将其包装成单元素数组。
 * @param {...*} args - 初始传入第一个函数的参数（会被深拷贝）。
 * @returns {Function} 返回一个无参函数，调用此函数将启动流水线执行。
 */
export function 顺序不可变流水线(函数数组, 自动数组化输出 = false, ...args) {
    if (!Array.isArray(函数数组) || 函数数组.some(fn => typeof fn !== 'function')) {
        throw new TypeError('第一个参数必须是一个函数数组');
    }
    return () => {
        let 中间结果 = 深拷贝(args); // 初始参数深拷贝
        for (let i = 0; i < 函数数组.length; i++) {
            const 当前函数 = 函数数组[i];
            try {
                const result = 当前函数(...中间结果);
                const 拷贝后的结果 = 深拷贝(result);
                if (Array.isArray(拷贝后的结果)) {
                    中间结果 = 拷贝后的结果;
                } else if (自动数组化输出) {
                    中间结果 = [拷贝后的结果];
                } else {
                    throw new Error(`管道函数 #${i} (${当前函数.name || '匿名'}) 的输出不是数组，且未启用自动数组化。`);
                }
            } catch (error) {
                console.error(`顺序不可变流水线在执行函数 #${i} (${当前函数.name || '匿名'}) 时出错:`, error);
                throw error; // 重新抛出错误
            }
        }
        return 中间结果; // 返回最终结果
    }
}

/**
 * 创建一个异步执行的不可变函数流水线。
 * 每一步的输入都是上一步输出结果的深拷贝。
 * @param {Function[]} 函数数组 - 要异步顺序执行的函数数组。
 * @param {boolean} [自动数组化输出=false] - 如果函数输出不是数组，是否自动将其包装成单元素数组。
 * @param {...*} args - 初始传入第一个函数的参数（会被深拷贝）。
 * @returns {Function} 返回一个无参的 async 函数，调用此函数将启动流水线执行。
 */
export function 异步不可变流水线(函数数组, 自动数组化输出 = false, ...args) {
    if (!Array.isArray(函数数组) || 函数数组.some(fn => typeof fn !== 'function')) {
        throw new TypeError('第一个参数必须是一个函数数组');
    }
    return async () => {
        let 中间结果 = 深拷贝(args); // 初始参数深拷贝
        for (let i = 0; i < 函数数组.length; i++) {
            const 当前函数 = 函数数组[i];
            try {
                const result = await 当前函数(...中间结果);
                const 拷贝后的结果 = 深拷贝(result);
                if (Array.isArray(拷贝后的结果)) {
                    中间结果 = 拷贝后的结果;
                } else if (自动数组化输出) {
                    中间结果 = [拷贝后的结果];
                } else {
                    throw new Error(`管道函数 #${i} (${当前函数.name || '匿名'}) 的输出不是数组，且未启用自动数组化。`);
                }
            } catch (error) {
                console.error(`异步不可变流水线在执行函数 #${i} (${当前函数.name || '匿名'}) 时出错:`, error);
                throw error; // 重新抛出错误
            }
        }
        return 中间结果; // 返回最终结果
    }
} 