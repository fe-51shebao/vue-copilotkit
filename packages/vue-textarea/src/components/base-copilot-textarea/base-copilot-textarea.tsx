import { defineComponent, ref, watch, computed, reactive, PropType, watchEffect, onBeforeUnmount } from 'vue'
import { EditorContent } from '@tiptap/vue-3'
import { useCopilotTextareaEditor } from '../../hooks/base-copilot-textarea-implementation/use-copilot-textarea-editor'
import { useAutosuggestions } from '../../hooks/base-copilot-textarea-implementation/use-autosuggestions'
import { addAutocompletionsToEditor } from '../../lib/tiptap-edits/add-autocompletions'
// import { usePopulateCopilotTextareaRef } from '../../hooks/base-copilot-textarea-implementation/use-populate-copilot-textarea-ref'
import { getFullEditorTextWithNewlines, getTextAroundCollapsedCursor } from '../../lib/get-text-around-cursor'
import { clearAutocompletionsFromEditor } from '../../lib/tiptap-edits/clear-autocompletions'
import { replaceEditorText } from '../../lib/tiptap-edits/replace-text'
import { BaseAutosuggestionsConfig, defaultBaseAutosuggestionsConfig } from '../../types/base'
import { BaseCopilotTextareaProps, SemiFakeTextAreaEvent } from '../../types/base/base-copilot-textarea-props'
import './base-copilot-textarea.css'
import { useAddBrandingCss } from './use-add-branding-css'
import { useAddPlaceholderCss } from './use-add-placeholder-css'
import { nextTick } from 'vue'
import { AutosuggestionState } from '../../types/base/autosuggestion-state'
import { useCursorMovementTracker } from '../../hooks/track-cursor-moved-since-last-text-change'
import { useHoveringEditorContext } from '../hovering-toolbar/hovering-editor-provider'
import { HoveringToolbar } from '../hovering-toolbar/hovering-toolbar'

