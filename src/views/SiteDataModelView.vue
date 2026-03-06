<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  ArrowLeft, ArrowRight, Plus, Trash2, ChevronDown, ChevronUp, FlaskConical
} from 'lucide-vue-next'
import { useCompositionStore } from '../stores/composition'
import { getDefaultDataModel } from '../data/siteBuilderData'
import type { DataEntity, DataField, DataFieldType } from '../types/registry'

const router = useRouter()
const composition = useCompositionStore()

const entities = ref<DataEntity[]>([])
const expandedEntities = ref<Set<string>>(new Set())

onMounted(() => {
  if (composition.siteBuilder.dataModel.length > 0) {
    entities.value = composition.siteBuilder.dataModel.map(e => ({
      ...e,
      fields: e.fields.map(f => ({ ...f }))
    }))
  } else if (composition.siteBuilder.businessType) {
    entities.value = getDefaultDataModel(composition.siteBuilder.businessType)
  }
  // Expand all by default
  entities.value.forEach(e => expandedEntities.value.add(e.id))
})

const FIELD_TYPES: { value: DataFieldType; label: string }[] = [
  { value: 'string', label: 'string' },
  { value: 'number', label: 'number' },
  { value: 'boolean', label: 'boolean' },
  { value: 'date', label: 'date' },
  { value: 'image', label: 'image' },
  { value: 'array', label: 'array' },
  { value: 'reference', label: 'reference' },
  { value: 'richtext', label: 'richtext' }
]

const FIELD_TYPE_COLORS: Record<DataFieldType, string> = {
  string:    'var(--theme-primary)',
  number:    'var(--theme-warning)',
  boolean:   'var(--theme-success)',
  date:      'var(--theme-text-secondary)',
  image:     'var(--theme-text-secondary)',
  array:     'var(--theme-primary)',
  reference: 'var(--theme-warning)',
  richtext:  'var(--theme-text-secondary)'
}

// Adding entity state
const addingEntity = ref(false)
const newEntityName = ref('')
const newEntityDescription = ref('')

// Adding field state — keyed by entity id
const addingFieldFor = ref<string | null>(null)
const newFieldName = ref('')
const newFieldType = ref<DataFieldType>('string')
const newFieldDescription = ref('')
const newFieldRequired = ref(false)

function toggleEntity(id: string) {
  if (expandedEntities.value.has(id)) expandedEntities.value.delete(id)
  else expandedEntities.value.add(id)
}

function updateEntityName(id: string, value: string) {
  const e = entities.value.find(e => e.id === id)
  if (e) e.name = value
}

function updateEntityDescription(id: string, value: string) {
  const e = entities.value.find(e => e.id === id)
  if (e) e.description = value
}

function removeEntity(id: string) {
  entities.value = entities.value.filter(e => e.id !== id)
  expandedEntities.value.delete(id)
}

function addEntity() {
  if (!newEntityName.value.trim()) return
  const entity: DataEntity = {
    id: crypto.randomUUID(),
    name: newEntityName.value.trim(),
    description: newEntityDescription.value.trim() || undefined,
    fields: []
  }
  entities.value.push(entity)
  expandedEntities.value.add(entity.id)
  newEntityName.value = ''
  newEntityDescription.value = ''
  addingEntity.value = false
}

function updateField(entityId: string, fieldId: string, partial: Partial<DataField>) {
  const entity = entities.value.find(e => e.id === entityId)
  if (!entity) return
  const field = entity.fields.find(f => f.id === fieldId)
  if (field) Object.assign(field, partial)
}

function removeField(entityId: string, fieldId: string) {
  const entity = entities.value.find(e => e.id === entityId)
  if (entity) entity.fields = entity.fields.filter(f => f.id !== fieldId)
}

function startAddField(entityId: string) {
  addingFieldFor.value = entityId
  newFieldName.value = ''
  newFieldType.value = 'string'
  newFieldDescription.value = ''
  newFieldRequired.value = false
}

function addField(entityId: string) {
  if (!newFieldName.value.trim()) return
  const entity = entities.value.find(e => e.id === entityId)
  if (!entity) return
  const field: DataField = {
    id: crypto.randomUUID(),
    name: newFieldName.value.trim(),
    type: newFieldType.value,
    description: newFieldDescription.value.trim() || undefined,
    required: newFieldRequired.value
  }
  entity.fields.push(field)
  addingFieldFor.value = null
}

function cancelAddField() {
  addingFieldFor.value = null
}

function save() {
  composition.setDataModel(entities.value)
  router.push('/site/checklist')
}
</script>

