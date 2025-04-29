## 2024-08-03 网络处理工具迁移与整合（阶段完成）

### 完成事项

1. 完成了网络处理工具相关的所有迁移工作：
   - 将 `source/data/utils/streamHandler.js` 重构为函数式风格，迁移到 `src/toolBox/feature/networkingUtils/streamHandlers.js`
   - 将 `source/server/processors/streams/fileList2Stats.js` 重构并迁移到 `src/toolBox/feature/forFileSystem/forFileListProcessing.js`
   - 将 `source/server/processors/streams/withFilter.js` 重构并迁移到 `src/toolBox/feature/forStreamProcessing/streamFilters.js`

2. 更新了项目中的引用，确保使用新的工具箱函数：
   - 更新 `source/server/handlers/stream-glob.js` 中的导入，直接使用新的工具箱函数
   - 创建兼容层重定向，使旧引用继续工作，同时发出弃用警告

3. 制定了完整的清理计划：
   - 第一阶段：保留兼容层但添加弃用警告（当前）
   - 第二阶段：扫描和更新所有引用（2024年9月）
   - 第三阶段：移除兼容层，完成迁移（2024年10月）

### 架构改进

1. **函数式风格**：
   - 将类式API转换为函数式API，保持代码简洁、可测试
   - 分离关注点，每个函数专注于单一职责
   - 通过组合小函数构建复杂功能

2. **模块化设计**：
   - 按照工具箱的三层架构组织代码
   - 将网络相关功能放入 `feature` 层
   - 清晰区分流处理、文件处理和一般网络操作

3. **互操作性**：
   - 确保各模块间可以无缝配合
   - 创建一致的接口风格，方便组合使用
   - 提供统一的错误处理机制

### 下一阶段计划

1. 继续扫描项目中其他需要重构的通用功能：
   - 文件处理工具
   - 图像处理工具
   - 事件处理工具

2. 开始处理遗留的实用工具迁移：
   - 从 `source/utils` 迁移剩余工具函数
   - 处理 `source/shared` 目录中的通用代码

3. 完善测试和文档：
   - 为工具箱中的关键功能添加单元测试
   - 完善每个模块的使用文档和示例

## 2024-08-03 网络处理工具迁移与重构

### 完成事项

1. 完成了一系列网络处理工具的迁移与重构：
   - 将 `source/data/utils/streamHandler.js` 重构为函数式风格，迁移到 `src/toolBox/feature/networkingUtils/streamHandlers.js`
   - 将 `source/server/processors/streams/fileList2Stats.js` 重构并迁移到 `src/toolBox/feature/forFileSystem/forFileListProcessing.js`
   - 将 `source/server/processors/streams/withFilter.js` 重构并迁移到 `src/toolBox/feature/forStreamProcessing/streamFilters.js`

2. 创建了新的功能目录并添加详细说明文件：
   - 新增 `src/toolBox/feature/networkingUtils/README.md`，描述网络工具目录的职责和准入标准
   - 新增 `src/toolBox/feature/forStreamProcessing/README.md`，描述流处理工具目录的职责和准入标准
   - 更新 `src/toolBox/feature/forFileSystem/readme.md`，补充文件处理相关信息

3. 所有重构的模块都遵循以下原则：
   - 使用纯函数风格替代类实现
   - 提供中英文双命名函数接口
   - 添加完整的JSDoc文档注释
   - 进行参数验证和错误处理

### 迁移摘要

| 旧路径 | 新路径 | 状态 |
|--------|--------|------|
| `source/data/utils/streamHandler.js` | `src/toolBox/feature/networkingUtils/streamHandlers.js` | 完成 |
| `source/server/processors/streams/fileList2Stats.js` | `src/toolBox/feature/forFileSystem/forFileListProcessing.js` | 完成 |
| `source/server/processors/streams/withFilter.js` | `src/toolBox/feature/forStreamProcessing/streamFilters.js` | 完成 |

### API变更

1. 流处理工具 (streamHandlers.js):
   - 移除了`DataStreamHandler`类，替换为一系列纯函数
   - 新增函数：`fetchDataStream`、`createStreamController`、`handleDataStream`
   - 新增中文命名函数：`处理数据流`、`创建流控制器`

2. 文件列表处理工具 (forFileListProcessing.js):
   - 将`buildFileListStream`重构为`createFileListToStatsStream`
   - 新增函数：`processFileListToStats`(同步处理版本)
   - 新增中文命名函数：`创建文件列表转状态流`、`处理文件列表转状态`

