/**
 * NodeLoader.js
 * 
 * 负责从各种来源加载节点定义并集成到toolPanel中
 */

import { parseJSFileToNodeDefinition, parseModuleToNodeDefinitions } from './NodeParser.js';

// 存储已加载的节点定义
const loadedNodeDefinitions = [];

// 按分类组织的节点
let categorizedNodes = [];

/**
 * 从JS文件加载单个节点
 * @param {string} url - JS文件URL
 * @param {string} exportName - 导出函数名
 * @returns {Promise<Object|null>} 节点定义对象或null
 */
export const loadNodeFromJSFile = async (url, exportName) => {
  try {
    // 解析JS文件中的节点定义
    const nodeDefinition = await parseJSFileToNodeDefinition(url, exportName);
    
    if (nodeDefinition) {
      // 检查是否已经加载过相同ID的节点
      const existingIndex = loadedNodeDefinitions.findIndex(node => node.id === nodeDefinition.id);
      if (existingIndex !== -1) {
        // 替换已存在的节点
        loadedNodeDefinitions[existingIndex] = nodeDefinition;
      } else {
        // 添加新节点
        loadedNodeDefinitions.push(nodeDefinition);
      }
      
      // 重新组织分类
      organizeCategorizedNodes();
      
      return nodeDefinition;
    }
    
    return null;
  } catch (error) {
    console.error('加载节点失败:', error);
    return null;
  }
};

/**
 * 从JS模块加载多个节点
 * @param {Object} moduleObj - 模块对象
 * @param {string} modulePath - 模块路径
 * @param {Object} options - 配置选项
 * @returns {Promise<Array>} 加载的节点定义数组
 */
export const loadNodesFromModule = async (moduleObj, modulePath, options = {}) => {
  try {
    // 解析模块中的所有节点定义
    const nodeDefinitions = await parseModuleToNodeDefinitions(moduleObj, modulePath, options);
    
    if (nodeDefinitions && nodeDefinitions.length > 0) {
      // 合并新节点定义到已加载列表
      for (const nodeDefinition of nodeDefinitions) {
        const existingIndex = loadedNodeDefinitions.findIndex(node => node.id === nodeDefinition.id);
        if (existingIndex !== -1) {
          // 替换已存在的节点
          loadedNodeDefinitions[existingIndex] = nodeDefinition;
        } else {
          // 添加新节点
          loadedNodeDefinitions.push(nodeDefinition);
        }
      }
      
      // 重新组织分类
      organizeCategorizedNodes();
      
      return nodeDefinitions;
    }
    
    return [];
  } catch (error) {
    console.error('从模块加载节点失败:', error);
    return [];
  }
};

/**
 * 将节点按分类组织
 */
const organizeCategorizedNodes = () => {
  // 收集所有唯一的分类
  const categories = new Set();
  loadedNodeDefinitions.forEach(node => {
    categories.add(node.category || '未分类');
  });
  
  // 按分类组织节点
  categorizedNodes = Array.from(categories).map(categoryName => {
    const categoryNodes = loadedNodeDefinitions.filter(node => 
      (node.category || '未分类') === categoryName
    );
    
    const categoryType = categoryNodes.length > 0 && categoryNodes[0].type 
      ? categoryNodes[0].type 
      : 'function';
    
    return {
      name: categoryName,
      type: categoryType,
      nodes: categoryNodes
    };
  });
  
  // 按分类名称排序
  categorizedNodes.sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * 获取所有已加载的节点定义
 * @returns {Array} 节点定义数组
 */
export const getAllNodeDefinitions = () => {
  return [...loadedNodeDefinitions];
};

/**
 * 获取按分类组织的节点
 * @returns {Array} 按分类组织的节点数组
 */
export const getCategorizedNodes = () => {
  return [...categorizedNodes];
};

/**
 * 清除所有已加载的节点
 */
export const clearAllNodes = () => {
  loadedNodeDefinitions.length = 0;
  categorizedNodes.length = 0;
};

/**
 * 批量加载多个模块的所有节点
 * @param {Array} moduleConfigs - 模块配置数组，每个配置包含 {module, path, options} 
 * @returns {Promise<Array>} 所有加载的节点定义数组
 */
export const loadNodesFromModules = async (moduleConfigs) => {
  const allDefinitions = [];
  
  for (const { module, path, options } of moduleConfigs) {
    const definitions = await loadNodesFromModule(module, path, options);
    allDefinitions.push(...definitions);
  }
  
  return allDefinitions;
};

// 初次调用，确保分类数组已初始化
organizeCategorizedNodes(); 