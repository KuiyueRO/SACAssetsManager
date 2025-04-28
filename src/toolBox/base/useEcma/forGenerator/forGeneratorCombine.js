/**
 * @fileoverview 提供组合和处理 JavaScript 生成器 (Generator) 的工具函数。
 * @module forGeneratorCombine
 */

/**
 * 按顺序连接多个生成器，依次完全迭代每个生成器。
 * 类似于数组的 concat 方法。
 * @generator
 * @param {...Generator} generators - 需要连接的生成器列表 (一个或多个生成器参数)。
 * @yields {any} 按顺序从各个生成器产生的值。
 * @example
 * function* gen1() { yield 1; yield 2; }
 * function* gen2() { yield 3; yield 4; }
 * const combined = 顺序连接生成器(gen1(), gen2());
 * [...combined] // 输出: [1, 2, 3, 4]
 */
export function* 顺序连接生成器(...generators) {
    for (const generator of generators) {
        // 严格按顺序执行：完全迭代完前一个生成器后再开始下一个
        yield* generator; // 使用 yield* 委托迭代
    }
}

/**
 * 并行合并多个生成器，每次迭代返回包含所有生成器当前值的数组。
 * 当某个生成器结束后，其对应位置的值将是 undefined。
 * @generator
 * @param {...Generator} generators - 需要并行合并的生成器列表。
 * @yields {Array<any|undefined>} 包含各生成器当前值的数组 (与参数顺序一致)。
 * @example
 * function* genA() { yield 'a1'; yield 'a2'; }
 * function* genB() { yield 'b1'; }
 * const combined = 并行合并生成器(genA(), genB());
 * [...combined] // 输出: [ ['a1', 'b1'], ['a2', undefined] ]
 */
export function* 并行合并生成器(...generators) {
    const iterators = generators.map(gen => gen[Symbol.iterator]());
    const resultsCache = iterators.map(() => ({ done: false, value: undefined }));
    let activeCount = iterators.length;

    while (activeCount > 0) {
        const currentResults = [];
        let allDoneThisRound = true; // 检查本轮是否还有新的值产生

        for (let i = 0; i < iterators.length; i++) {
            if (!resultsCache[i].done) {
                const nextResult = iterators[i].next();
                resultsCache[i] = nextResult;
                if (!nextResult.done) {
                    allDoneThisRound = false;
                } else {
                    activeCount--; // 一个迭代器完成了
                }
            }
             // 总是将当前缓存的值（可能是 undefined）加入结果
             currentResults.push(resultsCache[i].value); 
        }

        if (allDoneThisRound && activeCount === 0) break; // 所有迭代器都完成且本轮无新值
        yield currentResults;
    }
}

/**
 * 交替合并多个生成器，轮流从每个活跃的生成器获取一个值。
 * 类似于拉链交错。
 * @generator
 * @param {...Generator} generators - 需要交替合并的生成器列表。
 * @yields {any} 当前轮到的生成器产生的值。
 * @example
 * function* genX() { yield 'x1'; yield 'x2'; yield 'x3'; }
 * function* genY() { yield 'y1'; yield 'y2'; }
 * const combined = 交替合并生成器(genX(), genY());
 * [...combined] // 输出: ['x1', 'y1', 'x2', 'y2', 'x3']
 */
export function* 交替合并生成器(...generators) {
    const iterators = generators.map(gen => gen ? gen[Symbol.iterator]() : null).filter(it => it !== null);
    let activeIterators = [...iterators]; // 创建可变副本
    
    while (activeIterators.length > 0) {
        const nextActiveIterators = [];
        for (const iterator of activeIterators) {
            const { value, done } = iterator.next();
            if (!done) {
                yield value;
                nextActiveIterators.push(iterator); // 仍然活跃，加入下一轮
            }
            // 如果 done 为 true，则不再加入下一轮
        }
        activeIterators = nextActiveIterators; // 更新活跃迭代器列表
    }
}
