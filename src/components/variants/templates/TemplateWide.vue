<template>
  <div class="min-h-[400px] border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
    <!-- Layout label -->
    <div class="bg-gray-100 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-dashed border-gray-300">
      Wide / Full Bleed Layout
    </div>

    <!-- No padding — edge-to-edge -->
    <div>
      <slot name="content">
        <div class="space-y-2 p-4">
          <div class="h-24 bg-gray-200 rounded-sm w-full"></div>
          <div class="h-16 bg-gray-100 rounded-sm w-full"></div>
          <div class="h-16 bg-gray-100 rounded-sm w-full"></div>
          <div class="h-16 bg-gray-50 rounded-sm w-full flex items-center justify-center text-xs text-gray-400">
            Edge-to-edge full-bleed sections
          </div>
        </div>
      </slot>
    </div>
  </div>
</template>
