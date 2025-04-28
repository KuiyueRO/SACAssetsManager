/**
 * @fileoverview 异步迭代辅助函数
 * 提供定长迭代、定长执行、正向/反向遍历等功能
 */

/**
 * 对可迭代对象进行异步迭代，最多执行指定次数。
 * @param {AsyncIterable|Iterable} 可迭代对象 - 要迭代的对象。
 * @param {Function} 迭代函数 - 对每个元素执行的异步函数。
 * @param {number} 阈值 - 最大迭代次数。
 * @param {boolean} [忽略空值=false] - 是否跳过 null 或 undefined 的元素。
 * @param {boolean} [忽略错误=false] - 是否忽略迭代函数中抛出的错误并继续迭代。
 * @returns {Promise<void>}
 */
export async function 定长迭代(可迭代对象, 迭代函数, 阈值, 忽略空值 = false, 忽略错误 = false) {
    if (typeof 迭代函数 !== 'function') {
        throw new TypeError('迭代函数必须是一个函数');
    }
    if (typeof 阈值 !== 'number' || 阈值 <= 0) {
        throw new TypeError('阈值必须是一个正数');
    }

    let count = 0;
    try {
        for await (let item of 可迭代对象) {
            if (忽略空值 && (item === null || item === undefined)) {
                continue;
            }
            try {
                await 迭代函数(item);
            } catch (e) {
                if (!忽略错误) {
                    console.error(`定长迭代时发生错误 (元素: ${item}):`, e);
                    throw e; // 重新抛出错误，除非明确忽略
                }
                console.warn(`定长迭代时忽略了一个错误 (元素: ${item}):`, e); // 记录被忽略的错误
            }
            count++;
            if (count >= 阈值) {
                break;
            }
        }
    } catch (error) {
        console.error('迭代可迭代对象时发生错误:', error);
        throw error; // 重新抛出遍历本身的错误
    }
}

/**
 * 重复执行生成函数和迭代函数，直到达到指定次数，并包含防止无限循环的机制。
 * @param {Function} 生成函数 - 返回Promise或值的异步/同步函数，用于生成每次迭代的数据。
 * @param {Function} 迭代函数 - 对生成的数据执行的异步函数。
 * @param {number} 阈值 - 要执行的总次数。
 * @param {boolean} [忽略空值=false] - 如果生成函数返回 null 或 undefined，是否跳过此次迭代且不计入总次数。
 * @param {boolean} [忽略迭代错误=false] - 是否忽略迭代函数中的错误并继续。
 * @param {boolean} [忽略执行错误=false] - 是否忽略生成函数中的错误并继续。
 * @returns {Promise<void>}
 */
export async function 定长执行(生成函数, 迭代函数, 阈值, 忽略空值 = false, 忽略迭代错误 = false, 忽略执行错误 = false) {
    if (typeof 生成函数 !== 'function') {
        throw new TypeError('生成函数必须是一个函数');
    }
    if (typeof 迭代函数 !== 'function') {
        throw new TypeError('迭代函数必须是一个函数');
    }
    if (typeof 阈值 !== 'number' || 阈值 <= 0) {
        throw new TypeError('阈值必须是一个正数');
    }

    // 一个非常大的数值,超过这个数值,则认为可能无限循环,跳出提示
    const 内建阈值 = 1000000;
    let 内建计数 = 0;
    let 有效执行次数 = 0;

    while (有效执行次数 < 阈值) {
        内建计数++;
        if (内建计数 > 内建阈值) {
            // 在非浏览器环境或无法确认的环境下，避免使用 confirm
            const message = "定长执行检测到可能的无限循环，已自动中止。";
            console.warn(message, new Error().stack);
            break;
            // 如果确实需要在特定环境（如Electron主进程或特定UI框架）使用确认框，应通过依赖注入或配置传入相应API
            // let 是否继续 = confirm("可能无限循环,是否继续?")
            // if(!是否继续){
            //     console.warn("可能无限循环,退出",new Error().stack)
            //     break
            // }else{
            //     内建计数=0
            // }
        }

        let item;
        try {
            item = await 生成函数();
            if (item === null || item === undefined) {
                if (忽略空值) {
                    continue; // 跳过空值，不增加 有效执行次数
                }
            }
        } catch (e) {
            if (!忽略执行错误) {
                console.error('定长执行时生成函数发生错误:', e);
                throw e;
            }
            console.warn('定长执行时忽略了生成函数的错误:', e);
            continue; // 生成出错，跳过本次迭代
        }

        try {
            await 迭代函数(item);
        } catch (e) {
            if (!忽略迭代错误) {
                console.error(`定长执行时迭代函数发生错误 (数据: ${item}):`, e);
                throw e;
            }
            console.warn(`定长执行时忽略了迭代函数的错误 (数据: ${item}):`, e);
            // 即使迭代出错，如果忽略错误，也认为完成了一次有效执行
        }
        有效执行次数++;
    }
}

