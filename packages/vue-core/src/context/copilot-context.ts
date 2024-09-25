import { inject, Ref } from 'vue'
import { CopilotCloudConfig, FunctionCallHandler } from '@copilotkit/shared'
import { Message } from '@copilotkit/runtime-client-gql'

import { ActionRenderProps, FrontendAction } from '../types/frontend-action'
import { DocumentPointer } from '../types'
import { CopilotChatSuggestionConfiguration } from '../types/chat-suggestion-configuration'

type TreeNodeId = string

/**
 * Interface for the configuration of the Copilot API.
 */
export interface CopilotApiConfig {
  /**
   * The public API key for Copilot Cloud.
   */
  publicApiKey?: string

  /**
   * The configuration for Copilot Cloud.
   */
  cloud?: CopilotCloudConfig

  /**
   * The endpoint for the chat API.
   */
  chatApiEndpoint: string

  /**
   * The endpoint for the Copilot transcribe audio service.
   */
  transcribeAudioUrl?: string

  /**
   * The endpoint for the Copilot text to speech service.
   */
  textToSpeechUrl?: string

  /**
   * additional headers to be sent with the request
   * @default {}
   * @example
   * ```
   * {
   *   'Authorization': 'Bearer your_token_here'
   * }
   * ```
   */
  headers: Record<string, string>

  /**
   * Custom properties to be sent with the request
   * @default {}
   * @example
   * ```
   * {
   *   'user_id': 'user_id'
   * }
   * ```
   */
  properties?: Record<string, any>

  /**
   * Indicates whether the user agent should send or receive cookies from the other domain
   * in the case of cross-origin requests.
   */
  credentials?: RequestCredentials
}

export type InChatRenderFunction = (props: ActionRenderProps<any>) => any

export interface CopilotContextParams {
  chatComponentsCache: Ref<Record<string, InChatRenderFunction | string>>
  // function-calling
  actions: Ref<Record<string, FrontendAction<any>>>
  setAction: (id: string, action: FrontendAction<any>) => void
  removeAction: (id: string) => void

  getFunctionCallHandler: (customEntryPoints?: Record<string, FrontendAction<any>>) => FunctionCallHandler

  // text context
  addContext: (context: string, parentId?: string, categories?: string[]) => TreeNodeId
  removeContext: (id: TreeNodeId) => void
  getContextString: (documents: DocumentPointer[], categories: string[]) => string

  // document context
  addDocumentContext: (documentPointer: DocumentPointer, categories?: string[]) => TreeNodeId
  removeDocumentContext: (documentId: string) => void
  getDocumentsContext: (categories: string[]) => DocumentPointer[]

  // chat
  messages: Ref<Message[]>
  setMessages: any

  isLoading: Ref<boolean>
  setIsLoading: any

  chatSuggestionConfiguration: Ref<{ [key: string]: CopilotChatSuggestionConfiguration }>
  addChatSuggestionConfiguration: (id: string, suggestion: CopilotChatSuggestionConfiguration) => void
  removeChatSuggestionConfiguration: (id: string) => void

  chatInstructions: Ref<string>
  setChatInstructions: any

  // api endpoints
  copilotApiConfig: CopilotApiConfig

  showDevConsole: boolean | 'auto'
}

export const CopilotKitContext = Symbol()

export function useCopilotContext() {
  const ctx = inject<CopilotContextParams>(CopilotKitContext)

  if (!ctx) {
    throw new Error('Remember to wrap your app in a `<CopilotKit> {...} </CopilotKit>` !!!')
  }

  return ctx
}
