/**
 * 输入对话框工具模块
 * 
 * 提供用于创建简单输入对话框的功能，支持Promise接口和回调函数方式。
 */

import { getDialogInterface } from '../../../feature/interfaces/dialogInterfaces.js';

/**
 * 显示输入对话框
 * @param {string} title 对话框标题
 * @param {string} placeholder 输入框占位文本
 * @param {Function} [confirm] 确认回调函数，参数为输入的文本
 * @param {Function} [cancel] 取消回调函数
 * @returns {Promise<string|null>} 输入的文本或null（取消）
 */
export function showInputDialog(title, placeholder, confirm = () => {}, cancel = () => {}) {
    const dialogInterface = getDialogInterface();
    
    return dialogInterface.inputDialog({
        title,
        text: placeholder,
        placeholder
    }).then(value => {
        if (value !== null) {
            confirm(value);
        } else {
            cancel();
        }
        return value;
    });
}

/**
 * 显示输入对话框并返回Promise
 * @param {string} title 对话框标题
 * @param {string} placeholder 输入框占位文本
 * @param {string} [defaultValue=''] 默认值
 * @returns {Promise<string|null>} 输入的文本或null（取消）
 */
export function showInputDialogPromise(title, placeholder, defaultValue = '') {
    const dialogInterface = getDialogInterface();
    
    return dialogInterface.inputDialog({
        title,
        text: placeholder,
        placeholder,
        value: defaultValue
    });
}

/**
 * 显示确认对话框
 * @param {string} title 对话框标题
 * @param {string} message 确认消息
 * @param {Function} [confirm] 确认回调函数
 * @param {Function} [cancel] 取消回调函数
 * @returns {Promise<boolean>} 确认结果
 */
export function showConfirmDialog(title, message, confirm = () => {}, cancel = () => {}) {
    const dialogInterface = getDialogInterface();
    
    return dialogInterface.confirmDialog(title, message).then(result => {
        if (result) {
            confirm();
        } else {
            cancel();
        }
        return result;
    });
}

/**
 * 显示确认对话框并返回Promise
 * @param {string} title 对话框标题
 * @param {string} message 确认消息
 * @returns {Promise<boolean>} 确认结果
 */
export function showConfirmDialogPromise(title, message) {
    const dialogInterface = getDialogInterface();
    
    return dialogInterface.confirmDialog(title, message);
}

// 中文别名
export const 打开输入对话框 = showInputDialog;
export const 打开输入对话框Promise = showInputDialogPromise;
export const 打开确认对话框 = showConfirmDialog;
export const 打开确认对话框Promise = showConfirmDialogPromise; 