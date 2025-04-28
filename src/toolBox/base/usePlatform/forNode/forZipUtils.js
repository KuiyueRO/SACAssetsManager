/**
 * @fileoverview 提供基于 Node.js 的 ZIP 文件操作工具，依赖 jszip 库。
 * 还包含一些通用的 Node.js 文件系统辅助函数。
 */

import { JSZip } from '../../useDeps/forZipUtils/useJsZipDep.js'; // 从 useDeps 导入 JSZip
const fs = require('fs').promises;
const path = require('path'); // 需要 path 模块

// --- 通用文件保存函数 (从 useD5aFile.js 迁移过来) ---
/**
 * 将 Buffer 数据异步保存到文件。
 * @async
 * @param {Buffer} bufferData - 要保存的 Buffer 数据。
 * @param {string} targetPath - 保存的目标文件路径。
 * @returns {Promise<string|null>} 成功返回文件路径，失败返回 null。
 */
export async function saveBufferToFile(bufferData, targetPath) {
    if (!(bufferData instanceof Buffer)) {
        console.error('Invalid data provided. Expected Buffer.');
        return null;
    }
    if (typeof targetPath !== 'string' || targetPath.length === 0) {
        console.error('Invalid target path provided.');
        return null;
    }
    try {
        const outputDir = path.dirname(targetPath);
        // 使用 fs.promises.mkdir 进行异步创建
        await fs.mkdir(outputDir, { recursive: true });
        // 使用 fs.promises.writeFile 进行异步写入
        await fs.writeFile(targetPath, bufferData);
        console.log(`Data successfully saved to ${targetPath}`);
        return targetPath;
    } catch (error) {
        console.error(`Failed to save data to file ${targetPath}:`, error);
        return null;
    }
}

// --- ZIP 文件操作函数 (从 useAge/forFileManage/forZipLike/useJsZip.js 迁移过来) ---

/**
 * 将文件添加到现有的 ZIP 文件中。
 * @param {string} zipFilePath - 目标 ZIP 文件的路径。
 * @param {string} fileToAddPath - 要添加的文件的路径。
 * @param {string} fileNameInZip - 在 ZIP 文件中使用的文件名。
 * @returns {Promise<void>} 操作成功则 resolve，失败则 reject。
 * @throws {Error} 读取文件、加载 ZIP 或写入 ZIP 失败时抛出错误。
 */
export async function addFileToZip(zipFilePath, fileToAddPath, fileNameInZip) {
    try {
        const zipData = await fs.readFile(zipFilePath);
        const zip = await JSZip.loadAsync(zipData);
        const fileData = await fs.readFile(fileToAddPath);
        zip.file(fileNameInZip, fileData);
        const updatedZipContent = await zip.generateAsync({ type: 'nodebuffer' });
        await fs.writeFile(zipFilePath, updatedZipContent);
        console.log(`成功将 ${fileToAddPath} 添加到 ${zipFilePath} 中，文件名为 ${fileNameInZip}`);
    } catch (error) {
        console.error(`向 ZIP 文件 ${zipFilePath} 添加文件 ${fileToAddPath} (名为 ${fileNameInZip}) 时出错:`, error);
        throw error;
    }
}

/**
 * 创建新的ZIP文件。
 * @param {string} outputPath - 输出 ZIP 文件路径。
 * @param {Object<string, Buffer|string>} files - 要添加的文件对象，格式: {文件名: 文件内容 (Buffer 或字符串)}。
 * @returns {Promise<void>} 操作成功则 resolve，失败则 reject。
 * @throws {Error} 创建或写入 ZIP 失败时抛出错误。
 */
export async function createZip(outputPath, files = {}) {
    try {
        const zip = new JSZip();
        Object.entries(files).forEach(([fileName, content]) => {
            zip.file(fileName, content);
        });
        const zipContent = await zip.generateAsync({ type: 'nodebuffer' });
        await fs.writeFile(outputPath, zipContent);
        console.log(`成功创建ZIP文件: ${outputPath}`);
    } catch (error) {
        console.error(`创建ZIP文件 ${outputPath} 时出错:`, error);
        throw error;
    }
}

