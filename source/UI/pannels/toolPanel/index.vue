<template>
  <div class="tool-panel" ref="panelRef">
    <!-- 最近工具组件 -->
    <RecentTools 
      :tools="tools"
      :selectedTool="selectedTool"
      :layoutMode="layoutMode"
      @tool-selected="selectTool"
    />
    
    <!-- 分隔线 -->
    <div class="panel-divider"></div>
    
    <!-- 收藏节点组件 -->
    <FavoriteNodes
      :allNodes="nodeCategories"
      @node-drag-start="handleNodeDragStart"
      @node-info="handleNodeInfo"
      ref="favoriteNodesRef"
    />
    
    <!-- 分隔线 -->
    <div class="panel-divider"></div>
    
    <!-- 节点库搜索框 -->
    <div class="search-container">
      <div class="section-title">
        <i class="fas fa-th-large"></i>
        <span>节点库</span>
      </div>
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="搜索节点..." 
        class="search-input"
      />
    </div>
    
    <!-- 节点分类列表 -->
    <NodeCategoryList 
      :categories="nodeCategories"
      :searchQuery="searchQuery"
      :favoriteNodeIds="favoriteNodeIds"
      @node-drag-start="handleNodeDragStart"
      @node-info="handleNodeInfo"
      @node-use="handleNodeUse"
      @toggle-favorite="handleToggleFavorite"
      class="node-list-container"
    />
  </div>
  
  <!-- 节点详情弹窗 -->
  <NodeDetailDialog
    :node="selectedNode"
    :visible="showNodeDetailDialog"
    :isFavorite="selectedNode ? isFavoriteNode(selectedNode.id) : false"
    @close="closeNodeDetail"
    @use="handleNodeUse"
    @toggle-favorite="handleToggleFavorite"
  />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import RecentTools from './components/RecentTools.vue';
import NodeCategoryList from './components/NodeCategoryList.vue';
import FavoriteNodes from './components/FavoriteNodes.vue';
import NodeDetailDialog from './components/NodeDetailDialog.vue';
import { loadNodesFromModule, getCategorizedNodes } from './components/NodeLoader.js';

// ========== 工具栏功能 ==========
const selectedTool = ref('');
const panelRef = ref(null);
const layoutMode = ref('column');
const searchQuery = ref('');
const favoriteNodesRef = ref(null);
const favoriteNodeIds = ref([]);
const selectedNode = ref(null);
const showNodeDetailDialog = ref(false);

// 断点设置
const GRID_BREAKPOINT = 150;
const COLUMN_BREAKPOINT = 80;

// 工具列表
const tools = [
  { name: '选择', icon: 'fas fa-mouse-pointer' },
  { name: '直线', icon: 'fas fa-slash' },
  { name: '矩形', icon: 'far fa-square' },
  { name: '圆形', icon: 'far fa-circle' },
  { name: '文字', icon: 'fas fa-font' },
  { name: '测量', icon: 'fas fa-ruler' }
];

// 发出工具选择事件
const emit = defineEmits(['tool-selected', 'node-drag-start', 'node-selected']);

const selectTool = (toolName) => {
  selectedTool.value = toolName;
  emit('tool-selected', toolName);
};

// ResizeObserver 用于自适应布局
let resizeObserver = null;

const updateLayout = (width) => {
  if (width > GRID_BREAKPOINT) {
    layoutMode.value = 'grid';
  } else if (width > COLUMN_BREAKPOINT) {
    layoutMode.value = 'column';
  } else {
    layoutMode.value = 'icon';
  }
};

// ========== 节点库功能 ==========
// 从NodeLoader获取节点分类
const nodeCategories = ref([]);

