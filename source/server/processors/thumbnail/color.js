import { computeKMeansClustersEuclidean as 欧几里得聚类 } from '../../../../toolBox/feature/forColor/useColorClustering.js'
// import { 欧几里得聚类, CIEDE2000聚类 } from '../../../../src/utils/color/Kmeans.js'
import { 找到文件颜色, 添加到颜色索引 } from '../color/colorIndex.js'
import { awaitForEach } from '../../../../src/toolBox/base/baseExports.js'
import { 缩放图像到32 } from './utils/sharp.js'
import { isImageDataBufferLike, getBufferFromImageDataLike } from '../../../../src/toolBox/base/baseExports.js'
/**
 * 获取图像的主色调
 * @param {Object} buffer - 图像的缓冲区对象
 * @param {string} filePath - 图像文件的路径
 * @returns {Promise<Array>} 返回主色调数组
 */
export async function getColor(buffer, filePath) {
    if (!isImageDataBufferLike(buffer)) {
        console.warn(`Invalid buffer provided for getColor: ${filePath}`);
        return []
    }
    const actualBuffer = getBufferFromImageDataLike(buffer)
    if (!actualBuffer) {
        console.warn(`Could not extract buffer data for getColor: ${filePath}`);
        return []
    }
    let finded = await 找到文件颜色(filePath)
    if (finded) {
        console.log('颜色缓存命中')
        return finded
    }
    let rgba = await 缩放图像到32(actualBuffer)
    if (!rgba) return []
    try {
        let colors = await processColors(rgba, filePath)
        return colors
    } catch (e) {
        console.warn(e)
        return []
    }
}


/**
 * 处理颜色数据
 * @param {Buffer} rgba - 图像的RGBA缓冲区
 * @param {string} filePath - 图像文件的路径
 * @returns {Promise<Array>} 处理后的颜色数组
 */
async function processColors(rgba, filePath) {
    let dominantColors = 欧几里得聚类(rgba, 5)
    console.log(dominantColors)
    let colors = dominantColors.centers
        .map(center => ({
            ...center,
            color: center.color.map(Math.floor)
        }))
        .filter(item => item.percent > 0.05)
    await awaitForEach(colors, async (colorItem) => {
        await 添加到颜色索引(colorItem, filePath)
    })
    let finded = await 找到文件颜色(filePath)
    console.log(colors, finded)
    return finded
}

