/**
 * 通用对话框打开辅助函数
 *
 * @module dialogUtils
 */

// 注意：这里的导入路径需要根据实际项目结构调整
// 特别是 openDialog 和 assetGalleryPanel.vue 的路径，它们不应该直接依赖 source/ 或具体 UI 组件
// TODO: 重构 openDialog 的调用，改为依赖 getDialogInterface
// TODO: 重构组件路径，改为通过参数传入或配置获取
// import { openDialog } from '../../../../source/UI/siyuanCommon/dialog/vueDialog.js'; // 移除旧的、不应使用的导入
import { 检查思源环境 } from '/plugins/SACAssetsManager/src/toolBox/useAge/useSiyuan.js';
import { insertDialogSelectionIntoProtyle } from '/plugins/SACAssetsManager/src/toolBox/useAge/forSiyuan/protyleUtils.js';
import { listLocalDisks, createDiskSelectionPanelHTML } from '/plugins/SACAssetsManager/src/toolBox/feature/forFileSystem/diskTools.js';
import { getDialogInterface } from '/plugins/SACAssetsManager/src/toolBox/feature/interfaces/dialogInterfaces.js'; // 修正路径

/**
 * 使用 API 服务地址配置打开资产浏览对话框
 *
 * @function showApiAssetGallery
 * @param {Object} protyle - Protyle 编辑器实例
 * @param {string} apiType - API 类型 (如 'everything', 'anytxt')
 * @param {string} title - 对话框标题
 * @param {Object} pluginInstance - 插件实例 (用于获取服务地址和名称)
 * @param {string} componentPath - 要加载的 Vue 组件路径 (需要外部传入)
 */
export function showApiAssetGallery(protyle, apiType, title, pluginInstance, componentPath) {
    检查思源环境();

    // TODO: 下面的状态获取逻辑应该移到插件主逻辑或专门的状态管理模块中
    const 状态注册表 = window.siyuan?.ws?.app?.plugins?.find(p => p.name === pluginInstance.name)?.data?.状态注册表;
    if (!状态注册表) {
        console.error('无法获取状态注册表');
        return;
    }
    const getStatu = (key) => {
        return window.siyuan?.ws?.app?.plugins?.find(p => p.name === pluginInstance.name)?.data?.[key];
    };
    const port = getStatu(状态注册表.本地文件搜索接口).find(item => item.type === apiType).port;

    const data = {
        [`${apiType}ApiLocation`]: `http://localhost:${port}`,
        ui: {
            size: '64' // TODO: UI 配置也应外部传入
        }
    };

    // TODO: 替换为 getDialogInterface().custom() 调用
    const { app, dialog } = openDialog(
        componentPath, // 使用传入的组件路径
        title,
        {},
        '',
        data,
        title,
        '200px', 'auto', false // TODO: 对话框参数应外部传入
    );

    // 设置销毁回调
    dialog.destroyCallback = () => insertDialogSelectionIntoProtyle(data, protyle);
}

/**
 * 使用本地文件系统路径打开资产浏览对话框
 *
 * @function showLocalAssetGallery
 * @param {Object} protyle - Protyle 编辑器实例
 * @param {string} path - 本地文件路径
 * @param {Object} pluginInstance - 插件实例 (目前未使用，但保留可能需要)
 * @param {string} componentPath - 要加载的 Vue 组件路径 (需要外部传入)
 */
export function showLocalAssetGallery(protyle, path, pluginInstance, componentPath) {
    检查思源环境();

    if (path === "选择磁盘") { // 特殊情况：触发磁盘选择
        showDiskSelectionDialog(protyle, pluginInstance);
        return;
    }

    const data = {
        localPath: path,
        ui: {
            size: '64' // TODO: UI 配置也应外部传入
        }
    };

    // TODO: 替换为 getDialogInterface().custom() 调用
    const { app, dialog } = openDialog(
        componentPath, // 使用传入的组件路径
        `sacFile`, // TODO: title 应外部传入
        {},
        '',
        data,
        `搜索文件夹:${path}`, // TODO: title 应外部传入
        '200px', 'auto', false // TODO: 对话框参数应外部传入
    );

    dialog.destroyCallback = () => insertDialogSelectionIntoProtyle(data, protyle);
}