export const BaseCopilotTextarea = defineComponent({
  name: 'BaseCopilotTextarea',
  props: {
    value: {
      type: String,
      default: ''
    },
    baseAutosuggestionsConfig: {
      type: Object as () => BaseAutosuggestionsConfig,
      default: () => ({})
    },
    onChange: {
      type: Function as PropType<(event: SemiFakeTextAreaEvent) => void>,
      default: () => () => {}
    },
    disableBranding: {
      type: Boolean,
      default: false
    },
    placeholderStyle: {
      type: Object,
      default: () => ({})
    },
    suggestionsStyle: {
      type: Object,
      default: () => ({})
    },
    hoverMenuClassname: {
      type: String,
      default: ''
    },
    onValueChange: {
      type: Function as PropType<(value: string) => void>,
      default: () => () => {}
    },
    shortcut: {
      type: String,
      default: 'k'
    },
    className: {
      type: String,
      default: ''
    },
    editorStyle: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props: BaseCopilotTextareaProps, { attrs, expose }) {
    const autosuggestionsConfig: BaseAutosuggestionsConfig = reactive({
      ...defaultBaseAutosuggestionsConfig,
      ...props.baseAutosuggestionsConfig
    })

    const valueOnInitialRender = ref(props.value ?? '') // 保存初始渲染时的值
    const lastKnownFullEditorText = ref(valueOnInitialRender.value) // 保存上一次编辑器中的完整文本
    const cursorMovedSinceLastTextChange = ref(false) // 标记自上次文本更改以来是否移动了光标

    const editor = useCopilotTextareaEditor(valueOnInitialRender.value, props.placeholder)
    // 将编辑器暴露给外部
    const { isDisplayed: hoveringEditorIsDisplayed, setIsDisplayed: setHoveringEditorIsDisplayed } =
      useHoveringEditorContext()
    // const hoveringEditorIsDisplayed = ref(false)

    // 在编辑器中插入文本
    const insertText = (autosuggestion: AutosuggestionState) => {
      editor.value?.commands.insertContentAt(autosuggestion.point, autosuggestion.text?.replace(/\n/g, '<br>'))
    }

    useCursorMovementTracker(
      editor,
      cursorMovedSinceLastTextChange,
      autosuggestionsConfig.temporarilyDisableWhenMovingCursorWithoutChangingText
    )
    // 是否禁用自动完成建议
    const shouldDisableAutosuggestions = ref(false)
    watchEffect(() => {
      shouldDisableAutosuggestions.value =
        autosuggestionsConfig.disabled ||
        hoveringEditorIsDisplayed.value ||
        (cursorMovedSinceLastTextChange.value &&
          autosuggestionsConfig.temporarilyDisableWhenMovingCursorWithoutChangingText)
    })

    // 存储当前的自动完成建议。同时，创建一些用于处理自动完成建议的函数
    const {
      currentAutocompleteSuggestion,
      onChangeHandler: onChangeHandlerForAutocomplete,
      onKeyDownHandler: onKeyDownHandlerForAutocomplete,
      onTouchStartHandler: onTouchStartHandlerForAutocomplete,
      handleClearCurrentState
    } = useAutosuggestions(
      autosuggestionsConfig.debounceTime,
      autosuggestionsConfig.shouldAcceptAutosuggestionOnKeyPress,
      autosuggestionsConfig.shouldAcceptAutosuggestionOnTouch,
      autosuggestionsConfig.apiConfig?.autosuggestionsFunction,
      insertText,
      autosuggestionsConfig.disableWhenEmpty,
      shouldDisableAutosuggestions,
      hoveringEditorIsDisplayed
    )

    // 当按下快捷键时，切换悬停编辑器的显示状态
    const onKeyDownHandlerForHoveringEditor = (event: KeyboardEvent) => {
      if (autosuggestionsConfig.shouldToggleHoveringEditorOnKeyPress(event, props.shortcut ?? 'k')) {
        event.preventDefault()
        hoveringEditorIsDisplayed.value = !hoveringEditorIsDisplayed.value
      }
    }

    // 同步自动建议状态与编辑器
    watch(
      () => currentAutocompleteSuggestion.value,
      async () => {
        clearAutocompletionsFromEditor(editor)
        await nextTick()
        if (currentAutocompleteSuggestion.value) {
          addAutocompletionsToEditor(
            editor,
            currentAutocompleteSuggestion.value.text,
            currentAutocompleteSuggestion.value.point
          )
        }
      }
    )

    // 自动完成建议的样式
    const suggestionStyleAugmented = computed(() => {
      return {
        fontStyle: 'italic',
        color: 'gray',
        ...props.suggestionsStyle
      }
    })

    // 渲染元素函数
    const renderElementMemoized = computed(() => {
      return ''
    })

    // 渲染占位符函数
    const renderPlaceholderMemoized = computed(() => {
      return ''
    })

    // 监听 props.value 的变化，并更新编辑器中的文本
    watch(
      () => props.value,
      newValue => {
        if (newValue === lastKnownFullEditorText.value) return
        lastKnownFullEditorText.value = newValue ?? ''
        replaceEditorText(editor, newValue ?? '')
      }
    )
    useAddBrandingCss(suggestionStyleAugmented.value, props.disableBranding)
    useAddPlaceholderCss(props.placeholderStyle)
    // usePopulateCopilotTextareaRef(editor)

    // 计算最终的 class 名称
    const moddedClassName = computed(() => {
      const baseClassName = 'copilot-textarea'
      const brandingClass = props.disableBranding ? 'no-branding' : 'with-branding'
      const defaultTailwindClassName = 'bg-white overflow-y-auto resize-y'
      const mergedClassName = ''.concat(defaultTailwindClassName, ' ', props.className ?? '')
      return `${baseClassName} ${brandingClass} ${mergedClassName}`
    })
    watch(
      moddedClassName,
      async () => {
        await nextTick()
        const class1 = editor.value?.options.editorProps.attributes?.['class']
        editor.value?.setOptions({
          editorProps: {
            ...editor.value?.options.editorProps,
            attributes: {
              ...editor.value?.options.editorProps.attributes,
              class: moddedClassName.value + ' ' + class1
            }
          }
        })
      },
      { immediate: true }
    )
    watch(
      () => editor.value,
      (val, oldVal) => {
        if (val && oldVal) return
        editor.value?.setOptions({
          editorProps: {
            ...editor.value?.options.editorProps,
            handleKeyDown: (view, event) => {
              onKeyDownHandlerForHoveringEditor(event) // forward the event for internal use
              onKeyDownHandlerForAutocomplete(event) // forward the event for internal use
              props.onKeydown?.(event)
            }
            // TODO:Touch
          }
        })
        editor.value?.on('update', async () => {
          await nextTick()
          const newEditorState = getTextAroundCollapsedCursor(editor)

          const fullEditorText = newEditorState
            ? newEditorState.textBeforeCursor + newEditorState.textAfterCursor
            : getFullEditorTextWithNewlines(editor)

          if (lastKnownFullEditorText.value !== fullEditorText) {
            cursorMovedSinceLastTextChange.value = false
          }
          lastKnownFullEditorText.value = fullEditorText

          onChangeHandlerForAutocomplete(newEditorState)

          props.onValueChange?.(fullEditorText)
          props.onChange?.(makeFakeTextAreaEvent(fullEditorText))
        })
        editor.value?.on('blur', ({ event }) => {
          props.onBlur?.(event)
          handleClearCurrentState()
          clearAutocompletionsFromEditor(editor)
        })
      }
    )
    onBeforeUnmount(() => {
      editor.value?.destroy()
    })

    return () => (
      <div>
        <EditorContent editor={editor.value} />
        {hoveringEditorIsDisplayed.value ? (
          <HoveringToolbar
            class={props.hoverMenuClassname}
            editor={editor.value}
            apiConfig={{
              insertionOrEditingFunction: autosuggestionsConfig.apiConfig.insertionOrEditingFunction
            }}
            contextCategories={autosuggestionsConfig.contextCategories}
          />
        ) : null}
      </div>
    )
  }
})

function makeFakeTextAreaEvent(currentText: string): SemiFakeTextAreaEvent {
  return {
    target: {
      value: currentText,
      type: 'copilot-textarea'
    },
    currentTarget: {
      value: currentText,
      type: 'copilot-textarea'
    }
    // 其它 Event 属性可以根据需要填充
  } as SemiFakeTextAreaEvent
}
