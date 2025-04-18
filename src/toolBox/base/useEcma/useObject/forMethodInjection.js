/**
 * @fileoverview 对象方法注入与管理工具
 * @module toolBox/base/useEcma/useObject/forMethodInjection
 * @description 提供向对象动态添加方法并进行管理的工具，支持元数据和方法查找。
 */

// 使用 Symbol 避免全局命名冲突
const METHOD_MANAGER_SYMBOL = Symbol.for('MethodManagerGlobalInstance');

// 初始化或获取全局方法管理器（确保单例）
const initializeMethodManager = () => {
    if (globalThis[METHOD_MANAGER_SYMBOL]) {
        return globalThis[METHOD_MANAGER_SYMBOL];
    }

    // 使用 Map 存储方法名 -> Set<WeakRef<Target>> 的关系
    const methodTargetsMap = new Map();
    // 使用 WeakMap 存储 Target -> Set<methodName> 的关系
    const targetMethodsMap = new WeakMap();
    // 使用 Map 存储方法名 -> Map<metadataKey, metadataValue> 的关系
    const methodMetadataMap = new Map();

    const manager = {
        // 清理已失效的 WeakRef
        _cleanup() {
            for (const targets of methodTargetsMap.values()) {
                for (const targetRef of targets) {
                    if (!targetRef.deref()) {
                        targets.delete(targetRef);
                    }
                }
            }
        },

        // 注册方法与目标对象的关联，并可选添加元数据
        _register(methodName, target, metadata = null) {
            if (!methodTargetsMap.has(methodName)) {
                methodTargetsMap.set(methodName, new Set());
            }
            // 检查是否已存在引用，避免重复添加
            let exists = false;
            for (const ref of methodTargetsMap.get(methodName)) {
                if (ref.deref() === target) {
                    exists = true;
                    break;
                }
            }
            if (!exists) {
                methodTargetsMap.get(methodName).add(new WeakRef(target));
            }

            if (!targetMethodsMap.has(target)) {
                targetMethodsMap.set(target, new Set());
            }
            targetMethodsMap.get(target).add(methodName);

            if (metadata) {
                this._addMetadata(methodName, metadata);
            }

            // 定期或按需清理
            if (Math.random() < 0.1) { // 10% 的概率进行清理
                this._cleanup();
            }
        },

        // 添加方法的元数据
        _addMetadata(methodName, metadata) {
            if (!methodMetadataMap.has(methodName)) {
                methodMetadataMap.set(methodName, new Map());
            }
            const metadataStore = methodMetadataMap.get(methodName);
            Object.entries(metadata).forEach(([key, value]) => {
                metadataStore.set(key, value);
            });
        },

        // 获取拥有指定方法的所有有效对象
        getTargetsByMethod(methodName) {
            this._cleanup();
            const targets = methodTargetsMap.get(methodName);
            if (!targets) return [];
            return Array.from(targets)
                .map(ref => ref.deref())
                .filter(Boolean); // 过滤掉已被垃圾回收的对象
        },

        // 获取指定对象实现的所有方法名
        getMethodsByTarget(target) {
            return Array.from(targetMethodsMap.get(target) || []);
        },

        // 移除指定对象的所有方法记录
        removeTargetRecords(target) {
            const methods = targetMethodsMap.get(target);
            if (methods) {
                methods.forEach(methodName => {
                    const targets = methodTargetsMap.get(methodName);
                    if (targets) {
                        for (const ref of targets) {
                            if (ref.deref() === target) {
                                targets.delete(ref);
                                break; // 找到并删除后即可跳出内层循环
                            }
                        }
                        // 如果某个方法不再被任何对象引用，可以考虑清理方法映射
                        // if (targets.size === 0) {
                        //     methodTargetsMap.delete(methodName);
                        //     methodMetadataMap.delete(methodName);
                        // }
                    }
                });
            }
            targetMethodsMap.delete(target);
        },

        // 获取指定方法的元数据
        getMethodMetadata(methodName) {
            const metadataStore = methodMetadataMap.get(methodName);
            return metadataStore ? Object.fromEntries(metadataStore) : {};
        },

        // 获取实现了所有指定方法列表的对象
        getTargetsWithAllMethods(methodNames) {
            if (!Array.isArray(methodNames) || methodNames.length === 0) {
                return [];
            }
            this._cleanup();
            // 以第一个方法的目标为基础进行过滤
            let potentialTargets = new Set(this.getTargetsByMethod(methodNames[0]));
            if (potentialTargets.size === 0) {
                return [];
            }

            for (let i = 1; i < methodNames.length; i++) {
                const currentTargets = new Set(this.getTargetsByMethod(methodNames[i]));
                potentialTargets = new Set([...potentialTargets].filter(target => currentTargets.has(target)));
                if (potentialTargets.size === 0) {
                    return [];
                }
            }
            return Array.from(potentialTargets);
        },

        // 检查指定方法是否被任何有效对象实现
        isMethodImplemented(methodName) {
            return this.getTargetsByMethod(methodName).length > 0;
        }
    };

    globalThis[METHOD_MANAGER_SYMBOL] = manager;
    return manager;
};

