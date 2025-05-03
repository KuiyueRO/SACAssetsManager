<template>
  <div v-if="visible" class="s-progress" :style="{ zIndex }">
    <div class="b3-dialog__scrim"></div>
    <div class="b3-dialog__loading">
      <div v-if="showProgress" class="s-progress__counter">{{ current }}/{{ total }}</div>
      <div class="s-progress__bar">
        <div v-if="showProgress" 
          class="s-progress__fill"
          :style="{ width: `${(current / total) * 100}%` }">
        </div>
        <div v-else class="s-progress__indeterminate"></div>
      </div>
      <div class="s-progress__message">{{ message }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  zIndex: {
    type: Number,
    default: () => window.siyuan ? ++window.siyuan.zIndex : 999
  }
});

const visible = ref(false);
const showProgress = ref(false);
const current = ref(0);
const total = ref(0);
const message = ref('');

const showLoading = (msg) => {
  visible.value = true;
  showProgress.value = false;
  message.value = msg;
};

const updateProgress = (msg, curr, tot) => {
  visible.value = true;
  showProgress.value = true;
  message.value = msg;
  current.value = curr;
  total.value = tot;
};

const close = () => {
  visible.value = false;
};

defineExpose({
  showLoading,
  updateProgress,
  close
});
</script>

<style scoped>
.s-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.b3-dialog__scrim {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--b3-mask-background);
  opacity: 1;
}

.b3-dialog__loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--b3-theme-surface);
  color: var(--b3-theme-on-surface);
  padding: var(--b3-padding);
  border-radius: var(--b3-border-radius);
  box-shadow: var(--b3-dialog-shadow);
  min-width: 240px;
  max-width: 90vw;
  text-align: center;
  animation: dialogFadeIn 0.15s ease-in-out;
}

.s-progress__counter {
  text-align: right;
  margin-bottom: var(--b3-margin-half);
  font-size: var(--b3-font-size-small);
  color: var(--b3-theme-on-surface-light);
}

.s-progress__bar {
  margin: var(--b3-margin-half) 0;
  height: 8px;
  border-radius: var(--b3-border-radius);
  overflow: hidden;
  background-color: var(--b3-theme-background-light);
}

.s-progress__fill {
  width: 0;
  transition: var(--b3-transition);
  background-color: var(--b3-theme-primary);
  height: 100%;
}

.s-progress__indeterminate {
  background-color: var(--b3-theme-primary);
  height: 100%;
  background-image: linear-gradient(
    -45deg,
    var(--b3-theme-primary-light) 25%,
    transparent 25%,
    transparent 50%,
    var(--b3-theme-primary-light) 50%,
    var(--b3-theme-primary-light) 75%,
    transparent 75%,
    transparent
  );
  animation: stripMove 450ms linear infinite;
  background-size: 50px 50px;
}

.s-progress__message {
  margin-top: var(--b3-margin-half);
  color: var(--b3-theme-on-surface);
  font-size: var(--b3-font-size);
  word-break: break-word;
}

@keyframes stripMove {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 50px 50px;
  }
}

@keyframes dialogFadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -60%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}
</style> 