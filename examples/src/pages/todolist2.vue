<template>
  <div class="todolist-container">
    <div class="todolist-content">
      <h1 class="title">✍️ My Todo</h1>
      <div class="box" style="display: flex; margin-bottom: 10px">
        <el-input v-model="input" style="flex: 1; margin-right: 10px" placeholder="Add a new todo..." />
        <el-button type="primary" style="width: 90px; height: 100%" @click="addTodo('')">Add</el-button>
      </div>
      <div class="todo_list">
        <TodoItem
          v-for="(todo, index) in sortedTodos"
          :key="todo.id"
          :todo="todo"
          @toggle-complete="(id) => toggleComplete(id, !todo.isCompleted)"
          @delete-todo="deleteTodo"
        />
      </div>
    </div>
    <!-- copilot -->
    <CopilotPopup />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElInput, ElButton } from 'element-plus'
import TodoItem from '../components/TodoItem.vue'
import { CopilotPopup } from '@copilotkit/vue-ui'
import { useCopilotAction, useCopilotReadable } from '@copilotkit/vue-core'

type Todo = {
  id: number
  text: string
  isCompleted: boolean
  sort: number
}

const input = ref('')
const todos = ref<Todo[]>([])

const addTodo = (text: string) => {
  if (input.value.trim() || text) {
    todos.value.push({
      id: todos.value.length ,
      text: text || input.value,
      isCompleted: false,
      sort: todos.value.length + 1
    })
    input.value = ''
  }
  console.log(todos.value)
}

const toggleComplete = (id: number, isCompleted: boolean) => {
  const todo = todos.value.find(t => t.id === id)
  if (todo) {
    todo.isCompleted = isCompleted
    sortTodos()
  }
}


const deleteTodo = (id: number) => {
  todos.value = todos.value.filter(t => t.id !== id)
}

const sortTodos = () => {
  todos.value.sort((a, b) => {
    if (a.isCompleted && !b.isCompleted) return 1
    if (!a.isCompleted && b.isCompleted) return -1
    return a.sort - b.sort
  })
}

const sortedTodos = computed(() => {
  return [...todos.value].sort((a, b) => {
    if (a.isCompleted && !b.isCompleted) return 1
    if (!a.isCompleted && b.isCompleted) return -1
    return a.sort - b.sort
  })
})

/**
 * 4) make the users todo list available with useCopilotReadable
 **/
useCopilotReadable({
  description: "The user's todo list.",
  value: todos.value,
})

useCopilotAction({
    name: "addTask",
    description: "Adds a todo to the todo list",
    parameters: [
      {
        name: "text",
        type: "string",
        description: "The text of the todo",
        required: true,
      },
    ],
    handler: ({ text }) => {
      console.log(text,`addTask`);
      addTodo(text);
    }
  });

  useCopilotAction({
    name: "deleteTask",
    description: "Deletes a todo from the todo list",
    parameters: [
      {
        name: "id",
        type: "number",
        description: "The id of the todo",
        required: true,
      },
    ],
    handler: ({ id }) => {
      console.log(id,`deleteTask`);
      deleteTodo(id);
    }
  });

  useCopilotAction({
    name: "setTaskStatus",
    description: "Sets the status of a todo",
    parameters: [
      {
        name: "id",
        type: "number",
        description: "The id of the todo",
        required: true,
      },
      {
        name: "isCompleted",
        type: "boolean",
        description: "The status of the todo",
        required: true,
      },
    ],
    handler: ({ id, isCompleted }) => {
      console.log(id, isCompleted,`setTaskStatus`);
      toggleComplete(id, isCompleted);
    }
  });
</script>

<style scoped>
.todolist-container {
  padding: 6rem;
  min-width: 500px;
  width: 40%;
  height: calc(100vh - 16rem);
}

.todolist-content {
  text-align: left;
}

.box {
  display: flex;
  margin-bottom: 10px;
  height: 40px;
}

.todo_list {
  margin-top: 20px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.todo_list-item {
  background-color: #f5f5f5;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
}
</style>