3. 流过滤工具 (streamFilters.js):
   - 将`buildFilterStream`重构为`createFilterStream`
   - 新增函数：`filterItems`、`createFilter`
   - 新增中文命名函数：`创建过滤流`、`过滤数据项`、`创建过滤器`

### 下一步计划

1. 优化新创建的模块之间的互操作性
2. 添加更多单元测试确保功能正确性
3. 更新原有代码中的引用，逐步迁移至新模块

## 2024-04-05 代码分析工具重构

### 完成事项

1. 创建了`feature/forCodeAnalysis`目录，专门用于存放代码分析相关工具
2. 将`source/utils/codeLoaders/js/jsDoc.js`迁移到`src/toolBox/feature/forCodeAnalysis/jsParser.js`
3. 增强了JSDoc解析功能，提供了中文命名API
4. 在`toolBoxExports.js`中添加导出

### 迁移摘要

| 旧路径 | 新路径 | 状态 |
|--------|--------|------|
| `source/utils/codeLoaders/js/jsDoc.js` | `src/toolBox/feature/forCodeAnalysis/jsParser.js` | 完成 |

### API变更

- 新增中文API:
  - `解析JSDoc配置` - 解析代码文本中的JSDoc注释
  - `从URL解析JSDoc配置` - 从URL加载代码并解析JSDoc注释
- 保留原有API以兼容现有代码:
  - `parseJSDocConfig`
  - `parseJSDocConfigFromURL`

### 下一步计划

1. 将`source/utils/codeLoaders/js/lexicalAnalyzer.js`迁移到`jsParser.js`中
2. 开发代码质量分析和代码修改工具

## 2024-04-07 思源块处理工具重构

### 完成事项

1. 创建了`useAge/forSiyuan/forBlock`目录，用于存放思源笔记块处理相关工具
2. 将`source/fromThirdParty/siyuanUtils/BlockHandler.js`迁移到`src/toolBox/useAge/forSiyuan/forBlock/useBlockHandler.js`
3. 添加了完整的JSDoc文档注释和中文命名函数
4. 修复了原有代码中的一些问题
5. 更新了相关导入路径，直接删除了原始文件

### 迁移摘要

| 旧路径 | 新路径 | 状态 |
|--------|--------|------|
| `source/fromThirdParty/siyuanUtils/BlockHandler.js` | `src/toolBox/useAge/forSiyuan/forBlock/useBlockHandler.js` | 完成 |

### API变更

- 新增中文API:
  - `创建块处理器(blockID, initdata, kernelApiInstance)` - 创建块处理器实例
  - `匹配块类型(type)` - 匹配块类型获取缩写
- 保留原有API以兼容现有代码:
  - `BlockHandler` 类

### 下一步计划

1. 继续迁移`source/fromThirdParty/siyuanUtils`中的其他工具
2. 优化块处理器的性能和错误处理
3. 将`kernelApi`也纳入工具箱体系

## 2024-04-08 思源工具函数继续重构

### 完成事项

1. 创建了`useAge/forSiyuan/forBlock`、`useAge/forSiyuan/forMarkdown`和`useAge/forSiyuan/forAsset`目录
2. 将以下文件进行了迁移：
   - `source/fromThirdParty/siyuanUtils/blockIcons.js` → `src/toolBox/useAge/forSiyuan/forBlock/useSiyuanBlockIcon.js`
   - `source/fromThirdParty/siyuanUtils/delegators/markdown.js` → `src/toolBox/useAge/forSiyuan/forMarkdown/useSiyuanMarkdown.js`
   - `source/fromThirdParty/siyuanUtils/upload.js` → `src/toolBox/useAge/forSiyuan/forAsset/useSiyuanUpload.js`
3. 为每个迁移的模块添加了完整的JSDoc文档注释和中文命名函数
4. 为每个目录创建了详细的README.md文件
5. 增强了原有功能，如添加批量上传和更灵活的配置选项
6. 删除了原始文件并修改了依赖该文件的代码

### 迁移摘要

| 旧路径 | 新路径 | 状态 |
|--------|--------|------|
| `source/fromThirdParty/siyuanUtils/blockIcons.js` | `src/toolBox/useAge/forSiyuan/forBlock/useSiyuanBlockIcon.js` | 完成 |
| `source/fromThirdParty/siyuanUtils/delegators/markdown.js` | `src/toolBox/useAge/forSiyuan/forMarkdown/useSiyuanMarkdown.js` | 完成 |
| `source/fromThirdParty/siyuanUtils/upload.js` | `src/toolBox/useAge/forSiyuan/forAsset/useSiyuanUpload.js` | 完成 |

