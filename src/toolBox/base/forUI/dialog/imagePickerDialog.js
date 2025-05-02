/**
 * 图像选择对话框工具模块
 * 
 * 提供用于创建图像选择对话框的功能，支持键盘和鼠标选择图像。
 */

import { getDialogInterface } from '../../../feature/forUI/interfaces/baseDialogInterface.js';

/**
 * 打开图像选择对话框
 * @param {Object} clientApi 思源API客户端实例（保留参数兼容性，实际不再使用）
 * @param {string} title 对话框标题
 * @param {Array<{src: string, label: string}>} images 图像列表，每项包含图像路径和标签
 * @param {string} tooltip 提示文本
 * @param {Function} [confirm] 确认回调函数，参数为选中的图像对象
 * @param {Function} [cancel] 取消回调函数，参数为对话框实例
 * @returns {Object} 对话框实例
 */
export function openImagePickerDialog(clientApi, title, images, tooltip, confirm = () => {}, cancel = () => {}) {
    // 获取对话框接口
    const dialogInterface = getDialogInterface();
    
    // 构建HTML内容
    const content = `<div class="b3-dialog__content">
        <div class="image-selection fn__flex">
            ${images.map((image, index) => `
                <div class="image-option fn__flex fn__flex-column">
                    <div class="image-number">${index + 1}</div>
                    <img src="${image.src}" alt="选项${index + 1}" class="selectable-image" data-index="${index}">
                    <p>${image.label}</p>
                </div>
                <div class="fn__space"></div>
            `).join('')}
        </div>
        <div class="fn__space"></div>
        <div>${tooltip}</div>
    </div>
    <div class="b3-dialog__action">
        <button class="b3-button b3-button--cancel">${window.siyuan?.languages?.cancel || '取消'}</button>
    </div>`;
    
    // 创建对话框
    const dialog = dialogInterface.custom({
        title,
        message: content,
        width: "520px",
        type: 'custom'
    });
    
    // 创建一个包装器，模拟原来的对话框接口
    const dialogWrapper = {
        element: dialog.element,
        $result: null,
        destroy: () => {
            if (dialogWrapper.$result) {
                confirm(dialogWrapper.$result);
            } else {
                cancel(dialogWrapper);
            }
            // 移除事件监听器
            document.removeEventListener('keydown', handleKeyPress);
            
            // 销毁对话框
            dialog.destroy && dialog.destroy();
        }
    };
    
    // 处理键盘事件
    function handleKeyPress(event) {
        const key = parseInt(event.key);
        if (!isNaN(key) && key > 0 && key <= images.length) {
            const selectedImage = dialog.element.querySelector(`.selectable-image[data-index="${key - 1}"]`);
            if (selectedImage) {
                dialogWrapper.$result = {
                    src: selectedImage.getAttribute('src'),
                    index: key - 1,
                    image: images[key - 1]
                };
                dialogWrapper.destroy();
            }
        } else if (event.key === 'Escape') {
            dialogWrapper.destroy();
        }
    }

    document.addEventListener('keydown', handleKeyPress);

    // 处理图像点击事件
    const imageElements = dialog.element.querySelectorAll(".selectable-image");
    imageElements.forEach(img => {
        img.addEventListener("click", () => {
            const index = parseInt(img.dataset.index);
            dialogWrapper.$result = {
                src: img.getAttribute('src'),
                index: index,
                image: images[index]
            };
            dialogWrapper.destroy();
        });
    });

    // 处理取消按钮点击事件
    const cancelButton = dialog.element.querySelector(".b3-button--cancel");
    cancelButton.addEventListener("click", () => {
        dialogWrapper.destroy();
    });

    return dialogWrapper;
}

/**
 * 以Promise方式打开图像选择对话框
 * @param {Object} clientApi 思源API客户端实例（保留参数兼容性，实际不再使用）
 * @param {string} title 对话框标题
 * @param {Array<{src: string, label: string}>} images 图像列表，每项包含图像路径和标签
 * @param {string} tooltip 提示文本
 * @returns {Promise<{src: string, index: number, image: Object}|undefined>} 返回Promise，解析为选中的图像对象或undefined（取消时）
 */
export function openImagePickerPromise(clientApi, title, images, tooltip) {
    return new Promise((resolve) => {
        openImagePickerDialog(
            clientApi,
            title,
            images,
            tooltip,
            (result) => resolve(result),
            () => resolve(undefined)
        );
    });
}

// 中文别名
export const 打开图像选择对话框 = Object.assign(
    openImagePickerDialog,
    { promise: openImagePickerPromise }
);
export const 打开图像选择对话框Promise = openImagePickerPromise;

// 额外添加输入对话框的promise支持
export const 打开输入对话框 = { promise: openImagePickerPromise }; 