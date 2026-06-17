<template>
  <div class="app">
    <AppHeader
      :loading="fontStore.loading.value"
      :compareMode="compareStore.mode.value"
      @rescan="fontStore.rescanFonts"
      @toggle-compare="compareStore.toggleMode"
    />

    <FontToolbar
      :filteredCount="fontStore.filteredFonts.value.length"
      :getCategoryCount="fontStore.getCategoryCount"
    />

    <div class="main-content">
      <FontList
        :fonts="fontStore.filteredFonts.value"
        :loading="fontStore.loading.value"
      />

      <section class="preview-section">
        <FontPreview v-if="!compareStore.mode.value" :font="fontStore.selectedFont.value" />
        <FontCompare v-else />
      </section>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import AppHeader from './components/AppHeader.vue'
import FontToolbar from './components/FontToolbar.vue'
import FontList from './components/FontList.vue'
import FontPreview from './components/FontPreview.vue'
import FontCompare from './components/FontCompare.vue'
import { useFontStore } from './stores/fontStore.js'
import { useCompareStore } from './stores/compareStore.js'

const fontStore = useFontStore()
const compareStore = useCompareStore()

onMounted(() => {
  fontStore.scanFonts()
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

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.preview-section {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: var(--bg-primary);
}
</style>
