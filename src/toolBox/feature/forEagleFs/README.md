# Eagle 文件系统交互 (`forEagleFs`)

本模块 (`src/toolBox/feature/forEagleFs/`) 提供了用于读取和解析 Eagle 素材库特定文件系统结构的工具函数。

## 主要功能

-   查找 Eagle 资源的元数据文件 (`metadata.json`)。
-   从任意路径向上查找 Eagle 素材库的根目录 (`.library`)。
-   读取和解析 Eagle 素材库的标签文件 (`tags.json`)。

## 依赖

**重要:** 此模块依赖 Node.js 环境中的 `fs` 和 `path` 模块。

## 定位

属于 `toolBox` 的 `feature` 层，提供了针对 Eagle 这一特定外部系统的可复用功能。 