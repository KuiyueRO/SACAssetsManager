/**
 * @fileoverview 事件混入 (Mixin) 工具
 * @module toolBox/base/forEvent/useEventMixin
 * @description 提供将事件发射器功能（on, off, emit 等）混入到普通对象的功能。
 */

// 导入方法注入工具
import { addMethodWithMetadata, removeMethodRecords, getObjectsWithAllMethods } from '../useEcma/useObject/forMethodInjection.js';

// 内部符号，用于存储事件处理器
const EVENT_HANDLERS_SYMBOL = Symbol('_eventHandlers');

// 各个事件方法的具体实现 (工厂函数模式)
const eventMethodsFactory = {
    /**
     * 添加一次性事件监听器
     */
    once: (target) => (event, handler) => {
        if (typeof event !== 'string' || !event) throw new TypeError('Event name must be a non-empty string.');
        if (typeof handler !== 'function') throw new TypeError('Handler must be a function.');

        const onceHandler = (...eventArgs) => {
            try {
                handler(...eventArgs);
            } catch (error) {
                console.error(`Event handler execution error (${event}):`, error);
            }
            // 使用 target 自身的 off 方法来移除
            if (typeof target.off === 'function') {
                target.off(event, onceHandler);
            } else {
                 // 如果 off 方法还未添加或已被移除，尝试直接操作内部存储（可能不安全）
                 const handlers = target[EVENT_HANDLERS_SYMBOL]?.get(event);
                 if (handlers) {
                     handlers.delete(onceHandler);
                     if (handlers.size === 0) target[EVENT_HANDLERS_SYMBOL].delete(event);
                     if (target[EVENT_HANDLERS_SYMBOL].size === 0) delete target[EVENT_HANDLERS_SYMBOL];
                 }
            }
        };
        // 将原始 handler 附加到包装器上，方便 off 时查找
        onceHandler._originalHandler = handler;

        // 使用 target 自身的 on 方法来添加
        if (typeof target.on === 'function') {
            target.on(event, onceHandler);
        } else {
            // 如果 on 方法还未添加，直接操作内部存储
             if (!target[EVENT_HANDLERS_SYMBOL]) target[EVENT_HANDLERS_SYMBOL] = new Map();
             if (!target[EVENT_HANDLERS_SYMBOL].has(event)) target[EVENT_HANDLERS_SYMBOL].set(event, new Set());
             target[EVENT_HANDLERS_SYMBOL].get(event).add(onceHandler);
        }
        return target;
    },

    /**
     * 添加事件监听器
     */
    on: (target) => (event, handler) => {
        if (typeof event !== 'string' || !event) throw new TypeError('Event name must be a non-empty string.');
        if (typeof handler !== 'function') throw new TypeError('Handler must be a function.');

        if (!target[EVENT_HANDLERS_SYMBOL]) {
            target[EVENT_HANDLERS_SYMBOL] = new Map();
        }
        if (!target[EVENT_HANDLERS_SYMBOL].has(event)) {
            target[EVENT_HANDLERS_SYMBOL].set(event, new Set());
        }
        target[EVENT_HANDLERS_SYMBOL].get(event).add(handler);
        return target;
    },

    /**
     * 为多个事件添加同一个监听器
     */
    onMultiple: (target) => (events, handler) => {
        if (!Array.isArray(events)) throw new TypeError('Events must be an array of strings.');
        if (typeof handler !== 'function') throw new TypeError('Handler must be a function.');

        events.forEach(event => {
            if (typeof event === 'string' && event) {
                 // 调用 target 自身的 on 方法
                if (typeof target.on === 'function') {
                    target.on(event, handler);
                }
            }
        });
        return target;
    },

    /**
     * 移除事件监听器
     */
    off: (target) => (event, handler) => {
        const eventHandlers = target[EVENT_HANDLERS_SYMBOL];
        if (!eventHandlers?.has(event)) return target;

        const handlers = eventHandlers.get(event);
        if (handler) {
            // 同时移除原始处理器和通过 once 添加的包装器
            handlers.delete(handler);
            for (const wrapper of handlers) {
                 if (wrapper._originalHandler === handler) {
                     handlers.delete(wrapper);
                     break; // 假设一个原始 handler 只会对应一个 once 包装器
                 }
            }

            if (handlers.size === 0) {
                eventHandlers.delete(event);
            }
        } else {
            // 如果没有指定 handler，移除该事件的所有监听器
            eventHandlers.delete(event);
        }

        if (eventHandlers.size === 0) {
            delete target[EVENT_HANDLERS_SYMBOL]; // 清理 Map
        }
        return target;
    },

    /**
     * 异步触发事件
     */
    emitAsync: (target) => async (event, ...args) => {
        if (typeof event !== 'string' || !event) throw new TypeError('Event name must be a non-empty string.');

        const handlers = target[EVENT_HANDLERS_SYMBOL]?.get(event);
        if (!handlers || handlers.size === 0) return target;

        // 复制 Set 到数组，防止迭代时修改 Set 导致问题
        const handlersArray = Array.from(handlers);
        try {
            await Promise.all(
                handlersArray.map(handler =>
                    Promise.resolve(handler(...args))
                        .catch(error => {
                            console.error(`Async event handler execution error (${event}):`, error);
                        })
                )
            );
        } catch (error) {
            // Promise.all 通常在第一个 reject 时就停止，但上面的 catch 会阻止它
            // 这里的 catch 可能只在 map 阶段出错时触发
            console.error(`Async event batch processing error (${event}):`, error);
        }
        return target;
    },

    /**
     * 同步触发事件
     */
    emit: (target) => (event, ...args) => {
        if (typeof event !== 'string' || !event) throw new TypeError('Event name must be a non-empty string.');

        const handlers = target[EVENT_HANDLERS_SYMBOL]?.get(event);
        if (!handlers || handlers.size === 0) return target;

        // 复制 Set 到数组，防止在 handler 中调用 off 影响迭代
        Array.from(handlers).forEach(handler => {
            try {
                handler(...args);
            } catch (error) {
                console.error(`Event handler execution error (${event}):`, error);
            }
        });
        return target;
    },

    /**
     * 获取指定事件的监听器数量
     */
    listenerCount: (target) => (event) => {
        if (typeof event !== 'string') throw new TypeError('Event name must be a string.');
        return target[EVENT_HANDLERS_SYMBOL]?.get(event)?.size || 0;
    },

    /**
     * 获取所有已注册事件名称的数组
     */
    eventNames: (target) => () => {
        return Array.from(target[EVENT_HANDLERS_SYMBOL]?.keys() || []);
    },

    /**
     * 移除所有事件的所有监听器
     */
    removeAllListeners: (target) => (event) => {
        if (event !== undefined) {
             if (typeof event !== 'string') throw new TypeError('Event name must be a string if provided.');
             target[EVENT_HANDLERS_SYMBOL]?.delete(event);
             if (target[EVENT_HANDLERS_SYMBOL]?.size === 0) delete target[EVENT_HANDLERS_SYMBOL];
        } else {
            delete target[EVENT_HANDLERS_SYMBOL];
        }
        return target;
    },

    /**
     * 销毁添加到对象上的事件系统
     */
    $destroyEvents: (target) => () => {
        delete target[EVENT_HANDLERS_SYMBOL];
        // 移除通过 addMethod 添加的方法记录
        removeMethodRecords(target);
        // 注意：这不会从对象本身移除方法，如果需要，需要手动 delete
        return target;
    }
};

