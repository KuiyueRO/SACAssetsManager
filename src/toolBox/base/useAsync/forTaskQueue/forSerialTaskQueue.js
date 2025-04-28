/**
 * @fileoverview 提供串行任务队列的管理和控制功能，支持任务的添加、执行、暂停、恢复等操作。
 * 任务按优先级执行，支持空闲回调执行模式。
 * @module forSerialTaskQueue
 */

import { createEventBus } from '../../forEvent/useEventBus.js'; // 更新路径

/**
 * 内部最小堆实现，用于优先级队列。
 * @private
 */
class MinHeap {
    constructor(compareFunction) {
        this.heap = [];
        // 提供默认比较函数
        this.compareFunction = compareFunction || ((a, b) => a - b);
    }

    /**
     * 向堆中添加一个元素。
     * @param {*} item 要添加的元素。
     * @returns {number} 堆的新大小。
     */
    push(item) {
        this.heap.push(item);
        this._siftUp(this.heap.length - 1);
        return this.heap.length;
    }

    /**
     * 移除并返回堆顶元素 (最小元素)。
     * @returns {*} 堆顶元素，如果堆为空则返回 null。
     */
    pop() {
        if (this.isEmpty()) return null;
        const top = this.heap[0];
        const bottom = this.heap.pop();
        // 如果移除后堆不为空，将最后一个元素移到顶部并向下调整
        if (this.heap.length > 0) {
            this.heap[0] = bottom;
            this._siftDown(0);
        }
        return top;
    }

    /**
     * 查看堆顶元素但不移除。
     * @returns {*} 堆顶元素，如果堆为空则返回 null。
     */
    peek() {
        return this.isEmpty() ? null : this.heap[0];
    }

    /**
     * 检查堆是否为空。
     * @returns {boolean} 如果堆为空则返回 true。
     */
    isEmpty() {
        return this.heap.length === 0;
    }

    /**
     * 获取堆的大小。
     * @returns {number} 堆中的元素数量。
     */
    size() {
        return this.heap.length;
    }

    /**
     * 将堆的内容作为数组返回 (不保证顺序)。
     * @returns {Array<*>} 包含堆元素的数组。
     */
    toArray() {
        return [...this.heap]; // 返回副本以防外部修改
    }

    /**
     * 向上调整堆元素以维护堆属性。
     * @param {number} index 开始调整的索引。
     * @private
     */
    _siftUp(index) {
        const item = this.heap[index];
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            const parent = this.heap[parentIndex];
            // 如果当前元素不小于父元素，则停止上浮
            if (this.compareFunction(item, parent) >= 0) break;
            // 否则，将父元素下移
            this.heap[index] = parent;
            index = parentIndex;
        }
        // 将元素放置到最终位置
        this.heap[index] = item;
    }

    /**
     * 向下调整堆元素以维护堆属性。
     * @param {number} index 开始调整的索引。
     * @private
     */
    _siftDown(index) {
        const item = this.heap[index];
        const length = this.heap.length;
        const halfLength = length >>> 1; // 只需检查到最后一个非叶子节点
        
        while (index < halfLength) {
            let leftIndex = (index << 1) + 1; // 左子节点索引
            const rightIndex = leftIndex + 1;   // 右子节点索引
            let bestIndex = leftIndex;          // 假设左子节点是较小的
            let bestChild = this.heap[leftIndex];
            
            // 如果右子节点存在且比左子节点小，则选择右子节点
            if (rightIndex < length && this.compareFunction(this.heap[rightIndex], bestChild) < 0) {
                bestIndex = rightIndex;
                bestChild = this.heap[rightIndex];
            }
            
            // 如果当前元素不大于较小的子节点，则停止下沉
            if (this.compareFunction(bestChild, item) >= 0) break;
            
            // 否则，将较小的子节点上移
            this.heap[index] = bestChild;
            index = bestIndex;
        }
        // 将元素放置到最终位置
        this.heap[index] = item;
    }
}

