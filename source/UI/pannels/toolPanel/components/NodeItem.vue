<template>
  <div 
    class="node-item"
    draggable="true"
    @dragstart="handleDragStart"
    @click="toggleDetails"
  >
    <div class="node-preview">
      <span class="node-type-icon" :class="node.type">
        {{ nodeTypeIcon }}
      </span>
    </div>
    <div class="node-info">
      <div class="node-title">{{ node.title }}</div>
      <div class="node-description">{{ node.description }}</div>
      <div class="node-metadata" v-if="node.metadata">
        <div class="source-info">
          <span class="source-path" v-if="node.metadata?.sourcePath">
            📁 {{ formatPath(node.metadata.sourcePath) }}
          </span>
          <span v-if="node.metadata?.author" class="author">
            👤 {{ node.metadata.author }}
          </span>
          <span v-if="node.metadata?.version" class="version">
            📌 v{{ node.metadata.version }}
          </span>
        </div>
        <div class="node-details" v-if="showDetails && node.metadata.jsDoc">
          <div v-if="node.metadata.jsDoc">
            <div class="input-ports" v-if="hasInputTypes">
              <div class="section-title">输入端口:</div>
              <div v-for="(type, name) in node.metadata.jsDoc.inputTypes" :key="name" class="port-item">
                <span class="port-name">{{ name }}</span>
                <span class="port-type">{{ type }}</span>
                <span v-if="node.metadata.jsDoc.defaultValues && node.metadata.jsDoc.defaultValues[name]" class="port-default">
                  默认值: {{ node.metadata.jsDoc.defaultValues[name] }}
                </span>
              </div>
            </div>
            <div class="output-ports" v-if="hasOutputTypes">
              <div class="section-title">输出端口:</div>
              <div v-for="(type, name) in node.metadata.jsDoc.outputTypes" :key="name" class="port-item">
                <span class="port-name">{{ name }}</span>
                <span class="port-type">{{ type }}</span>
              </div>
            </div>
            <div class="examples" v-if="hasExamples">
              <div class="section-title">示例:</div>
              <div v-for="(example, index) in node.metadata.jsDoc.examples" 
                   :key="index" 
                   class="example-item">
                {{ example }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  node: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['node-drag-start']);

const showDetails = ref(false);

const toggleDetails = () => {
  showDetails.value = !showDetails.value;
};

const formatPath = (path) => {
  if (!path) return '未知路径';
  const parts = path.split('/');
  return parts.slice(-2).join('/');
};

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

const nodeTypeIcon = computed(() => {
  switch (props.node.type) {
    case 'function': return 'fx';
    case 'component': return '⚛';
    default: return '📄';
  }
});

const hasInputTypes = computed(() => {
  return props.node.metadata?.jsDoc?.inputTypes && 
         Object.keys(props.node.metadata.jsDoc.inputTypes || {}).length > 0;
});

const hasOutputTypes = computed(() => {
  return props.node.metadata?.jsDoc?.outputTypes && 
         Object.keys(props.node.metadata.jsDoc.outputTypes || {}).length > 0;
});

const hasExamples = computed(() => {
  return props.node.metadata?.jsDoc?.examples && 
         props.node.metadata.jsDoc.examples.length > 0;
});
</script>

<style scoped>
.node-item {
  display: flex;
  align-items: center;
  padding: var(--tool-spacing);
  margin: calc(var(--tool-spacing) * 0.75) 0;
  background: var(--tool-bg-card);
  border-radius: var(--tool-radius);
  cursor: grab;
  transition: all var(--tool-transition-fast) ease;
  border: 1px solid transparent;
}

.node-item:hover {
  background: var(--tool-bg-hover);
  transform: translateY(-1px);
  box-shadow: var(--tool-shadow-sm);
  border-color: var(--tool-border);
}

.node-item:active {
  cursor: grabbing;
}

.node-preview {
  width: 36px;
  height: 36px;
  margin-right: var(--tool-spacing-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--tool-primary-light);
  border-radius: var(--tool-radius);
  color: var(--tool-primary);
  font-weight: bold;
  font-size: 14px;
  border: 1px solid var(--tool-primary-border);
  flex-shrink: 0;
}

.node-info {
  flex: 1;
  min-width: 0;
}

.node-title {
  font-weight: 600;
  margin-bottom: 2px;
  font-size: 13px;
  color: var(--tool-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-description {
  font-size: 12px;
  color: var(--tool-text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.node-metadata {
  margin-top: calc(var(--tool-spacing) * 0.75);
  font-size: 11px;
  color: var(--tool-text-tertiary);
}

.source-info {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--tool-spacing) * 0.75);
  margin-bottom: calc(var(--tool-spacing) * 0.75);
}

.source-path, .author, .version {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--tool-bg);
  padding: 2px 6px;
  border-radius: var(--tool-radius-sm);
  white-space: nowrap;
}

.node-details {
  margin-top: var(--tool-spacing);
  padding: var(--tool-spacing);
  background: var(--tool-bg);
  border-radius: var(--tool-radius);
  border: 1px solid var(--tool-border);
  animation: fadeIn var(--tool-transition-fast) ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-title {
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--tool-text-secondary);
  font-size: 12px;
}

.port-item {
  display: flex;
  align-items: center;
  gap: var(--tool-spacing);
  margin: 4px 0;
  padding: 6px;
  background: var(--tool-bg-card);
  border-radius: var(--tool-radius-sm);
  font-size: 11px;
}

.port-name {
  font-weight: 600;
  color: var(--tool-text);
}

.port-type {
  color: var(--tool-primary);
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  background: var(--tool-primary-light);
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 10px;
}

.port-default {
  color: var(--tool-text-tertiary);
  font-style: italic;
  margin-left: auto;
}

.example-item {
  margin: 4px 0;
  padding: var(--tool-spacing);
  background: var(--tool-bg-card);
  border-radius: var(--tool-radius-sm);
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  white-space: pre-wrap;
  font-size: 11px;
  color: var(--tool-text-secondary);
  border-left: 2px solid var(--tool-primary);
}
</style> 