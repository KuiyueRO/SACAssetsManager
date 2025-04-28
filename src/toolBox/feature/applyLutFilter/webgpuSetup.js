/**
 * @fileoverview 初始化 WebGPU 设备和上下文。
 * @module webgpuSetup
 */

/**
 * 初始化 WebGPU。
 * 检查支持性，请求适配器和设备，并创建一个关联的 Canvas 上下文（尽管在此模块中 Canvas 可能不直接使用）。
 * @returns {Promise<{device: GPUDevice, context: GPUCanvasContext, canvas: HTMLCanvasElement}>} 包含 WebGPU 设备、上下文和关联 Canvas 的对象。
 * @throws {Error} 如果 WebGPU 不支持或无法获取适配器/设备。
 */
export async function initializeWebGPU() {
    // 检查浏览器是否支持 WebGPU
    if (!navigator.gpu) {
        throw new Error('当前环境不支持 WebGPU。');
    }
    
    // 请求 GPU 适配器 (物理 GPU 或软件模拟)
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        throw new Error('无法获取 WebGPU 适配器。请确保浏览器已启用 WebGPU 并且硬件兼容。');
    }
    
    // 请求逻辑设备，用于与 GPU 交互
    const device = await adapter.requestDevice();
    if (!device) {
         throw new Error('无法获取 WebGPU 设备。');
    }

    // 创建一个 Canvas 并获取 WebGPU 上下文 (即使不渲染到屏幕，某些操作也可能需要上下文)
    // 注意：如果只是进行计算，可能不需要创建 Canvas 和 Context。
    // 但为了通用性或潜在的未来扩展，这里保留了创建过程。
    // const canvas = new OffscreenCanvas(1, 1); // 或者使用 OffscreenCanvas 进行纯计算
    const canvas = document.createElement('canvas'); 
    const context = canvas.getContext('webgpu');

    if (!context) {
        // 如果获取不到上下文，也可能是环境问题
        console.warn("无法获取 WebGPU Canvas 上下文，某些功能可能受限。");
        // 即使没有 context，仍然返回 device
        return { device, context: null, canvas };
    }
    
    // 配置上下文的格式等
    context.configure({
        device: device,
        format: navigator.gpu.getPreferredCanvasFormat(), // 获取浏览器推荐的画布格式
        alphaMode: 'premultiplied', // 通常用于与 DOM 集成
    });

    return { device, context, canvas };
} 