/**
 * 串行任务控制器类。
 * 管理一个带有优先级的任务队列，按顺序执行异步任务。
 * 支持暂停、恢复、清空和事件通知。
 * 可选使用 requestIdleCallback 进行调度。
 */
export class 串行任务控制器 {
    /**
     * 创建一个串行任务控制器实例。
     * @param {object} [options={}] 配置选项。
     * @param {boolean} [options.destroyOnComplete=false] 完成所有任务后是否自动销毁控制器。
     * @param {boolean} [options.useIdleCallback=false] 是否使用 requestIdleCallback 调度任务执行（如果浏览器支持）。
     */
    constructor(options = {
        destroyOnComplete: false,
        useIdleCallback: false
    }) {
        /** @private 事件总线实例 */
        this.eventBus = createEventBus();
        /** @private 优先级队列 (最小堆) */
        this.taskQueue = new MinHeap(this.compareTasks.bind(this)); // 绑定 compareTasks 的 this
        /** @private 是否暂停 */
        this.isPaused = false;
        /** @private 已添加到队列的任务总数 */
        this.totalTasks = 0;
        /** @private 当前正在执行的任务 */
        this.currentTask = null;
        /** @private 是否正在处理任务 */
        this.isProcessing = false;
        /** @private 已完成的任务数量 */
        this.completedTasks = 0;
        /** @private 完成后是否销毁 */
        this.destroyOnComplete = options.destroyOnComplete;
        /** @private 存储的选项 */
        this.options = { ...options }; // 复制选项
        /** @private 是否支持 requestIdleCallback */
        this.supportIdle = typeof requestIdleCallback === 'function';
        /** @private 是否使用 requestIdleCallback */
        this.useIdleCallback = options.useIdleCallback && this.supportIdle;
        /** @private requestIdleCallback 的 ID */
        this.idleCallbackId = null;

        console.log(`串行任务控制器初始化: useIdleCallback=${this.useIdleCallback}`);
    }

    /**
     * 比较两个任务的优先级。
     * 优先级值越小，优先级越高。负数优先级高于正数。
     * @param {Function & {priority?: number}} a 任务 A。
     * @param {Function & {priority?: number}} b 任务 B。
     * @returns {number} 返回负数表示 a 优先级高，正数表示 b 优先级高，0 表示相同。
     * @private
     */
    compareTasks(a, b) {
        const priorityA = a.priority !== undefined ? a.priority : Infinity;
        const priorityB = b.priority !== undefined ? b.priority : Infinity;
        
        // 负数优先级高于正数
        if ((priorityA >= 0 && priorityB < 0) || (priorityA < 0 && priorityB >= 0)) {
            return priorityB - priorityA; // 负数在前 (小的在前)
        }
        // 同为正数或同为负数时，数值小的优先
        return priorityA - priorityB;
    }

    /**
     * 添加任务到队列。
     * @param {Function} task 要执行的任务函数 (应返回 Promise 或可 await)。
     * @param {number} [priority=0] 任务优先级，默认为 0。
     */
    addTask(task, priority = 0) {
        if (typeof task !== 'function') {
            console.error("添加到任务队列的必须是函数。");
            return;
        }
        // 临时暂停处理以安全添加任务
        const wasPaused = this.isPaused;
        if (!this.isPaused) {
             this.pause(); // 暂停以防在添加时触发处理
        }
    
        task.priority = priority;
        this.taskQueue.push(task);
        this.totalTasks++;
        this.eventBus.emit('taskAdded', { totalTasks: this.totalTasks });
        console.log(`任务已添加，当前队列长度: ${this.taskQueue.size()}, 总任务数: ${this.totalTasks}`);
    
        // 如果添加前是运行状态，则恢复处理
        if (!wasPaused) {
            this.resume(); // 恢复处理
        }
    }

