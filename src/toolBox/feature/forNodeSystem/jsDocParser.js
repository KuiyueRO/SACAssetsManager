/**
 * JSDoc解析器扩展 - 用于节点系统
 * 
 * 本模块扩展了标准JSDoc解析器，添加了对节点交互和可见性标签的支持
 * 
 * @module jsDocParser
 * @date 2025-05-01 21:49
 * @author 织
 */

import { 解析JSDoc配置 } from '../../feature/forCodeAnalysis/jsParser.js';

/**
 * 解析JSDoc配置并提取节点相关的特殊标签
 * 
 * @param {string} code 源代码
 * @param {string} exportName 导出函数名
 * @returns {Object} 扩展的JSDoc配置
 */
export function parseNodeJSDoc(code, exportName) {
  // 使用基础JSDoc解析器获取配置
  const baseConfig = 解析JSDoc配置(code, exportName);
  
  // 扩展配置对象，添加节点系统特有的字段
  const extendedConfig = {
    ...baseConfig,
    interactions: [],
    showProgress: false,
    progressTitle: '',
    progressInitMessage: '',
    visibility: 'both', // 默认在流程编辑器和工具面板中都显示
  };
  
  // 处理节点交互标签
  if (baseConfig.tags.nodeInteraction) {
    baseConfig.tags.nodeInteraction.forEach(interactionStr => {
      const [type, ...promptParts] = interactionStr.split(' ');
      const prompt = promptParts.join(' ');
      
      if (type && prompt) {
        extendedConfig.interactions.push({
          type: type.toLowerCase(),
          prompt,
          title: extractTitleFromInteraction(type, prompt),
          outputField: extractOutputFieldFromInteraction(prompt)
        });
      }
    });
  }
  
  // 处理进度显示标签
  if (baseConfig.tags.nodeProgress) {
    extendedConfig.showProgress = true;
    const progressTitle = baseConfig.tags.nodeProgress[0];
    
    if (progressTitle) {
      extendedConfig.progressTitle = progressTitle;
      extendedConfig.progressInitMessage = baseConfig.tags.nodeProgressInit?.[0] || '正在处理...';
    }
  }
  
  // 处理节点可见性标签
  if (baseConfig.tags.nodeVisibility && baseConfig.tags.nodeVisibility[0]) {
    const visibility = baseConfig.tags.nodeVisibility[0].toLowerCase();
    if (['flow', 'panel', 'both'].includes(visibility)) {
      extendedConfig.visibility = visibility;
    }
  }
  
  return extendedConfig;
}

/**
 * 从交互提示中提取标题
 * @private
 * @param {string} type 交互类型
 * @param {string} prompt 提示文本
 * @returns {string} 标题文本
 */
function extractTitleFromInteraction(type, prompt) {
  // 提取标题（可以根据交互类型设置不同的默认标题）
  if (type.toLowerCase() === 'confirm') {
    return '确认操作';
  } else if (type.toLowerCase() === 'input') {
    return '请输入';
  }
  return '';
}

/**
 * 从交互提示中提取输出字段名
 * @private
 * @param {string} prompt 提示文本
 * @returns {string|null} 输出字段名或null
 */
function extractOutputFieldFromInteraction(prompt) {
  // 尝试从提示文本中提取输出字段名，格式例如: "输入名称 => fieldName"
  const match = prompt.match(/=>\s*(\w+)/);
  return match ? match[1] : null;
}

/**
 * 将JSDoc配置转换为节点定义
 * 
 * @param {Object} jsDocConfig 扩展的JSDoc配置
 * @param {Object} module 模块对象
 * @param {string} exportName 导出函数名
 * @returns {Object} 节点定义
 */
