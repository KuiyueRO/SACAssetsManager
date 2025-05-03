<template>
  <div ref="chartRef" style="width: 100%; height: 400px;"></div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount, shallowRef } from 'vue';

// Props 定义
const props = defineProps({
  option: {
    type: Object,
    required: true
  },
  // 允许传入外部 ECharts 实例
  externalInstance: {
    type: Object,
    default: null
  }
});

const chartRef = shallowRef(null);
const chartInstance = shallowRef(null);
const updateTimer = ref(null);
const resizeObserver = ref(null);

// 验证 ECharts 是否可用
const isEchartsAvailable = () => {
  if (typeof window !== 'undefined' && window.echarts) {
    return true;
  }
  console.error('[SAC Echarts Component] ECharts library (window.echarts) is not available.');
  return false;
};

// 规范化 Option
const normalizeOption = (option) => {
  if (!option) return {};
  return {
    ...option,
    series: Array.isArray(option.series)
      ? option.series.map(serie => ({
          type: serie?.type || 'line', // 确保类型存在，默认为line
          ...serie
        })).filter(Boolean) // 过滤掉无效的 serie 配置
      : []
  };
};

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return;

  if (props.externalInstance) {
    // 使用外部实例
    chartInstance.value = props.externalInstance;
    // 注意：外部实例的大小调整应由外部处理，但这里仍监听容器变化以适应布局
    // 如果外部实例已有绑定，ResizeObserver 可能会重复，需注意
  } else {
    // 检查并使用内部实例
    if (!isEchartsAvailable()) return;
    chartInstance.value = echarts.init(chartRef.value);
  }

  if (!chartInstance.value) {
    console.error('[SAC Echarts Component] Failed to initialize or use chart instance.');
    return;
  }

  const validOption = normalizeOption(props.option);
  chartInstance.value.setOption(validOption);
};

// 处理图表大小调整
const handleResize = () => {
  if (chartInstance.value && chartRef.value) {
    chartInstance.value.resize(); // ECharts resize 会自动应用当前 option
  }
};

// 防抖更新
const debouncedUpdate = (option) => {
  if (!option || !chartInstance.value) return;

  // 如果是外部实例，可能外部已有防抖，但内部再做一次通常无害
  cancelAnimationFrame(updateTimer.value);
  updateTimer.value = requestAnimationFrame(() => {
    const validOption = normalizeOption(option);
    // 外部实例可能不希望被覆盖，但 setOption 通常是预期行为
    chartInstance.value.setOption(validOption, true); // use notMerge = true for potentially better performance
  });
};

// 初始化 ResizeObserver
const initResizeObserver = () => {
  if (!chartRef.value) return;
  resizeObserver.value = new ResizeObserver(() => {
    handleResize();
  });
  resizeObserver.value.observe(chartRef.value);
};

// 生命周期钩子
onMounted(() => {
  initChart();
  initResizeObserver(); // 始终监听容器大小变化
});

// 监听 option 变化
watch(
  () => props.option,
  (newOption) => {
    if (chartInstance.value) {
      debouncedUpdate(newOption);
    }
  },
  { deep: true }
);

// 组件销毁前清理
onBeforeUnmount(() => {
  cancelAnimationFrame(updateTimer.value);
  if (resizeObserver.value) {
    // 即使是外部实例，ResizeObserver 也是组件内部创建的，需要清理
    resizeObserver.value.disconnect();
  }
  if (chartInstance.value && !props.externalInstance) {
    // 只清理内部创建的实例
    chartInstance.value.dispose();
  }
});
</script>

<style scoped>
/* 样式部分 */
</style> 