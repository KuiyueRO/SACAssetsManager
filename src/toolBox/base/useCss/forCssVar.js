/**
 * @fileoverview 提供一个用于生成 CSS 变量字符串 (`var(--xxx)`) 的代理对象。
 * @module forCssVar
 */

/**
 * @typedef {Object} CSSVarProxy
 * @property {function(): string} [key: string] 返回形如 'var(--key)' 的字符串
 * @property {CSSVarProxy} [nestedKey: string] 允许链式调用，如 cssVarProxy.theme.background()
 */

/**
 * 用于生成 CSS 变量字符串的代理对象。
 * 
 * 通过 Proxy 实现链式调用来构建 CSS 变量名。
 * 
 * @example
 * cssVarProxy.theme.background() // "var(--theme-background)"
 * cssVarProxy.theme.color('primary') // "var(--theme-color-primary)"
 * cssVarProxy.spacing.large() // "var(--spacing-large)"
 * 
 * @type {CSSVarProxy}
 */
export const cssVarProxy = new Proxy({}, {
    /**
     * 第一层属性获取 (e.g., cssVarProxy.theme)
     * @param {object} target - 代理的目标对象 (空对象)
     * @param {string} prop - 访问的属性名 (e.g., 'theme')
     * @returns {CSSVarProxy} 返回一个新的代理，用于处理下一层调用或最终的函数调用。
     */
    get: (target, prop) => {
        // 返回一个新的 Proxy 用于处理 .theme 后面的调用，如 .background() 或 .color('primary')
        return new Proxy(() => {}, { // 目标是一个空函数，因为最终会调用 apply
            /**
             * 第二层及更深层的属性获取 (e.g., cssVarProxy.theme.background)
             * @param {function} _ - 代理的目标函数 (空函数)
             * @param {string} nextProp - 访问的属性名 (e.g., 'background')
             * @returns {CSSVarProxy} 返回一个新的代理，准备拼接更深的属性或最终调用。
             */
            get: (_, nextProp) => cssVarProxy[`${prop}-${nextProp}`], // 递归调用外层 Proxy.get，拼接属性名
            /**
             * 函数调用 (e.g., cssVarProxy.theme.background() or cssVarProxy.theme.color('primary'))
             * @param {function} _ - 代理的目标函数 (空函数)
             * @param {any} __ - apply 的 this 上下文 (未使用)
             * @param {string[]} args - 调用时传递的参数 (e.g., ['primary'])
             * @returns {string} 返回最终的 CSS 变量字符串。
             */
            apply: (_, __, args) => `var(--${prop}${args.length ? `-${args.join('-')}` : ''})` // 构造 var(--...) 字符串
        });
    }
}); 