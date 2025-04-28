/**
 * Vue组件加载器
 * 
 * 提供加载Vue单文件组件(SFC)的功能，支持在思源笔记中使用Vue组件
 */

import { 添加到模块缓存, 创建样式管理器 } from './forVueCache.js';
import { 初始化Vue应用, 创建Vue界面 } from './forVueApp.js';
import { 初始化错误处理, 创建错误信息, 加载历史记录 } from './forVueError.js';

// 声明全局配置和状态
let Vue;
let SfcLoader;
let VueKonva;
let Konva;
let 配置 = {
  // 公用组件路径
  公用组件路径: '',
  // 默认组件路径
  默认组件路径: '',
  // 是否在控制台显示调试信息
  调试模式: false,
  // 加载超时时间(毫秒)
  超时时间: 30000
};

/**
 * 初始化Vue组件加载器
 * @param {Object} options - 配置选项
 * @returns {Promise<Object>} 返回加载器实例
 */
export const 初始化组件加载器 = async (options = {}) => {
  try {
    // 第一步：设置配置项
    配置 = { ...配置, ...options };
    加载历史记录.记录事件('初始化组件加载器', { 配置项: { ...配置, Vue: !!options.Vue, SfcLoader: !!options.SfcLoader } });
    
    // 第二步：配置Vue和SfcLoader
    Vue = options.Vue || window.Vue;
    SfcLoader = options.SfcLoader || window.SfcLoader;
    
    if (!Vue || !SfcLoader) {
      // 如果未提供Vue或SfcLoader，尝试动态导入
      try {
        加载历史记录.记录事件('尝试动态导入Vue和SfcLoader');
        const VueModule = await import('https://unpkg.com/vue@3/dist/vue.esm-browser.js');
        Vue = VueModule.default || VueModule;
        const { loadModule } = await import('https://cdn.jsdelivr.net/npm/vue3-sfc-loader@0.8.4/dist/vue3-sfc-loader.esm.js');
        SfcLoader = { loadModule };
        加载历史记录.记录事件('动态导入成功', { Vue: !!Vue, SfcLoader: !!SfcLoader });
      } catch (error) {
        加载历史记录.记录错误(error, '动态导入Vue或SfcLoader失败');
        throw 创建错误信息('初始化失败', `无法加载Vue或SFC-Loader: ${error.message}`, error);
      }
    }
    
    // 第三步：添加到模块缓存
    添加到模块缓存('vue', Vue);
    
    // 第四步：尝试加载VueKonva和Konva
    try {
      加载历史记录.记录事件('尝试加载VueKonva和Konva');
      // 先尝试从window对象获取
      VueKonva = options.VueKonva || window.VueKonva;
      Konva = options.Konva || window.Konva;
      
      // 如果没有找到，尝试从静态资源导入
      if (!VueKonva || !Konva) {
        const KonvaModule = await import('/static/konva.js');
        Konva = KonvaModule.default || KonvaModule;
        
        const VueKonvaModule = await import('/static/vue-konva.mjs');
        VueKonva = VueKonvaModule.default || VueKonvaModule;
        
        加载历史记录.记录事件('VueKonva和Konva加载成功', { VueKonva: !!VueKonva, Konva: !!Konva });
      }
      
      // 添加到模块缓存
      添加到模块缓存('konva', Konva);
      添加到模块缓存('vue-konva', VueKonva);
      
      // 为所有Vue应用默认启用VueKonva
      if (Vue && VueKonva) {
        加载历史记录.记录事件('为Vue应用默认启用VueKonva');
      }
    } catch (error) {
      // 记录错误但不阻止继续运行
      加载历史记录.记录错误(error, '加载VueKonva或Konva失败，应用将不支持绘图功能');
      console.warn('加载VueKonva或Konva失败，应用将不支持绘图功能:', error);
    }
    
    // 第五步：初始化错误处理
    初始化错误处理(配置.调试模式, Vue);
    
    // 第六步：返回组件加载器接口
    return {
      Vue,
      SfcLoader,
      配置,
      加载历史记录,
      /**
       * 加载Vue组件
       * @param {string|Object} 组件路径 - 组件路径或对象
       * @param {string} 组件名称 - 组件名称
       * @param {Object} 附加选项 - 附加选项
       * @param {string} 热重载目录 - 热重载目录
       * @param {Object} 数据 - 应用数据
       * @returns {Promise<Object>} Vue应用实例
       */
      加载组件: async (组件路径, 组件名称 = '', 附加选项 = {}, 热重载目录 = '', 数据 = {}) => {
        // 添加VueKonva到moduleCache
        if (VueKonva && !附加选项.moduleCache?.['vue-konva']) {
          附加选项.moduleCache = 附加选项.moduleCache || {};
          附加选项.moduleCache['vue-konva'] = VueKonva;
        }
        
        // 在创建Vue应用前添加VueKonva插件
        const 原始创建应用 = Vue.createApp;
        Vue.createApp = function(...args) {
          const app = 原始创建应用.apply(this, args);
          // 如果已加载VueKonva则自动安装
          if (VueKonva && VueKonva.install) {
            app.use(VueKonva);
          }
          return app;
        };
        
        // 调用原始的初始化Vue应用函数
        const app = await 初始化Vue应用(组件路径, 组件名称, 附加选项, 热重载目录, 数据, Vue, SfcLoader);
        
        // 恢复原始的createApp方法
        Vue.createApp = 原始创建应用;
        
        return app;
      },
      
      /**
       * 创建UI界面组件
       * @param {Object} 容器 - 容器元素或Tab对象
       * @param {string} 组件路径 - 组件路径
       * @param {string} 容器ID - 容器ID
       * @param {Object} 附加数据 - 附加数据
       * @returns {Promise<Object>} Vue应用实例
       */
      创建界面: async (容器, 组件路径, 容器ID = '', 附加数据 = {}) => {
        // 添加VueKonva支持
        const 原始创建应用 = Vue.createApp;
        Vue.createApp = function(...args) {
          const app = 原始创建应用.apply(this, args);
          // 如果已加载VueKonva则自动安装
          console.error(VueKonva)
          if (VueKonva && VueKonva.install) {
            app.use(VueKonva);
          }
          return app;
        };
        
        // 调用原始的创建Vue界面函数
        const app = await 创建Vue界面(容器, 组件路径, 容器ID, 附加数据, Vue, SfcLoader);
        
        // 恢复原始的createApp方法
        Vue.createApp = 原始创建应用;
        
        return app;
      },
      
      /**
       * 创建一个独立的样式管理器
       * @returns {Object} 样式管理器实例
       */
      创建样式管理器: () => {
        return 创建样式管理器();
      }
    };
  } catch (error) {
    加载历史记录.记录错误(error, '初始化组件加载器失败');
    console.error('初始化组件加载器失败:', error);
    throw 创建错误信息('初始化失败', `组件加载器初始化失败: ${error.message}`, error);
  }
}; 