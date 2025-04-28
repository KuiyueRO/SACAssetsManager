/**
 * @fileoverview 提供基于 OpenAI 的同步 AI 翻译功能，并适配思源配置。
 * @module aiI18n
 * @warning 内部使用了同步 XMLHttpRequest，可能导致 UI 阻塞，请谨慎使用。
 */

/**
* 使用 OpenAI API 同步翻译文本
* @warning 使用同步 XMLHttpRequest，会阻塞主线程。
* @param {string} 文本 - 需要翻译的原文
* @param {string} 目标语言 - 翻译的目标语言
* @param {Object} 接口配置 - OpenAI API 的配置信息
* @param {string} 接口配置.模型 - 使用的 OpenAI 模型名称
* @param {string} 接口配置.API地址 - OpenAI API 的 URL
* @param {Object} 接口配置.请求头 - API 请求的头部信息
* @returns {string} 翻译后的文本，如果翻译失败则返回原文
* @throws {Error} 当 API 请求失败时抛出错误
*/
export const 同步调用openAI翻译 = (文本, 目标语言, 接口配置) => {
    try {
        const 请求体 = JSON.stringify({
            model: 接口配置.模型,
            messages: [
                { role: "system", content: `你是一个翻译助手。请将以下文本翻译成${目标语言}。` },
                { role: "user", content: 文本 }
            ]
        });

        console.warn("同步调用openAI翻译：正在使用同步 XMLHttpRequest，可能阻塞 UI。");
        const 请求 = new XMLHttpRequest();
        请求.open('POST', 接口配置.API地址, false); // 同步请求
        Object.entries(接口配置.请求头).forEach(([键, 值]) => 请求.setRequestHeader(键, 值));
        请求.send(请求体);
        
        if (请求.status === 200) {
            const 响应 = JSON.parse(请求.responseText);
            // 检查响应结构是否符合预期
            if (响应 && 响应.choices && 响应.choices[0] && 响应.choices[0].message && 响应.choices[0].message.content) {
                 return 响应.choices[0].message.content.trim();
            } else {
                console.error("OpenAI API 响应格式不符合预期:", 响应);
                throw new Error("API 响应格式不符合预期");
            }
        } else {
            console.error(`OpenAI API 请求失败: ${请求.status} ${请求.statusText}`, 请求.responseText);
            throw new Error(`API 请求失败: ${请求.status} ${请求.statusText}`);
        }
    } catch (错误) {
        console.error('翻译过程中发生错误:', 错误);
        return 文本; // 出错时返回原文
    }
};

// 导入AI配置适配器 (路径已更新为相对路径)
import { forTranslationConfig } from './forLegacyCode.js';

/**
* 使用思源配置同步调用 AI 翻译
* @warning 内部调用了同步 XMLHttpRequest。
* @param {string} 文本 - 需要翻译的原文
* @returns {string} 翻译后的文本，如果翻译失败则返回原文
* @throws {Error} 当 API 请求失败时抛出错误
*/
export const 同步调用思源配置翻译 = (文本) => {
    const 接口配置 = forTranslationConfig(); // 假设这个函数能正确获取配置
    if (!接口配置 || !接口配置.API地址) {
        console.error("无法获取有效的思源 AI 翻译配置。");
        return 文本; // 配置无效，返回原文
    }
    return 同步调用openAI翻译(文本, 接口配置.目标语言 || '中文', 接口配置);
};

/**
 * 创建一个 AI 翻译模板字符串标签函数。
 * @warning 返回的标签函数内部使用同步 XMLHttpRequest。
 * @param {string} 目标语言 - 翻译的目标语言。
 * @param {Object} 接口配置 - OpenAI API 配置。
 * @returns {function(string[], ...any): {result: string, template: string} | string} 模板标签函数。成功时返回 {result: string, template: string}，失败时返回插值后的原始字符串。
 */
