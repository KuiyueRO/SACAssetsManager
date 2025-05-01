/**
 * @fileoverview Provides utility functions interacting with the Electron shell module,
 * primarily for operating system integrations like opening paths.
 */

/**
 * Opens an array of local folder paths in the operating system's file explorer.
 * Uses Electron's shell module via `@electron/remote`.
 *
 * **Warning:** Directly using `@electron/remote` from the renderer process is discouraged
 * due to security and performance implications. Consider refactoring to use IPC
 * to request the main process to perform shell operations.
 *
 * TODO: Refactor this function to use Electron's IPC (ipcRenderer.invoke) instead of @electron/remote.
 *       The main process should handle the `shell.openPath` call.
 *
 * @param {string[]} 文件夹数组 - An array of absolute paths to local folders.
 * @returns {Promise<void>} A promise that resolves when the attempts to open paths are initiated.
 * @throws {Error} If not running in an Electron environment with `@electron/remote` enabled.
 */
export async function 在资源管理器打开本地文件夹数组(文件夹数组) {
    let shell;
    try {
        // Dynamically require @electron/remote only when needed
        // This might still fail if remote module is not enabled in main process
        shell = window.require('@electron/remote').shell;
    } catch (error) {
        console.error('Failed to require Electron shell via @electron/remote:', error);
        throw new Error('此功能依赖Electron环境和@electron/remote模块，无法执行。');
    }

    if (!Array.isArray(文件夹数组)) {
        console.warn('输入参数不是一个数组:', 文件夹数组);
        return;
    }

    if (文件夹数组.length === 0) {
        console.log('没有可打开的文件夹');
        return;
    }

    // Use a Set for efficient deduplication
    const uniqueFolders = new Set(文件夹数组);

    // Sequentially open paths to avoid potential OS limitations/errors with too many simultaneous requests?
    // Or use Promise.all for concurrency? Sticking to sequential for now.
    for (const folderPath of uniqueFolders) {
        if (typeof folderPath === 'string' && folderPath.trim() && folderPath !== '/') {
            try {
                console.log(`Attempting to open path: ${folderPath}`);
                // shell.openPath returns a promise resolving to an empty string on success
                // or an error string on failure.
                const result = await shell.openPath(folderPath);
                if (result) { // Non-empty string indicates an error
                    console.error(`无法打开文件夹 ${folderPath}: ${result}`);
                }
            } catch (error) {
                console.error(`执行 shell.openPath 时出错 (${folderPath}):`, error);
            }
        } else {
            console.warn(`跳过无效或根目录路径: ${folderPath}`);
        }
    }
} 