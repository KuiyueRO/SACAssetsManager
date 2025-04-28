/**
 * @fileoverview Provides convenient wrappers around Electron's dialog module using `@electron/remote`.
 *
 * **Warning:** Directly using `@electron/remote` from the renderer process is discouraged
 * due to security and performance implications. These functions should be refactored
 * to use Electron's IPC (ipcRenderer.invoke) to request the main process to show dialogs.
 *
 * TODO: Refactor all functions in this file to use IPC instead of @electron/remote.
 *       The main process should handle the actual `dialog.show...Dialog` calls.
 */

let dialog;

function getDialog() {
    if (!dialog) {
        try {
            // Attempt to require @electron/remote only when first needed.
            dialog = window.require('@electron/remote').dialog;
        } catch (error) {
            console.error('Failed to require Electron dialog via @electron/remote:', error);
            throw new Error('此功能依赖Electron环境和@electron/remote模块，无法执行。');
        }
    }
    if (!dialog) { // Check again in case require succeeded but returned undefined/null
         throw new Error('@electron/remote.dialog is not available.');
    }
    return dialog;
}

/**
 * 显示一个选择文件夹的对话框。
 * @param {object} [options] - Electron `showOpenDialog` 的选项 (除了 `properties`).
 * @param {string} [options.title='选择文件夹'] - 对话框标题.
 * @param {string} [options.buttonLabel='选择'] - 确认按钮文本.
 * @param {string} [options.defaultPath] - 默认打开路径.
 * @returns {Promise<Electron.OpenDialogReturnValue>} Promise resolving with dialog result.
 */
export const 选择文件夹 = async (options = {}) => {
    const electronDialog = getDialog();
    try {
        const result = await electronDialog.showOpenDialog({
            title: options.title || '选择文件夹',
            buttonLabel: options.buttonLabel || '选择',
            defaultPath: options.defaultPath,
            properties: ['openDirectory', 'createDirectory'] // Allow creating directory too
        });
        return result;
    } catch (error) {
         console.error('Error showing open directory dialog:', error);
         // Return a structure similar to Electron's response on error
         return { canceled: true, filePaths: [] };
    }
};

/**
 * 显示一个选择文件的对话框。
 * @param {object} [options] - Electron `showOpenDialog` 的选项 (除了 `properties`).
 * @param {string} [options.title='选择文件'] - 对话框标题.
 * @param {string} [options.buttonLabel='选择'] - 确认按钮文本.
 * @param {string} [options.defaultPath] - 默认打开路径.
 * @param {Electron.FileFilter[]} [options.filters] - 文件类型过滤器.
 * @param {boolean} [options.multiSelections=false] - 是否允许多选.
 * @returns {Promise<Electron.OpenDialogReturnValue>} Promise resolving with dialog result.
 */
export const 选择文件 = async (options = {}) => {
    const electronDialog = getDialog();
    const properties = ['openFile'];
    if (options.multiSelections) {
        properties.push('multiSelections');
    }

    try {
        const result = await electronDialog.showOpenDialog({
            title: options.title || '选择文件',
            buttonLabel: options.buttonLabel || '选择',
            defaultPath: options.defaultPath,
            filters: options.filters || [],
            properties
        });
        return result;
     } catch (error) {
         console.error('Error showing open file dialog:', error);
         return { canceled: true, filePaths: [] };
     }
};

/**
 * 显示一个保存文件的对话框。
 * @param {object} [options] - Electron `showSaveDialog` 的选项.
 * @param {string} [options.title='保存文件'] - 对话框标题.
 * @param {string} [options.buttonLabel='保存'] - 确认按钮文本.
 * @param {string} [options.defaultPath] - 默认保存路径/文件名.
 * @param {Electron.FileFilter[]} [options.filters] - 文件类型过滤器.
 * @returns {Promise<Electron.SaveDialogReturnValue>} Promise resolving with dialog result.
 */
export const 保存文件 = async (options = {}) => {
    const electronDialog = getDialog();
    try {
        const result = await electronDialog.showSaveDialog({
            title: options.title || '保存文件',
            buttonLabel: options.buttonLabel || '保存',
            defaultPath: options.defaultPath,
            filters: options.filters || []
        });
        return result;
    } catch (error) {
         console.error('Error showing save file dialog:', error);
         return { canceled: true, filePath: undefined };
    }
};

/**
 * 显示一个选择图片文件的对话框 (预设过滤器)。
 * @param {object} [options] - 传递给 `选择文件` 的选项 (除了 title, buttonLabel, filters).
 * @param {boolean} [options.multiSelections=false] - 是否允许多选.
 * @returns {Promise<Electron.OpenDialogReturnValue>} Promise resolving with dialog result.
 */
export const 选择图片文件 = async (options = {}) => {
    // 合并选项，允许覆盖 multiSelections 但保留预设过滤器等
    const mergedOptions = {
        ...options,
        title: options.title || '选择图片', // Allow overriding title
        buttonLabel: options.buttonLabel || '选择',
        filters: options.filters || [
            { name: '图像文件', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'ico', 'svg'] }
        ],
        multiSelections: options.multiSelections || false
    };
    return 选择文件(mergedOptions);
};

/**
 * 显示一个选择音频文件的对话框 (预设过滤器)。
 * @param {object} [options] - 传递给 `选择文件` 的选项.
 * @param {boolean} [options.multiSelections=false] - 是否允许多选.
 * @returns {Promise<Electron.OpenDialogReturnValue>} Promise resolving with dialog result.
 */
export const 选择音频文件 = async (options = {}) => {
     const mergedOptions = {
        ...options,
        title: options.title || '选择音频',
        buttonLabel: options.buttonLabel || '选择',
        filters: options.filters || [
            { name: '音频文件', extensions: ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'] }
        ],
        multiSelections: options.multiSelections || false
    };
    return 选择文件(mergedOptions);
};

/**
 * 显示一个选择视频文件的对话框 (预设过滤器)。
 * @param {object} [options] - 传递给 `选择文件` 的选项.
 * @param {boolean} [options.multiSelections=false] - 是否允许多选.
 * @returns {Promise<Electron.OpenDialogReturnValue>} Promise resolving with dialog result.
 */
export const 选择视频文件 = async (options = {}) => {
    const mergedOptions = {
        ...options,
        title: options.title || '选择视频',
        buttonLabel: options.buttonLabel || '选择',
        filters: options.filters || [
            { name: '视频文件', extensions: ['mp4', 'webm', 'mkv', 'avi', 'mov', 'wmv', 'flv'] }
        ],
        multiSelections: options.multiSelections || false
    };
    return 选择文件(mergedOptions);
}; 