/**
 * @fileoverview 封装浏览器 ResizeObserver API
 * @module toolBox/base/useBrowser/useObservers/useResizeObserver
 */

/**
 * 简单监听目标元素的尺寸变化。
 * 注意：此函数不防止对同一元素的重复监听。
 * @param {Element} target - 需要监听尺寸变化的 DOM 元素。
 * @param {(size: {width: number, height: number}) => void} callback - 尺寸变化时的回调函数，接收包含 width 和 height 的对象。
 * @param {boolean} [immediate=false] - 是否在开始监听时立即执行一次回调。
 */
export function observeResizeSimple(target, callback, immediate = false) {
    if (!(target instanceof Element)) {
        console.error('observeResizeSimple: target is not a valid Element.');
        return;
    }
    const stat = { width: target.clientWidth, height: target.clientHeight };
    const resizeObserver = new ResizeObserver(entries => {
        // 检查 target 是否还在文档中，避免已移除元素的回调
        if (!target.isConnected) {
            resizeObserver.unobserve(target);
            return;
        }
        // 只有在尺寸确实改变时才触发回调
        if (stat.width !== target.clientWidth || stat.height !== target.clientHeight) {
            stat.width = target.clientWidth;
            stat.height = target.clientHeight;
            callback(stat);
        }
    });
    if (immediate) {
        callback(stat);
    }
    resizeObserver.observe(target);
    // 返回一个停止监听的函数，方便调用者管理
    return () => resizeObserver.unobserve(target);
}

// 使用全局 WeakMap 存储已监听的元素及其 Observer，避免重复监听并自动处理垃圾回收
const observedElements = globalThis[Symbol.for('ResizeObserver_Map')] || new WeakMap();
globalThis[Symbol.for('ResizeObserver_Map')] = observedElements;

/**
 * 创建一个可控的尺寸监听器函数。
 * 返回一个包含 start 和 stop 方法的对象。
 * @param {(size: {width: number, height: number}) => void} callback - 尺寸变化时的回调函数。
 * @param {boolean} [immediate=false] - 是否在首次监听时立即执行一次回调。
 * @param {boolean} [noDup=true] - 是否阻止对同一元素的重复监听。
 * @returns {{start: (target: Element) => void, stop: (target: Element) => void}} 返回一个包含 start 和 stop 方法的对象。
 */
export function createResizeObserverController(callback, immediate = false, noDup = true) {
    const start = (target) => {
        if (!(target instanceof Element)) {
            console.error('createResizeObserverController.start: target is not a valid Element.');
            return;
        }
        if (noDup && observedElements.has(target)) {
            return; // 如果阻止重复且元素已被监听，则直接返回
        }
        const stat = { width: target.clientWidth, height: target.clientHeight };
        const resizeObserver = new ResizeObserver(entries => {
            if (!target.isConnected) {
                stop(target); // 如果元素被移除，自动停止监听
                return;
            }
            if (stat.width !== target.clientWidth || stat.height !== target.clientHeight) {
                stat.width = target.clientWidth;
                stat.height = target.clientHeight;
                callback(stat);
            }
        });
        resizeObserver.observe(target);
        observedElements.set(target, resizeObserver); // 记录监听状态
        if (immediate) {
            callback(stat);
        }
    };

    const stop = (target) => {
        if (!(target instanceof Element)) {
            console.error('createResizeObserverController.stop: target is not a valid Element.');
            return;
        }
        if (observedElements.has(target)) {
            const observer = observedElements.get(target);
            observer.unobserve(target);
            observedElements.delete(target); // 移除监听记录
        }
    };

    return { start, stop };
}

// --- 兼容旧名称 --- 
/** @deprecated 请使用 observeResizeSimple */
export const 监听尺寸 = observeResizeSimple;
/** @deprecated 请使用 createResizeObserverController */
export const 以函数创建尺寸监听 = createResizeObserverController; 