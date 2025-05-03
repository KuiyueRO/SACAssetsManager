<template>
  <div class="b3-form__icon" v-if="icon">
    <svg class="b3-form__icon-icon"><use :xlink:href="`#icon${icon}`"></use></svg>
    <select 
      :id="id"
      class="b3-select b3-form__icon-input fn__block"
      :class="{ 'fn__flex-center': center, 'fn__size200': size200 }"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
      :disabled="disabled"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
  <select 
    :id="id"
    v-else
    class="b3-select fn__block"
    :class="[center ? 'fn__flex-center' : '', size ? `fn__size${size}` : '', selectClass]"
    :value="modelValue"
    @change="handleChange"
    :disabled="disabled"
    :style="{ minWidth: minWidth }"
  >
    <slot></slot>
  </select>
</template>

<script setup>
const props = defineProps({
  options: {
    type: Array,
    default: () => []
  },
  modelValue: {
    type: [String, Number],
    default: ''
  },
  id: {
    type: String,
    default: ''
  },
  center: {
    type: Boolean,
    default: true
  },
  size: {
    type: [String, Number],
    default: 200
  },
  disabled: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: ''
  },
  block: {
    type: Boolean,
    default: false
  },
  size200: {
    type: Boolean,
    default: false
  },
  minWidth: {
    type: String,
    default: '200px'
  },
  selectClass: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const handleChange = (event) => {
  emit('update:modelValue', event.target.value);
  emit('change', event.target.value);
};
</script>

<style scoped>
.b3-select {
  padding: var(--b3-padding-half);
  border: 1px solid var(--b3-border-color);
  border-radius: var(--b3-border-radius);
  background-color: var(--b3-theme-background);
  color: var(--b3-theme-on-background);
  font-size: var(--b3-font-size);
  outline: none;
  transition: all 150ms ease-in-out;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='rgba(150, 150, 150, 0.8)' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  padding-right: 28px;
}

.b3-select:focus {
  border-color: var(--b3-theme-primary);
  box-shadow: 0 0 0 2px var(--b3-theme-primary-lightest);
}

.b3-select:hover:not(:disabled) {
  border-color: var(--b3-theme-primary-lighter);
}

.b3-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background-color: var(--b3-theme-surface-lighter);
}

.b3-form__icon {
  position: relative;
}

.b3-form__icon-icon {
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--b3-theme-on-surface);
  pointer-events: none;
}

.b3-form__icon-input {
  padding-left: 32px !important;
}
</style>
