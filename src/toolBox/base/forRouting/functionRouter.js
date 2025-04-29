// @ts-nocheck
/**
 * @fileoverview 定义 FunctionRouter 类及其工厂函数，提供带文档支持的路由功能。
 * 基于 Koa 风格的底层路由器 (radix3)。
 */

// 假设 createKoaRouter 最终会位于此路径
// import { createKoaRouter } from '../../useDeps/radix3/koaRouter.js'; // Old path
import { createKoaRouter } from '../useDeps/radix3/koaRouter.js'; // Corrected path after moving to base/

/**
 * @typedef {object} RouteDocParam
 * @property {string} description - 参数描述。
 * @property {boolean} [required=false] - 是否必需。
 * @property {string} [type='string'] - 参数类型 (string, number, boolean, object, array等)。
 * @property {any} [default] - 默认值。
 * @property {any[]} [enum] - 枚举值。
 * // ... 其他 OpenAPI 参数属性
 */

/**
 * @typedef {object} RouteDocResponse
 * @property {string} description - 响应描述。
 * @property {string} [type='any'] - 响应主体类型。
 * @property {object} [schema] - 更详细的响应结构 (例如 OpenAPI Schema Object)。
 * // ... 其他 OpenAPI 响应属性
 */

/**
 * @typedef {object} RouteDoc
 * @property {string} summary - 路由功能摘要。
 * @property {string} description - 路由详细描述。
 * @property {Object<string, RouteDocParam>} [params={}] - 参数文档 (区分 query, path, body 等)。
 * @property {Object<string, RouteDocResponse>} [response={}] - 响应文档 (区分状态码，如 '200', '404')。
 * @property {string[]} [tags] - 标签/分组。
 * @property {object} [registrationInfo] - (内部添加) 路由注册时的调用者信息。
 */

/**
 * @typedef {object} RouterOptions
 * @property {boolean} [enforceDocumentation=true] - 是否强制要求提供路由文档。
 * @property {string} [prefix=''] - 路由前缀。
 * // ... 其他传递给底层 createKoaRouter 的选项
 */

/**
 * 验证路由文档对象是否基本完整。
 * @param {RouteDoc} doc - 路由文档对象。
 * @returns {boolean} 是否有效。
 */
function validateDoc(doc) {
  if (!doc || typeof doc !== 'object') {
    return false;
  }
  // 简化检查，只检查 summary 和 description 是否存在且为字符串
  return typeof doc.summary === 'string' && doc.summary.length > 0 &&
         typeof doc.description === 'string' && doc.description.length > 0;
  // 原检查比较严格，要求 params 和 response 必须存在
  // const requiredFields = ['summary', 'description', 'params', 'response'];
  // return requiredFields.every(field => field in doc);
}

/**
 * 提供带文档支持的路由功能。
 * @class FunctionRouter
 */
class FunctionRouter {
  /**
   * @param {RouterOptions} [opts={}] - 配置选项。
   */
  constructor(opts = {}) {
    // 配置选项
    this.opts = {
      enforceDocumentation: true,
      prefix: '',
      ...opts
    };

    // 使用现有的 Koa 风格路由器作为基础
    this.koaRouter = createKoaRouter(this.opts);

    // 存储路由文档，键格式: "METHOD:path" 或 "GET,POST:path"
    this.docs = {};
  }

