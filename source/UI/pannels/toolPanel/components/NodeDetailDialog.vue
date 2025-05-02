<template>
  <div v-if="visible" class="node-detail-dialog-overlay" @click="closeDialog">
    <div class="node-detail-dialog" @click.stop>
      <!-- 弹窗标题栏 -->
      <div class="dialog-header">
        <div class="dialog-title">
          <div class="node-icon" :class="node?.type">
            {{ nodeTypeIcon }}
          </div>
          <h3>{{ node?.title }}</h3>
        </div>
        <button class="favorite-button" @click="handleToggleFavorite" :title="isFavorite ? '取消收藏' : '收藏节点'">
          <i class="fas fa-star" :class="{ 'is-favorite': isFavorite }"></i>
        </button>
        <button class="close-button" @click="closeDialog">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <!-- 弹窗内容区 -->
      <div class="dialog-content">
        <div class="node-info-section">
          <div class="node-description">{{ node?.description }}</div>
          
          <div class="node-meta">
            <div class="meta-item" v-if="node?.metadata?.author">
              <span class="meta-label">作者:</span>
              <span class="meta-value">{{ node.metadata.author }}</span>
            </div>
            <div class="meta-item" v-if="node?.metadata?.version">
              <span class="meta-label">版本:</span>
              <span class="meta-value">{{ node.metadata.version }}</span>
            </div>
            <div class="meta-item" v-if="node?.metadata?.sourcePath">
              <span class="meta-label">路径:</span>
              <span class="meta-value">{{ node.metadata.sourcePath }}</span>
            </div>
          </div>
        </div>
        
        <!-- 输入端口 -->
        <div v-if="hasInputTypes" class="port-section">
          <h4>输入端口</h4>
          <table class="port-table">
            <thead>
              <tr>
                <th>名称</th>
                <th>类型</th>
                <th>默认值</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(type, name) in node.metadata.jsDoc.inputTypes" :key="name">
                <td>{{ name }}</td>
                <td><span class="type-badge">{{ type }}</span></td>
                <td>
                  <span v-if="node.metadata.jsDoc.defaultValues && node.metadata.jsDoc.defaultValues[name]" class="default-value">
                    {{ node.metadata.jsDoc.defaultValues[name] }}
                  </span>
                  <span v-else>-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- 输出端口 -->
        <div v-if="hasOutputTypes" class="port-section">
          <h4>输出端口</h4>
          <table class="port-table">
            <thead>
              <tr>
                <th>名称</th>
                <th>类型</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(type, name) in node.metadata.jsDoc.outputTypes" :key="name">
                <td>{{ name }}</td>
                <td><span class="type-badge">{{ type }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <!-- 示例 -->
        <div v-if="hasExamples" class="examples-section">
          <h4>示例</h4>
          <div v-for="(example, index) in node.metadata.jsDoc.examples" 
               :key="index" 
               class="example-item">
            <pre>{{ example }}</pre>
          </div>
        </div>
      </div>
      
      <!-- 弹窗底部操作区 -->
      <div class="dialog-footer">
        <button class="cancel-button" @click="closeDialog">关闭</button>
        <button class="primary-button" @click="handleUse">使用节点</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  node: {
    type: Object,
    default: null
  },
  visible: {
    type: Boolean,
    default: false
  },
  isFavorite: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'use', 'toggle-favorite']);

// 计算节点类型图标
const nodeTypeIcon = computed(() => {
  if (!props.node) return '';
  
  switch (props.node.type) {
    case 'function': return 'fx';
    case 'component': return '⚛';
    default: return '📄';
  }
});

// 检查是否有输入端口
const hasInputTypes = computed(() => {
  if (!props.node || !props.node.metadata?.jsDoc?.inputTypes) return false;
  return Object.keys(props.node.metadata.jsDoc.inputTypes).length > 0;
});

// 检查是否有输出端口
const hasOutputTypes = computed(() => {
  if (!props.node || !props.node.metadata?.jsDoc?.outputTypes) return false;
  return Object.keys(props.node.metadata.jsDoc.outputTypes).length > 0;
});

// 检查是否有示例
const hasExamples = computed(() => {
  if (!props.node || !props.node.metadata?.jsDoc?.examples) return false;
  return props.node.metadata.jsDoc.examples.length > 0;
});

// 关闭弹窗
const closeDialog = () => {
  emit('close');
};

// 使用节点
const handleUse = () => {
  if (props.node) {
    emit('use', props.node.createNode());
  }
  closeDialog();
};

