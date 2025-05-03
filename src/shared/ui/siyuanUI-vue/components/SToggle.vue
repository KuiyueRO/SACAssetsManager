<template>
  <input 
    class="b3-switch" 
    type="checkbox" 
    :checked="modelValue" 
    :disabled="disabled"
    @change="handleChange"
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
.b3-switch {
  appearance: none;
  outline: none;
  border: none;
  position: relative;
  width: 36px;
  height: 18px;
  border-radius: 11px;
  background-color: var(--b3-theme-background-light);
  border: 1px solid var(--b3-border-color);
  cursor: pointer;
  transition: all 150ms ease-in-out;
}

.b3-switch:checked {
  background-color: var(--b3-theme-primary);
  border-color: var(--b3-theme-primary);
}

.b3-switch:before {
  content: "";
  position: absolute;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background-color: var(--b3-theme-on-surface);
  top: 1px;
  left: 1px;
  transition: all 150ms ease-in-out;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.b3-switch:checked:before {
  left: calc(100% - 16px);
  background-color: var(--b3-theme-on-primary);
}

.b3-switch:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.b3-switch:hover:not(:disabled) {
  background-color: var(--b3-theme-background-lighter);
}

.b3-switch:checked:hover:not(:disabled) {
  background-color: var(--b3-theme-primary-light);
}

.b3-switch:focus {
  box-shadow: 0 0 0 2px var(--b3-theme-primary-lightest);
}
</style> 