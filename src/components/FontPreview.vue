<template>
  <div class="single-preview">
    <div v-if="font" class="preview-panel">
      <div class="preview-header">
        <div>
          <h2 class="preview-title">{{ font.familyName }}</h2>
          <div class="preview-subtitle">
            <span>{{ font.styleName }}</span>
            <span class="dot-sep">•</span>
            <span>{{ font.fontType }}</span>
            <span class="dot-sep">•</span>
            <span class="font-type-badge" :class="font.category">{{ getCategoryLabel(font.category) }}</span>
          </div>
        </div>
        <div class="preview-actions">
          <button class="btn btn-secondary" @click="handleExport">
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
          <label>字号: {{ previewStore.fontSize }}px</label>
          <input type="range" v-model.number="previewStore.fontSize" min="12" max="120" step="2" />
        </div>
        <div class="control-group">
          <label>字重</label>
          <select v-model="previewStore.fontWeight">
            <option v-for="w in WEIGHT_OPTIONS" :key="w.value" :value="w.value">{{ w.label }}</option>
          </select>
        </div>
        <div class="control-group checkbox-group">
          <label><input type="checkbox" v-model="previewStore.fontItalic" /> 斜体</label>
        </div>
      </div>

      <div class="preview-input-row">
        <textarea
          v-model="previewStore.previewText"
          rows="2"
          placeholder="输入要预览的文本..."
        ></textarea>
      </div>

      <div class="preview-display">
        <div
          class="preview-text-large"
          :style="previewStore.getPreviewStyle(font)"
        >
          {{ previewStore.previewText || DEFAULT_PREVIEW_TEXT }}
        </div>
      </div>

      <div class="preview-samples">
        <h4>字号示例</h4>
        <div class="sample-row" v-for="size in SAMPLE_SIZES" :key="size">
          <div class="sample-label">{{ size }}px</div>
          <div class="sample-text" :style="previewStore.getPreviewStyle(font, size)">
            字体样式示例 Sample Text 12345
          </div>
        </div>
      </div>

      <div class="preview-meta">
        <h4>字体信息</h4>
        <div class="meta-grid">
          <div class="meta-item">
            <span class="meta-label">字体家族</span>
            <span class="meta-value">{{ font.familyName }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">样式名称</span>
            <span class="meta-value">{{ font.styleName }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">PostScript</span>
            <span class="meta-value">{{ font.postScriptName }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">字体类型</span>
            <span class="meta-value">{{ font.fontType }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">分类</span>
            <span class="meta-value">{{ getCategoryLabel(font.category) }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">等宽字体</span>
            <span class="meta-value">{{ font.isMonospaced ? '是' : '否' }}</span>
          </div>
          <div class="meta-item meta-item-full">
            <span class="meta-label">文件路径</span>
            <span class="meta-value meta-path">{{ font.filePath }}</span>
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
</template>

<script setup>
import { getCategoryLabel, FONT_WEIGHT_OPTIONS, DEFAULT_PREVIEW_TEXT, SAMPLE_SIZES } from '../models/font.js'
import { usePreviewStore } from '../stores/previewStore.js'
import { exportPreviewImage } from '../utils/exporter.js'

const props = defineProps({
  font: { type: Object, default: null }
})

const previewStore = usePreviewStore()
const WEIGHT_OPTIONS = FONT_WEIGHT_OPTIONS

function handleExport() {
  if (props.font) {
    exportPreviewImage(props.font)
  }
}
</script>

<style scoped>
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

.preview-actions {
  flex-shrink: 0;
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
  padding: 6px 12px;
  background: var(--primary-light);
  color: var(--primary);
  border-radius: 999px;
}
</style>
