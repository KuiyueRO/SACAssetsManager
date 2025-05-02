import { ref, computed, watch, onMounted, onUnmounted } from '../../../static/vue.esm-browser.js';
import { getDialogInterface } from '../../../src/toolBox/feature/forUI/interfaces/baseDialogInterface.js';

export function useFloatablePanel() {
  // 浮动状态
  const isFloating = ref(false);
  // 浮动窗口实例
  const floatDialog = ref(null);
  // 浮动的内容类型
  const floatingContent = ref(null); // 'customizer' | 'preview' | null
  // 可用宽度阈值
  const widthThreshold = ref(768);
  // 浮动面板内容的Vue实例
  const floatApp = ref(null);
  
  // 当前容器宽度
  const containerWidth = ref(0);
  
  // 自动决定是否应该浮动
  const shouldFloat = computed(() => {
    return containerWidth.value > 0 && containerWidth.value < widthThreshold.value;
  });
  
  // 创建浮动面板
  const createFloatPanel = async (content, title, componentURL, props = {}) => {
    if (isFloating.value && floatDialog.value) {
      closeFloatPanel();
    }
    
    floatingContent.value = content;
    
    // 获取对话框接口
    const dialogInterface = getDialogInterface();
    
    // 创建唯一的容器ID
    const containerId = `floatablePanel_${Date.now()}`;
    
    // 创建对话框
    const dialog = await dialogInterface.custom({
      type: 'custom',
      title: title || "SVG生成器",
      message: `
        <div id="${containerId}" 
          class="floatable-content fn__flex-column" 
          style="pointer-events:auto;z-index:5;height:100%">
        </div>
      `,
      width: '380px',
      height: '520px'
    });
    
    // 获取容器元素
    const container = document.getElementById(containerId);
    if (!container) {
      console.error('找不到浮动面板容器元素');
      return null;
    }
    
    // 加载组件到浮动面板
    try {
      const module = await import(componentURL);
      const app = Vue.createApp(module.default, {
        ...props,
        isFloating: true,
        onClose: () => {
          closeFloatPanel();
        }
      });
      app.mount(container);
      floatApp.value = app;
    } catch (error) {
      console.error('加载组件到浮动面板失败:', error);
    }
    
    floatDialog.value = dialog;
    isFloating.value = true;
    
    return { dialog, content };
  };
  
  // 关闭浮动面板
  const closeFloatPanel = () => {
    if (floatDialog.value) {
      // 对于自定义对话框，可能需要调用特定的关闭方法
      if (typeof floatDialog.value.destroy === 'function') {
        floatDialog.value.destroy();
      } else if (typeof floatDialog.value.close === 'function') {
        floatDialog.value.close();
      }
      floatDialog.value = null;
    }
    
    if (floatApp.value) {
      if (typeof floatApp.value.unmount === 'function') {
        floatApp.value.unmount();
      }
      floatApp.value = null;
    }
    
    isFloating.value = false;
    floatingContent.value = null;
  };
  
  // 监听窗口大小变化
  const updateContainerWidth = (el) => {
    if (!el) return;
    containerWidth.value = el.offsetWidth;
  };
  
  // 初始化观察器
  const initResizeObserver = (el) => {
    if (!el) return null;
    
    const observer = new ResizeObserver(() => {
      updateContainerWidth(el);
    });
    
    observer.observe(el);
    return observer;
  };
  
  // 组件生命周期挂载和卸载
  let resizeObserver = null;
  
  const setupFloatableContainer = (el) => {
    updateContainerWidth(el);
    resizeObserver = initResizeObserver(el);
  };
  
  onUnmounted(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
    }
    closeFloatPanel();
  });
  
  return {
    isFloating,
    floatingContent,
    shouldFloat,
    createFloatPanel,
    closeFloatPanel,
    setupFloatableContainer,
    containerWidth
  };
} 