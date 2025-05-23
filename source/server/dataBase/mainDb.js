import { 根据路径查找并加载主数据库 } from "./mainDb/init.js";
import { 转换为相对磁盘根目录路径 } from "./utils.js";
export { 根据路径查找并加载主数据库 }
let dbs = {}
globalThis.thumbnailPathDBs = globalThis.thumbnailPathDBs || dbs

/**
 * 根据stat计算hash
 */
const { createHash } = require('crypto');

export function 计算哈希(stat) {
    const hash = createHash('md5');
    // 直接向hash对象添加数据，减少字符串拼接
    // 使用path,size和mtime来进行hash,这样只有在mtime改变时才会需要写入
    hash.update(转换为相对磁盘根目录路径(stat.path));
    hash.update(stat.size.toString());
    hash.update(stat.mtime.getTime().toString());
    // 生成哈希值，并截取前8个字符，以提高性能
    const hashValue = hash.digest().toString('hex').substring(0, 8);
    return hashValue
}
export async function 删除缩略图缓存行(fullName) {
    console.log(`[删除缩略图缓存行] Received fullName: ${fullName}, Type: ${typeof fullName}`);
    let 磁盘缩略图数据库 = await 根据路径查找并加载主数据库(fullName)
    if (!磁盘缩略图数据库) {
        return
    }
    if (磁盘缩略图数据库.readOnly) {
        return
    }
    const stmt = 磁盘缩略图数据库.prepare('DELETE FROM thumbnails WHERE fullName = ?');
    const result = stmt.run(转换为相对磁盘根目录路径(fullName));
    return result.changes; // 返回受影响的行数
}
export async function 写入缩略图缓存行(fullName, updateTime, stat, entryType) {
    console.log(`[写入缩略图缓存行] Received fullName: ${fullName}, Type: ${typeof fullName}`);
    if (!stat) {
        throw new Error('尝试写入缓存记录时未提供stat')
    }
    if (fullName.indexOf('\\') > -1) {
        throw new Error('尝试写入缓存时路径未转换')
    }
    if (!stat.type && !entryType) {
        throw new Error('尝试写入缓存时未提供条目类型')
    }
    let 磁盘缩略图数据库 = await 根据路径查找并加载主数据库(fullName)
    if (!磁盘缩略图数据库) {
        console.log("未找到数据库实例")
        return
    }
    if (!磁盘缩略图数据库.readOnly) {
        await 磁盘缩略图数据库.lock()
        const hash = 计算哈希(stat)
        const stmt = 磁盘缩略图数据库.prepare(`
            INSERT OR REPLACE INTO thumbnails 
            (fullName, type, statHash, updateTime, stat, size, ctime, atime, mtime)
            SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?
            WHERE NOT EXISTS (
                SELECT 1 FROM thumbnails 
                WHERE fullName = ? AND statHash = ?
            )
        `);
        const updateTimeValue = updateTime instanceof Date ? updateTime.getTime() : updateTime;
        const type = entryType || stat.type;
        const mockStat = {
            ...stat,
            path: 转换为相对磁盘根目录路径(stat.path),
        }
        const result = await stmt.run(
            转换为相对磁盘根目录路径(fullName),
            type,
            hash,
            updateTimeValue,
            JSON.stringify(mockStat),
            mockStat.size !== undefined ? mockStat.size : -1,
            mockStat.ctime ? new Date(mockStat.ctime).getTime() : -1,
            mockStat.atime ? new Date(mockStat.atime).getTime() : -1,
            mockStat.mtime ? new Date(mockStat.mtime).getTime() : -1,
            转换为相对磁盘根目录路径(fullName),
            hash
        );
        await 磁盘缩略图数据库.unlock()
        return result
    } else {
        console.log("磁盘数据库似乎已锁定,尝试重载")

        磁盘缩略图数据库.reload()
    }
    return
}

function 构建子文件夹查询SQL(search, extensions) {
    let sql = `
        SELECT t.stat
        FROM thumbnails t
    `;
    let whereClauses = [
        "t.fullName LIKE ? || '%'", // 前缀匹配保留
        "t.fullName != ?"           // 排除自身保留
    ];

    // --- 修改：使用 FTS 进行搜索 --- 
    if (search) {
        // 连接 FTS 表进行搜索
        sql += ` JOIN thumbnails_fts fts ON t.rowid = fts.rowid `;
        // 使用 MATCH 操作符替代 LIKE '%...%'
        whereClauses.push("fts.fullName MATCH ?");
    } else {
        // 如果没有搜索词，则不需要 JOIN FTS 表
    }
    // --- 修改结束 ---
    
    // --- 修改：扩展名匹配仍然使用 LIKE，但基于主表 --- 
    if (extensions && extensions.length > 0) {
        const extClauses = extensions.map(() => `t.fullName LIKE '%' || ?`).join(' OR ');
        whereClauses.push(`(${extClauses})`);
    }
    // --- 修改结束 ---
    
    sql += ` WHERE ${whereClauses.join(' AND ')} `;
    sql += ` LIMIT 100000`; // LIMIT 暂时保留，观察性能
    return sql;
}

