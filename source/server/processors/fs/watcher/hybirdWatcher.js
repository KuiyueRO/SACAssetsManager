//@AI 这里的依赖引入应该抽离到useDeps,当然这种也可以不处理,不过这样的话你就需要整理一下例外规则,
//另外我们使用globalthis.require或者直接相对路径引入来引入node环境的依赖,所有使用了require的地方都要检查环境,没有node环境就报错
//我们经常在electron环境下工作而且拒斥构建流程,所以import和require的引入方式可能都是必须的,视情况而定
// import * as parcelWatcher from '@parcel/watcher'; // 直接导入，待移除
import * as parcelWatcher from '../../../../../../src/toolBox/base/deps/npm/parcelWatcher.js'; // 通过 deps 导入
import { listLocalDisks } from '../disk/diskInfo.js';
// import { debounce } from 'lodash'; // 移除 lodash 依赖
import { debounce } from '../../../../../../src/toolBox/base/useEcma/forFunctions/forDebounce.js'; // 使用 toolBox 的 debounce

export class HybridWatcher {
    constructor() {
        this.watchers = new Map();
        this.subscriptions = new Set();
        this.watchOptions = {
            ignore: ['.git', 'node_modules', '.*', '**/.sac/**'],
        };
    }

    async initialize() {
        const disks = await listLocalDisks();
        
        for (const disk of disks) {
            if (disk.isLocal) {
                // 本地磁盘使用 parcel watcher
                await this.setupParcelWatcher(disk.mountPoint);
            } else {
                // 网络共享磁盘使用轮询方式
                await this.setupPollingWatcher(disk.mountPoint);
            }
        }
    }

    async setupParcelWatcher(path) {
        try {
            const watcher = await parcelWatcher.subscribe(
                path,
                this.watchOptions,
                (err, events) => {
                    if (err) {
                        console.error(`监听错误 ${path}:`, err);
                        return;
                    }
                    this.notifySubscribers(events);
                }
            );
            this.watchers.set(path, { type: 'parcel', watcher });
        } catch (err) {
            console.error(`无法为 ${path} 创建 parcel watcher:`, err);
        }
    }

    async setupPollingWatcher(path) {
        // 对网络共享磁盘使用轮询
        const pollInterval = 5000; // 5秒轮询
        const poll = debounce(async () => {
            // 实现轮询逻辑
            // TODO: 实现文件状态比对
        }, pollInterval);

        this.watchers.set(path, { type: 'polling', poll });
        poll();
    }

    subscribe(callback) {
        this.subscriptions.add(callback);
        return () => this.subscriptions.delete(callback);
    }

    notifySubscribers(events) {
        for (const callback of this.subscriptions) {
            callback(events);
        }
    }

    async close() {
        for (const [path, watcher] of this.watchers) {
            if (watcher.type === 'parcel') {
                await watcher.watcher.unsubscribe();
            }
        }
        this.watchers.clear();
        this.subscriptions.clear();
    }
}
