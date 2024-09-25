import { defineComponent,PropType, ref, watch } from "vue";
import { SystemMessageFunction, useCopilotChat, useCopilotContext } from "@copilotkit/vue-core";
import { randomId } from "@copilotkit/shared";
import { Message, Role, TextMessage } from "@copilotkit/runtime-client-gql";
import { CopilotChatSuggestion } from "../../types/suggestions";
import { reloadSuggestions } from "./Suggestion";
import { useChatContext, ChatContextProvider, CopilotChatLabels } from "./ChatContext";

export const CopilotChat = defineComponent({
  props:{
    instructions:{
      type: String,
      default: ''
    },
    onSubmitMessage:{
      type: Function as PropType<(messageContent: string) => void>,
      default: () => {}
    },
    makeSystemMessage:{
      type: Function as PropType<SystemMessageFunction>,
      default: null
    },
    showResponseButton:{
      type: Boolean,
      default: true
    },
    onInProgress:{
      type: Function as PropType<(isLoading: boolean) => void>,
      default: () => {}
    },
    className: {
      type: String,
      default: ''
    },
    labels:{
      type: Object,
      default: () => ({})
    }
  },
  setup(props,{ slots }) {
    const context = useCopilotContext();
    watch(()=> props.instructions, (instructions) => {
      // context.setMakeSystemMessage?.(instructions || "")
    },{ immediate: true })

    const {
      visibleMessages,
      isLoading,
      currentSuggestions,
      sendMessage,
      stopGeneration,
      reloadMessages,
    } = useCopilotChatLogic(props.makeSystemMessage, props.onInProgress, props.onSubmitMessage);

    const chatContext = useChatContext();
    const isVisible = chatContext ? chatContext.open : true;
    return () => {
      return (
        <WrappedCopilotChat labels={props.labels} className={props.className}>
          {/* success */}
          {/* {slots.messages ? slots.messages({ messages: visibleMessages.value, inProgress: isLoading.value, children: {default: () => <>{props.showResponseButton && visibleMessages.value.length > 0 && <ResponseButton inProgress={isLoading.value} hClick={isLoading.value ? stopGeneration : reloadMessages} />}</>}  }) : <DefaultMessages messages={visibleMessages.value}  inProgress={isLoading.value}>
            {props.showResponseButton && visibleMessages.value.length > 0 && <ResponseButton inProgress={isLoading.value} hClick={isLoading.value ? stopGeneration : reloadMessages} />}
          </DefaultMessages>} */}
            {/* fail  props.children.default */}
            {/* {slots.messages ? slots.messages({ messages: visibleMessages.value, inProgress: isLoading.value, children: {default: () => {props.showResponseButton && visibleMessages.value.length > 0 && <ResponseButton inProgress={isLoading.value} hClick={isLoading.value ? stopGeneration : reloadMessages} />}}  }) : <DefaultMessages messages={visibleMessages.value}  inProgress={isLoading.value}>
              {props.showResponseButton && visibleMessages.value.length > 0 && <ResponseButton inProgress={isLoading.value} hClick={isLoading.value ? stopGeneration : reloadMessages} />}
            </DefaultMessages>} */}
            {/* fail */}
            {/* <Messages messages={visibleMessages.value} inProgress={isLoading.value} >
              {props.showResponseButton && visibleMessages.value.length > 0 && <ResponseButton inProgress={isLoading.value} hClick={isLoading.value ? stopGeneration : reloadMessages} />}
            </Messages> */}
          {slots.messages && slots.messages({ messages: visibleMessages.value, inProgress: isLoading.value, children: {default: () => <>{props.showResponseButton && visibleMessages.value.length > 0 && (slots.responseButton && slots.responseButton({ inProgress: isLoading.value, hClick: isLoading.value ? stopGeneration : reloadMessages }))}</>}  })}
          {slots.input && slots.input({ send:sendMessage, inProgress: isLoading.value, isVisible: isVisible })}
          {/* {slots.input ? slots.input({ send:sendMessage, inProgress: isLoading.value, isVisible: isVisible }) : <DefaultInput inProgress={isLoading.value} send={sendMessage} isVisible={isVisible} />} */}
        </WrappedCopilotChat>
  
        // <WrappedCopilotChat labels={props.labels} className={props.className}>
        //   <components is={props.input}></components>
        // </WrappedCopilotChat>
      )
    }
  }
})
export function WrappedCopilotChat({
  labels,
  className,
}: {
  labels?: CopilotChatLabels;
  className?: string;
},{ slots }: any) {
  const chatContext = useChatContext();
  if (!chatContext) {
    return (
      <ChatContextProvider  labels={labels} open={true} setOpen={() => {}}>
        <div class={`copilotKitChat ${className}`}>{slots.default?.()}</div>
      </ChatContextProvider>
    );
  }
  return <>{slots.default?.()}</>;
}

const SUGGESTIONS_DEBOUNCE_TIMEOUT = 1000;

export const useCopilotChatLogic = (
  makeSystemMessage?: SystemMessageFunction,
  onInProgress?: (isLoading: boolean) => void,
  onSubmitMessage?: (messageContent: string) => void,
) => {
  const { visibleMessages, appendMessage, reloadMessages, stopGeneration, isLoading } =
    useCopilotChat({
      id: randomId(),
      makeSystemMessage,
    });
  const currentSuggestions = ref<CopilotChatSuggestion[]>([])
  const setCurrentSuggestions = (value: CopilotChatSuggestion[]) => {
    currentSuggestions.value = value
  }
  const suggestionsAbortControllerRef = ref<AbortController | null>(null);
  const debounceTimerRef = ref<any>();

  const abortSuggestions = () => {
    suggestionsAbortControllerRef.value?.abort();
    suggestionsAbortControllerRef.value = null;
  };

  const context = useCopilotContext();
  watch(
    () => [isLoading, context.chatSuggestionConfiguration],
    () => {
      onInProgress?.(isLoading.value);

      abortSuggestions();
      debounceTimerRef.value = setTimeout(
        () => {
          if (!isLoading && Object.keys(context.chatSuggestionConfiguration).length !== 0) {
            suggestionsAbortControllerRef.value = new AbortController();
            reloadSuggestions?.(
              context,
              context.chatSuggestionConfiguration,
              setCurrentSuggestions,
              suggestionsAbortControllerRef,
            );
          }
        },
        currentSuggestions.value.length == 0 ? 0 : SUGGESTIONS_DEBOUNCE_TIMEOUT, 
      );

      return () => {
        clearTimeout(debounceTimerRef.value);
      };
    },
    {
      immediate: true,
      deep: true,
    }
  )

  const sendMessage = async (messageContent: string) => {
    abortSuggestions();
    setCurrentSuggestions([]);

    const message: Message = new TextMessage({
      content: messageContent,
      role: Role.User,
    });

    // Append the message immediately to make it visible
    appendMessage(message);

    if (onSubmitMessage) {
      try {
        await onSubmitMessage(messageContent);
      } catch (error) {
        console.error("Error in onSubmitMessage:", error);
      }
    }

    return message;
  };

  return {
    visibleMessages,
    isLoading,
    currentSuggestions,
    sendMessage,
    stopGeneration,
    reloadMessages,
  };
};