import { 打开本地资源视图 } from '../../siyuanCommon/tabs/assetsTab.js';
import { 清理重复元素 } from '../../../../src/toolBox/base/useEcma/forArray/computeArraySets.js';

export const 打开文件夹数组素材页签=(页签数组)=>{
    清理重复元素(页签数组.value).forEach(文件路径 => {
        if (文件路径 !== '/') {
          打开本地资源视图(文件路径);
        }
    });
}