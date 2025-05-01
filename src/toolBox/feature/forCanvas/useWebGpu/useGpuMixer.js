import { requireWGSLCode } from '../../forWebGPU/useWGSLProcessor/index.js'; // Corrected path
const adapter = await navigator.gpu.requestAdapter();
// 请求设备时设置限制
const device = await adapter.requestDevice({
    requiredLimits: {
        maxBufferSize: 256 * 1024 * 1024, // 256MB
        maxStorageBufferBindingSize: 128 * 1024 * 1024, // 128MB
    }
});
// Load WGSL code relative to this file
const wgsl = await requireWGSLCode(import.meta.resolve('./mixer.wgsl')) 
class TextureManager {
    constructor() {
        this.device = device;
        this.textureCache = new Map();
        this.maxCacheSize = 100; // 可根据需要调整缓存大小
    }

    // 创建纹理
    createTexture(width, height, options = {}) {
        const {
            format = 'rgba8unorm',
            usage = GPUTextureUsage.TEXTURE_BINDING | 
                    GPUTextureUsage.COPY_DST | 
                    GPUTextureUsage.RENDER_ATTACHMENT,
            label = ''
        } = options;

        return this.device.createTexture({
            size: { width, height, depthOrArrayLayers: 1 },
            format,
            usage,
            label
        });
    }

    // 从 ImageData 创建纹理
    async createTextureFromImageData(imageData, options = {}) {
        const { width, height } = imageData;
        const texture = this.createTexture(width, height, options);

        this.device.queue.writeTexture(
            { texture },
            imageData.data,
            { bytesPerRow: width * 4 },
            { width, height }
        );

        return texture;
    }

    // 从 Canvas/Image/ImageBitmap 创建纹理
    async createTextureFromImage(source, options = {}) {
        const texture = this.createTexture(
            source.width,
            source.height,
            options
        );

        this.device.queue.copyExternalImageToTexture(
            { source },
            { texture },
            { width: source.width, height: source.height }
        );

        return texture;
    }

    // 清理纹理
    destroyTexture(texture) {
        if (texture) {
            texture.destroy();
        }
    }
}

// 在 WebGPUMixer 类的开始添加 BufferPool 类
class BufferPool {
    constructor(device, maxSize = 10) {
        this.device = device;
        this.pools = new Map();
        this.maxSize = maxSize;
    }

    getBuffer(size, usage) {
        const key = `${size}_${usage}`;
        if (!this.pools.has(key)) {
            this.pools.set(key, []);
        }
        const pool = this.pools.get(key);
        if (pool.length > 0) {
            const buffer = pool.pop();
            // 如果是需要映射的缓冲区，确保它处于映射状态
            if (usage & GPUBufferUsage.MAP_WRITE) {
                return this.device.createBuffer({
                    size,
                    usage,
                    mappedAtCreation: true
                });
            }
            return buffer;
        }
        return this.createBuffer(size, usage);
    }

    returnBuffer(buffer) {
        // 如果缓冲区是可映射的，我们不重用它
        if (buffer.usage & GPUBufferUsage.MAP_WRITE) {
            buffer.destroy();
            return;
        }

        const key = `${buffer.size}_${buffer.usage}`;
        const pool = this.pools.get(key) || [];
        if (pool.length < this.maxSize) {
            pool.push(buffer);
            this.pools.set(key, pool);
        } else {
            buffer.destroy();
        }
    }

    createBuffer(size, usage) {
        return this.device.createBuffer({
            size,
            usage,
            // 如果是需要映射的缓冲区，创建时就进行映射
            mappedAtCreation: !!(usage & GPUBufferUsage.MAP_WRITE)
        });
    }

    clear() {
        for (const pool of this.pools.values()) {
            pool.forEach(buffer => buffer.destroy());
        }
        this.pools.clear();
    }
}

