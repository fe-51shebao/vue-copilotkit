import { ref, onMounted, watch, type Ref } from 'vue'

export function useStateWithLocalStorage(defaultValue: string, key: string): [Ref<string>, (newValue: string) => void] {
  const state = ref<string>(defaultValue)
  const isFirstRender = ref(true)

  // 在组件挂载时从localStorage中获取值
  // onMounted(() => {
  if (typeof window !== 'undefined') {
    const storagedValue = localStorage.getItem(key)
    if (storagedValue) {
      try {
        state.value = JSON.parse(storagedValue)
      } catch {}
    }
  }
  // })

  // 监听state和key的变化，并更新localStorage
  watch(
    () => state.value,
    () => {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(state.value))
      }
    },
    { immediate: true }
  )

  // 用于更新状态的函数
  const setState = (newValue: string) => {
    state.value = newValue
  }

  return [state, setState]
}
