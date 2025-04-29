import { ref, onUnmounted } from "../../base/deps/vue/index.js"; // 更新导入路径

const createRegistry = (registryKey) => {
    const getRegistry = () => {
        // 使用 WeakRef 或更健壮的方式管理全局状态可能更好，但暂时保持原样
        if (!globalThis[registryKey]) {
            globalThis[registryKey] = {
                registry: new Map(),
                autoIncrementId: 0
            };
        }
        return globalThis[registryKey];
    };

    const getRegistryInstance = () => {
        const global = getRegistry();
        return {
            registry: global.registry,
            getNextId: () => global.autoIncrementId++
        };
    };

    // 通用工具方法
    const utils = {
        getAllInstances() {
            const { registry } = getRegistryInstance();
            return Array.from(registry.entries());
        },

        dispose(id) {
            const { registry } = getRegistryInstance();
            return registry.delete(id);
        },

        disposeAll() {
            const { registry } = getRegistryInstance();
            registry.clear();
            // 重置 ID 计数器可能导致 ID 冲突，谨慎使用
            // getRegistry().autoIncrementId = 0; 
            console.warn("Disposed all instances in registry:", registryKey);
        },

        getInstanceCount() {
            const { registry } = getRegistryInstance();
            return registry.size;
        }
    };

    return {
        getRegistryInstance,
        utils
    };
};

/**
 * 创建一个简单的基于 Vue Ref 和全局注册表的状态管理器。
 * 
 * @param {object} config 配置对象
 * @param {string | symbol} config.registryKey 用于全局注册表的唯一键 (推荐使用 Symbol)
 * @param {() => object} config.createDefaultState 创建默认状态对象的函数
 * @param {string} config.prefix 用于自动生成实例 ID 的前缀
 * @param {(state: Ref<object>) => object} [config.createController] (可选) 创建控制器方法的函数，接收 state ref 作为参数
 * @returns {{ useManager: (id?: string | symbol) => { state: Ref<object>, instanceId: symbol, ...controllerMethods }, utils: object }}
 */
export const createVueStateManager = ({
    registryKey,
    createDefaultState,
    prefix,
    createController = () => ({}) // 默认为空对象
}) => {
    // 确保 registryKey 有效
    if (!registryKey) {
        throw new Error('createVueStateManager requires a valid registryKey.');
    }
    if (typeof createDefaultState !== 'function'){
        throw new Error('createVueStateManager requires a valid createDefaultState function.');
    }
    if (!prefix){
        console.warn('createVueStateManager recommends providing a prefix for generated IDs.');
        prefix = 'state-manager';
    }


    const { getRegistryInstance, utils } = createRegistry(typeof registryKey === 'string' ? Symbol.for(registryKey) : registryKey);

    const useManager = (id = null) => {
        const { registry, getNextId } = getRegistryInstance();
        // 如果提供了 id，则使用它；否则生成一个唯一的 Symbol ID
        const instanceId = id ?? Symbol(`${prefix}-${getNextId()}`);

        if (registry.has(instanceId)) {
            const existingState = registry.get(instanceId);
            return {
                state: existingState,
                instanceId,
                ...(createController(existingState))
            };
        }

        const state = ref(createDefaultState());
        registry.set(instanceId, state);

        // 仅在自动生成 ID 时自动清理，手动指定 ID 的状态需要手动清理
        if (!id) {
            onUnmounted(() => {
                if (registry.has(instanceId)) {
                    // console.log(`Unmounting and disposing state for ${String(instanceId)}`);
                    registry.delete(instanceId);
                }
            });
        }

        return {
            state,
            instanceId,
            ...(createController(state))
        };
    };

    return {
        useManager,
        utils
    };
}; 