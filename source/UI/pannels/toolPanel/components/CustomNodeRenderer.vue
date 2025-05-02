<template>
  <component :is="componentToRender" v-if="componentToRender" v-bind="props" />
  <div v-else class="fallback-node">
    <div class="fallback-icon">?</div>
    <div class="fallback-info">
      <div class="fallback-title">{{ node?.title || '未知节点' }}</div>
      <div class="fallback-description">无法渲染此节点类型</div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, defineProps } from 'vue';

// 导入红色刷子节点
const RedColorBrushNode = defineAsyncComponent(() => 
  import('./RedColorBrushNode.vue')
);

// 导入黄色刷子节点
const YellowColorBrushNode = defineAsyncComponent(() => 
  import('./YellowColorBrushNode.vue')
);

// 组件映射表
const componentMap = {
  'tools/redColorBrush': RedColorBrushNode,
  'tools/刷子/createyellowbrushhandlers': YellowColorBrushNode
};

const props = defineProps({
  node: {
    type: Object,
    required: true
  }
});

// 根据节点类型计算要渲染的组件
const componentToRender = computed(() => {
  if (!props.node || !props.node.id) return null;
  return componentMap[props.node.id] || null;
});
</script>

<style scoped>
.fallback-node {
  background-color: var(--tool-bg-card);
  border-radius: var(--tool-radius);
  border: 1px solid var(--tool-border);
  padding: var(--tool-spacing-lg);
  margin-bottom: var(--tool-spacing-lg);
  display: flex;
  align-items: center;
}

.fallback-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--tool-bg-hover);
  border-radius: var(--tool-radius);
  color: var(--tool-text-tertiary);
  font-weight: bold;
  font-size: 20px;
  margin-right: var(--tool-spacing-lg);
  flex-shrink: 0;
}

.fallback-info {
  flex: 1;
  min-width: 0;
}

.fallback-title {
  font-weight: 600;
  font-size: 16px;
  color: var(--tool-text);
  margin-bottom: 4px;
}

.fallback-description {
  color: var(--tool-text-tertiary);
  font-size: 13px;
}
</style> 