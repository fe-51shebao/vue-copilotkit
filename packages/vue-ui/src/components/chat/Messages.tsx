import { defineComponent, PropType, ref, watch } from "vue";
import { MessagesProps } from "./props";
import { useChatContext } from "./ChatContext";
import { Markdown } from "./Markdown";
import { RenderFunctionStatus, useCopilotContext } from "@copilotkit/vue-core";
import { SpinnerIcon } from "./Icon";

import {
  MessageStatusCode,
  ActionExecutionMessage,
  Message,
  ResultMessage,
  TextMessage,
  Role,
} from "@copilotkit/runtime-client-gql";

export const Messages = defineComponent({
  props:{
    messages: {
      type: Array as PropType<Message[]>,
      required: true,
    },
    inProgress: {
      type: Boolean,
      required: true,
    },
    children: {
      type: Object,
    },
  },
  setup(props, { slots }) {
    
    const msgs = ref<Message[]>([]) // 定义message
    const { chatComponentsCache } = useCopilotContext(); // chat缓存

    const context = useChatContext(); // context
    watch(() => props.messages,
    (newMessages, oldMessages) => {
      msgs.value = newMessages;
    })
    const functionResults: Record<string, string> = {};

    for (let i = 0; i < msgs.value.length; i++) {
      if (msgs.value[i] instanceof ActionExecutionMessage) {
        const id = msgs.value[i].id;
        const resultMessage: ResultMessage | undefined = msgs.value.find(
          (message) => message instanceof ResultMessage && message.actionExecutionId === id,
        ) as ResultMessage | undefined;

        if (resultMessage) {
          functionResults[id] = ResultMessage.decodeResult(resultMessage.result || "");
        }
      }
    }
    const messagesEndRef = ref<HTMLDivElement | null>(null)

    const scrollToBottom = () => {
      if (messagesEndRef.value) {
        messagesEndRef.value?.scrollIntoView({
          behavior: "auto",
        });
      }
    };
    watch(() => msgs.value, scrollToBottom);

    return () => (
      <div class="copilotKitMessages">
        {msgs.value.map((message,index) => {
          const isCurrentMessage = index === msgs.value.length - 1;
          if (message instanceof TextMessage && message.role === "user") {
            return (
              <div key={index} class="copilotKitMessage copilotKitUserMessage">
                {message.content}
              </div>
            );
          } else if (message instanceof TextMessage && message.role === "assistant") {
            return (
              <div key={index} class={`copilotKitMessage copilotKitAssistantMessage`}>
                {isCurrentMessage && props.inProgress && !message.content ? (
                  <SpinnerIcon/>
                ) : (
                  <Markdown content={message.content} />
                )}
              </div>
            );
          } else if (message instanceof ActionExecutionMessage) { // to do1

            if (chatComponentsCache.value !== null && chatComponentsCache.value[message.name]) {
              const render = chatComponentsCache.value[message.name];
              // render a static string
              if (typeof render === "string") {
                // when render is static, we show it only when in progress
                if (isCurrentMessage && props.inProgress) {
                  return (
                    <div key={index} class={`copilotKitMessage copilotKitAssistantMessage`}>
                      {/* {context.icons.spinnerIcon}  */}
                       <span class="inProgressLabel">{render}</span>
                    </div>
                  );
                }
                // Done - silent by default to avoid a series of "done" messages
                else {
                  return null;
                }
              }
              // render is a function
              else {
                const args = message.arguments;

                let status: RenderFunctionStatus = "inProgress";

                if (functionResults[message.id] !== undefined) {
                  status = "complete";
                } else if (message.status.code !== MessageStatusCode.Pending) {
                  status = "executing";
                }

                const toRender = render({
                  status: status as any,
                  args,
                  result: functionResults[message.id],
                });

                // No result and complete: stay silent
                if (!toRender && status === "complete") {
                  return null;
                }

                if (typeof toRender === "string") {
                  return (
                    <div key={index} class={`copilotKitMessage copilotKitAssistantMessage`}>
                      {isCurrentMessage && props.inProgress } {toRender}
                      {/* { && context.icons.spinnerIcon} */}
                    </div>
                  );
                } else {
                  return (
                    <div key={index} class="copilotKitCustomAssistantMessage">
                      {toRender}
                    </div>
                  );
                }
              }
            }
            // No render function found- show the default message
            else if (!props.inProgress || !isCurrentMessage) {
              // Done - silent by default to avoid a series of "done" messages
              return null;
            } else {
              // In progress
              return (
                <div key={index} class={`copilotKitMessage copilotKitAssistantMessage`}>
                  {/* {context.icons.spinnerIcon} */}
                </div>
              );
            }
          }
        })}
        <footer ref={messagesEndRef}>{slots.default?.()}</footer>
      </div>
    )
  },
})