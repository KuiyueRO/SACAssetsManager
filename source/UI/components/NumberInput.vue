<template>
  <SNumberInput 
    v-model="inputValue"
    :min="min"
    :max="max"
    :step="step"
    :placeholder="placeholder"
    :disabled="disabled"
    :small="small"
    :error="error"
    :block="block"
    :className="inputClass"
  />
</template>

<script setup>
import { ref, watch, computed } from 'vue';
// import SNumberInput from '@/source/shared/siyuanUI-vue/components/SNumberInput.vue'; // 旧的错误路径, 已废弃
// import SNumberInput from '../../shared/siyuanUI-vue/components/SNumberInput.vue'; // 旧的相对路径, 已失效
import SNumberInput from '../../src/shared/ui/siyuanUI-vue/components/SNumberInput.vue'; // 指向新的标准UI库位置

const props = defineProps({
  modelValue: {
    type: Number,
    required: true
  },
  min: {
    type: Number,
    default: undefined // SNumberInput 使用 undefined 来表示无限制
  },
  max: {
    type: Number,
    default: undefined // SNumberInput 使用 undefined 来表示无限制
  },
  step: {
    type: Number,
    default: 1
  },
  placeholder: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  small: {
    type: Boolean,
    default: false
  },
  error: {
    type: Boolean,
    default: false
  },
  block: {
    type: Boolean,
    default: false
  },
  inputClass: {
    type: String,
    default: ''
  }
  // precision 和 unit 属性在 SNumberInput 中不直接支持
  // 如果需要精确控制小数位数或单位显示，需要在父组件处理
});

const emit = defineEmits(['update:modelValue']);

// SNumberInput v-model 绑定的是字符串或数字，这里内部处理一下确保是数字
const inputValue = computed({
  get() {
    return props.modelValue;
  },
  set(value) {
    // SNumberInput 可能返回空字符串或数字，尝试转换为数字
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      emit('update:modelValue', numValue);
    } else if (value === '') {
      // 如果清空，可以根据需要决定是发送null、0还是上次有效值
      // 这里暂时不处理清空的情况，或者可以发送一个特定值给父组件
      // emit('update:modelValue', 0); // 或者 null
    }
  }
});

</script>

<style scoped>
/* 不再需要自定义样式，因为 SNumberInput 已经包含了所有样式 */
</style> 