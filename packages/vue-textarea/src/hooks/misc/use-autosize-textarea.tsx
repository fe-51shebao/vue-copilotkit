import { ref, watch, onMounted, Ref } from 'vue'

function useAutosizeTextArea(textAreaRef: Ref<HTMLTextAreaElement | null>, value: Ref<string>) {
  const adjustHeight = () => {
    if (textAreaRef.value !== null) {
      // Reset height to get the correct scrollHeight
      textAreaRef.value.style.height = '0px'
      const scrollHeight = textAreaRef.value.scrollHeight

      // Set the height directly
      textAreaRef.value.style.height = scrollHeight + 'px'
    }
  }

  onMounted(adjustHeight) // Adjust the height on mount

  watch(value, adjustHeight) // Adjust the height whenever the value changes
}

export default useAutosizeTextArea
