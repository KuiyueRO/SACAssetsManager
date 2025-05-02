<template>
  <div class="red-brush-node">
    <div 
      class="brush-card" 
      :class="{ active: colorBrush.isBrushMode }"
      @click="toggleBrushMode"
    >
      <div class="brush-icon">
        <div class="color-circle"></div>
      </div>
      <div class="brush-info">
        <div class="brush-title">红色刷子</div>
        <div class="brush-description">点击将思源块背景设为红色</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { createColorBrushHandlers } from './colorBrush.js';
import { onBeforeUnmount } from 'vue';

// 创建颜色刷子处理器
const colorBrush = createColorBrushHandlers();

// 切换刷子模式
const toggleBrushMode = () => {
  if (colorBrush.isBrushMode.value) {
    colorBrush.stopBrushMode();
  } else {
    colorBrush.startBrushMode();
  }
};

// 组件卸载前确保停止刷子模式
onBeforeUnmount(() => {
  if (colorBrush.isBrushMode.value) {
    colorBrush.stopBrushMode();
  }
});

// 导出创建节点的方法，为了与其他节点兼容
const createNode = () => ({
  type: 'redColorBrush',
  name: '红色刷子',
  category: '工具/刷子'
});

defineExpose({
  createNode
});
</script>

<style scoped>
.red-brush-node {
  margin-bottom: var(--tool-spacing-lg);
}

.brush-card {
  background-color: var(--tool-bg-card);
  border-radius: var(--tool-radius);
  border: 1px solid var(--tool-border);
  padding: var(--tool-spacing-lg);
  transition: all var(--tool-transition-fast) ease;
  cursor: pointer;
  box-shadow: var(--tool-shadow-sm);
  display: flex;
  align-items: center;
}

.brush-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--tool-shadow);
  border-color: var(--tool-primary-border);
}

.brush-card.active {
  background-color: rgba(255, 0, 0, 0.1);
  border-color: #ff0000;
}

.brush-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--tool-spacing-lg);
  flex-shrink: 0;
}

.color-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: #ff0000;
  box-shadow: 0 0 8px rgba(255, 0, 0, 0.5);
}

.brush-info {
  flex: 1;
  min-width: 0;
}

.brush-title {
  font-weight: 600;
  font-size: 16px;
  color: var(--tool-text);
  margin-bottom: 4px;
}

.brush-description {
  color: var(--tool-text-secondary);
  font-size: 13px;
  line-height: 1.4;
}
</style> 