/**
 * @file 浏览器环境相关常量
 * 定义了与 DOM、CSS、事件等相关的常用常量值。
 */

/**
 * 元素插入位置常量 (对应 `Element.insertAdjacentHTML()` 的 `where` 参数)。
 */
export const $插入位置 = {
    $之前: 'beforebegin',
    $之后: 'afterend',
    $内部前: 'afterbegin',
    $内部后: 'beforeend'
};

/**
 * 选区位置或方向常量。
 */
export const $选区位置 = {
    $开始: 'start',
    $结束: 'end',
    $全部: 'all',
    $向前: 'forward',
    $向后: 'backward',
    $无方向: 'none'
};

/**
 * 滚动行为常量 (对应 `Element.scrollIntoView()` 的 `behavior` 选项)。
 */
export const $滚动行为 = {
    $平滑: 'smooth',
    $立即: 'instant',
    $自动: 'auto'
};

/**
 * 可见性常量 (对应 CSS `visibility` 属性)。
 */
export const $可见性 = {
    $可见: 'visible',
    $隐藏: 'hidden',
    $折叠: 'collapse' // 主要用于表格元素
};

/**
 * 拖拽效果常量 (对应 `DataTransfer.dropEffect`)。
 */
export const $拖拽效果 = {
    $复制: 'copy',
    $移动: 'move',
    $链接: 'link',
    $无: 'none'
};

/**
 * HTML contentEditable 属性值。
 */
export const $编辑模式 = {
    $纯文本: 'plaintext-only',
    $继承: 'inherit',
    $真: 'true',
    $假: 'false'
};

/**
 * HTML inputmode 属性值。
 */
export const $输入模式 = {
    $无: 'none',
    $文本: 'text',
    $小数: 'decimal',
    $数字: 'numeric',
    $电话: 'tel',
    $搜索: 'search',
    $邮件: 'email',
    $网址: 'url'
};

/**
 * Fetch API 缓存策略常量 (对应 `Request.cache`)。
 */
export const $缓存策略 = {
    $默认: 'default',
    $无存储: 'no-store',
    $重新载入: 'reload',
    $无缓存: 'no-cache',
    $强制缓存: 'force-cache',
    $仅缓存: 'only-if-cached'
};

/**
 * Notification API 方向常量 (对应 `Notification.dir`)。
 */
export const $通知方向 = {
    $自动: 'auto',
    $左上: 'ltr',
    $右上: 'rtl'
};

/**
 * MutationObserver 观察类型常量 (对应 `MutationObserverInit` 的 key)。
 */
export const $观察类型 = {
    $子树: 'subtree',
    $属性: 'attributes',
    $子节点: 'childList',
    $字符数据: 'characterData',
    $属性旧值: 'attributeOldValue',
    $字符数据旧值: 'characterDataOldValue'
};

/**
 * CSS text-align 属性值。
 */
export const $文本对齐 = {
    $开始: 'start',
    $结束: 'end',
    $左: 'left',
    $右: 'right',
    $居中: 'center',
    $两端: 'justify',
    $匹配父元素: 'match-parent'
};

/**
 * CSS font-smoothing (非标准) 或 -webkit-font-smoothing / -moz-osx-font-smoothing 属性值。
 */
export const $字体平滑 = {
    $无: 'none',
    $抗锯齿: 'antialiased',
    $次像素: 'subpixel-antialiased',
    $自动: 'auto'
};

/**
 * CSS white-space 属性值。
 */
export const $换行模式 = {
    $正常: 'normal',
    $不换行: 'nowrap',
    $保留: 'pre',
    $保留换行: 'pre-wrap',
    $保留空格: 'pre-line',
    $截断: 'break-word' // 注意: break-word 已被 overflow-wrap: break-word 替代
};

/**
 * CSS object-fit 属性值。
 */
export const $图片适应 = {
    $无: 'none',
    $包含: 'contain',
    $覆盖: 'cover',
    $填充: 'fill',
    $缩放降质: 'scale-down'
};

/**
 * CSS scroll-snap-stop 属性值。
 */
export const $滚动捕获 = {
    $自动: 'auto', // 非标准值，通常是 normal
    $总是: 'always'
    // $正常: 'normal' // 标准值
};

/**
 * CSS touch-action 属性值。
 */
export const $触摸操作 = {
    $自动: 'auto',
    $无: 'none',
    $平移X: 'pan-x', // 修正 key
    $平移Y: 'pan-y', // 添加
    $平移: 'pan-x pan-y', // 添加组合值
    $缩放: 'pinch-zoom',
    $操作: 'manipulation' // (pan-x pan-y pinch-zoom)
};

/**
 * CSS writing-mode 属性值。
 */
export const $书写模式 = {
    $水平左右: 'horizontal-tb',
    $垂直右左: 'vertical-rl',
    $垂直左右: 'vertical-lr'
};

/**
 * HTML inputmode (与 IME 相关) 属性值。
 */
export const $输入法模式 = {
    $自动: 'auto',
    $无: 'none',
    $正常: 'normal', // 非标准 inputmode 值，可能是概念
    $片假名: 'katakana',
    $平假名: 'hiragana',
    $全角: 'full-width', // 非标准 inputmode 值
    $激活: 'active', // 非标准 inputmode 值
    $禁用: 'disabled' // 非标准 inputmode 值
};

/**
 * CSS background-repeat 属性值。
 */
export const $重复行为 = {
    $重复: 'repeat',
    $不重复: 'no-repeat',
    $重复横向: 'repeat-x',
    $重复纵向: 'repeat-y',
    $空间: 'space',
    $轮播: 'round'
};

