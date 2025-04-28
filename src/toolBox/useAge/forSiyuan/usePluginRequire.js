/**
 * @fileoverview 提供从当前思源插件的 node_modules 目录加载依赖的功能。
 * @module usePluginRequire
 */

import { plugin } from '../../../../source/asyncModules.js'; // 更新导入路径
const path = require('path');

// 尝试获取工作区目录和插件名称
const workspaceDir = window.siyuan?.config?.system?.workspaceDir || window.workspaceDir;
const pluginName = plugin?.name || window.pluginName;

// 计算插件 node_modules 路径 (增加健壮性检查)
let nodeModulePath = null;
if (workspaceDir && pluginName) {
    nodeModulePath = require('path').join(workspaceDir, 'data', 'plugins', pluginName, 'node_modules');
} else {
    console.error("无法确定插件的 node_modules 路径，workspaceDir 或 pluginName 未找到。");
}

/**
 * 从当前插件的 node_modules 目录加载指定的模块。
 * 
 * @param {string} moduleName - 要加载的模块名称。
 * @returns {any} 加载的模块。如果无法确定路径或加载失败，则抛出错误。
 * @throws {Error} 如果无法计算 node_modules 路径或 require 失败。
 */
export const requirePluginDeps = (moduleName) => {
    if (!nodeModulePath) {
        throw new Error("无法加载插件依赖，未能计算出 node_modules 路径。");
    }
    try {
        return require(path.join(nodeModulePath, moduleName));
    } catch (error) {
        console.error(`从插件路径 ${nodeModulePath} 加载模块 ${moduleName} 失败:`, error);
        throw error; // 重新抛出错误
    }
}; 