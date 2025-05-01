/**
 * @fileoverview UI 层 - 显示格式化工具函数
 * 封装从 toolBox 或其他地方导入的、用于在 UI 中格式化数据显示的函数。
 * 目标是解耦 UI 组件与底层工具的具体实现。
 */

import { 生成文件列表描述 as _生成文件列表描述 } from '../../../../src/toolBox/base/useEcma/forFile/forFilePath.js';

/**
 * 为一组文件路径生成适合在 UI 中显示的描述字符串。
 * 例如：'file1.txt', 'file2.jpg' 或 'file1.txt 等 3 个文件'。
 * @param {Array<object | string>} assets - 文件对象数组 (需含 path 属性) 或文件路径字符串数组。
 * @param {number} [maxCount=3] - 直接显示名称的最大文件数。
 * @returns {string} 描述字符串，如果输入为空则返回 '无选择'。
 */
export const formatFileListDescription = (assets, maxCount = 3) => {
  if (!assets || assets.length === 0) return '无选择'; // 返回 '无选择'
  
  // 统一处理输入，确保是对象数组
  const assetList = assets.map(asset => 
    typeof asset === 'string' ? { path: asset } : asset
  );

  return _生成文件列表描述(assetList, maxCount);
};

/**
 * 获取文件的格式描述，单一格式显示大写扩展名，多种格式显示"多种"。
 * @param {Array<object | string>} assets - 文件对象数组 (需含 path 属性) 或文件路径字符串数组。
 * @returns {string} 文件格式描述, 如果输入为空则返回 '无选择'。
 */
// TODO: 添加 formatFileFormatDescription 函数

// 未来可以添加更多用于 UI 显示的格式化函数... 