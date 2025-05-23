import { 递归扫描文件夹并执行任务 } from "../../../../../src/toolBox/feature/forFileSystem/forBatchOperation.js";
import { 打开任务控制对话框 } from "../../dialog/tasks.js";
const path = require('path')
const fs = require('fs').promises
export const 执行按扩展名分组=async(localPath)=>{
    const taskController = await 打开任务控制对话框('展平并分组文件', '正在按扩展名展平并分组文件...');

    // 添加检查：如果 taskController 为 null，则说明对话框创建失败，直接返回
    if (!taskController) {
        console.error('无法创建任务对话框，展平并分组操作已中止。');
        clientApi?.showMessage('无法启动任务，请检查控制台日志。', 'error');
        return; 
    }

    const 文件处理函数 = async (fullPath, fileName, controller, 添加任务) => {
        const ext = path.extname(fileName).toLowerCase().slice(1);
        if (ext) {
            await 添加任务(async () => {
                const targetDir = path.join(localPath, ext);
                await fs.mkdir(targetDir, { recursive: true });
                const newPath = path.join(targetDir, fileName);
                await fs.rename(fullPath, newPath);
                return { message: `已移动: ${fullPath} -> ${newPath}` };
            }, `移动文件失败: ${fullPath}`);
        }
    };
    const 目录处理函数 = async (fullPath, dirName,controller, 添加任务) => {
        await 添加任务(async () => {
            const entries = await fs.readdir(fullPath, { withFileTypes: true });
            const files = entries.filter(entry => !entry.isDirectory());
            for (const file of files) {
                await 文件处理函数(path.join(fullPath, file.name), file.name, controller, 添加任务);
            }
            return { message: `处理完成目录: ${fullPath}` };
        }, `处理目录失败: ${fullPath}`);
    };
    try {
        await 递归扫描文件夹并执行任务(localPath, taskController, 文件处理函数, 目录处理函数);
        taskController.on('allTasksCompleted', () => {
            clientApi.showMessage('成功按扩展名展平并分组文件', 'info');
        });
    } catch (error) {
        console.error('展平并分组文件时发生错误:', error);
        clientApi.showMessage('展平并分组文件时发生错误', 'error');
    }
}