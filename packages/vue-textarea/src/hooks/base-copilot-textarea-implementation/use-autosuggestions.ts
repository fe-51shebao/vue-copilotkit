import { ref, computed, watchEffect, Ref } from 'vue'
import { Debouncer } from '../../lib/debouncer'
import { nullableCompatibleEqualityCheck } from '../../lib/utils'
import { AutosuggestionsBareFunction } from '../../types/base'
import { AutosuggestionState } from '../../types/base/autosuggestion-state'
import { EditorAutocompleteState, areEqual_autocompleteState } from '../../types/base/editor-autocomplete-state'

export interface UseAutosuggestionsResult {
  currentAutocompleteSuggestion: Ref<AutosuggestionState | null>
  onChangeHandler: (newEditorState: EditorAutocompleteState | null) => void
  onKeyDownHandler: (event: KeyboardEvent) => void
  onTouchStartHandler: (event: TouchEvent) => void
}

export function useAutosuggestions(
  debounceTime: number,
  shouldAcceptAutosuggestionOnKeyPress: (event: KeyboardEvent) => boolean,
  shouldAcceptAutosuggestionOnTouch: (event: TouchEvent) => boolean,
  autosuggestionFunction: AutosuggestionsBareFunction,
  insertAutocompleteSuggestion: (suggestion: AutosuggestionState) => void,
  disableWhenEmpty: boolean,
  disabled: Ref<boolean>,
  hoveringEditorIsDisplayed: Ref<boolean>
): UseAutosuggestionsResult {
  const previousAutocompleteState = ref<EditorAutocompleteState | null>(null)
  const currentAutocompleteSuggestion = ref<AutosuggestionState | null>(null)

  const awaitForAndAppendSuggestion = async (
    editorAutocompleteState: EditorAutocompleteState,
    abortSignal: AbortSignal
  ) => {
    if (disabled.value) {
      return
    }

    if (
      disableWhenEmpty &&
      editorAutocompleteState.textBeforeCursor === '' &&
      editorAutocompleteState.textAfterCursor === ''
    ) {
      return
    }

    const suggestion = await autosuggestionFunction(editorAutocompleteState, abortSignal)

    if (!suggestion || abortSignal.aborted) {
      throw new DOMException('Aborted', 'AbortError')
    }

    if (disabled.value) {
      return
    }
    currentAutocompleteSuggestion.value = {
      text: suggestion,
      point: editorAutocompleteState.cursorPoint
    }
  }

  const debouncedFunction = computed(() => {
    return new Debouncer<[editorAutocompleteState: EditorAutocompleteState]>(debounceTime)
  })

  watchEffect(onInvalidate => {
    onInvalidate(() => {
      debouncedFunction.value.cancel()
      currentAutocompleteSuggestion.value = null
    })
  })

  const onChange = (newEditorState: EditorAutocompleteState | null) => {
    const editorStateHasChanged = !nullableCompatibleEqualityCheck(
      areEqual_autocompleteState,
      previousAutocompleteState.value,
      newEditorState
    )
    previousAutocompleteState.value = newEditorState

    if (!editorStateHasChanged) {
      return
    }

    currentAutocompleteSuggestion.value = null

    if (newEditorState && !hoveringEditorIsDisplayed.value) {
      debouncedFunction.value.debounce(awaitForAndAppendSuggestion, newEditorState)
    } else {
      debouncedFunction.value.cancel()
    }
  }

  const keyDownOrTouchHandler = (event: KeyboardEvent | TouchEvent) => {
    if (currentAutocompleteSuggestion.value) {
      const shouldAcceptSuggestion =
        event.type === 'touchstart'
          ? shouldAcceptAutosuggestionOnTouch(event as TouchEvent)
          : shouldAcceptAutosuggestionOnKeyPress(event as KeyboardEvent)

      if (shouldAcceptSuggestion) {
        event.preventDefault()
        insertAutocompleteSuggestion(currentAutocompleteSuggestion.value)
      }
      currentAutocompleteSuggestion.value = null
    }
  }

  return {
    currentAutocompleteSuggestion: currentAutocompleteSuggestion,
    onChangeHandler: onChange,
    onKeyDownHandler: keyDownOrTouchHandler,
    onTouchStartHandler: keyDownOrTouchHandler
  }
}
