<template>
  <div class="node-card" draggable="true" @dragstart="handleDragStart">
    <div class="card-content" @click="handleCardClick">
      <div class="node-header">
        <div class="node-icon" :class="node.type">
          {{ nodeTypeIcon }}
        </div>
        <div class="node-title-area">
          <div class="node-title">{{ node.title }}</div>
          <div class="node-type">{{ node.type }}</div>
        </div>
      </div>
      
      <div class="node-description">{{ node.description }}</div>
      
      <div class="node-footer">
        <div class="node-tags">
          <span v-if="node.metadata?.author" class="node-tag author-tag">
            👤 {{ node.metadata.author }}
          </span>
          <span v-if="node.metadata?.version" class="node-tag version-tag">
            v{{ node.metadata.version }}
          </span>
        </div>
        <div class="node-path" v-if="node.metadata?.sourcePath">
          <span class="source-path">📁 {{ formatPath(node.metadata.sourcePath) }}</span>
        </div>
      </div>
    </div>
    
    <div class="card-actions">
      <span class="action-button favorite-button" @click.stop="toggleFavorite" :title="isFavorite ? '取消收藏' : '收藏节点'">
        <i class="fas fa-star" :class="{ 'is-favorite': isFavorite }"></i>
      </span>
      <span class="action-button" @click.stop="handleInfoClick" title="查看详情">
        <i class="fas fa-info-circle"></i>
      </span>
      <span class="action-button" @click.stop="handleUseClick" title="使用节点">
        <i class="fas fa-plus-circle"></i>
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  isFavorite: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['node-drag-start', 'node-info', 'node-use', 'toggle-favorite']);

const formatPath = (path) => {
  if (!path) return '未知路径';
  const parts = path.split('/');
  return parts.slice(-2).join('/');
};

// 根据节点类型计算图标
const nodeTypeIcon = computed(() => {
  switch (props.node.type) {
    case 'function': return 'fx';
    case 'component': return '⚛';
    default: return '📄';
  }
});

// 检查是否有输入端口
const hasInputTypes = computed(() => {
  return props.node.metadata?.jsDoc?.inputTypes && 
         Object.keys(props.node.metadata.jsDoc.inputTypes || {}).length > 0;
});

// 检查是否有输出端口
const hasOutputTypes = computed(() => {
  return props.node.metadata?.jsDoc?.outputTypes && 
         Object.keys(props.node.metadata.jsDoc.outputTypes || {}).length > 0;
});

// 检查是否有示例
const hasExamples = computed(() => {
  return props.node.metadata?.jsDoc?.examples && 
         props.node.metadata.jsDoc.examples.length > 0;
});

// 处理拖拽开始
const handleDragStart = (event) => {
  const nodeData = props.node.createNode();
  
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
  preview.textContent = props.node.title;
  document.body.appendChild(preview);
  event.dataTransfer.setDragImage(preview, 0, 0);
  
  // 清理预览元素
  requestAnimationFrame(() => {
    document.body.removeChild(preview);
  });
};

// 处理卡片点击
const handleCardClick = () => {
  // 点击卡片查看详情而不是直接使用
  handleInfoClick();
};

// 处理信息按钮点击
const handleInfoClick = () => {
  // 发出查看信息事件
  emit('node-info', props.node);
};

// 处理使用按钮点击
const handleUseClick = () => {
  // 发出使用节点事件
  emit('node-use', props.node.createNode());
};

// 处理收藏按钮点击
const toggleFavorite = () => {
  // 发出切换收藏状态事件
  emit('toggle-favorite', props.node);
};
</script>

<style scoped>
.node-card {
  background-color: var(--tool-bg-card);
  border-radius: var(--tool-radius);
  border: 1px solid var(--tool-border);
  padding: var(--tool-spacing-lg);
  margin-bottom: var(--tool-spacing-lg);
  transition: all var(--tool-transition-fast) ease;
  cursor: pointer;
  box-shadow: var(--tool-shadow-sm);
  display: flex;
  flex-direction: column;
}

.node-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--tool-shadow);
  border-color: var(--tool-primary-border);
}

.card-content {
  flex: 1;
}

.node-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--tool-spacing);
}

.node-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--tool-primary-light);
  border-radius: var(--tool-radius);
  color: var(--tool-primary);
  font-weight: bold;
  font-size: 16px;
  margin-right: var(--tool-spacing-lg);
  border: 1px solid var(--tool-primary-border);
  flex-shrink: 0;
}

.node-title-area {
  flex: 1;
  min-width: 0;
}

.node-title {
  font-weight: 600;
  font-size: 16px;
  color: var(--tool-text);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-type {
  font-size: 13px;
  color: var(--tool-text-tertiary);
}

.node-description {
  color: var(--tool-text-secondary);
  font-size: 14px;
  margin-bottom: var(--tool-spacing-lg);
  line-height: 1.5;
  /* 限制行数，超出显示省略号 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: calc(var(--tool-spacing) * 0.75);
  font-size: 12px;
  color: var(--tool-text-tertiary);
}

.node-tags {
  display: flex;
  gap: 8px;
}

.node-tag {
  background: var(--tool-bg);
  padding: 4px 8px;
  border-radius: var(--tool-radius-sm);
  white-space: nowrap;
}

.node-path {
  font-size: 12px;
}

.source-path {
  background: var(--tool-bg);
  padding: 4px 8px;
  border-radius: var(--tool-radius-sm);
  white-space: nowrap;
}

/* 卡片操作按钮 */
.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--tool-spacing);
  margin-top: var(--tool-spacing-lg);
  padding-top: var(--tool-spacing);
  border-top: 1px solid var(--tool-border);
}

.action-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--tool-radius-sm);
  color: var(--tool-text-secondary);
  cursor: pointer;
  transition: all var(--tool-transition-fast) ease;
}

.action-button:hover {
  background-color: var(--tool-bg-hover);
  color: var(--tool-primary);
}

.action-button i {
  font-size: 16px;
}

/* 收藏按钮样式 */
.favorite-button i {
  transition: all var(--tool-transition-fast) ease;
}

.favorite-button i.is-favorite {
  color: #f59f00; /* 金色星标 */
}

.favorite-button:hover i {
  color: #f59f00; /* 悬浮时始终显示金色 */
}

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