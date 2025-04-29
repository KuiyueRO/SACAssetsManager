import { px, per, em } from "../../../../src/toolBox/base/useCss/formatCssUnit.js"
import { display, textOverflow, overflow, position, whiteSpace } from "../../../../src/toolBox/base/useCss/cssKeywords.js"
import { cssVarProxy } from "../../../../src/toolBox/base/useCss/forCssVar.js"
import { createChainableProxy } from "../../../../src/toolBox/base/useEcma/forObject/createChainableProxy.js"
import { LAYOUT_ROW, getDisplayModeBySize, 表格视图阈值 } from "../../utils/layoutConstants.js"
import { computeMaxWidthStyleBySize } from "../../utils/layoutConstants.js"

const 根据尺寸计算圆角 = (size) => {
    if (size > 表格视图阈值) {
        return size / 24
    } else {
        return 0
    }
}

const genMaxWidth = (size) => {
    return size > 表格视图阈值 ? px(size) : per(100)
}
export const 计算素材缩略图样式 = (size, imageHeight) => {
    let style = {}
    if (size > 表格视图阈值) {
        style.width = per(100)
    } else {
        style.width = px(size)
    }
    style.minWidth = style.width
    style.border = 'none'
    let borderRadius = px(根据尺寸计算圆角(size))
    style.borderRadius = `${borderRadius} ${borderRadius} 0 0`
   // style.height = size > 表格视图阈值 ? imageHeight || px(size) : px(size)
   style.height='auto'
    return style
}
export const 计算素材详情容器样式 = (size, cardData) => {
    let style = {}
    //style.position = size > 表格视图阈值 ? position.absolute : position.relative
    style.bottom = 0
    style.whiteSpace = whiteSpace.nowrap
    style.overflow = overflow.hidden
    style.width = size > 表格视图阈值 ? per(100) : ''
    style.textOverflow = textOverflow.ellipsis
    style.height = size > 表格视图阈值 ? px(36) : px(size)
    style.display = size < 表格视图阈值 ? display.flex : display.block
    style.flex = 1
    style.backgroundColor = !cardData.selected ? "transparent" : cssVarProxy.b3.theme.primary()
    return style
}
export const 计算素材颜色按钮样式 = (color) => {
    return createChainableProxy({})
        .backgroundColor(`rgb(${color[0]},${color[1]},${color[2]})`)
        .height(em(0.8))
        .width(em(0.8))
        .display(display.inlineBlock)
        .margin('0 2px')
        .$raw;
}


export const 计算文件格式标签样式 = (size, cardData) => {
    if (!cardData) return {};
    return createChainableProxy({})
        .position(size > 表格视图阈值 ? position.absolute : position.relative)
        .top(px(cardData.width / 24))
        .left(px(cardData.width / 24))
        .maxWidth(genMaxWidth(size))
        .maxHeight(em(1.5))
        .borderRadius(px(5))
        .backgroundColor(cssVarProxy.b3.theme.background())
        .whiteSpace(whiteSpace.nowrap)
        .overflow(overflow.hidden)
        .textOverflow(textOverflow.ellipsis)
        .height(px(36))
        .$raw;
}

export const 计算卡片内容主体样式 = (cardData, size, firstColorString, cardHeight) => {
    if (!cardData) return {};

    return createChainableProxy({})
        .width(per(表格视图阈值))
        .border('none')
        .borderRadius(px(cardData.width / 24))
        .height(size < 表格视图阈值 ? px(size) : px(cardHeight))
        .backgroundColor(firstColorString)
        .display(size < 表格视图阈值 ? display.flex : display.inlineBlock)
        .$raw;
}
export const 计算扩展名标签样式 = (displayMode, cardData, size) => {
    let positionStyle = 'position: absolute;'; // 默认为绝对定位 (Row 模式)
    let offsetStyle = `top: ${cardData.width / 24}px; left: ${cardData.width / 24}px;`; // 默认偏移
    let flexStyle = ''; // Row 模式下不需要 flex:1

    if (displayMode !== LAYOUT_ROW) { // 如果不是行模式 (Column 或 Table)
        positionStyle = 'position: relative;'; // 改为相对定位
        offsetStyle = 'top: 0; left: 0;'; // 相对定位下，通常不需要额外偏移，或者使用 margin
        flexStyle = 'flex: 1;'; // Column 模式下可能需要 flex
        // 考虑是否需要 margin 替代 top/left? margin: ${cardData.width / 24}px; ?
    }

    return `
    ${positionStyle}
    ${offsetStyle}
    max-width: ${computeMaxWidthStyleBySize(size)};
    max-height: 1.5em;
    border-radius: 5px;
    background-color:var(--b3-theme-background);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;height:36px;
    ${flexStyle}
    `
}

/**
 * 用于计算属性相关的一些数值
 */
