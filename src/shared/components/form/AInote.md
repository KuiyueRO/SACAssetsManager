# 这个区段由开发者编写,未经允许禁止AI修改

# 修改记录

## 2025-05-02 (织)

*   **优化 `input.js` 和 `textarea.js` (合并至 `input.js` 中导出 `SacInput`, `SacTextarea`, `inputStyle`)**: 
    *   重构 `inputStyle` 字符串，全面使用思源 `--b3-*` CSS 变量替换硬编码的颜色、尺寸、边框、圆角、过渡效果等。
    *   参考原生 `.b3-text-field` 调整了基础样式（背景、边框、内边距、行高、圆角）。
    *   统一了 `SacInput` 和 `SacTextarea` 的基础样式、禁用状态样式。
    *   调整了 `SacInput` 的不同尺寸 (`--small`, `--large`) 样式，使其基于 `--b3-font-size` 计算。
    *   优化了聚焦状态样式，使其与原生保持一致（仅改变边框颜色）。
    *   调整了只读状态样式，给予轻微背景区分。
    *   统一并优化了前后缀图标、清除按钮、密码切换图标的样式，使用 CSS 变量控制颜色和悬停效果，调整了间距和尺寸。
    *   添加了字数统计 (`.sac-input__count`) 的样式。
    *   添加了错误状态 (`.sac-input--error`) 的边框样式和错误消息 (`.sac-input__error`) 的文本样式，均使用 CSS 变量。
    *   优化了 `SacTextarea` 的默认样式和 `autosize` 状态下的样式。
*   **优化 `checkbox.js` (导出 `SacCheckbox`, `SacCheckboxGroup`, `checkboxStyle`)**: 
    *   重构 `checkboxStyle` 字符串，替换硬编码颜色为 `--b3-*` 变量，包括基础文字、标记边框/背景、勾号/横线、禁用状态等。
    *   参考原生 Switch 组件，调整选中/半选状态的配色方案（背景使用 `--b3-theme-primary`，勾号/横线使用 `--b3-theme-on-primary`）。
    *   将自定义激活颜色 `--checkbox-active-color` 的默认值设为 `--b3-theme-primary`。
    *   调整圆角、字体大小使用 CSS 变量。
    *   优化了禁用状态下选中/半选标记的颜色。
    *   优化了带边框 (`--border`) 样式的颜色、背景、圆角和内边距，使其符合思源风格。
    *   调整了不同尺寸 (`--small`, `--large`) 的样式，使其基于 `--b3-font-size` 计算，并修正了内部勾号/横线的尺寸和位置。
    *   优化了标签 (`.sac-checkbox__label`) 的行高和间距。
    *   整理了 `SacCheckboxGroup` 的基础样式。 