<template>
  <div class="p-6 lg:p-8 max-w-3xl">
    <!-- Back -->
    <button
      @click="router.push('/site/app-screens')"
      class="flex items-center gap-1.5 text-sm mb-6 transition-colors"
      :style="{ color: 'var(--theme-text-secondary)' }"
    >
      <ArrowLeft class="w-4 h-4" />
      Back to App Screens
    </button>

    <div class="mb-8">
      <div class="flex items-center gap-2 mb-1">
        <p class="text-xs font-semibold uppercase tracking-widest" :style="{ color: 'var(--theme-primary)' }">Step 2d</p>
        <span
          class="text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
          :style="{ backgroundColor: 'var(--theme-warning)', color: 'var(--theme-text-inverse)' }"
        >
          <FlaskConical class="w-3 h-3" />
          Project Mode
        </span>
      </div>
      <h1 class="text-2xl font-bold" :style="{ color: 'var(--theme-text-primary)' }">Data Model</h1>
      <p class="mt-1" :style="{ color: 'var(--theme-text-secondary)' }">
        Define the data entities this app manages. This drives Sanity schema stubs and Pinia store outlines.
      </p>
    </div>

    <!-- Entity list -->
    <div class="space-y-3 mb-6">
      <div
        v-for="entity in entities"
        :key="entity.id"
        class="rounded-xl border overflow-hidden"
        :style="{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }"
      >
        <!-- Entity header -->
        <div
          class="flex items-center gap-3 px-4 py-3 cursor-pointer"
          :style="{ backgroundColor: 'var(--theme-bg-card)' }"
          @click="toggleEntity(entity.id)"
        >
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span
                class="text-xs font-mono font-semibold px-1.5 py-0.5 rounded"
                :style="{ backgroundColor: 'var(--theme-primary-light)', color: 'var(--theme-primary)' }"
              >entity</span>
              <span class="font-semibold text-sm" :style="{ color: 'var(--theme-text-primary)' }">{{ entity.name }}</span>
              <span class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">{{ entity.fields.length }} fields</span>
            </div>
            <p v-if="entity.description" class="text-xs mt-0.5" :style="{ color: 'var(--theme-text-muted)' }">{{ entity.description }}</p>
          </div>
          <button
            @click.stop="removeEntity(entity.id)"
            class="shrink-0 p-1 rounded transition-colors"
            :style="{ color: 'var(--theme-text-muted)' }"
            title="Remove entity"
          >
            <Trash2 class="w-4 h-4" />
          </button>
          <ChevronUp v-if="expandedEntities.has(entity.id)" class="w-4 h-4 shrink-0" :style="{ color: 'var(--theme-text-muted)' }" />
          <ChevronDown v-else class="w-4 h-4 shrink-0" :style="{ color: 'var(--theme-text-muted)' }" />
        </div>

        <!-- Fields -->
        <div v-if="expandedEntities.has(entity.id)" class="border-t" :style="{ borderColor: 'var(--theme-border)' }">
          <!-- Field rows -->
          <div
            v-for="field in entity.fields"
            :key="field.id"
            class="flex items-center gap-3 px-4 py-2.5 border-b"
            :style="{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-secondary)' }"
          >
            <!-- Required dot -->
            <div
              class="w-1.5 h-1.5 rounded-full shrink-0"
              :style="{ backgroundColor: field.required ? 'var(--theme-danger)' : 'var(--theme-bg-tertiary)' }"
              :title="field.required ? 'Required' : 'Optional'"
            />

            <!-- Name (editable) -->
            <input
              :value="field.name"
              @input="updateField(entity.id, field.id, { name: ($event.target as HTMLInputElement).value })"
              class="text-sm font-mono font-medium w-32 bg-transparent border-0 focus:outline-none focus:ring-0 shrink-0"
              :style="{ color: 'var(--theme-text-primary)' }"
              placeholder="fieldName"
            />

            <!-- Type selector -->
            <select
              :value="field.type"
              @change="updateField(entity.id, field.id, { type: ($event.target as HTMLSelectElement).value as DataFieldType })"
              class="text-xs rounded px-1.5 py-1 border shrink-0 focus:outline-none"
              :style="{
                backgroundColor: 'var(--theme-bg-tertiary)',
                borderColor: 'var(--theme-border)',
                color: FIELD_TYPE_COLORS[field.type]
              }"
            >
              <option v-for="t in FIELD_TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
            </select>

            <!-- Description -->
            <input
              :value="field.description ?? ''"
              @input="updateField(entity.id, field.id, { description: ($event.target as HTMLInputElement).value || undefined })"
              class="flex-1 min-w-0 text-xs bg-transparent border-0 focus:outline-none focus:ring-0"
              :style="{ color: 'var(--theme-text-muted)' }"
              placeholder="description..."
            />

            <!-- Required toggle -->
            <button
              @click="updateField(entity.id, field.id, { required: !field.required })"
              class="text-xs px-1.5 py-0.5 rounded shrink-0 transition-colors"
              :style="field.required
                ? { backgroundColor: 'var(--theme-danger-light, var(--theme-warning-light))', color: 'var(--theme-danger)' }
                : { backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }"
              title="Toggle required"
            >req</button>

            <!-- Remove -->
            <button
              @click="removeField(entity.id, field.id)"
              class="shrink-0 p-0.5 rounded transition-colors"
              :style="{ color: 'var(--theme-text-muted)' }"
            >
              <Trash2 class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Add field form -->
          <div
            v-if="addingFieldFor === entity.id"
            class="px-4 py-3 border-b"
            :style="{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }"
          >
            <div class="grid grid-cols-2 gap-2 mb-2">
              <input
                v-model="newFieldName"
                type="text"
                placeholder="fieldName"
                class="px-2 py-1.5 rounded-lg border text-sm font-mono focus:outline-none focus:ring-1"
                :style="{
                  backgroundColor: 'var(--theme-bg-secondary)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text-primary)',
                  '--tw-ring-color': 'var(--theme-primary)'
                }"
              />
              <select
                v-model="newFieldType"
                class="px-2 py-1.5 rounded-lg border text-sm focus:outline-none focus:ring-1"
                :style="{
                  backgroundColor: 'var(--theme-bg-secondary)',
                  borderColor: 'var(--theme-border)',
                  color: 'var(--theme-text-primary)',
                  '--tw-ring-color': 'var(--theme-primary)'
                }"
              >
                <option v-for="t in FIELD_TYPES" :key="t.value" :value="t.value">{{ t.label }}</option>
              </select>
            </div>
            <input
              v-model="newFieldDescription"
              type="text"
              placeholder="Description (optional)"
              class="w-full px-2 py-1.5 rounded-lg border text-sm mb-2 focus:outline-none focus:ring-1"
              :style="{
                backgroundColor: 'var(--theme-bg-secondary)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text-primary)',
                '--tw-ring-color': 'var(--theme-primary)'
              }"
            />
            <div class="flex items-center gap-3">
              <label class="flex items-center gap-1.5 text-xs cursor-pointer" :style="{ color: 'var(--theme-text-secondary)' }">
                <input v-model="newFieldRequired" type="checkbox" class="rounded" />
                Required
              </label>
              <div class="flex gap-2 ml-auto">
                <button
                  @click="addField(entity.id)"
                  :disabled="!newFieldName.trim()"
                  class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40"
                  :style="{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
                >Add Field</button>
                <button
                  @click="cancelAddField"
                  class="px-3 py-1.5 rounded-lg text-xs transition-colors"
                  :style="{ color: 'var(--theme-text-secondary)', backgroundColor: 'var(--theme-bg-secondary)' }"
                >Cancel</button>
              </div>
            </div>
          </div>

          <!-- Add field button -->
          <div class="px-4 py-2.5" :style="{ backgroundColor: 'var(--theme-bg-card)' }">
            <button
              v-if="addingFieldFor !== entity.id"
              @click="startAddField(entity.id)"
              class="flex items-center gap-1.5 text-xs transition-colors"
              :style="{ color: 'var(--theme-primary)' }"
            >
              <Plus class="w-3.5 h-3.5" />
              Add Field
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add entity -->
    <div class="mb-8">
      <div v-if="!addingEntity">
        <button
          @click="addingEntity = true"
          class="flex items-center gap-2 text-sm px-4 py-2.5 rounded-lg border transition-colors"
          :style="{ borderColor: 'var(--theme-border)', color: 'var(--theme-primary)', backgroundColor: 'var(--theme-bg-card)' }"
        >
          <Plus class="w-4 h-4" />
          Add Entity
        </button>
      </div>
      <div
        v-else
        class="p-4 rounded-xl border"
        :style="{ borderColor: 'var(--theme-border)', backgroundColor: 'var(--theme-bg-card)' }"
      >
        <div class="space-y-2 mb-3">
          <input
            v-model="newEntityName"
            type="text"
            placeholder="Entity name (e.g. Post)"
            class="w-full px-3 py-2 rounded-lg border text-sm font-mono focus:outline-none focus:ring-2"
            :style="{
              backgroundColor: 'var(--theme-bg-secondary)',
              borderColor: 'var(--theme-border)',
              color: 'var(--theme-text-primary)',
              '--tw-ring-color': 'var(--theme-primary)'
            }"
          />
          <input
            v-model="newEntityDescription"
            type="text"
            placeholder="Description (optional)"
            class="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2"
            :style="{
              backgroundColor: 'var(--theme-bg-secondary)',
              borderColor: 'var(--theme-border)',
              color: 'var(--theme-text-primary)',
              '--tw-ring-color': 'var(--theme-primary)'
            }"
          />
        </div>
        <div class="flex gap-2">
          <button
            @click="addEntity"
            :disabled="!newEntityName.trim()"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
            :style="{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
          >Add Entity</button>
          <button
            @click="addingEntity = false; newEntityName = ''; newEntityDescription = ''"
            class="px-4 py-2 rounded-lg text-sm transition-colors"
            :style="{ color: 'var(--theme-text-secondary)', backgroundColor: 'var(--theme-bg-secondary)' }"
          >Cancel</button>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-between">
      <button
        @click="router.push('/site/app-screens')"
        class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-colors"
        :style="{ color: 'var(--theme-text-secondary)', backgroundColor: 'var(--theme-bg-secondary)' }"
      >
        <ArrowLeft class="w-4 h-4" />
        Back
      </button>
      <button
        :disabled="entities.length === 0"
        @click="save"
        class="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        :style="{ backgroundColor: 'var(--theme-warning)', color: 'var(--theme-text-inverse)' }"
      >
        Continue to Outputs
        <ArrowRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
