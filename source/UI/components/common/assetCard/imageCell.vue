<template>
    <div>
        <div v-if="displayMode === LAYOUT_COLUMN" :style="$计算扩展名标签样式">
            {{ 计算素材类型角标(cardData.data) }}
        </div>
        <div class="alt-text" v-if="!imageLoaded" :style="$计算素材缩略图样式"></div>
        <img v-bind="$attrs" class="thumbnail-card-image ariaLabel" :aria-label="`${cardData.data.path}`" ref="image"
            :style="imageLoaded ? $计算素材缩略图样式 : placeholderStyle" loading="lazy" draggable='true'
            :onload="(e) => handleImageLoad(e)" :src="imageSrc" />
    </div>
</template>

<script setup lang="jsx">
import { computed, toRef, defineEmits, ref, onMounted } from 'vue';
import { 计算素材缩略图样式, 计算扩展名标签样式 } from '/plugins/SACAssetsManager/src/shared/assetStyles.js';
import { LAYOUT_COLUMN } from '/plugins/SACAssetsManager/src/shared/utils/layoutConstants.js';
import { getAssetItemColor } from '../../../../data/attributies/getAsyncAttributes.js';
import { fromRgbArrayToString } from '../../../../../src/toolBox/base/forColor/formatColor.js';
import { 获取素材属性值, 计算素材类型角标 } from '../../../../data/attributies/parseAttributies.js';
import { 图片工具 } from '../../componentUtils.js';
const props = defineProps(['cardData', 'displayMode', 'attributeName', 'showImage', 'showIframe', 'size', 'cellReady']);
const attributeName = toRef(props, 'attributeName')
const displayMode = toRef(props, 'displayMode');
const { cardData } = props
const size = toRef(props, 'size');
const emit = defineEmits(['cell-ready'])
const imageLoaded = ref(false); // 新增状态变量
const imagePallet = ref([])
const imageSrc = ref(图片工具.空图片base64); // 使用 base64 编码的透明图片

onMounted(
    () => {
        // 异步获取素材属性值
        获取素材属性值(cardData.data, attributeName.value).then((src) => {
            imageSrc.value = src; // 更新图片的 src
        });

        getAssetItemColor(cardData.data).then(
            () => {
                imagePallet.value = cardData.data.colorPllet
            })
    }
)

const handleImageLoad = (e) => {
    imageLoaded.value = true; // 图片加载后隐藏占位框
    emit('cell-ready', e);
}
const placeholderStyle = computed(() => ({
    width: size.value + 'px', // 设置占位框的宽度
    height: size.value + 'px', // 设置占位框的高度
    minWidth: size.value + 'px', // 设置占位框的宽度
    minHeight: size.value + 'px', // 设置占位框的高度
    maxWidth: size.value + 'px', // 设置占位框的宽度
    maxHeight: size.value + 'px', // 设置占位框的高度
    backgroundColor: !imagePallet.value[0] ? "" : fromRgbArrayToString(imagePallet.value[0].color), // 设置占位框的背景色
}));
const $计算素材缩略图样式 = computed(() => 计算素材缩略图样式(size.value, cardData));
const $计算扩展名标签样式 = computed(() => 计算扩展名标签样式(displayMode.value, cardData, size.value));
</script>