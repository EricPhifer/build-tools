<template>
  <div class="min-h-100 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
    <!-- Layout label -->
    <div class="bg-gray-100 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-dashed border-gray-300">
      Two Column Equal Layout
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
      <!-- Left column -->
      <div class="flex-1 border-r border-dashed border-gray-300 p-5">
        <slot name="content">
          <div class="space-y-3">
            <div class="h-6 bg-gray-200 rounded w-3/4"></div>
            <div class="h-3 bg-gray-100 rounded w-full"></div>
            <div class="h-3 bg-gray-100 rounded w-5/6"></div>
            <div class="h-3 bg-gray-100 rounded w-4/5"></div>
            <div class="h-20 bg-gray-50 rounded border border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-400 mt-2">
              Left column
            </div>
          </div>
        </slot>
      </div>

      <!-- Right column -->
      <div class="flex-1 p-5">
        <slot name="right">
          <div class="space-y-3">
            <div class="h-6 bg-gray-200 rounded w-3/4"></div>
            <div class="h-3 bg-gray-100 rounded w-full"></div>
            <div class="h-3 bg-gray-100 rounded w-5/6"></div>
            <div class="h-3 bg-gray-100 rounded w-4/5"></div>
            <div class="h-20 bg-gray-50 rounded border border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-400 mt-2">
              Right column
            </div>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>