### API变更

1. 块图标工具 (useSiyuanBlockIcon.js):
   - 新增: `根据类型获取图标`、`获取块类型图标映射`、`获取列表图标映射`
   - 兼容: `getIconByType`、`TYPE_ICON_MAP`、`LIST_ICON_MAP`

2. Markdown工具 (useSiyuanMarkdown.js):
   - 新增: `Markdown工具`、`创建Markdown工具`
   - 兼容: `markdown委托器`

3. 资源上传工具 (useSiyuanUpload.js):
   - 新增: `上传到思源资源库`、`创建上传处理器`
   - 兼容: `uploadToSiyuanAssets`
   - 增强: 添加批量上传、跳过确认等选项

### 下一步计划

1. 继续迁移`source/fromThirdParty`中的其他工具
2. 将`source/fromThirdParty/siyuanKernel`中的API封装到工具箱
3. 将`source/fromThirdParty/siyuanClient`中的功能迁移到工具箱
4. 减少对原始路径的依赖，完全切换到工具箱API

## 2024-04-09 思源内核API迁移

### 完成事项

1. 迁移思源内核API兼容层，创建重定向文件：
   - `source/fromThirdParty/siyuanKernel/asset.js` → 重定向到 `src/toolBox/useAge/forSiyuan/useSiyuanAsset.js`
   - `source/fromThirdParty/siyuanKernel/attr.js` → 重定向到 `src/toolBox/useAge/forSiyuan/useSiyuanBlock.js`
   - `source/fromThirdParty/siyuanKernel/block.js` → 重定向到 `src/toolBox/useAge/forSiyuan/useSiyuanBlock.js`
   - `source/fromThirdParty/siyuanKernel/blockOp.js` → 重定向到 `src/toolBox/useAge/forSiyuan/useSiyuanBlock.js`
   - `source/fromThirdParty/siyuanKernel/system.js` → 重定向到 `src/toolBox/useAge/forSiyuan/useSiyuanSystem.js`
   - `source/fromThirdParty/siyuanKernel/notebook.js` → 重定向到 `src/toolBox/useAge/forSiyuan/useSiyuanNotebook.js`
2. 扩展了 `useSiyuanAsset.js` 模块，添加原 `asset.js` 中的所有功能
3. 为 `useSiyuanBlock.js` 添加了兼容导出，确保 `getBlockAttrs` 和 `setBlockAttrs` 函数正常工作
4. 修复了导入路径错误导致的问题

### 迁移摘要

| 旧路径 | 新路径 | 状态 |
|--------|--------|------|
| `source/fromThirdParty/siyuanKernel/asset.js` | `src/toolBox/useAge/forSiyuan/useSiyuanAsset.js` | 完成（兼容层） |
| `source/fromThirdParty/siyuanKernel/attr.js` | `src/toolBox/useAge/forSiyuan/useSiyuanBlock.js` | 完成（兼容层） |
| `source/fromThirdParty/siyuanKernel/block.js` | `src/toolBox/useAge/forSiyuan/useSiyuanBlock.js` | 完成（兼容层） |
| `source/fromThirdParty/siyuanKernel/blockOp.js` | `src/toolBox/useAge/forSiyuan/useSiyuanBlock.js` | 完成（兼容层） |
| `source/fromThirdParty/siyuanKernel/system.js` | `src/toolBox/useAge/forSiyuan/useSiyuanSystem.js` | 完成（兼容层） |
| `source/fromThirdParty/siyuanKernel/notebook.js` | `src/toolBox/useAge/forSiyuan/useSiyuanNotebook.js` | 完成（兼容层） |
| `source/fromThirdParty/siyuanClient/dialogs/confirmPromises.js` | `src/toolBox/useAge/forSiyuan/useSiyuanDialog.js` | 完成（兼容层） |
| `source/fromThirdParty/siyuanKernel/file.js` | `src/toolBox/useAge/forSiyuan/useSiyuanFile.js` | 完成（兼容层） |
| `source/fromThirdParty/siyuanKernel/filetree.js` | `src/toolBox/useAge/forSiyuan/forFiletree/useSiyuanFiletree.js` | 完成（兼容层） |

### API变更