export class WebGPUMixer {
    constructor() {
        this.device = device;
        this.pipeline = null;
        this.bindGroupLayout = null;
        this.sampler = null;
        this.initialized = false;
        this.paramsBuffer = null;

        // 添加资源池
        this.texturePool = new Map();
        this.bufferPool = null; // 将在 init 方法中初始化

        // 初始化离屏canvas
        this.offscreenCanvas = new OffscreenCanvas(1, 1);
        this.offscreenCtx = this.offscreenCanvas.getContext('2d', {
            willReadFrequently: true
        });

        // 预分配固定大小的缓冲区
        this.stagingBuffer = null;
        this.maxTextureSize = 2048; // 最大纹理尺寸
        this.initStagingBuffer();

        // 添加 WebGPU canvas 和 context
        this.gpuCanvas = new OffscreenCanvas(1, 1);
        this.gpuContext = null;

        // 添加新的参数
        this.pigmentParams = {
            scatteringCoeff: 10.0,
            thicknessScale: 1.5,
            alphaExponent: 1.8,
            ditherStrength: 0.02,
            maxOpacity: 0.1,
            canvasWeight: 0.3,
            viscosity: 0.7,    // 新增: 稠度参数 (0-1)
            dragStrength: 0.4  // 新增: 拖动强度
        
        };

        this.paramUpdateQueue = Promise.resolve(); // 添加参数更新队列
        this.textureCache = new Map(); // 添加纹理缓存
        this.pendingOperations = Promise.resolve(); // 添加操作队列


    }

    initStagingBuffer() {
        const maxSize = this.maxTextureSize * this.maxTextureSize * 4;
        const alignedSize = Math.ceil(maxSize / 256) * 256;

        this.stagingBuffer = this.device.createBuffer({
            size: alignedSize,
            usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.MAP_WRITE,
            mappedAtCreation: true
        });
    }

    async init() {
        if (!navigator.gpu) {
            throw new Error('WebGPU not supported');
        }

        try {
            // 初始化 WebGPU context
            this.textureManager = new TextureManager();

            this.gpuContext = this.gpuCanvas.getContext('webgpu');
            if (!this.gpuContext) {
                throw new Error('Failed to get WebGPU context');
            }

            // 配置 context
            this.gpuContext.configure({
                device: this.device,
                format: 'bgra8unorm',
                usage: GPUTextureUsage.RENDER_ATTACHMENT |
                    GPUTextureUsage.COPY_SRC |
                    GPUTextureUsage.COPY_DST,
                alphaMode: 'premultiplied'
            });

            if (!adapter) {
                throw new Error('No adapter found');
            }


            // 创建采样器
            this.sampler = this.device.createSampler({
                magFilter: 'linear',
                minFilter: 'linear',
                mipmapFilter: 'linear',
            });
            const shader = this.device.createShaderModule({code:wgsl})
            // 首先创建绑定组布局
            this.bindGroupLayout = this.device.createBindGroupLayout({
                entries: [
                    {
                        binding: 0,
                        visibility: GPUShaderStage.FRAGMENT,
                        texture: { sampleType: 'float' }
                    },
                    {
                        binding: 1,
                        visibility: GPUShaderStage.FRAGMENT,
                        texture: { sampleType: 'float' }
                    },
                    {
                        binding: 2,
                        visibility: GPUShaderStage.FRAGMENT,
                        sampler: { type: 'filtering' }
                    },
                    {
                        binding: 3, // 用于混合参数
                        visibility: GPUShaderStage.FRAGMENT,
                        buffer: { type: 'uniform' }
                    },
                    {
                        binding: 4, // 用于画布纹理
                        visibility: GPUShaderStage.FRAGMENT,
                        texture: { sampleType: 'float' }
                    }
                ]
            });
        
            // 创建渲染管线布局
            const layout = this.device.createPipelineLayout({
                bindGroupLayouts: [this.bindGroupLayout]
            });
        
            // 创建渲染管线
            this.pipeline = this.device.createRenderPipeline({
                layout: layout,
                vertex: {
                    module: shader,
                    entryPoint: 'vertex_main',
                },
                fragment: {
                    module: shader,
                    entryPoint: 'fragment_main',
                    targets: [{ format: 'bgra8unorm' }],
                },
                primitive: {
                    topology: 'triangle-strip',
                },
            });
        
            // 初始化参数缓冲区
            this.paramsBuffer = this.device.createBuffer({
                size: 32, // Float32Array(8) => 8 * 4 bytes
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            });
            
            this.updateGPUParams(); // 首次更新 GPU 参数
        
            this.initialized = true;
            this.bufferPool = new BufferPool(this.device); // 初始化 BufferPool
            console.log('WebGPU Mixer initialized');
        
        } catch (error) {
            console.error('WebGPU initialization failed:', error);
            this.initialized = false;
            if (error.message.includes('requestDevice')) {
                await this.handleDeviceLost();
            }
        }
    }