    /**
     * 处理队列中的下一个任务。
     * @returns {Promise<void>}
     * @private
     */
    async processNext() {
        // 如果已暂停或正在处理，则直接返回
        if (this.isPaused || this.isProcessing) {
            return;
        }

        // 如果队列为空
        if (this.taskQueue.isEmpty()) {
            // 如果之前处理过任务，则触发完成事件
            if (this.completedTasks > 0 && this.totalTasks === this.completedTasks) {
                console.log('所有任务已完成。');
                this.eventBus.emit('allTasksCompleted');
                // 如果设置了完成后销毁，则执行销毁
                if (this.destroyOnComplete) {
                    this.destroy();
                }
            }
            return; // 队列为空，结束处理
        }

        this.isProcessing = true;
        this.currentTask = this.taskQueue.pop(); // 取出优先级最高的任务
        console.log(`开始处理任务，剩余队列长度: ${this.taskQueue.size()}`);

        try {
            // 封装任务执行逻辑
            const executeTask = () => {
                return new Promise(async (resolve, reject) => {
                    // 定义实际运行器
                    const runner = async (deadline) => {
                        try {
                            // 检查任务是否仍然有效（可能在等待期间被 clear）
                            if (!this.currentTask) {
                                console.warn("当前任务在执行前消失，可能已被清除。");
                                resolve(undefined); // 或 reject?
                                return;
                            }
                            console.log("执行任务...");
                            const result = await this.currentTask(); // 执行任务
                            console.log("任务执行完毕。");
                            resolve(result);
                        } catch (taskError) {
                            reject(taskError); // 任务内部错误
                        }
                    };

                    // 根据配置选择使用 requestIdleCallback 或立即执行
                    if (this.useIdleCallback) {
                        this.idleCallbackId = requestIdleCallback(runner, { timeout: 1000 }); // 设置超时
                    } else {
                        // 模拟 deadline 对象，但不限制时间
                        runner({ timeRemaining: () => Infinity, didTimeout: false });
                    }
                });
            };

            const result = await executeTask(); // 等待任务执行完成
            this.completedTasks++;
            console.log(`任务完成，已完成: ${this.completedTasks}/${this.totalTasks}`);
            // 触发任务完成事件
            this.eventBus.emit('taskCompleted', {
                completedTasks: this.completedTasks,
                totalTasks: this.totalTasks,
                result: result
            });

        } catch (error) {
            console.error('任务执行出错:', error, this.currentTask);
            // 触发任务错误事件
            this.eventBus.emit('taskError', { error, task: this.currentTask });
        } finally {
            // 清理工作
            if (this.idleCallbackId && this.supportIdle) {
                cancelIdleCallback(this.idleCallbackId); // 取消可能未执行的 idle callback
                this.idleCallbackId = null;
            }
            this.currentTask = null; // 清除当前任务引用
            this.isProcessing = false; // 标记为未在处理状态
            console.log("任务处理结束，准备处理下一个。");

            // 调度下一次处理 (如果未暂停)
            if (!this.isPaused) {
                 // 避免在 finally 块内部深度递归调用 processNext
                 // 使用 setTimeout 或 requestIdleCallback 延迟调度
                if (this.useIdleCallback) {
                    this.idleCallbackId = requestIdleCallback(() => this.processNext());
                } else {
                    // 使用 setTimeout(0) 将下一次调用放到事件循环的下一个 tick
                    // 这有助于避免可能的堆栈溢出（如果任务同步完成得非常快）
                    setTimeout(() => this.processNext(), 0);
                }
            }
        }
    }

    /**
     * 清空任务队列。
     * 已添加但未开始执行的任务将被丢弃。
     * 如果有任务正在执行，不会中断该任务，但后续任务不会执行。
     */
    clear() {
        console.warn("清空任务队列...");
        // 重置队列和计数器
        this.taskQueue = new MinHeap(this.compareTasks.bind(this));
        this.totalTasks = 0;
        this.completedTasks = 0;
        // 注意：不清空 currentTask，以允许当前任务完成
        // 但 isProcessing 状态会在 finally 中重置
        
        // 如果使用了 idle callback，取消挂起的调度
        if (this.idleCallbackId && this.supportIdle) {
            cancelIdleCallback(this.idleCallbackId);
            this.idleCallbackId = null;
        }
        this.eventBus.emit('queueCleared');
        // isProcessing 标志会在当前任务结束后由 finally 重置
    }

