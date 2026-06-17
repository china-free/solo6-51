import { ref, computed } from 'vue'
import { createFontItem, getFontKey } from '../models/font.js'
import { useFilterStore } from './filterStore.js'
import { useCompareStore } from './compareStore.js'

const allFonts = ref([])
const loading = ref(true)
const selectedFont = ref(null)
const loadedFonts = ref(new Set())

function getDemoFonts() {
  return [
    { familyName: 'Arial', styleName: 'Regular', postScriptName: 'ArialMT', fullName: 'Arial', filePath: 'C:/Windows/Fonts/arial.ttf', fontType: 'TrueType', extension: '.ttf', isMonospaced: false, category: 'sans-serif' },
    { familyName: 'Times New Roman', styleName: 'Regular', postScriptName: 'TimesNewRomanPSMT', fullName: 'Times New Roman', filePath: 'C:/Windows/Fonts/times.ttf', fontType: 'TrueType', extension: '.ttf', isMonospaced: false, category: 'serif' },
    { familyName: 'Consolas', styleName: 'Regular', postScriptName: 'Consolas', fullName: 'Consolas', filePath: 'C:/Windows/Fonts/consola.ttf', fontType: 'OpenType', extension: '.ttf', isMonospaced: true, category: 'monospace' },
    { familyName: 'Segoe Script', styleName: 'Regular', postScriptName: 'SegoeScript', fullName: 'Segoe Script', filePath: 'C:/Windows/Fonts/segoesc.ttf', fontType: 'TrueType', extension: '.ttf', isMonospaced: false, category: 'handwriting' },
    { familyName: 'Microsoft YaHei', styleName: 'Regular', postScriptName: 'MicrosoftYaHei', fullName: '微软雅黑', filePath: 'C:/Windows/Fonts/msyh.ttc', fontType: 'TrueType Collection', extension: '.ttc', isMonospaced: false, category: 'sans-serif' },
    { familyName: 'SimSun', styleName: 'Regular', postScriptName: 'SimSun', fullName: '宋体', filePath: 'C:/Windows/Fonts/simsun.ttc', fontType: 'TrueType Collection', extension: '.ttc', isMonospaced: false, category: 'serif' },
    { familyName: 'SimHei', styleName: 'Regular', postScriptName: 'SimHei', fullName: '黑体', filePath: 'C:/Windows/Fonts/simhei.ttf', fontType: 'TrueType', extension: '.ttf', isMonospaced: false, category: 'sans-serif' },
    { familyName: 'KaiTi', styleName: 'Regular', postScriptName: 'KaiTi', fullName: '楷体', filePath: 'C:/Windows/Fonts/simkai.ttf', fontType: 'TrueType', extension: '.ttf', isMonospaced: false, category: 'handwriting' },
    { familyName: 'Courier New', styleName: 'Regular', postScriptName: 'CourierNewPSMT', fullName: 'Courier New', filePath: 'C:/Windows/Fonts/cour.ttf', fontType: 'TrueType', extension: '.ttf', isMonospaced: true, category: 'monospace' },
    { familyName: 'Georgia', styleName: 'Regular', postScriptName: 'Georgia', fullName: 'Georgia', filePath: 'C:/Windows/Fonts/georgia.ttf', fontType: 'TrueType', extension: '.ttf', isMonospaced: false, category: 'serif' },
    { familyName: 'Verdana', styleName: 'Regular', postScriptName: 'Verdana', fullName: 'Verdana', filePath: 'C:/Windows/Fonts/verdana.ttf', fontType: 'TrueType', extension: '.ttf', isMonospaced: false, category: 'sans-serif' },
    { familyName: 'Tahoma', styleName: 'Regular', postScriptName: 'Tahoma', fullName: 'Tahoma', filePath: 'C:/Windows/Fonts/tahoma.ttf', fontType: 'TrueType', extension: '.ttf', isMonospaced: false, category: 'sans-serif' }
  ]
}

async function scanFonts() {
  loading.value = true
  try {
    if (window.electronAPI && window.electronAPI.scanFonts) {
      const result = await window.electronAPI.scanFonts()
      if (result && result.fonts) {
        allFonts.value = result.fonts.map(createFontItem)
      }
    } else {
      allFonts.value = getDemoFonts().map(createFontItem)
    }
  } catch {
    allFonts.value = getDemoFonts().map(createFontItem)
  } finally {
    loading.value = false
    if (allFonts.value.length > 0 && !selectedFont.value) {
      selectFont(allFonts.value[0])
    }
  }
}

async function rescanFonts() {
  allFonts.value = []
  selectedFont.value = null
  loadedFonts.value = new Set()
  await scanFonts()
}

async function loadFontForPreview(font) {
  if (!font || !font.filePath) return
  const fontKey = getFontKey(font)
  if (loadedFonts.value.has(fontKey)) return

  try {
    const fontUrl = 'file:///' + font.filePath.replace(/\\/g, '/')
    const fontFace = new FontFace(font.familyName, `url("${fontUrl}")`, {
      style: 'normal',
      weight: '400'
    })
    const loaded = await fontFace.load()
    document.fonts.add(loaded)
    loadedFonts.value.add(fontKey)
  } catch {
  }
}

async function selectFont(font) {
  selectedFont.value = font
  await loadFontForPreview(font)

  const compareStore = useCompareStore()
  if (compareStore.mode) {
    compareStore.assignFont(font)
    await loadFontForPreview(compareStore.fontA)
    await loadFontForPreview(compareStore.fontB)
  }
}

export function useFontStore() {
  const filterStore = useFilterStore()

  const filteredFonts = computed(() => {
    let fonts = allFonts.value
    if (filterStore.selectedCategory !== 'all') {
      fonts = fonts.filter(f => f.category === filterStore.selectedCategory)
    }
    if (filterStore.searchQuery.trim()) {
      const query = filterStore.searchQuery.toLowerCase()
      fonts = fonts.filter(f =>
        f.familyName.toLowerCase().includes(query) ||
        f.styleName.toLowerCase().includes(query) ||
        f.postScriptName.toLowerCase().includes(query) ||
        (f.fullName && f.fullName.toLowerCase().includes(query))
      )
    }
    return fonts
  })

  function getCategoryCount(category) {
    if (category === 'all') return allFonts.value.length
    return allFonts.value.filter(f => f.category === category).length
  }

  return {
    allFonts,
    loading,
    selectedFont,
    loadedFonts,
    filteredFonts,
    scanFonts,
    rescanFonts,
    loadFontForPreview,
    selectFont,
    getCategoryCount
  }
}
