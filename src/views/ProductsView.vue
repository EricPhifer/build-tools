<script setup lang="ts">
import { useRouter } from 'vue-router'
import { FolderOpen, Combine } from 'lucide-vue-next'

const router = useRouter()

const sections = [
  {
    name: 'Assemble Project',
    description: 'Compose selected site variants, CMS config, and dashboard setup into a new client project.',
    icon: Combine,
    path: '/products/assemble'
  },
  {
    name: 'Project Portfolio',
    description: 'Browse delivered client projects with links to their live site, studio, and dashboard.',
    icon: FolderOpen,
    path: '/products/portfolio'
  }
]
</script>

<template>
  <div class="p-6 lg:p-8 max-w-6xl">
    <div class="mb-8">
      <h1 class="text-2xl font-bold" :style="{ color: 'var(--theme-text-primary)' }">Final Products</h1>
      <p class="mt-1" :style="{ color: 'var(--theme-text-secondary)' }">
        Assemble site + CMS + dashboard selections into deliverable client projects, and track what's been shipped.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <button
        v-for="section in sections"
        :key="section.path"
        @click="router.push(section.path)"
        class="p-6 rounded-xl border text-left transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer group"
        :style="{
          backgroundColor: 'var(--theme-bg-card)',
          borderColor: 'var(--theme-border)'
        }"
      >
        <div
          class="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
          :style="{ backgroundColor: 'var(--theme-primary-light)', color: 'var(--theme-primary)' }"
        >
          <component :is="section.icon" class="w-6 h-6" />
        </div>
        <h2 class="text-lg font-semibold mb-1" :style="{ color: 'var(--theme-text-primary)' }">{{ section.name }}</h2>
        <p class="text-sm" :style="{ color: 'var(--theme-text-secondary)' }">{{ section.description }}</p>
      </button>
    </div>
  </div>
</template>
