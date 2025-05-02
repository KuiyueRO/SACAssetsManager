<template>
  <div class="favorite-nodes-container">
    <div class="section-title">
      <i class="fas fa-star"></i>
      <span>收藏节点</span>
    </div>
    
    <div v-if="favoriteNodes.length > 0" class="favorites-grid">
      <div 
        v-for="node in favoriteNodes" 
        :key="node.id"
        class="favorite-item"
        draggable="true"
        @dragstart="handleDragStart($event, node)"
        @click="showNodeDetails(node)"
      >
        <div class="favorite-icon" :class="node.type">
          {{ nodeTypeIcon(node.type) }}
        </div>
        <div class="favorite-info">
          <div class="favorite-title">{{ node.title }}</div>
        </div>
        <button class="remove-button" @click.stop="removeFromFavorites(node.id)" title="取消收藏">
          <i class="fas fa-star"></i>
        </button>
      </div>
    </div>
    
    <div v-else class="empty-favorites">
      <i class="fas fa-star-half-alt"></i>
      <p>暂无收藏节点</p>
      <p class="empty-hint">点击节点卡片上的星标添加收藏</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  allNodes: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['node-drag-start', 'node-info']);

// 收藏节点列表
const favoriteNodes = ref([]);

// 获取节点类型图标
const nodeTypeIcon = (type) => {
  switch (type) {
    case 'function': return 'fx';
    case 'component': return '⚛';
    default: return '📄';
  }
};

// 从本地存储加载收藏节点
const loadFavoriteNodes = () => {
  try {
    const storedFavorites = localStorage.getItem('favoriteNodes');
    if (storedFavorites) {
      // 获取收藏节点ID列表
      const favoriteIds = JSON.parse(storedFavorites);
      
      // 根据所有节点中查找收藏的节点
      const allNodesFlat = props.allNodes.flatMap(category => category.nodes);
      favoriteNodes.value = favoriteIds
        .map(id => allNodesFlat.find(node => node.id === id))
        .filter(Boolean); // 过滤掉未找到的节点
    }
  } catch (error) {
    console.error('加载收藏节点失败:', error);
    favoriteNodes.value = [];
  }
};

// 保存收藏节点到本地存储
const saveFavoriteNodes = () => {
  try {
    const favoriteIds = favoriteNodes.value.map(node => node.id);
    localStorage.setItem('favoriteNodes', JSON.stringify(favoriteIds));
  } catch (error) {
    console.error('保存收藏节点失败:', error);
  }
};

// 添加节点到收藏
const addToFavorites = (node) => {
  // 检查节点是否已在收藏中
  const isAlreadyFavorite = favoriteNodes.value.some(n => n.id === node.id);
  if (!isAlreadyFavorite) {
    favoriteNodes.value.push(node);
    saveFavoriteNodes();
  }
};

// 从收藏中移除节点
const removeFromFavorites = (nodeId) => {
  favoriteNodes.value = favoriteNodes.value.filter(node => node.id !== nodeId);
  saveFavoriteNodes();
};

// 处理节点拖拽
const handleDragStart = (event, node) => {
  const nodeData = node.createNode();
  
  // 触发拖拽事件
  emit('node-drag-start', {
    node: nodeData,
    event: event
  });
  
  // 设置拖拽效果
  event.dataTransfer.effectAllowed = 'copy';
  
  // 创建拖拽预览图像
  const preview = document.createElement('div');
  preview.className = 'drag-preview';
  preview.textContent = node.title;
  document.body.appendChild(preview);
  event.dataTransfer.setDragImage(preview, 0, 0);
  
  // 清理预览元素
  requestAnimationFrame(() => {
    document.body.removeChild(preview);
  });
};

// 显示节点详情
const showNodeDetails = (node) => {
  emit('node-info', node);
};

// 监听所有节点变化，重新加载收藏节点
watch(() => props.allNodes, () => {
  loadFavoriteNodes();
}, { deep: true });

// 组件挂载时加载收藏节点
onMounted(() => {
  loadFavoriteNodes();
});

// 暴露添加和移除方法给父组件
defineExpose({
  addToFavorites,
  removeFromFavorites
});
</script>

<style scoped>
.favorite-nodes-container {
  margin-bottom: var(--tool-spacing-lg);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--tool-spacing);
  padding: var(--tool-spacing);
  margin-bottom: var(--tool-spacing);
  font-weight: 600;
  color: var(--tool-text-secondary);
  font-size: 14px;
}

.section-title i {
  color: #f59f00; /* 金色星标 */
  font-size: 16px;
}

/* 收藏网格 */
.favorites-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--tool-spacing);
}

/* 收藏项 */
.favorite-item {
  display: flex;
  align-items: center;
  padding: var(--tool-spacing);
  background-color: var(--tool-bg-card);
  border-radius: var(--tool-radius);
  cursor: grab;
  border: 1px solid var(--tool-border);
  transition: all var(--tool-transition-fast) ease;
  position: relative;
}

.favorite-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--tool-shadow);
  border-color: var(--tool-primary-border);
}

.favorite-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--tool-primary-light);
  border-radius: var(--tool-radius);
  color: var(--tool-primary);
  font-weight: bold;
  font-size: 14px;
  margin-right: var(--tool-spacing);
  border: 1px solid var(--tool-primary-border);
  flex-shrink: 0;
}

.favorite-info {
  flex: 1;
  min-width: 0;
}

.favorite-title {
  font-weight: 500;
  font-size: 13px;
  color: var(--tool-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.remove-button {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--tool-radius-sm);
  color: #f59f00; /* 金色星标 */
  cursor: pointer;
  transition: all var(--tool-transition-fast) ease;
  padding: 0;
  opacity: 0.7;
}

.remove-button:hover {
  opacity: 1;
  background-color: var(--tool-bg-hover);
}

/* 空状态 */
.empty-favorites {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--tool-spacing-lg);
  background-color: var(--tool-bg);
  border-radius: var(--tool-radius);
  color: var(--tool-text-tertiary);
  text-align: center;
}

.empty-favorites i {
  font-size: 24px;
  margin-bottom: var(--tool-spacing);
  color: #f59f00; /* 金色星标 */
  opacity: 0.5;
}

.empty-favorites p {
  font-size: 14px;
  margin: 4px 0;
}

.empty-hint {
  font-size: 12px;
  opacity: 0.7;
}

/* 拖拽预览 */
.drag-preview {
  position: fixed;
  top: -1000px;
  left: -1000px;
  padding: calc(var(--tool-spacing) * 1.25) var(--tool-spacing-lg);
  background: var(--tool-primary);
  color: white;
  border-radius: var(--tool-radius);
  pointer-events: none;
  z-index: 9999;
  font-weight: 500;
  box-shadow: var(--tool-shadow);
}
</style> 