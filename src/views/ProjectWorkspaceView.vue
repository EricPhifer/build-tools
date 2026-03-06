<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  ArrowLeft, ExternalLink, Plus, Trash2, Edit3, Check, X,
  Clock, CheckCircle2, PauseCircle, Lightbulb, ClipboardList
} from 'lucide-vue-next'
import { useProjectsStore } from '../stores/projects'
import type { ProjectStatus, ProjectType } from '../types/registry'

const router = useRouter()
const route = useRoute()
const store = useProjectsStore()

const project = computed(() => store.getProject(route.params.id as string))

// Redirect if not found
watch(project, (p) => { if (!p) router.push('/projects') }, { immediate: true })

// Editing
const editing = ref(false)
const editName = ref('')
const editDescription = ref('')
const editType = ref<ProjectType>('personal_website')
const editStatus = ref<ProjectStatus>('planning')
const editNotes = ref('')

function startEdit() {
  if (!project.value) return
  editName.value = project.value.name
  editDescription.value = project.value.description
  editType.value = project.value.type
  editStatus.value = project.value.status
  editNotes.value = project.value.notes
  editing.value = true
}

function saveEdit() {
  if (!project.value) return
  store.updateProject(project.value.id, {
    name: editName.value.trim() || project.value.name,
    description: editDescription.value,
    type: editType.value,
    status: editStatus.value,
    notes: editNotes.value
  })
  editing.value = false
}

// Links
const newLinkLabel = ref('')
const newLinkUrl = ref('')
const addingLink = ref(false)

function addLink() {
  if (!project.value || !newLinkLabel.value.trim() || !newLinkUrl.value.trim()) return
  store.addLink(project.value.id, { label: newLinkLabel.value.trim(), url: newLinkUrl.value.trim() })
  newLinkLabel.value = ''
  newLinkUrl.value = ''
  addingLink.value = false
}

const TYPE_LABELS: Record<ProjectType, string> = {
  personal_website: 'Personal Website',
  dashboard: 'Specialized Dashboard',
  database_catalog: 'Database / Catalog UI',
  custom_tool: 'Custom Tool',
  other: 'Other'
}

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