// 内部辅助函数，用于执行遍历逻辑
const _执行遍历 = async (可迭代对象, 迭代函数, 判定函数, 忽略错误, 忽略空值) => {
    for await (let item of 可迭代对象) {
        if (判定函数(item)) {
            break;
        }
        if (忽略空值 && (item === null || item === undefined)) {
            continue;
        }
        try {
            await 迭代函数(item);
        } catch (e) {
            if (!忽略错误) {
                console.error(`遍历时迭代函数发生错误 (元素: ${item}):`, e);
                throw e;
            }
            console.warn(`遍历时忽略了一个错误 (元素: ${item}):`, e);
        }
    }
};

/**
 * 正向遍历可迭代对象，直到满足特定条件。
 * 调用方式: 正向遍历(可迭代对象, 迭代函数, 忽略错误, 忽略空值).直到(判定函数)
 * @param {AsyncIterable|Iterable} 可迭代对象
 * @param {Function} 迭代函数 - 对每个元素执行的异步函数。
 * @param {boolean} [忽略错误=false]
 * @param {boolean} [忽略空值=false]
 * @returns {{直到: (判定函数: Function) => Promise<void>}}
 */
export const 正向遍历 = (可迭代对象, 迭代函数, 忽略错误 = false, 忽略空值 = false) => {
    if (typeof 迭代函数 !== 'function') {
        throw new TypeError('迭代函数必须是一个函数');
    }
    return {
        直到: (判定函数) => {
            if (typeof 判定函数 !== 'function') {
                throw new TypeError('判定函数必须是一个函数');
            }
            return _执行遍历(可迭代对象, 迭代函数, 判定函数, 忽略错误, 忽略空值);
        }
    };
};

/**
 * 反向遍历可迭代对象（需要对象支持或转换为支持反向遍历的形式），直到满足特定条件。
 * 注意：此函数假定可迭代对象是数组或具有 `reverse` 方法且支持异步迭代。对于通用异步迭代器，反向遍历可能不可行或效率低下。
 * 调用方式: 反向遍历(可迭代对象, 迭代函数, 忽略错误, 忽略空值).直到(判定函数)
 * @param {Array|AsyncIterable & {reverse: Function}} 可迭代对象 - 最好是数组，或具有 reverse 方法的可迭代对象。
 * @param {Function} 迭代函数 - 对每个元素执行的异步函数。
 * @param {boolean} [忽略错误=false]
 * @param {boolean} [忽略空值=false]
 * @returns {{直到: (判定函数: Function) => Promise<void>}}
 */
export const 反向遍历 = (可迭代对象, 迭代函数, 忽略错误 = false, 忽略空值 = false) => {
    if (typeof 迭代函数 !== 'function') {
        throw new TypeError('迭代函数必须是一个函数');
    }
    // 尝试获取反向迭代器，对数组进行特殊处理以提高效率
    let 反向可迭代;
    if (Array.isArray(可迭代对象)) {
        反向可迭代 = [...可迭代对象].reverse(); // 创建副本再反转
    } else if (typeof 可迭代对象?.reverse === 'function') {
        // 警告：依赖对象的 reverse 方法可能不适用于所有异步迭代器
        console.warn('反向遍历非数组对象，依赖其自身的 reverse 方法，可能存在兼容性或性能问题。');
        反向可迭代 = 可迭代对象.reverse();
    } else {
        throw new TypeError('反向遍历目前主要支持数组或具有 reverse 方法的可迭代对象。');
    }

    return {
        直到: (判定函数) => {
            if (typeof 判定函数 !== 'function') {
                throw new TypeError('判定函数必须是一个函数');
            }
            return _执行遍历(反向可迭代, 迭代函数, 判定函数, 忽略错误, 忽略空值);
        }
    };
}; 