// 获取全局方法管理器实例
const getMethodManagerInstance = () => {
    return globalThis[METHOD_MANAGER_SYMBOL] || initializeMethodManager();
};

/**
 * 向目标对象添加一个方法，并注册到管理器
 * @param {object} target - 目标对象
 * @param {string} name - 方法名称
 * @param {Function} method - 要添加的方法函数
 * @returns {object} 目标对象本身
 */
export const addMethod = (target, name, method) => {
    if (!target || typeof target !== 'object') throw new TypeError('Target must be an object.');
    if (typeof name !== 'string' || !name) throw new TypeError('Method name must be a non-empty string.');
    if (typeof method !== 'function') throw new TypeError('Method must be a function.');

    target[name] = method;
    getMethodManagerInstance()._register(name, target);
    return target;
};

/**
 * 向目标对象添加一个方法，并附带元数据，同时注册到管理器
 * @param {object} target - 目标对象
 * @param {string} name - 方法名称
 * @param {Function} method - 要添加的方法函数
 * @param {object} [metadata={}] - 方法的元数据
 * @returns {object} 目标对象本身
 */
export const addMethodWithMetadata = (target, name, method, metadata = {}) => {
    addMethod(target, name, method); // 复用 addMethod 进行基础添加和注册
    if (metadata && typeof metadata === 'object' && Object.keys(metadata).length > 0) {
        getMethodManagerInstance()._addMetadata(name, metadata);
    }
    return target;
};

/**
 * 向目标对象批量添加方法
 * @param {object} target - 目标对象
 * @param {object} methods - 包含方法名和函数的对象，例如 { method1: func1, method2: func2 }
 * @returns {object} 目标对象本身
 */
export const addMethods = (target, methods) => {
    if (!target || typeof target !== 'object') throw new TypeError('Target must be an object.');
    if (!methods || typeof methods !== 'object') throw new TypeError('Methods must be an object.');

    Object.entries(methods).forEach(([name, method]) => {
        if (typeof method === 'function') {
            addMethod(target, name, method);
        }
    });
    return target;
};

/**
 * 检查目标对象是否具有（通过此管理器添加的）指定方法
 * @param {object} target - 目标对象
 * @param {string} methodName - 方法名称
 * @returns {boolean} 是否具有该方法
 */
export const hasMethod = (target, methodName) => {
    return getMethodManagerInstance().getMethodsByTarget(target).includes(methodName);
};

/**
 * 获取所有（通过此管理器添加了）指定方法的有效对象
 * @param {string} methodName - 方法名称
 * @returns {object[]} 包含目标对象的数组
 */
export const getObjectsWithMethod = (methodName) => {
    return getMethodManagerInstance().getTargetsByMethod(methodName);
};

/**
 * 获取所有（通过此管理器添加了）指定方法列表中的所有方法的有效对象
 * @param {string[]} methodNames - 方法名称数组
 * @returns {object[]} 包含目标对象的数组
 */
export const getObjectsWithAllMethods = (methodNames) => {
    return getMethodManagerInstance().getTargetsWithAllMethods(methodNames);
};

/**
 * 移除目标对象在管理器中的所有方法记录
 * 注意：这不会从对象本身移除方法，仅移除管理器的记录。
 * @param {object} target - 目标对象
 * @returns {object} 目标对象本身
 */
export const removeMethodRecords = (target) => {
    getMethodManagerInstance().removeTargetRecords(target);
    return target;
};

/**
 * 检查指定方法是否被任何有效对象实现（通过此管理器添加）
 * @param {string} methodName - 方法名称
 * @returns {boolean} 是否至少被一个对象实现
 */
export const isMethodImplemented = (methodName) => {
    return getMethodManagerInstance().isMethodImplemented(methodName);
};

/**
 * 获取指定方法的元数据
 * @param {string} methodName - 方法名称
 * @returns {object} 元数据对象，如果无则返回空对象
 */
export const getMethodMetadata = (methodName) => {
    return getMethodManagerInstance().getMethodMetadata(methodName);
}; 