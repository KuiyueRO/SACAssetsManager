/**
 * @deprecated 此文件依赖的旧版 MinHeap 已废弃，且自身功能可能已被 toolBox 中其他模块替代。
 */
// HACK: 更新导入，使用 toolBox 中的新版 MinHeap
import { createMinHeap } from '../../../../src/toolBox/feature/useDataStruct/useHeaps/useMinHeap.js' 
import { reportHeartbeat } from '../../../../src/toolBox/base/platform/electron/useHeartBeat.js'

// 常量配置
const CONFIG = {
    MAX_TASKS: 1000000,
    MIN_TIMEOUT: 10,
    MAX_TIMEOUT: 10000,
    LOG_INTERVAL: 1000
}

// 优先级比较器
const priorityComparators = {
    mainQueue: (a, b) => {
        const priorityA = a.priority ?? Infinity;
        const priorityB = b.priority ?? Infinity;
        
        if ((priorityA >= 0 && priorityB < 0) || (priorityA < 0 && priorityB >= 0)) {
            return priorityB - priorityA; // 非负数优先 (小的在前)
        }
        return priorityA - priorityB; // 数值小的优先
    },
    
    auxiliaryQueue: (a, b) => {
        const priorityA = a.priority ?? Infinity;
        const priorityB = b.priority ?? Infinity;
        
        if ((priorityA >= 0 && priorityB < 0) || (priorityA < 0 && priorityB >= 0)) {
            return priorityA - priorityB; // 负数优先 (大的在前，因为是辅助堆用于淘汰)
        }
        return priorityB - priorityA; // 数值大的优先 (用于淘汰低优先级)
    }
}

// TaskQueue 类 (不再继承 MinHeap)
class TaskQueue {
    constructor() {
        // 使用组合替代继承
        this.mainHeap = createMinHeap(priorityComparators.mainQueue);
        this.auxiliaryHeap = createMinHeap(priorityComparators.auxiliaryQueue);
        
        this.paused = false;
        this.started = false;
        this.isProcessing = false;
        this.stats = {
            index: 0,
            timeout: 0,
            lastTimeout: 0,
            logs: []
        };
        
        // 绑定 this
        this.processNext = this.processNext.bind(this);
        this.start = this.start.bind(this);
        this.handleEmptyQueue = this.handleEmptyQueue.bind(this);
        this.executeTask = this.executeTask.bind(this);
        this.updateTimeout = this.updateTimeout.bind(this);
        this.logProgress = this.logProgress.bind(this);
        this.push = this.push.bind(this);
        this.pause = this.pause.bind(this);
        this.priority = this.priority.bind(this);
        this.ended = this.ended.bind(this);
    }

    // --- MinHeap 接口适配 ---
    size() {
        return this.mainHeap.size();
    }

    peek() {
        return this.mainHeap.peek();
    }

    pop() {
        // 需要同时从辅助堆中移除 (如果存在)
        const task = this.mainHeap.pop();
        // 注意：辅助堆用于淘汰，不直接参与pop逻辑，但在 push 时维护
        return task;
    }

    isEmpty() {
        return this.mainHeap.isEmpty();
    }
    // --- End MinHeap 接口适配 ---

    ended() {
        return this.isEmpty();
    }

    // 任务管理方法
    push(task) {
        if (typeof task !== 'function') {
            throw new Error('任务必须是一个函数，并且返回一个Promise');
        }

        // 直接使用内部 mainHeap 的 push
        this.mainHeap.push(task); 
        // 辅助堆用于跟踪任务以淘汰低优先级，也需要添加
        this.auxiliaryHeap.push(task); 
        
        // 检查是否超出最大任务数限制
        if (this.mainHeap.size() > CONFIG.MAX_TASKS) {
            // 从辅助堆中移除优先级最低的任务 (对于辅助堆，是值最大的)
            const lowestPriorityTask = this.auxiliaryHeap.pop(); 
            if (lowestPriorityTask) {
                lowestPriorityTask.$canceled = true;
                // TODO: 如何从 mainHeap 中高效移除这个 task？
                // 当前 MinHeap 实现不支持按值移除。这是一个潜在问题。
                // 临时解决方案：在 executeTask 时检查 $canceled 标志。
                console.warn("Task queue full, lowest priority task marked as canceled, but removal from main heap is not efficient.");
            }
        }
    }

    priority(fn, num) {
        fn.priority = num;
        return fn;
    }

    // 队列控制方法
    pause() {
        this.paused = true;
    }

    async executeTask(task) {
        // 在执行前检查取消标志
        if (task.$canceled) {
             console.log("Skipping canceled task.");
             return {}; // 返回空对象或特定值表示跳过
        }
        
        const start = performance.now();
        try {
            const result = await task();
            this.updateTimeout(performance.now() - start);
            return result;
        } catch (error) {
            console.error('Task execution error:', error);
            this.stats.timeout = Math.min(this.stats.timeout * 2, CONFIG.MAX_TIMEOUT);
            throw error;
        }
    }

