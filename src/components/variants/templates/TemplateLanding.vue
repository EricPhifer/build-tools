<template>
  <div class="min-h-[400px] border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
    <!-- Layout label -->
    <div class="bg-gray-100 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-dashed border-gray-300">
      Landing / Conversion Layout
    </div>

    <!-- Full-width sections, no max-width constraints -->
    <div>
      <slot name="content">
        <!-- Hero zone -->
        <div class="h-28 bg-gray-700 flex items-center justify-center text-white/60 text-xs m-3 rounded-lg">
          Hero Zone
        </div>
        <!-- Feature sections -->
        <div class="space-y-2 px-3 pb-3">
          <div class="h-14 bg-gray-200 rounded w-full flex items-center justify-center text-xs text-gray-400">
            Full-width section
          </div>
          <div class="h-14 bg-gray-100 rounded w-full flex items-center justify-center text-xs text-gray-400">
            Full-width section
          </div>
          <!-- CTA zone -->
          <div class="h-14 bg-gray-600 rounded w-full flex items-center justify-center text-white/60 text-xs">
            CTA Zone
          </div>
        </div>
      </slot>
    </div>
  </div>
</template>
