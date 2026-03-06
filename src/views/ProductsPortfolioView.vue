<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Globe, Database, LayoutDashboard, ExternalLink, Trash2, FolderOpen, Download, ListChecks, RefreshCw } from 'lucide-vue-next'
import { useWorkflowStore } from '../stores/workflow'
import { useCompositionStore } from '../stores/composition'
import type { PortfolioStatus } from '../types/registry'

const workflow    = useWorkflowStore()
const composition = useCompositionStore()
const router      = useRouter()

const TOTAL_FINALIZE_ITEMS = 46

function finalizeCount(entry: typeof workflow.savedPortfolio[0]): number {
  return Object.values(entry.finalizeProgress ?? {}).filter(Boolean).length
}

const confirmingDelete = ref<string | null>(null)

const STATUS_CYCLE: PortfolioStatus[] = ['building', 'active', 'maintenance']

const STATUS_STYLES: Record<PortfolioStatus, { bg: string; text: string; label: string }> = {
  building:    { bg: 'var(--theme-warning-light)',  text: 'var(--theme-warning)',  label: 'Building' },
  active:      { bg: 'var(--theme-success-light)',  text: 'var(--theme-success)',  label: 'Active' },
  maintenance: { bg: 'var(--theme-bg-tertiary)',    text: 'var(--theme-text-muted)', label: 'Maintenance' }
}

function cycleStatus(id: string, current: PortfolioStatus) {
  const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(current) + 1) % STATUS_CYCLE.length]!
  workflow.updatePortfolioStatus(id, next)
}