/**
 * 从ZIP文件提取特定文件。
 * @param {string} zipFilePath - ZIP 文件路径。
 * @param {string} fileNameInZip - ZIP 中的文件名。
 * @param {string} outputPath - 输出路径。
 * @returns {Promise<void>} 操作成功则 resolve，失败则 reject。
 * @throws {Error} 读取 ZIP、文件不存在或写入失败时抛出错误。
 */
export async function extractFileFromZip(zipFilePath, fileNameInZip, outputPath) {
    try {
        const zipData = await fs.readFile(zipFilePath);
        const zip = await JSZip.loadAsync(zipData);
        const fileData = await zip.file(fileNameInZip)?.async('nodebuffer');
        if (!fileData) {
            throw new Error(`ZIP 文件 ${zipFilePath} 中不存在文件: ${fileNameInZip}`);
        }
        // 确保输出目录存在
        const outputDir = path.dirname(outputPath);
        await fs.mkdir(outputDir, { recursive: true });
        await fs.writeFile(outputPath, fileData);
        console.log(`成功从 ${zipFilePath} 提取文件 ${fileNameInZip} 到 ${outputPath}`);
    } catch (error) {
        console.error(`从 ZIP 文件 ${zipFilePath} 提取文件 ${fileNameInZip} 到 ${outputPath} 时出错:`, error);
        throw error;
    }
}

/**
 * 提取 ZIP 文件的所有内容到指定目录。
 * @param {string} zipFilePath - ZIP 文件路径。
 * @param {string} outputDir - 输出目录。
 * @returns {Promise<void>} 操作成功则 resolve，失败则 reject。
 * @throws {Error} 读取 ZIP 或写入文件失败时抛出错误。
 */
export async function extractAllFromZip(zipFilePath, outputDir) {
    try {
        const zipData = await fs.readFile(zipFilePath);
        const zip = await JSZip.loadAsync(zipData);
        await fs.mkdir(outputDir, { recursive: true });
        const promises = [];
        zip.forEach((relativePath, zipEntry) => {
            if (!zipEntry.dir) {
                const outputPath = path.join(outputDir, relativePath); // 使用 path.join
                const parentDir = path.dirname(outputPath);
                const writeFilePromise = zipEntry.async('nodebuffer')
                    .then(content => fs.writeFile(outputPath, content));

                if (parentDir !== outputDir) { // 只有当需要创建子目录时才创建
                    promises.push(
                        fs.mkdir(parentDir, { recursive: true })
                            .then(() => writeFilePromise)
                    );
                } else {
                    promises.push(writeFilePromise);
                }
            }
        });
        await Promise.all(promises);
        console.log(`成功提取 ${zipFilePath} 的所有内容到 ${outputDir}`);
    } catch (error) {
        console.error(`提取 ZIP ${zipFilePath} 所有内容到 ${outputDir} 时出错:`, error);
        throw error;
    }
}

/**
 * 从 ZIP 文件中删除指定文件。
 * @param {string} zipFilePath - ZIP 文件路径。
 * @param {string} fileNameInZip - 要删除的文件名。
 * @returns {Promise<void>} 操作成功则 resolve，失败则 reject。
 * @throws {Error} 读取 ZIP、文件不存在或写入失败时抛出错误。
 */
export async function removeFileFromZip(zipFilePath, fileNameInZip) {
    try {
        const zipData = await fs.readFile(zipFilePath);
        const zip = await JSZip.loadAsync(zipData);
        if (!zip.file(fileNameInZip)) {
            console.warn(`尝试删除的文件 ${fileNameInZip} 在 ZIP ${zipFilePath} 中不存在。`);
            return; // 文件不存在，直接返回
            // throw new Error(`ZIP 文件 ${zipFilePath} 中不存在文件: ${fileNameInZip}`);
        }
        zip.remove(fileNameInZip);
        const updatedZipContent = await zip.generateAsync({ type: 'nodebuffer' });
        await fs.writeFile(zipFilePath, updatedZipContent);
        console.log(`成功从 ${zipFilePath} 删除文件 ${fileNameInZip}`);
    } catch (error) {
        console.error(`从 ZIP 文件 ${zipFilePath} 删除文件 ${fileNameInZip} 时出错:`, error);
        throw error;
    }
}

