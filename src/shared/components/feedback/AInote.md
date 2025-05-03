# 这个区段由开发者编写,未经允许禁止AI修改

# 修改记录

## 2025-05-02 (织)

*   **优化 `message.js` (导出 `Message`, `SacMessage`, `messageStyle`)**:
    *   重构 `messageStyle` 字符串，替换所有硬编码的颜色、边框、背景、阴影为 `--b3-*` CSS 变量。
    *   基础样式使用 `--b3-theme-surface` 作为背景，`--b3-border-color` 作为边框，`--b3-dialog-shadow` 作为阴影。
    *   关闭按钮颜色使用 `--b3-theme-on-surface-light` 和 `--b3-theme-on-surface`。
    *   不同消息类型 (`success`, `warning`, `info`, `error`) 的背景色、边框色和文字颜色，改为使用对应的 `--b3-card-*-background` 和 `--b3-card-*-color` 变量，以实现与思源卡片风格一致的提示。
    *   调整了内边距、圆角、字体大小、图标大小和间距，使其更符合思源整体风格。
    *   保留了原有的过渡动画效果。 