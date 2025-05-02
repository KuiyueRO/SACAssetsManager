<template>
  <div class="node-category-list">
    <!-- 分类筛选标签 -->
    <div class="category-tags">
      <div 
        v-for="category in categories" 
        :key="category.name"
        class="category-tag"
        :class="{ active: selectedCategory === category.name }"
        @click="selectCategory(category.name)"
      >
        {{ category.name }}
      </div>
    </div>
    
    <!-- 节点列表 -->
    <div class="nodes-container">
      <!-- 渲染普通节点卡片 -->
      <template v-for="node in filteredNodes" :key="node.id">
        <!-- 对于工具类型节点，使用动态渲染器 -->
        <DynamicNodeRenderer 
          v-if="node.type === 'tool'"
          :node="node"
          @node-drag-start="$emit('node-drag-start', $event)"
        />
        <!-- 对于其他类型节点，使用标准卡片 -->
        <NodeCard 
          v-else
          :node="node"
          :isFavorite="isFavorite(node.id)"
          @node-drag-start="$emit('node-drag-start', $event)"
          @node-info="$emit('node-info', $event)"
          @node-use="$emit('node-use', $event)"
          @toggle-favorite="$emit('toggle-favorite', $event)"
        />
      </template>
      
      <div v-if="filteredNodes.length === 0" class="empty-state">
        <i class="fas fa-search"></i>
        <p>没有找到符合条件的节点</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import NodeCard from './NodeCard.vue';
import DynamicNodeRenderer from './DynamicNodeRenderer.vue';

const props = defineProps({
  categories: {
    type: Array,
    required: true
  },
  searchQuery: {
    type: String,
    default: ''
  },
  favoriteNodeIds: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['node-drag-start', 'node-info', 'node-use', 'toggle-favorite']);

// 当前选中的分类
const selectedCategory = ref('');

// 选择分类
const selectCategory = (categoryName) => {
  selectedCategory.value = selectedCategory.value === categoryName ? '' : categoryName;
};

// 检查节点是否已收藏
const isFavorite = (nodeId) => {
  return props.favoriteNodeIds.includes(nodeId);
};

// 计算过滤后的节点
const filteredNodes = computed(() => {
  // 所有节点的数组
  let nodes = [];
  
  // 根据分类筛选
  if (selectedCategory.value) {
    const category = props.categories.find(c => c.name === selectedCategory.value);
    if (category) {
      nodes = [...category.nodes];
    }
  } else {
    // 如果没有选中分类，则显示所有节点
    nodes = props.categories.flatMap(category => category.nodes);
  }
  
  // 根据搜索词筛选
  if (props.searchQuery) {
    const query = props.searchQuery.toLowerCase();
    nodes = nodes.filter(node => 
      node.title.toLowerCase().includes(query) ||
      node.description.toLowerCase().includes(query)
    );
  }
  
  return nodes;
});
</script>

<style scoped>
.node-category-list {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 分类标签 */
.category-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--tool-spacing);
  margin-bottom: var(--tool-spacing-lg);
  padding: 0 var(--tool-spacing);
}

.category-tag {
  padding: calc(var(--tool-spacing) * 0.75) var(--tool-spacing);
  background-color: var(--tool-bg);
  border-radius: var(--tool-radius);
  font-size: 13px;
  color: var(--tool-text-secondary);
  cursor: pointer;
  transition: all var(--tool-transition-fast) ease;
  border: 1px solid var(--tool-border);
}

.category-tag:hover {
  background-color: var(--tool-bg-hover);
  transform: translateY(-1px);
}

.category-tag.active {
  background-color: var(--tool-primary);
  color: var(--tool-text-on-primary);
  border-color: var(--tool-primary-hover);
}

/* 节点列表 */
.nodes-container {
  flex: 1;
  overflow-y: auto;
  padding: 0 var(--tool-spacing);
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--tool-spacing-lg);
  margin: var(--tool-spacing-lg) 0;
  background-color: var(--tool-bg);
  border-radius: var(--tool-radius);
  color: var(--tool-text-tertiary);
}

.empty-state i {
  font-size: 32px;
  margin-bottom: var(--tool-spacing);
  opacity: 0.5;
}

.empty-state p {
  font-size: 14px;
}
</style> 