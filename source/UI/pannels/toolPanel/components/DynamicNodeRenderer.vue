<template>
  <component 
    v-if="dynamicComponent" 
    :is="dynamicComponent" 
    v-bind="componentProps"
  />
  <div v-else-if="isLoading" class="loading-container">
    <div class="loading-spinner"></div>
    <div class="loading-text">正在加载组件...</div>
  </div>
  <div v-else class="fallback-node">
    <div class="fallback-icon">
      <i :class="fallbackIcon"></i>
    </div>
    <div class="fallback-info">
      <div class="fallback-title">{{ node?.title || '未知节点' }}</div>
      <div class="fallback-description">{{ node?.description || '无描述' }}</div>
      <div v-if="error" class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, defineAsyncComponent, markRaw } from 'vue';
import { createVueComponentFromJSDoc } from './NodeParser.js';

const props = defineProps({
  node: {
    type: Object,
    required: true
  }
});

// 组件状态
const dynamicComponent = ref(null);
const isLoading = ref(false);
const error = ref(null);
const componentProps = ref({});

// 预定义的组件映射表（备用方案）
const staticComponentMap = {
  'tools/redColorBrush': defineAsyncComponent(() => import('./RedColorBrushNode.vue')),
  'tools/刷子/createyellowbrushhandlers': defineAsyncComponent(() => import('./YellowColorBrushNode.vue'))
};

// 备用图标
const fallbackIcon = computed(() => {
  if (!props.node) return 'fas fa-question';
  
  // 根据节点类型返回不同的图标
  switch (props.node.type) {
    case 'tool':
      return 'fas fa-tools';
    case 'function':
      return 'fas fa-code';
    case 'component':
      return 'fas fa-puzzle-piece';
    default:
      return props.node.icon || 'fas fa-cube';
  }
});

// 动态加载组件
const loadDynamicComponent = async () => {
  if (!props.node || !props.node.id) {
    error.value = '节点信息不完整';
    return;
  }
  
  isLoading.value = true;
  error.value = null;
  
  try {
    // 1. 首先尝试使用静态映射的组件
    if (staticComponentMap[props.node.id]) {
      dynamicComponent.value = staticComponentMap[props.node.id];
      return;
    }
    
    // 2. 否则尝试从源文件路径加载
    const sourcePath = props.node.metadata?.sourcePath;
    if (sourcePath) {
      const moduleObj = await import(/* @vite-ignore */ sourcePath);
      const functionName = props.node.id.split('/').pop();
      
      // 获取源代码
      const response = await fetch(sourcePath);
      if (!response.ok) {
        throw new Error(`无法获取源代码: ${sourcePath}`);
      }
      const code = await response.text();
      
      // 从JSDoc创建Vue组件
      const component = await createVueComponentFromJSDoc(moduleObj, functionName, code);
      dynamicComponent.value = markRaw(component);
    } else {
      error.value = '无法找到源文件路径';
    }
  } catch (err) {
    console.error('加载组件失败:', err);
    error.value = `加载失败: ${err.message}`;
  } finally {
    isLoading.value = false;
  }
};

// 监听节点变化
watch(() => props.node, (newNode) => {
  if (newNode) {
    loadDynamicComponent();
  } else {
    dynamicComponent.value = null;
  }
}, { immediate: true });

onMounted(() => {
  if (props.node) {
    loadDynamicComponent();
  }
});
</script>

<style scoped>
.fallback-node {
  background-color: var(--tool-bg-card, #ffffff);
  border-radius: var(--tool-radius, 6px);
  padding: var(--tool-spacing-lg, 16px);
  margin-bottom: var(--tool-spacing-lg, 16px);
  border: 1px solid var(--tool-border, #dee2e6);
  display: flex;
  align-items: flex-start;
  box-shadow: var(--tool-shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.08));
  transition: all var(--tool-transition-fast, 150ms) ease;
}

.fallback-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--tool-bg-hover, #f1f3f5);
  border-radius: var(--tool-radius, 6px);
  color: var(--tool-text-tertiary, #868e96);
  font-size: 20px;
  margin-right: var(--tool-spacing-lg, 16px);
  flex-shrink: 0;
}

.fallback-info {
  flex: 1;
  min-width: 0;
}

.fallback-title {
  font-weight: 600;
  font-size: 16px;
  color: var(--tool-text, #212529);
  margin-bottom: 4px;
}

.fallback-description {
  color: var(--tool-text-secondary, #495057);
  font-size: 13px;
  margin-bottom: var(--tool-spacing, 8px);
}

.error-message {
  margin-top: var(--tool-spacing, 8px);
  padding: var(--tool-spacing, 8px);
  background-color: rgba(231, 76, 60, 0.1);
  border-radius: var(--tool-radius-sm, 4px);
  color: #e74c3c;
  font-size: 12px;
  display: flex;
  align-items: center;
}

.error-message i {
  margin-right: 6px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--tool-spacing-lg, 16px);
  background-color: var(--tool-bg-card, #ffffff);
  border-radius: var(--tool-radius, 6px);
  border: 1px solid var(--tool-border, #dee2e6);
  margin-bottom: var(--tool-spacing-lg, 16px);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--tool-bg-hover, #f1f3f5);
  border-top-color: var(--tool-primary, #4263eb);
  border-radius: 50%;
  animation: spin 1s infinite linear;
  margin-bottom: var(--tool-spacing, 8px);
}

.loading-text {
  color: var(--tool-text-secondary, #495057);
  font-size: 14px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style> 