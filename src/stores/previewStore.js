import { ref, computed } from 'vue'

const previewText = ref('')
const fontSize = ref(48)
const fontWeight = ref('400')
const fontItalic = ref(false)

export function usePreviewStore() {
  const previewStyle = computed(() => ({
    fontSize: fontSize.value + 'px',
    fontWeight: fontWeight.value,
    fontStyle: fontItalic.value ? 'italic' : 'normal'
  }))

  function getPreviewStyle(font, customSize) {
    const size = customSize || fontSize.value
    return {
      fontFamily: `"${font.familyName}", sans-serif`,
      fontSize: size + 'px',
      fontWeight: fontWeight.value,
      fontStyle: fontItalic.value ? 'italic' : 'normal'
    }
  }

  function resetPreviewParams() {
    previewText.value = ''
    fontSize.value = 48
    fontWeight.value = '400'
    fontItalic.value = false
  }

  return {
    previewText,
    fontSize,
    fontWeight,
    fontItalic,
    previewStyle,
    getPreviewStyle,
    resetPreviewParams
  }
}
