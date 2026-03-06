<script setup lang="ts">
import { useThemeStore } from '../stores/theme'
import { Sun, Moon } from 'lucide-vue-next'

const themeStore = useThemeStore()
</script>

<template>
  <button
    @click="themeStore.toggleMode"
    class="relative p-2 rounded-lg transition-all duration-300 hover:scale-105"
    :class="[
      themeStore.isDark
        ? 'bg-[var(--theme-bg-tertiary)] text-[var(--theme-accent)]'
        : 'bg-[var(--theme-bg-hover)] text-[var(--theme-warning)]'
    ]"
    :title="themeStore.isDark ? 'Switch to light mode' : 'Switch to dark mode'"
  >
    <Transition name="theme-icon" mode="out-in">
      <Sun v-if="themeStore.isDark" class="w-5 h-5" />
      <Moon v-else class="w-5 h-5" />
    </Transition>
  </button>
</template>

<style scoped>
.theme-icon-enter-active,
.theme-icon-leave-active {
  transition: all 0.2s ease;
}

.theme-icon-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.8);
}

.theme-icon-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.8);
}
</style>
