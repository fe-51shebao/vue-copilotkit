import { ref, onMounted, onUnmounted, watchEffect, watch } from 'vue'
import { useCopilotContext } from '../context'

/**
 * Options for the useCopilotReadable hook.
 */
export interface UseCopilotReadableOptions {
  /**
   * The description of the information to be added to the Copilot context.
   */
  description: string
  /**
   * The value to be added to the Copilot context.
   */
  value: any
  /**
   * The ID of the parent context, if any.
   */
  parentId?: string
  /**
   * An array of categories to control which context are visible where. Particularly useful
   * with CopilotTextarea (see `useMakeAutosuggestionFunction`)
   */
  categories?: string[]

  /**
   * A custom conversion function to use to serialize the value to a string. If not provided, the value
   * will be serialized using `JSON.stringify`.
   */
  convert?: (description: string, value: any) => string
}

/**
 * Adds the given information to the Copilot context to make it readable by Copilot.
 */
export function useCopilotReadable({ description, value, parentId, categories, convert }: UseCopilotReadableOptions) {
  const { addContext, removeContext } = useCopilotContext()

  const idRef = ref<string>()

  convert = convert || convertToJSON

  const information = convert(description, value)

  // watchEffect(() => {
  //   const id = addContext(information, parentId, categories)
  //   idRef.value = id
  //   if (idRef.value) {
  //     // removeContext(idRef.value)
  //   }
  // })
  watch(() => [description, value,parentId,categories], () => {
    const information = convert(description, value)
    const id = addContext(information, parentId, categories)
    idRef.value = id
  },{
    deep: true,
    immediate: true
  })
}

function convertToJSON(description: string, value: any): string {
  return `${description}: ${typeof value === 'string' ? value : JSON.stringify(value)}`
}
