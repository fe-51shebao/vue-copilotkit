<template>
  <div class="todo-item">
    <el-checkbox :model-value="todo.isCompleted" @change="toggleComplete(todo.id)">
      <span class="todo_task">Task{{ todo.sort }}</span>
      <span :class="{ 'completed': todo.isCompleted }" class="todo_text">{{ todo.text }}</span>
    </el-checkbox>
    <svg
      class="delete-icon"
      @click="deleteTodo(todo.id)"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="black"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

const props = defineProps<{
  todo: {
    id: number
    text: string
    isCompleted: boolean
    sort: number
  }
}>()

const emit = defineEmits<{
  (e: 'toggle-complete', id: number): void
  (e: 'delete-todo', id: number): void
}>()

const toggleComplete = (id: number) => {
  emit('toggle-complete', id)
}

const deleteTodo = (id: number) => {
  emit('delete-todo', id)
}
</script>

<style scoped>
.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 5px;
  box-sizing: border-box; /* 修改盒模型为 border-box */
  height: 52px;
}

.delete-icon {
  cursor: pointer;
  width: 16px;
  height: 16px;
}

.completed {
  text-decoration-line: line-through;
}

.todo_task {
  margin-right: 20px;
}

.todo_text {
  display: inline-block;
}
</style>