<script setup lang="ts">
defineProps<{
  showLabels?: boolean
}>()
</script>

<template>
  <div class="min-h-[400px] border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
    <!-- Layout label -->
    <div class="bg-gray-100 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-dashed border-gray-300">
      Full Width Layout
    </div>

    <!-- Content slot -->
    <div class="p-6">
      <slot name="content">
        <div class="space-y-4">
          <div class="h-8 bg-gray-200 rounded w-3/4"></div>
          <div class="h-4 bg-gray-100 rounded w-full"></div>
          <div class="h-4 bg-gray-100 rounded w-5/6"></div>
          <div class="h-4 bg-gray-100 rounded w-2/3"></div>
          <div class="h-32 bg-gray-50 rounded border border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm">
            Content blocks go here
          </div>
          <div class="h-4 bg-gray-100 rounded w-full"></div>
          <div class="h-4 bg-gray-100 rounded w-4/5"></div>
        </div>
      </slot>
    </div>
  </div>
</template>
