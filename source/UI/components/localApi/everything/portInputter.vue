<template>
    <div class="port-inputter">
        <span class="icon-container">
            <svg class="icon-green icon-overlay">
                <use xlink:href="#iconSearch"></use>
            </svg>
            <svg class="icon-overlay icon-red" v-if="!isEnabled">
                <circle cx="10" cy="10" r="8" fill="transparent" />
            </svg>
            <svg class="icon-overlay icon-red" v-if="!isEnabled">
                <use xlink:href="#iconClose"></use>
            </svg>
        </span>
        <div class="fn__space fn__flex-1">
        </div>
        <input v-model="localPort" style="box-sizing: border-box;" type="number" min="1" max="65535">
        <div class="fn__space fn__flex-1">
        </div>

    </div>
</template>
<script setup>
import { ref, watch ,toRef, onMounted } from 'vue';
import { useEverything_search as searchByEverything } from '../../../../../src/toolBox/feature/forEverything/useEverythingApi.js';
const props = defineProps({
    modelValue: {
        type: Number,
        default: 100
    },
    host: {
        type: String,
        default: "localhost"
    },
    protocol: {
        type: String,
        default: "http"
    }
});

const emit = defineEmits(['update:modelValue']);
const host = toRef(props, 'host')
const localPort = ref(props.modelValue);
const isEnabled = ref(false);
let checkTimer = null;
const DEBOUNCE_DELAY = 300; // 防抖延迟时间，单位毫秒

const checkEnable = async (port) => {
    try {
        const { enabled, fileList } = await searchByEverything('', port, { count: 1, noError: true, host: host.value });
        isEnabled.value = enabled;
    } catch (error) {
        isEnabled.value = false;
    }
};

const debouncedCheck = (port) => {
    clearTimeout(checkTimer);
    checkTimer = setTimeout(() => {
        checkEnable(port);
    }, DEBOUNCE_DELAY);
};

watch(localPort, (newValue) => {
    emit('update:modelValue', newValue);
    debouncedCheck(newValue);
});

// 初始检查
debouncedCheck(localPort.value);
</script>
<style scoped>
.port-inputter {
    display: flex;
    align-items: center;
}

.icon-container {
    position: relative;
    margin-left: 10px;
    min-width: 20px;
    min-height: 20px;
}

.icon-green {
    fill: rgb(253, 128, 0);
}

.icon-red {
    fill: red;
}

.icon-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

svg {
    width: 20px;
    height: 20px;
}
</style>