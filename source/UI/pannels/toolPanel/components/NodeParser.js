/**
 * NodeParser.js
 * 
 * 实现从JS文件的jsDoc注释中解析出工具节点的功能
 * 与Petri网编辑器的节点解析方式保持一致
 */

import { parseJSDocConfig } from "../../../../../src/toolBox/feature/forCodeAnalysis/jsParser.js";

/**
 * 解析JS文件中的JSDoc为节点定义
 * @param {string} code - JS源代码
 * @param {string} exportName - 要解析的导出函数名
 * @returns {Object} 节点定义对象
 */
export const parseJSDocToNodeDefinition = (code, exportName) => {
  try {
    // 使用现有的JSDoc解析器解析代码
    const jsDocConfig = parseJSDocConfig(code, exportName);
    
    // 转换为节点定义
    return convertJSDocToNodeDefinition(jsDocConfig, exportName);
  } catch (error) {
    console.error(`解析JSDoc失败: ${exportName}`, error);
    return null;
  }
};

/**
 * 将JSDoc配置转换为节点定义
 * @param {Object} jsDocConfig - JSDoc配置对象
 * @param {string} functionName - 函数名称
 * @returns {Object} 节点定义
 */
const convertJSDocToNodeDefinition = (jsDocConfig, functionName) => {
  // 提取有用的字段
  const { 
    name, 
    description, 
    inputTypes, 
    outputTypes, 
    defaultValues, 
    tags = {} 
  } = jsDocConfig;
  
  // 如果tags中有nodeName标签，则使用该标签作为节点名称，否则使用函数名
  const nodeName = tags.nodeName?.[0] || name || functionName;
  
  // 如果tags中有nodeCategory标签，则使用该标签作为节点分类，否则使用"未分类"
  const category = tags.nodeCategory?.[0] || "未分类";
  
  // 如果tags中有nodeType标签，则使用该标签作为节点类型，否则使用"function"
  const nodeType = tags.nodeType?.[0] || "function";
  
  // 创建节点定义
  const nodeDefinition = {
    id: `${category.toLowerCase().replace(/\s+/g, '-')}/${functionName.toLowerCase()}`,
    title: nodeName,
    description: description || `函数 ${functionName}`,
    type: nodeType,
    category,
    metadata: {
      jsDoc: {
        inputTypes: inputTypes || {},
        outputTypes: outputTypes || {},
        defaultValues: defaultValues || {},
        examples: tags.example || []
      }
    },
    // 创建节点的函数
    createNode: () => ({
      type: `${category.toLowerCase().replace(/\s+/g, '-')}/${functionName.toLowerCase()}`,
      name: nodeName,
      category
    })
  };
  
  // 解析节点图标
  if (tags.nodeIcon && tags.nodeIcon.length > 0) {
    nodeDefinition.icon = tags.nodeIcon[0];
  }
  
  return nodeDefinition;
};

/**
 * 从JS文件URL解析节点定义
 * @param {string} url - JS文件URL
 * @param {string} exportName - 导出函数名
 * @returns {Promise<Object>} 节点定义对象
 */