1. 资源文件API (useSiyuanAsset.js):
   - 新增函数：`上传资源到云端`、`插入本地资源`、`解析资源路径`、`设置文件注释`、`获取文件注释`、`获取未使用资源`、`获取缺失资源`、`删除未使用资源`、`删除所有未使用资源`、`获取文档图片资源`、`获取图片OCR文本`、`设置图片OCR文本`、`执行OCR`、`重建资源内容索引`、`获取资源统计`、`获取资源文件信息`
   - 英文兼容API：`uploadCloud`、`insertLocalAssets`、`resolveAssetPath`、`setFileAnnotation`、`getFileAnnotation`、`getUnusedAssets`、`getMissingAssets`、`removeUnusedAsset`、`removeUnusedAssets`、`getDocImageAssets`、`getImageOCRText`、`setImageOCRText`、`ocr`、`fullReindexAssetContent`、`statAsset`、`getAssetInfo`

2. 块操作API (useSiyuanBlock.js):
   - 新增兼容导出：`getBlockAttrs`、`setBlockAttrs`
   - 确保与原 `attr.js` 兼容

3. 文件操作API (useSiyuanFile.js):
   - 新增函数：`获取唯一文件名`、`全局复制文件`、`复制文件`、`获取文件`、`读取目录`、`重命名文件`、`删除文件`、`上传文件`、`创建目录`、`获取临时目录路径`、`检查文件是否存在`
   - 英文兼容API：`getUniqueFilename`、`globalCopyFiles`、`copyFile`、`getFile`、`readDir`、`renameFile`、`removeFile`、`putFile`、`createDir`、`getTempDirPath`、`isFileExist`

### 下一步计划

1. 继续迁移 `source/fromThirdParty/siyuanKernel` 中其他API文件
   - [x] `asset.js`
   - [x] `file.js`
   - [x] `filetree.js`
   - [ ] `workspace.js`
   - [ ] `system.js`
   - [ ] 其他核心API
   
2. 完成 `source/fromThirdParty/siyuanClient` 目录迁移
   - [x] `dialogs/confirmPromises.js`
   - [ ] `runtime.js`
   - [ ] 其他客户端工具
   
3. 在新创建的目录中添加或更新 `README.md` 和 `AInote.md`
   
4. 持续扩展和优化工具集功能

## 迁移记录

### 已完成的迁移

- [x] `source/fromThirdParty/siyuanUtils/blockIcons.js` -> `src/toolBox/useAge/forSiyuan/forBlock/useSiyuanBlockIcon.js` (完成，含兼容层)
- [x] `source/fromThirdParty/siyuanUtils/delegators/markdown.js` -> `src/toolBox/useAge/forSiyuan/forMarkdown/useSiyuanMarkdown.js` (完成，含兼容层)
- [x] `source/fromThirdParty/siyuanUtils/upload.js` -> `src/toolBox/useAge/forSiyuan/forAsset/useSiyuanUpload.js` (完成，含兼容层)
- [x] `source/fromThirdParty/siyuanUtils/attr.js` -> `src/toolBox/useAge/forSiyuan/forBlock/useSiyuanBlockAttr.js` (完成，含兼容层)
- [x] `source/fromThirdParty/siyuanKernel/asset.js` -> `src/toolBox/useAge/forSiyuan/useSiyuanAsset.js` (完成，含兼容层)
- [x] `source/fromThirdParty/siyuanKernel/notebook.js` -> `src/toolBox/useAge/forSiyuan/useSiyuanNotebook.js` (完成，含兼容层)
- [x] `source/fromThirdParty/siyuanClient/dialogs/confirmPromises.js` -> `src/toolBox/useAge/forSiyuan/useSiyuanDialog.js` (完成，含兼容层)
- [x] `source/fromThirdParty/siyuanKernel/file.js` -> `src/toolBox/useAge/forSiyuan/useSiyuanFile.js` (完成，含兼容层)
- [x] `source/fromThirdParty/siyuanKernel/filetree.js` -> `src/toolBox/useAge/forSiyuan/forFiletree/useSiyuanFiletree.js` (完成，含兼容层)

### 结构调整

为了更好地组织代码，我们对部分文件进行了结构调整：

1. 创建专门的子目录来存放相关功能：
   - `forBlock` - 存放与块相关的工具函数
   - `forMarkdown` - 存放与Markdown相关的工具函数
   - `forAsset` - 存放与资源文件相关的工具函数
   - `forFiletree` - 存放与文件树和文档相关的工具函数

2. 添加重定向层以保持向后兼容性：
   - `useSiyuanFiletree.js` 重定向到 `forFiletree/useSiyuanFiletree.js`

3. 每个子目录都添加了 `README.md` 和 `AInote.md` 文件，提供详细的功能说明和开发笔记。

