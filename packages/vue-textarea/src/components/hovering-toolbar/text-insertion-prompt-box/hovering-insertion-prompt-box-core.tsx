import { defineComponent, ref, onMounted, watch, computed, PropType } from 'vue'
import useAutosizeTextArea from '../../../hooks/misc/use-autosize-textarea'
import {
  EditingEditorState,
  Generator_InsertionOrEditingSuggestion
} from '../../../types/base/autosuggestions-bare-function'
import { SourceSearchBox } from '../../source-search-box/source-search-box'
import { DocumentPointer, useCopilotContext } from '@copilotkit/vue-core'
import { streamPromiseFlatten } from '../../../lib/stream-promise-flatten'
import { IncludedFilesPreview } from './included-files-preview'
import { useHoveringEditorContext } from '../hovering-editor-provider'
import { ElButton } from 'element-plus'
import '../../../css/tailwind.css'

export type SuggestionState = {
  editorState: EditingEditorState
}

export interface HoveringInsertionPromptBoxCoreProps {
  state: SuggestionState
  performInsertion: (insertedText: string) => void
  insertionOrEditingFunction: Generator_InsertionOrEditingSuggestion
  contextCategories: string[]
}

export const HoveringInsertionPromptBoxCore = defineComponent({
  name: 'HoveringInsertionPromptBoxCore',
  props: {
    state: {
      type: Object as () => SuggestionState,
      required: true
    },
    performInsertion: {
      type: Function as PropType<(insertedText: string) => void>,
      required: true
    },
    insertionOrEditingFunction: {
      type: Function as PropType<Generator_InsertionOrEditingSuggestion>,
      required: true
    },
    contextCategories: {
      type: Array as () => string[],
      required: true
    }
  },
  setup(props: HoveringInsertionPromptBoxCoreProps) {
    const { getDocumentsContext } = useCopilotContext()

    const editSuggestion = ref('')
    const suggestionIsLoading = ref(false)
    const adjustmentPrompt = ref('')
    const generatingSuggestion = ref<ReadableStream<string> | null>(null)
    const adjustmentTextAreaRef = ref<HTMLTextAreaElement | null>(null)
    const suggestionTextAreaRef = ref<HTMLTextAreaElement | null>(null)
    const filePointers = ref<DocumentPointer[]>([])
    const suggestedFiles = ref<DocumentPointer[]>([])

    watch(
      () => props.contextCategories,
      () => {
        suggestedFiles.value = getDocumentsContext(props.contextCategories)
      },
      { immediate: true }
    )

    useAutosizeTextArea(
      suggestionTextAreaRef,
      computed(() => editSuggestion.value || '')
    )
    useAutosizeTextArea(
      adjustmentTextAreaRef,
      computed(() => adjustmentPrompt.value || '')
    )

    onMounted(() => {
      adjustmentTextAreaRef.value?.focus()
    })

    // continuously read the generating suggestion stream and update the edit suggestion
    watch(generatingSuggestion, () => {
      if (!generatingSuggestion.value || generatingSuggestion.value.locked) return

      // reset the edit suggestion
      editSuggestion.value = ''

      const reader = generatingSuggestion.value.getReader()
      const read = async () => {
        suggestionIsLoading.value = true
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          editSuggestion.value += value

          if (suggestionTextAreaRef.value) {
            suggestionTextAreaRef.value.scrollTop = suggestionTextAreaRef.value.scrollHeight
          }
        }
        suggestionIsLoading.value = false
      }
      read()

      return () => {
        // release the lock if the reader is not closed on unmount
        reader.closed.catch(() => reader.releaseLock())
      }
    })

    // 根据调整提示，对已完成的文本进行调整
    const beginGeneratingAdjustment = async () => {
      if (!adjustmentPrompt.value.trim()) return

      // 编辑器状态包括正在编辑的文本，以及选择之前/之后的文本
      // 如果当前编辑建议不为空，则将其用作“选定的文本” - 而不是编辑器状态的选定文本
      let modificationState = props.state.editorState
      if (editSuggestion.value !== '') {
        modificationState = { ...modificationState, selectedText: editSuggestion.value }
      }

      const adjustmentSuggestionTextStreamPromise = props.insertionOrEditingFunction(
        modificationState,
        adjustmentPrompt.value,
        filePointers.value,
        new AbortController().signal
      )
      generatingSuggestion.value = streamPromiseFlatten(adjustmentSuggestionTextStreamPromise)
    }

    const { setIsDisplayed } = useHoveringEditorContext()

    const sourceSearchCandidate = computed(() => adjustmentPrompt.value.split(' ').pop())
    const sourceSearchWord = computed(() =>
      sourceSearchCandidate.value?.startsWith('@') ? sourceSearchCandidate.value.slice(1) : undefined
    )

    return () => (
      <div class="w-full flex flex-col items-start relative gap-2">
        <div class="w-full">
          <p style="font-weight: bold">
            {editSuggestion.value === ''
              ? 'Describe the text you want to insert'
              : 'Describe adjustments to the suggested text'}
          </p>
          <div class="relative w-full flex items-center">
            <textarea
              disabled={suggestionIsLoading.value}
              ref={adjustmentTextAreaRef}
              value={adjustmentPrompt.value}
              onInput={e => (adjustmentPrompt.value = (e.target as HTMLTextAreaElement).value)}
              onKeydown={e => {
                if (e.key === 'Enter' && e.shiftKey) {
                  e.preventDefault()
                  adjustmentPrompt.value += '\n'
                } else if (e.key === 'Enter') {
                  e.preventDefault()
                  beginGeneratingAdjustment()
                } else if (e.key == 'Escape') {
                  e.preventDefault()
                  setIsDisplayed(false)
                }
              }}
              placeholder={
                editSuggestion.value === ''
                  ? "e.g. 'summarize the client's top 3 pain-points from @CallTranscript'"
                  : "e.g. 'make it more formal', 'be more specific', ..."
              }
              style={{ minHeight: '3rem' }}
              class="w-full bg-slate-100 h-auto h-min-14 text-sm p-2 rounded-md resize-none overflow-visible focus:outline-none focus:ring-0 focus:border-none pr-3rem"
              rows={1}
            />
            <button
              onClick={beginGeneratingAdjustment}
              class="absolute right-2 bg-blue-500 text-white w-8 h-8 p-0 rounded-full flex items-center justify-center"
            >
              <i class="material-icons">
                <rightIcon />
              </i>
            </button>
          </div>
        </div>
        {filePointers.value.length > 0 && (
          <IncludedFilesPreview
            includedFiles={filePointers.value}
            setIncludedFiles={files => (filePointers.value = files)}
          />
        )}
        {sourceSearchWord.value !== undefined && (
          <SourceSearchBox
            searchTerm={sourceSearchWord.value}
            suggestedFiles={suggestedFiles.value}
            onSelectedFile={filePointer => {
              adjustmentPrompt.value = adjustmentPrompt.value.replace(new RegExp(`@${sourceSearchWord.value}$`), '')
              filePointers.value.push(filePointer)
              adjustmentTextAreaRef.value?.focus()
            }}
          />
        )}
        {generatingSuggestion.value && (
          <>
            <div class="flex justify-between items-end w-full">
              <p class="mt-4">Suggested:</p>
              <div class="ml-auto">
                {suggestionIsLoading.value && (
                  <div class="flex justify-center items-center">
                    <div
                      class="inline-block h-4 w-4 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                      role="status"
                    >
                      <span class="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                        Loading...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div class="flex w-full">
              <textarea
                ref={suggestionTextAreaRef}
                value={editSuggestion.value}
                disabled={suggestionIsLoading.value}
                onInput={e => (editSuggestion.value = (e.target as HTMLTextAreaElement).value)}
                class="w-full text-base p-2 border border-gray-300 rounded-md resize-none bg-green-50"
                style={{ overflow: 'auto', maxHeight: '10em' }}
              />
            </div>
          </>
        )}
        {generatingSuggestion.value && (
          <div class="flex w-full gap-4 justify-start">
            <ElButton
              type="success"
              class=" bg-green-700 text-white"
              onClick={() => {
                props.performInsertion(editSuggestion.value)
              }}
            >
              Insert <i class="material-icons">check</i>
            </ElButton>
          </div>
        )}
      </div>
    )
  }
})

const rightIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="24" height="24">
    <path
      fill="currentColor"
      d="M754.752 480H160a32 32 0 1 0 0 64h594.752L521.344 777.344a32 32 0 0 0 45.312 45.312l288-288a32 32 0 0 0 0-45.312l-288-288a32 32 0 1 0-45.312 45.312z"
    ></path>
  </svg>
)
