<template>
  <div>
    <ul>
      <li><a href="./todolist"> todolist示例 </a></li>
      <li><a href="./form"> 表单自动填写示例 </a></li>
      <li><a href="./textarea"> email自动回复 </a></li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import {
  useCopilotReadable,
  useCopilotAction,
  useCopilotChat,
} from "@copilotkit/vue-core";
import { Role, TextMessage } from "@copilotkit/runtime-client-gql";

useCopilotReadable({
  description: "The user's todo list.",
  value: [],
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
    console.log(items);
  },
});

// 声明一个TextMessage类
const textMessage = new TextMessage({
  content: "你可以做一些什么？",
  role: Role.User,
});

const {
  visibleMessages,
  appendMessage,
  deleteMessage,
  reloadMessages,
} = useCopilotChat();

// 发送消息时调用 返回一个promise
appendMessage(textMessage)?.then(() => {
  // 可用于消息列表渲染
  console.log(visibleMessages);
});
</script>

<style scoped></style>