### API变更

#### `useSiyuanBlockIcon.js`
- 增加：`获取所有内置图标`、`获取思源内部图标`、`解析图标字符串`等中文函数

#### `useSiyuanMarkdown.js`
- 增加：`处理导出Markdown`、`生成导出Markdown`等中文函数

#### `useSiyuanUpload.js`
- 增加：`上传资源文件`、`批量上传资源文件`等中文函数

#### `useSiyuanBlockAttr.js`
- 增加：`获取块属性`、`设置块属性`等中文函数

#### `useSiyuanAsset.js`
- 增加：`获取资源文件`、`设置资源文件`、`删除资源文件`等中文函数

#### `useSiyuanNotebook.js`
- 增加：`获取笔记本列表`、`获取笔记本配置`、`打开笔记本`等中文函数

#### `useSiyuanFile.js`
- 增加：`获取唯一文件名`、`全局复制文件`、`复制文件`、`获取文件`、`读取目录`、`重命名文件`、`删除文件`、`上传文件`、`创建目录`、`获取临时目录路径`、`检查文件是否存在`等中文函数

#### `useSiyuanFiletree.js`
- 增加：`列出文档树`、`创建文档`、`创建每日笔记`、`重命名文档`、`通过ID重命名文档`、`移动文档`、`删除文档`、`获取文档创建保存路径`、`搜索文档`、`根据路径列出文档`、`获取文档`、`获取引用创建保存路径`、`修改文档排序`、`使用Markdown创建文档`、`文档转换为标题`、`标题转换为文档`、`列表项转换为文档`、`刷新文件树`等中文函数

## 下一步计划

1. 继续迁移 `source/fromThirdParty/siyuanKernel` 中其他API文件
   - [x] `asset.js`
   - [x] `file.js`
   - [x] `filetree.js`
   - [ ] `workspace.js`
   - [ ] `system.js`
   - [ ] 其他核心API
   
2. 完成 `source/fromThirdParty/siyuanClient` 目录迁移
   - [x] `dialogs/confirmPromises.js`
   - [ ] `runtime.js`
   - [ ] 其他客户端工具
   
3. 在新创建的目录中添加或更新 `README.md` 和 `AInote.md`
   
4. 持续扩展和优化工具集功能

## 最近更新

### 2023年X月X日

完成了对 `filetree.js` 的迁移工作，将文档管理相关功能移至 `forFiletree` 子目录，并进行了更好的结构组织。现在所有与文件树和文档操作相关的功能都集中在 `forFiletree/useSiyuanFiletree.js` 中，同时保留了指向该位置的重定向层，确保向后兼容性。改进了模块的文档说明，添加了中文API接口，优化了函数的错误处理和参数验证。

### 2024-03-21
- 完成 `system.js` 的迁移工作
  - 源文件：`source/fromThirdParty/siyuanKernel/system.js`
  - 目标文件：`src/toolBox/useAge/forSiyuan/useSiyuanSystem.js`
  - 状态：已完成，包含兼容层
  - API变更：
    - 新增中文API接口：
      - `重载UI`
      - `获取工作空间信息`
      - `获取网络配置`
      - `设置网络代理`
      - `获取系统字体`
      - `获取版本号`
      - `获取当前时间戳`
      - `获取启动进度`
      - `退出应用`
      - `设置自动启动`
      - `设置外观模式`
      - `检查更新`
      - `获取图表渲染器信息`
      - `获取主题模式`
      - `获取升级进度`
    - 保留原有英文API接口
  - 改进：
    - 优化了参数验证和错误处理
    - 添加了详细的JSDoc注释
    - 提供了完整的中文API接口
    - 保持了与原有API的兼容性
    - 统一了错误处理机制
    - 增强了类型安全性

- 完成 `runtime.js` 的迁移工作
  - 源文件：`source/fromThirdParty/siyuanClient/runtime.js`
  - 目标文件：`src/toolBox/useAge/forSiyuan/useSiyuanDialog.js`
  - 状态：已完成，包含兼容层
  - API变更：
    - 将 `confirm` 和 `Dialog` 重定向到 `useSiyuanDialog.js` 中的实现
    - `confirm` -> `confirmAsPromise`
    - `Dialog` -> `createSimpleDialog`
  - 改进：
    - 简化了API结构
    - 统一了对话框相关的功能
    - 保持了与原有API的兼容性
    - 提供了更清晰的错误提示

