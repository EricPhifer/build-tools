<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft, ArrowRight,
  Wrench, Briefcase, Heart, Building2, Home, ShoppingBag, Palette, Monitor,
  Server, Globe, LayoutDashboard, Database, UtensilsCrossed,
  FlaskConical
} from 'lucide-vue-next'
import { useCompositionStore } from '../stores/composition'
import { useWorkflowStore } from '../stores/workflow'
import { BUSINESS_TYPES } from '../data/siteBuilderData'
import type { BusinessType } from '../types/registry'
import { isAppProjectType } from '../types/registry'

const router = useRouter()
const composition = useCompositionStore()
const workflow = useWorkflowStore()

const isProjectMode = computed(() => composition.siteBuilder.projectMode)

const selected = ref<BusinessType | null>(composition.siteBuilder.businessType)

// Filter the type list based on mode:
// project mode → only project_* types | client mode → only non-project_* types
const visibleTypes = computed(() =>
  isProjectMode.value
    ? BUSINESS_TYPES.filter(t => t.id.startsWith('project_'))
    : BUSINESS_TYPES.filter(t => !t.id.startsWith('project_'))
)

const iconMap: Record<string, object> = {
  Wrench, Briefcase, Heart, Building2, Home, ShoppingBag, Palette, Monitor,
  Server, Globe, LayoutDashboard, Database, UtensilsCrossed
}

function confirm() {
  if (!selected.value) return
  composition.setBusinessType(selected.value)
  const typeInfo = BUSINESS_TYPES.find(t => t.id === selected.value)
  if (typeInfo && workflow.clientInfo) {
    workflow.setClient({
      ...workflow.clientInfo,
      brandKit: { ...workflow.clientInfo.brandKit, industry: typeInfo.label }
    })
  }
  router.push(isAppProjectType(selected.value) ? '/site/app-screens' : '/site/legal')
}
</script>

<template>
  <div class="p-6 lg:p-8 max-w-4xl">
    <!-- Back -->
    <button
      @click="router.push('/site/bundle')"
      class="flex items-center gap-1.5 text-sm mb-6 transition-colors"
      :style="{ color: 'var(--theme-text-secondary)' }"
    >
      <ArrowLeft class="w-4 h-4" />
      Back to Bundle Selection
    </button>

    <div class="mb-8">
      <div class="flex items-center gap-2 mb-1">
        <p class="text-xs font-semibold uppercase tracking-widest" :style="{ color: 'var(--theme-primary)' }">Step 2b</p>
        <span
          v-if="isProjectMode"
          class="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
          :style="{ backgroundColor: 'var(--theme-warning)', color: 'var(--theme-text-inverse)' }"
        >
          <FlaskConical class="w-3 h-3" />
          Project Mode
        </span>
      </div>
      <h1 class="text-2xl font-bold" :style="{ color: 'var(--theme-text-primary)' }">
        {{ isProjectMode ? 'Project Type' : 'Business Type' }}
      </h1>
      <p class="mt-1" :style="{ color: 'var(--theme-text-secondary)' }">
        {{ isProjectMode
          ? 'Select the category that best describes this project. This drives sitemap defaults and schema markup.'
          : 'Select the type that best describes this client\'s business. This drives sitemap defaults, schema markup, and build checklist focus.'
        }}
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
      <button
        v-for="type in visibleTypes"
        :key="type.id"
        @click="selected = type.id"
        class="p-4 rounded-xl border-2 text-left transition-all"
        :style="selected === type.id
          ? { borderColor: isProjectMode ? 'var(--theme-warning)' : 'var(--theme-primary)', backgroundColor: isProjectMode ? 'var(--theme-warning-light)' : 'var(--theme-primary-light)' }
          : { borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }"
      >
        <div
          class="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
          :style="selected === type.id
            ? { backgroundColor: isProjectMode ? 'var(--theme-warning)' : 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }
            : { backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-secondary)' }"
        >
          <component :is="iconMap[type.icon]" class="w-5 h-5" />
        </div>
        <h3 class="font-semibold text-sm leading-tight mb-1" :style="{ color: 'var(--theme-text-primary)' }">
          {{ type.label }}
        </h3>
        <p class="text-xs leading-relaxed" :style="{ color: 'var(--theme-text-muted)' }">
          {{ type.description }}
        </p>
        <p class="text-xs mt-2 font-mono" :style="{ color: 'var(--theme-text-muted)' }">
          schema: {{ type.schemaType }}
        </p>
      </button>
    </div>

    <div class="flex justify-between">
      <button
        @click="router.push('/site/bundle')"
        class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-colors"
        :style="{ color: 'var(--theme-text-secondary)', backgroundColor: 'var(--theme-bg-secondary)' }"
      >
        <ArrowLeft class="w-4 h-4" />
        Back
      </button>
      <button
        :disabled="!selected"
        @click="confirm"
        class="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        :style="{ backgroundColor: isProjectMode ? 'var(--theme-warning)' : 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
      >
        Continue to Legal Pages
        <ArrowRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
