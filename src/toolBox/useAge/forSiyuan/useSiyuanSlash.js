/**
 * 思源笔记斜杠菜单工具函数
 * 
 * 本模块提供思源笔记斜杠菜单相关功能:
 * - 处理对话框销毁后的操作
 * - 打开API配置的对话框
 * - 打开本地路径对话框
 * - 打开磁盘选择对话框
 * - 注册斜杠菜单项
 * 
 * @module useSiyuanSlash
 * @author YourName
 * @version 1.0.0
 */

import { 检查思源环境 } from '../useSiyuan.js';
import { listLocalDisks } from '../../feature/forFileSystem/diskTools.js';
import { showEverythingDialog, showAnytxtDialog, showLocalAssetGallery } from '../../feature/forUI/dialogUtils.js';

/**
 * 注册斜杠菜单项
 * 
 * @function computeSlashItems
 * @param {Object} pluginInstance - 插件实例
 * @returns {Promise<Array>} 斜杠菜单项数组的 Promise (因为 listLocalDisks 是异步的)
 */
export async function computeSlashItems(pluginInstance) {
    检查思源环境();

    // 定义基础的、非动态的菜单项
    const baseSlashItems = [
        {
            filter: ['file', 'everything'],
            html: '<div class="b3-list-item__first"><span class="b3-list-item__text">everything 搜索文件</span><span class="b3-list-item__meta">😊</span></div>',
            id: `sacFile-everything`,
            callback: (protyle) => showEverythingDialog(protyle, pluginInstance)
        },
        {
            filter: ['file', 'anytxt'],
            html: '<div class="b3-list-item__first"><span class="b3-list-item__text">anytxt 搜索文件</span><span class="b3-list-item__meta">😊</span></div>',
            id: "sacFile-anytxt",
            callback: (protyle) => showAnytxtDialog(protyle, pluginInstance)
        }
    ];

    try {
        // 异步获取磁盘列表
        const disks = await listLocalDisks();
        let dynamicSlashItems = [];

        // 根据磁盘数量动态生成菜单项
        if (disks.length > 3) {
            dynamicSlashItems.push({
                filter: ['file', '选择磁盘'],
                html: `<div class="b3-list-item__first"><span class="b3-list-item__text">选择磁盘</span><span class="b3-list-item__meta">😊</span></div>`,
                id: "sacFile-localPath",
                callback: (protyle) => {
                    // 调用新的对话框函数，但需要传递组件路径
                    // TODO: 组件路径应来自配置或调用者
                    const componentPath = `/plugins/${pluginInstance.name}/source/UI/components/assetGalleryPanel.vue`; // 临时硬编码
                    showLocalAssetGallery(protyle, '选择磁盘', pluginInstance, componentPath);
                }
            });
        } else {
            disks.forEach(disk => {
                dynamicSlashItems.push({
                    filter: ['file', '文件夹', 'folder', 'disk', `磁盘:${disk.name}`],
                    html: `<div class="b3-list-item__first"><span class="b3-list-item__text">搜索磁盘:${disk.name}</span><span class="b3-list-item__meta">😊</span></div>`,
                    id: "sacFile-localPath" + disk.name,
                    callback: (protyle) => {
                        // 调用新的对话框函数，传递组件路径
                        // TODO: 组件路径应来自配置或调用者
                        const componentPath = `/plugins/${pluginInstance.name}/source/UI/components/assetGalleryPanel.vue`; // 临时硬编码
                        showLocalAssetGallery(protyle, disk.name + '/', pluginInstance, componentPath);
                    }
                });
            });
        }
        // 合并基础和动态菜单项
        return [...baseSlashItems, ...dynamicSlashItems];
    } catch (error) {
        console.error("生成斜杠菜单项时出错:", error);
        // 如果获取磁盘失败，只返回基础菜单项
        return baseSlashItems;
    }
}

/**
 * 设置插件的斜杠菜单 (通常在插件 onload 时调用)
 *
 * @function enablePluginSlashMenu
 * @param {Object} pluginInstance - 插件实例
 */
export function enablePluginSlashMenu(pluginInstance) {
    检查思源环境();

    // 定义 getter，使其在每次访问时异步计算最新的菜单项
    Object.defineProperty(pluginInstance, 'protyleSlash', {
        get: async function() {
            // 调用重命名后的异步函数
            return await computeSlashItems(pluginInstance);
        },
        configurable: true
    });
} 