import { defineComponent, ref, PropType } from 'vue'
import { BaseCopilotTextarea } from '../base-copilot-textarea/base-copilot-textarea'
import { useMakeStandardInsertionOrEditingFunction } from '../../hooks/make-autosuggestions-function/use-make-standard-insertion-function'
import { useMakeStandardAutosuggestionFunction } from '../../hooks/make-autosuggestions-function/use-make-standard-autosuggestions-function'
import { HTMLCopilotTextAreaElement } from '../../types'
import { BaseCopilotTextareaProps, SemiFakeTextAreaEvent } from '../../types/base/base-copilot-textarea-props'
import { AutosuggestionsConfig, defaultAutosuggestionsConfig } from '../../types/autosuggestions-config'
import { AutosuggestionsConfigUserSpecified } from '../../types/autosuggestions-config/autosuggestions-config-user-specified'
import merge from 'lodash.merge'
import { HoveringEditorProvider } from '../hovering-toolbar/hovering-editor-provider'

export interface CopilotTextareaProps extends Omit<BaseCopilotTextareaProps, 'baseAutosuggestionsConfig'> {
  autosuggestionsConfig: AutosuggestionsConfigUserSpecified
}

export const CopilotTextarea = defineComponent({
  name: 'CopilotTextarea',
  props: {
    autosuggestionsConfig: {
      type: Object as PropType<AutosuggestionsConfigUserSpecified>,
      default: () => ({})
    },
    ...BaseCopilotTextarea.props
  },
  setup(props: CopilotTextareaProps, { expose }) {
    const refTextarea = ref<HTMLCopilotTextAreaElement | null>(null)
    expose({
      ref: refTextarea
    })

    // separate the AutosuggestionsConfigUserSpecified from the rest of the props
    const { autosuggestionsConfig: autosuggestionsConfigUserSpecified, ...forwardedProps } = props

    const autosuggestionsConfig: AutosuggestionsConfig = merge(
      defaultAutosuggestionsConfig,
      autosuggestionsConfigUserSpecified
    )

    const autosuggestionsFunction = useMakeStandardAutosuggestionFunction(
      autosuggestionsConfig.textareaPurpose,
      autosuggestionsConfig.contextCategories,
      autosuggestionsConfig.chatApiConfigs.suggestionsApiConfig
    )

    const insertionOrEditingFunction = useMakeStandardInsertionOrEditingFunction(
      autosuggestionsConfig.textareaPurpose,
      autosuggestionsConfig.contextCategories,
      autosuggestionsConfig.chatApiConfigs.insertionApiConfig,
      autosuggestionsConfig.chatApiConfigs.editingApiConfig
    )

    return () => (
      <div>
        <HoveringEditorProvider>
          <BaseCopilotTextarea
            class="base-copilot-textarea text-tiptap relative"
            {...props}
            baseAutosuggestionsConfig={{
              ...autosuggestionsConfig,
              apiConfig: {
                insertionOrEditingFunction,
                autosuggestionsFunction
              }
            }}
          />
        </HoveringEditorProvider>
      </div>
    )
  }
})
