<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, Check, FlaskConical, Loader2 } from 'lucide-vue-next'
import { useCompositionStore } from '../stores/composition'
import { useWorkflowStore } from '../stores/workflow'
import { useClientApi } from '../composables/useClientApi'

const router = useRouter()
const composition = useCompositionStore()
const workflow = useWorkflowStore()
const clientApi = useClientApi()

const projectModeLoading = ref(false)
const projectModeError = ref<string | null>(null)

function selectFoundation() {
  composition.setProjectMode(false)
  composition.setBundle('foundation')
  router.push('/site/type')
}

function selectEnrich() {
  composition.setProjectMode(false)
  composition.setBundle('enrich')
  router.push('/site/type')
}

function selectGrowth() {
  composition.setProjectMode(false)
  composition.setBundle('growth')
  router.push('/site/type')
}

async function selectProjectMode() {
  projectModeLoading.value = true
  projectModeError.value = null
  try {
    const results = await clientApi.searchClients('Phifer Web Solutions')
    const match = results[0] ?? null
    if (!match) {
      projectModeError.value = 'Could not load Phifer Web Solutions record. Check your connection.'
      return
    }
    workflow.setClient(match)
    workflow.saveClient(match)
    composition.setProjectMode(true)
    composition.setBundle('foundation')
    router.push('/site/type')
  } catch {
    projectModeError.value = 'Failed to load client record. Try again.'
  } finally {
    projectModeLoading.value = false
  }
}
</script>