// 切换收藏状态
const handleToggleFavorite = () => {
  if (props.node) {
    emit('toggle-favorite', props.node);
  }
};
</script>

<style scoped>
.node-detail-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.node-detail-dialog {
  background-color: var(--tool-bg-card);
  border-radius: var(--tool-radius-lg);
  box-shadow: var(--tool-shadow-lg);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* 弹窗标题栏 */
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--tool-spacing-lg);
  border-bottom: 1px solid var(--tool-border);
}

.dialog-title {
  display: flex;
  align-items: center;
  gap: var(--tool-spacing-lg);
  flex: 1;
}

.dialog-title h3 {
  margin: 0;
  font-size: 18px;
  color: var(--tool-text);
}

.node-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--tool-primary-light);
  border-radius: var(--tool-radius);
  color: var(--tool-primary);
  font-weight: bold;
  font-size: 18px;
  border: 1px solid var(--tool-primary-border);
}

.close-button, .favorite-button {
  width: 32px;
  height: 32px;
  border-radius: var(--tool-radius-sm);
  border: none;
  background: transparent;
  color: var(--tool-text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--tool-transition-fast) ease;
  margin-left: var(--tool-spacing);
}

.close-button:hover, .favorite-button:hover {
  background-color: var(--tool-bg-hover);
  color: var(--tool-text-secondary);
}

.favorite-button .is-favorite {
  color: #f59f00; /* 金色星标 */
}

/* 弹窗内容区 */
.dialog-content {
  padding: var(--tool-spacing-lg);
  overflow-y: auto;
  flex: 1;
}

.node-info-section {
  margin-bottom: var(--tool-spacing-lg);
}

.node-description {
  font-size: 15px;
  color: var(--tool-text-secondary);
  line-height: 1.6;
  margin-bottom: var(--tool-spacing-lg);
}

.node-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--tool-spacing-lg);
  padding: var(--tool-spacing);
  background-color: var(--tool-bg);
  border-radius: var(--tool-radius);
  font-size: 14px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--tool-spacing);
}

.meta-label {
  color: var(--tool-text-tertiary);
  font-weight: 500;
}

.meta-value {
  color: var(--tool-text-secondary);
}

/* 端口部分 */
.port-section {
  margin-bottom: var(--tool-spacing-lg);
}

h4 {
  font-size: 16px;
  color: var(--tool-text);
  margin-top: 0;
  margin-bottom: var(--tool-spacing);
  padding-bottom: var(--tool-spacing);
  border-bottom: 1px solid var(--tool-border);
}

.port-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.port-table th {
  text-align: left;
  padding: var(--tool-spacing);
  color: var(--tool-text-secondary);
  font-weight: 600;
  background-color: var(--tool-bg);
  border-bottom: 1px solid var(--tool-border);
}

.port-table td {
  padding: var(--tool-spacing);
  border-bottom: 1px solid var(--tool-border);
  color: var(--tool-text);
}

.type-badge {
  display: inline-block;
  padding: 2px 8px;
  background-color: var(--tool-primary-light);
  color: var(--tool-primary);
  border-radius: var(--tool-radius-sm);
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 12px;
}

.default-value {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  color: var(--tool-text-tertiary);
  font-size: 12px;
}

/* 示例部分 */
.examples-section {
  margin-top: var(--tool-spacing-lg);
}

.example-item {
  margin-bottom: var(--tool-spacing);
  background-color: var(--tool-bg);
  border-radius: var(--tool-radius);
  border-left: 3px solid var(--tool-primary);
  overflow: auto;
}

.example-item pre {
  margin: 0;
  padding: var(--tool-spacing-lg);
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 13px;
  color: var(--tool-text-secondary);
  line-height: 1.5;
  white-space: pre-wrap;
}

/* 弹窗底部操作区 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--tool-spacing);
  padding: var(--tool-spacing-lg);
  border-top: 1px solid var(--tool-border);
}

.cancel-button, .primary-button {
  padding: calc(var(--tool-spacing) * 0.75) var(--tool-spacing-lg);
  border-radius: var(--tool-radius);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--tool-transition-fast) ease;
}

.cancel-button {
  background-color: var(--tool-bg);
  color: var(--tool-text-secondary);
  border: 1px solid var(--tool-border);
}

.cancel-button:hover {
  background-color: var(--tool-bg-hover);
}

.primary-button {
  background-color: var(--tool-primary);
  color: var(--tool-text-on-primary);
  border: 1px solid var(--tool-primary-hover);
}

.primary-button:hover {
  background-color: var(--tool-primary-hover);
  transform: translateY(-1px);
}
</style> 