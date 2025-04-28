/**
 * Electron浏览器窗口管理工具
 * 提供创建和管理Electron BrowserWindow的函数
 */
import { 获取BrowserWindow, 合并窗口配置, 验证配置有效性 } from './browserWindowCore.js';
import { 关闭窗口列表, 处理单实例模式, 创建新窗口 } from './browserWindowManagement.js';
import { 设置窗口保持活跃 } from './windowPersistence.js';
import { 设置窗口心跳检测 } from './windowHeartbeat.js';
/**
 * 创建浏览器窗口
 * @param {string} url - 窗口加载的URL
 * @param {Object} 配置 - 窗口配置选项
 * @param {boolean} [配置.关闭已有窗口=true] - 是否关闭已存在的相同URL窗口
 * @param {boolean} [配置.单实例=true] - 是否确保只有一个窗口实例
 * @param {boolean} [配置.立即显示=true] - 是否立即显示窗口
 * @param {boolean} [配置.清除缓存=true] - 是否清除浏览器缓存
 * @param {boolean} [配置.保持活跃=true] - 窗口关闭时是否自动重新创建
 * @param {boolean} [配置.使用心跳检测=true] - 是否启用心跳检测
 * @param {boolean} [配置.显示标题栏=true] - 是否显示窗口标题栏
 * @param {Function} [配置.获取同源窗口函数] - 查找同源窗口的函数
 * @param {Function} [配置.enableRemote] - 自定义的enableRemote函数，用于兼容不同版本的Electron
 * @returns {BrowserWindow} 创建的浏览器窗口
 */
export const 创建浏览器窗口 = (url, 用户配置 = {}) => {
  // 合并并验证配置
  const 配置 = 合并窗口配置(用户配置);
  验证配置有效性(配置);

  // 确保electron环境
  const BrowserWindow = 获取BrowserWindow();
  if (!BrowserWindow) {
    throw new Error('创建浏览器窗口需要Electron环境');
  }

  let 窗口 = null;
  let 同源窗口列表 = [];

  // 使用提供的函数或默认空数组
  if (typeof 配置.获取同源窗口函数 === 'function') {
    同源窗口列表 = 配置.获取同源窗口函数(url);
  }

  // 关闭已有窗口
  if (配置.关闭已有窗口 && 同源窗口列表.length > 0) {
    关闭窗口列表(同源窗口列表);

    // 重新获取窗口列表
    if (typeof 配置.获取同源窗口函数 === 'function') {
      同源窗口列表 = 配置.获取同源窗口函数(url);
    }
  }

  // 单实例模式处理
  if (配置.单实例 && 同源窗口列表.length > 0) {
    窗口 = 处理单实例模式(同源窗口列表, 配置.获取同源窗口函数, url);
  }

  // 如果没有现有窗口，创建新窗口
  if (!窗口) {
    窗口 = 创建新窗口(BrowserWindow, url, 配置);
  }

  // 设置窗口保持活跃
  设置窗口保持活跃(窗口, url, 配置);

  // 设置窗口心跳检测
  设置窗口心跳检测(窗口, 配置);

  return 窗口;
};

/**
 * 创建基于URL的浏览器窗口
 * 兼容性函数，保持与旧版API兼容
 */
export const createBrowserWindowByURL = 创建浏览器窗口;

/**
 * 创建一个无边框窗口。
 * @param {object} [配置={}] - Electron `BrowserWindow` 的配置选项。
 * @returns {{窗口: Electron.BrowserWindow, 窗口内容: Electron.WebContents}} 包含创建的窗口和其webContents的对象。
 * @throws {Error} 如果无法获取 Electron BrowserWindow 或 @electron/remote.dialog。
 */
export const 创建无边框窗口 = (配置 = {}) => {
    // 确保electron环境并获取BrowserWindow构造函数
    const BrowserWindow = 获取BrowserWindow();
    if (!BrowserWindow) {
      throw new Error('创建无边框窗口需要Electron环境');
    }

    // 尝试获取 remote 模块，用于启用 webContents
    let remote;
    try {
        remote = window.require('@electron/remote');
        if (!remote) throw new Error('window.require("@electron/remote") returned null/undefined');
    } catch (error) {
        console.error('Failed to require @electron/remote:', error);
        // 根据需要决定是否抛出错误或返回
        throw new Error('依赖的@electron/remote模块无法加载。');
    }

    const 默认配置 = {
        width: 800,
        height: 600,
        frame: false, // 核心：无边框
        webPreferences: {
            nodeIntegration: true, // 警告：安全风险，考虑改为 false 并使用 preload 脚本
            contextIsolation: false, // 警告：安全风险，应改为 true
            // preload: path.join(__dirname, 'preload.js') // 推荐使用预加载脚本
        }
    };

    // 合并默认配置和用户配置
    const 最终配置 = { ...默认配置, ...配置, webPreferences: { ...默认配置.webPreferences, ...配置.webPreferences } };

    const 窗口 = new BrowserWindow(最终配置);
    const 窗口内容 = 窗口.webContents;

    // 启用 remote 模块 for webContents
    try {
        // 正确的方式是 remote.require('@electron/remote/main').enable(webContents);
        // 但如果 remote 是通过 window.require 获取的，可能需要不同的调用方式
        // 检查 remote 对象结构并相应调用
        if (remote && remote.require) {
             const remoteMain = remote.require('@electron/remote/main');
             if (remoteMain && remoteMain.enable) {
                 remoteMain.enable(窗口内容);
             } else {
                 console.warn('@electron/remote/main or enable function not found.');
                 // 尝试旧版方法或记录警告
             }
        } else {
             console.warn('Could not find require method on remote object.');
             // 可能需要不同的方法来启用 remote for webContents
        }
    } catch (error) {
        console.error('Failed to enable remote for webContents:', error);
        // 决定如何处理此错误，例如关闭窗口或记录
        // 窗口.close();
        // throw new Error('无法为新窗口启用remote模块。');
    }

    return { 窗口, 窗口内容 };
} 