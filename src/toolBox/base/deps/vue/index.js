import {
    ref,
    reactive,
    readonly,
    computed,

    // 监听相关
    watch,
    watchEffect,

    // 工具函数
    isRef,
    unref,
    toRef,
    toRefs,
    isReactive,
    isReadonly,
    isProxy,

    // 高级API
    customRef,
    shallowRef,
    triggerRef,
    shallowReactive,
    toRaw,
    markRaw,
    onBeforeUnmount,
    onMounted // 补充常用的 onMounted
} from "../../../../static/vue.esm-browser.js"; // 注意调整路径层级

export {
    // 基础响应式API
    ref,
    reactive,
    readonly,
    computed,

    // 监听相关
    watch,
    watchEffect,

    // 工具函数
    isRef,
    unref,
    toRef,
    toRefs,
    isReactive,
    isReadonly,
    isProxy,
    
    // 生命周期钩子 (常用)
    onMounted, 
    onBeforeUnmount,

    // 高级API
    customRef,
    shallowRef,
    triggerRef,
    shallowReactive,
    toRaw,
    markRaw,
}; 