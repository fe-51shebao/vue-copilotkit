import { arraysAreEqual } from '../../lib/utils'

export interface EditorAutocompleteState {
  cursorPoint: number
  textBeforeCursor: string
  textAfterCursor: string
}

export function areEqual_autocompleteState(prev: EditorAutocompleteState, next: EditorAutocompleteState) {
  return (
    prev.cursorPoint === next.cursorPoint &&
    prev.textBeforeCursor === next.textBeforeCursor &&
    prev.textAfterCursor === next.textAfterCursor
  )
}
