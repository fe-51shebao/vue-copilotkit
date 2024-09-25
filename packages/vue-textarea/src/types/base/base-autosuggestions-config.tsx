import { BaseCopilotTextareaApiConfig } from './autosuggestions-bare-function'
import { defaultCopilotContextCategories } from '@copilotkit/vue-core'

/**
 * @interface BaseAutosuggestionsConfig
 *
 * @property {string} textareaPurpose - 文本区域的目的。这用于指导自动建议。
 *
 * @property {string[]} contextCategories - 在提供自动建议时考虑的上下文类别。
 *
 * @property {number} debounceTime - 用户停止输入后触发自动建议之前等待的时间（以毫秒为单位）。
 *
 * @property {BaseCopilotTextareaApiConfig} apiConfig - 提供自动建议的 API 配置。
 *
 * @property {boolean} disableWhenEmpty - 当文本区域为空时是否禁用自动建议。
 *
 * @property {boolean} disabled - 是否完全禁用自动建议。
 *
 * @property {boolean} temporarilyDisableWhenMovingCursorWithoutChangingText - 当用户在不更改文本的情况下移动光标时是否暂时禁用自动建议。
 *
 * @property {(event: KeyboardEvent) => boolean} shouldAcceptAutosuggestionOnKeyPress - 一个函数，根据按键事件确定是否接受当前的自动建议。默认情况下，Tab 键用于接受自动建议。
 *
 * @property {(event: TouchEvent) => boolean} shouldAcceptAutosuggestionOnTouch - 一个函数，根据移动触摸事件确定是否接受当前的自动建议。默认情况下，触摸建议的末尾将接受它。
 *
 * @property {(event: KeyboardEvent, shortcut: string) => boolean} shouldToggleHoveringEditorOnKeyPress - 一个函数，根据按键事件确定是否切换悬停编辑器。默认情况下，使用 Command + K 键组合来切换悬停编辑器。
 */
export interface BaseAutosuggestionsConfig {
  textareaPurpose: string
  contextCategories: string[]
  debounceTime: number
  apiConfig: BaseCopilotTextareaApiConfig

  disableWhenEmpty: boolean
  disabled: boolean
  temporarilyDisableWhenMovingCursorWithoutChangingText: boolean
  shouldAcceptAutosuggestionOnKeyPress: (event: KeyboardEvent) => boolean
  shouldAcceptAutosuggestionOnTouch: (event: TouchEvent) => boolean
  shouldToggleHoveringEditorOnKeyPress: (event: KeyboardEvent, shortcut: string) => boolean
}

// 默认情况下，command-k 切换悬停编辑器
const defaultShouldToggleHoveringEditorOnKeyPress = (event: KeyboardEvent, shortcut: string) => {
  // 如果 command-k，切换悬停编辑器
  if (event.key === shortcut && event.metaKey) {
    return true
  }
  return false
}

const defaultShouldAcceptAutosuggestionOnKeyPress = (event: KeyboardEvent) => {
  // 如果 tab，接受自动建议
  if (event.key === 'Tab') {
    return true
  }
  return false
}

const defaultShouldAcceptAutosuggestionOnTouch = () => false

/**
 * BaseAutosuggestions 的默认配置。
 *
 * @property {number} debounceTime - 触发自动建议 API 调用之前等待的时间。
 * @property {string[]} contextCategories - 在进行自动建议 API 调用时使用的上下文类别。
 * @property {boolean} disableWhenEmpty - 当文本区域为空时是否禁用自动建议。
 * @property {boolean} disabled - 是否完全禁用自动建议功能。
 * @property {boolean} temporarilyDisableWhenMovingCursorWithoutChangingText - 是否在光标移动但不改变文本时暂时禁用自动建议。
 * @property {(event: KeyboardEvent) => boolean} shouldToggleHoveringEditorOnKeyPress - 一个函数，根据按键事件确定是否切换悬停编辑器。
 * @property {(event: KeyboardEvent) => boolean} shouldAcceptAutosuggestionOnKeyPress - 一个函数，根据按键事件确定是否接受自动建议。
 * @property {() => boolean} defaultShouldAcceptAutosuggestionOnTouch - 一个函数，根据移动触摸事件确定是否接受自动建议。
 */

export const defaultBaseAutosuggestionsConfig: Omit<BaseAutosuggestionsConfig, 'textareaPurpose' | 'apiConfig'> = {
  debounceTime: 250,
  contextCategories: defaultCopilotContextCategories,
  disableWhenEmpty: true,
  disabled: false,
  temporarilyDisableWhenMovingCursorWithoutChangingText: true,
  shouldToggleHoveringEditorOnKeyPress: defaultShouldToggleHoveringEditorOnKeyPress,
  shouldAcceptAutosuggestionOnKeyPress: defaultShouldAcceptAutosuggestionOnKeyPress,
  shouldAcceptAutosuggestionOnTouch: defaultShouldAcceptAutosuggestionOnTouch
}
