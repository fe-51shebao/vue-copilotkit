import { PropType, HTMLAttributes } from 'vue'
import { BaseAutosuggestionsConfig } from '.'
import { BaseCopilotTextareaApiConfig } from './autosuggestions-bare-function'

export interface SemiFakeTextAreaEvent {
  target: {
    value: string
    type: string
  }
  currentTarget: {
    value: string
    type: string
  }
}

/**
 * `BaseCopilotTextareaProps` 定义了 `BaseCopilotTextarea` 组件的属性。
 */
export interface BaseCopilotTextareaProps extends Omit<HTMLAttributes, 'onChange'> {
  /**
   * 确定是否禁用 CopilotKit 品牌标识。默认为 `false`。
   */
  disableBranding?: boolean

  className?: string
  editorStyle?: Record<string, any>
  /**
   * 指定应用于占位符文本的 CSS 样式。
   */
  placeholderStyle?: Record<string, any>

  /**
   * 指定应用于建议列表的 CSS 样式。
   */
  suggestionsStyle?: Record<string, any>
  /**
   * 应用于编辑器弹出窗口的类名。
   */
  hoverMenuClassname?: string

  /**
   * 文本区域的初始值。可以通过 `onValueChange` 进行控制。
   */
  value?: string

  /**
   * 当文本区域的值发生变化时调用的回调函数。
   */
  onValueChange?: (value: string) => void

  /**
   * 当文本区域元素触发 `change` 事件时调用的回调函数。
   */
  onChange?: (event: SemiFakeTextAreaEvent) => void

  /**
   * 用于打开编辑器弹出窗口的快捷键。默认为 `"Cmd-k"`。
   */
  shortcut?: string

  /**
   * 自动建议功能的配置设置。
   * 包括一个强制性的 `textareaPurpose` 来指导自动建议。
   */
  baseAutosuggestionsConfig: Partial<BaseAutosuggestionsConfig> & {
    textareaPurpose: string
    apiConfig: BaseCopilotTextareaApiConfig
  }
}
