# 这个区段由开发者编写,未经允许禁止AI修改


# 修改记录

## 2025-05-02 织

*   **重构:** `button.js`
    *   修改 `buttonStyle` 字符串，全面采用思源 CSS 变量 (`--b3-*`) 替代硬编码值 (颜色、圆角、字体大小、过渡、阴影等)。
    *   参考原生 `.b3-button` 的 SCSS 实现，调整了基础样式 (padding, line-height, border) 和状态样式 (:hover, :focus, :active, :disabled)。
    *   重新实现了 `--default`, `--primary`, `--danger`, `--text` 类型样式，使其视觉上模拟对应的 `b3-button` 变体。
    *   新增了 `--cancel` 类型，模仿 `.b3-button--cancel`。
    *   调整了 `--small`, `--large` 尺寸样式。
    *   添加了 `.sac-button__icon` 基础样式。
    *   添加了基础的 `.sac-button-group` 样式。
*   **原因:** 遵循 [[../../../../diary/siyuan_ui_guideline.md]]，使按钮组件能适应思源主题，视觉风格与原生按钮保持一致。 