    // 新增：更新 GPU 参数
    updateGPUParams() {
        const params = new Float32Array([
            this.pigmentParams.scatteringCoeff,
            this.pigmentParams.thicknessScale,
            this.pigmentParams.alphaExponent,
            this.pigmentParams.ditherStrength,
            this.pigmentParams.maxOpacity,
            this.pigmentParams.canvasWeight,
            this.pigmentParams.viscosity, 
            this.pigmentParams.dragStrength 
        ]);
        this.device.queue.writeBuffer(this.paramsBuffer, 0, params);
    }
    
    // 缓存纹理获取和创建
    getTextureFromPool(width, height) {
        const key = `${width}x${height}`;
        const pool = this.texturePool.get(key);
        if (pool && pool.length > 0) {
            return pool.pop();
        }
        return this.createNewTexture(width, height);
    }

    returnTextureToPool(texture, width, height) {
        const key = `${width}x${height}`;
        if (!this.texturePool.has(key)) {
            this.texturePool.set(key, []);
        }
        const pool = this.texturePool.get(key);
        if (pool.length < 10) { // Pool size limit
            pool.push(texture);
        } else {
            texture.destroy();
        }
    }

    createNewTexture(width, height) {
        return this.device.createTexture({
            size: { width, height, depthOrArrayLayers: 1 },
            format: 'bgra8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING |
                   GPUTextureUsage.COPY_DST |
                   GPUTextureUsage.RENDER_ATTACHMENT |
                   GPUTextureUsage.COPY_SRC, // 添加 COPY_SRC
        });
    }


    async mixColors(ctx, brushImage, x, y, width, height) {
        this.pendingOperations = this.pendingOperations.then(async () => {
            if (!this.initialized || !this.pipeline) return;

            try {
                // 确保画布大小至少为 1x1
                const effectiveWidth = Math.max(1, width);
                const effectiveHeight = Math.max(1, height);

                // 获取画布内容
                const canvasTexture = await this.textureManager.createTextureFromImage(ctx.canvas, {
                    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
                });

                // 准备笔刷纹理
                const brushTexture = await this.textureManager.createTextureFromImage(brushImage, {
                    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST
                });

                // 获取或创建目标纹理
                const targetTexture = this.getTextureFromPool(effectiveWidth, effectiveHeight);

                // 设置 GPU Canvas 大小
                if (this.gpuCanvas.width !== effectiveWidth || this.gpuCanvas.height !== effectiveHeight) {
                    this.gpuCanvas.width = effectiveWidth;
                    this.gpuCanvas.height = effectiveHeight;
                    // 需要重新配置 context 吗？可能不需要，但需确认
                }

                // 创建绑定组
                const bindGroup = this.device.createBindGroup({
                    layout: this.bindGroupLayout,
                    entries: [
                        { binding: 0, resource: brushTexture.createView() },
                        { binding: 1, resource: canvasTexture.createView() },
                        { binding: 2, resource: this.sampler },
                        { binding: 3, resource: { buffer: this.paramsBuffer } },
                        { binding: 4, resource: canvasTexture.createView() } // 绑定画布纹理
                    ],
                });

                // 开始渲染过程
                const commandEncoder = this.device.createCommandEncoder();
                const renderPassDescriptor = {
                    colorAttachments: [{
                        view: targetTexture.createView(),
                        loadOp: 'clear',
                        storeOp: 'store',
                        clearValue: { r: 0, g: 0, b: 0, a: 0 },
                    }],
                };
                const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
                passEncoder.setPipeline(this.pipeline);
                passEncoder.setBindGroup(0, bindGroup);
                passEncoder.draw(4, 1, 0, 0);
                passEncoder.end();

                // 将结果从目标纹理复制到 Staging Buffer
                const bytesPerRow = Math.ceil(effectiveWidth * 4 / 256) * 256;
                commandEncoder.copyTextureToBuffer(
                    { texture: targetTexture },
                    { buffer: this.stagingBuffer, bytesPerRow, rowsPerImage: effectiveHeight },
                    { width: effectiveWidth, height: effectiveHeight }
                );

                this.device.queue.submit([commandEncoder.finish()]);

                // 从 Staging Buffer 读取数据
                await this.stagingBuffer.mapAsync(GPUMapMode.READ);
                const resultData = new Uint8ClampedArray(this.stagingBuffer.getMappedRange());

                // 创建 ImageData
                const imageData = new ImageData(resultData, effectiveWidth, effectiveHeight);

                // 将结果绘制回原始 canvas
                this.offscreenCanvas.width = effectiveWidth;
                this.offscreenCanvas.height = effectiveHeight;
                this.offscreenCtx.putImageData(imageData, 0, 0);
                ctx.drawImage(this.offscreenCanvas, x, y);

                // 清理资源
                this.stagingBuffer.unmap();
                brushTexture.destroy();
                canvasTexture.destroy();
                this.returnTextureToPool(targetTexture, effectiveWidth, effectiveHeight);


            } catch (error) {
                console.error('Error during GPU mix operation:', error);
                // 尝试绘制原始笔刷作为后备
                ctx.drawImage(brushImage, x, y, width, height);
                if (error.message.includes('Lost') || error.message.includes('destroyed')) {
                    await this.handleDeviceLost();
                }
            }
        }).catch(error => {
            console.error("Error in pending operations queue:", error);
        });
    }

