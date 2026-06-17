<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h3>字体列表</h3>
    </div>
    <div class="font-list" v-if="!loading">
      <div
        v-for="font in fonts"
        :key="font.filePath + ':' + (font.fontIndex ?? 0)"
        class="font-item"
        :class="{
          selected: isSameFont(font, selectedFont),
          compared: isFontInCompare(font)
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
      <div v-if="fonts.length === 0" class="empty-state">
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
</template>

<script setup>
import { isSameFont, getCategoryLabel } from '../models/font.js'
import { useFontStore } from '../stores/fontStore.js'
import { useCompareStore } from '../stores/compareStore.js'

defineProps({
  fonts: { type: Array, required: true },
  loading: Boolean
})

const { selectedFont, selectFont } = useFontStore()
const { addToCompare, isFontInCompare } = useCompareStore()
</script>

<style scoped>
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
</style>
