/**
 * @fileoverview Utility functions specifically for loading ECharts and ECharts-GL scripts.
 */

import { addScript, addScriptSync } from '../../base/useBrowser/useDOM/useScripts.js';
import { echartsPath, echartsGLPath } from '../../useAge/forSiyuan/useSiyuanPaths/useStage.js'; // Assuming correct path

/**
 * Asynchronously loads ECharts and ECharts-GL scripts if they haven't been loaded yet.
 * Uses unique IDs to prevent duplicate loading.
 * @returns {Promise<void[]>} A promise that resolves when both scripts are loaded (or resolved immediately if already loaded).
 */
export const loadEchartsAsync = async () => {
    // Consider adding checks here to see if echarts/echarts-gl objects already exist globally
    // to avoid redundant loading attempts.
    return Promise.all([
        addScript(echartsPath, "protyleEchartsScript"),
        addScript(echartsGLPath, "protyleEchartsGLScript")
    ]);
};

/**
 * Synchronously attempts to load ECharts and ECharts-GL scripts.
 * Note: Synchronous script loading can block the main thread and is generally discouraged.
 * Use the asynchronous version (`loadEchartsAsync`) whenever possible.
 * Uses unique IDs to prevent duplicate loading.
 */
export const loadEchartsSync = () => {
    // Consider adding checks here too.
    addScriptSync(echartsPath, "protyleEchartsScript");
    addScriptSync(echartsGLPath, "protyleEchartsGLScript");
}; 