/**
 * 列出 ZIP 文件中的所有文件（不包括目录）。
 * @param {string} zipFilePath - ZIP 文件路径。
 * @returns {Promise<string[]>} 文件名数组。
 * @throws {Error} 读取 ZIP 失败时抛出错误。
 */
export async function listFilesInZip(zipFilePath) {
    try {
        const zipData = await fs.readFile(zipFilePath);
        const zip = await JSZip.loadAsync(zipData);
        const fileNames = [];
        zip.forEach((relativePath, zipEntry) => {
            if (!zipEntry.dir) {
                fileNames.push(relativePath);
            }
        });
        return fileNames;
    } catch (error) {
        console.error(`列出 ZIP 文件 ${zipFilePath} 内容时出错:`, error);
        throw error;
    }
}

/**
 * 将本地文件夹内容递归添加到 ZIP 文件中。
 * @param {string} zipFilePath - 目标 ZIP 文件路径 (如果不存在则创建)。
 * @param {string} folderPath - 要添加的本地文件夹路径。
 * @param {string} [folderNameInZip=''] - 在 ZIP 文件中创建的根文件夹名称 (默认为空，即直接添加到 ZIP 根目录)。
 * @returns {Promise<void>} 操作成功则 resolve，失败则 reject。
 * @throws {Error} 读取文件、加载 ZIP 或写入失败时抛出错误。
 */
export async function addFolderToZip(zipFilePath, folderPath, folderNameInZip = '') {
    let zip;
    try {
        // 尝试读取现有 zip 文件，如果不存在则创建新的
        try {
            const zipData = await fs.readFile(zipFilePath);
            zip = await JSZip.loadAsync(zipData);
        } catch (error) {
            if (error.code === 'ENOENT') { // 文件不存在错误
                zip = new JSZip();
                console.log(`目标 ZIP 文件 ${zipFilePath} 不存在，将创建新的。`);
            } else {
                throw error; // 其他读取错误，向上抛出
            }
        }

        // 递归添加文件夹内容
        async function addFolderContents(currentFolderPath, currentZipPath) {
            const items = await fs.readdir(currentFolderPath, { withFileTypes: true });
            for (const item of items) {
                const sourcePath = path.join(currentFolderPath, item.name);
                const targetPath = currentZipPath ? path.join(currentZipPath, item.name).replace(/\\/g, '/') : item.name; // 在 ZIP 中使用 '/' 分隔符

                if (item.isDirectory()) {
                    // 添加目录条目 (JSZip 会自动处理)
                    // zip.folder(targetPath);
                    await addFolderContents(sourcePath, targetPath);
                } else if (item.isFile()) {
                    const fileData = await fs.readFile(sourcePath);
                    zip.file(targetPath, fileData);
                }
            }
        }

        await addFolderContents(folderPath, folderNameInZip);

        const updatedZipContent = await zip.generateAsync({ type: 'nodebuffer' });
        await fs.writeFile(zipFilePath, updatedZipContent);
        console.log(`成功将文件夹 ${folderPath} 添加到 ${zipFilePath}` + (folderNameInZip ? ` (根目录: ${folderNameInZip})` : ''));
    } catch (error) {
        console.error(`添加文件夹 ${folderPath} 到 ZIP 文件 ${zipFilePath} 时出错:`, error);
        throw error;
    }
}

/**
 * 检查 ZIP 文件是否包含指定的文件或目录。
 * @param {string} zipFilePath - ZIP 文件路径。
 * @param {string} entryNameInZip - 要检查的文件或目录名 (目录应以 / 结尾)。
 * @returns {Promise<boolean>} 条目是否存在。
 * @throws {Error} 读取 ZIP 失败时抛出错误。
 */
export async function hasEntryInZip(zipFilePath, entryNameInZip) {
    try {
        const zipData = await fs.readFile(zipFilePath);
        const zip = await JSZip.loadAsync(zipData);
        return zip.file(entryNameInZip) !== null || zip.folder(entryNameInZip).length > 0; // 检查文件或目录
    } catch (error) {
        console.error(`检查 ZIP 文件 ${zipFilePath} 中是否存在 ${entryNameInZip} 时出错:`, error);
        // 如果是文件不存在错误，可以认为不包含，否则抛出
        if (error.code === 'ENOENT') {
            return false;
        }
        throw error;
    }
} 