<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCompositionStore } from '../stores/composition'
import { useRegistryStore } from '../stores/registry'
import { useWorkflowStore } from '../stores/workflow'
import { Database, FileText, ArrowRight, Blocks } from 'lucide-vue-next'
import WorkflowProgress from '../components/WorkflowProgress.vue'

const router = useRouter()
const composition = useCompositionStore()
const registry = useRegistryStore()
const workflow = useWorkflowStore()

const canContinue = computed(() => schemas.value.length > 0)

function handleContinue() {
  workflow.completeStep('cms')
  workflow.goToStep('dashboard')
  router.push('/dashboards')
}

workflow.goToStep('cms')

const schemas = computed(() => composition.mergedSchemaRequirements)

const totalFields = computed(() =>
  schemas.value.reduce((sum, s) => sum + s.fields.length, 0)
)

// Track which variants are contributing to the schema
const contributingVariants = computed(() => {
  const names: string[] = []
  if (composition.selectedHeaderVariant) names.push(composition.selectedHeaderVariant.name)
  if (composition.selectedFooterVariant) names.push(composition.selectedFooterVariant.name)
  if (composition.selectedTemplate) names.push(composition.selectedTemplate.name)

  // Check page blocks (all slots)
  for (const page of composition.siteBuilder.sitemapPages) {
    const allPageBlockIds = [
      ...(page.blocks ?? []),
      ...Object.values(page.slotBlocks ?? {}).flatMap(v => v ?? [])
    ]
    for (const blockId of [...new Set(allPageBlockIds)]) {
      const block = registry.getBlockById(blockId)
      if (block && !names.includes(block.name)) {
        names.push(block.name)
      }
    }
  }
  return names
})

// Map field types to display badges
const typeColors: Record<string, string> = {
  string: 'var(--theme-primary)',
  image: 'var(--theme-success)',
  array: 'var(--theme-warning)',
  block: 'var(--theme-danger)',
  object: 'var(--theme-text-muted)',
  reference: 'var(--theme-primary)'
}
</script>

<template>
  <div class="p-6 lg:p-8 max-w-6xl">
    <WorkflowProgress />

    <div class="mb-8">
      <h1 class="text-2xl font-bold" :style="{ color: 'var(--theme-text-primary)' }">CMS Schema Preview</h1>
      <p class="mt-1" :style="{ color: 'var(--theme-text-secondary)' }">
        Sanity schemas generated from your site component selections. As you choose headers, footers, templates, and content blocks, the required schemas update automatically.
      </p>
    </div>

    <!-- Empty State -->
    <div
      v-if="schemas.length === 0"
      class="p-12 rounded-xl border text-center"
      :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
    >
      <div
        class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
        :style="{ backgroundColor: 'var(--theme-primary-light)', color: 'var(--theme-primary)' }"
      >
        <Database class="w-8 h-8" />
      </div>
      <h2 class="text-xl font-semibold mb-2" :style="{ color: 'var(--theme-text-primary)' }">No schemas yet</h2>
      <p class="mb-6" :style="{ color: 'var(--theme-text-secondary)' }">
        Select site components to see the Sanity schemas that will be generated for your project.
      </p>
      <button
        @click="router.push('/site')"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-colors"
        :style="{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
      >
        <Blocks class="w-4 h-4" />
        Go to Site Builder
        <ArrowRight class="w-4 h-4" />
      </button>
    </div>

    <!-- Schema Content -->
    <template v-else>
      <!-- Summary Bar -->
      <div
        class="p-4 rounded-xl border mb-6 flex flex-wrap gap-6"
        :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
      >
        <div>
          <span class="text-2xl font-bold" :style="{ color: 'var(--theme-primary)' }">{{ schemas.length }}</span>
          <span class="text-sm ml-1.5" :style="{ color: 'var(--theme-text-secondary)' }">document {{ schemas.length === 1 ? 'type' : 'types' }}</span>
        </div>
        <div>
          <span class="text-2xl font-bold" :style="{ color: 'var(--theme-primary)' }">{{ totalFields }}</span>
          <span class="text-sm ml-1.5" :style="{ color: 'var(--theme-text-secondary)' }">total fields</span>
        </div>
        <div>
          <span class="text-2xl font-bold" :style="{ color: 'var(--theme-primary)' }">{{ contributingVariants.length }}</span>
          <span class="text-sm ml-1.5" :style="{ color: 'var(--theme-text-secondary)' }">contributing {{ contributingVariants.length === 1 ? 'component' : 'components' }}</span>
        </div>
      </div>

      <!-- Contributing Components -->
      <div class="mb-6">
        <h3 class="text-xs font-semibold uppercase tracking-wide mb-2" :style="{ color: 'var(--theme-text-muted)' }">Contributing Components</h3>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="name in contributingVariants"
            :key="name"
            class="text-xs px-3 py-1 rounded-full font-medium"
            :style="{ backgroundColor: 'var(--theme-primary-light)', color: 'var(--theme-primary)' }"
          >{{ name }}</span>
        </div>
      </div>

      <!-- Schema Tree -->
      <div class="space-y-4">
        <div
          v-for="schema in schemas"
          :key="schema.documentType"
          class="rounded-xl border overflow-hidden"
          :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }"
        >
          <!-- Document Type Header -->
          <div
            class="px-5 py-4 border-b flex items-center gap-3"
            :style="{ borderColor: 'var(--theme-border)' }"
          >
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center"
              :style="{ backgroundColor: 'var(--theme-primary-light)', color: 'var(--theme-primary)' }"
            >
              <FileText class="w-4 h-4" />
            </div>
            <div>
              <h3 class="font-semibold" :style="{ color: 'var(--theme-text-primary)' }">{{ schema.title }}</h3>
              <p class="text-xs font-mono" :style="{ color: 'var(--theme-text-muted)' }">{{ schema.documentType }}</p>
            </div>
            <span
              class="ml-auto text-xs px-2 py-0.5 rounded-full"
              :style="{ backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }"
            >{{ schema.fields.length }} {{ schema.fields.length === 1 ? 'field' : 'fields' }}</span>
          </div>

          <!-- Fields -->
          <div class="divide-y" :style="{ '--tw-divide-color': 'var(--theme-border)' } as any">
            <div
              v-for="field in schema.fields"
              :key="field.name"
              class="px-5 py-3 flex items-center gap-4"
            >
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="font-mono text-sm font-medium" :style="{ color: 'var(--theme-text-primary)' }">{{ field.name }}</span>
                  <span
                    v-if="field.required"
                    class="text-xs px-1.5 py-0.5 rounded font-medium"
                    :style="{ backgroundColor: 'var(--theme-danger-light)', color: 'var(--theme-danger)' }"
                  >required</span>
                </div>
                <p class="text-xs mt-0.5" :style="{ color: 'var(--theme-text-muted)' }">{{ field.description }}</p>
              </div>
              <span
                class="text-xs px-2 py-1 rounded font-mono flex-shrink-0"
                :style="{
                  backgroundColor: 'var(--theme-bg-tertiary)',
                  color: typeColors[field.type] || 'var(--theme-text-muted)'
                }"
              >{{ field.type }}{{ field.of ? `<${field.of}>` : '' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Continue Button -->
      <div class="mt-8 flex justify-end">
        <button
          :disabled="!canContinue"
          @click="handleContinue"
          class="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          :style="{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
        >
          Continue to Dashboards
          <ArrowRight class="w-4 h-4" />
        </button>
      </div>
    </template>
  </div>
</template>
