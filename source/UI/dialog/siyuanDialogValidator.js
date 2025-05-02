/**
 * 思源笔记对话框接口校验器
 * 
 * 校验对话框接口实现是否符合思源笔记的期望
 * 
 * @module siyuanDialogValidator
 * @date 2025-05-07 17:30
 * @author 织
 */

/**
 * 校验对话框接口实现
 * @param {Object} dialogInterface 需要校验的对话框接口
 * @returns {Object} 校验结果，包含isValid和errors字段
 */
export function validateDialogInterface(dialogInterface) {
  const errors = [];
  
  // 检查必要的方法是否存在
  const requiredMethods = ['alert', 'confirm', 'prompt'];
  
  for (const method of requiredMethods) {
    if (typeof dialogInterface[method] !== 'function') {
      errors.push(`缺少必要的方法: ${method}`);
    }
  }
  
  // 检查方法签名
  if (typeof dialogInterface.alert === 'function') {
    if (dialogInterface.alert.length < 1) {
      errors.push('alert方法至少需要1个参数(message)');
    }
  }
  
  if (typeof dialogInterface.confirm === 'function') {
    if (dialogInterface.confirm.length < 1) {
      errors.push('confirm方法至少需要1个参数(message)');
    }
  }
  
  if (typeof dialogInterface.prompt === 'function') {
    if (dialogInterface.prompt.length < 1) {
      errors.push('prompt方法至少需要1个参数(message)');
    }
  }
  
  // 对照思源笔记Dialog类的特性进行验证
  // 思源的Dialog类会返回一个Dialog实例，而我们的接口返回Promise
  // 所以我们需要确保所有方法都返回Promise
  
  const asyncMethods = ['alert', 'confirm', 'prompt', 'custom'];
  
  for (const method of asyncMethods) {
    if (typeof dialogInterface[method] === 'function') {
      // 检查方法是否是异步函数或返回Promise
      const isAsync = dialogInterface[method].constructor.name === 'AsyncFunction' ||
                      dialogInterface[method].toString().includes('return new Promise');
      
      if (!isAsync) {
        errors.push(`${method}方法必须是异步函数或返回Promise`);
      }
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * 验证并注册对话框接口
 * @param {Object} dialogInterface 对话框接口实现
 * @param {Function} registerFn 注册函数
 * @returns {boolean} 是否成功注册
 */
export function validateAndRegister(dialogInterface, registerFn) {
  const validation = validateDialogInterface(dialogInterface);
  
  if (validation.isValid) {
    registerFn(dialogInterface);
    console.log('对话框接口验证通过并成功注册');
    return true;
  } else {
    console.error('对话框接口验证失败:', validation.errors);
    return false;
  }
}

/**
 * 将思源笔记的Dialog类API适配为我们的对话框接口
 * @param {Object} siyuanDialog 思源笔记对话框API
 * @returns {Object} 适配后的对话框接口
 */
export function adaptSiyuanDialogToInterface(siyuanDialog) {
  return {
    alert: async (message, title = '提示') => {
      return new Promise((resolve) => {
        const dialog = new siyuanDialog({
          title,
          content: `<div class="b3-dialog__content">${message}</div>`,
          width: '400px',
        });
        
        dialog.element.querySelector('.b3-dialog__action').innerHTML = `
          <button class="b3-button b3-button--primary">确定</button>
        `;
        
        dialog.element.querySelector('.b3-button--primary').addEventListener('click', () => {
          dialog.destroy();
          resolve();
        });
      });
    },
    
    confirm: async (message, title = '确认') => {
      return new Promise((resolve) => {
        const dialog = new siyuanDialog({
          title,
          content: `<div class="b3-dialog__content">${message}</div>`,
          width: '400px',
        });
        
        dialog.element.querySelector('.b3-dialog__action').innerHTML = `
          <button class="b3-button">取消</button>
          <button class="b3-button b3-button--primary">确定</button>
        `;
        
        dialog.element.querySelector('.b3-button').addEventListener('click', () => {
          dialog.destroy();
          resolve(false);
        });
        
        dialog.element.querySelector('.b3-button--primary').addEventListener('click', () => {
          dialog.destroy();
          resolve(true);
        });
      });
    },
    
    prompt: async (message, defaultValue = '', title = '请输入') => {
      return new Promise((resolve) => {
        const dialog = new siyuanDialog({
          title,
          content: `
            <div class="b3-dialog__content">
              <div class="b3-dialog__text">${message}</div>
              <input class="b3-text-field fn__block" value="${defaultValue}">
            </div>
          `,
          width: '400px',
        });
        
        const inputElement = dialog.element.querySelector('.b3-text-field');
        
        dialog.element.querySelector('.b3-dialog__action').innerHTML = `
          <button class="b3-button">取消</button>
          <button class="b3-button b3-button--primary">确定</button>
        `;
        
        dialog.bindInput(inputElement, () => {
          const value = inputElement.value;
          dialog.destroy();
          resolve(value);
        });
        
        dialog.element.querySelector('.b3-button').addEventListener('click', () => {
          dialog.destroy();
          resolve(null);
        });
        
        dialog.element.querySelector('.b3-button--primary').addEventListener('click', () => {
          const value = inputElement.value;
          dialog.destroy();
          resolve(value);
        });
      });
    },
    
    custom: async (options) => {
      // 根据options.type调用对应的方法
      switch (options.type) {
        case 'confirm':
          return this.confirm(options.message, options.title);
        case 'prompt':
          return this.prompt(options.message, options.input?.defaultValue || '', options.title);
        default:
          console.warn(`不支持的自定义对话框类型: ${options.type}`);
          return null;
      }
    }
  };
}