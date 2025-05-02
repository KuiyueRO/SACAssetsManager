import { createBrushModeHandlers } from "../../../../globalStatus/mode/brush.js";
import { 设置块属性 as setBlockAttrs } from "../../../../../src/toolBox/useAge/forSiyuan/useSiyuanBlock.js";
import { ref } from "../../../../../static/vue.esm-browser.js";

/**
 * 创建红色刷子处理器
 * 
 * 使用该工具可以将思源块的背景色设置为红色
 * 
 * @nodeCategory 工具/刷子
 * @nodeType tool
 * @nodeName 红色刷子
 * @nodeIcon fas fa-paint-brush
 * @example 点击工具后，鼠标变为红色刷子，点击思源块将其背景设置为红色
 * @example 按ESC键或右键点击可退出刷子模式
 * 
 * @returns {Object} 刷子处理器对象，包含启动和停止刷子模式的方法
 */
export const createColorBrushHandlers = () => {
  // 刷子模式状态
  const isBrushMode = ref(false);
  // 当前悬停的元素
  const currentHoverElement = ref(null);
  
  // 刷子颜色设置为红色
  const brushColor = "#ff0000";
  
  // 应用颜色样式
  const applyColorStyle = (element) => {
    if (!element) return;
    // 保存原始背景色以便恢复
    if (!element.dataset.originalBackground) {
      element.dataset.originalBackground = element.style.backgroundColor || '';
    }
    // 应用红色背景，使用半透明效果
    element.style.backgroundColor = brushColor + "80"; // 添加50%透明度
  };
  
  // 清除颜色样式
  const clearColorStyle = (element) => {
    if (!element) return;
    // 恢复原始背景色
    if (element.dataset.originalBackground) {
      element.style.backgroundColor = element.dataset.originalBackground;
    } else {
      element.style.backgroundColor = '';
    }
  };
  
  // 保存颜色样式到块属性
  const saveColorStyle = async (element) => {
    try {
      // 获取块ID
      const blockId = element.getAttribute('data-node-id');
      if (!blockId) return;
      
      // 设置背景色为红色（不透明）
      element.style.backgroundColor = brushColor;
      
      // 保存样式到块属性
      await setBlockAttrs(blockId, {
        style: element.style.cssText
      });
      
      console.log(`已将块 ${blockId} 的颜色设置为红色`);
    } catch (err) {
      console.error('保存颜色样式时出错:', err);
    }
  };

  // 创建刷子处理器
  const brushHandlers = createBrushModeHandlers({
    isBrushMode,
    currentHoverElement,
    onHover: {
      apply: applyColorStyle,
      cleanup: clearColorStyle
    },
    onClick: (element) => {
      applyColorStyle(element);
      saveColorStyle(element);
    },
    cursor: {
      type: 'element',
      value: (() => {
        const cursorWrapper = document.createElement('div');
        cursorWrapper.innerHTML = `
          <div style="display: flex; align-items: center; gap: 4px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="${brushColor}">
              <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16z"/>
            </svg>
            <span style="
              font-size: 12px;
              color: ${brushColor};
              background: rgba(255, 255, 255, 0.9);
              padding: 2px 6px;
              border-radius: 4px;
              white-space: nowrap;
              box-shadow: 0 1px 2px rgba(0,0,0,0.1);
            ">设置红色</span>
          </div>
        `;
        cursorWrapper.style.filter = 'drop-shadow(0 0 2px rgba(0,0,0,0.2))';
        return cursorWrapper;
      })(),
      offsetX: 8,
      offsetY: 8
    },
    // 查找目标块元素
    findTarget: (element) => {
      while (element && !element.hasAttribute('data-node-id')) {
        element = element.parentElement;
      }
      return element;
    }
  });

  /**
   * 启动刷子模式
   */
  const startBrushMode = () => {
    if (isBrushMode.value) return;
    isBrushMode.value = true;
    brushHandlers.addBrushListeners();
  };

  /**
   * 停止刷子模式
   */
  const stopBrushMode = () => {
    if (!isBrushMode.value) return;
    isBrushMode.value = false;
    brushHandlers.removeBrushListeners();
  };

  return {
    isBrushMode,
    startBrushMode,
    stopBrushMode
  };
}; 