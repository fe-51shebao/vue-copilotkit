import { defineComponent, provide, renderSlot, ref } from 'vue'
import { COPILOT_CLOUD_CHAT_URL, CopilotCloudConfig, FunctionCallHandler } from '@copilotkit/shared'
import { Message } from '@copilotkit/runtime-client-gql'

import { CopilotChatSuggestionConfiguration, DocumentPointer } from '../types'
import { FrontendAction } from '../types/frontend-action'
import { CopilotKitProps } from './copilotkit-props'

import useTree from '../hooks/use-tree'
import useFlatCategoryStore from '../hooks/use-flat-category-store'
// vue context symbol
import { CopilotKitContext, CopilotContextParams, InChatRenderFunction } from '../context'

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

export const CopilotKit = defineComponent({
  props: {
    publicApiKey: String,
    runtimeUrl: String,
    cloudRestrictToTopic: Object,
    headers: Object,
    properties: Object,
    transcribeAudioUrl: String,
    textToSpeechUrl: String,
    credentials: String,
    showDevConsole: [Boolean, String] as any
  },
  setup(props: CopilotKitProps, { slots }) {
    if (!props.runtimeUrl && !props.publicApiKey) {
      throw new Error('Please provide either a runtimeUrl or a publicApiKey to the CopilotKit component.')
    }

    const chatApiEndpoint = props.runtimeUrl || COPILOT_CLOUD_CHAT_URL

    const { addElement, removeElement, printTree } = useTree()
    const {
      addElement: addDocument,
      removeElement: removeDocument,
      allElements: allDocuments
    } = useFlatCategoryStore<DocumentPointer>()

    const chatComponentsCache = ref<Record<string, InChatRenderFunction | string>>({})

    const actions = ref<Record<string, FrontendAction<any>>>({})
    const messages = ref<Message[]>([])
    const isLoading = ref(false)
    const chatInstructions = ref('')
    const chatSuggestionConfiguration = ref({})

    const setMessages = (value: Message[]) => {
      messages.value = value
    }
    const setIsLoading = (value: boolean) => {
      isLoading.value = value
    }
    const setChatInstructions = (value: string) => {
      chatInstructions.value = value
    }

    const setAction = (id: string, action: FrontendAction<any>) => {
      actions.value = {
        ...actions.value,
        [id]: action
      }
    }
    const removeAction = (id: string) => {
      delete actions.value[id]
    }

    const getContextString = (documents: DocumentPointer[], categories: string[]) => {
      const documentsString = documents
        .map(document => {
          return `${document.name} (${document.sourceApplication}):\n${document.getContents()}`
        })
        .join('\n\n')

      const nonDocumentStrings = printTree(categories)

      return `${documentsString}\n\n${nonDocumentStrings}`
    }
    const addContext = (context: string, parentId?: string, categories: string[] = defaultCopilotContextCategories) => {
      return addElement(context, categories, parentId)
    }
    const removeContext = (id: string) => {
      removeElement(id)
    }

    const getFunctionCallHandler = (customEntryPoints?: Record<string, FrontendAction<any>>) => {
      return entryPointsToFunctionCallHandler(Object.values(customEntryPoints || actions.value))
    }

    const getDocumentsContext = (categories: string[]) => returnAndThrowInDebug([])
    const addDocumentContext = (
      documentPointer: DocumentPointer,
      categories: string[] = defaultCopilotContextCategories
    ) => returnAndThrowInDebug('')
    const removeDocumentContext = (documentId: string) => {}

    const addChatSuggestionConfiguration = (id: string, suggestion: CopilotChatSuggestionConfiguration) => {}
    const removeChatSuggestionConfiguration = (id: string) => {}

    if (!props.publicApiKey) {
      if (props.cloudRestrictToTopic) {
        throw new Error(
          'To use the cloudRestrictToTopic feature, please sign up at https://copilotkit.ai and provide a publicApiKey.'
        )
      }
    }

    let cloud: CopilotCloudConfig | undefined = undefined
    if (props.publicApiKey) {
      cloud = {
        guardrails: {
          input: {
            restrictToTopic: {
              enabled: props.cloudRestrictToTopic ? true : false,
              validTopics: props.cloudRestrictToTopic?.validTopics || [],
              invalidTopics: props.cloudRestrictToTopic?.invalidTopics || []
            }
          }
        }
      }
    }

    // get the appropriate CopilotApiConfig from the props
    const copilotApiConfig: CopilotApiConfig = {
      publicApiKey: props.publicApiKey,
      ...(cloud ? { cloud } : {}),
      chatApiEndpoint: chatApiEndpoint,
      headers: props.headers || {},
      properties: props.properties || {},
      transcribeAudioUrl: props.transcribeAudioUrl,
      textToSpeechUrl: props.textToSpeechUrl,
      credentials: props.credentials
    }

    provide<CopilotContextParams>(CopilotKitContext, {
      chatComponentsCache,
      actions,
      getFunctionCallHandler,
      setAction,
      removeAction,
      getContextString,
      addContext,
      removeContext,
      getDocumentsContext,
      addDocumentContext,
      removeDocumentContext,
      copilotApiConfig,
      messages,
      setMessages,
      isLoading,
      setIsLoading,
      chatSuggestionConfiguration,
      addChatSuggestionConfiguration,
      removeChatSuggestionConfiguration,
      chatInstructions,
      setChatInstructions,
      showDevConsole: props.showDevConsole || 'auto'
    })

    return () => {
      return <>{renderSlot(slots, 'default')}</>
    }
  }
})

export const defaultCopilotContextCategories = ['global']

function entryPointsToFunctionCallHandler(actions: FrontendAction<any>[]): FunctionCallHandler {
  return async ({ messages, name, args }) => {
    let actionsByFunctionName: Record<string, FrontendAction<any>> = {}
    for (let action of actions) {
      actionsByFunctionName[action.name] = action
    }

    const action = actionsByFunctionName[name]
    let result: any = undefined
    if (action) {
      await new Promise<void>(async (resolve, reject) => {
        try {
          result = await action.handler(args)
          resolve()
        } catch (error) {
          reject(error)
        }
      })
      await new Promise(resolve => setTimeout(resolve, 20))
    }
    return result
  }
}

function returnAndThrowInDebug<T>(value: T): T {
  // throw new Error('Remember to wrap your app in a `<CopilotKit> {...} </CopilotKit>` !!!')
  return value
}
