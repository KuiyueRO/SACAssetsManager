<template>
  <div class="gallery-categories">
    <div 
      v-for="category in categories" 
      :key="category.name" 
      class="category"
    >
      <div class="category-header" @click="toggleCategory(category.name)">
        <span class="category-name">{{ category.name }}</span>
        <span class="category-icon">{{ expandedCategories[category.name] ? '▼' : '▶' }}</span>
      </div>
      <div 
        v-show="expandedCategories[category.name]" 
        class="category-items"
      >
        <NodeItem 
          v-for="node in category.nodes" 
          :key="node.id"
          :node="node"
          @node-drag-start="$emit('node-drag-start', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import NodeItem from './NodeItem.vue';

const props = defineProps({
  categories: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['node-drag-start']);

const expandedCategories = ref({});

const toggleCategory = (categoryName) => {
  expandedCategories.value[categoryName] = !expandedCategories.value[categoryName];
};

onMounted(() => {
  // 默认展开所有分类
  props.categories.forEach(category => {
    expandedCategories.value[category.name] = true;
  });
});
</script>

<style scoped>
.gallery-categories {
  flex: 1;
  overflow-y: auto;
  padding: var(--tool-spacing-lg);
  max-height: calc(500px - 80px);
  scrollbar-width: thin;
  scrollbar-color: var(--tool-text-tertiary) transparent;
}

.gallery-categories::-webkit-scrollbar {
  width: 6px;
}

.gallery-categories::-webkit-scrollbar-track {
  background: transparent;
}

.gallery-categories::-webkit-scrollbar-thumb {
  background-color: var(--tool-text-tertiary);
  border-radius: 3px;
}

.category {
  margin-bottom: var(--tool-spacing-lg);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: calc(var(--tool-spacing) * 1.25);
  background: var(--tool-bg);
  border-radius: var(--tool-radius);
  cursor: pointer;
  font-weight: 600;
  color: var(--tool-text-secondary);
  transition: background var(--tool-transition-fast) ease;
}

.category-header:hover {
  background: var(--tool-bg-hover);
}

.category-name {
  font-size: 13px;
}

.category-icon {
  font-size: 12px;
  transition: transform var(--tool-transition) ease;
}

.category-items {
  padding: var(--tool-spacing) 0 var(--tool-spacing) calc(var(--tool-spacing) * 2);
  transition: max-height var(--tool-transition) ease, opacity var(--tool-transition) ease;
}
</style> 