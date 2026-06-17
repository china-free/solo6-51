<template>
  <div class="toolbar">
    <div class="toolbar-left">
      <div class="search-box">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          :value="filterStore.searchQuery"
          @input="filterStore.searchQuery = $event.target.value"
          type="text"
          placeholder="搜索字体名称..."
        />
      </div>
      <div class="filter-group">
        <button
          v-for="cat in categories"
          :key="cat.value"
          class="filter-chip"
          :class="{ active: filterStore.selectedCategory === cat.value }"
          @click="filterStore.selectedCategory = cat.value"
        >
          <span class="chip-dot" :style="{ background: cat.color }"></span>
          {{ cat.label }}
          <span class="chip-count">({{ getCategoryCount(cat.value) }})</span>
        </button>
      </div>
    </div>
    <div class="toolbar-right">
      <span class="font-count">共 {{ filteredCount }} 个字体</span>
    </div>
  </div>
</template>

<script setup>
import { FONT_CATEGORIES } from '../models/font.js'
import { useFilterStore } from '../stores/filterStore.js'

defineProps({
  filteredCount: { type: Number, default: 0 },
  getCategoryCount: { type: Function, required: true }
})

const categories = FONT_CATEGORIES
const filterStore = useFilterStore()
</script>

<style scoped>
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
</style>
