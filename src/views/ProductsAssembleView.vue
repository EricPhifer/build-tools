<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCompositionStore } from '../stores/composition'
import { useWorkflowStore } from '../stores/workflow'
import { PanelTop, PanelBottom, LayoutTemplate, Database, LayoutDashboard, ArrowRight, Check, ExternalLink, FileText } from 'lucide-vue-next'
import WorkflowProgress from '../components/WorkflowProgress.vue'

const router = useRouter()
const composition = useCompositionStore()
const workflow = useWorkflowStore()

function handleContinue() {
  workflow.completeStep('assemble')
  workflow.goToStep('dashboard')
  router.push('/dashboards')
}

workflow.goToStep('assemble')

// Sync project name with composition store
watch(() => composition.composition.name, () => {}, { immediate: true })

const domainSlug = computed(() =>
  composition.composition.name
    ? composition.composition.name.toLowerCase().replace(/\s+/g, '')
    : 'clientname'
)

const pageCount = computed(() => composition.siteBuilder.sitemapPages.length)

const siteSelections = computed(() => [
  {
    label: 'Header',
    icon: PanelTop,
    selected: composition.selectedHeaderVariant?.name ?? null,
    link: '/site/header'
  },
  {
    label: 'Footer',
    icon: PanelBottom,
    selected: composition.selectedFooterVariant?.name ?? null,
    link: '/site/footer'
  },
  {
    label: 'Template',
    icon: LayoutTemplate,
    selected: composition.selectedTemplate?.name ?? null,
    link: '/site/main'
  },
  {
    label: 'Pages',
    icon: FileText,
    selected: pageCount.value > 0 ? `${pageCount.value} page${pageCount.value === 1 ? '' : 's'} configured` : null,
    link: '/site/sitemap'
  }
])

const schemaCount = computed(() => composition.mergedSchemaRequirements.length)
const fieldCount = computed(() =>
  composition.mergedSchemaRequirements.reduce((sum, s) => sum + s.fields.length, 0)
)
</script>

