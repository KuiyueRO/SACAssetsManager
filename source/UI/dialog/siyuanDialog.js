/**
 * 思源笔记对话框实现
 * 
 * 使用思源笔记客户端API实现基础对话框接口
 * 
 * @module siyuanDialog
 * @date 2025-05-07 10:45
 * @author 织
 */

// 获取思源笔记客户端API，此处使用全局符号获取
const clientApi = globalThis[Symbol.for(`siyuanClientApi`)];

/**
 * 显示简单消息框
 * @param {string} message 消息内容
 * @param {string} [title='提示'] 标题
 * @returns {Promise<void>} Promise
 */
export async function alert(message, title = '提示') {
  return new Promise((resolve) => {
    clientApi.confirm(title, message, () => {
      resolve();
    });
  });
}

/**
 * 显示确认对话框（是/否）
 * @param {string} message 消息内容
 * @param {string} [title='确认'] 标题
 * @returns {Promise<boolean>} 用户选择结果
 */
export async function confirm(message, title = '确认') {
  return new Promise((resolve) => {
    clientApi.confirm(title, message, () => {
      resolve(true);
    }, () => {
      resolve(false);
    });
  });
}

/**
 * 显示带输入框的对话框
 * @param {string} message 消息内容
 * @param {string} [defaultValue=''] 默认值
 * @param {string} [title='请输入'] 标题
 * @returns {Promise<string|null>} 用户输入内容或null（用户取消）
 */
export async function prompt(message, defaultValue = '', title = '请输入') {
  return new Promise((resolve) => {
    // 思源的prompt有点特殊，message是标题，defaultValue是提示文本
    clientApi.prompt(title, defaultValue, (value) => {
      if (value === null) {
        resolve(null);
      } else {
        resolve(value);
      }
    }, (value) => {
      // 点击取消按钮
      resolve(null);
    });
  });
}

/**
 * 显示自定义对话框
 * @param {Object} options 对话框选项
 * @param {string} options.type 对话框类型
 * @param {string} options.message 消息内容
 * @param {string} [options.title] 标题
 * @param {Object} [options.buttons] 按钮配置
 * @param {Object} [options.input] 输入框配置
 * @returns {Promise<any>} 对话框结果
 */
export async function custom(options) {
  switch (options.type) {
    case 'confirm':
      return confirm(options.message, options.title);
      
    case 'prompt':
      return prompt(
        options.message,
        options.input?.defaultValue || '',
        options.title
      );
      
    case 'select':
      // 思源笔记没有原生的选择对话框，降级为提示用户选择
      console.warn('思源笔记不支持原生选择对话框，降级为提示用户选择');
      
      // 构建选项文本
      const selectText = options.items
        .map((item, index) => `${index + 1}. ${item.label}`)
        .join('\n');
      
      const promptText = `${options.message}\n\n${selectText}\n\n请输入序号:`;
      const userInput = await prompt(promptText, '', options.title);
      
      if (userInput === null) return null;
      
      const index = parseInt(userInput) - 1;
      if (isNaN(index) || index < 0 || index >= options.items.length) {
        return null;
      }
      
      return options.items[index].value;
      
    default:
      console.warn(`不支持的对话框类型: ${options.type}`);
      return null;
  }
}

/**
 * 创建任务控制器（进度对话框）
 * @param {string} title 标题
 * @param {string} initMessage 初始消息
 * @returns {Promise<Object|null>} 任务控制器对象
 */
export async function taskController(title, initMessage) {
  // 思源笔记目前没有原生的任务控制器/进度对话框
  // 这里提供一个基于showMessage的简单实现
  
  let messageTimeout = null;
  let lastMessage = null;
  
  // 创建一个唯一的消息ID
  const messageId = `task-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  
  // 显示初始消息
  clientApi.showMessage(`${title}: ${initMessage}`, 0, messageId);
  
  return {
    /**
     * 更新进度
     * @param {number} percent 进度百分比（0-100）
     * @param {string} message 进度消息
     */
    updateProgress: (percent, message) => {
      // 清除前一个超时
      if (messageTimeout) {
        clearTimeout(messageTimeout);
        messageTimeout = null;
      }
      
      // 构建消息文本
      const progressText = `${title}: ${percent}% ${message}`;
      
      // 避免频繁更新相同消息
      if (lastMessage !== progressText) {
        lastMessage = progressText;
        clientApi.showMessage(progressText, 0, messageId);
      }
    },
    
    /**
     * 销毁控制器
     */
    destroy: () => {
      // 清除消息
      if (messageTimeout) {
        clearTimeout(messageTimeout);
        messageTimeout = null;
      }
      
      // 显示完成消息，3秒后自动消失
      clientApi.showMessage(`${title}: 已完成`, 3000, messageId);
    }
  };
} 