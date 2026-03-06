<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, TriangleAlert, ExternalLink, FlaskConical } from 'lucide-vue-next'
import { useCompositionStore } from '../stores/composition'
import { useWorkflowStore } from '../stores/workflow'
import { buildLegalTemplates } from '../data/siteBuilderData'

const router = useRouter()
const composition = useCompositionStore()
const workflow = useWorkflowStore()

type LegalTab = 'privacyPolicy' | 'termsConditions' | 'accessibilityStatement' | 'cookiePolicy'

const activeTab = ref<LegalTab>('privacyPolicy')

const TABS: { id: LegalTab; label: string }[] = [
  { id: 'privacyPolicy', label: 'Privacy Policy' },
  { id: 'termsConditions', label: 'Terms & Conditions' },
  { id: 'accessibilityStatement', label: 'Accessibility Statement' },
  { id: 'cookiePolicy', label: 'Cookie Policy' }
]

const content = ref({
  privacyPolicy: '',
  termsConditions: '',
  accessibilityStatement: '',
  cookiePolicy: ''
})

onMounted(() => {
  const client = workflow.clientInfo
  const businessType = composition.siteBuilder.businessType ?? 'local_service'
  const existing = composition.siteBuilder.legalContent

  // Use saved content if available, otherwise generate from templates
  const templates = buildLegalTemplates(
    client?.name ?? 'Your Business',
    client?.contactEmail ?? 'contact@example.com',
    client?.domain ?? 'example.com',
    new Date().getFullYear(),
    businessType
  )

  content.value = {
    privacyPolicy: existing.privacyPolicy ?? templates.privacyPolicy,
    termsConditions: existing.termsConditions ?? templates.termsConditions,
    accessibilityStatement: existing.accessibilityStatement ?? templates.accessibilityStatement,
    cookiePolicy: existing.cookiePolicy ?? templates.cookiePolicy
  }
})

function regenerate() {
  const client = workflow.clientInfo
  const businessType = composition.siteBuilder.businessType ?? 'local_service'
  const templates = buildLegalTemplates(
    client?.name ?? 'Your Business',
    client?.contactEmail ?? 'contact@example.com',
    client?.domain ?? 'example.com',
    new Date().getFullYear(),
    businessType
  )
  content.value[activeTab.value] = templates[activeTab.value]
}

function save() {
  composition.setLegalContent({ ...content.value })
  router.push('/site/sitemap')
}

const wordCount = computed(() => {
  const text = content.value[activeTab.value]
  return text.trim() ? text.trim().split(/\s+/).length : 0
})
</script>

<template>
  <div class="p-6 lg:p-8 max-w-4xl">
    <!-- Back -->
    <button
      @click="router.push('/site/type')"
      class="flex items-center gap-1.5 text-sm mb-6 transition-colors"
      :style="{ color: 'var(--theme-text-secondary)' }"
    >
      <ArrowLeft class="w-4 h-4" />
      Back to Business Type
    </button>

    <div class="mb-6">
      <div class="flex items-center gap-2 mb-1">
        <p class="text-xs font-semibold uppercase tracking-widest" :style="{ color: 'var(--theme-primary)' }">Step 2c</p>
        <span
          v-if="composition.siteBuilder.projectMode"
          class="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
          :style="{ backgroundColor: 'var(--theme-warning)', color: 'var(--theme-text-inverse)' }"
        >
          <FlaskConical class="w-3 h-3" />
          Project Mode
        </span>
      </div>
      <h1 class="text-2xl font-bold" :style="{ color: 'var(--theme-text-primary)' }">Legal Pages</h1>
      <p class="mt-1" :style="{ color: 'var(--theme-text-secondary)' }">
        Review and edit the four legal page templates. Content is auto-filled from client info and business type.
      </p>
    </div>

    <!-- Attorney warning -->
    <div
      class="flex items-start gap-3 p-4 rounded-xl mb-6 border"
      :style="{ backgroundColor: 'var(--theme-warning-light)', borderColor: 'var(--theme-warning)' }"
    >
      <TriangleAlert class="w-5 h-5 shrink-0 mt-0.5" :style="{ color: 'var(--theme-warning)' }" />
      <p class="text-sm" :style="{ color: 'var(--theme-text-primary)' }">
        <strong>These templates are provided as a starting point only.</strong>
        Recommend client review with a licensed attorney before publishing.
      </p>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 mb-4 p-1 rounded-xl" :style="{ backgroundColor: 'var(--theme-bg-secondary)' }">
      <button
        v-for="tab in TABS"
        :key="tab.id"
        @click="activeTab = tab.id"
        class="flex-1 text-xs font-medium py-2 px-3 rounded-lg transition-all"
        :style="activeTab === tab.id
          ? { backgroundColor: 'var(--theme-bg-card)', color: 'var(--theme-primary)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
          : { color: 'var(--theme-text-secondary)' }"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Editor -->
    <div
      class="rounded-xl border overflow-hidden mb-6"
      :style="{ borderColor: 'var(--theme-border)' }"
    >
      <!-- Toolbar -->
      <div
        class="flex items-center justify-between px-4 py-2.5 border-b"
        :style="{ backgroundColor: 'var(--theme-bg-tertiary)', borderColor: 'var(--theme-border)' }"
      >
        <span class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">{{ wordCount }} words</span>
        <button
          @click="regenerate"
          class="text-xs px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5"
          :style="{ color: 'var(--theme-text-secondary)', backgroundColor: 'var(--theme-bg-secondary)' }"
        >
          <ExternalLink class="w-3 h-3" />
          Reset to Template
        </button>
      </div>
      <textarea
        v-model="content[activeTab]"
        rows="24"
        class="w-full px-4 py-3 text-sm font-mono resize-y focus:outline-none"
        :style="{
          backgroundColor: 'var(--theme-bg-card)',
          color: 'var(--theme-text-primary)',
          borderColor: 'transparent'
        }"
        :placeholder="`${TABS.find(t => t.id === activeTab)?.label} content...`"
      />
    </div>

    <!-- Actions -->
    <div class="flex justify-between">
      <button
        @click="router.push('/site/type')"
        class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-colors"
        :style="{ color: 'var(--theme-text-secondary)', backgroundColor: 'var(--theme-bg-secondary)' }"
      >
        <ArrowLeft class="w-4 h-4" />
        Back
      </button>
      <button
        @click="save"
        class="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-colors"
        :style="{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
      >
        Continue to Sitemap
        <ArrowRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
