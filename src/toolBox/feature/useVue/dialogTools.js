/**
 * Vue对话框工具模块
 * 
 * 提供用于创建和管理基于Vue组件的对话框功能。
 * 这些工具简化了在插件中使用Vue组件作为对话框内容的过程。
 */

import { initVueApp } from './vueComponentLoader.js';
import { getDialogInterface } from '../forUI/interfaces/baseDialogInterface.js';

/**
 * 打开包含Vue组件的对话框
 * @param {string} appURL 组件路径
 * @param {string} name 组件名称
 * @param {Object} [mixinOptions={}] 混入选项
 * @param {Function} [onDialogCreated=null] 对话框创建后的回调函数
 * @param {Object} [dialogOptions={}] 对话框选项
 * @param {string} [title=''] 对话框标题
 * @param {string} [width='200px'] 对话框宽度
 * @param {string} [height='auto'] 对话框高度
 * @param {boolean} [transparent=true] 是否透明背景
 * @returns {Promise<{app: Vue.App, dialog: Object}>} 返回Vue应用和对话框实例
 */
export async function openVueDialog(
    appURL, 
    name, 
    mixinOptions = {}, 
    onDialogCreated = null,
    dialogOptions = {},
    title = '', 
    width = '200px', 
    height = 'auto', 
    transparent = true
) {
    const dialogInterface = getDialogInterface();
    
    // 应用Vue组件
    const app = await initVueApp(
        appURL,
        name,
        mixinOptions
    );

    // 创建自定义对话框
    const dialog = await dialogInterface.custom({
        type: 'custom',
        title,
        message: '<div id="vue-dialog-container"></div>',
        width,
        height,
        transparent,
        ...dialogOptions
    });
    
    // 找到容器元素并挂载Vue应用
    const containerEl = document.getElementById('vue-dialog-container');
    if (containerEl) {
        app.mount(containerEl);
    } else {
        console.error('找不到Vue对话框容器元素');
    }
    
    // 调用对话框创建后的回调函数
    if (onDialogCreated) {
        onDialogCreated(dialog);
    }
    
    return { app, dialog };
}

/**
 * 创建任务对话框
 * @param {Object} clientApi 思源API客户端实例
 * @param {string} taskVueComponentPath 任务组件路径
 * @param {Object} taskController 任务控制器实例
 * @param {string} [taskTitle='批处理'] 任务标题
 * @param {string} [taskDescription='任务执行中'] 任务描述
 * @param {string} [width='70vw'] 对话框宽度
 * @param {string} [height='auto'] 对话框高度
 * @returns {Promise<{app: Vue.App, dialog: Dialog}>} 返回Vue应用和对话框实例
 */
export async function openTaskDialog(
    clientApi,
    taskVueComponentPath,
    taskController,
    taskTitle = '批处理',
    taskDescription = '任务执行中',
    width = '70vw',
    height = 'auto'
) {
    try {
        // 将 taskTitle, taskDescription, taskController 通过 mixinOptions 传递
        const componentData = {
            taskTitle,
            taskDescription,
            taskController
        };
        
        const { app, dialog } = await openVueDialog(
            taskVueComponentPath,
            'TaskDialog', // 组件名通常固定，除非加载器需要
            componentData, // <--- 通过 mixinOptions 传递数据
            null,          // onDialogCreated 回调
            {},            // dialogOptions (用于对话框样式，这里用默认)
            taskTitle,     // 对话框标题
            width,
            height
        );
        
        // 设置destroyCallback
        if (dialog) {
            dialog.destroyCallback = () => {
                // 确保 taskController 存在且有 destroy 方法
                if (taskController && typeof taskController.destroy === 'function') {
                     taskController.destroy();
                }
            };
        }
        
        // 返回值保持不变，包含 app, dialog, taskController
        return { app, dialog, taskController };
    } catch (error) {
        console.error('打开任务对话框失败:', error);
        // 向上抛出错误，让 useTaskQueue 能捕获到
        throw error; 
    }
}

// 英文别名
export const openVueDialogWithComponent = openVueDialog;
export const openTaskProgressDialog = openTaskDialog; 