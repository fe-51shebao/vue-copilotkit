<template>
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="../assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <!-- <HelloWorld msg="Vite + Vue1" /> -->
  <div class="box" style="display: flex; margin-bottom: 10px">
    <ElInput v-model="input" style="width: 260px; margin-right: 10px" placeholder="Please input u want todo" />
    <ElButton type="primary" style="width: 90px" @click="InputAddTodo">Add Todo</ElButton>
  </div>
  <div class="todo_list">
    <div v-for="(val, ind) in todos" :key="ind" style="display: flex" class="todo_list-item">
      <!-- <p class="">{{val }}</p> -->
      <ElCheckbox v-model="val.isCompleted" :label="val.text" size="large" border
        style="width: 320px; text-align: left; margin-bottom: 5px; margin-right: 6px" />
      <ElButton @click="DelTodo(ind)" style="margin-top: 4px" type="danger" :icon="Delete" circle />
    </div>
  </div>
  <!-- copilot -->
  <CopilotPopup/>
  <!-- <CopilotSidebar/> -->

</template>

<script setup lang="ts">
import { ElButton, ElInput, ElCheckbox, ElCard, ElIcon } from 'element-plus'
import { Delete, ChatDotRound, ArrowDownBold, Position, Close } from '@element-plus/icons-vue'
import { ref, reactive, Ref } from 'vue'
import { CopilotPopup, CopilotSidebar } from '@copilotkit/vue-ui'
import { Role, TextMessage, Message } from '@copilotkit/runtime-client-gql'
import { useCopilotChat,  useCopilotAction,  useCopilotReadable} from '@copilotkit/vue-core'

type Todo = {
  id: string
  text: string
  isCompleted: boolean
  assignedTo?: string
}

let input: Ref<string> = ref('')
let todos: Todo[] = reactive([])

interface Dialog {
  id: string;
  text: string;
  isCopilot?: boolean;
  assignedTo?: string;
}

let showChat:Ref<boolean> = ref(true)
let input_copilot: Ref<string> = ref('')
let dialogs: Dialog[] = reactive([{
  id:'001',
  text: 'Hi you! 👋 I can help you manage your todo list.',
  isCopilot: true,
}])

function AddTodo(todoList: Todo[]) {
  if(todoList && todoList.length ){
    todos.length = 0 // 重制
    todoList.forEach(i=>{
      todos.push(i)
    })
  }else {
    todos.push({ id: Date.now().toString(), text: input.value, isCompleted: false })
  }
}
function InputAddTodo() {
  if (input.value != '') {
    AddTodo()
    input.value = ''
  }
}
function DelTodo(index: number) {
  todos.splice(index, 1)
}

function OpenChat(open: boolean) {
  showChat.value = open
}

function CloseChat() {
  showChat.value = false
}
function SendMes() {
  if (input_copilot.value != '') {
    dialogs.push({ id: Date.now().toString(), text: input_copilot.value,isCopilot:false})
    input_copilot.value = ''
  }  
  GetCopilotMes()
}
function GetCopilotMes(todoList: [{ text:string }]){
  let todolist: [{ text: string }] = [{ text: '123test' }]
  // if (input_copilot.value != '') {
    dialogs.push({ id: Date.now().toString(), text: `23333333381007`, isCopilot: true })
  //   input_copilot.value = ''
  // }
  if (todoList && todoList.length > 0) {
    todoList.forEach(val => {
      todolist.push({ text: val.text })
    })
  }    
  AddTodo(todolist)
}


/**
   *
   * 4) make the users todo list available with useCopilotReadable
   *
   **/
useCopilotReadable({
  description: "The user's todo list.",
  value: todos,
});


useCopilotAction({
  name: "updateTodoList",
  description: "Update the users todo list",
  parameters: [
    {
      name: "items",
      type: "object[]",
      description: "The new and updated todo list items.",
      attributes: [
        {
          name: "id",
          type: "string",
          description:
            "The id of the todo item. When creating a new todo item, just make up a new id.",
        },
        {
          name: "text",
          type: "string",
          description: "The text of the todo item.",
        },
        {
          name: "isCompleted",
          type: "boolean",
          description: "The completion status of the todo item.",
        },
        {
          name: "assignedTo",
          type: "string",
          description:
            "The person assigned to the todo item. If you don't know, assign it to 'YOU'.",
          required: true,
        },
      ],
    },
  ],
  handler: ({ items }) => {
    console.log(items,`-------`);
    AddTodo(items)
  },
  // render: "Updating the todo list...",
});



</script>

<style scoped>
/*  copilo style */
.copilot_button {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
}

.copilot_window {
  position: fixed;
  right: 1rem;
  bottom: 5rem;
  height: 600px;
  min-height: 200px;
  max-height: calc(100% - 6rem);
  width: 24rem;
  overflow-y: auto;
}

:deep(.el-card__header) {
  background: rgb(64, 158, 255);
  color: #fff;
}
:deep(.el-card__body){
  height: 415px;
}
:deep(.el-card__footer) {
  background:rgb(255, 255, 255);
  /* padding: 0; */
  box-sizing: border-box;
}
:deep(.copilot_window-input) {
  border:0px ;
  /* margin: 18px 20px; */
}
/* border-top: 1px solid var(--copilot-kit-separator-color);
padding-left: 2rem;
padding-right: 1rem;
padding-top: 1rem;
padding-bottom: 1rem;
display: flex;
align-items: center;
cursor: text;
position: relative;
border-bottom-left-radius: 0.75rem;
border-bottom-right-radius: 0.75rem;
background-color: var(--copilot-kit-background-color); */
.dialog_mes {
  border-radius: 0.5rem;
  padding: 1rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  overflow-wrap: break-word;
  max-width: 80%;
  margin-bottom: 1.5rem;
}
.copilot_mes {
  background: rgb(243, 244, 246);
  color: #000;
  margin-right: auto;
}
.user_mes {
  background: rgb(64, 158, 255);
  color: #fff;
  margin-left: auto;
}
</style>
