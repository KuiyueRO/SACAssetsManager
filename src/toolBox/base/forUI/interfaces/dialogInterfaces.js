/**
 * 对话框交互接口定义
 * 
 * 提供统一的对话框交互接口，用于解耦toolBox与具体UI实现
 * 
 * @module dialogInterfaces
 * @date 2025-05-07 07:28
 * @author 织
 */

/**
 * 对话框交互接口定义
 * @typedef {Object} DialogInterfaces
 * @property {Function} confirmDialog - 确认对话框函数，接收标题和消息，返回布尔值Promise
 * @property {Function} inputDialog - 输入对话框函数，接收配置对象，返回用户输入的字符串或null的Promise
 * @property {Function} taskController - 任务控制器创建函数，接收标题和初始消息，返回任务控制器对象的Promise
 */

/**
 * 创建一个空的对话框接口实现
 * 
 * 返回的接口实现包含默认实现，确保在未注册具体实现时也能正常工作
 * 
 * @returns {DialogInterfaces} 空的对话框接口实现
 */
export function createEmptyDialogInterfaces() {
  return {
    /**
     * 默认确认对话框实现，总是返回true
     * @param {string} title 标题
     * @param {string} message 消息
     * @returns {Promise<boolean>} 用户确认结果的Promise
     */
    confirmDialog: async (title, message) => {
      console.warn(`未注册确认对话框实现，标题: ${title}, 消息: ${message}`);
      return true;
    },
    
    /**
     * 默认输入对话框实现，总是返回null
     * @param {Object} config 配置对象
     * @param {string} config.title 标题
     * @param {string} config.text 提示文本
     * @param {string} [config.placeholder] 输入框占位文本
     * @param {string} [config.value] 默认值
     * @returns {Promise<string|null>} 用户输入的字符串或null的Promise
     */
    inputDialog: async (config) => {
      console.warn(`未注册输入对话框实现，配置: ${JSON.stringify(config)}`);
      return null;
    },
    
    /**
     * 默认任务控制器创建函数，返回空对象
     * @param {string} title 任务标题
     * @param {string} [initMessage] 初始消息
     * @returns {Promise<Object|null>} 任务控制器对象或null的Promise
     */
    taskController: async (title, initMessage) => {
      console.warn(`未注册任务控制器实现，标题: ${title}, 初始消息: ${initMessage}`);
      return {
        updateProgress: (percent, message) => {
          console.log(`任务进度: ${percent}%, 消息: ${message}`);
        },
        destroy: () => {
          console.log('销毁任务控制器');
        }
      };
    }
  };
}

/**
 * 全局对话框接口实例
 * 
 * 在应用初始化时会被注册具体实现
 * 
 * @type {DialogInterfaces}
 */
export const globalDialogInterfaces = createEmptyDialogInterfaces();

/**
 * 注册对话框接口实现
 * 
 * 在应用初始化时调用此函数注册具体环境的对话框实现
 * 
 * @param {DialogInterfaces} interfaces 对话框接口实现
 */
export function registerDialogInterfaces(interfaces) {
  Object.assign(globalDialogInterfaces, interfaces);
  console.log('对话框接口已注册');
}

/**
 * 创建自定义对话框接口
 * 
 * 用于创建特定场景的对话框接口，例如测试或特殊UI
 * 
 * @param {Object} options 自定义选项
 * @param {Function} [options.confirmDialog] 自定义确认对话框
 * @param {Function} [options.inputDialog] 自定义输入对话框
 * @param {Function} [options.taskController] 自定义任务控制器
 * @returns {DialogInterfaces} 自定义对话框接口
 */
export function createCustomDialogInterfaces(options = {}) {
  return {
    ...createEmptyDialogInterfaces(),
    ...options
  };
} 