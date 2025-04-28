<template>
    <span :class="'protyle-breadcrumb__item'">
        <img v-if="!isSvg(icon)" :src="icon" :class="'breadcrumb-icon'" />
        {{ name }}
    </span>
</template>
<script setup>
import { ref, computed } from 'vue'
import { toRefs, defineProps } from 'vue'
import { isSvg } from '../../../../../src/utils/siyuanData/icon.js'

const props = defineProps({
    name: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
})
const { name, icon } = toRefs(props)
</script>
<style scoped>
.breadcrumb-icon {
  height: 14px;
  width: 14px;
  flex-shrink: 0;
  color: var(--b3-theme-on-surface);
}
</style>