<template>
  <div class="yellow-brush-node">
    <div class="node-icon">
      <i class="fas fa-highlighter"></i>
    </div>
    <div class="node-content">
      <div class="node-title">黄色刷子</div>
      <div class="node-description">点击将思源块背景设为黄色</div>
      <button 
        class="brush-button"
        :class="{ active: isBrushMode }"
        @click="toggleBrushMode"
      >
        {{ isBrushMode ? '停止刷子' : '开始刷子' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { createYellowBrushHandlers } from './yellowColorBrush.js';
import { onUnmounted } from 'vue';

// 创建刷子处理器
const { isBrushMode, startBrushMode, stopBrushMode } = createYellowBrushHandlers();

// 切换刷子模式
const toggleBrushMode = () => {
  if (isBrushMode.value) {
    stopBrushMode();
  } else {
    startBrushMode();
  }
};

// 组件卸载时清理
onUnmounted(() => {
  if (isBrushMode.value) {
    stopBrushMode();
  }
});
</script>

<style scoped>
.yellow-brush-node {
  background-color: var(--tool-bg-card);
  border-radius: var(--tool-radius);
  padding: var(--tool-spacing-lg);
  margin-bottom: var(--tool-spacing-lg);
  border: 1px solid var(--tool-border);
  display: flex;
  align-items: flex-start;
  box-shadow: var(--tool-shadow-sm);
  transition: all var(--tool-transition-fast) ease;
}

.yellow-brush-node:hover {
  transform: translateY(-2px);
  box-shadow: var(--tool-shadow);
}

.node-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffc10720;
  color: #ffc107;
  border-radius: var(--tool-radius);
  margin-right: var(--tool-spacing-lg);
  flex-shrink: 0;
  font-size: 18px;
}

.node-content {
  flex: 1;
  min-width: 0;
}

.node-title {
  font-weight: 600;
  font-size: 16px;
  color: var(--tool-text);
  margin-bottom: 4px;
}

.node-description {
  color: var(--tool-text-secondary);
  font-size: 13px;
  margin-bottom: var(--tool-spacing);
}

.brush-button {
  padding: 6px 12px;
  background-color: #ffc107;
  color: #fff;
  border: none;
  border-radius: var(--tool-radius-sm);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all var(--tool-transition-fast) ease;
}

.brush-button:hover {
  background-color: #ffb300;
}

.brush-button.active {
  background-color: #ff5722;
}
</style> 