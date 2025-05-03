<template>
    <span :class="'protyle-breadcrumb__item'">
        <!-- <img v-if="!isSvgDataUrl(icon)" :src="icon" :class="'breadcrumb-icon'" /> -->
        <SIcon v-if="icon" :name="icon" small class-name="breadcrumb-icon"></SIcon>
        <span class="fn__space"></span>
        {{ label }}
    </span>
</template>
<script setup>
import { ref, computed } from 'vue'
import { toRefs, defineProps } from 'vue'
import { isSvgDataUrl } from '../../../../../src/toolBox/useAge/forSiyuan/forUIUtils/getSiyuanBlockIcon.js'
import SIcon from '/plugins/SACAssetsManager/src/shared/ui/siyuanUI-vue/components/SIcon.vue'

const props = defineProps({
    label: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        // required: true // 图标可以不传
    },
})
const { label, icon } = toRefs(props)
</script>
<style scoped>
.breadcrumb-icon {
  /* height: 14px; */ /* SIcon small 应该自带尺寸，或者使用 CSS var */
  /* width: 14px; */
  margin-right: 4px; /* 添加一点右边距 */
  flex-shrink: 0;
  color: var(--b3-theme-on-surface);
}
</style>