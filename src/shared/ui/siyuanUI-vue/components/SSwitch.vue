<template>
  <input 
    class="b3-switch fn__flex-center" 
    type="checkbox"
    :checked="modelValue"
    @change="handleChange"
    :disabled="disabled"
  />
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const handleChange = (event) => {
  emit('update:modelValue', event.target.checked);
  emit('change', event.target.checked);
};
</script>

<style scoped>
/* 基础样式会从思源的CSS中继承 */
</style> 