const STATUS_CONFIG: Record<ProjectStatus, { label: string; icon: object; color: string; bg: string }> = {
  planning: { label: 'Planning', icon: Lightbulb, color: 'var(--theme-text-muted)', bg: 'var(--theme-bg-tertiary)' },
  in_progress: { label: 'In Progress', icon: Clock, color: 'var(--theme-warning)', bg: 'var(--theme-warning-light)' },
  on_hold: { label: 'On Hold', icon: PauseCircle, color: 'var(--theme-text-muted)', bg: 'var(--theme-bg-tertiary)' },
  complete: { label: 'Complete', icon: CheckCircle2, color: 'var(--theme-success)', bg: 'var(--theme-success-light)' }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

const inputClass = 'w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2'
const inputStyle = {
  backgroundColor: 'var(--theme-bg-secondary)',
  borderColor: 'var(--theme-border)',
  color: 'var(--theme-text-primary)',
  '--tw-ring-color': 'var(--theme-primary)'
}
</script>

<template>
  <div v-if="project" class="p-6 lg:p-8 max-w-3xl">
    <!-- Back -->
    <button
      @click="router.push('/projects')"
      class="flex items-center gap-1.5 text-sm mb-6 transition-colors"
      :style="{ color: 'var(--theme-text-secondary)' }"
    >
      <ArrowLeft class="w-4 h-4" />
      Back to Projects
    </button>

    <!-- Header -->
    <div class="flex items-start justify-between mb-8">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-2">
          <span
            class="text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
            :style="{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
          >Project Mode</span>
          <span
            class="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
            :style="{ backgroundColor: STATUS_CONFIG[project.status].bg, color: STATUS_CONFIG[project.status].color }"
          >
            <component :is="STATUS_CONFIG[project.status].icon" class="w-3 h-3" />
            {{ STATUS_CONFIG[project.status].label }}
          </span>
        </div>
        <h1 class="text-2xl font-bold" :style="{ color: 'var(--theme-text-primary)' }">{{ project.name }}</h1>
        <p class="text-sm mt-1" :style="{ color: 'var(--theme-text-muted)' }">
          {{ TYPE_LABELS[project.type] }} · Updated {{ formatDate(project.updatedAt) }}
        </p>
      </div>
      <button
        v-if="!editing"
        @click="startEdit"
        class="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg ml-4 shrink-0 transition-colors"
        :style="{ backgroundColor: 'var(--theme-bg-secondary)', color: 'var(--theme-text-secondary)' }"
      >
        <Edit3 class="w-4 h-4" />
        Edit
      </button>
    </div>

    <!-- View mode -->
    <template v-if="!editing">
      <!-- Description -->
      <div
        class="p-5 rounded-xl border mb-6"
        :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
      >
        <h2 class="text-xs font-semibold uppercase tracking-wide mb-2" :style="{ color: 'var(--theme-text-muted)' }">Description</h2>
        <p class="text-sm" :style="{ color: project.description ? 'var(--theme-text-primary)' : 'var(--theme-text-muted)' }">
          {{ project.description || 'No description added.' }}
        </p>
      </div>

      <!-- Links -->
      <div
        class="p-5 rounded-xl border mb-6"
        :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
      >
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-xs font-semibold uppercase tracking-wide" :style="{ color: 'var(--theme-text-muted)' }">Links</h2>
          <button
            @click="addingLink = true"
            class="text-xs flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors"
            :style="{ color: 'var(--theme-primary)', backgroundColor: 'var(--theme-primary-light)' }"
          >
            <Plus class="w-3 h-3" />
            Add
          </button>
        </div>

        <div v-if="addingLink" class="mb-3 grid grid-cols-2 gap-2">
          <input
            v-model="newLinkLabel"
            type="text"
            placeholder="Label (e.g. GitHub)"
            :class="inputClass"
            :style="inputStyle"
          />
          <input
            v-model="newLinkUrl"
            type="url"
            placeholder="URL"
            :class="inputClass"
            :style="inputStyle"
          />
          <div class="col-span-2 flex gap-2">
            <button
              @click="addLink"
              :disabled="!newLinkLabel.trim() || !newLinkUrl.trim()"
              class="text-xs px-3 py-1.5 rounded-lg font-medium disabled:opacity-40"
              :style="{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
            >Add</button>
            <button
              @click="addingLink = false; newLinkLabel = ''; newLinkUrl = ''"
              class="text-xs px-3 py-1.5 rounded-lg"
              :style="{ color: 'var(--theme-text-secondary)' }"
            >Cancel</button>
          </div>
        </div>

        <div v-if="project.links.length > 0" class="space-y-2">
          <div
            v-for="link in project.links"
            :key="link.id"
            class="flex items-center gap-2"
          >
            <a
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-1.5 text-sm flex-1 min-w-0 hover:underline"
              :style="{ color: 'var(--theme-primary)' }"
            >
              <ExternalLink class="w-3.5 h-3.5 shrink-0" />
              <span class="truncate">{{ link.label }}</span>
            </a>
            <button
              @click="store.removeLink(project.id, link.id)"
              class="shrink-0 p-1 rounded transition-colors"
              :style="{ color: 'var(--theme-text-muted)' }"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <p v-else-if="!addingLink" class="text-sm" :style="{ color: 'var(--theme-text-muted)' }">No links added yet.</p>
      </div>

      <!-- Notes -->
      <div
        class="p-5 rounded-xl border mb-6"
        :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
      >
        <h2 class="text-xs font-semibold uppercase tracking-wide mb-2" :style="{ color: 'var(--theme-text-muted)' }">Notes</h2>
        <p class="text-sm whitespace-pre-wrap" :style="{ color: project.notes ? 'var(--theme-text-primary)' : 'var(--theme-text-muted)' }">
          {{ project.notes || 'No notes yet. Click Edit to add notes.' }}
        </p>
      </div>

      <!-- Task checklist placeholder -->
      <div
        class="p-5 rounded-xl border"
        :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
      >
        <div class="flex items-center gap-2 mb-3">
          <ClipboardList class="w-4 h-4" :style="{ color: 'var(--theme-text-muted)' }" />
          <h2 class="text-xs font-semibold uppercase tracking-wide" :style="{ color: 'var(--theme-text-muted)' }">Task Checklist</h2>
          <span
            class="text-xs px-2 py-0.5 rounded-full"
            :style="{ backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }"
          >Coming Soon</span>
        </div>
        <p class="text-sm" :style="{ color: 'var(--theme-text-muted)' }">
          Task management for this project will be added in a future update.
        </p>
      </div>
    </template>

    <!-- Edit mode -->
    <template v-else>
      <div
        class="p-5 rounded-xl border mb-6 space-y-4"
        :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
      >
        <div>
          <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">Project Name</label>
          <input v-model="editName" type="text" :class="inputClass" :style="inputStyle" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">Type</label>
            <select v-model="editType" :class="inputClass" :style="inputStyle">
              <option v-for="opt in TYPE_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">Status</label>
            <select v-model="editStatus" :class="inputClass" :style="inputStyle">
              <option v-for="opt in STATUS_OPTIONS" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">Description</label>
          <textarea v-model="editDescription" rows="3" :class="inputClass + ' resize-y'" :style="inputStyle" />
        </div>
        <div>
          <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">Notes</label>
          <textarea v-model="editNotes" rows="6" :class="inputClass + ' resize-y'" :style="inputStyle" placeholder="Project notes, ideas, reminders..." />
        </div>
      </div>

      <div class="flex gap-3 justify-end">
        <button
          @click="editing = false"
          class="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm transition-colors"
          :style="{ color: 'var(--theme-text-secondary)', backgroundColor: 'var(--theme-bg-secondary)' }"
        >
          <X class="w-4 h-4" />
          Cancel
        </button>
        <button
          @click="saveEdit"
          class="flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          :style="{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
        >
          <Check class="w-4 h-4" />
          Save Changes
        </button>
      </div>
    </template>
  </div>
</template>
