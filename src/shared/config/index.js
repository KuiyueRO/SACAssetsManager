/**
 * 配置管理统一导出
 * 
 * 本文件统一导出所有配置，用于简化导入路径
 * 
 * 开发指南：
 * 1. 避免在此文件中定义新配置，应在相应的配置文件中定义
 * 2. 此文件应只包含导入和导出语句
 */

// 导入所有配置模块
import { 
  标签页配置, 标签页基础配置, 构建动态标签页配置, 获取标签页配置, TAB_CONFIGS 
} from './tabConfig.js';

import { 
  停靠面板配置, 创建停靠面板, 注册所有停靠面板, DOCK_CONFIGS 
} from './panelConfig.js';

// 统一导出所有配置
export {
  // 标签页配置相关
  标签页配置,
  标签页基础配置,
  构建动态标签页配置,
  获取标签页配置,
  TAB_CONFIGS,
  
  // 面板配置相关
  停靠面板配置,
  创建停靠面板,
  注册所有停靠面板,
  DOCK_CONFIGS
}; 