// 事件方法的元数据
const methodMetadata = {
    once: { description: '添加一次性事件监听器', params: ['event: string', 'handler: Function'], returns: 'target' },
    on: { description: '添加事件监听器', params: ['event: string', 'handler: Function'], returns: 'target' },
    onMultiple: { description: '为多个事件添加相同的监听器', params: ['events: string[]', 'handler: Function'], returns: 'target' },
    off: { description: '移除事件监听器', params: ['event: string', 'handler?: Function'], returns: 'target' },
    emit: { description: '同步触发事件', params: ['event: string', '...args: any[]'], returns: 'target' },
    emitAsync: { description: '异步触发事件', params: ['event: string', '...args: any[]'], returns: 'Promise<target>' },
    listenerCount: { description: '获取事件监听器数量', params: ['event: string'], returns: 'number' },
    eventNames: { description: '获取所有事件名称', params: [], returns: 'string[]' },
    removeAllListeners: { description: '移除所有监听器（可指定事件）', params: ['event?: string'], returns: 'target' },
    $destroyEvents: { description: '销毁事件系统', params: [], returns: 'target' }
};

/**
 * 为目标对象混入事件发射器功能
 * @param {object} target - 要添加事件功能的目标对象
 * @returns {object} 添加了事件功能的目标对象
 * @throws {TypeError} 如果 target 不是有效对象
 */
export const addEvents = (target) => {
    if (!target || typeof target !== 'object') {
        throw new TypeError('Target must be a valid object.');
    }

    // 防止重复初始化（基于是否已存在 on 和 emit 方法）
    if (isEventEmitter(target)) {
        // console.warn('Target object is already an event emitter.');
        return target;
    }

    // 确保内部事件处理器存储已初始化
    if (!target[EVENT_HANDLERS_SYMBOL]) {
         target[EVENT_HANDLERS_SYMBOL] = new Map();
    }

    // 使用 addMethodWithMetadata 添加所有方法及其元数据
    Object.entries(eventMethodsFactory).forEach(([name, methodFactory]) => {
        // 只有当目标对象上不存在同名方法时才添加
        if (typeof target[name] === 'undefined') {
            addMethodWithMetadata(
                target,
                name,
                methodFactory(target), // 创建绑定到 target 的方法实例
                methodMetadata[name] || {}
            );
        }
    });

    return target;
};

/**
 * 检查目标对象是否具有基本的事件发射器接口（on 和 emit）
 * @param {any} target - 要检查的目标对象
 * @returns {boolean} 如果对象具有 on 和 emit 方法，则返回 true
 */
export const isEventEmitter = (target) => {
    return target &&
           typeof target.on === 'function' &&
           typeof target.emit === 'function';
};

/**
 * 获取所有（通过 addMethod 注册了 on 和 emit 方法的）事件发射器对象
 * @returns {object[]} 包含事件发射器对象的数组
 */
export const getAllEventEmitters = () => {
    // 依赖于 forMethodInjection 模块的功能
    return getObjectsWithAllMethods(['on', 'emit']);
};

// 提供英文别名
export { addEvents as forEventMixin };
export { isEventEmitter as isTargetEventEmitter };
export { getAllEventEmitters as getAllMixedEventEmitters };

export default addEvents; 