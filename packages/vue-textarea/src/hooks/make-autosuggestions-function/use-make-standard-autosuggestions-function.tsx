import { useCopilotContext } from '@copilotkit/vue-core'
import { COPILOT_CLOUD_PUBLIC_API_KEY_HEADER } from '@copilotkit/shared'
import { retry } from '../../lib/retry'
import { AutosuggestionsBareFunction } from '../../types'
import { InsertionEditorState } from '../../types/base/autosuggestions-bare-function'
import { SuggestionsApiConfig } from '../../types/autosuggestions-config/suggestions-api-config'
import {
  CopilotRuntimeClient,
  Message,
  Role,
  TextMessage,
  convertGqlOutputToMessages,
  convertMessagesToGqlInput,
  CopilotRequestType
} from '@copilotkit/runtime-client-gql'

export function useMakeStandardAutosuggestionFunction(
  textareaPurpose: string,
  contextCategories: string[],
  apiConfig: SuggestionsApiConfig
): AutosuggestionsBareFunction {
  const { getContextString, copilotApiConfig } = useCopilotContext()
  const { chatApiEndpoint: url, publicApiKey, credentials, properties } = copilotApiConfig
  const headers = {
    ...copilotApiConfig.headers,
    ...(publicApiKey ? { [COPILOT_CLOUD_PUBLIC_API_KEY_HEADER]: publicApiKey } : {})
  }
  const { maxTokens, stop } = apiConfig

  async function makeAutosuggestion(editorState: InsertionEditorState, abortSignal: AbortSignal) {
    const res = await retry(async () => {
      const messages: Message[] = [
        new TextMessage({
          role: Role.System,
          content: apiConfig.makeSystemPrompt(textareaPurpose, getContextString([], contextCategories))
        }),
        ...apiConfig.fewShotMessages,
        new TextMessage({
          role: Role.User,
          content: editorState.textAfterCursor
        }),
        new TextMessage({
          role: Role.User,
          content: `<TextAfterCursor>${editorState.textAfterCursor}</TextAfterCursor>`
        }),
        new TextMessage({
          role: Role.User,
          content: `<TextBeforeCursor>${editorState.textBeforeCursor}</TextBeforeCursor>`
        })
      ]

      const runtimeClient = new CopilotRuntimeClient({
        url,
        publicApiKey,
        headers,
        credentials
      })

      const response = await runtimeClient
        .generateCopilotResponse({
          data: {
            frontend: {
              actions: []
            },
            messages: convertMessagesToGqlInput(messages),
            metadata: {
              requestType: CopilotRequestType.TextareaCompletion
            },
            forwardedParameters: {
              maxTokens,
              stop
            }
          },
          properties,
          signal: abortSignal
        })
        .toPromise()

      let result = ''
      for (const message of convertGqlOutputToMessages(response.data?.generateCopilotResponse?.messages ?? [])) {
        if (abortSignal.aborted) {
          break
        }
        if (message instanceof TextMessage) {
          result += message.content
          console.log(message.content)
        }
      }

      return result
    })

    return res
  }

  return makeAutosuggestion
}
