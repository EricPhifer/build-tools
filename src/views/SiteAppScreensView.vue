<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft, ArrowRight, Plus, Trash2, TriangleAlert, ChevronDown, ChevronUp, FlaskConical
} from 'lucide-vue-next'
import { useCompositionStore } from '../stores/composition'
import { getDefaultAppScreens } from '../data/siteBuilderData'
import type { AppScreen, AppViewType } from '../types/registry'

const router = useRouter()
const composition = useCompositionStore()

const screens = ref<AppScreen[]>([])
const expandedRows = ref<Set<string>>(new Set())

onMounted(() => {
  if (composition.siteBuilder.appScreens.length > 0) {
    screens.value = composition.siteBuilder.appScreens.map(s => ({ ...s }))
  } else if (composition.siteBuilder.businessType) {
    screens.value = getDefaultAppScreens(composition.siteBuilder.businessType)
  }
})

const newScreenName = ref('')
const newScreenRoute = ref('')
const addingScreen = ref(false)

const VIEW_TYPE_OPTIONS: { value: AppViewType; label: string }[] = [
  { value: 'list', label: 'List / Index' },
  { value: 'detail', label: 'Detail' },
  { value: 'form', label: 'Form' },
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'settings', label: 'Settings' },
  { value: 'auth', label: 'Auth' },
  { value: 'other', label: 'Other' }
]

const VIEW_TYPE_COLORS: Record<AppViewType, { bg: string; text: string }> = {
  list:      { bg: 'var(--theme-primary-light)',   text: 'var(--theme-primary)' },
  detail:    { bg: 'var(--theme-bg-tertiary)',      text: 'var(--theme-text-secondary)' },
  form:      { bg: 'var(--theme-success-light)',    text: 'var(--theme-success)' },
  dashboard: { bg: 'var(--theme-primary-light)',    text: 'var(--theme-primary)' },
  settings:  { bg: 'var(--theme-bg-tertiary)',      text: 'var(--theme-text-muted)' },
  auth:      { bg: 'var(--theme-warning-light)',    text: 'var(--theme-warning)' },
  other:     { bg: 'var(--theme-bg-tertiary)',      text: 'var(--theme-text-muted)' }
}

const enrichCount = computed(() => screens.value.filter(s => s.isEnrichOnly).length)

function toggleExpand(id: string) {
  if (expandedRows.value.has(id)) expandedRows.value.delete(id)
  else expandedRows.value.add(id)
}

function setViewType(id: string, type: AppViewType) {
  const s = screens.value.find(s => s.id === id)
  if (s) s.viewType = type
}

function setDescription(id: string, value: string) {
  const s = screens.value.find(s => s.id === id)
  if (s) s.description = value
}

function setNotes(id: string, value: string) {
  const s = screens.value.find(s => s.id === id)
  if (s) s.notes = value
}

function toggleEnrich(id: string) {
  const s = screens.value.find(s => s.id === id)
  if (s) s.isEnrichOnly = !s.isEnrichOnly
}

function removeScreen(id: string) {
  screens.value = screens.value.filter(s => s.id !== id)
  expandedRows.value.delete(id)
}

