/**
 * @file 资源信息面板相关功能
 * @module source/UI/pannels/assetInfoPanel/assetInfoPanel
 */

import { plugin } from '../../../asyncModules.js';
import { 打开附件面板 } from '../../../../src/toolBox/useAge/forSiyuan/useSiyuanTab.js';
import { 清理重复元素 } from '../../../../src/toolBox/base/useEcma/forArray/computeArraySets.js';

/**
 * 打开文件夹数组素材页签
 * 
 * 将一个或多个文件夹作为资源目录打开在思源页签中
 * 
 * @param {Array<string>} 页签数组 - 要打开的文件夹路径数组
 * @returns {Object|undefined} 打开的页签对象
 */
export function 打开文件夹数组素材页签(页签数组) {
  if (!页签数组 || 页签数组.length === 0) {
    console.warn('打开文件夹数组素材页签: 无有效的文件夹路径');
    return;
  }
  
  // 清理重复路径
  const uniquePaths = 清理重复元素(页签数组);
  
  return 打开附件面板({
    icon: "iconAssets",
    title: uniquePaths.length > 1 ? `资源:多目录(${uniquePaths.length})` : `资源:${uniquePaths[0]}`,
    data: {
      type: "localFolders",
      paths: uniquePaths
    },
  }, {}, plugin);
} 