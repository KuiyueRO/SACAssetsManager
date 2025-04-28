// @ts-nocheck
/**
 * @fileoverview 全局路由器管理与快捷注册方法。
 * 提供单例模式的全局路由器，并封装注册、分组、中间件生成等操作。
 * 依赖 ./functionRouter.js 中的 createFunctionRouter
 */

import { createFunctionRouter } from './functionRouter.js'; // 假设 functionRouter 在同一目录

// 创建唯一的Symbol键，用于存储全局路由器实例
const GLOBAL_ROUTER_KEY = Symbol.for('app.globalRouter');

/**
 * 初始化全局路由器。
 * 如果已初始化，则返回现有实例。
 * @param {import('./functionRouter.js').RouterOptions} [opts={}] - 路由器配置选项。
 * @returns {import('./functionRouter.js').FunctionRouter} 全局路由器实例。
 */
export function initGlobalRouter(opts = {}) {
  // 检查全局路由器是否已存在
  if (globalThis[GLOBAL_ROUTER_KEY]) {
    console.warn('Global router already initialized. Returning existing instance.');
    return globalThis[GLOBAL_ROUTER_KEY];
  }

  // 创建新的路由器实例
  const router = createFunctionRouter(opts);

  // 将路由器存储在全局变量中
  globalThis[GLOBAL_ROUTER_KEY] = router;

  console.log('Global router initialized.');
  return router;
}

/**
 * 获取全局路由器实例。
 * @returns {import('./functionRouter.js').FunctionRouter | null} 全局路由器实例，如果未初始化则返回null。
 */
export function getGlobalRouter() {
  const router = globalThis[GLOBAL_ROUTER_KEY];
  if (!router) {
    // 不打印警告，让调用者决定如何处理 null
    // console.warn('Global router not initialized. Call initGlobalRouter() first.');
    return null;
  }
  return router;
}

/**
 * 注册路由到全局路由器。
 * @param {string} method - HTTP方法 (GET, POST, PUT, DELETE等)，不区分大小写。
 * @param {string} path - 路由路径。
 * @param {object} [doc] - 路由文档对象 (可选)。
 * @param {Function | Function[]} handler - 处理函数或处理函数数组。
 * @returns {any} 路由注册结果 (依赖底层路由器的返回值)。
 * @throws {Error} 如果全局路由器未初始化或方法不受支持。
 */
export function registerRoute(method, path, doc, handler) {
  const router = getGlobalRouter();
  if (!router) {
    throw new Error('Global router not initialized. Cannot register route.');
  }

  // 转换方法名为小写
  const methodLower = method.toLowerCase();

  // 检查路由器是否支持此方法
  if (typeof router[methodLower] !== 'function') {
    throw new Error(`Unsupported HTTP method: ${method}`);
  }

  // 使用路由器提供的方法注册路由
  // JSDoc 可能无法精确推断 router[methodLower] 的签名，这里简化处理
  return router[methodLower](path, doc, handler);
}

/**
 * 创建路由组。
 * @param {object | function} opts - 组选项或回调函数。
 * @param {function} [callback] - 组回调函数。
 * @returns {any} 路由组结果 (依赖底层路由器的返回值)。
 * @throws {Error} 如果全局路由器未初始化。
 */
export function groupRoutes(opts, callback) {
  const router = getGlobalRouter();
  if (!router) {
    throw new Error('Global router not initialized. Cannot create route group.');
  }

  // 假设底层路由器有 group 方法
  if (typeof router.group !== 'function') {
     throw new Error('Router does not support group() method.');
  }
  return router.group(opts, callback);
}

/**
 * 生成路由处理中间件 (通常用于 Koa)。
 * @returns {Function} Koa 兼容的中间件。
 * @throws {Error} 如果全局路由器未初始化或不支持 routes()。
 */
export function getRouterMiddleware() {
  const router = getGlobalRouter();
  if (!router) {
    throw new Error('Global router not initialized. Cannot generate router middleware.');
  }
  if (typeof router.routes !== 'function') {
    throw new Error('Router does not support routes() method.');
  }
  return router.routes();
}

/**
 * 生成处理 OPTIONS 请求和 405/501 状态的中间件 (通常用于 Koa)。
 * @param {object} [options={}] - 中间件选项。
 * @returns {Function} 处理中间件。
 * @throws {Error} 如果全局路由器未初始化或不支持 allowedMethods()。
 */
export function getAllowedMethodsMiddleware(options = {}) {
  const router = getGlobalRouter();
  if (!router) {
    throw new Error('Global router not initialized. Cannot generate allowed methods middleware.');
  }
   if (typeof router.allowedMethods !== 'function') {
    throw new Error('Router does not support allowedMethods() method.');
  }
  return router.allowedMethods(options);
}

/**
 * 生成 OpenAPI 文档。
 * @param {object} [info={}] - API 信息。
 * @returns {object} OpenAPI 文档对象。
 * @throws {Error} 如果全局路由器未初始化或不支持 generateOpenAPIDoc()。
 */
export function generateApiDocs(info = {}) {
  const router = getGlobalRouter();
  if (!router) {
    throw new Error('Global router not initialized. Cannot generate API docs.');
  }
   if (typeof router.generateOpenAPIDoc !== 'function') {
    throw new Error('Router does not support generateOpenAPIDoc() method.');
  }
  return router.generateOpenAPIDoc(info);
}

// --- 快捷注册方法 --- //

/** 快捷方法：GET 路由注册 */
export function get(path, doc, handler) {
  return registerRoute('GET', path, doc, handler);
}

/** 快捷方法：POST 路由注册 */
export function post(path, doc, handler) {
  return registerRoute('POST', path, doc, handler);
}

/** 快捷方法：PUT 路由注册 */
export function put(path, doc, handler) {
  return registerRoute('PUT', path, doc, handler);
}

/** 快捷方法：DELETE 路由注册 */
export function del(path, doc, handler) {
  // 注意：del 是保留字，通常避免用作函数名，但这里保持与原代码一致
  return registerRoute('DELETE', path, doc, handler);
}

/** 快捷方法：PATCH 路由注册 */
export function patch(path, doc, handler) {
  return registerRoute('PATCH', path, doc, handler);
}

/** 快捷方法：HEAD 路由注册 */
export function head(path, doc, handler) {
  return registerRoute('HEAD', path, doc, handler);
}

/** 快捷方法：OPTIONS 路由注册 */
export function options(path, doc, handler) {
  return registerRoute('OPTIONS', path, doc, handler);
}

/**
 * 快捷方法：ALL 路由注册 (匹配所有方法)。
 * @param {string} path - 路由路径。
 * @param {object} [doc] - 路由文档对象 (可选)。
 * @param {Function | Function[]} handler - 处理函数或处理函数数组。
 * @returns {any} 路由注册结果。
 * @throws {Error} 如果全局路由器未初始化或不支持 all()。
 */
export function all(path, doc, handler) {
  const router = getGlobalRouter();
  if (!router) {
    throw new Error('Global router not initialized. Cannot register route.');
  }
  if (typeof router.all !== 'function') {
    throw new Error('Router does not support all() method.');
  }
  return router.all(path, doc, handler);
} 