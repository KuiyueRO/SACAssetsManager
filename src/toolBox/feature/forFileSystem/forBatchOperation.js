/**
 * @fileoverview 文件系统批量操作工具
 * @module toolBox/feature/forFileSystem/forBatchOperation
 * @description 提供递归扫描文件夹并执行批量任务的功能。
 */

const path = require('path');
const fs = require('fs').promises;

/**
 * 递归扫描文件夹并使用提供的控制器执行任务。
 * 
 * @param {string} dir - 要扫描的起始目录路径。
 * @param {object} controller - 任务控制器，需要有 addTask 方法用于调度。
 * @param {function(string, string, object, function, number): Promise<any>} [文件处理函数=null] - 
 *   处理文件的异步函数。接收参数：(完整路径, 文件名, 控制器, 添加任务函数, 深度)。
 * @param {function(string, string, object, function, number): Promise<any>} [目录处理函数=null] - 
 *   处理目录的异步函数。接收参数：(完整路径, 目录名, 控制器, 添加任务函数, 深度)。
 * @param {number} [depth=0] - 当前递归深度。
 * @returns {Promise<void>}
 */
export const 递归扫描文件夹并执行任务 = async (dir, controller, 文件处理函数 = null, 目录处理函数 = null, depth = 0) => {
    /**
     * 内部函数，用于将任务添加到控制器并处理错误。
     * @param {function(): Promise<any>} 任务函数 - 要执行的异步任务。
     * @param {string} 错误消息前缀 - 发生错误时使用的消息前缀。
     * @returns {Promise<any>} 控制器 addTask 方法的返回值。
     */
    const 添加任务 = async (任务函数, 错误消息前缀) => {
        // 确保 controller 和 addTask 存在且是函数
        if (!controller || typeof controller.addTask !== 'function') {
            console.error('错误：提供的 controller 无效或缺少 addTask 方法。');
            // 可以选择抛出错误或返回一个表示失败的 Promise
            return Promise.reject(new Error('无效的 controller 或缺少 addTask 方法'));
        }
        return controller.addTask(async () => {
            try {
                return await 任务函数();
            } catch (err) {
                // 记录更详细的错误信息
                console.error(`${错误消息前缀}: ${err.stack || err}`);
                return { error: true, message: `${错误消息前缀}: ${err.message}` };
            }
        });
    };

    await 添加任务(async () => {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        const promises = []; // 用于收集处理条目的 Promise

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (目录处理函数) {
                    // 注意：直接 await 可能影响并发性，取决于 controller 实现
                    promises.push(目录处理函数(fullPath, entry.name, controller, 添加任务, depth));
                }
                // 递归调用也应通过 addTask 添加，以利用控制器
                promises.push(添加任务(() => 递归扫描文件夹并执行任务(fullPath, controller, 文件处理函数, 目录处理函数, depth + 1), `递归处理目录失败: ${fullPath}`));
            } else {
                if (文件处理函数) {
                    promises.push(文件处理函数(fullPath, entry.name, controller, 添加任务, depth));
                }
            }
        }
        // 等待当前目录下所有文件/目录处理任务（如果需要保证顺序或收集结果）
        // 注意：这取决于 controller.addTask 的行为以及是否需要等待
        // await Promise.all(promises); 
        
        return { message: `已调度处理文件夹: ${dir}` }; // 更改消息，因为任务是异步调度的
    }, `读取目录失败: ${dir}`);
};

// 提供中文别名
export { 递归扫描文件夹并执行任务 as traverseDirectoryAndProcess }; 