- 完成 `index.js` 的迁移工作
  - 源文件：`source/fromThirdParty/siyuanClient/index.js`
  - 目标文件：`src/toolBox/useAge/forSiyuan/useSiyuanDialog.js`
  - 状态：已完成，包含兼容层
  - API变更：
    - 将 `confirmAsPromise` 重定向到 `useSiyuanDialog.js` 中的实现
  - 改进：
    - 简化了API结构
    - 统一了对话框相关的功能
    - 保持了与原有API的兼容性
    - 提供了更清晰的错误提示

- 完成 `eagle` 目录的迁移工作
  - 源目录：`source/fromThirdParty/eagle`
  - 目标目录：`src/toolBox/useAge/forEagle`
  - 状态：已完成，包含兼容层
  - 模块拆分：
    - `useEagleApi.js`: API基础功能
      - API配置
      - 请求处理
      - 参数构建
    - `useEagleSearch.js`: 搜索功能
      - 搜索执行
      - 结果转换
    - `useEagleFolder.js`: 文件夹管理
      - 文件夹列表获取
      - 结果转换
    - `useEagleLibrary.js`: 资源库管理
      - 资源库列表获取
      - 结果转换
  - API变更：
    - 新增中文API接口
    - 保留原有英文API接口
  - 改进：
    - 优化了模块结构，按功能拆分
    - 统一了错误处理机制
    - 提供了完整的中文API接口
    - 保持了与原有API的兼容性
    - 增强了类型安全性
    - 统一了API端点配置
    - 改进了参数验证

- 完成 `npm` 目录的迁移工作
  - 源目录：`source/fromThirdParty/npm`
  - 目标目录：`src/toolBox/useAge/forNpm`
  - 状态：已完成，包含兼容层
  - 模块拆分：
    - `useNpmApi.js`: npm API基础功能
      - 包信息获取
      - 版本列表获取
      - 包搜索功能
  - API变更：
    - 新增中文API接口：
      - `获取包信息`
      - `获取包版本列表`
      - `搜索包`
    - 保留原有英文API接口
  - 改进：
    - 优化了模块结构
    - 统一了错误处理机制
    - 提供了完整的中文API接口
    - 保持了与原有API的兼容性
    - 增强了类型安全性
    - 统一了API配置
    - 改进了参数验证

### 下一步计划
1. 继续迁移 `source/fromThirdParty/anytext` 目录
2. 完善 `README.md` 和 `AInote.md` 文档
3. 持续优化工具箱功能

## 2024-04-05 向量距离计算函数重构

### 完成事项

1. 整合并规范化了向量距离计算函数
2. 将 `base/forMath/forGeometry/forVectors/forDistance.js` 更新为集中的向量距离计算模块
3. 将 `feature/forVectorEmbedding/useDeltaPQHNSW/useCustomedHNSW.js` 中的距离函数移到公共模块中
4. 更新了 `base/forMath/forGeometry/forVectors/forNormalization.js` 使其命名规范保持一致性
5. 添加了新的距离计算函数：汉明距离和杰卡德距离

### 迁移摘要

| 旧路径 | 新路径 | 状态 |
|--------|--------|------|
| 散落在不同文件的距离计算函数 | `base/forMath/forGeometry/forVectors/forDistance.js` | 完成 |

### API变更

1. 距离计算函数 (forDistance.js):
   - 规范化命名: `曼哈顿距离` → `computeManhattanDistance`
   - 规范化命名: `切比雪夫距离` → `computeChebyshevDistance`
   - 规范化命名: `余弦相似度` → `computeCosineDistance`
   - 新增函数: `computeInnerProduct` - 内积相似度计算
   - 新增函数: `computeHammingDistance` - 汉明距离计算
   - 新增函数: `computeJaccardDistance` - 杰卡德距离计算
   - 移除了重复实现和默认导出

2. 向量归一化函数 (forNormalization.js):
   - 规范化命名: `向量归一化` → `computeVectorNormalization`
   - 改进类型注释，支持 Float32Array 和 Array 类型

3. HNSW索引实现 (useCustomedHNSW.js):
   - 移除内部重复的距离计算函数，统一使用 forDistance.js 中的实现
   - 保持功能不变，减少代码重复

### 下一步计划

1. 继续完善向量数学工具:
   - 添加向量运算函数 (加、减、点积、叉积等)
   - 提供低级别的向量操作优化
   - 增强向量索引性能优化

2. 考虑添加以下函数:
   - 闵可夫斯基距离计算
   - 马氏距离计算
   - KL散度和JS散度
   - 地理距离计算函数
