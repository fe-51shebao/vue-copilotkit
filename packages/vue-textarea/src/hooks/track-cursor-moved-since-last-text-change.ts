import { Ref, ref, watch, ShallowRef } from 'vue'
import { Editor } from '@tiptap/vue-3'
import { clearAutocompletionsFromEditor } from '../lib/tiptap-edits/clear-autocompletions'

interface RelevantEditorState {
  selection: {
    anchor: number
    head: number
  } | null
  text: string
}

export function useCursorMovementTracker(
  editor: ShallowRef<Editor | undefined>,
  cursorMovedSinceLastTextChange: Ref<boolean>,
  temporarilyDisableWhenMovingCursorWithoutChangingText: boolean
) {
  const previousState = ref<RelevantEditorState>({
    selection: null,
    text: ''
  })

  // 监听 editor 的 selection 和 text 的变化
  watch(
    () => {
      if (!editor.value) return { selection: null, text: '' }

      const { state } = editor.value
      const { anchor, head } = state.selection
      let text = ''
      let currentPos = 0

      state.doc.descendants((node, pos) => {
        const nodeEndPos = pos + node.nodeSize
        // Ignore nodes with the name "suggestion"
        if (node.type.name === 'suggestion') {
          currentPos = nodeEndPos
          return false // Skip this node
        }
        if (node.isText) {
          text += node.text
        }
        currentPos = nodeEndPos
        return true // Continue to the next node
      })

      return {
        selection: { anchor, head },
        text
      }
    },
    currentState => {
      if (previousState.value.selection && previousState.value.text !== undefined) {
        if (cursorChangedWithoutTextChanged(previousState.value, currentState)) {
          cursorMovedSinceLastTextChange.value = true
          if (temporarilyDisableWhenMovingCursorWithoutChangingText) clearAutocompletionsFromEditor(editor)
        }
      }
      previousState.value = currentState
    },
    { immediate: true, deep: true }
  )

  const cursorChangedWithoutTextChanged = (prev: RelevantEditorState, next: RelevantEditorState) => {
    const isSelectionChanged = !isSelectionEqual(prev.selection, next.selection)
    const isTextSame = prev.text === next.text
    return isSelectionChanged && isTextSame
  }

  const isSelectionEqual = (a: RelevantEditorState['selection'], b: RelevantEditorState['selection']) => {
    if (!a && !b) return true
    if (!a || !b) return false
    return a.anchor === b.anchor && a.head === b.head
  }

  return {
    cursorMovedSinceLastTextChange
  }
}