function 构建子文件夹查询参数(dirPath, search, extensions) {
    // 基础参数：前缀匹配和排除自身
    const params = [转换为相对磁盘根目录路径(dirPath) + "%", 转换为相对磁盘根目录路径(dirPath)];
    
    // --- 修改：如果搜索，添加 MATCH 参数 --- 
    if (search) {
        // FTS 查询语法通常可以直接使用搜索词，也可以用更复杂的 FTS 查询语法
        // 这里先简单使用原始搜索词，如果需要更精确控制，可以调整
        params.push(search); 
    }
    // --- 修改结束 ---
    
    if (extensions && extensions.length > 0) {
        params.push(...extensions.map(ext => `.${ext}`));
    }
    
    return params;
}

function 处理子文件夹查询结果(results, 数据库根目录) {
    return results.map(item => {
        let json = JSON.parse(item.stat);
        return {
            ...json,
            path: 数据库根目录 + json.path
        };
    });
}

export async function 查找子文件夹(dirPath, search, extensions) {
    const start = Date.now();
    let 磁盘缩略图数据库 = await 根据路径查找并加载主数据库(dirPath);
    
    const sql = 构建子文件夹查询SQL(search, extensions);
    const params = 构建子文件夹查询参数(dirPath, search, extensions);
    const stmt = 磁盘缩略图数据库.prepare(sql);
    const countStmt = 磁盘缩略图数据库.prepare('SELECT MAX(rowid) as approximate_count FROM thumbnails');
    const approximateCount = countStmt.get().approximate_count;
    const results = stmt.all(...params);
    console.log("查询耗时", Date.now() - start, '结果数量', approximateCount);
    return {
        results: 处理子文件夹查询结果(results, 磁盘缩略图数据库.root),
        approximateCount: approximateCount
    };
}


export async function* 流式查找子文件夹(dirPath, search, extensions) {
    const start = Date.now();
    let 磁盘缩略图数据库 = await 根据路径查找并加载主数据库(dirPath);
    const sql = 构建子文件夹查询SQL(search, extensions);
    const params = 构建子文件夹查询参数(dirPath, search, extensions);
    const stmt = 磁盘缩略图数据库.prepare(sql);
    // 使用each方法逐行处理结果
    const each = stmt.iterate(...params);
    let count = 0;
    for (const row of each) {
        count++;
        let json = JSON.parse(row.stat);
        yield {
            ...json,
            path: 磁盘缩略图数据库.root + json.path
        };
    }
    console.log("流式查询耗时", Date.now() - start, '结果数量', count);
}



export async function 查找文件hash(filePath) {
    let 磁盘缩略图数据库 = await 根据路径查找并加载主数据库(filePath)
    const stmt = 磁盘缩略图数据库.prepare('SELECT fullName, statHash, updateTime FROM thumbnails WHERE fullName = ?');
    const result = stmt.get(转换为相对磁盘根目录路径(filePath));
    return result;
}
export async function 查找文件状态(filePath) {
    console.log('[查找文件状态] 开始查找:', filePath);
    let 磁盘缩略图数据库 = await 根据路径查找并加载主数据库(filePath)
    console.log('[查找文件状态] 数据库加载完成');
    const stmt = 磁盘缩略图数据库.prepare(`SELECT * FROM thumbnails WHERE fullName = ? and type='file'`);
    const result = stmt.get(转换为相对磁盘根目录路径(filePath));
    console.log('[查找文件状态] 查询结果:', result);
    return result;
}
export async function 查找文件夹状态(filePath) {
    let 磁盘缩略图数据库 = await 根据路径查找并加载主数据库(filePath)
    const stmt = 磁盘缩略图数据库.prepare(`SELECT * FROM thumbnails WHERE fullName = ? and type='dir'`);
    const result = stmt.get(转换为相对磁盘根目录路径(filePath));
    return result;
}

export async function 查找并解析文件状态(filePath) {
    console.log('[查找并解析文件状态] 开始查找:', filePath);
    const result = await 查找文件状态(filePath)
    if (result) {
        console.log('[查找并解析文件状态] 找到文件状态:', result);
        let json = JSON.parse(result.stat)
        json.hash = result.statHash
        json.path = filePath
        console.log('[查找并解析文件状态] 解析完成:', json);
        return json
    } else {
        console.log('[查找并解析文件状态] 未找到文件状态');
        return undefined
    }
}
export async function 提取所有子目录文件扩展名(dirPath) {
    let 磁盘缩略图数据库 = await 根据路径查找并加载主数据库(dirPath)
    const sql = `
        SELECT fullName
        FROM thumbnails
        WHERE fullName LIKE ? || '%'
        AND type = 'file'
    `;
    const stmt = 磁盘缩略图数据库.prepare(sql);
    const results = stmt.all(转换为相对磁盘根目录路径(dirPath) + "%");

    // 使用JavaScript处理扩展名
    const extensions = new Set();
    for (let i = 0; i < results.length; i++) {
        const fileName = results[i].fullName.split('/').pop(); // 获取文件名
        const match = fileName.match(/\.([^.]+)$/);
        if (match) {
            extensions.add(match[1].toLowerCase());
        }
    }
    return Array.from(extensions);
}