    updateTimeout(executionTime) {
        this.stats.timeout = Math.max(
            this.stats.timeout / 10,
            executionTime,
            (this.stats.lastTimeout / 10 || 0)
        );
    }

    logProgress(stat = null) {
        if (this.stats.index % CONFIG.LOG_INTERVAL === 0 || this.size() < 100) {
            console.log('processNext', this.stats.index, this.size(), this.stats.timeout);
            if (this.stats.logs.length) {
                console.log(this.stats.logs.join(','));
                this.stats.logs = [];
            }
        }
        
        if (stat) {
            const logEntry = ['processFile', stat.path, this.stats.index, this.size()];
            if (stat.error) {
                logEntry.unshift('processFileError');
                logEntry.push(stat.error);
            }
            this.stats.logs.push(logEntry.join(','));
        }
    }

    // 核心处理逻辑
    processNext($timeout = 0, force = false) {
        const scheduleNext = (timeout) => {
            // 确保 timeout 是有效数字且在合理范围内
            const validTimeout = Math.max(CONFIG.MIN_TIMEOUT, Math.min(timeout || 0, CONFIG.MAX_TIMEOUT));
            setTimeout(this.processNext, validTimeout);
        };

        reportHeartbeat();
        
        if ($timeout) {
            this.stats.timeout = $timeout;
        }
        if ($timeout === 0) {
            this.stats.lastTimeout = this.stats.timeout || this.stats.lastTimeout;
            this.stats.timeout = 0;
        }
        if (force) {
            this.paused = false;
        }

        if (this.isProcessing) {
            // 如果正在处理，不再重复调度，等待当前处理完成
            // scheduleNext(this.stats.timeout);
            return;
        }

        if (this.isEmpty() || this.paused) {
            this.handleEmptyQueue(); // 处理空队列或暂停状态
            return;
        }

        this.isProcessing = true;

        const task = this.pop(); // 从主堆获取任务
        if (!task) { // 可能在并发场景下为空
             this.isProcessing = false;
             scheduleNext(this.stats.timeout); 
             return;
        }
        
        this.stats.index++;
        this.logProgress();

        this.executeTask(task)
            .then(stat => {
                this.logProgress(stat);
            })
            .catch((err) => {
                 console.error("Task execution failed in processNext:", err);
                 // 可以在这里添加错误处理逻辑，比如重试或记录
            })
            .finally(() => {
                this.isProcessing = false;
                scheduleNext(this.stats.timeout); // 不论成功失败，都调度下一次
            });
                
        // 更新超时：倾向于减少超时以快速处理
        this.stats.timeout = Math.max(this.stats.timeout / 10, CONFIG.MIN_TIMEOUT);
    }

    handleEmptyQueue() {
        this.isProcessing = false; // 确保标记为非处理状态
        if (!this.ended() && !this.paused) { // 如果队列非空且未暂停 (例如，任务在pop后加入)
            this.logProgress();
            // 计算等待超时
            this.stats.timeout = Math.min(
                Math.max(this.stats.timeout * 2, this.stats.timeout + 100), 
                CONFIG.MAX_TIMEOUT
            );
            setTimeout(this.processNext, this.stats.timeout);
        } else if (this.ended()) {
             console.log("Task queue is empty.");
             // 可选：触发队列空事件
        } else if (this.paused) {
             console.log("Task queue is paused.");
        }
    }

    start($timeout = 0, force = false) {
        console.log('恢复后台任务', "执行间隔:" + $timeout, force ? "强制开始:" : '');
        if (this.started && !this.paused && !force) {
             console.log("Task queue already started and not paused.");
             return;
        }
        
        this.paused = false; // 确保未暂停
        this.started = true;
        
        // 延迟启动，避免阻塞当前流程
        setTimeout(() => this.processNext($timeout, force), 0);
    }
}

// 创建全局单例
const globalTaskQueue = new TaskQueue();
// 保持全局访问方式不变
globalThis[Symbol.for('taskQueue')] = globalThis[Symbol.for('taskQueue')] || globalTaskQueue;

// 导出公共API (保持不变)
export { globalTaskQueue };
export const 暂停全局任务队列执行 = () => globalTaskQueue.pause();
export const 恢复全局任务队列执行 = () => {
    // 恢复时强制启动一次检查
    globalTaskQueue.start(0, true); 
};
export const 添加全局任务 = (task) => globalTaskQueue.push(task);

export const 添加带有优先级的全局任务 = (taskFn, priority) => {
    globalTaskQueue.push(
        globalTaskQueue.priority(
            async () => {
                const result = await taskFn();
                return result || {}; // 确保返回对象
            },
            priority
        )
    )
}

export const 添加后进先出后台任务=(任务函数)=>{
    const 负数时间优先级 = 0-Date.now()
    添加带有优先级的全局任务(任务函数,负数时间优先级)
}