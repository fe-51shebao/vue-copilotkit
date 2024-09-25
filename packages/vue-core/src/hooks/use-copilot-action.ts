import { ref, onMounted, onUnmounted } from 'vue'
import { Parameter, randomId } from '@copilotkit/shared'

import { useCopilotContext } from '../context'
import { FrontendAction } from '../types/frontend-action'

export function useCopilotAction<const T extends Parameter[] | [] = []>(action: FrontendAction<T>) {
  const { setAction, removeAction, actions, chatComponentsCache } = useCopilotContext()
  const idRef = ref<string>(randomId())

  if (actions.value[idRef.value]) {
    actions.value[idRef.value].handler = action.handler as any
    if (typeof action.render === 'function') {
      if (chatComponentsCache.value !== null) {
        chatComponentsCache.value[action.name] = action.render
      }
    }
  }

  setAction(idRef.value, action as any)

  onUnmounted(() => {
    removeAction(idRef.value)
  })
}
