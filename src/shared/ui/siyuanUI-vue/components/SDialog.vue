<template>
  <div class="b3-dialog-container" v-if="visible">
    <div class="b3-dialog">
      <div class="b3-dialog__header">
        <div class="b3-dialog__title">{{ title }}</div>
        <button class="b3-dialog__close" @click="handleClose">
          <svg><use xlink:href="#iconClose"></use></svg>
        </button>
      </div>
      <div class="b3-dialog__content">
        <slot></slot>
      </div>
      <div class="b3-dialog__action" v-if="$slots.action">
        <slot name="action"></slot>
      </div>
      <div class="b3-dialog__action" v-else>
        <Sbutton :disabled="confirmDisabled" type="primary" @click="handleConfirm">{{ confirmText }}</Sbutton>
        <Sbutton @click="handleClose">{{ cancelText }}</Sbutton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import Sbutton from './Sbutton.vue';

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  visible: {
    type: Boolean,
    default: false
  },
  confirmText: {
    type: String,
    default: '确认'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  confirmDisabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'confirm', 'update:visible']);

const handleClose = () => {
  emit('close');
  emit('update:visible', false);
};

const handleConfirm = () => {
  if (!props.confirmDisabled) {
    emit('confirm');
    emit('update:visible', false);
  }
};

// 监听ESC键关闭对话框
const escHandler = (e) => {
  if (e.key === 'Escape' && props.visible) {
    handleClose();
  }
};

watch(() => props.visible, (newValue) => {
  if (newValue) {
    document.addEventListener('keydown', escHandler);
  } else {
    document.removeEventListener('keydown', escHandler);
  }
});
</script>

<style scoped>
.b3-dialog-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--b3-mask-background);
  z-index: 999;
  overflow: auto;
}

.b3-dialog {
  position: relative;
  margin: var(--b3-margin);
  background-color: var(--b3-theme-background);
  border-radius: var(--b3-border-radius);
  box-shadow: var(--b3-dialog-shadow);
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform 0.15s ease-in-out;
  animation: dialogFadeIn 0.15s ease-in-out;
}

@keyframes dialogFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.b3-dialog__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--b3-padding);
  border-bottom: 1px solid var(--b3-border-color);
}

.b3-dialog__title {
  font-size: var(--b3-font-size);
  font-weight: var(--b3-font-weight-medium);
  color: var(--b3-theme-on-background);
}

.b3-dialog__close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--b3-theme-on-surface);
  transition: color 0.15s ease-in-out;
}

.b3-dialog__close:hover {
  color: var(--b3-theme-primary);
}

.b3-dialog__close svg {
  width: 16px;
  height: 16px;
}

.b3-dialog__content {
  padding: var(--b3-padding);
  overflow-y: auto;
  flex: 1;
  color: var(--b3-theme-on-background);
}

.b3-dialog__action {
  display: flex;
  justify-content: flex-end;
  padding: var(--b3-padding-half) var(--b3-padding);
  border-top: 1px solid var(--b3-border-color);
  gap: var(--b3-margin-half);
}
</style> 