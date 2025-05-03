/**
 * AI 配置相关 UI 函数
 *
 * @module showAIConfigDialog
 */

import { getDialogInterface } from '../../interfaces/dialogInterfaces.js';

/**
 * 显示人工智能配置对话框
 *
 * @function showAIConfigDialog
 * @param {Object} clientApi - (未使用) 客户端 API，保留可能是为了未来的扩展
 * @returns {Object} 对话框实例
 */
export function showAIConfigDialog(clientApi) {
  // 获取对话框接口
  const dialogInterface = getDialogInterface();

  // TODO: 将硬编码的 HTML 提取为模板字符串常量或独立文件
  // TODO: 将对话框的按钮逻辑（如确认、取消）移交给调用方或通过回调处理
  // TODO: 使用 i18n 处理所有文本
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
    width: '520px' // TODO: 可配置
  });
} 