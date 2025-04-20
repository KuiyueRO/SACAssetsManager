/**
 * @fileoverview Electron 前端文件系统操作工具
 * @module toolBox/feature/forElectronFrontend/forFileSystemOperations
 * @description 提供在 Electron 渲染进程中执行文件系统操作（移动、复制、链接、回收站）的功能，
 *              包含用户交互（确认对话框）和错误处理逻辑。
 */

import { confirmAsPromise } from '../../../../src/toolBox/base/useEnv/siyuanDialog.js'; // 更新导入路径
const fs = require('fs').promises
const path = require('path')
const MAX_PATH_LENGTH = 260; // Windows 的最大路径长度限制

/**
 * 在前端处理一系列文件操作。
 * @param {Array<{path: string, name: string}>} assets - 要处理的资源对象数组。
 * @param {string} targetPath - 目标目录路径。
 * @param {'move'|'copy'|'hardlink'|'symlink'|'trash'} operation - 要执行的操作类型。
 * @param {function(string, object, string, Error?): Promise<void>} [callBack] - 每个操作完成后的回调函数 (成功或失败时都会调用)。
 * @returns {Promise<string[]>} 返回一个包含所有错误消息的数组。
 */
export async function processFilesFrontEnd(assets, targetPath, operation, callBack) {
    const errors = [];
    for (const asset of assets) {
        // 对 trash 操作特殊处理，它不需要目标路径
        const targetFilePath = operation === 'trash' ? asset.path : path.join(targetPath, path.basename(asset.path));
        try {
            // 仅在非 trash 操作时检查目标路径长度
            if (operation !== 'trash') {
                 await handleLongPath(targetFilePath, MAX_PATH_LENGTH);
            }
            await performOperation(operation, asset, targetFilePath);
            callBack && await callBack(operation, asset, targetFilePath)
        } catch (error) {
            console.error(error); // 在内部记录详细错误
            errors.push(`处理文件 ${asset.name} (${operation}) 时出错: ${error.message}`);
            callBack && await callBack(operation, asset, targetFilePath, error)
        }
    }
    return errors;
}

// 内部辅助函数保持不变，但最好加上 JSDoc

/**
 * 生成一个在指定目录下唯一的文件名。
 * @param {string} filePath - 原始文件路径。
 * @returns {Promise<string>} 唯一的可用文件路径。
 * @private
 */
async function getUniqueFilename(filePath) {
    const dir = path.dirname(filePath);
    const ext = path.extname(filePath);
    const baseName = path.basename(filePath, ext);
    let newPath = filePath;
    let counter = 1;

    while (true) {
        try {
            await fs.access(newPath);
            newPath = path.join(dir, `${baseName} (${counter})${ext}`);
            counter++;
        } catch (error) {
            // 如果文件不存在 (ENOENT)，则找到了唯一路径
            if (error.code === 'ENOENT') {
                return newPath;
            }
            // 其他错误则向上抛出
            throw error;
        }
    }
}

/**
 * 移动文件，处理同名和跨设备情况。
 * @param {string} source - 源文件路径。
 * @param {string} target - 目标文件路径。
 * @private
 */
async function moveFile(source, target) {
    try {
        // 检查目标文件是否已存在
        try {
            await fs.access(target);
            // 如果文件存在，询问用户是否重命名
            const shouldRename = await confirmAsPromise(
                '文件已存在',
                `目标位置已存在同名文件 "${path.basename(target)}"。是否重命名新文件？`
            );
            if (shouldRename) {
                target = await getUniqueFilename(target);
            } else {
                throw new Error('用户取消了操作');
            }
        } catch (accessError) {
            // 如果文件不存在，是正常情况，忽略 ENOENT 错误
            if (accessError.code !== 'ENOENT') {
                throw accessError; // 其他访问错误则抛出
            }
        }

        // 尝试重命名（移动）
        await fs.rename(source, target);
    } catch (error) {
        // 如果是跨设备错误 (EXDEV)
        if (error.code === 'EXDEV') {
            console.warn(`移动文件 ${source} 到 ${target} 失败 (EXDEV)，尝试复制后删除。`);
            // 先复制后删除
            await copyFile(source, target); // 使用已实现的 copyFile 函数
            await fs.unlink(source);
        } else {
            // 其他错误直接抛出
            throw error;
        }
    }
}

/**
 * 复制文件，处理同名情况。
 * @param {string} source - 源文件路径。
 * @param {string} target - 目标文件路径。
 * @private
 */
async function copyFile(source, target) {
    try {
        // 检查目标文件是否已存在
        try {
            await fs.access(target);
            // 如果文件存在，询问用户是否重命名
            const shouldRename = await confirmAsPromise(
                '文件已存在',
                `目标位置已存在同名文件 "${path.basename(target)}"。是否重命名新文件？`
            );
            if (shouldRename) {
                target = await getUniqueFilename(target);
            } else {
                throw new Error('用户取消了操作');
            }
        } catch (accessError) {
             // 如果文件不存在，是正常情况，忽略 ENOENT 错误
            if (accessError.code !== 'ENOENT') {
                throw accessError; // 其他访问错误则抛出
            }
        }

        await fs.copyFile(source, target);
    } catch (error) {
        throw error;
    }
}


