/**
 * @fileoverview 指针事件 (PointerEvent) 相关工具函数
 * @module toolBox/base/forEvent/usePointerEventUtils
 */

/**
 * 检查当前环境是否支持指针压力感应
 * 检查 PointerEvent.prototype.pressure 或 TouchEvent.prototype.force
 * @returns {boolean}
 */
function isPressureSupported() {
    // 使用 try...catch 避免在不支持这些事件的旧环境中报错
    try {
        return (
            (window.PointerEvent && 'pressure' in window.PointerEvent.prototype) ||
            (window.TouchEvent && 'force' in window.TouchEvent.prototype)
        );
    } catch (e) {
        return false;
    }
}

// 缓存检查结果，避免重复计算
const pressureSupportChecked = isPressureSupported();

/**
 * 获取指针事件的压力值
 * 如果事件对象包含有效的 pressure 属性 (PointerEvent)，则返回该值。
 * 如果 pressure 无效或不支持，但支持 TouchEvent 的 force 属性，则尝试返回 force 值。
 * 如果两者都不可用或无效（例如 pressure 为 0），则返回默认值 1.0。
 *
 * @param {PointerEvent | TouchEvent | MouseEvent | Event} event - 事件对象
 * @param {number} [defaultValue=1.0] - 当无法获取有效压力值时返回的默认值
 * @returns {number} 压力值 (通常在 0.0 到 1.0 之间，但某些设备可能超过 1.0)
 */
export function 获取事件压力值(event, defaultValue = 1.0) {
    if (!event) {
        return defaultValue;
    }

    // 优先检查 pressure 属性 (PointerEvent)
    // 检查 pressure 是否为有效数字且大于 0 (压力为 0 通常表示非压力感应输入)
    if (typeof event.pressure === 'number' && event.pressure > 0) {
        return event.pressure;
    }

    // 如果 pressure 无效，检查是否支持 force 属性 (TouchEvent)
    if (pressureSupportChecked && typeof event.force === 'number' && event.force > 0) {
        // 注意：TouchEvent 的 force 属性范围可能与 pressure 不同，但这里直接使用
        return event.force;
    }

    // 如果都不支持或无效，返回默认值
    return defaultValue;
}

// 提供英文别名
export { 获取事件压力值 as getEventPressure }; 