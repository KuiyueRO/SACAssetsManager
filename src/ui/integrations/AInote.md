# 这个区段由开发者编写,未经允许禁止AI修改
<!-- 可以在这里添加对这个目录的总体要求或说明 -->

# AI Notes & TODOs

-   **TODO:** 为非思源环境实现一个兼容 Protyle (或至少兼容其核心 Markdown 功能) 的编辑器/渲染器。
    -   **位置:** 考虑在 `src/ui/integrations/` 下创建新的适配器目录 (如 `markdown/` 或 `default/`)。
    -   **目的:** 使 UI 层能通过抽象接口 (`src/ui/api/`)，在不同环境下都能提供合适的块内容展示和交互。 