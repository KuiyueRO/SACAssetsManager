/**
 * @fileoverview 提供路径解析和格式化相关的工具函数。
 */

// 注意：此模块中的函数可能依赖 Node.js 的 'path' 模块和全局的思源配置。
import * as path from 'path';

/**
 * 将相对于思源工作空间的路径（如 /plugins/..., assets/... 或其他相对路径）
 * 解析为操作系统的绝对路径。
 * 
 * @param {string} relativeOrWorkspacePath 相对于工作空间的路径或插件路径。
 * @returns {string} 解析后的绝对路径。如果无法获取工作空间路径，则返回清理掉协议前缀的原始路径。
 * @throws 如果无法访问 `window.siyuan.config.system.workspaceDir`，会打印警告。
 */
export const resolveWorkspacePath = (relativeOrWorkspacePath) => {
  if (typeof relativeOrWorkspacePath !== 'string' || !relativeOrWorkspacePath) {
    return '';
  }

  // 移除可能的 file:// 协议前缀
  const cleanPath = relativeOrWorkspacePath.replace(/^file:\/\//, '');

  // 获取思源笔记的工作空间路径 (依赖全局对象)
  const workspaceDir = window?.siyuan?.config?.system?.workspaceDir;
  if (!workspaceDir) {
    console.warn('resolveWorkspacePath: 未找到思源笔记工作空间路径 (window.siyuan.config.system.workspaceDir)。');
    // 无法解析时返回清理后的路径
    return cleanPath; 
  }

  // 如果已经是绝对路径，直接返回 (需要 path.isAbsolute)
  if (path.isAbsolute(cleanPath)) {
    return cleanPath;
  }

  // 尝试将路径视为相对于工作空间目录进行拼接
  // path.join 会处理 /plugins/ 前导斜杠等情况
  try {
      return path.join(workspaceDir, cleanPath);
  } catch (e) {
      console.error(`resolveWorkspacePath: 解析路径时出错 ('${workspaceDir}', '${cleanPath}')`, e);
      // 解析出错时返回清理后的路径
      return cleanPath;
  }
  
};

/**
 * 格式化文件路径以便于显示，通常显示路径的最后两部分。
 * 如果路径在思源工作空间内，则优先显示相对于工作空间的最后两部分。
 * 
 * @param {string} filePath 要格式化的完整文件路径。
 * @returns {string} 格式化后的、适合显示的较短路径字符串，例如 "folder/file.txt"。
 *                   如果输入无效，则返回 '未知路径'。
 * @throws 如果无法访问 `window.siyuan.config.system.workspaceDir`，会尝试按绝对路径处理。
 */
export const getShortDisplayPath = (filePath) => {
  if (typeof filePath !== 'string' || !filePath) {
    return '未知路径';
  }

  // 获取工作空间路径 (依赖全局对象)
  const workspaceDir = window?.siyuan?.config?.system?.workspaceDir;
  
  let displayPath = filePath; // 默认使用完整路径

  try {
      if (workspaceDir && filePath.startsWith(workspaceDir)) {
          // 如果是工作空间内的路径，计算相对路径
          const relativePath = path.relative(workspaceDir, filePath);
          displayPath = relativePath; // 使用相对路径作为基础
      } 
      // （无论是否在工作空间内）尝试获取最后两部分
      // 使用正则表达式分割，兼容 windows 和 linux 分隔符
      const parts = displayPath.split(/[\\\/]/);
      // 如果只有一部分，则显示那一部分；否则显示最后两部分
      return parts.length <= 1 ? parts[0] : parts.slice(-2).join('/');

  } catch(e) {
      console.error(`getShortDisplayPath: 格式化路径 '${filePath}' 时出错:`, e);
      // 出错时返回原始路径的最后一部分作为降级
      const parts = filePath.split(/[\\\/]/);
      return parts.pop() || filePath; // 返回最后一部分，如果分割失败则返回原路径
  }
}; 