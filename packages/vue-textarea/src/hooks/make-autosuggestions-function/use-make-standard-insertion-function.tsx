import { DocumentPointer, useCopilotContext } from '@copilotkit/vue-core'
import { COPILOT_CLOUD_PUBLIC_API_KEY_HEADER, randomId } from '@copilotkit/shared'
import {
  CopilotRuntimeClient,
  Message,
  Role,
  TextMessage,
  convertGqlOutputToMessages,
  convertMessagesToGqlInput,
  CopilotRequestType
} from '@copilotkit/runtime-client-gql'
import { retry } from '../../lib/retry'
import {
  EditingEditorState,
  Generator_InsertionOrEditingSuggestion
} from '../../types/base/autosuggestions-bare-function'
import { InsertionsApiConfig } from '../../types/autosuggestions-config/insertions-api-config'
import { EditingApiConfig } from '../../types/autosuggestions-config/editing-api-config'

export function useMakeStandardInsertionOrEditingFunction(
  textareaPurpose: string,
  contextCategories: string[],
  insertionApiConfig: InsertionsApiConfig,
  editingApiConfig: EditingApiConfig
): Generator_InsertionOrEditingSuggestion {
  const { getContextString, copilotApiConfig } = useCopilotContext()

  const headers = {
    ...(copilotApiConfig.publicApiKey ? { [COPILOT_CLOUD_PUBLIC_API_KEY_HEADER]: copilotApiConfig.publicApiKey } : {})
  }

  const runtimeClient = new CopilotRuntimeClient({
    url: copilotApiConfig.chatApiEndpoint,
    publicApiKey: copilotApiConfig.publicApiKey,
    headers,
    credentials: copilotApiConfig.credentials
  })

  async function runtimeClientResponseToStringStream(
    responsePromise: ReturnType<typeof runtimeClient.generateCopilotResponse>
  ) {
    const messagesStream = await CopilotRuntimeClient.asStream(responsePromise)

    return new ReadableStream({
      async start(controller) {
        const reader = messagesStream.getReader()
        let sentContent = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            break
          }

          const messages = convertGqlOutputToMessages(value.generateCopilotResponse.messages)

          let newContent = ''

          for (const message of messages) {
            if (message instanceof TextMessage) {
              newContent += message.content
            }
          }
          if (newContent) {
            const contentToSend = newContent.slice(sentContent.length)
            controller.enqueue(contentToSend)
            sentContent += contentToSend
          }
        }
        controller.close()
      }
    })
  }

  async function insertionFunction(
    editorState: EditingEditorState,
    insertionPrompt: string,
    documents: DocumentPointer[],
    abortSignal: AbortSignal
  ) {
    const res = await retry(async () => {
      const messages: Message[] = [
        new TextMessage({
          role: Role.System,
          content: insertionApiConfig.makeSystemPrompt(textareaPurpose, getContextString(documents, contextCategories))
        }),
        ...insertionApiConfig.fewShotMessages,
        new TextMessage({
          role: Role.User,
          content: `<TextAfterCursor>${editorState.textAfterCursor}</TextAfterCursor>`
        }),
        new TextMessage({
          role: Role.User,
          content: `<TextBeforeCursor>${editorState.textBeforeCursor}</TextBeforeCursor>`
        }),
        new TextMessage({
          role: Role.User,
          content: `<InsertionPrompt>${insertionPrompt}</InsertionPrompt>`
        })
      ]

      return runtimeClientResponseToStringStream(
        runtimeClient.generateCopilotResponse({
          data: {
            frontend: {
              actions: []
            },
            messages: convertMessagesToGqlInput(messages),
            metadata: {
              requestType: CopilotRequestType.TextareaCompletion
            }
          },
          properties: copilotApiConfig.properties,
          signal: abortSignal
        })
      )
    })

    return res
  }

  async function editingFunction(
    editorState: EditingEditorState,
    editingPrompt: string,
    documents: DocumentPointer[],
    abortSignal: AbortSignal
  ) {
    const res = await retry(async () => {
      const messages: Message[] = [
        new TextMessage({
          role: Role.System,
          content: editingApiConfig.makeSystemPrompt(textareaPurpose, getContextString(documents, contextCategories))
        }),
        ...editingApiConfig.fewShotMessages,
        new TextMessage({
          role: Role.User,
          content: `<TextBeforeCursor>${editorState.textBeforeCursor}</TextBeforeCursor>`
        }),
        new TextMessage({
          role: Role.User,
          content: `<TextToEdit>${editorState.selectedText}</TextToEdit>`
        }),
        new TextMessage({
          role: Role.User,
          content: `<TextAfterCursor>${editorState.textAfterCursor}</TextAfterCursor>`
        }),
        new TextMessage({
          role: Role.User,
          content: `<EditingPrompt>${editingPrompt}</EditingPrompt>`
        })
      ]

      return runtimeClientResponseToStringStream(
        runtimeClient.generateCopilotResponse({
          data: {
            frontend: {
              actions: []
            },
            messages: convertMessagesToGqlInput(messages),
            metadata: {
              requestType: CopilotRequestType.TextareaCompletion
            }
          },
          properties: copilotApiConfig.properties,
          signal: abortSignal
        })
      )
    })

    return res
  }

  async function insertionOrEditingFunction(
    editorState: EditingEditorState,
    insertionPrompt: string,
    documents: DocumentPointer[],
    abortSignal: AbortSignal
  ) {
    if (editorState.selectedText === '') {
      return await insertionFunction(editorState, insertionPrompt, documents, abortSignal)
    } else {
      return await editingFunction(editorState, insertionPrompt, documents, abortSignal)
    }
  }

  return insertionOrEditingFunction
}