export const 创建AI翻译标签函数 = (目标语言, 接口配置) => {
    return function (字符串数组, ...插值) {
        // 构建完整的模板字符串，并将插值替换为特殊标记
        let 完整模板 = '';
        字符串数组.forEach((字符串, 索引) => {
            完整模板 += 字符串;
            if (索引 < 插值.length) {
                // 使用更健壮的标记，避免与普通文本冲突
                完整模板 += `__PLACEHOLDER_${索引}__`; 
            }
        });

        try {
            const 请求体 = JSON.stringify({
                model: 接口配置.模型,
                messages: [
                    { role: "system", content: `
                        你是一个翻译助手。
                        请将以下文本翻译成【${目标语言}】。
                        翻译时请严格保持 __PLACEHOLDER_XXX__ 格式的标记不变，它们是变量占位符。
                        如果收到的文本已经是【${目标语言}】，请直接返回原文，不要做任何改动。
                        不要添加任何额外的解释、注释或格式化。
                        ` },
                    { role: "user", content: 完整模板 }
                ]
            });

            console.warn("创建AI翻译标签函数：正在使用同步 XMLHttpRequest，可能阻塞 UI。");
            const 请求 = new XMLHttpRequest();
            请求.open('POST', 接口配置.API地址, false); // 同步请求
            Object.entries(接口配置.请求头).forEach(([键, 值]) => 请求.setRequestHeader(键, 值));
            请求.send(请求体);

            if (请求.status === 200) {
                const 响应 = JSON.parse(请求.responseText);
                 // 检查响应结构
                if (响应 && 响应.choices && 响应.choices[0] && 响应.choices[0].message && 响应.choices[0].message.content) {
                    let 翻译结果 = 响应.choices[0].message.content.trim();
                    let 替换结果 = 翻译结果;
                    // 将翻译结果中的占位符替换为实际的插值
                    插值.forEach((值, 索引) => {
                        // 使用与生成时相同的标记进行替换
                        const placeholder = `__PLACEHOLDER_${索引}__`;
                        // 使用 new RegExp 创建正则表达式，并转义特殊字符
                        const regex = new RegExp(placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
                        替换结果 = 替换结果.replace(regex, 值);
                    });
                    
                    return {
                        result: 替换结果,
                        template: 翻译结果 // 返回包含占位符的模板
                    };
                } else {
                    console.error("OpenAI API 响应格式不符合预期:", 响应);
                    throw new Error("API 响应格式不符合预期");
                }
            } else {
                 console.error(`OpenAI API 请求失败: ${请求.status} ${请求.statusText}`, 请求.responseText);
                 throw new Error(`API 请求失败: ${请求.status} ${请求.statusText}`);
            }
        } catch (错误) {
            console.error('AI 翻译标签函数执行出错:', 错误);
            // 出错时返回原始模板字符串的插值结果
            console.warn('AI 翻译失败，返回原始插值字符串。');
            return 字符串数组.reduce((结果, 字符串, 索引) => 
                结果 + 字符串 + (插值[索引] !== undefined ? 插值[索引] : ''), '');
        }
    };
};

/**
 * 使用思源配置创建 AI 翻译模板字符串标签函数。
 * @warning 返回的标签函数内部使用同步 XMLHttpRequest。
 * @param {string} [目标语言=window.siyuan.config.lang] - 翻译的目标语言, 默认为思源配置语言。
 * @returns {function(string[], ...any): {result: string, template: string} | string} 模板标签函数。
 */
export const 创建思源配置AI翻译标签函数 = (目标语言 = window.siyuan.config.lang) => {
    const 接口配置 = forTranslationConfig(目标语言);
    if (!接口配置 || !接口配置.API地址) {
         console.error("无法获取有效的思源 AI 翻译配置，无法创建翻译标签函数。");
         // 返回一个总是返回原始插值字符串的函数
         return function (字符串数组, ...插值) {
              return 字符串数组.reduce((结果, 字符串, 索引) => 
                  结果 + 字符串 + (插值[索引] !== undefined ? 插值[索引] : ''), '');
         }
    }
    return 创建AI翻译标签函数(目标语言, 接口配置);
};

/**
 * 创建一个可选的 AI 翻译模板字符串标签函数。
 * @warning 返回的标签函数内部可能使用同步 XMLHttpRequest。
 * @param {function(): boolean} [启用翻译=()=>true] - 一个函数，返回 true 时启用翻译，否则返回原始字符串。
 * @param {string} [目标语言=window.siyuan.config.lang] - 翻译的目标语言。
 * @returns {function(string[], ...any): {result: string, template: string} | string} 模板标签函数。
 */
export const 创建可选AI翻译标签函数 = (启用翻译 = () => true, 目标语言 = window.siyuan.config.lang) => {
    let aiTranslatorFunction = null; // 延迟创建

    return function (字符串数组, ...插值) {
        if (启用翻译()) {
            // 仅在需要时创建翻译函数实例
            if (!aiTranslatorFunction) {
                const 接口配置 = forTranslationConfig(目标语言);
                if (!接口配置 || !接口配置.API地址) {
                    console.error("无法获取有效的思源 AI 翻译配置，翻译功能禁用。");
                     // 返回原始插值字符串
                    return 字符串数组.reduce((结果, 字符串, 索引) => 
                        结果 + 字符串 + (插值[索引] !== undefined ? 插值[索引] : ''), '');
                }
                aiTranslatorFunction = 创建AI翻译标签函数(目标语言, 接口配置);
            }
            return aiTranslatorFunction(字符串数组, ...插值);
        } else {
            // 直接使用原始的模板字符串进行插值
            return 字符串数组.reduce((结果, 字符串, 索引) => 
                结果 + 字符串 + (插值[索引] !== undefined ? 插值[索引] : ''), '');
        }
    };
}; 