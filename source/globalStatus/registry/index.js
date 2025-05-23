// 统一的错误类型定义
const 错误类型 = {
  参数无效: '参数无效',
  实例创建失败: '实例创建失败',
  超出限制: '超出限制'
};

// 统一的错误处理工具
class 实例工厂错误 extends Error {
  constructor(类型, 消息, 域名, 原始错误 = null) {
    super(`[${域名}] ${消息}`);
    this.name = '实例工厂错误';
    this.类型 = 类型;
    this.域名 = 域名;
    this.原始错误 = 原始错误;
  }
}

// 统一的验证工具
const 验证工具 = {
  检查字符串(值, 字段名, 域名) {
    if (typeof 值 !== 'string' || !值.trim()) {
      throw new 实例工厂错误(
        错误类型.参数无效,
        `${字段名}必须是非空字符串`,
        域名
      );
    }
    return 值;
  },

  检查函数(值, 字段名, 域名) {
    if (typeof 值 !== 'function') {
      throw new 实例工厂错误(
        错误类型.参数无效,
        `${字段名}必须是函数类型`,
        域名
      );
    }
    return 值;
  },

  检查实例限制(映射表, 最大实例数, 域名) {
    if (映射表.size >= 最大实例数) {
      throw new 实例工厂错误(
        错误类型.超出限制,
        `已达到最大实例数限制 (${最大实例数})`,
        域名
      );
    }
  }
};

const 验证实例标识 = (实例标识, 域名) => {
    if (typeof 实例标识 !== 'string' || !实例标识.trim()) {
      throw new TypeError(`[${域名}] 实例标识必须是非空字符串`);
    }
    return 实例标识;
  };
  
  const 验证新实例 = (实例, 域名) => {
    if (!实例 || typeof 实例 !== 'object') {
      throw new 实例工厂错误(
        错误类型.实例创建失败,
        '构造器必须返回一个对象',
        域名
      );
    }
    return 实例;
  };
  
  const 创建新实例 = (构造器, 参数组, 域名) => {
    try {
      const 新实例 = 构造器.apply(null, 参数组);
      return 验证新实例(新实例, 域名);
    } catch (错误) {
      throw new 实例工厂错误(
        错误类型.实例创建失败,
        '实例创建失败',
        域名,
        错误
      );
    }
  };
  
  const 检查实例数量限制 = (映射表, 最大实例数, 域名) => {
    if (映射表.size >= 最大实例数) {
      throw new RangeError(`[${域名}] 已达到最大实例数限制 (${最大实例数})`);
    }
  };
  
  // 重构后的获取或创建实例函数
  const 获取或创建实例 = (映射表, 实例标识, 构造器, 参数组, 选项) => {
    const { 域名, 最大实例数 } = 选项;
    
    验证实例标识(实例标识, 域名);
    检查实例数量限制(映射表, 最大实例数, 域名);
    
    if (!映射表.has(实例标识)) {
      const 新实例 = 创建新实例(构造器, 参数组, 域名);
      映射表.set(实例标识, 新实例);
    }
    
    return 映射表.get(实例标识);
  };
  
  // 重构后的清理函数
  const 清理实例 = (实例) => {
    if (实例 && typeof 实例.销毁 === 'function') {
      实例.销毁();
    }
  };
  
  const 批量清理实例 = (映射表) => {
    映射表.forEach(清理实例);
    映射表.clear();
  };
  
/**
 * 创建一个基于ID缓存实例的工厂函数
 * @param {string} 域名 - 用于区分不同的注册表
 * @param {Function} 构造器 - 原始的创建函数
 * @param {Object} 选项 - 可选的配置参数
 * @returns {Function} - 带有缓存的新函数
 */
export function 创建实例工厂(域名, 构造器, 选项 = {}) {
  // 使用新的验证工具
  验证工具.检查字符串(域名, '域名');
  验证工具.检查函数(构造器, '构造器');
  
  const {
    最大实例数 = Infinity,
    获取实例标识 = 参数组 => 参数组[参数组.length - 1],
    错误处理器 = 错误 => console.error(`[${域名}]`, 错误)
  } = 选项;

  // 修改注册表的实现方式，使用普通 Map 而不是 WeakMap
  if (!globalThis.__实例注册表__) {
    globalThis.__实例注册表__ = new Map();
  }

  const 注册表标识 = `__实例注册表_${域名}__`;  // 改用字符串作为键
  const 全局注册表 = globalThis.__实例注册表__;
  
  if (!全局注册表.has(注册表标识)) {
    全局注册表.set(注册表标识, new Map());
  }

  // 3. 重构工厂函数主体，提高可读性
  const 工厂实例 = function (...参数组) {
    try {
      const 实例标识 = 获取实例标识(参数组);
      const 实例映射表 = 全局注册表.get(注册表标识);
      
      return 获取或创建实例(实例映射表, 实例标识, 构造器, 参数组, {
        域名,
        最大实例数
      });
    } catch (错误) {
      错误处理器(错误);
      throw 错误;
    }
  };
  
  // 添加实例管理方法
  工厂实例.清理 = function(实例标识) {
    const 实例映射表 = 全局注册表.get(注册表标识);
    if (!实例映射表) return;

    if (实例标识) {
      const 实例 = 实例映射表.get(实例标识);
      清理实例(实例);
      实例映射表.delete(实例标识);
    } else {
      批量清理实例(实例映射表);
    }
  };

  // 添加实例查询方法
  工厂实例.获取所有实例 = function() {
    const 实例映射表 = 全局注册表.get(注册表标识);
    return 实例映射表 ? Array.from(实例映射表.entries()) : [];
  };

  工厂实例.获取实例数量 = function() {
    const 实例映射表 = 全局注册表.get(注册表标识);
    return 实例映射表 ? 实例映射表.size : 0;
  };

  工厂实例.包含实例 = function(实例标识) {
    const 实例映射表 = 全局注册表.get(注册表标识);
    return 实例映射表 ? 实例映射表.has(实例标识) : false;
  };

  return 工厂实例;
}
