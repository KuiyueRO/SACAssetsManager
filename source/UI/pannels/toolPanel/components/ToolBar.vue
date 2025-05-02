<template>
  <div class="tool-group" :class="`layout-${layoutMode}`">
    <div 
      v-for="(tool, index) in tools"
      :key="index"
      class="tool-item"
      :class="{ active: selectedTool === tool.name }"
      @click="selectTool(tool.name)"
    >
      <i :class="tool.icon"></i>
      <span class="tool-name">{{ tool.name }}</span>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  tools: {
    type: Array,
    required: true
  },
  selectedTool: {
    type: String,
    default: ''
  },
  layoutMode: {
    type: String,
    default: 'column' // 'grid', 'column', 'icon'
  }
});

const emit = defineEmits(['tool-selected']);

const selectTool = (toolName) => {
  emit('tool-selected', toolName);
};
</script>

<style scoped>
/* Grid 布局 */
.tool-group.layout-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  align-content: start;
  gap: var(--tool-spacing);
}

/* Column 布局 */
.tool-group.layout-column {
  display: flex;
  flex-direction: column;
  gap: calc(var(--tool-spacing) / 2);
}
.tool-group.layout-column .tool-item {
  width: 100%;
  flex-direction: row;
  justify-content: flex-start;
  padding: calc(var(--tool-spacing) * 1.25) var(--tool-spacing);
  border-radius: var(--tool-radius);
}
.tool-group.layout-column .tool-item i {
  margin-bottom: 0;
  margin-right: var(--tool-spacing);
  font-size: 16px;
}

/* Icon 布局 */
.tool-group.layout-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(var(--tool-spacing) / 2);
}
.tool-group.layout-icon .tool-name {
  display: none;
}
.tool-group.layout-icon .tool-item {
  padding: calc(var(--tool-spacing) * 1.25);
  min-height: auto;
  width: auto;
  border-radius: 50%;
}
.tool-group.layout-icon .tool-item i {
  margin-bottom: 0;
  margin-right: 0;
}

/* 工具项样式 */
.tool-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: calc(var(--tool-spacing) * 1.5) var(--tool-spacing);
  border-radius: var(--tool-radius);
  background-color: var(--tool-bg-card);
  box-shadow: var(--tool-shadow-sm);
  text-align: center;
  min-height: 65px;
  cursor: pointer;
  user-select: none;
  overflow: hidden;
  box-sizing: border-box;
  position: relative;
  transition: all var(--tool-transition-fast) ease-in-out;
  border: 1px solid transparent;
}

.tool-item:hover {
  background-color: var(--tool-bg-hover);
  box-shadow: var(--tool-shadow);
  transform: translateY(-1px);
  border-color: var(--tool-border);
}

.tool-item.active {
  background-color: var(--tool-primary-light);
  color: var(--tool-primary);
  border: 1px solid var(--tool-primary-border);
  box-shadow: var(--tool-shadow-inset), 0 0 0 1px var(--tool-primary-border);
}

.tool-item.active i,
.tool-item.active .tool-name {
  color: var(--tool-primary);
}

.tool-item::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(66, 99, 235, 0.1) 0%, rgba(66, 99, 235, 0) 70%);
  opacity: 0;
  transition: opacity var(--tool-transition-fast) ease-out;
  pointer-events: none;
}

.tool-item:active::after {
  opacity: 1;
}

.tool-item i {
  font-size: 20px;
  margin-bottom: calc(var(--tool-spacing) / 1.5);
  color: var(--tool-text-secondary);
  transition: color var(--tool-transition-fast) ease;
}

.tool-name {
  font-size: 11px;
  font-weight: 500;
  color: var(--tool-text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  line-height: 1.4;
  transition: color var(--tool-transition-fast) ease;
}
</style> 