import { Editor } from '@tiptap/core'
import { EditorAutocompleteState } from '../types/base/editor-autocomplete-state'
import { ShallowRef } from 'vue'

export interface EditorTextState {
  selection: {
    anchor: number
    focus: number
  }
  textBeforeCursor: string
  selectedText: string
  textAfterCursor: string
}

export function getTextAroundCollapsedCursor(editor: ShallowRef<Editor | undefined>): EditorAutocompleteState | null {
  if (!editor.value) {
    return null
  }
  const { state } = editor.value
  const { selection } = state

  if (!selection.empty) {
    return null
  }

  const cursorPos = selection.anchor
  let before = ''
  let after = ''
  let currentPos = 0

  state.doc.descendants((node, pos) => {
    const nodeEndPos = pos + node.nodeSize

    // Ignore nodes with the name "suggestion"
    if (node.type.name === 'suggestion') {
      currentPos = nodeEndPos
      return false // Skip this node
    }

    if (node.isText) {
      const nodeText = node.text || ''

      if (nodeEndPos <= cursorPos) {
        before += nodeText
      } else if (pos >= cursorPos) {
        after += nodeText
      } else {
        const beforeCursorText = nodeText.slice(0, cursorPos - pos)
        const afterCursorText = nodeText.slice(cursorPos - pos)

        before += beforeCursorText
        after += afterCursorText
      }
    }

    currentPos = nodeEndPos
    return true // Continue to the next node
  })

  return {
    cursorPoint: cursorPos,
    textBeforeCursor: before,
    textAfterCursor: after
  }
}

export function getTextAroundSelection(editor: Editor): EditorTextState | null {
  if (!editor) {
    return null
  }
  const { state } = editor
  const { selection } = state

  if (!selection) {
    return null
  }

  const anchor = Math.min(selection.anchor, selection.head)
  const focus = Math.max(selection.anchor, selection.head)

  const textBeforeCursor = extractTextWithNewlines(editor, 0, anchor)
  const selectedText = extractTextWithNewlines(editor, anchor, focus)
  const textAfterCursor = extractTextWithNewlines(editor, focus, state.doc.content.size)

  return {
    selection: { anchor, focus },
    textBeforeCursor,
    selectedText,
    textAfterCursor
  }
}

export function getFullEditorTextWithNewline(editor: Editor): string {
  return extractTextWithNewlines(editor, 0, editor?.state.doc.content.size ?? 0)
}

export function getFullEditorTextWithNewlines(editor: ShallowRef<Editor | undefined>): string {
  return editor.value?.state.doc.textContent ?? ''
}

// Helper function to extract text with newlines
function extractTextWithNewlines(editor: Editor, from: number, to: number): string {
  const text = editor.state.doc.textBetween(from, to, '\n', '\n')
  return text
}
