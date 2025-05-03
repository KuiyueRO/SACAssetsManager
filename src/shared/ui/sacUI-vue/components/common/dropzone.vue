<template>
  <div
    :class="{ 'is-dragging-over': isDraggingOver, 'drag-area': true }"
    @dragenter.prevent="handleDragEnter"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <slot :isDraggingOver="isDraggingOver"></slot>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  // 接受的文件类型，类似 <input type="file" accept="...">
  // 例如: 'image/*', '.pdf', 'audio/mpeg, video/mp4'
  accept: {
    type: String,
    default: ''
  },
  // 单个文件最大大小 (bytes)，0 表示无限制
  maxFileSize: {
    type: Number,
    default: 0
  },
  // 所有文件总大小限制 (bytes)，0 表示无限制
  maxTotalSize: {
    type: Number,
    default: 0
  },
  // 是否允许多个文件
  multiple: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['drop', 'error']);
const isDraggingOver = ref(false);
let dragEnterCounter = 0; // 用于正确处理 dragleave

// --- 辅助函数 ---

// 检查文件类型是否符合 accept 规则
function isFileTypeAccepted(file) {
  if (!props.accept || !file) {
    return true; // 没有限制或文件无效则认为接受
  }
  const acceptedTypes = props.accept.split(',').map(t => t.trim().toLowerCase());
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  return acceptedTypes.some(type => {
    if (type.startsWith('.')) {
      // 按扩展名检查
      return fileName.endsWith(type);
    } else if (type.endsWith('/*')) {
      // 按主类型检查 (e.g., 'image/*')
      return fileType.startsWith(type.slice(0, -1));
    } else {
      // 按完整 MIME 类型检查
      return fileType === type;
    }
  });
}

// --- 事件处理 ---

function handleDragEnter(event) {
  event.preventDefault();
  dragEnterCounter++;
  isDraggingOver.value = true;
  // 可以在这里检查 event.dataTransfer.items 的类型，如果浏览器支持且有必要
  // 但为了兼容性和简单性，主要验证放在 handleDrop 中
}

function handleDragOver(event) {
  // 阻止默认行为以允许放置
  event.preventDefault();
  // 可选：根据 event.dataTransfer.dropEffect 设置效果
  // event.dataTransfer.dropEffect = 'copy';
}

function handleDragLeave(event) {
  dragEnterCounter--;
  if (dragEnterCounter === 0) {
    isDraggingOver.value = false;
  }
}

function handleDrop(event) {
  event.preventDefault();
  isDraggingOver.value = false;
  dragEnterCounter = 0; // 重置计数器

  const files = Array.from(event.dataTransfer.files);
  const acceptedFiles = [];
  const rejectedFiles = [];
  let currentTotalSize = 0;

  if (!props.multiple && files.length > 1) {
    // 如果不允许多个文件，但拖入了多个，全部拒绝？还是只取第一个？
    // 这里选择全部拒绝，可以根据需求调整
    files.forEach(file => rejectedFiles.push({ file, reason: '不允许拖放多个文件' }));
    emit('error', rejectedFiles);
    return;
  }

  files.forEach(file => {
    let rejected = false;
    let reason = '';

    // 1. 检查文件类型
    if (!isFileTypeAccepted(file)) {
      rejected = true;
      reason = '文件类型不符合要求';
    }

    // 2. 检查单个文件大小
    if (!rejected && props.maxFileSize > 0 && file.size > props.maxFileSize) {
      rejected = true;
      reason = `文件大小超过限制 (${(props.maxFileSize / 1024 / 1024).toFixed(2)} MB)`;
    }

    // 3. 检查总大小 (仅对将要接受的文件计算)
    if (!rejected && props.maxTotalSize > 0 && (currentTotalSize + file.size) > props.maxTotalSize) {
       // 如果只允许单个文件，这里不会触发；如果允许多个，则后续文件可能因总大小超限而被拒
       rejected = true;
       reason = `总文件大小超过限制 (${(props.maxTotalSize / 1024 / 1024).toFixed(2)} MB)`;
    }


    if (rejected) {
      rejectedFiles.push({ file, reason });
    } else {
      acceptedFiles.push(file);
      currentTotalSize += file.size;
    }
  });

  if (acceptedFiles.length > 0) {
    emit('drop', acceptedFiles);
  }
  if (rejectedFiles.length > 0) {
    emit('error', rejectedFiles);
  }
}
</script>

<style scoped>
.drag-area {
  /* 基本样式，可以根据需要添加 */
  border: 2px dashed transparent; /* 默认无边框 */
  transition: background-color 0.2s ease, border-color 0.2s ease;
  min-height: 50px; /* 给一个最小高度，方便拖拽 */
  display: block; /* 或者 flex, grid 等 */
  position: relative; /* 用于可能的伪元素覆盖 */
}

.is-dragging-over {
  /* 拖拽悬停时的视觉反馈 */
  background-color: rgba(0, 120, 215, 0.1); /* 示例：淡蓝色背景 */
  border-color: var(--b3-theme-primary); /* 使用主题色边框 */
}

/* 可以添加更多状态，例如无效拖拽时的样式，但这依赖于 dragover 时的判断 */
/*
.is-dragging-invalid {
  background-color: rgba(255, 0, 0, 0.1);
  border-color: var(--b3-theme-error);
}
*/
</style> 