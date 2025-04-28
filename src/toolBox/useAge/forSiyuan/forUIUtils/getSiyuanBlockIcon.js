/**
 * @fileoverview 提供获取思源块对应图标的函数。
 * @module toolBox/useAge/forSiyuan/forUIUtils/getSiyuanBlockIcon
 */

import { SIYUAN_DEFAULT_ICON_URL } from '../constants.js'; // Updated import path
import {
    formatEmojiSvgDataUrl,
    formatCssSvgDataUrl,
    formatTextSvgDataUrl
} from '../../../base/useBrowser/forSvgUtils/formatSvgDataUrl.js'; // Updated import path
import { api } from '../../useSiyuan.js'; // Import Siyuan API wrapper

// 简单的内存缓存 docInfo
const docInfoCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 缓存 5 分钟

/**
 * 清理过期的文档信息缓存
 * @private
 */
function clearExpiredCache() {
    const now = Date.now();
    for (const [id, cached] of docInfoCache.entries()) {
        if (now - cached.timestamp >= CACHE_TTL) {
            docInfoCache.delete(id);
        }
    }
}

/**
 * 异步获取文档信息，带有缓存。
 * @async
 * @private
 * @param {string} id - 文档 ID。
 * @returns {Promise<object|null>} 文档信息对象或 null。
 */
async function getCachedDocInfo(id) {
    const cached = docInfoCache.get(id);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        return cached.data;
    }

    // 使用 useSiyuan 导出的 API
    if (!api?.other?.getDocInfo) {
         console.error('api.other.getDocInfo is not available via useSiyuan.js.');
         return null;
    }

    try {
        // 调用封装后的 API
        const res = await api.other.getDocInfo({ id });
        // 假设 API 返回的数据在 res.data 中
        const data = res?.data;
        if (data) {
            docInfoCache.set(id, { data, timestamp: Date.now() });
            if (docInfoCache.size > 1000) {
                 clearExpiredCache();
            }
            return data;
        } else {
            // 如果 API 调用成功但 data 为空 (例如文档不存在)，也缓存 null 结果防止重复查询？
            // 或者直接返回 null
            console.warn(`No doc info data returned for ${id}`);
            // docInfoCache.set(id, { data: null, timestamp: Date.now() }); // Option: cache null
             return null;
        }
    } catch (error) {
        console.error(`Error fetching doc info for ${id} via api.other.getDocInfo:`, error);
        docInfoCache.delete(id);
        return null;
    }
}


/**
 * 根据思源块信息，异步获取用于 UI 显示的图标 URL 或 Data URL。
 * @async
 * @param {object} block - 思源块对象 (至少包含 type, id, content)。
 * @returns {Promise<string>} 图标的 URL 或 SVG Data URL。
 */
export const getSiyuanBlockIconUrl = async (block) => {
    if (!block || typeof block.type !== 'string') {
        return SIYUAN_DEFAULT_ICON_URL; // 返回默认图标
    }

    if (block.type === 'd') { // 文档块
        const docInfo = await getCachedDocInfo(block.id);

        if (docInfo) {
            if (docInfo.icon) {
                if (isSiyuanEmojiFile(docInfo.icon)) { // 使用辅助函数判断
                    return `/emojis/${docInfo.icon}`;
                } else {
                    return formatEmojiSvgDataUrl(docInfo.icon);
                }
            }
            else if (docInfo.ial && docInfo.ial['title-img']) {
                const titleImg = docInfo.ial['title-img'];
                if (titleImg.includes('url(')) {
                    const match = titleImg.match(/url\(['"]?([^)'"]+)['"]?\)/);
                    return match ? match[1] : SIYUAN_DEFAULT_ICON_URL;
                } else {
                    return formatCssSvgDataUrl(titleImg);
                }
            }
        }
         return SIYUAN_DEFAULT_ICON_URL;

    } else { // 非文档块
        const content = block.content || '';
        const textForIcon = content.slice(0, 10);
        if (!textForIcon) {
             return SIYUAN_DEFAULT_ICON_URL;
        }
        return formatTextSvgDataUrl(textForIcon, { fontSize: 10 });
    }
};

/**
 * 检查图标字符串是否是 SVG Data URL (基于前缀判断)。
 * @param {string} iconString - 图标字符串。
 * @returns {boolean}
 */
export const isSvgDataUrl = (iconString) => {
    return typeof iconString === 'string' && iconString.startsWith('data:image/svg+xml');
};

/**
 * 判断图标字符串是否代表一个思源内置的 Emoji 文件名 (简单判断)。
 * @param {string} iconString - 图标字符串。
 * @returns {boolean}
 */
export const isSiyuanEmojiFile = (iconString) => {
    // 假设内置 emoji 文件名包含 '.' 且不包含 '/'
    return typeof iconString === 'string' && iconString.includes('.') && !iconString.includes('/');
};

// TODO: 移除旧的 isSvg 函数，或者改进其逻辑。
// export const isSvg=(iconString)=>{
//     return iconString&&iconString.startsWith('#') // 这个逻辑似乎不正确
// } 