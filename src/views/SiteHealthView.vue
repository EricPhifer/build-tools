<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, Info } from 'lucide-vue-next'
import { useWorkflowStore } from '../stores/workflow'

const router = useRouter()
const workflow = useWorkflowStore()

const healthCheck = computed(() => workflow.clientInfo?.healthCheck ?? null)

const AREAS = [
  { key: 'searchVisibility', label: 'Search Visibility' },
  { key: 'googleBusiness', label: 'Google Business Profile' },
  { key: 'socialPresence', label: 'Social Presence' },
  { key: 'websiteDiscovery', label: 'Website Discovery' },
  { key: 'brandConsistency', label: 'Brand Consistency' },
  { key: 'contactAccessibility', label: 'Contact Accessibility' },
  { key: 'trustCompliance', label: 'Trust & Compliance' }
] as const

function grade(score: number): { letter: string; color: string; bg: string } {
  if (score >= 9) return { letter: 'A', color: 'var(--theme-success)', bg: 'var(--theme-success-light)' }
  if (score >= 7) return { letter: 'B', color: 'var(--theme-success)', bg: 'var(--theme-success-light)' }
  if (score >= 5) return { letter: 'C', color: 'var(--theme-warning)', bg: 'var(--theme-warning-light)' }
  if (score >= 3) return { letter: 'D', color: 'var(--theme-warning)', bg: 'var(--theme-warning-light)' }
  return { letter: 'F', color: 'var(--theme-danger)', bg: 'var(--theme-danger-light)' }
}

function overallGrade(score: number) {
  return grade(score)
}
</script>

<template>
  <div class="p-6 lg:p-8 max-w-3xl">
    <!-- Back -->
    <button
      @click="router.push('/site/legal')"
      class="flex items-center gap-1.5 text-sm mb-6 transition-colors"
      :style="{ color: 'var(--theme-text-secondary)' }"
    >
      <ArrowLeft class="w-4 h-4" />
      Back to Legal Pages
    </button>

    <div class="mb-8">
      <p class="text-xs font-semibold uppercase tracking-widest mb-1" :style="{ color: 'var(--theme-primary)' }">Step 2e</p>
      <h1 class="text-2xl font-bold" :style="{ color: 'var(--theme-text-primary)' }">Health Check Baseline</h1>
      <p class="mt-1" :style="{ color: 'var(--theme-text-secondary)' }">
        A snapshot of this client's current digital health. Use this to prioritize focus areas during the build.
      </p>
    </div>

    <!-- No data notice -->
    <template v-if="!healthCheck">
      <div
        class="flex items-start gap-3 p-6 rounded-xl border"
        :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
      >
        <Info class="w-5 h-5 shrink-0 mt-0.5" :style="{ color: 'var(--theme-text-muted)' }" />
        <div>
          <p class="font-medium mb-1" :style="{ color: 'var(--theme-text-primary)' }">No health check data available for this client.</p>
          <p class="text-sm" :style="{ color: 'var(--theme-text-secondary)' }">
            Run a health check in the Client Dashboard first, or continue to the build checklist and treat all areas as needing attention.
          </p>
        </div>
      </div>
    </template>

    <!-- Health data -->
    <template v-else>
      <!-- Overall score -->
      <div
        class="flex items-center gap-6 p-6 rounded-xl border mb-6"
        :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
      >
        <div
          class="w-20 h-20 rounded-full flex flex-col items-center justify-center text-center shrink-0"
          :style="{ backgroundColor: overallGrade(healthCheck.score).bg, color: overallGrade(healthCheck.score).color }"
        >
          <span class="text-3xl font-black leading-none">{{ overallGrade(healthCheck.score).letter }}</span>
          <span class="text-xs font-bold">{{ healthCheck.score }}/10</span>
        </div>
        <div>
          <p class="font-bold text-lg" :style="{ color: 'var(--theme-text-primary)' }">Overall Score</p>
          <p class="text-sm" :style="{ color: 'var(--theme-text-secondary)' }">
            {{ healthCheck.date ? `Last checked: ${new Date(healthCheck.date).toLocaleDateString()}` : 'Date not recorded' }}
          </p>
        </div>
      </div>

      <!-- Area scores -->
      <div class="space-y-3 mb-8">
        <div
          v-for="area in AREAS"
          :key="area.key"
          class="flex items-center gap-4 px-4 py-3 rounded-lg border"
          :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
        >
          <!-- Grade badge -->
          <div
            v-if="healthCheck[area.key]"
            class="w-9 h-9 rounded-lg flex flex-col items-center justify-center text-center shrink-0"
            :style="{ backgroundColor: grade(healthCheck[area.key]!.score).bg, color: grade(healthCheck[area.key]!.score).color }"
          >
            <span class="text-sm font-black leading-none">{{ grade(healthCheck[area.key]!.score).letter }}</span>
          </div>
          <div
            v-else
            class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-lg"
            :style="{ backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }"
          >
            —
          </div>

          <!-- Label + score -->
          <div class="flex-1 min-w-0">
            <p class="font-medium text-sm" :style="{ color: 'var(--theme-text-primary)' }">{{ area.label }}</p>
          </div>
          <div v-if="healthCheck[area.key]" class="text-sm font-bold shrink-0" :style="{ color: grade(healthCheck[area.key]!.score).color }">
            {{ healthCheck[area.key]!.score }}/10
          </div>
          <div v-else class="text-sm shrink-0" :style="{ color: 'var(--theme-text-muted)' }">
            No data
          </div>

          <!-- Progress bar -->
          <div class="w-24 h-2 rounded-full overflow-hidden shrink-0" :style="{ backgroundColor: 'var(--theme-bg-tertiary)' }">
            <div
              class="h-full rounded-full transition-all"
              :style="{
                width: healthCheck[area.key] ? `${(healthCheck[area.key]!.score / 10) * 100}%` : '0%',
                backgroundColor: healthCheck[area.key] ? grade(healthCheck[area.key]!.score).color : 'transparent'
              }"
            />
          </div>
        </div>
      </div>
    </template>

    <!-- Actions -->
    <div class="flex justify-between">
      <button
        @click="router.push('/site/legal')"
        class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-colors"
        :style="{ color: 'var(--theme-text-secondary)', backgroundColor: 'var(--theme-bg-secondary)' }"
      >
        <ArrowLeft class="w-4 h-4" />
        Back
      </button>
      <button
        @click="router.push('/site/checklist')"
        class="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-colors"
        :style="{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
      >
        Continue to Build Checklist
        <ArrowRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