<template>
  <div class="p-6 lg:p-8 max-w-6xl">
    <WorkflowProgress />

    <div class="mb-8">
      <h1 class="text-2xl font-bold" :style="{ color: 'var(--theme-text-primary)' }">Assemble Project</h1>
      <p class="mt-1" :style="{ color: 'var(--theme-text-secondary)' }">
        Compose a new client project from your site, CMS, and dashboard selections.
      </p>
    </div>

    <!-- Project Name -->
    <div
      class="p-6 rounded-xl border mb-6"
      :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
    >
      <label class="block text-sm font-medium mb-2" :style="{ color: 'var(--theme-text-secondary)' }">Project Name</label>
      <input
        :value="composition.composition.name"
        @input="composition.setProjectName(($event.target as HTMLInputElement).value)"
        type="text"
        placeholder="e.g., Phifer Web Solutions"
        class="w-full px-4 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2"
        :style="{
          backgroundColor: 'var(--theme-bg-secondary)',
          borderColor: 'var(--theme-border)',
          color: 'var(--theme-text-primary)',
          '--tw-ring-color': 'var(--theme-primary)'
        }"
      />
      <p class="mt-2 text-xs" :style="{ color: 'var(--theme-text-muted)' }">
        This will generate: {{ domainSlug }}.com,
        dashboard.{{ domainSlug }}.com,
        studio.{{ domainSlug }}.com
      </p>
    </div>

    <!-- Assembly Steps -->
    <div class="space-y-4">
      <!-- Step 1: Site -->
      <div
        class="p-6 rounded-xl border"
        :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
      >
        <div class="flex items-center gap-4 mb-4">
          <div class="flex items-center gap-3 flex-1">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              :style="{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
            >1</div>
            <div>
              <h3 class="font-semibold" :style="{ color: 'var(--theme-text-primary)' }">Site</h3>
              <p class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">Select header, footer, and page template for the client website.</p>
            </div>
          </div>
          <LayoutTemplate class="w-6 h-6" :style="{ color: 'var(--theme-text-muted)' }" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 ml-11">
          <button
            v-for="sel in siteSelections"
            :key="sel.label"
            @click="router.push(sel.link)"
            class="px-4 py-3 rounded-lg border text-center transition-colors"
            :class="sel.selected ? 'border-solid' : 'border-dashed'"
            :style="{
              borderColor: sel.selected ? 'var(--theme-primary)' : 'var(--theme-border)',
              color: sel.selected ? 'var(--theme-text-primary)' : 'var(--theme-text-muted)',
              backgroundColor: sel.selected ? 'var(--theme-primary-light)' : 'transparent'
            }"
          >
            <component :is="sel.icon" class="w-5 h-5 mx-auto mb-1" />
            <span class="text-xs font-medium block">{{ sel.label }}</span>
            <p class="text-xs mt-0.5 flex items-center justify-center gap-1">
              <template v-if="sel.selected">
                <Check class="w-3 h-3 inline" :style="{ color: 'var(--theme-primary)' }" />
                {{ sel.selected }}
              </template>
              <template v-else>
                Not selected
                <ExternalLink class="w-3 h-3 inline" />
              </template>
            </p>
          </button>
        </div>
      </div>

      <!-- Step 2: CMS -->
      <div
        class="p-6 rounded-xl border"
        :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
      >
        <div class="flex items-center gap-4 mb-4">
          <div class="flex items-center gap-3 flex-1">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              :style="{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
            >2</div>
            <div>
              <h3 class="font-semibold" :style="{ color: 'var(--theme-text-primary)' }">CMS</h3>
              <p class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">Sanity studio schemas derived from your site selections.</p>
            </div>
          </div>
          <Database class="w-6 h-6" :style="{ color: 'var(--theme-text-muted)' }" />
        </div>

        <div class="ml-11">
          <div
            v-if="schemaCount > 0"
            class="px-4 py-3 rounded-lg border border-solid flex items-center justify-between cursor-pointer transition-colors hover:bg-[var(--theme-bg-hover)]"
            :style="{ borderColor: 'var(--theme-primary)', backgroundColor: 'var(--theme-primary-light)' }"
            @click="router.push('/cms')"
          >
            <div class="flex items-center gap-3">
              <FileText class="w-5 h-5" :style="{ color: 'var(--theme-primary)' }" />
              <div>
                <span class="text-sm font-medium" :style="{ color: 'var(--theme-text-primary)' }">
                  {{ schemaCount }} document {{ schemaCount === 1 ? 'type' : 'types' }}, {{ fieldCount }} fields
                </span>
                <p class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">Auto-generated from site selections</p>
              </div>
            </div>
            <ExternalLink class="w-4 h-4" :style="{ color: 'var(--theme-text-muted)' }" />
          </div>
          <div
            v-else
            class="px-4 py-3 rounded-lg border border-dashed text-sm text-center"
            :style="{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-muted)' }"
          >
            Select site components to generate schemas
          </div>
        </div>
      </div>

      <!-- Step 3: Dashboard -->
      <div
        class="p-6 rounded-xl border"
        :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
      >
        <div class="flex items-center gap-4 mb-4">
          <div class="flex items-center gap-3 flex-1">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              :style="{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
            >3</div>
            <div>
              <h3 class="font-semibold" :style="{ color: 'var(--theme-text-primary)' }">Dashboard</h3>
              <p class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">Set up the client-facing dashboard with relevant data and tools.</p>
            </div>
          </div>
          <LayoutDashboard class="w-6 h-6" :style="{ color: 'var(--theme-text-muted)' }" />
        </div>

        <div class="ml-11">
          <div
            class="px-4 py-3 rounded-lg border border-dashed text-sm text-center"
            :style="{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-muted)' }"
          >
            Coming soon — will be informed by site and CMS selections
          </div>
        </div>
      </div>
    </div>

    <!-- Continue Button -->
    <div class="mt-8 flex justify-end">
      <button
        :disabled="!composition.isComplete"
        @click="handleContinue"
        class="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        :style="{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
      >
        Continue to Dashboard
        <ArrowRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