  /**
   * 核心路由注册方法。
   * @param {string | string[]} methods - HTTP 方法或方法数组。
   * @param {string} path - 路由路径。
   * @param {RouteDoc | Function | Function[]} docOrHandler - 路由文档对象或处理函数/数组。
   * @param {Function | Function[]} [handler] - 处理函数或处理函数数组 (如果第三个参数是文档)。
   * @returns {any} 底层路由器的注册结果。
   * @throws {Error} 如果强制文档但未提供，或文档格式无效。
   */
  register(methods, path, docOrHandler, handler) {
    let doc = null;

    // 处理参数重载：检查第三个参数是文档还是处理函数
    if (typeof docOrHandler === 'function' || Array.isArray(docOrHandler)) {
      // 第三个参数是 handler
      if (this.opts.enforceDocumentation) {
        // 捕获调用者信息以辅助定位
        const callerInfo = this._captureCallerInfo(3); // 往上 3 帧大致定位到调用 register 的地方
        throw new Error(`Route [${Array.isArray(methods) ? methods.join(',') : methods}] ${this.opts.prefix}${path} is missing documentation. Registered at ${callerInfo}`);
      }
      handler = docOrHandler;
      // 提供一个默认的最小化文档
      doc = {
        summary: 'Documentation missing',
        description: 'No description provided.',
        params: {},
        response: { '200': { description: 'Success (no documentation)', type:'any' } }
      };
    } else if (docOrHandler && typeof docOrHandler === 'object') {
      // 第三个参数是 doc
      doc = docOrHandler;
      // 确保文档对象包含基本字段 (如果允许非强制文档)
      doc.summary = doc.summary || (this.opts.enforceDocumentation ? undefined : 'Summary missing');
      doc.description = doc.description || (this.opts.enforceDocumentation ? undefined : 'Description missing');
      doc.params = doc.params || {};
      doc.response = doc.response || { '200': { description: 'Success', type:'any' } }; // 默认成功响应
    } else {
       // docOrHandler 既不是函数/数组也不是对象，参数错误
       throw new Error(`Invalid arguments for route [${Array.isArray(methods) ? methods.join(',') : methods}] ${this.opts.prefix}${path}. Expected doc object or handler function(s).`);
    }

    // 验证文档 (如果强制)
    if (this.opts.enforceDocumentation && !validateDoc(doc)) {
        const callerInfo = this._captureCallerInfo(3);
      throw new Error(`Route [${Array.isArray(methods) ? methods.join(',') : methods}] ${this.opts.prefix}${path} has incomplete documentation (missing summary or description). Registered at ${callerInfo}`);
    }

    // 存储文档，并添加调用者信息
    const docKey = `${Array.isArray(methods) ? methods.map(m=>m.toUpperCase()).join(',') : methods.toUpperCase()}:${path}`;
    doc.registrationInfo = this._captureCallerInfo(3);
    this.docs[docKey] = doc;

    // console.log(`Saved route documentation: ${docKey}`);

    // 将路由注册到底层 Koa 路由器
    return this.koaRouter.register(methods, path, handler);
  }

  /**
   * 获取指定路由的文档。
   * @param {string} method - HTTP 方法 (大写)。
   * @param {string} path - 路由路径。
   * @returns {RouteDoc | null} 路由文档对象或 null。
   */
  getRouteDoc(method, path) {
    return this.docs[`${method.toUpperCase()}:${path}`] || null;
  }

  /**
   * 获取所有已注册的路由文档。
   * @returns {Object<string, RouteDoc>} 所有路由文档，键为 "METHOD:path"。
   */
  getAllDocs() {
    return this.docs;
  }

  // --- HTTP 方法快捷方式 --- //

  get(path, doc, ...middleware) {
    return this.register('GET', path, doc, middleware);
  }
  post(path, doc, ...middleware) {
    return this.register('POST', path, doc, middleware);
  }
  put(path, doc, ...middleware) {
    return this.register('PUT', path, doc, middleware);
  }
  delete(path, doc, ...middleware) {
    return this.register('DELETE', path, doc, middleware);
  }
  patch(path, doc, ...middleware) {
    return this.register('PATCH', path, doc, middleware);
  }
  head(path, doc, ...middleware) {
    return this.register('HEAD', path, doc, middleware);
  }
  options(path, doc, ...middleware) {
    return this.register('OPTIONS', path, doc, middleware);
  }
  /** 匹配所有方法 */
  all(path, doc, ...middleware) {
    // 假设底层路由器的 methods 属性包含所有支持的方法
    const methods = this.koaRouter.methods || ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
    return this.register(methods, path, doc, middleware);
  }

  // --- Koa 路由器兼容方法 --- //

  /**
   * 应用中间件或挂载子路由器。
   * @param {string | Function | Function[]} prefixOrMiddleware - 路径前缀或中间件。
   * @param {...Function} middleware - 更多中间件。
   * @returns {this}
   */
  use(prefixOrMiddleware, ...middleware) {
    this.koaRouter.use(prefixOrMiddleware, ...middleware);
    return this;
  }

