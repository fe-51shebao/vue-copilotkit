import StarterKit from '@tiptap/starter-kit'
import { useEditor } from '@tiptap/vue-3'
import sugComponent from '../../lib/tiptap-edits/add-autocompletions'
import Placeholder from '@tiptap/extension-placeholder'

export function useCopilotTextareaEditor(content: string, placeholder: string | undefined) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      sugComponent,
      Placeholder.configure({
        placeholder: () => placeholder ?? 'Write your reply...'
      })
    ],
    content,
    editorProps: {
      attributes: {
        class: 'p-4px h-100px overflow-y-auto border-solid border-1px border-e5e5e5 text-left text-16px'
      }
    }
  })

  return editor
}
