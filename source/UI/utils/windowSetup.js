/**
 * @fileoverview Provides functions to set up the environment for auxiliary Electron windows.
 */

import { plugin } from "../../../pluginSymbolRegistry.js"; // Adjusted path

/**
 * 构建用于注入新窗口的思源环境模拟脚本字符串。
 * 该脚本会尝试设置 workspaceDir, pluginName, imagePath 全局变量，
 * 调整基础样式表路径，并加载 app.js。
 *
 * 注意：此函数依赖于执行它的上下文（主渲染进程）中的全局 `siyuan` 对象和 `document`。
 * @returns {string} 用于注入的 JavaScript 脚本字符串。
 */
export const 构建思源环境脚本 = () => {
    let baseStyleSrc = '';
    try {
        const baseStyle = document.querySelector('link[href^="base"]');
        if (baseStyle) {
            baseStyleSrc = baseStyle.getAttribute('href') || '';
        } else {
            console.warn('未能找到基础样式表 <link href^="base">。');
        }
    } catch (e) {
        console.error('查询基础样式表时出错:', e);
    }

    const workspaceDir = typeof siyuan !== 'undefined' && siyuan.config && siyuan.config.system
        ? siyuan.config.system.workspaceDir.replace(/\\\\/g, '/')
        : '';
    if (!workspaceDir) {
        console.warn('无法获取思源工作空间目录 (siyuan.config.system.workspaceDir)。');
    }

    const pluginName = typeof plugin !== 'undefined' && plugin.name ? plugin.name : '';
    if (!pluginName) {
        console.warn('无法获取插件名称 (plugin.name)。');
    }

    // TODO: 确定 imagePath 的正确来源。目前硬编码为空字符串。
    const imagePath = ''; // 替换为实际逻辑或配置来获取 imagePath

    // 使用硬编码路径，因为 import.meta.resolve 不可靠
    const appJsPath = './app.js'; // 假设 app.js 在新窗口的根目录下

    // 返回注入脚本
    return `
    window.workspaceDir = '${workspaceDir}';
    window.pluginName = '${pluginName}';
    window.imagePath = '${imagePath}'; // 注意: imagePath 来源待定

    try {
        const styleElement = document.getElementById('baseStyle');
        if (styleElement && '${baseStyleSrc}') { // 确保元素和 src 都存在
            // 假设新窗口的资源路径结构，可能需要调整
            styleElement.setAttribute('href', \`\${'/stage/build/app/' + '${baseStyleSrc}'}\`);
        } else if (!styleElement) {
             console.warn('在新窗口中未找到 ID 为 "baseStyle" 的元素。');
        }
    } catch(e) {
        console.warn('设置 baseStyle href 时出错:', e);
    }

    // 动态导入 app.js
    try {
        import('${appJsPath}');
    } catch (e) {
        console.error('动态导入 ${appJsPath} 失败:', e);
    }
    `;
} 