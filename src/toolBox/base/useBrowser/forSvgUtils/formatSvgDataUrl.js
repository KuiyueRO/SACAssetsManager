/**
 * @fileoverview 生成 SVG Data URL 的工具函数。
 */

/**
 * @typedef {object} SvgOptions
 * @property {number} [width=58] - SVG 画布宽度。
 * @property {number} [height=58] - SVG 画布高度。
 */

/**
 * @typedef {object} SvgTextOptions
 * @extends SvgOptions
 * @property {number} [fontSize=5] - 文本字体大小 (px)。
 * @property {string} [textColor='black'] - 文本颜色。
 * @property {string} [fontFamily='sans-serif'] - 字体。
 * @property {number} [padding=3] - 文本区域内边距 (px)。
 */

/**
 * @typedef {object} SvgCssOptions
 * @extends SvgOptions
 */

/**
 * 将 SVG 字符串编码为 Data URL。
 * @param {string} svgString - 完整的 SVG XML 字符串。
 * @returns {string} SVG Data URL。
 */
function encodeSvgToDataUrl(svgString) {
    // 使用 encodeURIComponent 对 SVG 内容进行编码
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);
}

/**
 * 创建一个指定尺寸的空 SVG 的 Data URL。
 * @param {SvgOptions} [options={}] - SVG 尺寸选项。
 * @returns {string} 空 SVG 的 Data URL。
 */
export function formatEmptySvgDataUrl(options = {}) {
    const { width = 58, height = 58 } = options;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"></svg>`;
    return encodeSvgToDataUrl(svg);
}

/**
 * 创建一个包含内联 CSS 样式的 HTML div 的 SVG Data URL。
 * 用于需要通过 CSS 控制背景等场景。
 * @param {string} cssString - 应用于内部 div 的 CSS 样式字符串 (例如 "background: red; border-radius: 5px;")。
 * @param {SvgCssOptions} [options={}] - SVG 尺寸选项。
 * @returns {string} 包含 CSS 的 SVG Data URL。
 */
export function formatCssSvgDataUrl(cssString, options = {}) {
    const { width = 58, height = 58 } = options;
    // 使用 CDATA 包裹 HTML/CSS 可能更健壮，但这里保持简单
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
            <foreignObject width="100%" height="100%">
                <div xmlns="http://www.w3.org/1999/xhtml" style="width: ${width}px; height: ${height}px; ${cssString || ''}">
                </div>
            </foreignObject>
        </svg>
    `;
    return encodeSvgToDataUrl(svg);
}

/**
 * 创建一个包含居中文本的 SVG Data URL。
 * @param {string} textContent - 要显示的文本内容。
 * @param {SvgTextOptions} [options={}] - SVG 尺寸和文本样式选项。
 * @returns {string} 包含文本的 SVG Data URL。
 */
export function formatTextSvgDataUrl(textContent, options = {}) {
    const {
        width = 58,
        height = 58,
        fontSize = 5, // 原代码默认值很小，保持观察
        textColor = 'black',
        fontFamily = 'sans-serif',
        padding = 3
    } = options;

    // 计算内部 div 尺寸
    const innerWidth = width - padding * 2;
    const innerHeight = height - padding * 2;

    // 基本的 HTML 转义
    const escapedText = textContent
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
            <foreignObject width="100%" height="100%">
                <div xmlns="http://www.w3.org/1999/xhtml" style="
                    font-size: ${fontSize}px;
                    color: ${textColor};
                    font-family: ${fontFamily};
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: ${innerWidth}px;
                    height: ${innerHeight}px;
                    margin: ${padding}px;
                    overflow: hidden; /* 防止内容溢出 */
                    text-align: center;
                ">
                    ${escapedText}
                </div>
            </foreignObject>
        </svg>
    `;
    return encodeSvgToDataUrl(svg);
}

/**
 * 创建一个包含指定 Emoji 的 SVG Data URL。
 * @param {string} emojiUnicode - Emoji 的 Unicode 码点字符串 (十六进制，例如 "1F4C4")。
 * @param {SvgTextOptions} [options={}] - SVG 尺寸和样式选项 (fontSize 通常需要较大)。
 * @returns {string} 包含 Emoji 的 SVG Data URL，如果 Unicode 无效则为空 SVG。
 */
export function formatEmojiSvgDataUrl(emojiUnicode, options = {}) {
    let emojiChar = '';
    try {
        // String.fromCodePoint 可以处理辅助平面字符
        emojiChar = String.fromCodePoint(parseInt(emojiUnicode, 16));
    } catch (e) {
        console.error(`Invalid emoji unicode point: ${emojiUnicode}`, e);
        // 返回一个空 SVG 或默认图标？这里返回空
        return formatEmptySvgDataUrl(options);
    }
    // 为 Emoji 设置一个较大的默认字体大小
    const emojiOptions = { fontSize: 48, ...options };
    return formatTextSvgDataUrl(emojiChar, emojiOptions);
} 