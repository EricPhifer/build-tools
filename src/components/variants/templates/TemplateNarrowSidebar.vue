<template>
  <div class="min-h-100 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
    <!-- Layout label -->
    <div class="bg-gray-100 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-dashed border-gray-300">
      Narrow + Sidebar Layout
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
      <!-- Narrow main content -->
      <div class="flex-1 p-6">
        <div class="max-w-lg">
          <slot name="content">
            <div class="space-y-3">
              <div class="h-7 bg-gray-200 rounded w-3/4"></div>
              <div class="h-3 bg-gray-100 rounded w-full"></div>
              <div class="h-3 bg-gray-100 rounded w-11/12"></div>
              <div class="h-3 bg-gray-100 rounded w-4/5"></div>
              <div class="h-3 bg-gray-100 rounded w-full"></div>
              <div class="h-3 bg-gray-100 rounded w-3/4"></div>
              <div class="h-20 bg-gray-50 rounded border border-dashed border-gray-200 flex items-center justify-center text-xs text-gray-400 mt-2">
                Narrow article content
              </div>
            </div>
          </slot>
        </div>
      </div>

      <!-- Right sidebar -->
      <div class="w-56 border-l border-dashed border-gray-300 p-4 bg-gray-50">
        <slot name="sidebar">
          <div class="space-y-2.5">
            <div class="h-3 bg-gray-300 rounded w-full"></div>
            <div class="h-3 bg-gray-200 rounded w-4/5"></div>
            <div class="h-3 bg-gray-200 rounded w-3/5"></div>
            <div class="border-t border-gray-200 my-2"></div>
            <div class="h-12 bg-gray-200 rounded w-full"></div>
            <div class="h-3 bg-gray-100 rounded w-full"></div>
            <div class="h-3 bg-gray-100 rounded w-4/5"></div>
            <div class="border-t border-gray-200 my-2"></div>
            <div class="h-3 bg-gray-200 rounded w-full"></div>
            <div class="h-3 bg-gray-200 rounded w-3/5"></div>
          </div>
          <div class="mt-4 text-xs text-gray-400 text-center">Related / TOC</div>
        </slot>
      </div>
    </div>
  </div>
</template>
