/**
 * 全局注册表模块
 * 
 * 基于Symbol.for实现的全局注册机制，用于管理各种接口和服务
 * 
 * @module registry
 * @date 2025-05-07 07:40
 * @author 织
 */

// 注册表Symbol标识符
const REGISTRY_SYMBOL = Symbol.for('SACRegistry');

// 确保全局注册表存在
globalThis[REGISTRY_SYMBOL] = globalThis[REGISTRY_SYMBOL] || {};

/**
 * 获取全局注册表
 * @returns {Object} 全局注册表
 */
export function getRegistry() {
  return globalThis[REGISTRY_SYMBOL];
}

/**
 * 注册接口实现
 * @param {string} interfaceName 接口名称
 * @param {Object} implementation 接口实现
 */
export function registerInterface(interfaceName, implementation) {
  const registry = getRegistry();
  registry[interfaceName] = implementation;
  console.log(`接口 [${interfaceName}] 已注册`);
}

/**
 * 获取接口实现
 * @param {string} interfaceName 接口名称
 * @param {Object} [defaultImpl] 默认实现，当接口未注册时返回
 * @returns {Object} 接口实现
 */
export function getInterface(interfaceName, defaultImpl = undefined) {
  const registry = getRegistry();
  return registry[interfaceName] || defaultImpl;
}

/**
 * 注册服务
 * @param {string} serviceName 服务名称
 * @param {any} service 服务实例
 */
export function registerService(serviceName, service) {
  const registry = getRegistry();
  registry[serviceName] = service;
  console.log(`服务 [${serviceName}] 已注册`);
}

/**
 * 获取服务
 * @param {string} serviceName 服务名称
 * @returns {any} 服务实例
 */
export function getService(serviceName) {
  const registry = getRegistry();
  return registry[serviceName];
}

/**
 * 检查接口或服务是否已注册
 * @param {string} name 接口或服务名称
 * @returns {boolean} 是否已注册
 */
export function isRegistered(name) {
  const registry = getRegistry();
  return name in registry;
}

/**
 * 获取所有已注册的接口和服务名称
 * @returns {string[]} 已注册的接口和服务名称列表
 */
export function getRegisteredNames() {
  const registry = getRegistry();
  return Object.keys(registry);
}

/**
 * 取消注册
 * @param {string} name 接口或服务名称
 * @returns {boolean} 是否成功取消注册
 */
export function unregister(name) {
  const registry = getRegistry();
  if (name in registry) {
    delete registry[name];
    console.log(`[${name}] 已取消注册`);
    return true;
  }
  return false;
} 