  /**
   * 创建路由分组。
   * @param {object | function} opts - 组选项 (如 prefix) 或回调函数。
   * @param {function(FunctionRouter): void} [callback] - 配置子路由的回调函数。
   * @returns {this}
   */
  group(opts, callback) {
    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    }

    const prefix = opts.prefix || '';
    // 创建一个新的 FunctionRouter 实例用于分组
    const groupRouter = new FunctionRouter({
      ...this.opts,
      prefix: (this.opts.prefix || '') + prefix // 继承并拼接前缀
    });

    // 执行回调，让用户在 groupRouter 上注册路由
    callback(groupRouter);

    // 将 groupRouter 的底层 Koa 路由器挂载到当前路由器
    this.koaRouter.use(prefix, groupRouter.koaRouter.routes()); // 挂载子路由

    // 合并子路由器的文档到当前路由器，并修正路径前缀
    Object.keys(groupRouter.docs).forEach(key => {
        const [method, subPath] = key.split(':');
        const fullPath = prefix + subPath;
        const newKey = `${method}:${fullPath}`;
        this.docs[newKey] = groupRouter.docs[key];
    });

    return this;
  }

  /**
   * 生成 Koa 兼容的路由处理中间件。
   * @returns {Function} Koa 中间件。
   */
  routes() {
    return this.koaRouter.routes();
  }

  /**
   * 生成处理 OPTIONS 请求和 405/501 状态的中间件。
   * @param {object} [options={}] - 底层 allowedMethods 的选项。
   * @returns {Function} Koa 中间件。
   */
  allowedMethods(options = {}) {
    return this.koaRouter.allowedMethods(options);
  }

  /**
   * 根据命名路由生成 URL (如果底层路由器支持)。
   * @param {string} name - 路由名称。
   * @param {object} params - URL 参数。
   * @param {object} [options] - 生成选项。
   * @returns {string | Error} 生成的 URL 或错误。
   */
  url(name, params, options) {
     if (typeof this.koaRouter.url !== 'function') {
        throw new Error("Underlying router does not support named routes (url method).");
     }
    return this.koaRouter.url(name, params, options);
  }

  /**
   * 添加重定向规则 (如果底层路由器支持)。
   * @param {string} source - 源路径。
   * @param {string} destination - 目标路径。
   * @param {number} [code=302] - 重定向状态码。
   * @returns {this}
   */
  redirect(source, destination, code = 302) {
     if (typeof this.koaRouter.redirect !== 'function') {
        throw new Error("Underlying router does not support redirect method.");
     }
    this.koaRouter.redirect(source, destination, code);
    return this;
  }

  // --- OpenAPI 文档生成 --- //

  /**
   * 生成 OpenAPI 3.0 格式的 API 文档。
   * @param {object} [info={}] - OpenAPI info 对象。
   * @returns {object} OpenAPI 文档对象。
   */
  generateOpenAPIDoc(info = {}) {
    const paths = {};

    // 遍历所有路由文档
    Object.keys(this.docs).forEach(key => {
      const [methodsStr, path] = key.split(':');
      const doc = this.docs[key];

      // OpenAPI 路径格式需要 / 开头，并替换 Koa 风格的 :param 为 {param}
      const openApiPath = (this.opts.prefix + path)
          .replace(/:([a-zA-Z0-9_]+)/g, '{$1}');

      if (!paths[openApiPath]) {
        paths[openApiPath] = {};
      }

      const methods = methodsStr.split(',');
      methods.forEach(m => {
        const methodLower = m.toLowerCase();
        paths[openApiPath][methodLower] = {
          tags: doc.tags || [(this.opts.prefix || 'default').split('/').filter(Boolean)[0] || 'default'], // 简单按前缀分组
          summary: doc.summary,
          description: doc.description,
          parameters: this._convertParamsToOpenAPI(doc.params, openApiPath),
          responses: this._convertResponsesToOpenAPI(doc.response)
          // 可以添加 operationId, security 等
        };
        // 如果有注册信息，添加到 description
        if(doc.registrationInfo){
            paths[openApiPath][methodLower].description += `\n\n(Registered at: ${doc.registrationInfo})`;
        }
      });
    });

    return {
      openapi: '3.0.0',
      info: {
        title: 'API Documentation',
        version: '1.0.0',
        ...info
      },
      paths
    };
  }

  /**
   * (内部) 将路由文档中的参数转换为 OpenAPI 参数对象数组。
   * @param {Object<string, RouteDocParam>} params - 路由文档的参数部分。
   * @param {string} path - OpenAPI 格式的路径 (用于区分路径参数)。
   * @returns {object[]} OpenAPI 参数对象数组。
   */
  _convertParamsToOpenAPI(params = {}, path = '') {
    const openApiParams = [];
    if (!params) return openApiParams;

    Object.keys(params).forEach(paramName => {
      const paramDoc = params[paramName];
      const inType = path.includes(`{${paramName}}`) ? 'path' : 'query'; // 简单区分 query 和 path
      // TODO: 需要更明确的方式来区分 query, path, header, cookie, body

      const openApiParam = {
        name: paramName,
        in: inType,
        description: paramDoc.description || '',
        required: inType === 'path' ? true : (paramDoc.required || false),
        schema: {
          type: paramDoc.type || 'string',
          ...(paramDoc.default !== undefined && { default: paramDoc.default }),
          ...(paramDoc.enum && { enum: paramDoc.enum })
        }
      };
      openApiParams.push(openApiParam);
    });
    return openApiParams;
  }

  /**
   * (内部) 将路由文档中的响应转换为 OpenAPI 响应对象。
   * @param {Object<string, RouteDocResponse>} responses - 路由文档的响应部分。
   * @returns {object} OpenAPI 响应对象。
   */
  _convertResponsesToOpenAPI(responses = {}) {
    const openApiResponses = {};
    if (!responses) return { '200': { description: 'Success' } }; // 默认成功响应

    Object.keys(responses).forEach(statusCode => {
      const responseDoc = responses[statusCode];
      openApiResponses[statusCode] = {
        description: responseDoc.description || '',
        // TODO: 处理 content 类型和 schema
        ...(responseDoc.type !== 'any' && {
          content: {
            // 假设是 JSON，需要更灵活的处理
            'application/json': {
              schema: responseDoc.schema || { type: responseDoc.type || 'object' }
            }
          }
        })
      };
    });
    // 确保至少有一个默认响应
    if (Object.keys(openApiResponses).length === 0) {
         openApiResponses['200'] = { description: 'Success' };
    }
    return openApiResponses;
  }

  /**
   * (内部) 捕获调用者信息。
   * 注意：这是一个不可靠的方法，依赖于 Error.stack 的格式。
   * @param {number} [level=2] - 向上查找的堆栈层级。
   * @returns {string} 调用者文件和行号信息，或 "unknown"。
   */
  _captureCallerInfo(level = 2) {
    try {
      const err = new Error();
      const stack = err.stack?.split('\n');
      if (stack && stack.length > level + 1) {
        // 尝试从堆栈中提取文件名和行号
        // 格式可能因环境而异 (e.g., "at func (file:line:col)" or "@file:line:col")
        const callerLine = stack[level + 1].trim();
        const match = callerLine.match(/\(?([^)]+):(\d+):(\d+)\)?$/) || // V8 format
                      callerLine.match(/@([^@]+):(\d+):(\d+)$/);      // Firefox format
        if (match) {
           // 只返回文件名和行号，去除路径前缀
           const filePathParts = match[1].split(/[\\/]/);
           const fileName = filePathParts.pop();
           return `${fileName}:${match[2]}`;
        }
        return callerLine; // 返回原始行如果无法解析
      }
    } catch (e) {
      // ignore
    }
    return 'unknown';
  }
}

/**
 * 创建 FunctionRouter 实例的工厂函数。
 * @param {RouterOptions} [opts={}] - 配置选项。
 * @returns {FunctionRouter}
 */
export function createFunctionRouter(opts = {}) {
  return new FunctionRouter(opts);
} 