export const parseJSFileToNodeDefinition = async (url, exportName) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP错误! 状态码: ${response.status}`);
    }
    const code = await response.text();
    return parseJSDocToNodeDefinition(code, exportName);
  } catch (error) {
    console.error(`解析文件失败: ${url}`, error);
    return null;
  }
};

/**
 * 解析模块中的所有导出函数为节点定义
 * @param {Object} moduleObj - 已导入的模块对象
 * @param {string} modulePath - 模块路径
 * @param {Object} options - 配置选项
 * @param {Array<string>} [options.include] - 只包含这些导出函数
 * @param {Array<string>} [options.exclude] - 排除这些导出函数
 * @returns {Promise<Array<Object>>} 节点定义数组
 */
export const parseModuleToNodeDefinitions = async (moduleObj, modulePath, options = {}) => {
  const { include, exclude = [] } = options;
  
  // 获取所有导出函数名
  let exportNames = Object.keys(moduleObj).filter(name => {
    // 排除非函数
    return typeof moduleObj[name] === 'function';
  });
  
  // 如果指定了include，则只处理include中的函数
  if (include && include.length > 0) {
    exportNames = exportNames.filter(name => include.includes(name));
  }
  
  // 排除exclude中的函数
  if (exclude.length > 0) {
    exportNames = exportNames.filter(name => !exclude.includes(name));
  }
  
  // 解析每个导出函数
  const nodeDefinitions = [];
  
  try {
    // 获取模块源代码
    const response = await fetch(modulePath);
    if (!response.ok) {
      throw new Error(`HTTP错误! 状态码: ${response.status}`);
    }
    const code = await response.text();
    
    // 解析每个导出函数
    for (const exportName of exportNames) {
      const nodeDefinition = parseJSDocToNodeDefinition(code, exportName);
      if (nodeDefinition) {
        nodeDefinitions.push(nodeDefinition);
      }
    }
  } catch (error) {
    console.error(`解析模块失败: ${modulePath}`, error);
  }
  
  return nodeDefinitions;
};

/**
 * 从JSDoc生成Vue组件模板
 * @param {Object} nodeDefinition - 节点定义
 * @param {Object} moduleObj - 模块对象
 * @returns {string} Vue组件模板字符串
 */
export const generateVueComponentFromJSDoc = (nodeDefinition, moduleObj) => {
  const functionName = nodeDefinition.id.split('/').pop();
  const moduleFn = moduleObj[functionName] || (() => ({}));
  
  // 根据节点类型生成不同的组件模板
  switch (nodeDefinition.type) {
    case 'tool':
      return generateToolComponentTemplate(nodeDefinition, moduleFn);
    case 'function':
      return generateFunctionComponentTemplate(nodeDefinition, moduleFn);
    case 'component':
    default:
      return generateDefaultComponentTemplate(nodeDefinition, moduleFn);
  }
};

/**
 * 生成工具类型的Vue组件模板
 * @param {Object} nodeDefinition - 节点定义
 * @param {Function} moduleFn - 模块导出的函数
 * @returns {string} Vue组件模板字符串
 */
const generateToolComponentTemplate = (nodeDefinition, moduleFn) => {
  const { title, description, icon = 'fas fa-tools', id } = nodeDefinition;
  const functionName = id.split('/').pop();
  
  return `
