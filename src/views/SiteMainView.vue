<script setup lang="ts">
import { ref, computed, shallowRef, watch, type Component } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useRegistryStore } from '../stores/registry'
import { useCompositionStore } from '../stores/composition'
import type { PageTemplate } from '../types/registry'
import { Check, LayoutTemplate, ArrowLeft } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const returnTo = computed(() => (route.query.returnTo as string) || '/site')
const registry = useRegistryStore()
const composition = useCompositionStore()

const templates = computed(() => registry.getTemplates())

// Template selection + preview
const previewingTemplate = ref<PageTemplate | null>(null)
const TemplatePreview = shallowRef<Component | null>(null)

watch(previewingTemplate, async (template) => {
  if (template) {
    const module = await template.component()
    TemplatePreview.value = module.default
  } else {
    TemplatePreview.value = null
  }
})

const toggleTemplatePreview = (template: PageTemplate) => {
  if (previewingTemplate.value?.id === template.id) {
    previewingTemplate.value = null
  } else {
    previewingTemplate.value = template
  }
}

const selectTemplate = (id: string) => {
  if (composition.composition.defaultTemplate === id) {
    composition.setDefaultTemplate(null)
  } else {
    composition.setDefaultTemplate(id)
  }
}
</script>

<template>
  <div class="p-6 lg:p-8 max-w-7xl">
    <!-- Back -->
    <button
      @click="router.push(returnTo)"
      class="flex items-center gap-1.5 text-sm mb-6 transition-colors"
      :style="{ color: 'var(--theme-text-secondary)' }"
    >
      <ArrowLeft class="w-4 h-4" />
      {{ returnTo === '/site' ? 'Back to Site Builder' : 'Back' }}
    </button>

    <!-- Selection Summary Bar -->
    <div
      v-if="composition.selectedTemplate"
      class="mb-6 p-4 rounded-xl border"
      :style="{ backgroundColor: 'var(--theme-primary-light)', borderColor: 'var(--theme-primary)' }"
    >
      <h3 class="text-xs font-semibold uppercase tracking-wide mb-2" :style="{ color: 'var(--theme-primary)' }">
        Selected for Project
      </h3>
      <div class="flex flex-wrap gap-2">
        <span
          class="inline-flex items-center gap-1.5 text-sm px-3 py-1 rounded-full font-medium"
          :style="{ backgroundColor: 'var(--theme-bg-card)', color: 'var(--theme-text-primary)', border: '1px solid var(--theme-border)' }"
        >
          <LayoutTemplate class="w-3.5 h-3.5" :style="{ color: 'var(--theme-primary)' }" />
          {{ composition.selectedTemplate.name }}
        </span>
      </div>
    </div>

    <!-- Page Templates Section -->
    <div>
      <div class="mb-6">
        <h1 class="text-2xl font-bold" :style="{ color: 'var(--theme-text-primary)' }">Page Templates</h1>
        <p class="mt-1" :style="{ color: 'var(--theme-text-secondary)' }">
          Choose a default layout frame for your pages. This applies site-wide but can be overridden per-page in the Sitemap.
        </p>
      </div>

      <!-- Template Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div
          v-for="template in templates"
          :key="template.id"
          class="rounded-xl border overflow-hidden transition-all duration-200"
          :class="composition.composition.defaultTemplate === template.id ? 'ring-2 shadow-md' : ''"
          :style="{
            backgroundColor: 'var(--theme-bg-card)',
            borderColor: composition.composition.defaultTemplate === template.id ? 'var(--theme-primary)' : 'var(--theme-border)',
            '--tw-ring-color': 'var(--theme-primary)'
          }"
        >
          <button
            @click="toggleTemplatePreview(template)"
            class="w-full p-5 text-left"
          >
            <div class="flex items-start justify-between mb-1">
              <h3 class="font-semibold" :style="{ color: 'var(--theme-text-primary)' }">{{ template.name }}</h3>
              <div
                v-if="composition.composition.defaultTemplate === template.id"
                class="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                :style="{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
              >
                <Check class="w-3 h-3" />
              </div>
            </div>
            <p class="text-sm mb-3" :style="{ color: 'var(--theme-text-secondary)' }">{{ template.description }}</p>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="tag in template.tags"
                :key="tag"
                class="text-xs px-2 py-0.5 rounded-full"
                :style="{ backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }"
              >{{ tag }}</span>
            </div>
          </button>
          <div class="px-5 pb-4">
            <button
              @click="selectTemplate(template.id)"
              class="w-full text-sm py-2 rounded-lg font-medium transition-colors"
              :style="composition.composition.defaultTemplate === template.id
                ? { backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-secondary)' }
                : { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
            >
              {{ composition.composition.defaultTemplate === template.id ? 'Deselect' : 'Select for Project' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Template Preview -->
      <div
        v-if="previewingTemplate"
        class="rounded-xl border overflow-hidden"
        :style="{ borderColor: 'var(--theme-border)' }"
      >
        <div
          class="px-4 py-3 border-b flex items-center justify-between"
          :style="{ backgroundColor: 'var(--theme-bg-tertiary)', borderColor: 'var(--theme-border)' }"
        >
          <span class="font-medium text-sm" :style="{ color: 'var(--theme-text-primary)' }">
            Preview: {{ previewingTemplate.name }}
          </span>
          <button
            @click="previewingTemplate = null"
            class="text-sm px-3 py-1 rounded-lg transition-colors"
            :style="{ color: 'var(--theme-text-secondary)' }"
          >Close</button>
        </div>
        <div class="bg-white p-4">
          <Suspense>
            <component :is="TemplatePreview" v-if="TemplatePreview" />
            <template #fallback>
              <div class="p-8 text-center text-gray-400">Loading preview...</div>
            </template>
          </Suspense>
        </div>
      </div>
    </div>
  </div>
</template>