// 加载内置节点定义
const loadBuiltInNodes = async () => {
  // 这里可以加载内置的节点
  // 例如可以直接使用静态定义，也可以从模块导入
  
  // 示例：保留部分模拟数据以保持向后兼容
  nodeCategories.value = [
    {
      name: '图形/基础',
      type: 'component',
      nodes: [
        {
          id: 'graphics/rect',
          title: '矩形',
          description: '创建一个矩形图形',
          type: 'component',
          metadata: {
            sourcePath: '/components/graphics/Rect.vue',
            author: '织',
            version: '1.0.0',
            jsDoc: {
              inputTypes: {
                'width': 'number',
                'height': 'number',
                'color': 'string'
              },
              outputTypes: {
                'element': 'SVGElement'
              },
              defaultValues: {
                'width': 100,
                'height': 100,
                'color': '#ff0000'
              },
              examples: ['<rect width="100" height="50" fill="blue" />']
            }
          },
          createNode: () => ({
            type: 'graphics/rect',
            name: '矩形',
            category: '图形/基础'
          })
        },
        {
          id: 'graphics/circle',
          title: '圆形',
          description: '创建一个圆形图形',
          type: 'component',
          metadata: {
            sourcePath: '/components/graphics/Circle.vue',
            author: '织',
            version: '1.0.0',
            jsDoc: {
              inputTypes: {
                'radius': 'number',
                'color': 'string'
              },
              outputTypes: {
                'element': 'SVGElement'
              },
              defaultValues: {
                'radius': 50,
                'color': '#00ff00'
              },
              examples: ['<circle r="50" fill="green" />']
            }
          },
          createNode: () => ({
            type: 'graphics/circle',
            name: '圆形',
            category: '图形/基础'
          })
        }
      ]
    },
    {
      name: '工具/刷子',
      type: 'tool',
      nodes: [
        {
          id: 'tools/redColorBrush',
          title: '红色刷子',
          description: '点击将思源块背景设为红色',
          type: 'tool',
          metadata: {
            sourcePath: '/components/RedColorBrushNode.vue',
            author: '织',
            version: '1.0.0',
            jsDoc: {
              inputTypes: {},
              outputTypes: {},
              defaultValues: {},
              examples: ['点击后鼠标变为红色刷子，点击任意思源块将其背景设为红色']
            }
          },
          createNode: () => ({
            type: 'tools/redColorBrush',
            name: '红色刷子',
            category: '工具/刷子'
          })
        }
      ]
    }
  ];
  
  // 合并从JSDoc解析的节点
  try {
    // 导入并解析函数式工具
    // 刷子工具作为示例
    const brushModulePath = './components/colorBrush.js';
    const colorBrushModule = await import(brushModulePath);
    await loadNodesFromModule(colorBrushModule, brushModulePath);
    
    const yellowBrushPath = './components/yellowColorBrush.js';
    const yellowBrushModule = await import(yellowBrushPath);
    await loadNodesFromModule(yellowBrushModule, yellowBrushPath);
    
    // 更多工具可以在这里加载...
    
    // 加载数学工具函数
    const mathUtilPath = './components/mathUtil.js';
    const mathModule = await import(mathUtilPath);
    await loadNodesFromModule(mathModule, mathUtilPath);
    
    // 更新节点分类，合并自定义节点和预设节点
    const parsedCategories = getCategorizedNodes();
    
    // 合并自动解析的节点与手动定义的节点
    for (const parsedCategory of parsedCategories) {
      const existingCategory = nodeCategories.value.find(c => c.name === parsedCategory.name);
      
      if (existingCategory) {
        // 合并到现有分类
        for (const node of parsedCategory.nodes) {
          // 为每个节点添加源文件路径以便动态加载
          node.metadata = node.metadata || {};
          node.metadata.sourcePath = node.metadata.sourcePath || 
            parsedCategory.name.toLowerCase().includes('刷子') 
              ? `./components/${node.id.split('/').pop()}.js`
              : null;
            
          const existingNode = existingCategory.nodes.find(n => n.id === node.id);
          if (!existingNode) {
            existingCategory.nodes.push(node);
          }
        }
      } else {
        // 添加新分类
        nodeCategories.value.push(parsedCategory);
      }
    }
  } catch (error) {
    console.error('加载JSDoc解析的节点失败:', error);
  }
};

// 处理节点拖拽开始
const handleNodeDragStart = (data) => {
  emit('node-drag-start', data);
};

// 处理节点详情查看
const handleNodeInfo = (node) => {
  selectedNode.value = node;
  showNodeDetailDialog.value = true;
};

// 处理使用节点
const handleNodeUse = (nodeData) => {
  emit('node-selected', nodeData);
};

// 关闭节点详情弹窗
const closeNodeDetail = () => {
  showNodeDetailDialog.value = false;
};

// 处理收藏切换
const handleToggleFavorite = (node) => {
  const nodeId = node.id;
  const index = favoriteNodeIds.value.indexOf(nodeId);
  
  if (index === -1) {
    // 添加收藏
    favoriteNodeIds.value.push(nodeId);
    favoriteNodesRef.value?.addToFavorites(node);
  } else {
    // 取消收藏
    favoriteNodeIds.value.splice(index, 1);
    favoriteNodesRef.value?.removeFromFavorites(nodeId);
  }
};

