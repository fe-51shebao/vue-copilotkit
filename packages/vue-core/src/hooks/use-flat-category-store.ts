import { ref } from 'vue'

export type FlatCategoryStoreId = string

interface FlatCategoryStoreElement<T> {
  id: FlatCategoryStoreId
  value: T
  categories: Set<string>
}

export default function useFlatCategoryStore<T>() {
  const elements = ref(new Map<FlatCategoryStoreId, FlatCategoryStoreElement<T>>())

  const addElement = (value: T, categories: string[]) => {}

  const removeElement = (id: FlatCategoryStoreId) => {}

  const allElements = (categories: string[]) => {}

  return { addElement, removeElement, allElements }
}
