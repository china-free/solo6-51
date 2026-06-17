import { ref } from 'vue'

const searchQuery = ref('')
const selectedCategory = ref('all')

export function useFilterStore() {
  function resetFilter() {
    searchQuery.value = ''
    selectedCategory.value = 'all'
  }

  return {
    searchQuery,
    selectedCategory,
    resetFilter
  }
}
