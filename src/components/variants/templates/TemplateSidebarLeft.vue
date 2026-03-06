<script setup lang="ts">
defineProps<{
  showLabels?: boolean
}>()
</script>

<template>
  <div class="min-h-100 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
    <!-- Layout label -->
    <div class="bg-gray-100 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-dashed border-gray-300">
      Sidebar Left Layout
    </div>

    <!-- Full-width header zone -->
    <div class="border-b border-dashed border-gray-300">
      <slot name="header">
        <div class="h-20 bg-gray-700 flex items-center justify-center text-white/40 text-xs m-3 rounded-lg">
          Hero / Full-Width Zone
        </div>
      </slot>
    </div>

    <div class="flex min-h-90">
      <!-- Sidebar -->
      <div class="w-1/4 border-r border-dashed border-gray-300 p-4 bg-gray-50">
        <slot name="sidebar">
          <div class="space-y-3">
            <div class="h-3 bg-gray-200 rounded w-full"></div>
            <div class="h-3 bg-gray-200 rounded w-4/5"></div>
            <div class="h-3 bg-gray-200 rounded w-3/5"></div>
            <div class="border-t border-gray-200 my-3"></div>
            <div class="h-3 bg-gray-200 rounded w-full"></div>
            <div class="h-3 bg-gray-200 rounded w-4/5"></div>
            <div class="h-3 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div class="mt-4 text-xs text-gray-400 text-center">Sidebar</div>
        </slot>
      </div>

      <!-- Content -->
      <div class="flex-1 p-6">
        <slot name="content">
          <div class="space-y-4">
            <div class="h-8 bg-gray-200 rounded w-3/4"></div>
            <div class="h-4 bg-gray-100 rounded w-full"></div>
            <div class="h-4 bg-gray-100 rounded w-5/6"></div>
            <div class="h-32 bg-gray-50 rounded border border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm">
              Content blocks go here
            </div>
            <div class="h-4 bg-gray-100 rounded w-full"></div>
            <div class="h-4 bg-gray-100 rounded w-4/5"></div>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>
