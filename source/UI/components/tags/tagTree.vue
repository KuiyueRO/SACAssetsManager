<template>
    <DockSubPanelTitle :data="data" />
    <div class="fn__flex-1" style="margin-bottom: 8px;max-height: 30vh;" v-if="!data.foldUp">
        <div class="fn__flex-column fn__flex-1 file_tree_container" >
            <TagItem  v-for="tag in data.tags" @delete:tag="deleteTag" :key="tag.label" :tag="tag" @update:tag="updateTag" />
        </div>
    </div>
</template>
<script setup>
import { onMounted, ref,onUnmounted ,nextTick} from 'vue';
import { kernelApi, plugin,clientApi } from '../../../asyncModules.js';
import TagItem from './tagItem.vue'
import DockSubPanelTitle from '../../../../src/shared/ui/sacUI-vue/components/common/dockSubPanelTitle.vue'
import {getTagAssets,saveTags} from '../../../data/tags.js'
const data = ref({
    title:'标签',
    icon:'#iconTags',
    titleActions:[
        {
            label:'刷新',
            icon:'#iconRefresh',
            click:()=>{
                data.value.tags=[]
                nextTick(async()=>{
                    data.value.tags = await getTagAssets(await kernelApi.getTag({ sort: 0 }))
                })
            }
        },
        {
            label:'最小化',
            icon:'#iconRight',
            click(event,self){
                self.icon =  data.value.foldUp?'#iconRight':'#iconUp'
                data.value.foldUp=!data.value.foldUp
            }
        }
    ],
    foldUp:true,
    tags:[]
})
const updateTag=(tag)=>{
    data.value.tags.find(item=>item.label===tag.label).assets=tag.assets
    saveTags(data.value.tags)
    plugin.eventBus.emit('update-tag',tag)

}
const deleteTag=(tag)=>{
    if(tag.assets.length){
        clientApi.confirm('确认删除标签',`标签下仍有${tag.assets.length}个资源，确认删除吗？`,()=>{
            data.value.tags=data.value.tags.filter(item=>item.label!==tag.label)
            saveTags(data.value.tags)
        })
    }else{
        data.value.tags=data.value.tags.filter(item=>item.label!==tag.label)
        saveTags(data.value.tags)
    }
}
let autoRefreshFlag=false
let intervalId
onUnmounted(
    ()=>{
        clearInterval(intervalId)
    }
)
onMounted(async () => {
    data.value.tags = await getTagAssets(await kernelApi.getTag({ sort: 0 }))
    plugin.eventBus.on('ws-main', async (e) => {
        if (e.detail.cmd === 'transactions') {
            const data = e.detail.data
            const { doOperations, undoOperations } = data[0];
            (doOperations || []).concat(undoOperations || []).forEach(async (operation) => {
                if (operation.data &&operation.data.indexOf&& operation.data.indexOf('<span data-type="tag">') > -1) {
                    autoRefreshFlag = true
                }
            });
        }
    })
    intervalId = setInterval(async()=>{
        if(autoRefreshFlag){
            data.value.tags = await getTagAssets(await kernelApi.getTag({ sort: 0 }))
            autoRefreshFlag = false
        }
    },1000)
})
</script>