/**
 * CSS scroll-snap-align 属性值。
 */
export const $滚动对齐 = {
    $无: 'none', // 添加
    $开始: 'start',
    $结束: 'end',
    $居中: 'center'
    // $最近: 'nearest' // 这个值在 scroll-margin/padding 中使用
};

/**
 * CSS position 属性值 (用于粘性定位)。
 */
export const $粘滞定位 = {
    // $正常: 'normal', // 不是 position 的值
    $粘性: 'sticky'
    // 可能还需 $相对: 'relative', $绝对: 'absolute', $固定: 'fixed', $静态: 'static'
};

/**
 * scrollIntoView() 的 scrollMode 选项 (非标准，但某些库可能用)。
 */
export const $焦点行为 = {
    $自动: 'auto',
    $无: 'none',
    $阻止: 'prevent' // 可能是 preventScroll?
};

/**
 * CSS resize 属性值。
 */
export const $调整大小 = {
    $无: 'none',
    $两边: 'both',
    $水平: 'horizontal',
    $垂直: 'vertical',
    $块: 'block',
    $行内: 'inline'
};

/**
 * CSS text-emphasis-style 属性值的一部分。
 */
export const $强调标记 = {
    $填充点: 'filled dot', // 修正
    $空心点: 'open dot', // 修正
    $填充圆: 'filled circle', // 修正
    $空心圆: 'open circle', // 修正
    $填充双圆: 'filled double-circle', // 修正
    $空心双圆: 'open double-circle', // 修正
    $填充三角: 'filled triangle', // 修正
    $空心三角: 'open triangle', // 修正
    $填充芝麻: 'filled sesame', // 修正
    $空心芝麻: 'open sesame', // 修正
    $无: 'none'
};

/**
 * CSS list-style-position 属性值。
 */
export const $列表位置 = {
    $外部: 'outside',
    $内部: 'inside'
};

/**
 * CSS animation-fill-mode 属性值。
 */
export const $动画填充 = {
    $无: 'none',
    $前向: 'forwards',
    $后向: 'backwards',
    $双向: 'both'
};

/**
 * CSS animation-direction 属性值。
 */
export const $动画方向 = {
    $正常: 'normal',
    $反向: 'reverse',
    $交替: 'alternate',
    $交替反向: 'alternate-reverse'
};

/**
 * CSS animation-play-state 属性值。
 */
export const $动画状态 = {
    $运行: 'running',
    $暂停: 'paused'
};

/**
 * CSS background-attachment 属性值。
 */
export const $背景附着 = {
    $固定: 'fixed',
    $滚动: 'scroll',
    $局部: 'local'
};

/**
 * CSS background-blend-mode 属性值。
 */
export const $背景混合 = {
    $正常: 'normal',
    $正片叠底: 'multiply',
    $滤色: 'screen',
    $叠加: 'overlay',
    $变暗: 'darken',
    $变亮: 'lighten',
    $颜色减淡: 'color-dodge', // 添加
    $颜色加深: 'color-burn', // 添加
    $强光: 'hard-light', // 添加
    $柔光: 'soft-light', // 添加
    $差值: 'difference', // 添加
    $排除: 'exclusion', // 添加
    $色相: 'hue', // 添加
    $饱和度: 'saturation', // 添加
    $颜色: 'color', // 添加
    $亮度: 'luminosity' // 添加
};

/**
 * CSS border-collapse 属性值。
 */
export const $边框折叠 = {
    $分离: 'separate',
    $合并: 'collapse'
};

/**
 * CSS cursor 属性值。
 */
export const $鼠标指针 = {
    $自动: 'auto',
    $默认: 'default',
    $无: 'none', // 添加
    $指针: 'pointer',
    $等待: 'wait',
    $文本: 'text',
    $移动: 'move',
    $禁止: 'not-allowed',
    $放大: 'zoom-in', // 添加
    $缩小: 'zoom-out', // 添加
    $抓取: 'grab', // 添加
    $抓取中: 'grabbing', // 添加
    // ... 可根据需要添加更多 resize, alias, copy, cell 等值
    $十字线: 'crosshair'
};

/**
 * CSS user-select 属性值。
 */
export const $选择行为 = {
    $自动: 'auto',
    $文本: 'text',
    $无: 'none',
    $包含: 'contain', // 主要用于 ::before/::after
    $全部: 'all'
};

/**
 * CSS transform-origin 属性常用值。
 */
export const $变形原点 = {
    $左上: 'left top',
    $左中: 'left center',
    $左下: 'left bottom',
    $右上: 'right top',
    $右中: 'right center',
    $右下: 'right bottom',
    $中上: 'center top', // 添加
    $中心: 'center center', // 修正
    $中下: 'center bottom' // 添加
};

/**
 * CSS overflow 属性常用值。
 */
export const $滚动条 = {
    $可见: 'visible', // 添加
    $自动: 'auto',
    $显示: 'scroll',
    $隐藏: 'hidden',
    $覆盖: 'overlay' // 非标准，但常用
};

// $对象适应 和 $图片适应 重复了，保留 $图片适应
// export const $对象适应 = {
//     $填充: 'fill',
//     $包含: 'contain',
//     $覆盖: 'cover',
//     $无: 'none',
//     $缩放降质: 'scale-down'
// };

/**
 * CSS column-fill 属性值。
 */
export const $分栏填充 = {
    $平衡: 'balance',
    $自动: 'auto'
    // $避免: 'avoid' // 不是 column-fill 的值
}; 