<template>
  <div class="tool-node">
    <div class="node-icon">
      <i class="${icon}"></i>
    </div>
    <div class="node-content">
      <div class="node-title">${title}</div>
      <div class="node-description">${description}</div>
      <button 
        class="tool-button"
        :class="{ active: isActive }"
        @click="toggleTool"
      >
        {{ isActive ? '停止工具' : '启动工具' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ${functionName} } from '@source';
import { ref, onUnmounted } from 'vue';

// 工具实例
const toolInstance = ${functionName}();
const isActive = ref(false);

// 切换工具状态
const toggleTool = () => {
  if (isActive.value) {
    toolInstance.stop && toolInstance.stop();
    isActive.value = false;
  } else {
    toolInstance.start && toolInstance.start();
    isActive.value = true;
  }
};

// 组件卸载时清理
onUnmounted(() => {
  if (isActive.value && toolInstance.stop) {
    toolInstance.stop();
  }
});
</script>

<style scoped>
.tool-node {
  background-color: var(--tool-bg-card, #ffffff);
  border-radius: var(--tool-radius, 6px);
  padding: var(--tool-spacing-lg, 16px);
  margin-bottom: var(--tool-spacing-lg, 16px);
  border: 1px solid var(--tool-border, #dee2e6);
  display: flex;
  align-items: flex-start;
  box-shadow: var(--tool-shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.08));
  transition: all var(--tool-transition-fast, 150ms) ease;
}

.tool-node:hover {
  transform: translateY(-2px);
  box-shadow: var(--tool-shadow, 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1));
}

.node-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(66, 99, 235, 0.1);
  color: var(--tool-primary, #4263eb);
  border-radius: var(--tool-radius, 6px);
  margin-right: var(--tool-spacing-lg, 16px);
  flex-shrink: 0;
  font-size: 18px;
}

.node-content {
  flex: 1;
  min-width: 0;
}

.node-title {
  font-weight: 600;
  font-size: 16px;
  color: var(--tool-text, #212529);
  margin-bottom: 4px;
}

.node-description {
  color: var(--tool-text-secondary, #495057);
  font-size: 13px;
  margin-bottom: var(--tool-spacing, 8px);
}

.tool-button {
  padding: 6px 12px;
  background-color: var(--tool-primary, #4263eb);
  color: var(--tool-text-on-primary, #ffffff);
  border: none;
  border-radius: var(--tool-radius-sm, 4px);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all var(--tool-transition-fast, 150ms) ease;
}

.tool-button:hover {
  background-color: var(--tool-primary-hover, #3b5bdb);
}

.tool-button.active {
  background-color: #e74c3c;
}
</style>
`;
};

/**
 * 生成函数类型的Vue组件模板
 * @param {Object} nodeDefinition - 节点定义
 * @param {Function} moduleFn - 模块导出的函数
 * @returns {string} Vue组件模板字符串
 */
const generateFunctionComponentTemplate = (nodeDefinition, moduleFn) => {
  const { title, description, icon = 'fas fa-code', metadata, id } = nodeDefinition;
  const functionName = id.split('/').pop();
  
  // 生成输入参数表单
  let inputFields = '';
  let inputSetup = '';
  let inputRefs = '';
  
  if (metadata.jsDoc.inputTypes) {
    Object.entries(metadata.jsDoc.inputTypes).forEach(([name, type]) => {
      const defaultValue = metadata.jsDoc.defaultValues[name] !== undefined 
        ? JSON.stringify(metadata.jsDoc.defaultValues[name])
        : getDefaultValueForType(type);
      
      inputRefs += `const ${name}Ref = ref(${defaultValue});\n  `;
      
      // 根据类型生成不同的输入控件
      let inputField = '';
      if (type === 'boolean') {
        inputField = `
      <div class="input-field">
        <label for="${name}-input">${name}</label>
        <input 
          id="${name}-input" 
          type="checkbox" 
          v-model="${name}Ref"
        />
      </div>`;
      } else if (type === 'number') {
        inputField = `
      <div class="input-field">
        <label for="${name}-input">${name}</label>
        <input 
          id="${name}-input" 
          type="number" 
          v-model.number="${name}Ref"
        />
      </div>`;
      } else {
        inputField = `
      <div class="input-field">
        <label for="${name}-input">${name}</label>
        <input 
          id="${name}-input" 
          type="text" 
          v-model="${name}Ref"
        />
      </div>`;
      }
      
      inputFields += inputField;
      inputSetup += `    ${name}: ${name}Ref.value,\n`;
    });
  }
  
  return `
<template>
  <div class="function-node">
    <div class="node-icon">
      <i class="${icon}"></i>
    </div>
    <div class="node-content">
      <div class="node-title">${title}</div>
      <div class="node-description">${description}</div>
      
      <div class="inputs-container">
        ${inputFields}
      </div>
      
      <button 
        class="execute-button"
        @click="executeFunction"
      >
        执行函数
      </button>
      
      <div v-if="result" class="result-container">
        <div class="result-label">结果:</div>
        <div class="result-value">{{ result }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ${functionName} } from '@source';
import { ref, onUnmounted } from 'vue';

// 输入参数
${inputRefs}
// 执行结果
const result = ref(null);

// 执行函数
const executeFunction = async () => {
  try {
    const params = {
${inputSetup}
    };
    
    const functionResult = await ${functionName}(params);
    result.value = JSON.stringify(functionResult, null, 2);
  } catch (error) {
    console.error('执行函数出错:', error);
    result.value = '执行出错: ' + error.message;
  }
};
</script>

<style scoped>
.function-node {
  background-color: var(--tool-bg-card, #ffffff);
  border-radius: var(--tool-radius, 6px);
  padding: var(--tool-spacing-lg, 16px);
  margin-bottom: var(--tool-spacing-lg, 16px);
  border: 1px solid var(--tool-border, #dee2e6);
  display: flex;
  align-items: flex-start;
  box-shadow: var(--tool-shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.08));
  transition: all var(--tool-transition-fast, 150ms) ease;
}

.function-node:hover {
  transform: translateY(-2px);
  box-shadow: var(--tool-shadow, 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1));
}

.node-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(66, 99, 235, 0.1);
  color: var(--tool-primary, #4263eb);
  border-radius: var(--tool-radius, 6px);
  margin-right: var(--tool-spacing-lg, 16px);
  flex-shrink: 0;
  font-size: 18px;
}

.node-content {
  flex: 1;
  min-width: 0;
}

.node-title {
  font-weight: 600;
  font-size: 16px;
  color: var(--tool-text, #212529);
  margin-bottom: 4px;
}

.node-description {
  color: var(--tool-text-secondary, #495057);
  font-size: 13px;
  margin-bottom: var(--tool-spacing, 8px);
}

.inputs-container {
  margin: var(--tool-spacing, 8px) 0;
}

.input-field {
  margin-bottom: var(--tool-spacing, 8px);
  display: flex;
  flex-direction: column;
}

.input-field label {
  font-size: 12px;
  color: var(--tool-text-secondary, #495057);
  margin-bottom: 4px;
}

.input-field input {
  padding: 6px 8px;
  border: 1px solid var(--tool-border, #dee2e6);
  border-radius: var(--tool-radius-sm, 4px);
  font-size: 14px;
}

.execute-button {
  padding: 6px 12px;
  background-color: var(--tool-primary, #4263eb);
  color: var(--tool-text-on-primary, #ffffff);
  border: none;
  border-radius: var(--tool-radius-sm, 4px);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all var(--tool-transition-fast, 150ms) ease;
  margin-top: var(--tool-spacing, 8px);
}

.execute-button:hover {
  background-color: var(--tool-primary-hover, #3b5bdb);
}

.result-container {
  margin-top: var(--tool-spacing-lg, 16px);
  padding: var(--tool-spacing, 8px);
  background-color: var(--tool-bg-hover, #f1f3f5);
  border-radius: var(--tool-radius-sm, 4px);
}

.result-label {
  font-weight: 600;
  font-size: 12px;
  color: var(--tool-text-secondary, #495057);
  margin-bottom: 4px;
}

.result-value {
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 13px;
  color: var(--tool-text, #212529);
}
</style>
`;
};

/**
 * 生成默认类型的Vue组件模板
 * @param {Object} nodeDefinition - 节点定义
 * @param {Function} moduleFn - 模块导出的函数
 * @returns {string} Vue组件模板字符串
 */
const generateDefaultComponentTemplate = (nodeDefinition, moduleFn) => {
  const { title, description, icon = 'fas fa-puzzle-piece', id } = nodeDefinition;
  return `
<template>
  <div class="default-node">
    <div class="node-icon">
      <i class="${icon}"></i>
    </div>
    <div class="node-content">
      <div class="node-title">${title}</div>
      <div class="node-description">${description}</div>
    </div>
  </div>
</template>

<style scoped>
.default-node {
  background-color: var(--tool-bg-card, #ffffff);
  border-radius: var(--tool-radius, 6px);
  padding: var(--tool-spacing-lg, 16px);
  margin-bottom: var(--tool-spacing-lg, 16px);
  border: 1px solid var(--tool-border, #dee2e6);
  display: flex;
  align-items: flex-start;
  box-shadow: var(--tool-shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.08));
  transition: all var(--tool-transition-fast, 150ms) ease;
}

.default-node:hover {
  transform: translateY(-2px);
  box-shadow: var(--tool-shadow, 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1));
}

.node-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(66, 99, 235, 0.1);
  color: var(--tool-primary, #4263eb);
  border-radius: var(--tool-radius, 6px);
  margin-right: var(--tool-spacing-lg, 16px);
  flex-shrink: 0;
  font-size: 18px;
}

.node-content {
  flex: 1;
  min-width: 0;
}

.node-title {
  font-weight: 600;
  font-size: 16px;
  color: var(--tool-text, #212529);
  margin-bottom: 4px;
}

.node-description {
  color: var(--tool-text-secondary, #495057);
  font-size: 13px;
}
</style>
`;
};

/**
 * 根据类型获取默认值
 * @param {string} type - 参数类型
 * @returns {string} 默认值的字符串表示
 */
const getDefaultValueForType = (type) => {
  switch (type.toLowerCase()) {
    case 'string':
      return '""';
    case 'number':
      return '0';
    case 'boolean':
      return 'false';
    case 'object':
      return '{}';
    case 'array':
      return '[]';
    default:
      return 'null';
  }
};

/**
 * 动态编译Vue组件
 * @param {string} componentTemplate - Vue组件模板字符串
 * @param {Object} options - 编译选项
 * @returns {Object} 编译后的Vue组件
 */
export const compileVueComponent = async (componentTemplate, options = {}) => {
  // 这里应该使用Vue的编译器API动态编译组件
  // 在实际实现中，可能需要引入额外的依赖
  // 简单起见，这里仅返回模板字符串作为占位符
  return {
    template: componentTemplate,
    options
  };
};

/**
 * 从JSDoc注释创建一个可用的Vue组件
 * @param {Object} moduleObj - 模块对象
 * @param {string} exportName - 导出函数名
 * @param {string} code - 源代码
 * @returns {Promise<Object>} Vue组件对象
 */
export const createVueComponentFromJSDoc = async (moduleObj, exportName, code) => {
  // 解析JSDoc为节点定义
  const nodeDefinition = parseJSDocToNodeDefinition(code, exportName);
  if (!nodeDefinition) {
    throw new Error(`无法解析JSDoc: ${exportName}`);
  }
  
  // 生成组件模板
  const componentTemplate = generateVueComponentFromJSDoc(nodeDefinition, moduleObj);
  
  // 编译组件
  return await compileVueComponent(componentTemplate, {
    name: exportName + 'Component',
    props: {},
    emits: []
  });
}; 