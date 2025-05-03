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
const Dialog = clientApi.Dialog;
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
      // 不再使用 prompt 模拟，而是创建自定义对话框
      return new Promise((resolve) => {
        const dialogId = `select-dialog-${Date.now()}`;
        
        // 构建选项的 HTML
        const optionsHtml = options.items
          .map((item, index) => `
            <div class="b3-list-item">
              <label style="display: flex; align-items: center; padding: 5px 0;">
                <input type="radio" class="b3-radio" name="${dialogId}-radio" value="${item.value}" ${index === 0 ? 'checked' : ''}>
                <span class="fn__space"></span>
                <span>${item.label}</span>
              </label>
            </div>
          `)
          .join('');

        const dialog = new Dialog({
          title: options.title || '请选择',
          content: `
            <div class="b3-dialog__content">
              <div style="margin-bottom: 10px;">${options.message || '请选择一个选项:'}</div>
              <div class="fn__hr"></div>
              <div style="max-height: 300px; overflow-y: auto; margin-top: 10px;">
                ${optionsHtml}
              </div>
            </div>
          `,
          width: '400px', // 可根据需要调整宽度
          height: 'auto', // 高度自动
          destroyCallback: () => {
             // 如果对话框被销毁（例如点击关闭按钮），也认为是取消
             resolve(null);
          },
          buttons: [
            {
              text: '取消',
              className: 'b3-button--cancel',
              click: () => {
                dialog.destroy();
                resolve(null);
              }
            },
            {
              text: '确认',
              className: 'b3-button--primary',
              hotkey: 'enter',
              click: () => {
                const selectedRadio = dialog.element.querySelector(`input[name="${dialogId}-radio"]:checked`);
                if (selectedRadio) {
                  dialog.destroy();
                  resolve(selectedRadio.value);
                } else {
                  // 如果没有选中项，可以给个提示或默认返回 null
                  clientApi?.showMessage('请选择一个选项', 3000, 'error');
                  // 或者 resolve(null);
                }
              }
            }
          ]
        });
        // 确保第一个选项是可见的
        dialog.element.querySelector('input[type="radio"]')?.focus();
      });
      
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
  // 不再使用 showMessage 模拟，创建真正的进度对话框
  const dialogId = `task-dialog-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  const messageElementId = `task-message-${dialogId}`;
  const progressElementId = `task-progress-${dialogId}`;

  const dialog = new Dialog({
    title: title || '任务进行中',
    content: `
      <div class="b3-dialog__content" style="display: flex; flex-direction: column; gap: 10px;">
        <div id="${messageElementId}" style="word-break: break-all;">${initMessage}</div>
        <progress id="${progressElementId}" class="b3-progress" value="0" max="100" style="width: 100%;"></progress>
      </div>
    `,
    width: '450px', // 适当宽度
    height: 'auto',
    destroyCallback: () => {
      // 对话框被外部关闭时的处理，目前接口没有定义取消操作，所以仅记录
      console.log(`Task controller dialog [${title}] closed externally.`);
    },
    // 暂时不添加按钮，如果需要取消功能可以后续添加
    // buttons: [] 
  });

  const messageElement = dialog.element.querySelector(`#${messageElementId}`);
  const progressElement = dialog.element.querySelector(`#${progressElementId}`);

  return {
    /**
     * 更新进度
     * @param {number} percent 进度百分比（0-100）
     * @param {string} message 进度消息
     */
    updateProgress: (percent, message) => {
      if (messageElement) {
        messageElement.textContent = message;
      }
      if (progressElement) {
        progressElement.value = Math.max(0, Math.min(100, percent)); // 确保在 0-100 之间
      }
    },
    
    /**
     * 销毁控制器
     */
    destroy: () => {
      // 可以选择在销毁前显示一个完成消息，或者直接关闭
      // if (messageElement) {
      //   messageElement.textContent = '任务已完成';
      // }
      // if (progressElement) {
      //   progressElement.value = 100;
      // }
      // setTimeout(() => dialog.destroy(), 500); // 延迟关闭以显示完成状态
      dialog.destroy();
    }
  };
} 