function slugifyRoute(name: string): string {
  return '/' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function handleNameInput() {
  newScreenRoute.value = slugifyRoute(newScreenName.value)
}

function addScreen() {
  if (!newScreenName.value.trim()) return
  const screen: AppScreen = {
    id: crypto.randomUUID(),
    name: newScreenName.value.trim(),
    route: newScreenRoute.value || slugifyRoute(newScreenName.value.trim()),
    viewType: 'other',
    isEnrichOnly: false
  }
  screens.value.push(screen)
  newScreenName.value = ''
  newScreenRoute.value = ''
  addingScreen.value = false
}

function save() {
  composition.setAppScreens(screens.value)
  router.push('/site/data-model')
}
</script>

<template>
  <div class="p-6 lg:p-8 max-w-3xl">
    <!-- Back -->
    <button
      @click="router.push('/site/type')"
      class="flex items-center gap-1.5 text-sm mb-6 transition-colors"
      :style="{ color: 'var(--theme-text-secondary)' }"
    >
      <ArrowLeft class="w-4 h-4" />
      Back to Project Type
    </button>

    <div class="mb-8">
      <div class="flex items-center gap-2 mb-1">
        <p class="text-xs font-semibold uppercase tracking-widest" :style="{ color: 'var(--theme-primary)' }">Step 2c</p>
        <span
          class="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
          :style="{ backgroundColor: 'var(--theme-warning)', color: 'var(--theme-text-inverse)' }"
        >
          <FlaskConical class="w-3 h-3" />
          Project Mode
        </span>
      </div>
      <h1 class="text-2xl font-bold" :style="{ color: 'var(--theme-text-primary)' }">App Screens</h1>
      <p class="mt-1" :style="{ color: 'var(--theme-text-secondary)' }">
        Define the views and routes for this app. Expand any row to set the view type, description, and notes.
      </p>
    </div>

    <!-- Screen list -->
    <div class="space-y-2 mb-6">
      <div
        v-for="screen in screens"
        :key="screen.id"
        class="rounded-lg border overflow-hidden"
        :style="{
          backgroundColor: screen.isEnrichOnly ? 'var(--theme-warning-light)' : 'var(--theme-bg-card)',
          borderColor: screen.isEnrichOnly ? 'var(--theme-warning)' : 'var(--theme-border)'
        }"
      >
        <!-- Row header -->
        <div class="flex items-center gap-3 px-4 py-3">
          <!-- View type badge -->
          <span
            class="text-xs font-medium px-2 py-0.5 rounded-full shrink-0"
            :style="{ backgroundColor: VIEW_TYPE_COLORS[screen.viewType].bg, color: VIEW_TYPE_COLORS[screen.viewType].text }"
          >
            {{ VIEW_TYPE_OPTIONS.find(o => o.value === screen.viewType)?.label ?? screen.viewType }}
          </span>

          <!-- Name + route -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-medium text-sm" :style="{ color: 'var(--theme-text-primary)' }">{{ screen.name }}</span>
              <span
                v-if="screen.isEnrichOnly"
                class="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded font-medium"
                :style="{ backgroundColor: 'var(--theme-warning)', color: 'var(--theme-text-inverse)' }"
              >
                <TriangleAlert class="w-3 h-3" />
                Later
              </span>
            </div>
            <span class="text-xs font-mono" :style="{ color: 'var(--theme-text-muted)' }">{{ screen.route }}</span>
          </div>

          <!-- Expand toggle -->
          <button
            @click="toggleExpand(screen.id)"
            class="shrink-0 p-1 rounded transition-colors"
            :style="{ color: 'var(--theme-text-muted)' }"
          >
            <ChevronUp v-if="expandedRows.has(screen.id)" class="w-4 h-4" />
            <ChevronDown v-else class="w-4 h-4" />
          </button>

          <!-- Remove -->
          <button
            @click="removeScreen(screen.id)"
            class="shrink-0 p-1 rounded transition-colors"
            :style="{ color: 'var(--theme-text-muted)' }"
            title="Remove screen"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>

        <!-- Expanded detail -->
        <div
          v-if="expandedRows.has(screen.id)"
          class="px-4 pb-4 pt-1 border-t space-y-3"
          :style="{ borderColor: screen.isEnrichOnly ? 'var(--theme-warning)' : 'var(--theme-border)' }"
        >
          <!-- View type selector -->
          <div>
            <label class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">View Type</label>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="opt in VIEW_TYPE_OPTIONS"
                :key="opt.value"
                @click="setViewType(screen.id, opt.value)"
                class="text-xs px-2.5 py-1 rounded-full font-medium transition-colors"
                :style="screen.viewType === opt.value
                  ? { backgroundColor: VIEW_TYPE_COLORS[opt.value].bg, color: VIEW_TYPE_COLORS[opt.value].text, outline: `2px solid ${VIEW_TYPE_COLORS[opt.value].text}` }
                  : { backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }"
              >{{ opt.label }}</button>
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-xs font-medium mb-1" :style="{ color: 'var(--theme-text-secondary)' }">Description</label>
            <input
              :value="screen.description ?? ''"
              @input="setDescription(screen.id, ($event.target as HTMLInputElement).value)"
              type="text"
              placeholder="What does this screen do?"
              class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-1"
              :style="{
                backgroundColor: 'var(--theme-bg-secondary)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text-primary)',
                '--tw-ring-color': 'var(--theme-primary)'
              }"
            />
          </div>

          <!-- Notes -->
          <div>
            <label class="block text-xs font-medium mb-1" :style="{ color: 'var(--theme-text-secondary)' }">Notes</label>
            <textarea
              :value="screen.notes ?? ''"
              @input="setNotes(screen.id, ($event.target as HTMLTextAreaElement).value)"
              rows="2"
              placeholder="Implementation notes, open questions..."
              class="w-full px-3 py-2 rounded-lg border text-sm resize-y focus:outline-none focus:ring-1"
              :style="{
                backgroundColor: 'var(--theme-bg-secondary)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text-primary)',
                '--tw-ring-color': 'var(--theme-primary)'
              }"
            />
          </div>

          <!-- Later toggle -->
          <div class="flex items-center justify-between pt-1">
            <label class="text-xs" :style="{ color: 'var(--theme-text-secondary)' }">
              Flag as <strong>Later</strong> — defer this screen to a future build
            </label>
            <button
              @click="toggleEnrich(screen.id)"
              class="text-xs px-3 py-1 rounded-full font-medium transition-colors"
              :style="screen.isEnrichOnly
                ? { backgroundColor: 'var(--theme-warning)', color: 'var(--theme-text-inverse)' }
                : { backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }"
            >
              {{ screen.isEnrichOnly ? 'Flagged: Later' : 'Flag as Later' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary -->
    <div class="grid grid-cols-3 gap-3 mb-6 text-center">
      <div class="p-3 rounded-lg" :style="{ backgroundColor: 'var(--theme-bg-secondary)' }">
        <p class="text-lg font-bold" :style="{ color: 'var(--theme-text-primary)' }">{{ screens.length }}</p>
        <p class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">Total Screens</p>
      </div>
      <div class="p-3 rounded-lg" :style="{ backgroundColor: 'var(--theme-bg-secondary)' }">
        <p class="text-lg font-bold" :style="{ color: 'var(--theme-text-primary)' }">{{ screens.length - enrichCount }}</p>
        <p class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">Building Now</p>
      </div>
      <div class="p-3 rounded-lg" :style="{ backgroundColor: enrichCount > 0 ? 'var(--theme-warning-light)' : 'var(--theme-bg-secondary)' }">
        <p class="text-lg font-bold" :style="{ color: enrichCount > 0 ? 'var(--theme-warning)' : 'var(--theme-text-primary)' }">{{ enrichCount }}</p>
        <p class="text-xs" :style="{ color: enrichCount > 0 ? 'var(--theme-warning)' : 'var(--theme-text-muted)' }">Deferred Later</p>
      </div>
    </div>

    <!-- Add screen -->
    <div class="mb-8">
      <div v-if="!addingScreen">
        <button
          @click="addingScreen = true"
          class="flex items-center gap-2 text-sm px-4 py-2.5 rounded-lg border transition-colors"
          :style="{ borderColor: 'var(--theme-border)', color: 'var(--theme-primary)', backgroundColor: 'var(--theme-bg-card)' }"
        >
          <Plus class="w-4 h-4" />
          Add Screen
        </button>
      </div>
      <div
        v-else
        class="p-4 rounded-xl border"
        :style="{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }"
      >
        <div class="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label class="block text-xs font-medium mb-1" :style="{ color: 'var(--theme-text-secondary)' }">Screen Name</label>
            <input
              v-model="newScreenName"
              @input="handleNameInput"
              type="text"
              placeholder="e.g. Admin Panel"
              class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
              :style="{
                backgroundColor: 'var(--theme-bg-secondary)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text-primary)',
                '--tw-ring-color': 'var(--theme-primary)'
              }"
            />
          </div>
          <div>
            <label class="block text-xs font-medium mb-1" :style="{ color: 'var(--theme-text-secondary)' }">Route</label>
            <input
              v-model="newScreenRoute"
              type="text"
              placeholder="/admin"
              class="w-full px-3 py-2 rounded-lg border text-sm font-mono focus:outline-none focus:ring-2"
              :style="{
                backgroundColor: 'var(--theme-bg-secondary)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text-primary)',
                '--tw-ring-color': 'var(--theme-primary)'
              }"
            />
          </div>
        </div>
        <div class="flex gap-2">
          <button
            @click="addScreen"
            :disabled="!newScreenName.trim()"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
            :style="{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
          >Add Screen</button>
          <button
            @click="addingScreen = false; newScreenName = ''; newScreenRoute = ''"
            class="px-4 py-2 rounded-lg text-sm transition-colors"
            :style="{ color: 'var(--theme-text-secondary)', backgroundColor: 'var(--theme-bg-secondary)' }"
          >Cancel</button>
        </div>
      </div>
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
        :disabled="screens.filter(s => !s.isEnrichOnly).length === 0"
        @click="save"
        class="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        :style="{ backgroundColor: 'var(--theme-warning)', color: 'var(--theme-text-inverse)' }"
      >
        Continue to Data Model
        <ArrowRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