    async handleDeviceLost() {
        console.warn('WebGPU device lost. Attempting to reinitialize...');
        this.initialized = false;
        this.clearResources(); // 清理旧资源
        try {
            // 可能需要重新请求 adapter 和 device
            const newAdapter = await navigator.gpu.requestAdapter();
            if (!newAdapter) throw new Error('Failed to get new adapter');
            const newDevice = await newAdapter.requestDevice();
            // 更新 device 引用，并重新初始化
            this.device = newDevice;
            this.textureManager.device = newDevice; // 更新 TextureManager 的设备引用
            this.bufferPool = new BufferPool(newDevice); // 重新创建 BufferPool
            this.initStagingBuffer(); // 重新创建 Staging Buffer
            await this.init(); // 重新初始化 Mixer
            console.log('WebGPU device reinitialized successfully.');
        } catch (reinitError) {
            console.error('Failed to reinitialize WebGPU device:', reinitError);
            // 可能需要通知用户或禁用 GPU 功能
        }
    }

    clearResources() {
        // 销毁管线、布局、采样器等
        if (this.pipeline) this.pipeline = null; // Pipelines don't have destroy
        if (this.bindGroupLayout) this.bindGroupLayout = null; // Layouts don't have destroy
        if (this.sampler) this.sampler = null; // Samplers don't have destroy
        if (this.paramsBuffer) {
            this.paramsBuffer.destroy();
            this.paramsBuffer = null;
        }
        if (this.stagingBuffer) {
            // 如果在映射状态，先取消映射
            try {
                this.stagingBuffer.unmap();
            } catch (e) { /* 可能未映射 */ }
            this.stagingBuffer.destroy();
            this.stagingBuffer = null;
        }
        // 清理纹理池和缓冲区池
        if (this.texturePool) {
            this.texturePool.forEach(pool => pool.forEach(tex => tex.destroy()));
            this.texturePool.clear();
        }
        if (this.bufferPool) {
            this.bufferPool.clear();
            this.bufferPool = null;
        }
        if (this.textureManager) {
            // TextureManager 可能需要自己的清理逻辑
        }
        // 清理缓存
        this.textureCache.clear();
        // 重置初始化状态
        this.initialized = false;
    }

    destroy() {
        this.clearResources();
        // 可能还需要销毁 device，但这通常在应用退出时进行
        console.log('WebGPU Mixer destroyed');
    }

