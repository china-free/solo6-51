import { nextTick } from 'vue'
import { getCategoryLabel, DEFAULT_PREVIEW_TEXT, DEFAULT_COMPARE_TEXT } from '../models/font.js'
import { usePreviewStore } from '../stores/previewStore.js'
import { useFontStore } from '../stores/fontStore.js'
import { useCompareStore } from '../stores/compareStore.js'

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const chars = Array.from(text)
  let line = ''
  let currentY = y

  for (let i = 0; i < chars.length; i++) {
    const testLine = line + chars[i]
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && line !== '') {
      ctx.fillText(line, x, currentY)
      line = chars[i]
      currentY += lineHeight
    } else {
      line = testLine
    }
    if (chars[i] === '\n') {
      ctx.fillText(line.slice(0, -1), x, currentY)
      line = ''
      currentY += lineHeight
    }
  }
  if (line) {
    ctx.fillText(line, x, currentY)
  }
}

async function saveCanvasAsImage(canvas, defaultName) {
  const dataUrl = canvas.toDataURL('image/png')

  if (window.electronAPI && window.electronAPI.saveImageDialog && window.electronAPI.saveImageFile) {
    const dialogResult = await window.electronAPI.saveImageDialog(defaultName)
    if (dialogResult.canceled || !dialogResult.filePath) return

    const saveResult = await window.electronAPI.saveImageFile({
      filePath: dialogResult.filePath,
      dataUrl
    })
    if (saveResult.success) {
      return saveResult
    } else {
      console.error('保存图片失败:', saveResult.error)
    }
    return
  }

  const base64 = dataUrl.split(',')[1]
  const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
  const blob = new Blob([bytes], { type: 'image/png' })

  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${defaultName || 'font-preview'}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  setTimeout(() => URL.revokeObjectURL(link.href), 100)
}

export async function exportPreviewImage(font) {
  if (!font) return

  const fontStore = useFontStore()
  const previewStore = usePreviewStore()

  await fontStore.loadFontForPreview(font)
  await nextTick()

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const width = 1200
  const padding = 60
  const headerHeight = 140

  const tempDiv = document.createElement('div')
  tempDiv.style.cssText = `
    position: absolute; left: -9999px; top: -9999px;
    font-family: "${font.familyName}", sans-serif;
    font-size: ${previewStore.fontSize}px;
    font-weight: ${previewStore.fontWeight};
    font-style: ${previewStore.fontItalic ? 'italic' : 'normal'};
    white-space: pre-wrap; max-width: ${width - padding * 2}px; visibility: hidden;
  `
  tempDiv.textContent = previewStore.previewText || DEFAULT_PREVIEW_TEXT
  document.body.appendChild(tempDiv)
  const textHeight = tempDiv.offsetHeight + 40
  document.body.removeChild(tempDiv)

  const height = headerHeight + textHeight + 120
  canvas.width = width
  canvas.height = height

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, width, headerHeight)

  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 28px -apple-system, sans-serif'
  ctx.fillText(font.familyName, padding, 55)

  ctx.fillStyle = '#64748b'
  ctx.font = '14px -apple-system, sans-serif'
  ctx.fillText(`${font.styleName} • ${font.fontType} • ${getCategoryLabel(font.category)}`, padding, 85)

  const fontSizeStr = `${previewStore.fontItalic ? 'italic ' : ''}${previewStore.fontWeight} ${previewStore.fontSize}px`
  ctx.font = `${fontSizeStr} "${font.familyName}", sans-serif`
  ctx.fillStyle = '#0f172a'
  ctx.textBaseline = 'top'

  const textToDraw = previewStore.previewText || DEFAULT_PREVIEW_TEXT
  const maxWidth = width - padding * 2

  try {
    await document.fonts.load(`${fontSizeStr} "${font.familyName}"`)
  } catch {}

  wrapText(ctx, textToDraw, padding, headerHeight + 40, maxWidth, previewStore.fontSize * 1.4)

  ctx.fillStyle = '#94a3b8'
  ctx.font = '12px -apple-system, sans-serif'
  ctx.textBaseline = 'bottom'
  ctx.fillText(`导出时间: ${new Date().toLocaleString()}`, padding, height - 25)
  ctx.textAlign = 'right'
  ctx.fillText(font.filePath, width - padding, height - 25)
  ctx.textAlign = 'left'

  await saveCanvasAsImage(canvas, `${font.familyName}-preview`)
}

export async function exportCompareImage() {
  const fontStore = useFontStore()
  const previewStore = usePreviewStore()
  const compareStore = useCompareStore()

  if (!compareStore.fontA || !compareStore.fontB) return

  await fontStore.loadFontForPreview(compareStore.fontA)
  await fontStore.loadFontForPreview(compareStore.fontB)
  await nextTick()

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const width = 1600
  const padding = 50
  const headerHeight = 120
  const columnWidth = (width - padding * 3) / 2

  const sampleSizes = [14, 18, 24, 32, 48, previewStore.fontSize]
  const textLines = previewStore.previewText || DEFAULT_COMPARE_TEXT

  let bodyHeight = 0
  for (const size of sampleSizes) {
    bodyHeight += size * 1.8 + 10
  }
  bodyHeight += 60

  const height = headerHeight + bodyHeight + 80
  canvas.width = width
  canvas.height = height

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = '#f8fafc'
  ctx.fillRect(0, 0, width, headerHeight)

  ctx.fillStyle = '#6366f1'
  ctx.fillRect(padding, headerHeight - 4, columnWidth, 4)
  ctx.fillStyle = '#10b981'
  ctx.fillRect(padding * 2 + columnWidth, headerHeight - 4, columnWidth, 4)

  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 24px -apple-system, sans-serif'
  ctx.fillText(compareStore.fontA.familyName, padding, 50)
  ctx.fillText(compareStore.fontB.familyName, padding * 2 + columnWidth, 50)

  ctx.fillStyle = '#64748b'
  ctx.font = '13px -apple-system, sans-serif'
  ctx.fillText(compareStore.fontA.styleName + ' • ' + compareStore.fontA.fontType, padding, 75)
  ctx.fillText(compareStore.fontB.styleName + ' • ' + compareStore.fontB.fontType, padding * 2 + columnWidth, 75)

  let y = headerHeight + 30

  for (const size of sampleSizes) {
    const fontStrA = `${previewStore.fontItalic ? 'italic ' : ''}${previewStore.fontWeight} ${size}px "${compareStore.fontA.familyName}"`
    const fontStrB = `${previewStore.fontItalic ? 'italic ' : ''}${previewStore.fontWeight} ${size}px "${compareStore.fontB.familyName}"`

    try {
      await document.fonts.load(fontStrA)
      await document.fonts.load(fontStrB)
    } catch {}

    ctx.fillStyle = '#94a3b8'
    ctx.font = '11px -apple-system, sans-serif'
    ctx.textBaseline = 'top'
    ctx.fillText(`${size}px`, 15, y + 4)

    ctx.fillStyle = '#0f172a'
    ctx.font = fontStrA
    wrapText(ctx, textLines, padding, y, columnWidth, size * 1.5)

    ctx.font = fontStrB
    wrapText(ctx, textLines, padding * 2 + columnWidth, y, columnWidth, size * 1.5)

    y += size * 1.8 + 10
  }

  ctx.fillStyle = '#e2e8f0'
  ctx.fillRect(width / 2 - 1, headerHeight, 2, height - headerHeight - 80)

  await saveCanvasAsImage(canvas, `${compareStore.fontA.familyName}-vs-${compareStore.fontB.familyName}`)
}