<template>
  <div class="p-6 lg:p-8 max-w-3xl">
    <!-- Back -->
    <button
      @click="router.push('/site')"
      class="flex items-center gap-1.5 text-sm mb-6 transition-colors"
      :style="{ color: 'var(--theme-text-secondary)' }"
    >
      <ArrowLeft class="w-4 h-4" />
      Back to Site Builder
    </button>

    <div class="mb-8">
      <p class="text-xs font-semibold uppercase tracking-widest mb-1" :style="{ color: 'var(--theme-primary)' }">Step 2a</p>
      <h1 class="text-2xl font-bold" :style="{ color: 'var(--theme-text-primary)' }">Select Bundle</h1>
      <p class="mt-1" :style="{ color: 'var(--theme-text-secondary)' }">
        Choose the service tier for this project.
      </p>
    </div>

    <div class="space-y-4 mb-8">
      <!-- Foundation -->
      <div
        class="p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-sm"
        :style="{ borderColor: 'var(--theme-primary)', backgroundColor: 'var(--theme-primary-light)' }"
        @click="selectFoundation"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-bold text-lg" :style="{ color: 'var(--theme-text-primary)' }">Foundation</span>
              <span
                class="text-xs font-semibold px-2 py-0.5 rounded-full"
                :style="{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
              >Active</span>
            </div>
            <p class="text-sm" :style="{ color: 'var(--theme-text-secondary)' }">
              The core web presence package. Sitemap, legal pages, SEO baseline, schema markup, and build checklist.
            </p>
            <ul class="mt-3 space-y-1">
              <li
                v-for="item in [
                  'Structured sitemap with business-type defaults',
                  'Privacy Policy, Terms & Conditions, Accessibility Statement',
                  'Schema.org JSON-LD block',
                  'Page meta tags per page',
                  'Google Business Profile walkthrough'
                ]"
                :key="item"
                class="flex items-center gap-2 text-sm"
                :style="{ color: 'var(--theme-text-secondary)' }"
              >
                <Check class="w-3.5 h-3.5 shrink-0" :style="{ color: 'var(--theme-primary)' }" />
                {{ item }}
              </li>
            </ul>
          </div>
          <div
            class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 ml-4"
            :style="{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
          >
            <Check class="w-4 h-4" />
          </div>
        </div>
      </div>

      <!-- Project Mode -->
      <div
        class="p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-sm"
        :class="projectModeLoading ? 'opacity-70 cursor-wait' : ''"
        :style="{ borderColor: 'var(--theme-warning)', backgroundColor: 'var(--theme-warning-light)' }"
        @click="!projectModeLoading && selectProjectMode()"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-bold text-lg" :style="{ color: 'var(--theme-text-primary)' }">Project Mode</span>
              <span
                class="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                :style="{ backgroundColor: 'var(--theme-warning)', color: 'var(--theme-text-inverse)' }"
              >
                <FlaskConical class="w-3 h-3" />
                Internal
              </span>
            </div>
            <p class="text-sm" :style="{ color: 'var(--theme-text-secondary)' }">
              Build for Phifer Web Solutions. Loads the internal client record and runs the full Foundation flow with a Project Mode badge.
            </p>
            <p v-if="projectModeError" class="text-xs mt-2 font-medium" :style="{ color: 'var(--theme-danger)' }">
              {{ projectModeError }}
            </p>
          </div>
          <div class="shrink-0 ml-4 mt-1">
            <Loader2 v-if="projectModeLoading" class="w-5 h-5 animate-spin" :style="{ color: 'var(--theme-warning)' }" />
            <ArrowRight v-else class="w-5 h-5" :style="{ color: 'var(--theme-warning)' }" />
          </div>
        </div>
      </div>

      <!-- Enrich -->
      <div
        class="p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-sm"
        :style="{ borderColor: 'var(--theme-secondary)', backgroundColor: 'var(--theme-bg-card)' }"
        @click="selectEnrich"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-bold text-lg" :style="{ color: 'var(--theme-text-primary)' }">Enrich</span>
              <span
                class="text-xs font-semibold px-2 py-0.5 rounded-full"
                :style="{ backgroundColor: 'var(--theme-secondary)', color: 'var(--theme-text-inverse)' }"
              >Active</span>
            </div>
            <p class="text-sm" :style="{ color: 'var(--theme-text-secondary)' }">
              Foundation plus dynamic content — staff/board pages, testimonies, events, blog architecture, and a client-facing dashboard.
            </p>
            <ul class="mt-3 space-y-1">
              <li
                v-for="item in [
                  'Everything in Foundation',
                  'Staff, testimonies, and events pages',
                  'Volunteer + referral form scaffolds',
                  'Client dashboard with content editors'
                ]"
                :key="item"
                class="flex items-center gap-2 text-sm"
                :style="{ color: 'var(--theme-text-secondary)' }"
              >
                <Check class="w-3.5 h-3.5 shrink-0" :style="{ color: 'var(--theme-secondary)' }" />
                {{ item }}
              </li>
            </ul>
          </div>
          <ArrowRight class="w-5 h-5 shrink-0 ml-4 mt-1" :style="{ color: 'var(--theme-secondary)' }" />
        </div>
      </div>

      <!-- Growth -->
      <div
        class="p-5 rounded-xl border-2 cursor-pointer transition-all hover:shadow-sm"
        :style="{ borderColor: 'var(--theme-accent, var(--theme-primary))', backgroundColor: 'var(--theme-bg-card)' }"
        @click="selectGrowth"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-bold text-lg" :style="{ color: 'var(--theme-text-primary)' }">Growth</span>
              <span
                class="text-xs font-semibold px-2 py-0.5 rounded-full"
                :style="{ backgroundColor: 'var(--theme-accent, var(--theme-primary))', color: 'var(--theme-text-inverse)' }"
              >Active</span>
            </div>
            <p class="text-sm" :style="{ color: 'var(--theme-text-secondary)' }">
              Full digital presence: Netlify Functions for forms and donations, Turso DB, AWeber newsletter, scheduled YouTube sync (nonprofit), and Stripe-ready donation flow.
            </p>
            <ul class="mt-3 space-y-1">
              <li
                v-for="item in [
                  'Everything in Enrich',
                  'Netlify functions: contact, forms, event registrations, newsletter, donations',
                  'Turso DB for submissions + registrations + donations',
                  'Donation provider toggle: Harness (Phase 1) → Stripe (Phase 2)',
                  'Nonprofit add-on: Coffee Chat YouTube sync + transparency / 990 reports',
                  'Integrations sub-step in Site Builder for credentials'
                ]"
                :key="item"
                class="flex items-center gap-2 text-sm"
                :style="{ color: 'var(--theme-text-secondary)' }"
              >
                <Check class="w-3.5 h-3.5 shrink-0" :style="{ color: 'var(--theme-accent, var(--theme-primary))' }" />
                {{ item }}
              </li>
            </ul>
          </div>
          <ArrowRight class="w-5 h-5 shrink-0 ml-4 mt-1" :style="{ color: 'var(--theme-accent, var(--theme-primary))' }" />
        </div>
      </div>
    </div>

    <!-- Continue -->
    <div class="flex justify-end">
      <button
        @click="selectFoundation"
        class="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-colors"
        :style="{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
      >
        Continue with Foundation
        <ArrowRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
