<template>
  <span class="svg-icon" :class="[{ 'svg-icon--small': small }, className]" :style="{ color: color }">
    <svg v-if="name">
      <use :xlink:href="`#${name}`"></use>
    </svg>
    <span v-else-if="emoji" class="emoji-icon">{{ renderEmoji }}</span>
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  name: {
    type: String,
    default: ''
  },
  emoji: {
    type: String,
    default: ''
  },
  small: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: '' // 允许直接传入颜色值
  },
  className: {
    type: String,
    default: '' // 允许传入自定义class
  }
});

const renderEmoji = computed(() => {
  if (!props.emoji) return '';
  // 将 Unicode 格式的表情符号转换为显示字符
  if (props.emoji.startsWith('U+')) {
    return String.fromCodePoint(parseInt(props.emoji.replace('U+', ''), 16));
  }
  return props.emoji;
});
</script>

<style scoped>
.svg-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--b3-icon-size);
  height: var(--b3-icon-size);
  fill: currentColor; /* 使用currentColor继承父级颜色 */
  color: var(--b3-theme-on-surface); /* 默认颜色 */
  flex-shrink: 0;
}

.svg-icon--small {
  width: var(--b3-icon-size-small);
  height: var(--b3-icon-size-small);
}

.svg-icon svg {
  width: 100%;
  height: 100%;
}

.emoji-icon {
  font-size: var(--b3-icon-size); /* 表情符号大小与图标一致 */
  line-height: 1;
}

.svg-icon--small .emoji-icon {
  font-size: var(--b3-icon-size-small);
}
</style> 