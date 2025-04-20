/**
 * feature目录集中导出文件
 * 
 * 提供功能特性层次的统一导出接口,便于其他模块引入使用
 * 推荐直接导入所需的特定工具函数,而不是整个模块
 */

// forAssets 资产管理工具
export * from './forAssets/forTags.js';
export * from './forAssets/forAssetInfo.js';

// forCodeAnalysis 代码分析工具
export * from './forCodeAnalysis/jsParser.js';

// forColors 颜色处理工具
export * from './forColors/useSimilarityExports.js';

// forFileSystem 文件系统工具
export * from './forFileSystem/diskTools.js';

// forGoLang Go语言相关工具
export * from './forGoLang/index.js';

// forIndex 索引工具
export * from './forIndex/usePartitionedHNSW.js';

// logViewer 日志查看工具
export * from './logViewer/index.js';

// useChat 聊天功能工具
export * from './useChat/forMessageCreation.js';
export * from './useChat/forMessageFormatting.js';
export * from './useChat/forStreamProcessing.js';

// useDataStruct 数据结构工具
export * from './useDataStruct/index.js';

// useImage 图像处理工具
export * from './useImage/imageToolBox.js';
export * from './useImage/forColorAnalysis.js';
export * from './useImage/computePerceptualHash.js';
export * from './useImage/computeSimpleHash.js';
export * from './useImage/forImageManipulation.js';

// useKonva Konva绘图工具
export * from './useKonva/index.js';

// useOpenAI OpenAI相关工具
export * from './useOpenAI/index.js';

// useStateMachine 状态机工具
export * from './useStateMachine/index.js';

// useSvg SVG处理工具
export * from './useSvg/index.js';

// useSyncedstore 同步存储工具
export * from './useSyncedstore/index.js';

// useUI UI工具
export * from './useUI/index.js';
export * from './forUI/colorPicker.js';

// useBrowser (Assuming this category is suitable, or create a new one)
export * from './useBrowser/domToImage.js';

// forLibs (New category for library-specific helpers)
export * from './forLibs/echartsLoader.js';

// forCodeHighlighting (New category)
export * from './forCodeHighlighting/writeHighlightedCodeToIframe.js';

// useDOMEvents (New category for complex DOM event handling)
export * from './useDOMEvents/combinedContinuousEvents.js';

// useVue Vue框架工具
export * from './useVue/vueExports.js';
export * from './useVue/vueComponentLoader.js';
export * from './useVue/dialogTools.js';

// forVectorEmbedding 向量嵌入工具
export * from './forVectorEmbedding/forQuery.js';
export * from './forVectorEmbedding/forSimilarity.js';
export * from './forVectorEmbedding/useDeltaPQHNSW/useCustomedHNSW.js';
export * from './forVectorEmbedding/useDeltaPQHNSW/useCustomedDeltaPQ.js';
export * from './forVectorEmbedding/useDeltaPQHNSW/useCombinedDeltaPQHNSW.js'; 