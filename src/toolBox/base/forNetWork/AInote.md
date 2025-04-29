# 这个区段由开发者编写,未经允许禁止AI修改

# forNetwork 重构笔记

**所属层级:** Base

**职责范围:** 提供与网络通信相关的底层、通用工具，包括 HTTP 请求 (Fetch)、WebSocket、端口管理、URL 处理、连接检查等。

**准入标准:**
- 必须是纯粹的、与网络协议或通信机制相关的底层工具。
- 应尽可能无副作用（除非明确标记并隔离）。
- **禁止**依赖 `feature` 或 `useAge` 层的任何模块。
- **禁止**包含特定应用的业务逻辑或特定 API 的配置。
- 外部依赖必须通过 `base/useDeps` 引入。

**架构总纲:** [../../architecture_layers_explained.md](../../architecture_layers_explained.md)

## 包含的子模块 (按功能划分)

- `forFetch/`: Fetch API 相关工具。
- `forAuthHeaders.js`: 创建认证请求头的通用工具。
- `forWebSocket/`: WebSocket 相关工具。
- `forSSE/` & `forSSE.js`: Server-Sent Events 相关。
- `forPort/`: 端口管理相关。
- `forRouter/`: 路由处理 (可能考虑移至 feature 层？)。
- `forURIValidation.js`: URI 验证。
- `forConnectionCheck.js`: 网络连接检查。
- `forFileSystem.js`: 文件系统相关的网络操作(e.g.?, 待确认范围)。
- `forEndPoints/`: API 端点管理 (可能考虑移至 useAge 层？)。
- `useHeaders/`: HTTP Headers 处理工具。
- `forSiyuanApi/`: (待确认) 是否为底层思源网络封装？应避免应用逻辑。

## 历史记录

### 2024-07-28 (织)
- 创建 `forAuthHeaders.js` 文件，用于提供通用的创建认证请求头的函数 `createAuthHeaders`。
- 该函数源自 `source/fromThirdParty/siyuanKernel/utils/fetchUtils.js` 中的 `getAuthHeaders`，并进行了通用化改造。 