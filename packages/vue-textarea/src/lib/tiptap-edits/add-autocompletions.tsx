import { mergeAttributes, Node } from '@tiptap/core'
import { VueNodeViewRenderer, nodeViewProps, NodeViewWrapper } from '@tiptap/vue-3'
import { Editor } from '@tiptap/vue-3'
import { ShallowRef, defineComponent } from 'vue'

const VueComponent = defineComponent({
  components: {
    NodeViewWrapper
  },
  props: nodeViewProps,
  setup(props) {
    return () => (
      <NodeViewWrapper
        class="vue-component"
        style={{
          ...props.node.attrs.style,
          display: 'inline'
        }}
      >
        {props.node.content.textBetween(0, props.node.content.size)}
      </NodeViewWrapper>
    )
  }
})

export default Node.create({
  name: 'suggestion',
  group: 'inline',
  content: 'inline*', // 允许包含其他内联节点
  marks: '_', // 允许包含所有标记
  inline: true,
  atom: true, // 将节点视为原子节点，不允许拆分或合并
  addAttributes() {
    return {
      style: {
        default: {
          fontStyle: 'italic',
          color: 'gray'
        }
      }
    }
  },
  parseHTML() {
    return [
      {
        tag: 'suggestion'
      }
    ]
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        style: HTMLAttributes.style
      })
    ]
  },
  addNodeView() {
    return VueNodeViewRenderer(VueComponent)
  }
})

export const addAutocompletionsToEditor = (
  editor: ShallowRef<Editor | undefined>,
  newSuggestion: string,
  point: number
) => {
  editor.value?.commands.insertContentAt(point, [
    {
      type: 'suggestion',
      content: [
        {
          type: 'text',
          text: newSuggestion
        }
      ]
    }
  ])
  editor.value?.commands.focus(point)
}
