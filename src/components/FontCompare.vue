<template>
  <div class="compare-preview">
    <div class="compare-header">
      <h2>字体对比模式</h2>
      <p>从左侧双击字体添加到对比区域，或点击下方按钮选择</p>
    </div>
    <div class="compare-panels">
      <div class="compare-panel" :class="{ active: compareStore.selectingSlot === 'A' }" @click="compareStore.selectingSlot = 'A'">
        <div class="compare-slot-header">
          <span class="slot-label">字体 A</span>
          <button v-if="compareStore.fontA" class="clear-btn" @click.stop="compareStore.clearSlot('A')">×</button>
        </div>
        <div v-if="compareStore.fontA" class="compare-slot-content">
          <div class="slot-title">{{ compareStore.fontA.familyName }}</div>
          <div class="slot-subtitle">{{ compareStore.fontA.styleName }} • {{ compareStore.fontA.fontType }}</div>
        </div>
        <div v-else class="compare-slot-empty">
          <p>点击选择字体 A</p>
        </div>
      </div>
      <div class="compare-vs">VS</div>
      <div class="compare-panel" :class="{ active: compareStore.selectingSlot === 'B' }" @click="compareStore.selectingSlot = 'B'">
        <div class="compare-slot-header">
          <span class="slot-label">字体 B</span>
          <button v-if="compareStore.fontB" class="clear-btn" @click.stop="compareStore.clearSlot('B')">×</button>
        </div>
        <div v-if="compareStore.fontB" class="compare-slot-content">
          <div class="slot-title">{{ compareStore.fontB.familyName }}</div>
          <div class="slot-subtitle">{{ compareStore.fontB.styleName }} • {{ compareStore.fontB.fontType }}</div>
        </div>
        <div v-else class="compare-slot-empty">
          <p>点击选择字体 B</p>
        </div>
      </div>
    </div>

    <div v-if="compareStore.fontA && compareStore.fontB" class="compare-display">
      <div class="preview-controls">
        <div class="control-group">
          <label>字号: {{ previewStore.fontSize }}px</label>
          <input type="range" v-model.number="previewStore.fontSize" min="12" max="120" step="2" />
        </div>
        <div class="control-group">
          <label>字重</label>
          <select v-model="previewStore.fontWeight">
            <option v-for="w in COMPARE_WEIGHT_OPTIONS" :key="w.value" :value="w.value">{{ w.label }}</option>
          </select>
        </div>
        <div class="control-group checkbox-group">
          <label><input type="checkbox" v-model="previewStore.fontItalic" /> 斜体</label>
        </div>
        <div class="control-group" style="margin-left: auto;">
          <button class="btn btn-secondary" @click="handleExportCompare">
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
          v-model="previewStore.previewText"
          rows="2"
          placeholder="输入要预览的文本..."
        ></textarea>
      </div>

      <div class="compare-side-by-side">
        <div class="compare-side">
          <div class="compare-label">{{ compareStore.fontA.familyName }}</div>
          <div class="compare-text" :style="previewStore.getPreviewStyle(compareStore.fontA)">
            {{ previewStore.previewText || DEFAULT_COMPARE_TEXT }}
          </div>
        </div>
        <div class="compare-divider"></div>
        <div class="compare-side">
          <div class="compare-label">{{ compareStore.fontB.familyName }}</div>
          <div class="compare-text" :style="previewStore.getPreviewStyle(compareStore.fontB)">
            {{ previewStore.previewText || DEFAULT_COMPARE_TEXT }}
          </div>
        </div>
      </div>

      <div class="compare-samples">
        <h4>逐行对比</h4>
        <div class="compare-sample-row" v-for="size in COMPARE_SIZES" :key="size">
          <div class="sample-size">{{ size }}px</div>
          <div class="compare-sample-cell" :style="previewStore.getPreviewStyle(compareStore.fontA, size)">
            字体样式对比 Sample 123
          </div>
          <div class="compare-sample-cell" :style="previewStore.getPreviewStyle(compareStore.fontB, size)">
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
</template>

<script setup>
import { FONT_WEIGHT_OPTIONS, DEFAULT_COMPARE_TEXT, COMPARE_SIZES } from '../models/font.js'
import { usePreviewStore } from '../stores/previewStore.js'
import { useCompareStore } from '../stores/compareStore.js'
import { exportCompareImage } from '../utils/exporter.js'

const previewStore = usePreviewStore()
const compareStore = useCompareStore()

const COMPARE_WEIGHT_OPTIONS = FONT_WEIGHT_OPTIONS.filter(w => Number(w.value) >= 400)

function handleExportCompare() {
  exportCompareImage()
}
</script>

<style scoped>
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

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.preview-input-row {
  margin-bottom: 20px;
}

.preview-input-row textarea {
  width: 100%;
  resize: vertical;
  min-height: 56px;
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
