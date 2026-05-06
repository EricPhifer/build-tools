<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  Check, ArrowRight, Package, Building2, Map, BookLock,
  ClipboardCheck, ChevronRight, Monitor, Database,
  PanelTop, PanelBottom, LayoutTemplate
} from 'lucide-vue-next'
import { useCompositionStore } from '../stores/composition'
import { useWorkflowStore } from '../stores/workflow'
import { BUSINESS_TYPES } from '../data/siteBuilderData'
import { isAppProjectType } from '../types/registry'
import WorkflowProgress from '../components/WorkflowProgress.vue'

const router = useRouter()
const composition = useCompositionStore()
const workflow = useWorkflowStore()

workflow.goToStep('site')

type FlowStep = {
  id: string
  label: string
  description: string
  route: string
  icon: object
  done: boolean
}

const isAppMode = computed(() => isAppProjectType(composition.siteBuilder.businessType))

const flowSteps = computed<FlowStep[]>(() => {
  const sb = composition.siteBuilder
  const businessTypeLabel = sb.businessType
    ? BUSINESS_TYPES.find(t => t.id === sb.businessType)?.label ?? sb.businessType
    : null
  const isApp = isAppMode.value

  const bundleStep: FlowStep = {
    id: 'bundle',
    label: 'Bundle',
    description: sb.bundle ? 'Foundation selected' : 'Select service tier',
    route: '/site/bundle',
    icon: Package,
    done: !!sb.bundle
  }

  const typeStep: FlowStep = {
    id: 'type',
    label: isApp || sb.projectMode ? 'Project Type' : 'Business Type',
    description: businessTypeLabel ?? 'Select business category',
    route: '/site/type',
    icon: Building2,
    done: !!sb.businessType
  }

  const WEBSITE_KEYS = ['schema', 'pageMeta', 'navStructure', 'components', 'sanitySchema', 'legalPages', 'envExample']
  const APP_KEYS = ['routerConfig', 'piniaStore', 'sanitySchema', 'componentManifest', 'envExample']
  const checklistKeys = isApp ? APP_KEYS : WEBSITE_KEYS
  const checklistConf = isApp ? sb.checklistConfirmedApp : sb.checklistConfirmedWebsite
  const checklistDone = checklistKeys.every(k => !!checklistConf[k])

  const checklistStep: FlowStep = {
    id: 'checklist',
    label: 'Generated Outputs',
    description: checklistDone ? 'All outputs confirmed' : 'Review and confirm assembled deliverables',
    route: '/site/checklist',
    icon: ClipboardCheck,
    done: checklistDone
  }

  if (isApp) {
    return [
      bundleStep,
      typeStep,
      {
        id: 'app-screens',
        label: 'App Screens',
        description: sb.appScreens.length > 0 ? `${sb.appScreens.length} screens defined` : 'Define views and routes',
        route: '/site/app-screens',
        icon: Monitor,
        done: sb.appScreens.length > 0
      },
      {
        id: 'data-model',
        label: 'Data Model',
        description: sb.dataModel.length > 0 ? `${sb.dataModel.length} entities defined` : 'Define data structure',
        route: '/site/data-model',
        icon: Database,
        done: sb.dataModel.length > 0
      },
      checklistStep
    ]
  }

  const steps: FlowStep[] = [
    bundleStep,
    typeStep,
    {
      id: 'legal',
      label: 'Legal Pages',
      description: sb.legalContent.privacyPolicy ? 'Templates reviewed' : 'Review legal templates',
      route: '/site/legal',
      icon: BookLock,
      done: !!sb.legalContent.privacyPolicy
    },
    {
      id: 'sitemap',
      label: 'Sitemap',
      description: sb.sitemapPages.length > 0 ? `${sb.sitemapPages.length} pages defined` : 'Build page structure',
      route: '/site/sitemap',
      icon: Map,
      done: sb.sitemapPages.length > 0
    }
  ]

  // Growth-only step: Integrations
  if (sb.bundle === 'growth') {
    const integrationsDone = !!(sb.envConfig.resendApiKey || sb.envConfig.tursoDatabaseUrl || sb.envConfig.aweberClientId)
    steps.push({
      id: 'integrations',
      label: 'Integrations',
      description: integrationsDone ? 'Integration credentials saved' : 'Configure third-party services',
      route: '/site/integrations',
      icon: Database,
      done: integrationsDone
    })
  }

  steps.push(checklistStep)
  return steps
})

// First incomplete step to resume from
const nextStepRoute = computed(() => {
  const next = flowSteps.value.find(s => !s.done)
  return next?.route ?? '/site/bundle'
})

const completedCount = computed(() => flowSteps.value.filter(s => s.done).length)

// Global site-wide components
const globalDesign = computed(() => {
  const templateDone = !!composition.composition.defaultTemplate || composition.composition.selectedBlocks.length > 0
  return [
    {
      name: 'Header',
      path: '/site/header',
      done: !!composition.composition.header,
      icon: PanelTop,
      description: composition.composition.header ? 'Variant selected' : 'Choose a header style'
    },
    {
      name: 'Footer',
      path: '/site/footer',
      done: !!composition.composition.footer,
      icon: PanelBottom,
      description: composition.composition.footer ? 'Variant selected' : 'Choose a footer style'
    },
    {
      name: 'Page Template',
      path: '/site/main',
      done: templateDone,
      icon: LayoutTemplate,
      description: templateDone ? 'Layout configured' : 'Choose a page layout'
    }
  ]
})

const globalDoneCount = computed(() => globalDesign.value.filter(s => s.done).length)
</script>

