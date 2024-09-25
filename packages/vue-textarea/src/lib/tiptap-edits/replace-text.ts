import { Editor } from '@tiptap/vue-3'
import { ShallowRef } from 'vue'

export function replaceEditorText(editor: ShallowRef<Editor | undefined>, newText: string) {
  // clear all previous text
  editor.value?.commands.clearContent()

  // insert new text
  if (newText && newText !== '') {
    // don't insert empty text - results in strange visual behavior
    editor.value?.commands.insertContent({
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: newText
        }
      ]
    })
  }
}
