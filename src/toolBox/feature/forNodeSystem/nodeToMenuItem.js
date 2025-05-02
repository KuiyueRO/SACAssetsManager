/**
 * 节点到菜单项转换模块
 * 
 * 将节点定义转换为菜单项，支持用户交互和进度显示
 * 
 * @module nodeToMenuItem
 * @date 2025-05-07 07:45
 * @author 织
 */

import { getDialogInterface } from '../forUI/interfaces/baseDialogInterface.js';
import { getTaskControllerFactory } from '../forUI/interfaces/taskControllerInterface.js';
import { 渲染模板 } from '../../../toolBox/useAge/forText/useArtTemplate.js';

/**
 * 将节点定义转换为菜单项
 * 
 * 此函数将节点定义对象转换为可用于菜单的函数，处理用户交互和进度显示
 * 
 * @param {Object} nodeDefine 节点定义对象
 * @returns {Function} 菜单项生成函数，接收options对象并返回菜单项配置
 */
export function nodeDefine2MenuItem(nodeDefine) {
  return (options) => {
    return {
      label: nodeDefine.nodeName || nodeDefine.name,
      click: async () => {
        // 获取对话框接口和任务控制器工厂
        const dialogInterface = getDialogInterface();
        const taskControllerFactory = getTaskControllerFactory();
        
        const localPath = options.data.localPath;
        if (!localPath) {
          console.error('无法获取本地路径');
          return;
        }
        
        // 准备模板数据
        const templateData = {
          path: localPath,
        };
        
        // 处理用户交互
        if (nodeDefine.interactions) {
          for (const interaction of nodeDefine.interactions) {
            // 确认对话框交互
            if (interaction.type === 'confirm') {
              const prompt = await 渲染模板(interaction.prompt, templateData);
              const title = interaction.title || '确认操作';
              
              // 使用接口中的确认对话框
              const confirmed = await dialogInterface.confirm(prompt, title);
              if (!confirmed) return; // 用户取消，中止操作
            } 
            // 输入对话框交互
            else if (interaction.type === 'input') {
              const prompt = await 渲染模板(interaction.prompt, templateData);
              const dialogConfig = {
                title: interaction.title || '请输入',
                text: prompt,
                placeholder: interaction.placeholder || '',
                value: interaction.defaultValue || ''
              };
              
              // 使用接口中的输入对话框
              const userInput = await dialogInterface.prompt(prompt, dialogConfig.value, dialogConfig.title);
              if (userInput === null) return; // 用户取消，中止操作
              
              // 将用户输入保存到模板数据中
              const outputField = interaction.outputField || 'userInput';
              templateData[outputField] = userInput;
            }
          }
        }
        
        // 创建任务控制器
        let taskController = null;
        if (nodeDefine.showProgress) {
          // 使用任务控制器工厂创建控制器
          taskController = await taskControllerFactory.createTaskController(
            nodeDefine.progressTitle || '执行中',
            nodeDefine.progressInitMessage || '正在处理...'
          );
          
          if (!taskController) {
            console.error(`无法创建任务控制器: ${nodeDefine.nodeName}`);
            return;
          }
        }
        
        try {
          // 执行节点处理函数
          const result = await nodeDefine.execute({
            ...templateData,
            taskController,
            updateProgress: taskController ? 
              (percent, message) => taskController.updateProgress(percent, message) : 
              null
          });
          
          // 处理结果
          if (taskController) {
            if (result && result.message) {
              taskController.updateProgress(100, result.message);
            } else {
              taskController.updateProgress(100, '操作已完成');
            }
            
            // 延迟关闭任务控制器
            setTimeout(() => {
              taskController.destroy();
            }, 1500);
          }
          
          return result;
        } catch (error) {
          console.error('执行节点处理函数时出错:', error);
          
          // 显示错误信息
          if (taskController) {
            taskController.updateProgress(0, `出错: ${error.message || '未知错误'}`);
            
            // 延迟关闭任务控制器
            setTimeout(() => {
              taskController.destroy();
            }, 3000);
          }
          
          return { error };
        }
      }
    };
  };
}

/**
 * 将菜单项转换为节点定义
 * 
 * 待实现
 * 
 * @param {Object} menuItem 菜单项对象
 * @returns {Object} 节点定义对象
 */
export function menuItem2NodeDefine(menuItem) {
  // TODO: 实现菜单项到节点定义的转换
  throw new Error('菜单项到节点定义的转换尚未实现');
}

/**
 * 导出所有函数
 */
export default {
  nodeDefine2MenuItem,
  menuItem2NodeDefine
}; 