/**
 * 创建硬链接，处理符号链接和跨设备情况。
 * @param {string} source - 源文件路径。
 * @param {string} target - 目标链接路径。
 * @private
 */
async function createHardLink(source, target) {
    try {
        // 使用 lstat 检查源是否是符号链接
        const stats = await fs.lstat(source);
        if (stats.isSymbolicLink()) {
            throw new Error('不能为符号链接创建硬链接');
        }
        await fs.link(source, target);
    } catch (error) {
        // 如果是跨设备错误 (EXDEV)
        if (error.code === 'EXDEV') {
            console.warn(`创建硬链接 ${target} -> ${source} 失败 (EXDEV)，询问是否创建软链接。`);
            const useSymlink = await confirmAsPromise(
                '无法创建硬链接',
                '源文件和目标路径不在同一文件系统上,无法创建硬链接。是否创建软链接替代?'
            );
            if (useSymlink) {
                await createSymLink(source, target); // 调用已实现的 createSymLink 函数
            } else {
                throw new Error('用户取消了操作');
            }
        } else {
            throw error;
        }
    }
}

/**
 * 创建软链接，处理符号链接和创建失败情况。
 * @param {string} source - 源文件路径。
 * @param {string} target - 目标链接路径。
 * @private
 */
async function createSymLink(source, target) {
    try {
        // 注意：通常允许为符号链接创建软链接（链接到链接）
        // 如果确实不允许，需要保留 lstat 检查
        // const stats = await fs.lstat(source);
        // if (stats.isSymbolicLink()) {
        //     throw new Error('不允许为符号链接创建软链接'); 
        // }
        await fs.symlink(source, target);
    } catch (error) {
        // 特定错误可以直接抛出，例如权限问题
        // if (error.message === '不允许为符号链接创建软链接') {
        //     throw error;
        // }
        console.warn(`创建软链接 ${target} -> ${source} 失败，询问是否复制。Error: ${error.message}`);
        const useCopy = await confirmAsPromise(
            '无法创建软链接',
            '创建软链接失败。是否复制文件作为替代?'
        );
        if (useCopy) {
            await copyFile(source, target); // 使用已实现的 copyFile 函数
        } else {
            throw new Error('用户取消了操作');
        }
    }
}

/**
 * 检查并处理目标路径过长的情况 (Windows)。
 * @param {string} targetFilePath - 目标文件路径。
 * @param {number} maxLength - 允许的最大路径长度。
 * @private
 */
async function handleLongPath(targetFilePath, maxLength) {
    // 只在 Windows 平台检查
    if (process.platform === 'win32' && targetFilePath.length > maxLength) {
        console.warn(`目标路径 ${targetFilePath} 过长 (${targetFilePath.length} > ${maxLength})，询问用户。`);
        const continueOperation = await confirmAsPromise(
            '目标路径过长',
            `目标路径 "${targetFilePath}" 超过了${maxLength}个字符。这可能导致某些程序无法访问。是否继续操作？`
        );
        if (!continueOperation) {
            throw new Error('用户取消了操作: 目标路径过长');
        }
    }
}

/**
 * 将文件移动到系统回收站，并提供备选方案。
 * @param {string} filePath - 要移动到回收站的文件路径。
 * @private
 */
async function trashFile(filePath) {
    try {
        // 尝试使用 Electron 的 shell.trashItem
        const shell = require('@electron/remote').shell;
        // trashItem 需要反斜杠路径?
        await shell.trashItem(path.normalize(filePath)); 
        console.log(`文件已移动到系统回收站: ${filePath}`);
    } catch (error) {
        console.error(`使用 shell.trashItem 移动到回收站失败: ${error.message} (Path: ${filePath})`);
        // 尝试移动到群晖回收站
        try {
            const synoTrashPath = await getSynoTrashPath(filePath);
            // 确保目标路径唯一
            const uniqueSynoPath = await getUniqueFilename(synoTrashPath);
            await fs.rename(filePath, uniqueSynoPath);
            console.log(`文件已移动到群晖回收站: ${uniqueSynoPath}`);
            return; // 成功移动到群晖回收站
        } catch (synoError) {
            console.error(`移动到群晖回收站失败: ${synoError.message}`);
            // 尝试移动到 .sac/trashed
            try {
                const sacTrashPath = await getSacTrashPath(filePath);
                 // 确保目标路径唯一
                const uniqueSacPath = await getUniqueFilename(sacTrashPath);
                await fs.rename(filePath, uniqueSacPath);
                console.log(`文件已移动到 .sac/trashed: ${uniqueSacPath}`);
                return; // 成功移动到 .sac 回收站
            } catch (sacError) {
                console.error(`移动到 .sac/trashed 失败: ${sacError.message}`);
                // 最后的备选方案：询问是否直接删除
                const deleteFile = await confirmAsPromise(
                    '无法移入回收站',
                    `无法将文件移入系统、群晖或 .sac 回收站。是否直接删除文件 "${path.basename(filePath)}"？此操作不可恢复！`
                );
                if (deleteFile) {
                    try {
                        await fs.unlink(filePath);
                        console.log(`文件已被直接删除: ${filePath}`);
                        return; // 成功删除
                    } catch (deleteError) {
                        console.error(`直接删除文件失败: ${deleteError.message}`);
                        throw new Error(`无法将文件移动到任何回收站或删除: ${deleteError.message}`);
                    }
                } else {
                    throw new Error('用户取消了删除操作');
                }
            }
        }
    }
}