<template>
  <div class="p-6 lg:p-8 max-w-3xl">
    <WorkflowProgress />

    <div class="mb-8">
      <h1 class="text-2xl font-bold" :style="{ color: 'var(--theme-text-primary)' }">Site Builder</h1>
      <p class="mt-1" :style="{ color: 'var(--theme-text-secondary)' }">
        {{ isAppMode ? 'Plan the app structure for' : 'Build out the Foundation package for' }}
        <strong>{{ workflow.clientInfo?.name ?? 'this project' }}</strong>.
      </p>
    </div>

    <!-- ── Global Layout (shown first for website mode) ─────────────────────── -->
    <div v-if="!isAppMode" class="mb-8">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-semibold" :style="{ color: 'var(--theme-text-secondary)' }">Global Layout</h2>
        <span class="text-xs font-medium" :style="{ color: 'var(--theme-text-muted)' }">
          {{ globalDoneCount }}/{{ globalDesign.length }} configured
        </span>
      </div>

      <div class="grid grid-cols-3 gap-3">
        <button
          v-for="section in globalDesign"
          :key="section.path"
          @click="router.push(section.path)"
          class="flex flex-col gap-3 p-4 rounded-xl border text-left transition-all hover:shadow-sm"
          :style="{
            backgroundColor: 'var(--theme-bg-card)',
            borderColor: section.done ? 'var(--theme-success)' : 'var(--theme-border)'
          }"
        >
          <!-- Icon row -->
          <div class="flex items-start justify-between">
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              :style="{ backgroundColor: 'var(--theme-primary-light)', color: 'var(--theme-primary)' }"
            >
              <component :is="section.icon" class="w-4 h-4" />
            </div>
            <div
              v-if="section.done"
              class="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              :style="{ backgroundColor: 'var(--theme-success)', color: 'var(--theme-text-inverse)' }"
            >
              <Check class="w-3 h-3" />
            </div>
          </div>

          <!-- Label + status -->
          <div>
            <p class="font-semibold text-sm" :style="{ color: 'var(--theme-text-primary)' }">{{ section.name }}</p>
            <p class="text-xs mt-0.5" :style="{ color: section.done ? 'var(--theme-success)' : 'var(--theme-text-muted)' }">
              {{ section.description }}
            </p>
          </div>

          <!-- Configure link -->
          <div
            class="flex items-center gap-0.5 text-xs mt-auto"
            :style="{ color: 'var(--theme-text-muted)' }"
          >
            {{ section.done ? 'Change' : 'Configure' }}
            <ChevronRight class="w-3 h-3" />
          </div>
        </button>
      </div>
    </div>

    <!-- Divider -->
    <div
      v-if="!isAppMode"
      class="border-t mb-8"
      :style="{ borderColor: 'var(--theme-border)' }"
    />

    <!-- ── Content Setup ──────────────────────────────────────────────────────── -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-semibold" :style="{ color: 'var(--theme-text-secondary)' }">Content Setup</h2>
        <span class="text-xs font-medium" :style="{ color: 'var(--theme-text-muted)' }">
          {{ completedCount }}/{{ flowSteps.length }} complete
        </span>
      </div>

      <div class="space-y-2">
        <button
          v-for="(step, index) in flowSteps"
          :key="step.id"
          @click="router.push(step.route)"
          class="w-full flex items-center gap-4 px-4 py-4 rounded-xl border text-left transition-all hover:shadow-sm"
          :style="{
            backgroundColor: 'var(--theme-bg-card)',
            borderColor: step.done ? 'var(--theme-success)' : 'var(--theme-border)'
          }"
        >
          <!-- Step number / check -->
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
            :style="step.done
              ? { backgroundColor: 'var(--theme-success)', color: 'var(--theme-text-inverse)' }
              : { backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }"
          >
            <Check v-if="step.done" class="w-4 h-4" />
            <span v-else>{{ index + 1 }}</span>
          </div>

          <!-- Icon -->
          <div
            class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            :style="{ backgroundColor: 'var(--theme-primary-light)', color: 'var(--theme-primary)' }"
          >
            <component :is="step.icon" class="w-5 h-5" />
          </div>

          <!-- Text -->
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-sm" :style="{ color: 'var(--theme-text-primary)' }">{{ step.label }}</p>
            <p class="text-xs truncate" :style="{ color: step.done ? 'var(--theme-success)' : 'var(--theme-text-muted)' }">
              {{ step.description }}
            </p>
          </div>

          <ChevronRight class="w-4 h-4 shrink-0" :style="{ color: 'var(--theme-text-muted)' }" />
        </button>
      </div>
    </div>

    <!-- Progress summary + continue button -->
    <div
      class="p-4 rounded-xl border mb-6"
      :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
    >
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium" :style="{ color: 'var(--theme-text-secondary)' }">Setup Progress</span>
        <span class="text-sm font-bold" :style="{ color: 'var(--theme-primary)' }">{{ completedCount }}/{{ flowSteps.length }} steps</span>
      </div>
      <div class="h-2 rounded-full overflow-hidden" :style="{ backgroundColor: 'var(--theme-bg-tertiary)' }">
        <div
          class="h-full rounded-full transition-all duration-500"
          :style="{ width: `${(completedCount / flowSteps.length) * 100}%`, backgroundColor: 'var(--theme-primary)' }"
        />
      </div>
    </div>

    <!-- Continue button -->
    <div class="flex justify-end">
      <button
        @click="router.push(nextStepRoute)"
        class="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-colors"
        :style="{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
      >
        {{ completedCount === 0 ? 'Start Site Setup' : completedCount === flowSteps.length ? 'Review Setup' : 'Continue Setup' }}
        <ArrowRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
