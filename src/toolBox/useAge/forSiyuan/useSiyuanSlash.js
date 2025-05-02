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
import { openDialog } from '../../../../source/UI/siyuanCommon/dialog/vueDialog.js';
import { listLocalDisks, createDiskSelectionPanelHTML } from '../../feature/forFileSystem/diskTools.js';
import { getDialogInterface } from '../../feature/interfaces/dialogInterfaces.js';

/**
 * 处理对话框销毁后的操作
 * 
 * @function 处理对话框销毁
 * @param {Object} data - 对话框数据
 * @param {Object} protyle - 编辑器实例
 */
export function 处理对话框销毁(data, protyle) {
    if (data.selectedItems) {
        const selectedFilePath = data.selectedItems.map(
            item => item.data.path
        ).filter(item => item);

        protyle.focus();
        protyle.insert(
            selectedFilePath.map(
                item => `<span data-type="a" data-href="file:///${item}">${item.split('/').pop()}</span>`
            ).join('\n')
        );
    }
}

export const handleDialogDestroy = 处理对话框销毁;

/**
 * 使用API配置打开对话框
 * 
 * @function 使用API配置打开对话框
 * @param {Object} protyle - 编辑器实例
 * @param {string} type - API类型
 * @param {string} title - 对话框标题
 * @param {Object} pluginInstance - 插件实例
 */
export function 使用API配置打开对话框(protyle, type, title, pluginInstance) {
    检查思源环境();
    
    const 状态注册表 = window.siyuan?.ws?.app?.plugins?.find(p => p.name === pluginInstance.name)?.data?.状态注册表;
    if (!状态注册表) {
        console.error('无法获取状态注册表');
        return;
    }
    
    const getStatu = (key) => {
        return window.siyuan?.ws?.app?.plugins?.find(p => p.name === pluginInstance.name)?.data?.[key];
    };
    
    const port = getStatu(状态注册表.本地文件搜索接口).find(item => item.type === type).port;
    const data = {
        [`${type}ApiLocation`]: `http://localhost:${port}`,
        ui: {
            size: '64'
        }
    };
    
    const { app, dialog } = openDialog(
        `/plugins/${pluginInstance.name}/source/UI/components/assetGalleryPanel.vue`,
        title,
        {},
        '',
        data,
        title,
        '200 px', '', false
    );
    
    dialog.destroyCallback = () => 处理对话框销毁(data, protyle);
}

export const openDialogWithApiConfig = 使用API配置打开对话框;

/**
 * 使用本地路径打开对话框
 * 
 * @function 使用本地路径打开对话框
 * @param {Object} protyle - 编辑器实例
 * @param {string} path - 本地路径
 * @param {Object} pluginInstance - 插件实例
 */
export function 使用本地路径打开对话框(protyle, path, pluginInstance) {
    检查思源环境();
    
    if (path === "选择磁盘") {
        打开磁盘选择对话框(protyle, pluginInstance);
        return;
    }

    const data = {
        localPath: path,
        ui: {
            size: '64'
        }
    };
    
    const { app, dialog } = openDialog(
        `/plugins/${pluginInstance.name}/source/UI/components/assetGalleryPanel.vue`,
        `sacFile`,
        {},
        '',
        data,
        `搜索文件夹:${path}`,
        '200 px', '', false
    );
    
    dialog.destroyCallback = () => 处理对话框销毁(data, protyle);
}

export const openDialogWithLocalPath = 使用本地路径打开对话框;

/**
 * 打开磁盘选择对话框
 * 
 * @function 打开磁盘选择对话框
 * @param {Object} protyle - 编辑器实例
 * @param {Object} pluginInstance - 插件实例
 */
export function 打开磁盘选择对话框(protyle, pluginInstance) {
    if (!window.siyuan?.clientApi) {
        console.error('无法获取客户端API');
        return;
    }
    
    // 使用重构后的磁盘选择面板HTML生成函数
    listLocalDisks().then(disks => {
        const diskSelectionContent = createDiskSelectionPanelHTML(disks);

        // 使用对话框接口
        const dialogInterface = getDialogInterface();
        
        const dialog = dialogInterface.custom({
            type: 'custom',
            title: "选择磁盘",
            message: diskSelectionContent,
            width: '320px',
            height: 'auto',
            transparent: false
        });

        // 设置磁盘点击事件
        const diskList = dialog.element.querySelector("#diskList");
        const diskItems = diskList.querySelectorAll(".disk-item");
        
        diskItems.forEach(item => {
            item.addEventListener('mouseover', () => {
                item.style.backgroundColor = '#e0e0e0';
            });
            item.addEventListener('mouseout', () => {
                item.style.backgroundColor = '';
            });
            item.addEventListener('click', () => {
                // 选择磁盘后的操作
                const diskPath = item.getAttribute('data-path');
                使用本地路径打开对话框(protyle, diskPath, pluginInstance);
                dialog.destroy();
            });
        });

        dialog.element.querySelector(".b3-dialog__close").style.display = 'none';
        dialog.element.querySelector(".b3-dialog__header").style.padding = '0px 24px';
        dialog.element.querySelector(".b3-dialog__header").insertAdjacentHTML('afterBegin', `<svg class="cc-dialog__close" style="position:absolute;top:2px;left:2px"><use xlink:href="#iconCloseRound"></use></svg>`);
        dialog.element.querySelector(".cc-dialog__close").addEventListener('click', () => { dialog.destroy(); });
    });
}

export const openDiskSelectionDialog = 打开磁盘选择对话框;

/**
 * 打开Everything搜索对话框
 * 
 * @function 打开Everything搜索对话框
 * @param {Object} protyle - 编辑器实例
 * @param {Object} pluginInstance - 插件实例
 */
