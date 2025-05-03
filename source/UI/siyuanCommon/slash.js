/**
 * 兼容层 - 旧版本引用路径保持不变
 * 
 * @deprecated 请直接使用 src/toolBox/useAge/forSiyuan/useSiyuanSlash.js
 */

import { 
    computeSlashItems,
    enablePluginSlashMenu
} from "/plugins/SACAssetsManager/src/toolBox/useAge/forSiyuan/useSiyuanSlash.js";

import { plugin } from "/plugins/SACAssetsManager/source/pluginSymbolRegistry.js";

// 移除所有对话框函数的导出 (此 export 语句现在为空，可以考虑删除)
export { 
    
};

// 为保持兼容性，保留原有的 protyleSlash 定义方式
Object.defineProperty(plugin, 'protyleSlash', {
    get: async function() {
        console.warn('弃用警告: 直接访问 plugin.protyleSlash 已弃用，请使用 useSiyuanSlash.js 中的 enablePluginSlashMenu 函数');
        return await computeSlashItems(plugin);
    }
});
