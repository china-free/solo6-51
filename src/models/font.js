export const FONT_CATEGORIES = [
  { value: 'all', label: '全部', color: '#6366f1' },
  { value: 'serif', label: '衬线体', color: '#10b981' },
  { value: 'sans-serif', label: '非衬线体', color: '#3b82f6' },
  { value: 'handwriting', label: '手写体', color: '#f59e0b' },
  { value: 'monospace', label: '等宽体', color: '#8b5cf6' }
]

export function createFontItem(raw) {
  return {
    familyName: raw.familyName || '',
    styleName: raw.styleName || 'Regular',
    postScriptName: raw.postScriptName || raw.familyName || '',
    fullName: raw.fullName || raw.familyName || '',
    version: raw.version || '',
    filePath: raw.filePath || '',
    fontType: raw.fontType || 'Unknown',
    extension: raw.extension || '',
    isMonospaced: Boolean(raw.isMonospaced),
    panose: raw.panose || null,
    category: raw.category || 'sans-serif',
    fontIndex: raw.fontIndex ?? null,
    parseError: raw.parseError || null
  }
}

export function getFontKey(font) {
  return font.filePath + ':' + (font.fontIndex ?? 0)
}

export function isSameFont(a, b) {
  if (!a || !b) return false
  return a.filePath === b.filePath && (a.fontIndex ?? 0) === (b.fontIndex ?? 0)
}

export function getCategoryLabel(category) {
  const cat = FONT_CATEGORIES.find(c => c.value === category)
  return cat ? cat.label : '其他'
}

export const FONT_WEIGHT_OPTIONS = [
  { value: '100', label: '100 - Thin' },
  { value: '300', label: '300 - Light' },
  { value: '400', label: '400 - Regular' },
  { value: '500', label: '500 - Medium' },
  { value: '600', label: '600 - SemiBold' },
  { value: '700', label: '700 - Bold' },
  { value: '800', label: '800 - ExtraBold' },
  { value: '900', label: '900 - Black' }
]

export const DEFAULT_PREVIEW_TEXT = 'The quick brown fox jumps over the lazy dog'
export const DEFAULT_COMPARE_TEXT = 'The quick brown fox jumps over the lazy dog. 敏捷的棕色狐狸跳过懒狗。'
export const SAMPLE_SIZES = [12, 14, 16, 18, 24, 32, 48]
export const COMPARE_SIZES = [14, 18, 24, 32, 48]