// 从本地存储加载收藏节点ID
const loadFavoriteNodeIds = () => {
  try {
    const storedFavorites = localStorage.getItem('favoriteNodes');
    if (storedFavorites) {
      favoriteNodeIds.value = JSON.parse(storedFavorites);
    }
  } catch (error) {
    console.error('加载收藏节点失败:', error);
    favoriteNodeIds.value = [];
  }
};

// 检查节点是否已收藏
const isFavoriteNode = (nodeId) => {
  return favoriteNodeIds.value.includes(nodeId);
};

// 生命周期钩子
onMounted(() => {
  // 加载收藏节点ID
  loadFavoriteNodeIds();
  
  // 加载节点定义
  loadBuiltInNodes();

  // 设置 ResizeObserver 监视面板大小
  if (panelRef.value) {
    resizeObserver = new ResizeObserver(entries => {
      window.requestAnimationFrame(() => {
        if (!Array.isArray(entries) || !entries.length) return;
        for (let entry of entries) {
          updateLayout(entry.contentRect.width);
        }
      });
    });
    resizeObserver.observe(panelRef.value);
    updateLayout(panelRef.value.offsetWidth);
  }
});

onBeforeUnmount(() => {
  // 清理 ResizeObserver
  if (resizeObserver && panelRef.value) {
    resizeObserver.unobserve(panelRef.value);
  }
  resizeObserver = null;
});

defineOptions({
  name: 'ToolPanel'
});
</script>

<style>
/* ========== 设计系统变量 ========== */
:root {
  /* 主色调 */
  --tool-primary: #4263eb;
  --tool-primary-hover: #3b5bdb;
  --tool-primary-light: #edf2ff;
  --tool-primary-border: #dbe4ff;
  
  /* 中性色调 */
  --tool-bg: #f8f9fa;
  --tool-bg-card: #ffffff;
  --tool-bg-hover: #f1f3f5;
  --tool-bg-active: #e9ecef;
  
  /* 文本颜色 */
  --tool-text: #212529;
  --tool-text-secondary: #495057;
  --tool-text-tertiary: #868e96;
  --tool-text-on-primary: #ffffff;
  
  /* 边框和阴影 */
  --tool-border: #dee2e6;
  --tool-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
  --tool-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
  --tool-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03);
  --tool-shadow-inset: inset 0 1px 2px rgba(0, 0, 0, 0.07);
  
  /* 尺寸和间距 */
  --tool-radius-sm: 4px;
  --tool-radius: 6px;
  --tool-radius-lg: 8px;
  --tool-spacing: 8px;
  --tool-spacing-lg: 16px;
  
  /* 过渡时间 */
  --tool-transition-fast: 150ms;
  --tool-transition: 250ms;
}
</style>

<style scoped>
/* ========== 工具栏容器 ========== */
.tool-panel {
  display: flex;
  flex-direction: column;
  min-width: 40px;
  height: 100%;
  background-color: var(--tool-bg);
  border-right: 1px solid var(--tool-border);
  padding: var(--tool-spacing-lg);
  overflow-y: auto;
  box-sizing: border-box;
  position: relative;
}

/* 分隔线 */
.panel-divider {
  height: 1px;
  background-color: var(--tool-border);
  margin: var(--tool-spacing-lg) 0;
  width: 100%;
}

/* 节点库标题 */
.section-title {
  display: flex;
  align-items: center;
  gap: var(--tool-spacing);
  padding: 0 var(--tool-spacing);
  margin-bottom: var(--tool-spacing);
  font-weight: 600;
  color: var(--tool-text-secondary);
  font-size: 14px;
}

.section-title i {
  color: var(--tool-primary);
  font-size: 16px;
}

/* 搜索框容器 */
.search-container {
  margin-bottom: var(--tool-spacing-lg);
}

/* 搜索输入框 */
.search-input {
  width: 100%;
  padding: calc(var(--tool-spacing) * 1.25);
  border: 1px solid var(--tool-border);
  border-radius: var(--tool-radius);
  background: var(--tool-bg-card);
  color: var(--tool-text);
  font-size: 13px;
  transition: all var(--tool-transition-fast) ease;
  margin-top: var(--tool-spacing);
}

.search-input:focus {
  outline: none;
  border-color: var(--tool-primary-border);
  box-shadow: 0 0 0 2px rgba(66, 99, 235, 0.15);
}

.search-input::placeholder {
  color: var(--tool-text-tertiary);
}

/* 节点列表容器 */
.node-list-container {
  flex: 1;
  overflow-y: auto;
}
</style> 