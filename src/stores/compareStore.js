import { ref } from 'vue'
import { isSameFont } from '../models/font.js'

const mode = ref(false)
const fontA = ref(null)
const fontB = ref(null)
const selectingSlot = ref('A')

export function useCompareStore() {
  function toggleMode() {
    mode.value = !mode.value
    if (!mode.value) {
      selectingSlot.value = 'A'
    }
  }

  function assignFont(font) {
    if (selectingSlot.value === 'A') {
      fontA.value = font
      selectingSlot.value = 'B'
    } else {
      fontB.value = font
      selectingSlot.value = 'A'
    }
  }

  function addToCompare(font) {
    if (!fontA.value) {
      fontA.value = font
    } else if (!fontB.value) {
      fontB.value = font
    } else {
      fontA.value = fontB.value
      fontB.value = font
    }
  }

  function clearSlot(slot) {
    if (slot === 'A') {
      fontA.value = null
      selectingSlot.value = 'A'
    } else {
      fontB.value = null
      selectingSlot.value = 'B'
    }
  }

  function resetCompare() {
    fontA.value = null
    fontB.value = null
    selectingSlot.value = 'A'
  }

  function isFontInCompare(font) {
    return isSameFont(font, fontA.value) || isSameFont(font, fontB.value)
  }

  return {
    mode,
    fontA,
    fontB,
    selectingSlot,
    toggleMode,
    assignFont,
    addToCompare,
    clearSlot,
    resetCompare,
    isFontInCompare
  }
}
