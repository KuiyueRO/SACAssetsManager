<template>
    <div style="position: relative; width: 100%; height: 100%;" class="ariaLabel" :aria-label="ariaLabel">

        <iframe ref="contentFrame" style="width: 100%; height: 100%; border: none;"></iframe>
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; "></div>
    </div>
</template>

<script setup>
import { ref, toRef, onMounted, nextTick, watch } from 'vue';
import { 获取素材属性值 } from '../../../../data/attributies/parseAttributies.js';
import { writeHighlightedCodeToIframe } from '../../../../../src/toolBox/feature/forCodeHighlighting/writeHighlightedCodeToIframe.js';
import { 文件系统工具 } from '../../componentUtils.js';
const props = defineProps(['cardData', 'attributeName','ariaLabel']);
const attributeName = toRef(props, 'attributeName');
const displayMode = toRef(props, 'displayMode');
const label = toRef(props, 'ariaLabel');
const { cardData } = props;
const contentFrame = ref(null);
const readFileInChunks = 文件系统工具.readFileInChunks

async function loadContent() {
    if (!cardData || !contentFrame.value) return;
    const filePath = await 获取素材属性值(cardData.data, attributeName.value);
    const maxBytes = 10000; // 最大读取字节数
    const chunkSize = 1000; // 每次读取的字节数
    readFileInChunks(filePath, chunkSize, maxBytes, (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        if (data) {
            nextTick(() => {
                writeHighlightedCodeToIframe(contentFrame.value, data);
            });
        }
    });
}

onMounted(() => {
    loadContent();
});

watch(() => cardData.data, () => {
    loadContent(); // Reload content when asset data changes
});
</script>

<style scoped>
.hljs-text-cell-iframe {
    width: 100%;
    height: 100%; /* Initial height, will be adjusted by script inside iframe */
    border: none;
    display: block;
}
</style>