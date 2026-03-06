<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'
import { useProjectsStore } from '../stores/projects'
import type { ProjectType, ProjectStatus } from '../types/registry'

const router = useRouter()
const store = useProjectsStore()

const name = ref('')
const type = ref<ProjectType>('personal_website')
const description = ref('')
const status = ref<ProjectStatus>('planning')

const TYPE_OPTIONS: { value: ProjectType; label: string }[] = [
  { value: 'personal_website', label: 'Personal Website' },
  { value: 'dashboard', label: 'Specialized Dashboard' },
  { value: 'database_catalog', label: 'Database / Catalog UI' },
  { value: 'custom_tool', label: 'Custom Tool' },
  { value: 'other', label: 'Other' }
]

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'planning', label: 'Planning' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'complete', label: 'Complete' }
]

function create() {
  if (!name.value.trim()) return
  const project = store.createProject({
    name: name.value.trim(),
    type: type.value,
    description: description.value.trim(),
    status: status.value,
    links: [],
    notes: ''
  })
  router.push(`/projects/${project.id}`)
}

const inputClass = 'w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2'
</script>

<template>
  <div class="p-6 lg:p-8 max-w-xl">
    <!-- Back -->
    <button
      @click="router.push('/projects')"
      class="flex items-center gap-1.5 text-sm mb-6 transition-colors"
      :style="{ color: 'var(--theme-text-secondary)' }"
    >
      <ArrowLeft class="w-4 h-4" />
      Back to Projects
    </button>

    <div class="mb-8">
      <div class="flex items-center gap-2 mb-1">
        <span
          class="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
          :style="{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
        >Project Mode</span>
      </div>
      <h1 class="text-2xl font-bold" :style="{ color: 'var(--theme-text-primary)' }">New Project</h1>
    </div>

    <div class="space-y-5">
      <!-- Name -->
      <div>
        <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">
          Project Name <span :style="{ color: 'var(--theme-danger)' }">*</span>
        </label>
        <input
          v-model="name"
          type="text"
          placeholder="e.g. My Portfolio Rebuild"
          :class="inputClass"
          :style="{
            backgroundColor: 'var(--theme-bg-secondary)',
            borderColor: 'var(--theme-border)',
            color: 'var(--theme-text-primary)',
            '--tw-ring-color': 'var(--theme-primary)'
          }"
        />
      </div>

      <!-- Type -->
      <div>
        <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">Project Type</label>
        <select
          v-model="type"
          :class="inputClass"
          :style="{
            backgroundColor: 'var(--theme-bg-secondary)',
            borderColor: 'var(--theme-border)',
            color: 'var(--theme-text-primary)',
            '--tw-ring-color': 'var(--theme-primary)'
          }"
        >
          <option v-for="opt in TYPE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>

      <!-- Description -->
      <div>
        <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">Description</label>
        <textarea
          v-model="description"
          rows="3"
          placeholder="Brief description of this project..."
          :class="inputClass + ' resize-y'"
          :style="{
            backgroundColor: 'var(--theme-bg-secondary)',
            borderColor: 'var(--theme-border)',
            color: 'var(--theme-text-primary)',
            '--tw-ring-color': 'var(--theme-primary)'
          }"
        />
      </div>

      <!-- Status -->
      <div>
        <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">Status</label>
        <div class="flex gap-2 flex-wrap">
          <button
            v-for="opt in STATUS_OPTIONS"
            :key="opt.value"
            @click="status = opt.value"
            class="text-sm px-4 py-2 rounded-lg font-medium transition-colors"
            :style="status === opt.value
              ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }
              : { backgroundColor: 'var(--theme-bg-secondary)', color: 'var(--theme-text-secondary)', borderColor: 'var(--theme-border)' }"
          >{{ opt.label }}</button>
        </div>
      </div>
    </div>

    <div class="flex justify-between mt-8">
      <button
        @click="router.push('/projects')"
        class="px-4 py-2.5 rounded-lg text-sm transition-colors"
        :style="{ color: 'var(--theme-text-secondary)', backgroundColor: 'var(--theme-bg-secondary)' }"
      >Cancel</button>
      <button
        :disabled="!name.trim()"
        @click="create"
        class="px-6 py-3 rounded-lg font-medium text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        :style="{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
      >Create Project</button>
    </div>
  </div>
</template>
