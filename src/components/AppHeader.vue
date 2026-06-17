<template>
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
      <button class="btn btn-secondary" @click="$emit('rescan')" :disabled="loading">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
          <path d="M21 3v5h-5"/>
          <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
          <path d="M8 16H3v5"/>
        </svg>
        重新扫描
      </button>
      <button class="btn" :class="compareMode ? 'btn-primary' : 'btn-secondary'" @click="$emit('toggle-compare')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="18" rx="1"/>
          <rect x="14" y="3" width="7" height="18" rx="1"/>
        </svg>
        {{ compareMode ? '关闭对比' : '对比模式' }}
      </button>
    </div>
  </header>
</template>

<script setup>
defineProps({
  loading: Boolean,
  compareMode: Boolean
})

defineEmits(['rescan', 'toggle-compare'])
</script>

<style scoped>
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
</style>
