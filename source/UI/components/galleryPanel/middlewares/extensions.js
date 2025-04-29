import { extractFileExtensions } from "../../../../../src/toolBox/feature/forFileSystem/forPathExtension.js";
const 扩展名map = new Map();

export const 更新扩展名中间件 = (获取配置, 获取扩展名缓存) => {
    return (数据) => {
        if (!获取配置().localPath) {
            let extensions = extractFileExtensions(数据)
            extensions.forEach(
                item => {
                    if (!扩展名map.get(item)) {
                        获取扩展名缓存().push(item)
                        扩展名map.set(item, true)
                    }
                }
            )
        }
        return 数据;
    }
};


export const 过滤器中间件 = (filterFunc) => {
    return (args) => {
        if (!args || args.length === 0) return args; // 没有参数，直接返回

        // 假设 fetchStream 总是 push 单个元素
        const item = args[0];
        // console.log('[Middleware] 过滤器中间件 - 检查项目:', item ? item.name || item.path : 'null/undefined'); // 移除日志

        // 直接对单个元素进行过滤判断
        const shouldKeep = filterFunc(item);

        // console.log(`[Middleware] 过滤器中间件 - ${shouldKeep ? '保留' : '过滤掉'} 项目`); // 移除日志

        // 如果应该保留，返回包含该元素的数组；否则返回空数组
        return shouldKeep ? args : [];
    };
}


