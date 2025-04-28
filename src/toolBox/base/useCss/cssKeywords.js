/**
 * @fileoverview 提供常用的 CSS 属性关键字常量和相关辅助函数。
 * @module cssKeywords
 */

// --- CSS 关键字常量 ---

export const display = {
    inlineBlock: 'inline-block',
    block: 'block',
    inline: 'inline',
    flex: 'flex',
    inlineFlex: 'inline-flex',
    grid: 'grid',
    inlineGrid: 'inline-grid',
    table: 'table',
    tableCell: 'table-cell',
    tableRow: 'table-row',
    tableColumn: 'table-column',
    listItem: 'list-item',
    none: 'none',
    contents: 'contents',
    flow: 'flow',
    flowRoot: 'flow-root',
    inherit: 'inherit',
    initial: 'initial',
    revert: 'revert',
    unset: 'unset'
};

export const overflow = {
    hidden: 'hidden',
    visible: 'visible',
    scroll: 'scroll',
    auto: 'auto',
    clip: 'clip',
    inherit: 'inherit',
    initial: 'initial',
    unset: 'unset',
};

export const textOverflow = {
    clip: 'clip',
    ellipsis: 'ellipsis',
    clipClip: 'clip clip',
    clipEllipsis: 'clip ellipsis',
    ellipsisClip: 'ellipsis clip',
    ellipsisEllipsis: 'ellipsis ellipsis',
    inherit: 'inherit',
    initial: 'initial',
    unset: 'unset'
};

export const position = {
    static: 'static',
    relative: 'relative',
    absolute: 'absolute',
    fixed: 'fixed',
    sticky: 'sticky',
    inherit: 'inherit',
    initial: 'initial',
    unset: 'unset',
    // 实验性值, 不推荐直接使用, 请用 getPrefixedPositionSticky
    _webkitSticky: '-webkit-sticky', 
};

export const whiteSpace = {
    normal: 'normal',
    nowrap: 'nowrap',
    pre: 'pre',
    preLine: 'pre-line',
    preWrap: 'pre-wrap',
    breakSpaces: 'break-spaces',
    inherit: 'inherit',
    initial: 'initial',
    unset: 'unset',
    // 实验性值, 不推荐直接使用, 请用 getPrefixedWhiteSpace
    _webkitNowrap: '-webkit-nowrap',
};


// --- 辅助函数 ---

/**
 * 格式化 text-overflow 的字符串值。
 * @param {string} str - 要使用的字符串。
 * @returns {string} 形如 `"str"` 的 CSS 值。
 */
export const formatTextOverflowString = (str) => `"${str}"`;

/**
 * 获取带浏览器前缀的 position: sticky 值数组。
 * @returns {{position: string[]}} 包含多个 sticky 值的对象，用于样式设置。
 */
export const getPrefixedPositionSticky = () => {
  return {
    position: [
      '-webkit-sticky', // WebKit/Blink
      '-moz-sticky',    // Gecko (可能已移除)
      '-ms-sticky',     // IE (可能不支持)
      '-o-sticky',      // Presto (已弃用)
      'sticky'          // 标准
    ]
  };
};

/**
 * 获取带常见浏览器前缀的 white-space 值（以分号连接，不推荐）。
 * @deprecated 不推荐使用此函数，直接设置标准属性通常足够，或使用 autoprefixer 等工具。
 * @param {string} value - 标准的 white-space 值。
 * @returns {string} 以分号连接的带前缀字符串。
 */
export const getPrefixedWhiteSpace = (value) => {
  console.warn("getPrefixedWhiteSpace is deprecated and generally not recommended.");
  return [
    `-webkit-${value}`,
    `-moz-${value}`,
    `-ms-${value}`,
    `-o-${value}`,
    value
  ].join(';');
};

/**
 * 格式化 text-overflow 为 clip string 组合。
 * @param {string} str - 要使用的字符串。
 * @returns {string} 形如 `clip "str"` 的 CSS 值。
 */
export const formatTextOverflowClipString = (str) => `clip "${formatTextOverflowString(str)}"`;

/**
 * 格式化 text-overflow 为 ellipsis string 组合。
 * @param {string} str - 要使用的字符串。
 * @returns {string} 形如 `ellipsis "str"` 的 CSS 值。
 */
export const formatTextOverflowEllipsisString = (str) => `ellipsis "${formatTextOverflowString(str)}"`;

/**
 * 格式化 text-overflow 为 string clip 组合。
 * @param {string} str - 要使用的字符串。
 * @returns {string} 形如 `"str" clip` 的 CSS 值。
 */
export const formatTextOverflowStringClip = (str) => `"${formatTextOverflowString(str)}" clip`;

/**
 * 格式化 text-overflow 为 string ellipsis 组合。
 * @param {string} str - 要使用的字符串。
 * @returns {string} 形如 `"str" ellipsis` 的 CSS 值。
 */
export const formatTextOverflowStringEllipsis = (str) => `"${formatTextOverflowString(str)}" ellipsis`;

// 注意: textOverflow 的 stringClip, stringEllipsis 等组合也已移到上方作为独立函数 