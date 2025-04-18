<template>
  <div class="task-dialog">
    <div class="progress-bar">
      <div class="progress" :style="{ width: progress + '%' }"></div>
    </div>
    <p>{{ taskDescription }}</p>
    <p>{{ currentMessage }}</p>
    <p>已完成: {{ completedTasks }} / {{ totalTasks }}</p>
    <div class="task-controls">
      <button @click="togglePause" :disabled="isCompleted">
        {{ isPaused ? '恢复' : '暂停' }}
      </button>
      <button @click="cancelTask" :disabled="isCompleted">
        {{ isCompleted ? '完成' : '取消任务' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, inject } from 'vue'

const appData = inject('appData')
const {
  taskTitle, taskDescription, taskController
} = appData

const progress = ref(0)
const completedTasks = ref(0)
const totalTasks = ref(0)
const currentMessage = ref('')
const isCompleted = computed(() => totalTasks.value > 0 && completedTasks.value === totalTasks.value)

const updateProgress = () => {
  progress.value = totalTasks.value > 0 ? (completedTasks.value / totalTasks.value) * 100 : 0;
}

const onTaskAdded = ({ totalTasks: newTotal }) => {
  totalTasks.value = newTotal
  updateProgress()
}
const isPaused = ref(false)

const togglePause = () => {
  isPaused.value = !isPaused.value
  if (isPaused.value) {
    taskController.pause()
  } else {
    taskController.resume()
  }
}

const cancelTask = () => {
  if (!isCompleted.value) {
    taskController.destroy()
  }
  appData.$dialog.destroy()
}

const onTaskCompleted = ({ completedTasks: completed, totalTasks: total, result }) => {
  completedTasks.value = completed
  totalTasks.value = total
  console.log(result)
  if (result && result.message) {
    currentMessage.value = result.message
  }
  updateProgress()
}

const onAllTasksCompleted = () => {
  updateProgress()
  currentMessage.value = '所有任务已完成！';
}


onMounted(() => {
  console.log('[Task.vue] onMounted: Attaching event listeners...');
  taskController.on('taskAdded', onTaskAdded)
  taskController.on('taskCompleted', onTaskCompleted)
  taskController.on('allTasksCompleted', onAllTasksCompleted)
  taskController.on('paused', () => isPaused.value = true)
  taskController.on('resumed', () => isPaused.value = false)
  
  taskController.on('destroy', () => {
      console.log('[Task.vue] TaskController destroyed, closing dialog.');
      appData.$dialog.destroy();
  });

  console.log('[Task.vue] onMounted: Event listeners attached.');
})

onUnmounted(() => {
  console.log('[Task.vue] onUnmounted: Removing event listeners...');
  taskController.off('taskAdded', onTaskAdded)
  taskController.off('taskCompleted', onTaskCompleted)
  taskController.off('allTasksCompleted', onAllTasksCompleted)
  taskController.off('paused')
  taskController.off('resumed')
  taskController.off('destroy')
  console.log('[Task.vue] onUnmounted: Event listeners removed.');
})

defineExpose({
  updateProgress
})
</script>

<style scoped>
.task-controls {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}
.progress-bar {
  width: 100%;
  background-color: #eee;
  height: 10px;
  margin-bottom: 10px;
}
.progress {
  height: 100%;
  background-color: #4caf50; /* Green */
  transition: width 0.2s ease-in-out;
}
</style>