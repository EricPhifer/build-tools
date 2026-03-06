<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, FolderOpen, Clock, CheckCircle2, PauseCircle, Lightbulb } from 'lucide-vue-next'
import { useProjectsStore } from '../stores/projects'
import type { ProjectStatus, ProjectType } from '../types/registry'

const router = useRouter()
const store = useProjectsStore()

const TYPE_LABELS: Record<ProjectType, string> = {
  personal_website: 'Personal Website',
  dashboard: 'Dashboard',
  database_catalog: 'Database / Catalog',
  custom_tool: 'Custom Tool',
  other: 'Other'
}

const STATUS_CONFIG: Record<ProjectStatus, { label: string; icon: object; color: string; bg: string }> = {
  planning: { label: 'Planning', icon: Lightbulb, color: 'var(--theme-text-muted)', bg: 'var(--theme-bg-tertiary)' },
  in_progress: { label: 'In Progress', icon: Clock, color: 'var(--theme-warning)', bg: 'var(--theme-warning-light)' },
  on_hold: { label: 'On Hold', icon: PauseCircle, color: 'var(--theme-text-muted)', bg: 'var(--theme-bg-tertiary)' },
  complete: { label: 'Complete', icon: CheckCircle2, color: 'var(--theme-success)', bg: 'var(--theme-success-light)' }
}

const filterStatus = ref<ProjectStatus | 'all'>('all')

const filtered = computed(() => {
  if (filterStatus.value === 'all') return store.projects
  return store.projects.filter(p => p.status === filterStatus.value)
})

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div class="p-6 lg:p-8 max-w-5xl">
    <!-- Header -->
    <div class="flex items-start justify-between mb-8">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span
            class="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
            :style="{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
          >Project Mode</span>
        </div>
        <h1 class="text-2xl font-bold" :style="{ color: 'var(--theme-text-primary)' }">My Projects</h1>
        <p class="mt-1" :style="{ color: 'var(--theme-text-secondary)' }">
          Personal and custom builds outside of client workflow.
        </p>
      </div>
      <button
        @click="router.push('/projects/new')"
        class="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors"
        :style="{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
      >
        <Plus class="w-4 h-4" />
        New Project
      </button>
    </div>

    <!-- Filter -->
    <div class="flex gap-2 mb-6 flex-wrap">
      <button
        v-for="opt in ([
          { value: 'all', label: 'All' },
          { value: 'planning', label: 'Planning' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'on_hold', label: 'On Hold' },
          { value: 'complete', label: 'Complete' }
        ] as const)"
        :key="opt.value"
        @click="filterStatus = opt.value"
        class="text-xs px-3 py-1.5 rounded-full font-medium transition-colors"
        :style="filterStatus === opt.value
          ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }
          : { backgroundColor: 'var(--theme-bg-secondary)', color: 'var(--theme-text-secondary)' }"
      >
        {{ opt.label }}
      </button>
    </div>

    <!-- Project grid -->
    <div v-if="filtered.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <button
        v-for="project in filtered"
        :key="project.id"
        @click="router.push(`/projects/${project.id}`)"
        class="p-5 rounded-xl border text-left transition-all hover:shadow-md hover:-translate-y-0.5 group"
        :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
      >
        <div class="flex items-start justify-between mb-3">
          <div
            class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            :style="{ backgroundColor: 'var(--theme-primary-light)', color: 'var(--theme-primary)' }"
          >
            <FolderOpen class="w-5 h-5" />
          </div>
          <span
            class="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
            :style="{ backgroundColor: STATUS_CONFIG[project.status].bg, color: STATUS_CONFIG[project.status].color }"
          >
            <component :is="STATUS_CONFIG[project.status].icon" class="w-3 h-3" />
            {{ STATUS_CONFIG[project.status].label }}
          </span>
        </div>

        <h3 class="font-semibold mb-1 text-left" :style="{ color: 'var(--theme-text-primary)' }">{{ project.name }}</h3>
        <p
          class="text-xs mb-3 line-clamp-2 text-left"
          :style="{ color: 'var(--theme-text-secondary)' }"
        >{{ project.description || 'No description' }}</p>

        <div class="flex items-center justify-between">
          <span
            class="text-xs px-2 py-0.5 rounded-full"
            :style="{ backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }"
          >{{ TYPE_LABELS[project.type] }}</span>
          <span class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">
            Updated {{ formatDate(project.updatedAt) }}
          </span>
        </div>
      </button>
    </div>

    <!-- Empty -->
    <div
      v-else
      class="text-center py-16 rounded-xl border"
      :style="{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }"
    >
      <FolderOpen class="w-10 h-10 mx-auto mb-3" :style="{ color: 'var(--theme-text-muted)' }" />
      <p class="font-medium" :style="{ color: 'var(--theme-text-secondary)' }">No projects found</p>
      <button
        @click="router.push('/projects/new')"
        class="mt-3 text-sm font-medium"
        :style="{ color: 'var(--theme-primary)' }"
      >Create your first project</button>
    </div>
  </div>
</template>
