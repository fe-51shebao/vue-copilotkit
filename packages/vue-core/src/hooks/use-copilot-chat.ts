import { Message, Role, TextMessage } from '@copilotkit/runtime-client-gql'

import { useCopilotContext } from '../context/copilot-context'

import { SystemMessageFunction } from '../types'

import { useChat } from './use-chat'

import { defaultCopilotContextCategories } from '../components'

export interface UseCopilotChatOptions {
  /**
   * A unique identifier for the chat. If not provided, a random one will be
   * generated. When provided, the `useChat` hook with the same `id` will
   * have shared states across components.
   */
  id?: string

  /**
   * HTTP headers to be sent with the API request.
   */
  headers?: Record<string, string> | Headers

  /**
   * Extra body object to be sent with the API request.
   * @example
   * Send a `sessionId` to the API along with the messages.
   * ```js
   * useChat({
   *   body: {
   *     sessionId: '123',
   *   }
   * })
   * ```
   */
  body?: object
  /**
   * System messages of the chat. Defaults to an empty array.
   */
  initialMessages?: Message[]

  /**
   * A function to generate the system message. Defaults to `defaultSystemMessage`.
   */
  makeSystemMessage?: SystemMessageFunction
}

export function useCopilotChat({ makeSystemMessage, ...options }: UseCopilotChatOptions = {}) {
  const {
    getContextString,
    getFunctionCallHandler,
    copilotApiConfig,
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    chatInstructions,
    actions
  } = useCopilotContext()

  const deleteMessage = (messageId: string) => {
    setMessages(messages.value.filter(message => message.id !== messageId))
  }

  const makeSystemMessageCallback = () => {
    const systemMessageMaker = makeSystemMessage || defaultSystemMessage
    // this always gets the latest context string
    const contextString = getContextString([], defaultCopilotContextCategories) // TODO: make the context categories configurable

    return new TextMessage({
      content: systemMessageMaker(contextString, chatInstructions.value),
      role: Role.System
    })
  }

  const { append, reload, stop } = useChat({
    ...options,
    actions: Object.values(actions.value),
    copilotConfig: copilotApiConfig,
    initialMessages: options.initialMessages || [],
    onFunctionCall: getFunctionCallHandler(),
    messages,
    setMessages,
    // @ts-ignore
    makeSystemMessageCallback,
    isLoading,
    setIsLoading
  })

  return {
    visibleMessages: messages,
    appendMessage: append,
    setMessages,
    reloadMessages: reload,
    stopGeneration: stop,
    deleteMessage,
    isLoading
  }
}

export function defaultSystemMessage(contextString: string, additionalInstructions?: string): string {
  return (
    `
Please act as an efficient, competent, conscientious, and industrious professional assistant.

Help the user achieve their goals, and you do so in a way that is as efficient as possible, without unnecessary fluff, but also without sacrificing professionalism.
Always be polite and respectful, and prefer brevity over verbosity.

The user has provided you with the following context:
\`\`\`
${contextString}
\`\`\`

They have also provided you with functions you can call to initiate actions on their behalf, or functions you can call to receive more information.

Please assist them as best you can.

You can ask them for clarifying questions if needed, but don't be annoying about it. If you can reasonably 'fill in the blanks' yourself, do so.

If you would like to call a function, call it without saying anything else.
` + (additionalInstructions ? `\n\n${additionalInstructions}` : '')
  )
}
