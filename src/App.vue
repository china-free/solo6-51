<template>
  <div class="app">
    <header class="app-header">
      <div class="header-left">
        <div class="logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 7V4h16v3"/>
            <path d="M9 20h6"/>
            <path d="M12 4v16"/>
          </svg>
        </div>
        <div>
          <h1 class="app-title">字体管理器</h1>
          <p class="app-subtitle">Font Manager Desktop</p>
        </div>
      </div>
      <div class="header-right">
        <button class="btn btn-secondary" @click="rescanFonts" :disabled="loading">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M21 3v5h-5"/>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
            <path d="M8 16H3v5"/>
          </svg>
          重新扫描
        </button>
        <button class="btn" :class="compareMode ? 'btn-primary' : 'btn-secondary'" @click="toggleCompareMode">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="18" rx="1"/>
            <rect x="14" y="3" width="7" height="18" rx="1"/>
          </svg>
          {{ compareMode ? '关闭对比' : '对比模式' }}
        </button>
      </div>
    </header>

    <div class="toolbar">
      <div class="toolbar-left">
        <div class="search-box">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索字体名称..."
          />
        </div>
        <div class="filter-group">
          <button
            v-for="cat in categories"
            :key="cat.value"
            class="filter-chip"
            :class="{ active: selectedCategory === cat.value }"
            @click="selectedCategory = cat.value"
          >
            <span class="chip-dot" :style="{ background: cat.color }"></span>
            {{ cat.label }}
            <span class="chip-count">({{ getCategoryCount(cat.value) }})</span>
          </button>
        </div>
      </div>
      <div class="toolbar-right">
        <span class="font-count">共 {{ filteredFonts.length }} 个字体</span>
      </div>
    </div>

    <div class="main-content">
      <aside class="sidebar">
        <div class="sidebar-header">
          <h3>字体列表</h3>
        </div>
        <div class="font-list" v-if="!loading">
          <div
            v-for="font in filteredFonts"
            :key="font.filePath + (font.fontIndex || 0)"
            class="font-item"
            :class="{
              selected: selectedFont && selectedFont.filePath === font.filePath && (selectedFont.fontIndex || 0) === (font.fontIndex || 0),
              compared: (compareFontA && compareFontA.filePath === font.filePath && (compareFontA.fontIndex || 0) === (font.fontIndex || 0)) ||
                        (compareFontB && compareFontB.filePath === font.filePath && (compareFontB.fontIndex || 0) === (font.fontIndex || 0))
            }"
            @click="selectFont(font)"
            @dblclick="addToCompare(font)"
          >
            <div class="font-item-preview" :style="{ fontFamily: `'${font.familyName}'` }">
              Aa 字
            </div>
            <div class="font-item-info">
              <div class="font-item-name">{{ font.familyName }}</div>
              <div class="font-item-meta">
                <span class="font-style">{{ font.styleName }}</span>
                <span class="font-type-badge" :class="font.category">{{ getCategoryLabel(font.category) }}</span>
              </div>
            </div>
          </div>
          <div v-if="filteredFonts.length === 0" class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
            </svg>
            <p>没有找到匹配的字体</p>
          </div>
        </div>
        <div v-else class="loading-state">
          <div class="spinner"></div>
          <p>正在扫描系统字体...</p>
          <p class="loading-hint">首次扫描可能需要一些时间</p>
        </div>
      </aside>

      <section class="preview-section">
        <div v-if="!compareMode" class="single-preview">
          <div v-if="selectedFont" class="preview-panel">
            <div class="preview-header">
              <div>
                <h2 class="preview-title">{{ selectedFont.familyName }}</h2>
                <div class="preview-subtitle">
                  <span>{{ selectedFont.styleName }}</span>
                  <span class="dot-sep">•</span>
                  <span>{{ selectedFont.fontType }}</span>
                  <span class="dot-sep">•</span>
                  <span class="font-type-badge" :class="selectedFont.category">{{ getCategoryLabel(selectedFont.category) }}</span>
                </div>
              </div>
              <div class="preview-actions">
                <button class="btn btn-secondary" @click="exportPreviewImage(selectedFont)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  导出图片
                </button>
              </div>
            </div>

            <div class="preview-controls">
              <div class="control-group">
                <label>字号: {{ fontSize }}px</label>
                <input type="range" v-model.number="fontSize" min="12" max="120" step="2" />
              </div>
              <div class="control-group">
                <label>字重</label>
                <select v-model="fontWeight">
                  <option value="100">100 - Thin</option>
                  <option value="300">300 - Light</option>
                  <option value="400">400 - Regular</option>
                  <option value="500">500 - Medium</option>
                  <option value="600">600 - SemiBold</option>
                  <option value="700">700 - Bold</option>
                  <option value="800">800 - ExtraBold</option>
                  <option value="900">900 - Black</option>
                </select>
              </div>
              <div class="control-group checkbox-group">
                <label><input type="checkbox" v-model="fontItalic" /> 斜体</label>
              </div>
            </div>

            <div class="preview-input-row">
              <textarea
                v-model="previewText"
                rows="2"
                placeholder="输入要预览的文本..."
              ></textarea>
            </div>

            <div class="preview-display" ref="previewRef">
              <div
                class="preview-text-large"
                :style="getPreviewStyle(selectedFont)"
              >
                {{ previewText || 'The quick brown fox jumps over the lazy dog' }}
              </div>
            </div>

            <div class="preview-samples">
              <h4>字号示例</h4>
              <div class="sample-row" v-for="size in [12, 14, 16, 18, 24, 32, 48]" :key="size">
                <div class="sample-label">{{ size }}px</div>
                <div class="sample-text" :style="getPreviewStyle(selectedFont, size)">
                  字体样式示例 Sample Text 12345
                </div>
              </div>
            </div>

            <div class="preview-meta">
              <h4>字体信息</h4>
              <div class="meta-grid">
                <div class="meta-item">
                  <span class="meta-label">字体家族</span>
                  <span class="meta-value">{{ selectedFont.familyName }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">样式名称</span>
                  <span class="meta-value">{{ selectedFont.styleName }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">PostScript</span>
                  <span class="meta-value">{{ selectedFont.postScriptName }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">字体类型</span>
                  <span class="meta-value">{{ selectedFont.fontType }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">分类</span>
                  <span class="meta-value">{{ getCategoryLabel(selectedFont.category) }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">等宽字体</span>
                  <span class="meta-value">{{ selectedFont.isMonospaced ? '是' : '否' }}</span>
                </div>
                <div class="meta-item meta-item-full">
                  <span class="meta-label">文件路径</span>
                  <span class="meta-value meta-path">{{ selectedFont.filePath }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-preview">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M4 7V4h16v3"/>
              <path d="M9 20h6"/>
              <path d="M12 4v16"/>
            </svg>
            <h3>选择一个字体进行预览</h3>
            <p>从左侧列表中点击选择字体</p>
            <p class="hint">双击字体可添加到对比模式</p>
          </div>
        </div>

        <div v-else class="compare-preview">
          <div class="compare-header">
            <h2>字体对比模式</h2>
            <p>从左侧双击字体添加到对比区域，或点击下方按钮选择</p>
          </div>
          <div class="compare-panels">
            <div class="compare-panel" :class="{ active: compareSelecting === 'A' }" @click="compareSelecting = 'A'">
              <div class="compare-slot-header">
                <span class="slot-label">字体 A</span>
                <button v-if="compareFontA" class="clear-btn" @click.stop="compareFontA = null">×</button>
              </div>
              <div v-if="compareFontA" class="compare-slot-content">
                <div class="slot-title">{{ compareFontA.familyName }}</div>
                <div class="slot-subtitle">{{ compareFontA.styleName }} • {{ compareFontA.fontType }}</div>
              </div>
              <div v-else class="compare-slot-empty">
                <p>点击选择字体 A</p>
              </div>
            </div>
            <div class="compare-vs">VS</div>
            <div class="compare-panel" :class="{ active: compareSelecting === 'B' }" @click="compareSelecting = 'B'">
              <div class="compare-slot-header">
                <span class="slot-label">字体 B</span>
                <button v-if="compareFontB" class="clear-btn" @click.stop="compareFontB = null">×</button>
              </div>
              <div v-if="compareFontB" class="compare-slot-content">
                <div class="slot-title">{{ compareFontB.familyName }}</div>
                <div class="slot-subtitle">{{ compareFontB.styleName }} • {{ compareFontB.fontType }}</div>
              </div>
              <div v-else class="compare-slot-empty">
                <p>点击选择字体 B</p>
              </div>
            </div>
          </div>

          <div v-if="compareFontA && compareFontB" class="compare-display">
            <div class="preview-controls">
              <div class="control-group">
                <label>字号: {{ fontSize }}px</label>
                <input type="range" v-model.number="fontSize" min="12" max="120" step="2" />
              </div>
              <div class="control-group">
                <label>字重</label>
                <select v-model="fontWeight">
                  <option value="400">400 - Regular</option>
                  <option value="500">500 - Medium</option>
                  <option value="600">600 - SemiBold</option>
                  <option value="700">700 - Bold</option>
                </select>
              </div>
              <div class="control-group checkbox-group">
                <label><input type="checkbox" v-model="fontItalic" /> 斜体</label>
              </div>
              <div class="control-group" style="margin-left: auto;">
                <button class="btn btn-secondary" @click="exportCompareImage">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  导出对比图
                </button>
              </div>
            </div>

            <div class="preview-input-row">
              <textarea
                v-model="previewText"
                rows="2"
                placeholder="输入要预览的文本..."
              ></textarea>
            </div>

            <div class="compare-side-by-side" ref="compareRef">
              <div class="compare-side">
                <div class="compare-label">{{ compareFontA.familyName }}</div>
                <div class="compare-text" :style="getPreviewStyle(compareFontA)">
                  {{ previewText || 'The quick brown fox jumps over the lazy dog. 敏捷的棕色狐狸跳过懒狗。' }}
                </div>
              </div>
              <div class="compare-divider"></div>
              <div class="compare-side">
                <div class="compare-label">{{ compareFontB.familyName }}</div>
                <div class="compare-text" :style="getPreviewStyle(compareFontB)">
                  {{ previewText || 'The quick brown fox jumps over the lazy dog. 敏捷的棕色狐狸跳过懒狗。' }}
                </div>
              </div>
            </div>

            <div class="compare-samples">
              <h4>逐行对比</h4>
              <div class="compare-sample-row" v-for="size in [14, 18, 24, 32, 48]" :key="size">
                <div class="sample-size">{{ size }}px</div>
                <div class="compare-sample-cell" :style="getPreviewStyle(compareFontA, size)">
                  字体样式对比 Sample 123
                </div>
                <div class="compare-sample-cell" :style="getPreviewStyle(compareFontB, size)">
                  字体样式对比 Sample 123
                </div>
              </div>
            </div>
          </div>
          <div v-else class="compare-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="7" height="18" rx="1"/>
              <rect x="14" y="3" width="7" height="18" rx="1"/>
            </svg>
            <p>请选择两个字体进行对比</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'

const loading = ref(true)
const allFonts = ref([])
const selectedFont = ref(null)
const searchQuery = ref('')
const selectedCategory = ref('all')
const compareMode = ref(false)
const compareFontA = ref(null)
const compareFontB = ref(null)
const compareSelecting = ref('A')
const previewText = ref('')
const fontSize = ref(48)
const fontWeight = ref('400')
const fontItalic = ref(false)
const previewRef = ref(null)
const compareRef = ref(null)
const loadedFonts = ref(new Set())

const categories = [
  { value: 'all', label: '全部', color: '#6366f1' },
  { value: 'serif', label: '衬线体', color: '#10b981' },
  { value: 'sans-serif', label: '非衬线体', color: '#3b82f6' },
  { value: 'handwriting', label: '手写体', color: '#f59e0b' },
  { value: 'monospace', label: '等宽体', color: '#8b5cf6' }
]

const filteredFonts = computed(() => {
  let fonts = allFonts.value
  if (selectedCategory.value !== 'all') {
    fonts = fonts.filter(f => f.category === selectedCategory.value)
  }
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
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

function getCategoryLabel(category) {
  const cat = categories.find(c => c.value === category)
  return cat ? cat.label : '其他'
}

function getPreviewStyle(font, customSize) {
  const size = customSize || fontSize.value
  return {
    fontFamily: `"${font.familyName}", sans-serif`,
    fontSize: size + 'px',
    fontWeight: fontWeight.value,
    fontStyle: fontItalic.value ? 'italic' : 'normal'
  }
}

async function loadFontForPreview(font) {
  if (!font || !font.filePath) return
  const fontKey = font.filePath + (font.fontIndex || 0)
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
  } catch (e) {
  }
}

async function selectFont(font) {
  selectedFont.value = font
  await loadFontForPreview(font)

  if (compareMode.value) {
    if (compareSelecting.value === 'A') {
      compareFontA.value = font
      compareSelecting.value = 'B'
    } else {
      compareFontB.value = font
      compareSelecting.value = 'A'
    }
    await loadFontForPreview(compareFontA.value)
    await loadFontForPreview(compareFontB.value)
  }
}

async function addToCompare(font) {
  await loadFontForPreview(font)
  if (!compareFontA.value) {
    compareFontA.value = font
  } else if (!compareFontB.value) {
    compareFontB.value = font
  } else {
    compareFontA.value = compareFontB.value
    compareFontB.value = font
  }
}

function toggleCompareMode() {
  compareMode.value = !compareMode.value
  if (!compareMode.value) {
    compareSelecting.value = 'A'
  }
}

async function scanFonts() {
  loading.value = true
  try {
    if (window.electronAPI && window.electronAPI.scanFonts) {
      const result = await window.electronAPI.scanFonts()
      if (result && result.fonts) {
        allFonts.value = result.fonts
      }
    } else {
      allFonts.value = getDemoFonts()
    }
  } catch (e) {
    allFonts.value = getDemoFonts()
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

function getDemoFonts() {
  return [
    { familyName: 'Arial', styleName: 'Regular', postScriptName: 'ArialMT', fullName: 'Arial', version: '', filePath: 'C:/Windows/Fonts/arial.ttf', fontType: 'TrueType', extension: '.ttf', isMonospaced: false, panose: null, category: 'sans-serif' },
    { familyName: 'Times New Roman', styleName: 'Regular', postScriptName: 'TimesNewRomanPSMT', fullName: 'Times New Roman', version: '', filePath: 'C:/Windows/Fonts/times.ttf', fontType: 'TrueType', extension: '.ttf', isMonospaced: false, panose: null, category: 'serif' },
    { familyName: 'Consolas', styleName: 'Regular', postScriptName: 'Consolas', fullName: 'Consolas', version: '', filePath: 'C:/Windows/Fonts/consola.ttf', fontType: 'OpenType', extension: '.ttf', isMonospaced: true, panose: null, category: 'monospace' },
    { familyName: 'Segoe Script', styleName: 'Regular', postScriptName: 'SegoeScript', fullName: 'Segoe Script', version: '', filePath: 'C:/Windows/Fonts/segoesc.ttf', fontType: 'TrueType', extension: '.ttf', isMonospaced: false, panose: null, category: 'handwriting' },
    { familyName: 'Microsoft YaHei', styleName: 'Regular', postScriptName: 'MicrosoftYaHei', fullName: '微软雅黑', version: '', filePath: 'C:/Windows/Fonts/msyh.ttc', fontType: 'TrueType Collection', extension: '.ttc', isMonospaced: false, panose: null, category: 'sans-serif' },
    { familyName: 'SimSun', styleName: 'Regular', postScriptName: 'SimSun', fullName: '宋体', version: '', filePath: 'C:/Windows/Fonts/simsun.ttc', fontType: 'TrueType Collection', extension: '.ttc', isMonospaced: false, panose: null, category: 'serif' },
    { familyName: 'SimHei', styleName: 'Regular', postScriptName: 'SimHei', fullName: '黑体', version: '', filePath: 'C:/Windows/Fonts/simhei.ttf', fontType: 'TrueType', extension: '.ttf', isMonospaced: false, panose: null, category: 'sans-serif' },
    { familyName: 'KaiTi', styleName: 'Regular', postScriptName: 'KaiTi', fullName: '楷体', version: '', filePath: 'C:/Windows/Fonts/simkai.ttf', fontType: 'TrueType', extension: '.ttf', isMonospaced: false, panose: null, category: 'handwriting' },
    { familyName: 'Courier New', styleName: 'Regular', postScriptName: 'CourierNewPSMT', fullName: 'Courier New', version: '', filePath: 'C:/Windows/Fonts/cour.ttf', fontType: 'TrueType', extension: '.ttf', isMonospaced: true, panose: null, category: 'monospace' },
    { familyName: 'Georgia', styleName: 'Regular', postScriptName: 'Georgia', fullName: 'Georgia', version: '', filePath: 'C:/Windows/Fonts/georgia.ttf', fontType: 'TrueType', extension: '.ttf', isMonospaced: false, panose: null, category: 'serif' },
    { familyName: 'Verdana', styleName: 'Regular', postScriptName: 'Verdana', fullName: 'Verdana', version: '', filePath: 'C:/Windows/Fonts/verdana.ttf', fontType: 'TrueType', extension: '.ttf', isMonospaced: false, panose: null, category: 'sans-serif' },
    { familyName: 'Tahoma', styleName: 'Regular', postScriptName: 'Tahoma', fullName: 'Tahoma', version: '', filePath: 'C:/Windows/Fonts/tahoma.ttf', fontType: 'TrueType', extension: '.ttf', isMonospaced: false, panose: null, category: 'sans-serif' }
  ]
}

async function exportPreviewImage(font) {
  if (!font) return
  await loadFontForPreview(font)
  await nextTick()

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const width = 1200
  const padding = 60
  const headerHeight = 140

  const tempDiv = document.createElement('div')
  tempDiv.style.cssText = `
    position: absolute;
    left: -9999px;
    top: -9999px;
    font-family: "${font.familyName}", sans-serif;
    font-size: ${fontSize.value}px;
    font-weight: ${fontWeight.value};
    font-style: ${fontItalic.value ? 'italic' : 'normal'};
    white-space: pre-wrap;
    max-width: ${width - padding * 2}px;
    visibility: hidden;
  `
  tempDiv.textContent = previewText.value || 'The quick brown fox jumps over the lazy dog'
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

  const fontSizeStr = `${fontItalic.value ? 'italic ' : ''}${fontWeight.value} ${fontSize.value}px`
  ctx.font = `${fontSizeStr} "${font.familyName}", sans-serif`
  ctx.fillStyle = '#0f172a'
  ctx.textBaseline = 'top'

  const textToDraw = previewText.value || 'The quick brown fox jumps over the lazy dog'
  const maxWidth = width - padding * 2

  try {
    await document.fonts.load(`${fontSizeStr} "${font.familyName}"`)
  } catch (e) {}

  wrapText(ctx, textToDraw, padding, headerHeight + 40, maxWidth, fontSize.value * 1.4)

  ctx.fillStyle = '#94a3b8'
  ctx.font = '12px -apple-system, sans-serif'
  ctx.textBaseline = 'bottom'
  ctx.fillText(`导出时间: ${new Date().toLocaleString()}`, padding, height - 25)
  ctx.textAlign = 'right'
  ctx.fillText(font.filePath, width - padding, height - 25)
  ctx.textAlign = 'left'

  await saveCanvasAsImage(canvas, `${font.familyName}-preview`)
}

async function exportCompareImage() {
  if (!compareFontA.value || !compareFontB.value) return
  await loadFontForPreview(compareFontA.value)
  await loadFontForPreview(compareFontB.value)
  await nextTick()

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  const width = 1600
  const padding = 50
  const headerHeight = 120
  const columnWidth = (width - padding * 3) / 2

  const sampleSizes = [14, 18, 24, 32, 48, fontSize.value]
  const textLines = previewText.value || 'The quick brown fox jumps over the lazy dog. 敏捷的棕色狐狸跳过懒狗。'

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
  ctx.fillText(compareFontA.value.familyName, padding, 50)
  ctx.fillText(compareFontB.value.familyName, padding * 2 + columnWidth, 50)

  ctx.fillStyle = '#64748b'
  ctx.font = '13px -apple-system, sans-serif'
  ctx.fillText(compareFontA.value.styleName + ' • ' + compareFontA.value.fontType, padding, 75)
  ctx.fillText(compareFontB.value.styleName + ' • ' + compareFontB.value.fontType, padding * 2 + columnWidth, 75)

  let y = headerHeight + 30
  const textA = textLines
  const textB = textLines

  for (const size of sampleSizes) {
    const fontStrA = `${fontItalic.value ? 'italic ' : ''}${fontWeight.value} ${size}px "${compareFontA.value.familyName}"`
    const fontStrB = `${fontItalic.value ? 'italic ' : ''}${fontWeight.value} ${size}px "${compareFontB.value.familyName}"`

    try {
      await document.fonts.load(fontStrA)
      await document.fonts.load(fontStrB)
    } catch (e) {}

    ctx.fillStyle = '#94a3b8'
    ctx.font = '11px -apple-system, sans-serif'
    ctx.textBaseline = 'top'
    ctx.fillText(`${size}px`, 15, y + 4)

    ctx.fillStyle = '#0f172a'
    ctx.font = fontStrA
    wrapText(ctx, textA, padding, y, columnWidth, size * 1.5)

    ctx.font = fontStrB
    wrapText(ctx, textB, padding * 2 + columnWidth, y, columnWidth, size * 1.5)

    y += size * 1.8 + 10
  }

  ctx.fillStyle = '#e2e8f0'
  ctx.fillRect(width / 2 - 1, headerHeight, 2, height - headerHeight - 80)

  await saveCanvasAsImage(canvas, `${compareFontA.value.familyName}-vs-${compareFontB.value.familyName}`)
}

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

onMounted(() => {
  scanFonts()
})
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.logo {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, var(--primary), #8b5cf6);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.app-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}

.app-subtitle {
  font-size: 12px;
  color: var(--text-muted);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
  gap: 20px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.search-box {
  position: relative;
  min-width: 280px;
  max-width: 360px;
}

.search-box svg {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.search-box input {
  width: 100%;
  padding-left: 34px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  font-size: 12px;
  color: var(--text-secondary);
  transition: all 0.2s;
  white-space: nowrap;
}

.filter-chip:hover {
  border-color: #cbd5e1;
}

.filter-chip.active {
  background: var(--primary-light);
  border-color: var(--primary);
  color: var(--primary);
}

.chip-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.chip-count {
  color: var(--text-muted);
  font-size: 11px;
}

.font-count {
  font-size: 13px;
  color: var(--text-muted);
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  width: 320px;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border);
}

.sidebar-header {
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
}

.sidebar-header h3 {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.font-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.font-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.15s;
  border: 2px solid transparent;
  margin-bottom: 4px;
}

.font-item:hover {
  background: var(--bg-tertiary);
}

.font-item.selected {
  background: var(--primary-light);
  border-color: var(--primary);
}

.font-item.compared {
  border-color: var(--success);
  background: rgba(16,185,129,0.08);
}

.font-item-preview {
  width: 56px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  flex-shrink: 0;
}

.font-item-info {
  flex: 1;
  min-width: 0;
}

.font-item-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.font-item-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.font-style {
  font-size: 11px;
  color: var(--text-muted);
}

.font-type-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 500;
}

.font-type-badge.serif { background: rgba(16,185,129,0.12); color: #059669; }
.font-type-badge.sans-serif { background: rgba(59,130,246,0.12); color: #2563eb; }
.font-type-badge.handwriting { background: rgba(245,158,11,0.12); color: #d97706; }
.font-type-badge.monospace { background: rgba(139,92,246,0.12); color: #7c3aed; }

.empty-state, .loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: var(--text-muted);
}

.empty-state p {
  margin-top: 12px;
  font-size: 13px;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  margin-top: 16px;
  font-size: 13px;
  color: var(--text-secondary);
}

.loading-hint {
  font-size: 11px !important;
  margin-top: 6px !important;
  color: var(--text-muted) !important;
}

.preview-section {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: var(--bg-primary);
}

.single-preview {
  max-width: 100%;
}

.preview-panel {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: 28px;
}

.preview-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 20px;
}

.preview-title {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
}

.preview-subtitle {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  font-size: 13px;
  color: var(--text-secondary);
}

.dot-sep {
  color: var(--text-muted);
}

.preview-controls {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 16px 0;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-group label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  white-space: nowrap;
}

.control-group input[type="range"] {
  width: 160px;
  padding: 0;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.checkbox-group input {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.preview-input-row {
  margin-bottom: 20px;
}

.preview-input-row textarea {
  width: 100%;
  resize: vertical;
  min-height: 56px;
}

.preview-display {
  background: linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%);
  border-radius: var(--radius-md);
  padding: 48px 32px;
  border: 1px solid var(--border);
  margin-bottom: 28px;
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.preview-text-large {
  color: var(--text-primary);
  word-break: break-word;
  line-height: 1.6;
}

.preview-samples, .preview-meta {
  padding-top: 20px;
  border-top: 1px solid var(--border);
  margin-bottom: 28px;
}

.preview-samples:last-child, .preview-meta:last-child {
  margin-bottom: 0;
}

.preview-samples h4, .preview-meta h4 {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sample-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid var(--bg-tertiary);
}

.sample-row:last-child {
  border-bottom: none;
}

.sample-label {
  width: 60px;
  flex-shrink: 0;
  font-size: 11px;
  color: var(--text-muted);
  padding-top: 4px;
  font-family: monospace;
}

.sample-text {
  flex: 1;
  color: var(--text-primary);
  word-break: break-word;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px 24px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-item-full {
  grid-column: 1 / -1;
}

.meta-label {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 500;
}

.meta-value {
  font-size: 13px;
  color: var(--text-primary);
  font-weight: 500;
}

.meta-path {
  font-family: monospace;
  font-size: 12px;
  word-break: break-all;
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
}

.empty-preview {
  height: 100%;
  min-height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--text-muted);
}

.empty-preview h3 {
  margin-top: 20px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-secondary);
}

.empty-preview p {
  margin-top: 8px;
  font-size: 13px;
}

.empty-preview .hint {
  margin-top: 12px;
  font-size: 11px;
  color: var(--text-muted);
  padding: 6px 12px;
  background: var(--primary-light);
  color: var(--primary);
  border-radius: 999px;
}

.compare-preview {
  max-width: 100%;
}

.compare-header {
  text-align: center;
  padding: 20px;
  margin-bottom: 20px;
}

.compare-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.compare-header p {
  margin-top: 6px;
  font-size: 13px;
  color: var(--text-muted);
}

.compare-panels {
  display: flex;
  align-items: stretch;
  gap: 16px;
  margin-bottom: 24px;
}

.compare-panel {
  flex: 1;
  background: var(--bg-secondary);
  border: 2px dashed var(--border);
  border-radius: var(--radius-md);
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.compare-panel:hover {
  border-color: #94a3b8;
}

.compare-panel.active {
  border-color: var(--primary);
  background: var(--primary-light);
  border-style: solid;
}

.compare-slot-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.slot-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-muted);
}

.clear-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(239,68,68,0.1);
  color: var(--danger);
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: var(--danger);
  color: white;
}

.compare-slot-content {
  padding: 16px 0;
  text-align: center;
}

.slot-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
}

.slot-subtitle {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-muted);
}

.compare-slot-empty {
  padding: 24px 0;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
}

.compare-vs {
  align-self: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.compare-display {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
}

.compare-side-by-side {
  display: flex;
  background: linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  margin: 20px 0 28px;
  min-height: 180px;
}

.compare-side {
  flex: 1;
  padding: 32px 24px;
}

.compare-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--primary);
  display: inline-block;
}

.compare-divider {
  width: 2px;
  background: var(--border);
}

.compare-text {
  color: var(--text-primary);
  word-break: break-word;
  line-height: 1.6;
}

.compare-samples {
  padding-top: 20px;
  border-top: 1px solid var(--border);
}

.compare-samples h4 {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.compare-sample-row {
  display: grid;
  grid-template-columns: 60px 1fr 1fr;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--bg-tertiary);
  align-items: start;
}

.compare-sample-row:last-child {
  border-bottom: none;
}

.sample-size {
  font-size: 11px;
  color: var(--text-muted);
  font-family: monospace;
  padding-top: 4px;
}

.compare-sample-cell {
  color: var(--text-primary);
  word-break: break-word;
  line-height: 1.5;
}

.compare-empty {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 60px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--text-muted);
}

.compare-empty p {
  margin-top: 16px;
  font-size: 13px;
}
</style>
