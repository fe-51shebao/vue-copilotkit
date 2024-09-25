import { Editor } from '@tiptap/vue-3'
import { ShallowRef } from 'vue'

interface PathSuggestion {
  pos: number
  nodeSize: number
}

export function clearAutocompletionsFromEditor(editor: ShallowRef<Editor | undefined>) {
  if (!editor.value) return
  const { state, view } = editor.value
  const { tr } = state
  const paths: PathSuggestion[] = []

  state.doc.descendants((node, pos) => {
    if (node.type.name === 'suggestion') {
      paths.unshift({ pos, nodeSize: node.nodeSize })
    }
  })
  for (const { pos, nodeSize } of paths) {
    // console.log('删除节点', pos, nodeSize, pos + nodeSize)
    tr.delete(pos, pos + nodeSize)
  }

  // 如果文档变更有意义，则提交变更
  if (tr.docChanged) {
    view.dispatch(tr)
  }
}
