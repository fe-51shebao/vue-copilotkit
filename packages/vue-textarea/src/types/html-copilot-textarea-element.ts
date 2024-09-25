import { ShallowRef } from 'vue'
import { Editor } from '@tiptap/vue-3'

export interface HTMLCopilotTextAreaElement extends HTMLElement {
  value: string
  focus: () => void
  blur: () => void
  editor: Editor | undefined
}
