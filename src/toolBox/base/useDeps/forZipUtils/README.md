# JSZip 依赖封装 (`forZipUtils`)

本模块 (`src/toolBox/base/useDeps/forZipUtils/`) 的主要职责是封装对 `jszip` 库的依赖。

## 依赖来源

`jszip` 库文件位于项目的 `/static/jszip.js` 目录下。

## 使用方式

`toolBox` 内需要使用 `jszip` 功能的模块，应通过以下方式导入：

```javascript
import { JSZip } from '../useDeps/forZipUtils/useJsZipDep.js';
// 或者根据相对路径调整
```

## 定位

属于 `toolBox` 的 `base/useDeps` 层，用于隔离和管理外部依赖。 