import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'virtual:uno.css'

const app = createApp(App)

app.use(router)
app.use(ElementPlus)
app.mount('#app')

function fetch_copilotkit_v1() {
  fetch('https://api.copilotkit.ai/copilotkit/v1', {
    headers: {
      'content-type': 'application/json',
      'x-copilotcloud-public-api-key': 'ck_pub_b60a29b6afc2283bc9fcf15331510374'
    },
    body: '{"operationName":"generateCopilotResponse","query":"mutation generateCopilotResponse($data: GenerateCopilotResponseInput!, $properties: JSONObject) {\\n  generateCopilotResponse(data: $data, properties: $properties) {\\n    threadId\\n    runId\\n    ... on CopilotResponse @defer {\\n      status {\\n        ... on BaseResponseStatus {\\n          code\\n          __typename\\n        }\\n        ... on FailedResponseStatus {\\n          reason\\n          details\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    messages @stream {\\n      __typename\\n      ... on BaseMessageOutput {\\n        id\\n        createdAt\\n        __typename\\n      }\\n      ... on BaseMessageOutput @defer {\\n        status {\\n          ... on SuccessMessageStatus {\\n            code\\n            __typename\\n          }\\n          ... on FailedMessageStatus {\\n            code\\n            reason\\n            __typename\\n          }\\n          ... on PendingMessageStatus {\\n            code\\n            __typename\\n          }\\n          __typename\\n        }\\n        __typename\\n      }\\n      ... on TextMessageOutput {\\n        content @stream\\n        role\\n        __typename\\n      }\\n      ... on ActionExecutionMessageOutput {\\n        name\\n        scope\\n        arguments @stream\\n        __typename\\n      }\\n      ... on ResultMessageOutput {\\n        result\\n        actionExecutionId\\n        actionName\\n        __typename\\n      }\\n    }\\n    __typename\\n  }\\n}","variables":{"data":{"cloud":{},"frontend":{"actions":[{"description":"Adds a task to the todo list","jsonSchema":"{\\"type\\":\\"object\\",\\"properties\\":{\\"title\\":{\\"type\\":\\"string\\",\\"description\\":\\"The title of the task\\"}},\\"required\\":[\\"title\\"]}","name":"addTask"},{"description":"Deletes a task from the todo list","jsonSchema":"{\\"type\\":\\"object\\",\\"properties\\":{\\"id\\":{\\"type\\":\\"number\\",\\"description\\":\\"The id of the task\\"}},\\"required\\":[\\"id\\"]}","name":"deleteTask"},{"description":"Sets the status of a task","jsonSchema":"{\\"type\\":\\"object\\",\\"properties\\":{\\"id\\":{\\"type\\":\\"number\\",\\"description\\":\\"The id of the task\\"},\\"status\\":{\\"type\\":\\"string\\",\\"description\\":\\"The status of the task\\",\\"enum\\":[\\"todo\\",\\"done\\"]}},\\"required\\":[\\"id\\",\\"status\\"]}","name":"setTaskStatus"}]},"messages":[{"createdAt":"2024-08-07T02:35:03.308Z","id":"ck-2f25b060-e854-4d16-a253-afccb27c08fb","textMessage":{"content":"\\nPlease act as an efficient, competent, conscientious, and industrious professional assistant.\\n\\nHelp the user achieve their goals, and you do so in a way that is as efficient as possible, without unnecessary fluff, but also without sacrificing professionalism.\\nAlways be polite and respectful, and prefer brevity over verbosity.\\n\\nThe user has provided you with the following context:\\n```\\n\\n\\n1. The state of the todo list: [{\\"id\\":3,\\"title\\":\\"Prepare presentation slides\\",\\"status\\":\\"todo\\"},{\\"id\\":4,\\"title\\":\\"Send meeting notes email\\",\\"status\\":\\"todo\\"},{\\"id\\":5,\\"title\\":\\"Review Uli\'s pull request\\",\\"status\\":\\"todo\\"},{\\"id\\":1,\\"title\\":\\"Complete project proposal\\",\\"status\\":\\"done\\"},{\\"id\\":2,\\"title\\":\\"Review design mockups\\",\\"status\\":\\"done\\"}]\\n\\n```\\n\\nThey have also provided you with functions you can call to initiate actions on their behalf, or functions you can call to receive more information.\\n\\nPlease assist them as best you can.\\n\\nYou can ask them for clarifying questions if needed, but don\'t be annoying about it. If you can reasonably \'fill in the blanks\' yourself, do so.\\n\\nIf you would like to call a function, call it without saying anything else.\\n","role":"system"}},{"createdAt":"2024-08-07T02:35:03.307Z","id":"ck-ee138760-4156-4837-a4c8-bea0317a13c9","textMessage":{"content":"hello","role":"user"}}],"metadata":{"requestType":"Chat"},"runId":null,"threadId":null},"properties":{}}}',
    method: 'POST'
  })
    .then(res => {
      // 检查是否成功，并且确保响应是流式的
      if (!res.ok || !res.body) {
        throw new Error('Network response was not ok.')
      }

      // 获取ReadableStream
      const reader = res.body.getReader()
      const stream = new ReadableStream({
        start(controller) {
          // 读取流
          function read() {
            reader
              .read()
              .then(({ done, value }) => {
                if (done) {
                  // 如果读取完成，则关闭流
                  controller.close()
                  return
                }
                // 获取数据块，并将其放入流中
                controller.enqueue(value)
                // 读取下一个数据块
                read()
              })
              .catch(error => {
                console.error('Error reading data:', error)
                controller.error(error)
              })
          }

          read()
        }
      })

      // 将ReadableStream转换成Text
      return new Response(stream).text()
    })
    .then(res => {
      console.log(res)
    })
}

// fetch_copilotkit_v1()
