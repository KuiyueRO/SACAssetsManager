/**
 * @fileoverview Eagle 标签管理模块
 * @module toolBox/useAge/forEagle/useEagleTags
 */

import { 发送请求 } from './useEagleRequest.js';
const fs = window.require('fs'); // 引入 fs
const path = window.require('path'); // 引入 path

/**
 * 获取标签列表
 * @returns {Promise<{
 *   status: string,
 *   data: Array<{
 *     id: string,           // 标签ID
 *     name: string,         // 标签名称
 *     color?: string,       // 标签颜色
 *     count: number,        // 使用次数
 *     createdAt: string,    // 创建时间
 *     updatedAt: string     // 更新时间
 *   }>
 * }>}
 * @throws {Error} 当请求失败时抛出错误
 */
export const 获取标签列表 = async () => {
    try {
        return await 发送请求('/api/tags/list', {
            method: 'GET'
        });
    } catch (error) {
        throw new Error(`获取标签列表失败: ${error.message}`);
    }
};

/**
 * 创建标签
 * @param {Object} 参数
 * @param {string} 参数.name - 标签名称
 * @param {string} [参数.color] - 标签颜色（十六进制）
 * @returns {Promise<{
 *   status: string,
 *   data: {
 *     id: string,           // 标签ID
 *     name: string,         // 标签名称
 *     color?: string,       // 标签颜色
 *     createdAt: string,    // 创建时间
 *     updatedAt: string     // 更新时间
 *   }
 * }>}
 * @throws {Error} 当请求失败时抛出错误
 */
export const 创建标签 = async ({ name, color }) => {
    if (!name || typeof name !== 'string') {
        throw new Error('标签名称不能为空');
    }

    if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
        throw new Error('无效的颜色格式，请使用十六进制颜色代码');
    }

    try {
        return await 发送请求('/api/tags/create', {
            method: 'POST',
            body: JSON.stringify({ name, color })
        });
    } catch (error) {
        throw new Error(`创建标签失败: ${error.message}`);
    }
};

/**
 * 更新标签
 * @param {Object} 参数
 * @param {string} 参数.tagId - 标签ID
 * @param {string} [参数.name] - 新标签名称
 * @param {string} [参数.color] - 新标签颜色（十六进制）
 * @returns {Promise<{
 *   status: string,
 *   data: {
 *     id: string,           // 标签ID
 *     name: string,         // 标签名称
 *     color?: string,       // 标签颜色
 *     updatedAt: string     // 更新时间
 *   }
 * }>}
 * @throws {Error} 当请求失败时抛出错误
 */
export const 更新标签 = async ({ tagId, name, color }) => {
    if (!tagId || typeof tagId !== 'string') {
        throw new Error('无效的标签ID');
    }

    if (name && typeof name !== 'string') {
        throw new Error('标签名称必须是字符串');
    }

    if (color && !/^#[0-9A-Fa-f]{6}$/.test(color)) {
        throw new Error('无效的颜色格式，请使用十六进制颜色代码');
    }

    try {
        return await 发送请求('/api/tags/update', {
            method: 'POST',
            body: JSON.stringify({ tagId, name, color })
        });
    } catch (error) {
        throw new Error(`更新标签失败: ${error.message}`);
    }
};

/**
 * 删除标签
 * @param {Object} 参数
 * @param {string} 参数.tagId - 标签ID
 * @returns {Promise<{
 *   status: string,
 *   data: {
 *     success: boolean      // 是否成功
 *   }
 * }>}
 * @throws {Error} 当请求失败时抛出错误
 */
export const 删除标签 = async ({ tagId }) => {
    if (!tagId || typeof tagId !== 'string') {
        throw new Error('无效的标签ID');
    }

    try {
        return await 发送请求('/api/tags/delete', {
            method: 'POST',
            body: JSON.stringify({ tagId })
        });
    } catch (error) {
        throw new Error(`删除标签失败: ${error.message}`);
    }
};

/**
 * 从文件系统读取 Eagle 素材库的 tags.json 文件并解析
 * @param {string} 素材库路径 - Eagle 素材库的根目录路径
 * @returns {object|null} 解析后的标签对象，如果文件不存在或解析失败则返回 null
 */
export function 从文件系统获取eagle素材库标签列表(素材库路径) {
    if (!素材库路径 || typeof 素材库路径 !== 'string') {
        console.error('从文件系统获取eagle素材库标签列表：无效的素材库路径');
        return null;
    }
    const 标签文件路径 = path.join(素材库路径, 'tags.json');
    try {
        if (fs.existsSync(标签文件路径)) {
            const tagJson = fs.readFileSync(标签文件路径, 'utf8');
            const tagJsonObj = JSON.parse(tagJson);
            return tagJsonObj;
        } else {
            console.warn(`从文件系统获取eagle素材库标签列表：标签文件不存在于 ${标签文件路径}`);
            return null;
        }
    } catch (error) {
        console.error(`从文件系统获取eagle素材库标签列表：读取或解析 ${标签文件路径} 失败:`, error);
        return null;
    }
}

// 导出英文版 API
export const getTagsList = 获取标签列表;
export const createTag = 创建标签;
export const updateTag = 更新标签;
export const deleteTag = 删除标签;

// 导出 getEagleTagsFromLibrary 作为 从文件系统获取eagle素材库标签列表 的英文别名
export const getEagleTagsFromLibrary = 从文件系统获取eagle素材库标签列表; 