export function 打开Everything搜索对话框(protyle, pluginInstance) {
    使用API配置打开对话框(protyle, 'everything', 'everything搜索', pluginInstance);
}

export const openEverythingDialog = 打开Everything搜索对话框;

/**
 * 打开Anytxt搜索对话框
 * 
 * @function 打开Anytxt搜索对话框
 * @param {Object} protyle - 编辑器实例
 * @param {Object} pluginInstance - 插件实例
 */
export function 打开Anytxt搜索对话框(protyle, pluginInstance) {
    使用API配置打开对话框(protyle, 'anytxt', 'anytxt搜索', pluginInstance);
}

export const openAnytxtDialog = 打开Anytxt搜索对话框;

/**
 * 注册斜杠菜单项
 * 
 * @function 注册斜杠菜单项
 * @param {Object} pluginInstance - 插件实例
 * @returns {Array} 斜杠菜单项数组
 */
export function 注册斜杠菜单项(pluginInstance) {
    检查思源环境();
    
    let slashItems = [
        {
            filter: ['file', 'everything'],
            html: '<div class="b3-list-item__first"><span class="b3-list-item__text">everything 搜索文件</span><span class="b3-list-item__meta">😊</span></div>',
            id: `sacFile-everything`,
            callback: (protyle) => 打开Everything搜索对话框(protyle, pluginInstance)
        },
        {
            filter: ['file', 'anytxt'],
            html: '<div class="b3-list-item__first"><span class="b3-list-item__text">anytxt 搜索文件</span><span class="b3-list-item__meta">😊</span></div>',
            id: "sacFile-anytxt",
            callback: (protyle) => 打开Anytxt搜索对话框(protyle, pluginInstance)
        }
    ];
    
    listLocalDisks().then(data => {
        // 清理旧的磁盘搜索相关菜单项
        slashItems = slashItems.filter(item => !item.id.startsWith("sacFile-localPath"));

        if (data.length > 3) {
            // 如果磁盘超过三个，添加一个选择磁盘的菜单项
            slashItems.push({
                filter: ['file', '选择磁盘'],
                html: `<div class="b3-list-item__first"><span class="b3-list-item__text">选择磁盘</span><span class="b3-list-item__meta">😊</span></div>`,
                id: "sacFile-localPath",
                callback: (protyle) => {
                    // 弹窗选择磁盘
                    使用本地路径打开对话框(protyle, '选择磁盘', pluginInstance);
                }
            });
        } else {
            // 否则，添加每个磁盘的搜索菜单项
            data.forEach(disk => {
                slashItems.push({
                    filter: ['file', '文件夹', 'folder', 'disk', `磁盘:${disk.name}`],
                    html: `<div class="b3-list-item__first"><span class="b3-list-item__text">搜索磁盘:${disk.name}</span><span class="b3-list-item__meta">😊</span></div>`,
                    id: "sacFile-localPath" + disk.name,
                    callback: (protyle) => {
                        使用本地路径打开对话框(protyle, disk.name + '/', pluginInstance);
                    }
                });
            });
        }
    });
    
    return slashItems;
}

export const registerSlashItems = 注册斜杠菜单项;

/**
 * 设置插件的斜杠菜单
 * 
 * @function 设置插件斜杠菜单
 * @param {Object} pluginInstance - 插件实例
 */
export function 设置插件斜杠菜单(pluginInstance) {
    检查思源环境();
    
    Object.defineProperty(pluginInstance, 'protyleSlash', {
        get: function() {
            return 注册斜杠菜单项(pluginInstance);
        }
    });
}

export const setPluginSlashMenu = 设置插件斜杠菜单;

/**
 * 显示人工智能配置对话框
 * 
 * @function 显示人工智能配置对话框
 * @param {Object} clientApi - 客户端API
 * @returns {Object} 对话框接口
 */
export function 显示人工智能配置对话框(clientApi) {
  // 获取对话框接口
  const dialogInterface = getDialogInterface();
  
  // 创建自定义对话框
  return dialogInterface.custom({
    type: 'custom',
    title: '人工智能配置',
    message: `
      <div class="b3-dialog__content">
        <div class="config-section">
          <label class="config-label">AI 类型</label>
          <select class="b3-select" id="ai-type-select">
            <option value="openai">OpenAI (ChatGPT)</option>
            <option value="deepai">DeepAI</option>
            <option value="perplexity">Perplexity</option>
            <option value="anthropic">Anthropic (Claude)</option>
          </select>
        </div>
        <div class="config-section">
          <label class="config-label">API密钥</label>
          <input class="b3-text-field fn__block" id="ai-api-key" type="password" placeholder="输入API密钥">
        </div>
        <div class="config-section">
          <label class="config-label">模型</label>
          <select class="b3-select" id="ai-model-select">
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            <option value="gpt-4">GPT-4</option>
            <option value="claude-instant-1">Claude Instant</option>
            <option value="claude-2">Claude 2</option>
          </select>
        </div>
        <div class="config-section">
          <label class="config-label">温度 (0.0-2.0)</label>
          <input class="b3-text-field fn__block" id="ai-temperature" type="number" min="0" max="2" step="0.1" value="0.7">
        </div>
        <div class="config-section">
          <label class="config-label">上下文最大标记数</label>
          <input class="b3-text-field fn__block" id="ai-max-tokens" type="number" min="100" max="8000" value="2000">
        </div>
      </div>
      <div class="b3-dialog__action">
        <button class="b3-button b3-button--cancel">取消</button>
        <button class="b3-button b3-button--text">确认</button>
      </div>
    `,
    width: '520px'
  });
} 