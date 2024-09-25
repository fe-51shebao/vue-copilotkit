import { defineComponent, onMounted, ref, watch, nextTick } from "vue";


export const AutoResizingTextarea = defineComponent({
  props: {
    maxRows: {
      type: Number,
      default: 3
    },
    placeholder: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: ''
    },
    onChange: {
      type: Function,
      default: () => {}
    },
    onKeyDown: {
      type: Function,
      default: () => {}
    },
    autoFocus: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const internalTextareaRef = ref<HTMLTextAreaElement | null>(null);
    const maxHeight = ref(0)
    const calculateMaxHeight = () => {
      const textarea = internalTextareaRef.value;
      if (textarea) {
        textarea.style.height = "auto";
        const singleRowHeight = textarea.scrollHeight;
        maxHeight.value = singleRowHeight * props.maxRows;
        if (props.autoFocus) {
          textarea.focus();
        }
      }
    }
    watch(() => props.maxRows,()=>{
      calculateMaxHeight()
    },{deep:true,immediate:true})
    onMounted(() => {
      calculateMaxHeight()
    })
    watch(() => [props.value, maxHeight.value], () => {
      const textarea = internalTextareaRef.value;
      // debugger
      if (textarea) {
        textarea.style.height = "auto";
        nextTick(() => {
          textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight.value)}px`;
        })
      }
    });

    return () => (
      <textarea
        ref={(e) => internalTextareaRef.value = e as HTMLTextAreaElement}
        rows={1}
        placeholder={props.placeholder}
        value={props.value}
        onInput={(event) => {
          props.onChange(event);
        }}
        onKeydown={(event) => {
          props.onKeyDown(event);
        }}
        style={{
          overflow: "auto",
          resize: "none",
          maxHeight: `${maxHeight}px`,
        }}
      />
    );
  }
})