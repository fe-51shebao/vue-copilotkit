import { onMounted, onBeforeUnmount, ref, watchEffect } from 'vue'
import { useCopilotContext } from '../context/copilot-context'
import { DocumentPointer } from '../types'

/**
 * Makes a document readable by Copilot.
 * @param document The document to make readable.
 * @param categories The categories to associate with the document.
 * @param dependencies The dependencies to use for the effect.
 * @returns The id of the document.
 */
export function useMakeCopilotDocumentReadable(
  document: DocumentPointer,
  categories: string[] = [],
  dependencies: any[] = []
): string | undefined {
  const { addDocumentContext, removeDocumentContext } = useCopilotContext()
  const idRef = ref<string | undefined>(undefined)

  const addDocument = () => {
    const id = addDocumentContext(document, categories)
    idRef.value = id
  }

  onMounted(() => {
    addDocument()
  })

  onBeforeUnmount(() => {
    if (idRef.value) {
      removeDocumentContext(idRef.value)
    }
  })

  watchEffect(() => {
    // Re-run the effect when dependencies change
    addDocument()
    return () => {
      if (idRef.value) {
        removeDocumentContext(idRef.value)
      }
    }
  })

  return idRef.value
}
