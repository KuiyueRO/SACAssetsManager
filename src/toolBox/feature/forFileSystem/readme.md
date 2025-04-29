# 文件系统工具 (forFileSystem)

**所属层级:** Feature

**职责范围:** 提供与文件系统操作相关的功能，包括文件读写、路径处理、批量操作和流式处理等。

**准入标准:**
- 必须关注文件操作的通用技术能力
- 可以依赖`base`层的文件系统原语和工具
- **禁止**依赖`useAge`层的任何模块
- **禁止**包含特定应用的业务逻辑
- 外部依赖必须通过`base/useDeps`引入

**架构总纲:** [../../architecture_layers_explained.md](../../architecture_layers_explained.md)

## 功能

- 文件读写 (forFileWrite.js)
- 路径类型判断 (forPathType.js)
- 磁盘信息获取 (diskTools.js)
- 批量文件操作 (forBatchOperation.js)
- 路径扩展名处理 (forPathExtension.js)
- 路径过滤 (forPathFilter.js)
- 低级文件操作 (forLowLevelOperation.js)
- 文件列表处理 (forFileListProcessing.js) 