/**
 * 打开磁盘选择对话框
 *
 * @function showDiskSelectionDialog
 * @param {Object} protyle - Protyle 编辑器实例
 * @param {Object} pluginInstance - 插件实例
 */
export function showDiskSelectionDialog(protyle, pluginInstance) {
    // 检查思源环境和 API
    检查思源环境();
    if (!window.siyuan?.clientApi) {
        console.error('无法获取客户端API');
        return;
    }

    listLocalDisks().then(disks => {
        const diskSelectionContent = createDiskSelectionPanelHTML(disks);
        const dialogInterface = getDialogInterface();

        const dialog = dialogInterface.custom({
            type: 'custom',
            title: "选择磁盘", // TODO: 使用 i18n
            message: diskSelectionContent,
            width: '320px', // TODO: 可配置
            height: 'auto',
            transparent: false
        });

        // TODO: 这部分 DOM 操作和事件监听应该封装到 createDiskSelectionPanelHTML 或其返回的对象中
        const diskList = dialog.element.querySelector("#diskList");
        const diskItems = diskList.querySelectorAll(".disk-item");

        diskItems.forEach(item => {
            item.addEventListener('mouseover', () => {
                item.style.backgroundColor = '#e0e0e0'; // TODO: 使用 CSS class
            });
            item.addEventListener('mouseout', () => {
                item.style.backgroundColor = ''; // TODO: 使用 CSS class
            });
            item.addEventListener('click', () => {
                const diskPath = item.getAttribute('data-path');
                // 注意：这里硬编码了 assetGalleryPanel.vue 的路径，需要修改
                // 理想情况下，点击磁盘后的行为也应由调用方决定
                const assetGalleryComponentPath = `/plugins/${pluginInstance.name}/source/UI/components/assetGalleryPanel.vue`; // TODO: 移除硬编码
                showLocalAssetGallery(protyle, diskPath, pluginInstance, assetGalleryComponentPath);
                dialog.destroy();
            });
        });

        // TODO: 这部分样式修改也应该通过 CSS 或组件内部逻辑处理
        dialog.element.querySelector(".b3-dialog__close").style.display = 'none';
        dialog.element.querySelector(".b3-dialog__header").style.padding = '0px 24px';
        dialog.element.querySelector(".b3-dialog__header").insertAdjacentHTML('afterBegin', `<svg class="cc-dialog__close" style="position:absolute;top:2px;left:2px"><use xlink:href="#iconCloseRound"></use></svg>`);
        dialog.element.querySelector(".cc-dialog__close").addEventListener('click', () => { dialog.destroy(); });
    }).catch(error => {
        console.error("获取磁盘列表失败:", error);
        // 可以考虑显示一个错误提示对话框
    });
}

/**
 * 打开 Everything 搜索对话框的快捷方式
 *
 * @function showEverythingDialog
 * @param {Object} protyle - Protyle 编辑器实例
 * @param {Object} pluginInstance - 插件实例
 */
export function showEverythingDialog(protyle, pluginInstance) {
    // TODO: 需要传入 componentPath
    const componentPath = `/plugins/${pluginInstance.name}/source/UI/components/assetGalleryPanel.vue`; // 临时硬编码
    showApiAssetGallery(protyle, 'everything', 'Everything 搜索', pluginInstance, componentPath);
}

/**
 * 打开 Anytxt 搜索对话框的快捷方式
 *
 * @function showAnytxtDialog
 * @param {Object} protyle - Protyle 编辑器实例
 * @param {Object} pluginInstance - 插件实例
 */
export function showAnytxtDialog(protyle, pluginInstance) {
    // TODO: 需要传入 componentPath
    const componentPath = `/plugins/${pluginInstance.name}/source/UI/components/assetGalleryPanel.vue`; // 临时硬编码
    showApiAssetGallery(protyle, 'anytxt', 'Anytxt 搜索', pluginInstance, componentPath);
} 