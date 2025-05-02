<template>
  <div class="gallery-container">
    <button 
      ref="galleryButton"
      class="gallery-button"
      @click.stop="toggleGallery"
      :class="{ 'active': isOpen }"
    >
      <i class="fas fa-th-large"></i>
      <span class="button-text">节点库</span>
      <i class="fas fa-chevron-down gallery-indicator"></i>
    </button>

    <div 
      v-show="isOpen" 
      class="node-gallery"
      ref="galleryPanel"
      @click.stop
      :style="panelPosition"
    >
      <div class="gallery-search">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="搜索节点..." 
          @input="filterNodes"
        />
      </div>
      <CategoryList 
        :categories="filteredCategories"
        @node-drag-start="handleNodeDragStart"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import CategoryList from './CategoryList.vue';

const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['node-drag-start']);

const isOpen = ref(false);
const galleryPanel = ref(null);
const galleryButton = ref(null);
const searchQuery = ref('');

// 计算面板位置
const panelPosition = ref({
  top: 'calc(100% + 8px)',
  right: '0px'
});

// 处理点击外部关闭面板
const handleClickOutside = (event) => {
  const isButtonClick = galleryButton.value?.contains(event.target);
  const isPanelClick = galleryPanel.value?.contains(event.target);
  
  if (isOpen.value && !isButtonClick && !isPanelClick) {
    isOpen.value = false;
  }
};

// 显示在指定位置
const showAtPosition = (position) => {
  isOpen.value = true;
  panelPosition.value = {
    top: `${position.y}px`,
    left: `${position.x}px`
  };
};

// 调整面板位置
const adjustPanelPosition = async () => {
  if (!isOpen.value || !galleryPanel.value || !galleryButton.value) return;
  
  await nextTick();
  const buttonRect = galleryButton.value.getBoundingClientRect();
  const panelRect = galleryPanel.value.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  let top = buttonRect.bottom + 8;
  let left = buttonRect.left;
  
  if (left + panelRect.width > viewportWidth) {
    left = Math.max(8, viewportWidth - panelRect.width - 8);
  }
  if (left < 8) {
    left = 8;
  }
  if (top + panelRect.height > viewportHeight) {
    top = Math.max(8, buttonRect.top - panelRect.height - 8);
  }
  
  panelPosition.value = {
    top: `${top}px`,
    left: `${left}px`
  };
};

// 切换节点库显示状态
const toggleGallery = async (event) => {
  event.stopPropagation();
  isOpen.value = !isOpen.value;
  
  if (isOpen.value) {
    await adjustPanelPosition();
  }
};

// 处理节点拖拽开始
const handleNodeDragStart = (data) => {
  emit('node-drag-start', data);
};

// 过滤节点
const filterNodes = () => {
  // 通过 filteredCategories 计算属性自动过滤
};

// 计算过滤后的分类
const filteredCategories = computed(() => {
  if (!searchQuery.value) return props.categories;
  
  return props.categories.map(category => ({
    ...category,
    nodes: category.nodes.filter(node => 
      node.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  })).filter(category => category.nodes.length > 0);
});

// 监听窗口大小变化
const handleResize = () => {
  if (isOpen.value) {
    adjustPanelPosition();
  }
};

// 生命周期钩子
onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
  window.removeEventListener('resize', handleResize);
});

// 暴露给父组件的方法
defineExpose({
  showAtPosition,
  toggleGallery
});
</script>

<style scoped>
.gallery-container {
  position: relative;
  z-index: 1000;
  margin-top: auto;
  padding-top: var(--tool-spacing-lg);
  border-top: 1px solid var(--tool-border);
}

/* 节点库按钮 */
.gallery-button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--tool-spacing) * 0.75);
  width: 100%;
  padding: calc(var(--tool-spacing) * 1.25);
  background: var(--tool-bg-card);
  border: 1px solid var(--tool-border);
  border-radius: var(--tool-radius);
  color: var(--tool-text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--tool-transition-fast) ease;
  box-shadow: var(--tool-shadow-sm);
}

.gallery-button:hover {
  background: var(--tool-bg-hover);
  border-color: var(--tool-primary-border);
  box-shadow: var(--tool-shadow);
  transform: translateY(-1px);
}

.gallery-button.active {
  background: var(--tool-primary);
  color: var(--tool-text-on-primary);
  border-color: var(--tool-primary-hover);
  box-shadow: var(--tool-shadow-inset), 0 0 0 1px var(--tool-primary-hover);
}

.gallery-button i:first-child {
  font-size: 16px;
}

.gallery-indicator {
  font-size: 12px;
  transition: transform var(--tool-transition) ease;
  color: var(--tool-text-tertiary);
}

.gallery-button.active .gallery-indicator {
  transform: rotate(180deg);
  color: var(--tool-text-on-primary);
}

.gallery-button:hover .gallery-indicator {
  color: var(--tool-primary);
}

.button-text {
  font-size: 13px;
}

/* 节点库面板 */
.node-gallery {
  position: fixed;
  top: calc(100% + var(--tool-spacing));
  right: 0;
  width: 320px;
  height: 500px;
  background: var(--tool-bg-card);
  border: 1px solid var(--tool-border);
  border-radius: var(--tool-radius-lg);
  box-shadow: var(--tool-shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1001;
  animation: fadeIn var(--tool-transition-fast) ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 搜索区域 */
.gallery-search {
  padding: var(--tool-spacing-lg);
  border-bottom: 1px solid var(--tool-border);
  background: var(--tool-bg);
}

.gallery-search input {
  width: 100%;
  padding: calc(var(--tool-spacing) * 1.25);
  border: 1px solid var(--tool-border);
  border-radius: var(--tool-radius);
  background: var(--tool-bg-card);
  color: var(--tool-text);
  font-size: 14px;
  transition: all var(--tool-transition-fast) ease;
}

.gallery-search input:focus {
  outline: none;
  border-color: var(--tool-primary-border);
  box-shadow: 0 0 0 3px rgba(66, 99, 235, 0.15);
}

.gallery-search input::placeholder {
  color: var(--tool-text-tertiary);
}

/* 拖拽预览样式 */
:deep(.drag-preview) {
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