    // 辅助函数：从 ImageBitmap 创建纹理
    createTextureFromBitmap(bitmap) {
        const texture = this.device.createTexture({
            size: [bitmap.width, bitmap.height, 1],
            format: 'rgba8unorm',
            usage: GPUTextureUsage.TEXTURE_BINDING |
                   GPUTextureUsage.COPY_DST |
                   GPUTextureUsage.RENDER_ATTACHMENT,
        });
        this.device.queue.copyExternalImageToTexture(
            { source: bitmap },
            { texture: texture },
            [bitmap.width, bitmap.height]
        );
        return texture;
    }

    // 更新混合参数的方法
    async updateParams(params) {
        // 使用队列确保参数更新按顺序进行，并且在 GPU 空闲时写入
        this.paramUpdateQueue = this.paramUpdateQueue.then(async () => {
            Object.assign(this.pigmentParams, params);
            if (this.initialized && this.paramsBuffer) {
                this.updateGPUParams(); // 更新 GPU 缓冲区
            }
        }).catch(error => {
            console.error("Error updating GPU parameters:", error);
        });
        await this.paramUpdateQueue; // 等待更新完成
    }


    // 辅助函数
    smoothstep(edge0, edge1, x) {
        const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
        return t * t * (3 - 2 * t);
    }
    lerp(a, b, t) {
        return a + (b - a) * t;
    }
}
// 创建一个 Mixer 池
class MixerPool {
    constructor(poolSize = 3) { // 默认创建3个混合器
        this.mixers = [];
        this.poolSize = poolSize;
        this.currentMixerIndex = 0;
    }

    async initialize() {
        try {
            const initPromises = [];
            for (let i = 0; i < this.poolSize; i++) {
                const mixer = new WebGPUMixer();
                this.mixers.push(mixer);
                initPromises.push(mixer.init());
            }
            await Promise.all(initPromises);
            console.log(`Mixer pool initialized with ${this.mixers.length} mixers.`);
        } catch (error) {
            console.error("Failed to initialize mixer pool:", error);
            // 如果初始化失败，可能需要回退到 CPU 混合
            this.mixers = []; // 清空混合器
        }
    }

    // 获取下一个可用的混合器
    getNextMixer() {
        if (this.mixers.length === 0) return null; // 没有可用的混合器
        const mixer = this.mixers[this.currentMixerIndex];
        this.currentMixerIndex = (this.currentMixerIndex + 1) % this.mixers.length;
        return mixer;
    }

    // 使用池中的混合器进行混合
    async mixColors(ctx, brushImage, x, y, width, height) {
        const mixer = this.getNextMixer();
        if (mixer) {
            await mixer.mixColors(ctx, brushImage, x, y, width, height);
        } else {
            // 回退到 CPU 混合或直接绘制
            console.warn("No available GPU mixer, falling back to direct draw.");
            ctx.drawImage(brushImage, x, y, width, height);
        }
    }

    destroy() {
        this.mixers.forEach(mixer => mixer.destroy());
        this.mixers = [];
    }
}

// 单例代理，用于管理 MixerPool
class MixerProxy {
    constructor() {
        this.mixerPool = null;
        this.initializePool();
    }

    async initializePool() {
        const poolSize = this.determineOptimalPoolSize();
        this.mixerPool = new MixerPool(poolSize);
        await this.mixerPool.initialize();
    }

    determineOptimalPoolSize() {
        // 根据硬件并发或其他因素决定池大小，这里简单返回 3
        // const hardwareConcurrency = navigator.hardwareConcurrency || 4;
        // return Math.max(1, Math.min(hardwareConcurrency - 1, 4)); // 例如，最多 4 个
        return 3;
    }

    async mixColors(ctx, brushImage, x, y, width, height) {
        if (!this.mixerPool) {
            console.warn("Mixer pool not initialized, falling back.");
            ctx.drawImage(brushImage, x, y, width, height);
            return;
        }
        await this.mixerPool.mixColors(ctx, brushImage, x, y, width, height);
    }

    destroy() {
        if (this.mixerPool) {
            this.mixerPool.destroy();
            this.mixerPool = null;
        }
    }
}

// 导出一个 MixerProxy 的单例
export const mixer = new MixerProxy(); 