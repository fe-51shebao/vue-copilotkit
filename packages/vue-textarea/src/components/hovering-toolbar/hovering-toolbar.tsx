import { computed, defineComponent, nextTick, onMounted, watchEffect, onUnmounted, ref } from 'vue'
import { useHoveringEditorContext } from './hovering-editor-provider'
import { Editor } from '@tiptap/vue-3'
import { HoveringInsertionPromptBoxCore } from './text-insertion-prompt-box'
import { InsertionEditorApiConfig, EditingEditorState } from '../../types/base/autosuggestions-bare-function'
import { getTextAroundSelection, getFullEditorTextWithNewline } from '../../lib/get-text-around-cursor'
import { Selection } from 'prosemirror-state'

export const HoveringToolbar = defineComponent({
  name: 'HoveringToolbar',
  props: {
    editor: {
      type: Editor
    },
    apiConfig: {
      type: Object as () => InsertionEditorApiConfig,
      default: () => ({})
    },
    contextCategories: {
      type: Array as () => string[],
      default: () => []
    }
  },
  setup(props, { slots }) {
    const { isDisplayed: hoveringEditorIsDisplayed } = useHoveringEditorContext()
    const selection = computed(() => props.editor?.state.selection)
    const HoveringToolbarRef = ref<HTMLDivElement>()
    const handleClickOutside = (e: MouseEvent) => {
      if (HoveringToolbarRef.value && !HoveringToolbarRef.value.contains(e.target as Node)) {
        hoveringEditorIsDisplayed.value = false
      }
    }
    // 位置
    const editorTop = ref(0)
    const getCursorPixelPosition = () => {
      if (!props.editor) {
        return
      }
      const { state, view } = props.editor
      const { from, to } = state.selection

      // 获取光标所在的DOM节点及其相对偏移量
      const resolvedPos = view.docView.domFromPos(to)
      const domNode = resolvedPos.node
      const offset = resolvedPos.offset

      // 获取编辑器容器的位置信息
      const editorRect = view.dom.getBoundingClientRect()
      // 获取光标的范围并计算其像素位置
      const range = document.createRange()
      range.setStart(domNode, offset)
      range.setEnd(domNode, offset)

      let rect = range.getBoundingClientRect()
      if (rect.width === 0 && rect.height === 0) {
        const contentEndRect =
          document.querySelector('.ProseMirror.tiptap.copilot-textarea')?.lastElementChild?.getBoundingClientRect() ||
          editorRect
        // 将光标位置设为内容末尾
        rect = {
          left: contentEndRect.right,
          top: contentEndRect.bottom,
          right: contentEndRect.right,
          bottom: contentEndRect.bottom,
          width: 0,
          height: 0,
          x: contentEndRect.right,
          y: contentEndRect.bottom,
          toJSON: () => rect
        }
        // console.log('光标位于内容末尾，使用内容末尾坐标:', rect)
      }

      // 计算光标相对于编辑器左上角的像素位置
      const relativeX = rect.left - editorRect.left
      const relativeY = rect.top - editorRect.top + rect.height + 2 // 留2px的行间距
      editorTop.value = relativeY

      return { x: relativeX, y: relativeY }
    }
    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
      getCursorPixelPosition()
      watchEffect(() => {
        if (!selection.value) {
          return
        }
        const domSelection = window.getSelection()
        if (!domSelection || domSelection.rangeCount === 0) {
          return
        }
      })
    })
    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return () => (
      <div
        ref={HoveringToolbarRef}
        class="absolute border p-2 shadow-lg bg-white rounded-md w-80_ l-10_"
        style={{ top: `${editorTop.value}px` }}
      >
        <HoveringInsertionPromptBoxCore
          state={{
            editorState: editorState(props.editor, selection.value)
          }}
          insertionOrEditingFunction={props.apiConfig.insertionOrEditingFunction}
          performInsertion={async (insertedText: string) => {
            if (!props.editor || !selection.value) {
              hoveringEditorIsDisplayed.value = false
              return
            }
            // replace the selection with the inserted text
            const { state, view } = props.editor
            const { tr } = state
            tr.delete(selection.value.from, selection.value.to)
            // tr.insertText(insertedText, selection.value.from)
            props.editor.commands.insertContentAt(selection.value.from, insertedText?.replace(/\n/g, '<br>'))
            // 如果文档变更有意义，则提交变更
            if (tr.docChanged) {
              view.dispatch(tr)
            }
            await nextTick()
            hoveringEditorIsDisplayed.value = false
          }}
          contextCategories={props.contextCategories}
        />
      </div>
    )
  }
})

function editorState(editor: Editor | undefined, selection: Selection | undefined): EditingEditorState {
  if (!editor) {
    return {
      textBeforeCursor: '',
      textAfterCursor: '',
      selectedText: ''
    }
  }
  const textAroundCursor = getTextAroundSelection(editor)
  if (textAroundCursor) {
    return textAroundCursor
  }

  return {
    textBeforeCursor: getFullEditorTextWithNewline(editor),
    textAfterCursor: '',
    selectedText: ''
  }
}
