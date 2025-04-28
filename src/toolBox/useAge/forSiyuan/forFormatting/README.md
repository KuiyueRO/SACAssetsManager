# 思源数据格式化工具 (`forFormatting`)

本模块 (`src/toolBox/useAge/forSiyuan/forFormatting/`) 包含用于将思源笔记相关的数据结构格式化为特定输出（如图表配置）的工具函数。

## 主要功能

*   **`formatChartOptions.js`**: 
    *   `formatDocCountToChartOption`: 将每日计数数据 (`DailyCount[]`) 转换为 ECharts 折线图的 `option` 对象。

## 依赖

*   模块内的 JSDoc 类型定义可能依赖于本目录下其他模块（如 `forData/`）导出的类型。

## 使用

```javascript
import { formatDocCountToChartOption } from 'path/to/toolBox/useAge/forSiyuan/forFormatting/formatChartOptions.js';

const dailyData = [/* ... DailyCount[] data ... */];
const chartOption = formatDocCountToChartOption(dailyData, {
  titleText: 'My Custom Title',
  smooth: false
});
// use chartOption with ECharts
```

## 定位

属于 `toolBox` 的 `useAge/forSiyuan` 层，提供特定于思源应用场景的数据格式化功能。 