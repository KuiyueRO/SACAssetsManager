# Static 文件夹依赖分析与优化建议 (来自 AInote.md)

本文档记录了对项目根目录下 `static/` 文件夹中包含的第三方 JavaScript 库（大多为 ESM 格式）的分析结果，并提出了通过 `src/toolBox/base/useDeps/` 模块进行封装和优化的建议。

## 已发现的依赖类别

`static/` 文件夹中包含了多种类型的依赖，大致可分为以下几类：

1.  **网络与MIME相关**:
    *   `accepts.js`, `type-is.js`, `content-type.js`, `content-disposition.js`, `cache-content-type.js`
    *   `mimeDb.js`

2.  **数据处理与实用工具**:
    *   `dayjs.js` (及 `dayjsPlugins/`)
    *   `pinyin.js`
    *   `uuid.mjs`
    *   `buffer.mjs`
    *   `rbush.js` (空间索引)
    *   `mmcq.js` (颜色量化)

3.  **视觉与UI相关**:
    *   `vue.esm-browser.js`
    *   `konva.js`, `vue-konva.mjs`
    *   `pickr-esm2022.js` (颜色选择器)
    *   `dom-to-image.mjs`

4.  **协作与同步工具**:
    *   `yjs.js`, `y-websocket.js`, `y-webrtc.js`, `y-indexeddb.js`
    *   `@syncedstore/` (目录)

5.  **多媒体处理**:
    *   `mp4-muxer.mjs`, `webm-muxer.mjs`
    *   `opencv.js`

6.  **语言与解析**:
    *   `jieba_rs_wasm.js` (中文分词)
    *   `@babel/`, `@babel_parser.js`

7.  **AI与机器学习**:
    *   `tf.min.js` (TensorFlow.js)
    *   `@huggingface/` (目录)

## 优化建议 (`useDeps` 封装)

根据工具箱的 [外部依赖管理原则](./GUIDELINES.md#外部依赖管理原则-usedeps)，建议在 `src/toolBox/base/useDeps/` 目录下创建相应的封装模块，以统一管理这些 `static/` 依赖：

1.  **`useMimeDeps.js`** (或 `forMimeDeps.js`):
    *   封装 `mimeDb.js`, `content-type.js` 等。
    *   提供统一的 MIME 类型判断和处理接口。

2.  **`useTimeDeps.js`** (或 `forTimeDeps.js`):
    *   封装 `dayjs.js` 和相关插件。
    *   提供日期格式化、解析和操作功能。

3.  **`useUuidDeps.js`**:
    *   封装 `uuid.mjs`。
    *   提供 UUID 生成功能。

4.  **`usePinyinDeps.js`**:
    *   封装 `pinyin.js`。
    *   提供拼音处理功能 (可能需要与 `toolBox/base/useDeps/pinyinTools.js` 整合或替换)。

5.  **`useVueDeps.js`**:
    *   封装 `vue.esm-browser.js`。
    *   应由 `feature/useVue` 层调用。

6.  **`useCanvasDeps.js`** (或 `useGraphicsDeps.js`):
    *   封装 `konva.js`, `vue-konva.mjs`, `pickr-esm2022.js`, `dom-to-image.mjs` 等。
    *   提供画布、图形处理、颜色选择等相关依赖。

7.  **`useCollaborationDeps.js`**:
    *   封装 `yjs` 相关库和 `@syncedstore/`。
    *   提供实时协作功能的底层依赖。

8.  **`useMediaDeps.js`**:
    *   封装 `mp4-muxer.mjs`, `webm-muxer.mjs`, `opencv.js` 等。
    *   提供媒体处理相关的底层依赖。

9.  **`useLanguageDeps.js`**:
    *   封装 `jieba_rs_wasm.js`, `@babel/` 相关库。
    *   提供分词、代码解析等底层依赖。

10. **`useAiDeps.js`**:
    *   封装 `tf.min.js`, `@huggingface/` 相关库。
    *   提供 AI 和机器学习相关的底层依赖。

## 实施优先级

1.  优先封装项目中已有直接引用但未通过 `useDeps` 管理的 `static/` 依赖。
2.  优先处理核心功能（如 MIME、日期、UI）使用的依赖。
3.  为复杂的依赖库创建简化的内部接口，降低 `feature` 或 `useAge` 层的使用门槛。

## 注意事项

1.  封装时需保持接口稳定，并提供中英文双命名（如果封装成函数）。
2.  避免将所有依赖捆绑导出，`useDeps` 内部文件应按需导入。
3.  为每个封装模块（或其中的重要部分）创建清晰的文档和使用示例。
4.  处理好可能的版本冲突问题。 