    /**
     * 开始（或重新开始）处理任务队列。
     */
    start() {
        if (!this.isPaused) {
            console.log("任务队列已在运行中。");
            return; // 如果已经在运行，则不执行任何操作
        }
        console.log("启动任务队列处理...");
        this.isPaused = false;
        this.eventBus.emit('started');
        // 使用 setTimeout 确保 processNext 不在当前调用栈中立即执行
        setTimeout(() => this.processNext(), 0); 
    }

    /**
     * 暂停任务队列处理。
     * 当前正在执行的任务会继续完成，但后续任务不会开始。
     */
    pause() {
        if (this.isPaused) return; // 如果已暂停，则不执行任何操作
        console.log("暂停任务队列处理。");
        this.isPaused = true;
        // 如果使用了 idle callback，取消挂起的调度
        if (this.idleCallbackId && this.supportIdle) {
            cancelIdleCallback(this.idleCallbackId);
            this.idleCallbackId = null;
        }
        this.eventBus.emit('paused');
    }

    /**
     * 恢复任务队列处理。
     */
    resume() {
        if (!this.isPaused) {
            console.log("任务队列未暂停，无需恢复。");
            return; // 如果未暂停，则不执行任何操作
        }
        console.log("恢复任务队列处理...");
        this.isPaused = false;
        this.eventBus.emit('resumed');
        // 使用 setTimeout 确保 processNext 不在当前调用栈中立即执行
        setTimeout(() => this.processNext(), 0);
    }

    /**
     * 销毁任务控制器实例。
     * 清空队列，移除所有事件监听器。
     */
    destroy() {
        console.log("销毁串行任务控制器...");
        this.pause(); // 首先暂停
        this.clear(); // 清空队列
        // 移除所有事件监听器
        this.eventBus.offAll(); 
        // 可能需要更彻底地清理状态？置为 null？
        this.taskQueue = null; 
        this.eventBus = null;
        console.log("串行任务控制器已销毁。");
    }

    /**
     * 获取任务队列的处理进度。
     * @returns {{completed: number, total: number, percentage: number}}
     */
    getProgress() {
        const percentage = this.totalTasks === 0 ? 0 : (this.completedTasks / this.totalTasks) * 100;
        return {
            completed: this.completedTasks,
            total: this.totalTasks,
            percentage: percentage
        };
    }

    /**
     * 获取当前正在执行的任务。
     * @returns {Function | null} 当前任务函数，如果没有任务在执行则返回 null。
     */
    getCurrentTask() {
        return this.currentTask;
    }

    /**
     * 获取当前队列中等待执行的任务数量。
     * @returns {number}
     */
    getQueueLength() {
        return this.taskQueue.size();
    }

    /**
     * 获取当前队列中所有等待执行的任务数组 (按优先级顺序)。
     * @returns {Array<Function>}
     */
    getPendingTasks() {
        // 注意：toArray() 返回的是内部数组副本，不保证优先级顺序
        // 需要先排序才能保证优先级
        const tasks = this.taskQueue.toArray();
        return tasks.sort(this.compareTasks.bind(this));
    }

    /**
     * 注册事件监听器。
     * 支持的事件: taskAdded, taskCompleted, allTasksCompleted, taskError, queueCleared, started, paused, resumed, destroy
     * @param {string} event 事件名称。
     * @param {Function} callback 回调函数。
     */
    on(event, callback) {
        this.eventBus.on(event, callback);
    }

    /**
     * 移除事件监听器。
     * @param {string} event 事件名称。
     * @param {Function} callback 要移除的回调函数。
     */
    off(event, callback) {
        this.eventBus.off(event, callback);
    }
} 