function handleDelete(id: string) {
  if (confirmingDelete.value === id) {
    workflow.removePortfolioEntry(id)
    confirmingDelete.value = null
  } else {
    confirmingDelete.value = id
    setTimeout(() => { confirmingDelete.value = null }, 3000)
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

function reopenProject(entry: typeof workflow.savedPortfolio[0]) {
  if (!entry.buildConfigJson) return
  try {
    const config = JSON.parse(entry.buildConfigJson)
    // Restore client info into workflow store
    if (config.client) workflow.setClient(config.client)
    // Restore all composition state; get back the restored page IDs for the snapshot
    const pageIds = composition.loadFromBuildConfig(config)
    // Enter extend mode — marks all steps complete, records the snapshot
    workflow.enterExtendMode(entry.id, pageIds)
    // Navigate to sitemap — the primary additive step
    router.push('/site/sitemap')
  } catch {
    // Malformed JSON — silently ignore (button shouldn't show without valid JSON)
  }
}

function reexportConfig(entry: typeof workflow.savedPortfolio[0]) {
  if (!entry.buildConfigJson) return
  const blob = new Blob([entry.buildConfigJson], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const slug = entry.domain.replace(/\.com$/, '')
  a.href = url
  a.download = `${slug}-build-config.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="p-6 lg:p-8 max-w-6xl">
    <div class="mb-8">
      <h1 class="text-2xl font-bold" :style="{ color: 'var(--theme-text-primary)' }">Project Portfolio</h1>
      <p class="mt-1" :style="{ color: 'var(--theme-text-secondary)' }">
        Delivered client projects with links to their live site, studio, and dashboard.
      </p>
    </div>

    <!-- Empty state -->
    <div
      v-if="workflow.savedPortfolio.length === 0"
      class="p-12 rounded-xl border text-center"
      :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
    >
      <div
        class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
        :style="{ backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }"
      >
        <FolderOpen class="w-8 h-8" />
      </div>
      <h2 class="text-xl font-semibold mb-2" :style="{ color: 'var(--theme-text-primary)' }">No projects yet</h2>
      <p class="mb-4" :style="{ color: 'var(--theme-text-secondary)' }">
        Complete a project through the workflow to add it here.
      </p>
      <div class="flex justify-center gap-6">
        <div class="flex items-center gap-2 text-sm" :style="{ color: 'var(--theme-text-muted)' }">
          <Globe class="w-4 h-4" /> Site
        </div>
        <div class="flex items-center gap-2 text-sm" :style="{ color: 'var(--theme-text-muted)' }">
          <Database class="w-4 h-4" /> Studio
        </div>
        <div class="flex items-center gap-2 text-sm" :style="{ color: 'var(--theme-text-muted)' }">
          <LayoutDashboard class="w-4 h-4" /> Dashboard
        </div>
      </div>
    </div>

    <!-- Project cards -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div
        v-for="entry in workflow.savedPortfolio"
        :key="entry.id"
        class="rounded-xl border flex flex-col overflow-hidden"
        :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
      >
        <!-- Card header -->
        <div class="p-5 border-b flex items-center gap-3" :style="{ borderColor: 'var(--theme-border)' }">
          <!-- Logo or initial -->
          <div
            class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 overflow-hidden"
            :style="{ backgroundColor: 'var(--theme-bg-tertiary)' }"
          >
            <img
              v-if="entry.logoUrl"
              :src="entry.logoUrl"
              :alt="entry.clientName"
              class="w-full h-full object-contain p-1"
            />
            <span
              v-else
              class="text-lg font-bold"
              :style="{ color: 'var(--theme-primary)' }"
            >{{ entry.clientName.charAt(0).toUpperCase() }}</span>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold truncate" :style="{ color: 'var(--theme-text-primary)' }">{{ entry.clientName }}</h3>
            <p
              v-if="entry.projectName !== entry.clientName"
              class="text-xs truncate"
              :style="{ color: 'var(--theme-text-muted)' }"
            >{{ entry.projectName }}</p>
          </div>
          <!-- Status badge (clickable to cycle) -->
          <button
            @click="cycleStatus(entry.id, entry.status)"
            class="text-xs px-2.5 py-1 rounded-full font-medium transition-opacity hover:opacity-75 shrink-0"
            :style="{
              backgroundColor: STATUS_STYLES[entry.status].bg,
              color: STATUS_STYLES[entry.status].text
            }"
            :title="`Status: ${STATUS_STYLES[entry.status].label} — click to change`"
          >{{ STATUS_STYLES[entry.status].label }}</button>
        </div>

        <!-- Links -->
        <div class="p-4 space-y-1.5 flex-1">
          <a
            :href="entry.siteUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors hover:bg-(--theme-bg-hover)"
            :style="{ color: 'var(--theme-text-secondary)' }"
          >
            <Globe class="w-4 h-4 shrink-0" :style="{ color: 'var(--theme-primary)' }" />
            <span class="flex-1 truncate font-mono text-xs">{{ entry.siteUrl }}</span>
            <ExternalLink class="w-3 h-3 shrink-0 opacity-50" />
          </a>
          <a
            :href="entry.studioUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors hover:bg-(--theme-bg-hover)"
            :style="{ color: 'var(--theme-text-secondary)' }"
          >
            <Database class="w-4 h-4 shrink-0" :style="{ color: 'var(--theme-primary)' }" />
            <span class="flex-1 truncate font-mono text-xs">{{ entry.studioUrl }}</span>
            <ExternalLink class="w-3 h-3 shrink-0 opacity-50" />
          </a>
          <a
            :href="entry.dashboardUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors hover:bg-(--theme-bg-hover)"
            :style="{ color: 'var(--theme-text-secondary)' }"
          >
            <LayoutDashboard class="w-4 h-4 shrink-0" :style="{ color: 'var(--theme-primary)' }" />
            <span class="flex-1 truncate font-mono text-xs">{{ entry.dashboardUrl }}</span>
            <ExternalLink class="w-3 h-3 shrink-0 opacity-50" />
          </a>
        </div>

        <!-- Card footer -->
        <div
          class="px-4 py-3 border-t flex items-center gap-2"
          :style="{ borderColor: 'var(--theme-border)' }"
        >
          <span class="text-xs flex-1" :style="{ color: 'var(--theme-text-muted)' }">
            {{ formatDate(entry.completedAt) }}
          </span>
          <!-- Finalize progress -->
          <button
            @click="router.push(`/finalize?entryId=${entry.id}`)"
            class="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-colors hover:bg-(--theme-bg-hover)"
            :style="{
              color: finalizeCount(entry) === TOTAL_FINALIZE_ITEMS
                ? 'var(--theme-success)'
                : 'var(--theme-text-secondary)'
            }"
            :title="`Deployment checklist: ${finalizeCount(entry)}/${TOTAL_FINALIZE_ITEMS} complete`"
          >
            <ListChecks class="w-3.5 h-3.5" />
            {{ finalizeCount(entry) === 0 ? 'Deploy' : `${finalizeCount(entry)}/${TOTAL_FINALIZE_ITEMS}` }}
          </button>
          <button
            v-if="entry.buildConfigJson"
            @click="reexportConfig(entry)"
            class="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-colors hover:bg-(--theme-bg-hover)"
            :style="{ color: 'var(--theme-text-secondary)' }"
            title="Re-download build config JSON"
          >
            <Download class="w-3.5 h-3.5" />
            Export
          </button>
          <button
            v-if="entry.buildConfigJson"
            @click="reopenProject(entry)"
            class="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-colors hover:bg-(--theme-bg-hover)"
            :style="{ color: 'var(--theme-primary)' }"
            title="Re-open project in extend mode to add new pages or dashboard items"
          >
            <RefreshCw class="w-3.5 h-3.5" />
            Re-open
          </button>
          <button
            @click="handleDelete(entry.id)"
            class="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg transition-colors"
            :style="{
              color: confirmingDelete === entry.id ? 'var(--theme-danger)' : 'var(--theme-text-muted)',
              backgroundColor: confirmingDelete === entry.id ? 'var(--theme-danger-light)' : 'transparent'
            }"
            :title="confirmingDelete === entry.id ? 'Click again to confirm deletion' : 'Delete project'"
          >
            <Trash2 class="w-3.5 h-3.5" />
            {{ confirmingDelete === entry.id ? 'Confirm?' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
