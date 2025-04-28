import Konva from '../../../../../static/konva.js';

/**
 * 将画布导出为图片
 * @param {Object} options - 导出选项
 * @param {Object} stageRef - Stage引用
 * @param {Object} layerRefs - 图层引用对象，包含backgroundLayer, mainLayer, uiLayer等
 * @param {Object} viewState - 视图状态
 * @returns {String} 导出的图片数据URL
 */
export const exportCanvasAsImage = (options = {}, stageRef, layerRefs, viewState) => {
  const {
    pixelRatio = 2,
    mimeType = 'image/png',
    quality = 1
  } = options;

  if (!stageRef) {
    console.error('无法导出：舞台不存在');
    return null;
  }

  try {
    // 计算当前视口可见范围在屏幕上的尺寸
    const visibleWidth = viewState.width;
    const visibleHeight = viewState.height;

    // 创建临时复制的舞台，以避免改变原始舞台的状态
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.top = '-9999px';
    tempContainer.style.left = '-9999px';
    document.body.appendChild(tempContainer);

    // 创建临时舞台
    const tempStage = new Konva.Stage({
      container: tempContainer,
      width: visibleWidth * pixelRatio,
      height: visibleHeight * pixelRatio
    });

    // 创建背景层
    const tempBackgroundLayer = new Konva.Layer();
    tempStage.add(tempBackgroundLayer);

    // 添加白色背景矩形
    const background = new Konva.Rect({
      x: 0,
      y: 0,
      width: visibleWidth * pixelRatio,
      height: visibleHeight * pixelRatio,
      fill: 'white'
    });
    tempBackgroundLayer.add(background);

    // 创建内容层
    const tempContentLayer = new Konva.Layer();
    tempStage.add(tempContentLayer);

    // 复制各层的内容
    const allLayers = [
      layerRefs.backgroundLayer,
      layerRefs.mainLayer,
      layerRefs.uiLayer
    ].filter(layer => layer);

    for (const layerRef of allLayers) {
      // 获取原始图层
      const originalLayer = layerRef;
      
      // 确保图层存在
      if (!originalLayer) continue;
      
      // 更安全地获取子元素
      let children = [];
      try {
        if (typeof originalLayer.getChildren === 'function') {
          children = originalLayer.getChildren();
        } else if (originalLayer.children) {
          children = originalLayer.children;
        } else if (originalLayer.$children) {
          // Vue组件可能有$children属性
          children = originalLayer.$children;
        } else if (originalLayer.getNode && typeof originalLayer.getNode === 'function') {
          const node = originalLayer.getNode();
          if (node && typeof node.getChildren === 'function') {
            children = node.getChildren();
          }
        }
      } catch (e) {
        console.warn('获取图层子元素时出错:', e);
        continue;
      }

      // 确保children是数组
      if (!Array.isArray(children)) {
        console.warn('图层子元素不是数组');
        continue;
      }

      for (const child of children) {
        try {
          // 安全地克隆节点
          let clone;
          try {
            if (typeof child.clone === 'function') {
              clone = child.clone();
            } else {
              // 如果不能克隆，创建一个简单的矩形作为占位符
              console.warn('无法克隆节点，使用占位符');
              clone = new Konva.Rect({
                x: 0,
                y: 0,
                width: 10,
                height: 10,
                fill: 'rgba(0,0,0,0.2)'
              });
            }
          } catch (cloneErr) {
            console.warn('克隆节点失败:', cloneErr);
            continue;
          }

          // 安全地获取坐标
          let canvasX = 0, canvasY = 0;
          try {
            if (typeof child.x === 'function') {
              canvasX = child.x();
              canvasY = child.y();
            } else if (child.attrs && typeof child.attrs.x !== 'undefined') {
              canvasX = child.attrs.x;
              canvasY = child.attrs.y;
            } else if (typeof child.x !== 'undefined') {
              canvasX = child.x;
              canvasY = child.y;
            }
          } catch (posErr) {
            console.warn('获取节点位置失败:', posErr);
          }

          // 坐标转换
          const screenX = canvasX * viewState.scale + viewState.position.x;
          const screenY = canvasY * viewState.scale + viewState.position.y;

          // 安全地设置克隆对象的属性
          try {
            if (typeof clone.x === 'function') {
              clone.x(screenX * pixelRatio);
              clone.y(screenY * pixelRatio);
              
              // 设置缩放
              const scaleX = (typeof child.scaleX === 'function') ? child.scaleX() : 1;
              const scaleY = (typeof child.scaleY === 'function') ? child.scaleY() : 1;
              clone.scaleX(scaleX * viewState.scale * pixelRatio);
              clone.scaleY(scaleY * viewState.scale * pixelRatio);
              
              // 处理线宽
              if (clone.getClassName && clone.getClassName() === 'Line' && typeof clone.strokeWidth === 'function') {
                const strokeWidth = (typeof child.strokeWidth === 'function') ? child.strokeWidth() : 1;
                clone.strokeWidth((strokeWidth / viewState.scale) * pixelRatio);
              }
            } else {
              // 如果clone没有这些方法，直接设置属性
              clone.x = screenX * pixelRatio;
              clone.y = screenY * pixelRatio;
              
              clone.scaleX = (child.scaleX || 1) * viewState.scale * pixelRatio;
              clone.scaleY = (child.scaleY || 1) * viewState.scale * pixelRatio;
              
              if (clone.className === 'Line') {
                clone.strokeWidth = ((child.strokeWidth || 1) / viewState.scale) * pixelRatio;
              }
            }
          } catch (propErr) {
            console.warn('设置克隆节点属性失败:', propErr);
          }

          tempContentLayer.add(clone);
        } catch (nodeErr) {
          console.warn('处理节点时出错:', nodeErr);
        }
      }
    }

    // 绘制舞台
    tempStage.draw();

    // 使用toDataURL获取图像数据
    const dataURL = tempStage.toDataURL({
      mimeType,
      quality,
      pixelRatio: 1 // 已经应用了pixelRatio，不需要重复应用
    });

    // 清理临时元素
    tempStage.destroy();
    document.body.removeChild(tempContainer);

    return dataURL;
  } catch (error) {
    console.error('导出图片时出错:', error);
    return null;
  }
};

/**
 * 导出选定区域为图片
 * @param {Object} area - 要导出的区域信息
 * @param {Object} options - 导出选项
 * @param {Object} stageRef - Stage引用
 * @param {Object} layerRefs - 图层引用对象
 * @param {Object} viewState - 视图状态
 * @returns {String} 导出的图片数据URL
 */
export const exportSelectedArea = (area, options = {}, stageRef, layerRefs, viewState) => {
  return exportCanvasAsImage({
    x: area.x,
    y: area.y,
    width: area.width,
    height: area.height,
    ...options
  }, stageRef, layerRefs, viewState);
}; 