export function jsDoc2NodeDefine(jsDocConfig, module, exportName) {
  const {
    inputTypes, 
    outputTypes, 
    defaultValues, 
    interactions, 
    showProgress,
    progressTitle,
    progressInitMessage,
    visibility,
    description,
    tags
  } = jsDocConfig;
  
  // 获取原始函数
  let processFunc = module[exportName];
  
  // 如果有交互配置或需要显示进度，包装函数
  if (interactions?.length > 0 || showProgress) {
    processFunc = wrapBatchFunction(processFunc, {
      interactions,
      showProgress,
      progressTitle,
      progressInitMessage
    });
  }
  
  // 获取节点类别
  const category = tags.nodeCategory?.[0] || 'default';
  
  // 创建节点定义
  return {
    flowType: 'process',
    inputs: inputTypes || {},
    outputs: outputTypes || {
      $result: { type: 'any', label: '结果' }
    },
    process: processFunc,
    description: description || '',
    category,
    visibility: visibility || 'both', // 默认同时在流程和面板中显示
    interactive: !!(interactions?.length > 0 || showProgress),
    nodeName: tags.nodeName?.[0] || exportName,
    icon: tags.nodeIcon?.[0] || undefined
  };
}

/**
 * 包装批处理函数，添加交互功能
 * 
 * @param {Function} func 原始函数
 * @param {Object} options 选项
 * @param {Array} [options.interactions] 交互定义
 * @param {boolean} [options.showProgress] 是否显示进度
 * @param {string} [options.progressTitle] 进度对话框标题
 * @param {string} [options.progressInitMessage] 进度初始消息
 * @returns {Function} 包装后的函数
 */
export function wrapBatchFunction(func, options) {
  const { interactions, showProgress, progressTitle, progressInitMessage } = options;
  
  return async (inputs, taskController) => {
    // 如果已经提供了任务控制器，直接使用
    let ownTaskController = false;
    let controller = taskController;
    
    try {
      // 准备模板数据
      const templateData = {};
      
      // 从输入中提取模板数据
      Object.entries(inputs).forEach(([key, input]) => {
        templateData[key] = input.value;
      });
      
      // 处理用户交互
      if (interactions && interactions.length > 0) {
        // 导入需要的模块
        const { confirmAsPromise } = await import('../../base/useEnv/siyuanDialog.js');
        const { showInputDialogPromise } = await import('../../UI/dialog/inputDialog.js');
        const { 渲染模板 } = await import('../../useAge/forText/useArtTemplate.js');
        
        for (const interaction of interactions) {
          // 确认对话框交互
          if (interaction.type === 'confirm') {
            // 渲染提示消息中的变量
            const prompt = await 渲染模板(interaction.prompt, templateData);
            const title = interaction.title || '确认操作';
            const confirmed = await confirmAsPromise(title, prompt);
            if (!confirmed) {
              // 用户取消，中止操作
              return { cancelled: true, message: '用户取消了操作' };
            }
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
            
            try {
              const userInput = await showInputDialogPromise(dialogConfig);
              if (userInput === null) {
                // 用户取消，中止操作
                return { cancelled: true, message: '用户取消了输入' };
              }
              
              // 将用户输入保存到模板数据和输入中
              const outputField = interaction.outputField || 'userInput';
              templateData[outputField] = userInput;
              inputs[outputField] = { value: userInput };
            } catch (error) {
              // 处理对话框错误
              console.error('输入对话框错误:', error);
              return { error: true, message: '获取用户输入时出错' };
            }
          }
        }
      }
      
      // 如果需要显示进度，且没有提供任务控制器，创建一个
      if (showProgress && !controller) {
        try {
          // 导入任务控制器
          const { 打开任务控制对话框 } = await import('../../UI/dialog/tasks.js');
          controller = await 打开任务控制对话框(
            progressTitle || '执行中',
            progressInitMessage || '正在处理...'
          );
          
          if (!controller) {
            console.error('无法创建任务控制器');
            // 继续执行，但不显示进度
          } else {
            ownTaskController = true;
          }
        } catch (error) {
          console.error('创建任务控制器失败:', error);
          // 继续执行，但不显示进度
        }
      }
      
      // 执行原始函数，传入输入和任务控制器
      const result = await func(inputs, controller);
      
      return result;
    } catch (error) {
      console.error('执行批处理函数出错:', error);
      return { error: true, message: error.message || '执行批处理函数时出错' };
    } finally {
      // 如果是自己创建的任务控制器，在完成后关闭它
      if (ownTaskController && controller && controller.destroy) {
        setTimeout(() => {
          controller.destroy();
        }, 500); // 延迟关闭，避免闪烁
      }
    }
  };
} 