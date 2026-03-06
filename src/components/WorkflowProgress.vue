<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Check, Lock, RefreshCw } from 'lucide-vue-next'
import { useWorkflowStore } from '../stores/workflow'

const router = useRouter()
const workflow = useWorkflowStore()

const handleStepClick = (stepId: string, route: string) => {
  const status = workflow.stepStatuses[stepId as keyof typeof workflow.stepStatuses]
  if (status === 'locked') return
  workflow.goToStep(stepId as any)
  router.push(route)
}
</script>

<template>
  <div class="mb-6">

    <!-- Extend Mode banner -->
    <div
      v-if="workflow.extendMode"
      class="flex items-center gap-2 px-3 py-2 rounded-lg mb-3 text-sm font-medium"
      :style="{ backgroundColor: 'var(--theme-warning-light)', color: 'var(--theme-warning)' }"
    >
      <RefreshCw class="w-4 h-4 shrink-0" />
      <span class="flex-1">
        Extend Mode — adding to <strong>{{ workflow.clientInfo?.name ?? 'existing project' }}</strong>.
        Original config is locked. Only new pages, blocks, and dashboard items will be exported as the delta.
      </span>
    </div>

    <div class="flex items-center gap-1">
      <template v-for="(step, index) in workflow.steps" :key="step.id">
        <!-- Step indicator -->
        <button
          @click="handleStepClick(step.id, step.route)"
          class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
          :class="step.status === 'locked' ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'"
          :style="{
            backgroundColor: step.id === workflow.currentStep
              ? (workflow.extendMode ? 'var(--theme-warning)' : 'var(--theme-primary)')
              : step.status === 'complete'
                ? (workflow.extendMode ? 'var(--theme-warning-light)' : 'var(--theme-primary-light)')
                : 'transparent',
            color: step.id === workflow.currentStep
              ? 'var(--theme-text-inverse)'
              : step.status === 'complete'
                ? (workflow.extendMode ? 'var(--theme-warning)' : 'var(--theme-primary)')
                : 'var(--theme-text-muted)'
          }"
          :disabled="step.status === 'locked'"
        >
          <!-- Step number, checkmark, or lock (extend mode) -->
          <span
            v-if="step.status === 'complete' && workflow.extendMode"
            class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            :style="{
              backgroundColor: step.id === workflow.currentStep ? 'var(--theme-text-inverse)' : 'var(--theme-warning)',
              color: step.id === workflow.currentStep ? 'var(--theme-warning)' : 'var(--theme-text-inverse)'
            }"
          >
            <Lock class="w-2.5 h-2.5" />
          </span>
          <span
            v-else-if="step.status === 'complete'"
            class="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            :style="{
              backgroundColor: step.id === workflow.currentStep ? 'var(--theme-text-inverse)' : 'var(--theme-primary)',
              color: step.id === workflow.currentStep ? 'var(--theme-primary)' : 'var(--theme-text-inverse)'
            }"
          >
            <Check class="w-3 h-3" />
          </span>
          <span
            v-else
            class="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            :style="{
              backgroundColor: step.id === workflow.currentStep
                ? 'var(--theme-text-inverse)'
                : 'var(--theme-bg-tertiary)',
              color: step.id === workflow.currentStep
                ? 'var(--theme-primary)'
                : 'var(--theme-text-muted)'
            }"
          >{{ step.stepNumber }}</span>

          <!-- Label (hidden on small screens) -->
          <span class="hidden md:inline">{{ step.label }}</span>
        </button>

        <!-- Connector line -->
        <div
          v-if="index < workflow.steps.length - 1"
          class="flex-shrink-0 w-4 h-px"
          :style="{
            backgroundColor: workflow.steps[index + 1]?.status !== 'locked'
              ? 'var(--theme-primary)'
              : 'var(--theme-border)'
          }"
        />
      </template>
    </div>

    <!-- Progress bar -->
    <div class="mt-3 h-1 rounded-full overflow-hidden" :style="{ backgroundColor: 'var(--theme-bg-tertiary)' }">
      <div
        class="h-full rounded-full transition-all duration-500"
        :style="{ width: workflow.progressPercent + '%', backgroundColor: 'var(--theme-primary)' }"
      />
    </div>
  </div>
</template>
