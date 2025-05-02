<template>
  <div class="recent-tools-container">
    <div class="section-title">
      <i class="fas fa-history"></i>
      <span>最近工具</span>
    </div>
    
    <div class="tools-grid" :class="`layout-${layoutMode}`">
      <div 
        v-for="(tool, index) in recentTools"
        :key="index"
        class="tool-item"
        :class="{ active: selectedTool === tool.name }"
        @click="selectTool(tool.name)"
      >
        <div class="tool-icon">
          <i :class="tool.icon"></i>
        </div>
        <span class="tool-name">{{ tool.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

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
  },
  maxRecentTools: {
    type: Number,
    default: 6
  }
});

const emit = defineEmits(['tool-selected']);

// 获取最近使用的工具列表
const recentTools = ref([]);

// 从本地存储获取最近使用的工具
const loadRecentTools = () => {
  try {
    const storedTools = localStorage.getItem('recentTools');
    if (storedTools) {
      // 获取工具名称列表
      const recentToolNames = JSON.parse(storedTools);
      
      // 根据存储的名称找到完整的工具对象
      recentTools.value = recentToolNames
        .map(name => props.tools.find(tool => tool.name === name))
        .filter(Boolean) // 过滤掉未找到的工具
        .slice(0, props.maxRecentTools); // 限制数量
      
      // 如果没有足够的最近工具，添加默认工具
      if (recentTools.value.length < props.maxRecentTools) {
        const missingCount = props.maxRecentTools - recentTools.value.length;
        const remainingTools = props.tools.filter(
          tool => !recentTools.value.some(t => t.name === tool.name)
        ).slice(0, missingCount);
        
        recentTools.value = [...recentTools.value, ...remainingTools];
      }
    } else {
      // 默认显示所有工具中的前N个
      recentTools.value = props.tools.slice(0, props.maxRecentTools);
    }
  } catch (error) {
    console.error('加载最近工具失败:', error);
    recentTools.value = props.tools.slice(0, props.maxRecentTools);
  }
};

// 保存最近使用的工具到本地存储
const saveRecentTools = () => {
  try {
    const toolNames = recentTools.value.map(tool => tool.name);
    localStorage.setItem('recentTools', JSON.stringify(toolNames));
  } catch (error) {
    console.error('保存最近工具失败:', error);
  }
};

// 选择工具时，更新最近使用的工具列表
const selectTool = (toolName) => {
  const selectedTool = props.tools.find(tool => tool.name === toolName);
  if (!selectedTool) return;
  
  // 从当前列表中移除所选工具（如果存在）
  recentTools.value = recentTools.value.filter(tool => tool.name !== toolName);
  
  // 将所选工具添加到列表开头
  recentTools.value.unshift(selectedTool);
  
  // 保持列表最大长度
  if (recentTools.value.length > props.maxRecentTools) {
    recentTools.value = recentTools.value.slice(0, props.maxRecentTools);
  }
  
  // 保存到本地存储
  saveRecentTools();
  
  // 发出工具选择事件
  emit('tool-selected', toolName);
};

// 监听工具列表变化，重新加载最近工具
watch(() => props.tools, () => {
  loadRecentTools();
}, { deep: true });

// 组件挂载时加载最近工具
onMounted(() => {
  loadRecentTools();
});
</script>

<style scoped>
.recent-tools-container {
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
  color: var(--tool-primary);
  font-size: 16px;
}

/* 工具网格 - 默认布局 */
.tools-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--tool-spacing);
}

/* Grid 布局 */
.tools-grid.layout-grid {
  grid-template-columns: repeat(3, 1fr);
}

/* Column 布局 */
.tools-grid.layout-column {
  grid-template-columns: 1fr;
}

/* Icon 布局 */
.tools-grid.layout-icon {
  grid-template-columns: repeat(3, 1fr);
}

.tools-grid.layout-icon .tool-name {
  display: none;
}

/* 工具项 */
.tool-item {
  display: flex;
  align-items: center;
  padding: var(--tool-spacing);
  background-color: var(--tool-bg-card);
  border-radius: var(--tool-radius);
  cursor: pointer;
  border: 1px solid transparent;
  transition: all var(--tool-transition-fast) ease;
  box-shadow: var(--tool-shadow-sm);
}

.tools-grid.layout-grid .tool-item,
.tools-grid.layout-icon .tool-item {
  flex-direction: column;
  text-align: center;
  padding: var(--tool-spacing-lg) var(--tool-spacing);
}

.tool-item:hover {
  background-color: var(--tool-bg-hover);
  transform: translateY(-1px);
  box-shadow: var(--tool-shadow);
  border-color: var(--tool-border);
}

.tool-item.active {
  background-color: var(--tool-primary-light);
  color: var(--tool-primary);
  border: 1px solid var(--tool-primary-border);
}

.tool-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--tool-text-secondary);
  margin-right: var(--tool-spacing);
  width: 24px;
  height: 24px;
}

.tools-grid.layout-grid .tool-icon,
.tools-grid.layout-icon .tool-icon {
  margin-right: 0;
  margin-bottom: var(--tool-spacing);
  font-size: 24px;
  width: 32px;
  height: 32px;
}

.tool-item.active .tool-icon {
  color: var(--tool-primary);
}

.tool-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--tool-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tool-item.active .tool-name {
  color: var(--tool-primary);
}
</style> 