/**
 * 获取并确保 .sac/trashed 回收站目录存在，并返回目标路径。
 * @param {string} filePath - 原始文件路径。
 * @returns {Promise<string>} .sac/trashed 中的目标文件路径。
 * @private
 */
async function getSacTrashPath(filePath) {
    const driveRoot = path.parse(filePath).root;
    // 修正路径拼接，确保 .sac 在根目录
    const sacTrashDir = path.join(driveRoot, '.sac', 'trashed'); 

    try {
        // 检查目录是否存在，如果不存在则创建
        await fs.mkdir(sacTrashDir, { recursive: true }); 
    } catch (error) {
        // 如果错误不是因为目录已存在，则抛出
        if (error.code !== 'EEXIST') { 
             console.error(`创建 .sac/trashed 目录失败: ${sacTrashDir}`, error);
             throw error;
        }
    }
    // 返回拼接好的目标路径，文件名保持不变
    return path.join(sacTrashDir, path.basename(filePath)); 
}

/**
 * 获取群晖 #recycle 回收站目录中的目标路径。
 * @param {string} filePath - 原始文件路径。
 * @returns {Promise<string>} #recycle 中的目标文件路径。
 * @throws 如果无法访问 #recycle 目录。
 * @private
 */
async function getSynoTrashPath(filePath) {
    // 尝试找到挂载点或共享根目录
    // 这部分逻辑可能需要根据实际部署情况调整
    let currentPath = path.dirname(filePath);
    let shareRoot = path.parse(currentPath).root; // 默认为驱动器根目录
    let trashPath = path.join(shareRoot, '#recycle');
    let found = false;

    // 向上查找 #recycle 目录，限制查找层数避免死循环
    for (let i = 0; i < 10 && currentPath !== shareRoot; i++) {
        const potentialTrashPath = path.join(currentPath, '#recycle');
        try {
            await fs.access(potentialTrashPath); // 检查是否存在
            trashPath = potentialTrashPath;
            found = true;
            break;
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.warn(`访问 ${potentialTrashPath} 出错:`, error.code);
            }
            currentPath = path.dirname(currentPath);
        }
    }
     // 如果向上查找未找到，最后检查一次根目录的 #recycle
     if (!found) {
         const rootTrashPath = path.join(shareRoot, '#recycle');
         try {
            await fs.access(rootTrashPath);
            trashPath = rootTrashPath;
            found = true;
         } catch(error) {
            if (error.code !== 'ENOENT') {
                 console.warn(`访问 ${rootTrashPath} 出错:`, error.code);
            }
         }
     }

    if (!found) {
         throw new Error(`在路径 ${filePath} 的上级目录或根目录未找到有效的群晖回收站 (#recycle)`);
    }

    // 确保 #recycle 目录存在（虽然 access 成功了，但还是检查一下）
    try {
         await fs.mkdir(trashPath, { recursive: true });
    } catch (error) {
         if (error.code !== 'EEXIST') {
            console.error(`创建 #recycle 目录失败: ${trashPath}`, error);
            throw error;
         }
    }
    
    // 返回目标路径
    return path.join(trashPath, path.basename(filePath));
}

/**
 * 根据操作类型执行具体的文件操作。
 * @param {'move'|'copy'|'hardlink'|'symlink'|'trash'} operation - 操作类型。
 * @param {object} asset - 包含源文件信息的对象 {path: string, name: string}。
 * @param {string} targetFilePath - 目标文件路径 (对于 trash 操作，此参数未使用)。
 * @private
 */
async function performOperation(operation, asset, targetFilePath) {
    switch (operation) {
        case 'move':
            await moveFile(asset.path, targetFilePath);
            break;
        case 'copy':
            await copyFile(asset.path, targetFilePath);
            break;
        case 'hardlink':
            await createHardLink(asset.path, targetFilePath);
            break;
        case 'symlink':
            await createSymLink(asset.path, targetFilePath);
            break;
        case 'trash':
            await trashFile(asset.path); // trashFile 内部处理路径
            break;
        default:
            throw new Error(`不支持的操作类型: ${operation}`);
    }
}

// 可以添加英文别名导出
export { processFilesFrontEnd as processFilesWithDialog }; 