/**
 * @fileoverview 将特定数据结构格式化为图表库 (如 ECharts) 的配置对象。
 */

/**
 * @typedef {import('../forData/fromSiyuanData.js').DailyCount} DailyCount // Updated path assumption
 */

/**
 * @typedef {object} ChartOptionOverrides
 * @property {string} [titleText='文档创建趋势'] - 图表标题。
 * @property {string} [xAxisName='日期'] - X 轴名称。
 * @property {string} [yAxisName='文档数量'] - Y 轴名称。
 * @property {string} [seriesName='新增文档数'] - 数据系列名称。
 * @property {boolean} [smooth=true] - 是否平滑曲线。
 * @property {boolean} [showMaxMin=true] - 是否标记最大最小值。
 * @property {boolean} [showAverage=true] - 是否标记平均值线。
 */

/**
 * 将每日计数数据格式化为 ECharts 折线图的 option 对象。
 * @param {DailyCount[]} dailyCounts - 包含日期和计数的对象数组。
 * @param {ChartOptionOverrides} [overrides={}] - 用于覆盖默认图表选项的对象。
 * @returns {object} ECharts option 对象。
 */
export const formatDocCountToChartOption = (dailyCounts, overrides = {}) => {
    if (!Array.isArray(dailyCounts)) {
        console.warn("Invalid input: dailyCounts must be an array. Returning empty option.");
        return {}; // 返回空对象或默认错误状态的 option
    }

    const options = {
        titleText: overrides.titleText ?? '文档创建趋势',
        xAxisName: overrides.xAxisName ?? '日期',
        yAxisName: overrides.yAxisName ?? '文档数量',
        seriesName: overrides.seriesName ?? '新增文档数',
        smooth: overrides.smooth ?? true,
        showMaxMin: overrides.showMaxMin ?? true,
        showAverage: overrides.showAverage ?? true,
    };

    const dates = dailyCounts.map(item => item.date);
    const counts = dailyCounts.map(item => item.count);

    const markPointData = [];
    if (options.showMaxMin) {
        markPointData.push({ type: 'max', name: '最大值' });
        markPointData.push({ type: 'min', name: '最小值' });
    }

    const markLineData = [];
    if (options.showAverage) {
        markLineData.push({ type: 'average', name: '平均值' });
    }

    return {
        title: {
            text: options.titleText
        },
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            type: 'category',
            data: dates,
            name: options.xAxisName,
            nameLocation: 'middle', // 根据需要调整
            nameGap: 25 // 根据需要调整
        },
        yAxis: {
            type: 'value',
            name: options.yAxisName
        },
        series: [{
            name: options.seriesName,
            type: 'line',
            smooth: options.smooth,
            data: counts,
            markPoint: { data: markPointData },
            markLine: { data: markLineData }
        }]
        // 可以添加 dataZoom, toolbox 等其他 ECharts 配置项
    };
}; 