/**
 * @file Canvas 2D globalCompositeOperation 常量
 * 定义了 Canvas 2D 上下文的 globalCompositeOperation 属性所有可能的混合模式值。
 */

/**
 * Canvas 2D 混合模式常量。
 * key 为中文描述，value 为对应的 globalCompositeOperation 字符串值。
 */
export const $canvas混合模式 = {
    // 基础操作类
    $清除: 'clear',
    $源图: 'copy',
    $覆盖: 'source-over',
    $在内: 'source-in',
    $在外: 'source-out',
    $顶部: 'source-atop',
    // 目标图优先类
    $目标: 'destination',
    $目标覆盖: 'destination-over', // 标准名称
    $目标在内: 'destination-in',
    $目标在外: 'destination-out',
    $目标顶部: 'destination-atop',
    // 特殊混合类
    $异或: 'xor',
    $添加: 'lighter', // 标准名称，等同于 'add' 但更通用
    // 图像混合类
    $正片叠底: 'multiply',
    $滤色: 'screen',
    $叠加: 'overlay',
    $变暗: 'darken',
    $变亮: 'lighten',
    // 色彩调整类
    $颜色减淡: 'color-dodge',
    $颜色加深: 'color-burn',
    $强光: 'hard-light',
    $柔光: 'soft-light',
    $色相: 'hue',
    $饱和度: 'saturation',
    $颜色: 'color',
    $亮度: 'luminosity',
    // 数学运算类
    $差值: 'difference',
    $排除: 'exclusion'
    // 注意：'saturate' 和 'add' 在某些浏览器或规范版本中可能存在差异或不被推荐，已更新为标准名称或注释掉
}; 