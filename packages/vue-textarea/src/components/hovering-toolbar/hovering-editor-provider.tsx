import { ref, provide, inject, defineComponent, type Ref, type InjectionKey } from 'vue'

// 定义 HoveringEditorContext 的类型
interface HoveringEditorContextProps {
  isDisplayed: Ref<boolean>
  setIsDisplayed: (value: boolean) => void
}

// 创建一个唯一的注入键
const HoveringEditorContextKey: InjectionKey<HoveringEditorContextProps> = Symbol('HoveringEditorContext')

// HoveringEditorProvider 组件
export const HoveringEditorProvider = defineComponent({
  name: 'HoveringEditorProvider',
  setup(props, { slots }) {
    const isDisplayed = ref(false)

    const setIsDisplayed = (value: boolean) => {
      isDisplayed.value = value
    }

    // 使用 provide 将上下文提供给子组件
    provide(HoveringEditorContextKey, { isDisplayed, setIsDisplayed })

    return () => slots.default && slots.default()
  }
})

// 使用该上下文的组合式函数
export const useHoveringEditorContext = () => {
  const context = inject(HoveringEditorContextKey)

  if (!context) {
    throw new Error('useHoveringEditorContext 必须在 HoveringEditorProvider 内部使用')
  }

  return context
}
