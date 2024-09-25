import { ref, type Ref } from 'vue'

import {
  FunctionCallHandler,
  COPILOT_CLOUD_PUBLIC_API_KEY_HEADER,
  Action,
  actionParametersToJsonSchema
} from '@copilotkit/shared'

import {
  Message,
  TextMessage,
  ActionExecutionMessage,
  ResultMessage,
  CopilotRuntimeClient,
  convertMessagesToGqlInput,
  convertGqlOutputToMessages,
  MessageStatusCode,
  MessageRole,
  Role,
  CopilotRequestType
} from '@copilotkit/runtime-client-gql'

import { CopilotApiConfig } from '../context'

export type UseChatOptions = {
  /**
   * System messages of the chat. Defaults to an empty array.
   */
  initialMessages?: Message[]
  /**
   * Callback function to be called when a function call is received.
   * If the function returns a `ChatRequest` object, the request will be sent
   * automatically to the API and will be used to update the chat.
   */
  onFunctionCall?: FunctionCallHandler
  /**
   * Function definitions to be sent to the API.
   */
  actions: Action[]

  /**
   * The CopilotKit API configuration.
   */
  copilotConfig: CopilotApiConfig

  /**
   * The current list of messages in the chat.
   */
  messages: Ref<Message[]>
  /**
   * The setState-powered method to update the chat messages.
   */
  setMessages: any

  /**
   * A callback to get the latest system message.
   */
  makeSystemMessageCallback: () => TextMessage

  /**
   * Whether the API request is in progress
   */
  isLoading: Ref<boolean>

  /**
   * setState-powered method to update the isChatLoading value
   */
  setIsLoading: any
}

export function useChat(options: UseChatOptions) {
  const {
    messages,
    setMessages,
    makeSystemMessageCallback,
    copilotConfig,
    setIsLoading,
    initialMessages,
    isLoading,
    actions,
    onFunctionCall
  } = options

  const abortControllerRef = ref<AbortController>()
  const threadIdRef = ref<string | null>(null)
  const runIdRef = ref<string | null>(null)
  const publicApiKey = copilotConfig.publicApiKey
  const headers = {
    ...(copilotConfig.headers || {}),
    ...(publicApiKey ? { [COPILOT_CLOUD_PUBLIC_API_KEY_HEADER]: publicApiKey } : {})
  }

  const runtimeClient = new CopilotRuntimeClient({
    url: copilotConfig.chatApiEndpoint,
    publicApiKey: copilotConfig.publicApiKey,
    headers,
    credentials: copilotConfig.credentials
  })

  const runChatCompletion = async (previousMessages: Message[]) => {
    setIsLoading(true)

    // this message is just a placeholder. It will disappear once the first real message
    // is received
    let newMessages: Message[] = [
      new TextMessage({
        content: '',
        role: Role.Assistant
      })
    ]

    const abortController = new AbortController()
    abortControllerRef.value = abortController

    setMessages([...previousMessages, ...newMessages])

    const systemMessage = makeSystemMessageCallback()

    const messagesWithContext = [systemMessage, ...(initialMessages || []), ...previousMessages]

    const stream = CopilotRuntimeClient.asStream(
      runtimeClient.generateCopilotResponse({
        data: {
          frontend: {
            actions: actions?.map(action => ({
              name: action.name,
              description: action.description || '',
              jsonSchema: JSON.stringify(actionParametersToJsonSchema(action.parameters || []))
            }))
          },
          threadId: threadIdRef.value,
          runId: runIdRef.value,
          messages: convertMessagesToGqlInput(messagesWithContext),
          ...(copilotConfig.cloud
            ? {
                cloud: {
                  ...(copilotConfig.cloud.guardrails?.input?.restrictToTopic?.enabled
                    ? {
                        guardrails: {
                          inputValidationRules: {
                            allowList: copilotConfig.cloud.guardrails.input.restrictToTopic.validTopics,
                            denyList: copilotConfig.cloud.guardrails.input.restrictToTopic.invalidTopics
                          }
                        }
                      }
                    : {})
                }
              }
            : {}),
          metadata: {
            requestType: CopilotRequestType.Chat
          }
        },
        properties: copilotConfig.properties,
        signal: abortControllerRef.value?.signal
      })
    )

    const guardrailsEnabled = copilotConfig.cloud?.guardrails?.input?.restrictToTopic.enabled || false

    const reader = stream.getReader()

    let results: { [id: string]: string } = {}

    try {
      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          break
        }

        if (!value?.generateCopilotResponse) {
          continue
        }

        threadIdRef.value = value.generateCopilotResponse.threadId || null
        runIdRef.value = value.generateCopilotResponse.runId || null

        const messages = convertGqlOutputToMessages(value.generateCopilotResponse.messages)

        if (messages.length === 0) {
          continue
        }

        newMessages = []

        // request failed, display error message
        if (
          value.generateCopilotResponse.status?.__typename === 'FailedResponseStatus' &&
          value.generateCopilotResponse.status.reason === 'GUARDRAILS_VALIDATION_FAILED'
        ) {
          newMessages = [
            new TextMessage({
              role: MessageRole.Assistant,
              content: value.generateCopilotResponse.status.details?.guardrailsReason || ''
            })
          ]
        }

        // add messages to the chat
        else {
          for (const message of messages) {
            newMessages.push(message)

            if (
              message instanceof ActionExecutionMessage &&
              message.status.code !== MessageStatusCode.Pending &&
              message.scope === 'client' &&
              onFunctionCall
            ) {
              if (!(message.id in results)) {
                // Do not execute a function call if guardrails are enabled but the status is not known
                if (guardrailsEnabled && value.generateCopilotResponse.status === undefined) {
                  break
                }
                // execute action
                const result = await onFunctionCall({
                  messages: previousMessages,
                  name: message.name,
                  args: message.arguments
                })
                results[message.id] = result
              }

              // add the result message
              newMessages.push(
                new ResultMessage({
                  result: ResultMessage.encodeResult(results[message.id]),
                  actionExecutionId: message.id,
                  actionName: message.name
                })
              )
            }
          }
        }

        if (newMessages.length > 0) {
          setMessages([...previousMessages, ...newMessages])
        }
      }

      if (
        // if we have client side results
        Object.values(results).length ||
        // or the last message we received is a result
        (newMessages.length && newMessages[newMessages.length - 1] instanceof ResultMessage)
      ) {
        // run the completion again and return the result

        // wait for next tick to make sure all the react state updates
        // - tried using react-dom's flushSync, but it did not work
        await new Promise(resolve => setTimeout(resolve, 10))

        return await runChatCompletion([...previousMessages, ...newMessages])
      } else {
        return newMessages.slice()
      }
    } finally {
      setIsLoading(false)
    }
  }

  const runChatCompletionAndHandleFunctionCall = async (messages: Message[]) => {
    await runChatCompletion(messages)
  }

  const append = (message: Message) => {
    if (isLoading.value) return
    const newMessages = [...messages.value, message]
    setMessages(newMessages)
    return runChatCompletionAndHandleFunctionCall(newMessages)
  }

  const reload = () => {
    if (isLoading.value || messages.value.length === 0) {
      return
    }
    let newMessages = [...messages.value]
    const lastMessage = messages[messages.value.length - 1]

    if (lastMessage instanceof TextMessage && lastMessage.role === 'assistant') {
      newMessages = newMessages.slice(0, -1)
    }

    setMessages(newMessages)

    return runChatCompletionAndHandleFunctionCall(newMessages)
  }

  const stop = () => {
    abortControllerRef.value?.abort()
  }

  return {
    append,
    reload,
    stop
  }
}
