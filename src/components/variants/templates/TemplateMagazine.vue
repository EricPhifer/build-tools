<template>
  <div class="min-h-[400px] border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
    <!-- Layout label -->
    <div class="bg-gray-100 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-dashed border-gray-300">
      Magazine / Featured Layout
    </div>

    <!-- Featured full-width zone -->
    <div class="border-b border-dashed border-gray-300">
      <slot name="featured">
        <div class="h-24 bg-gray-300 flex items-center justify-center text-gray-500 text-xs m-3 rounded-lg">
          Featured / Hero Block
        </div>
      </slot>
    </div>

    <!-- Two-column content grid -->
    <div class="flex min-h-[240px]">
      <!-- Primary content -->
      <div class="flex-[2] border-r border-dashed border-gray-300 p-4">
        <slot name="content">
          <div class="space-y-3">
            <div class="h-5 bg-gray-200 rounded w-3/4"></div>
            <div class="h-3 bg-gray-100 rounded w-full"></div>
            <div class="h-3 bg-gray-100 rounded w-5/6"></div>
            <div class="h-3 bg-gray-100 rounded w-4/5"></div>
            <div class="h-3 bg-gray-100 rounded w-full"></div>
            <div class="h-3 bg-gray-100 rounded w-2/3"></div>
          </div>
          <div class="mt-3 text-xs text-gray-400">Primary (2/3)</div>
        </slot>
      </div>

      <!-- Secondary column -->
      <div class="flex-1 p-4 bg-gray-50">
        <slot name="secondary">
          <div class="space-y-2.5">
            <div class="h-16 bg-gray-200 rounded w-full"></div>
            <div class="h-3 bg-gray-100 rounded w-full"></div>
            <div class="h-3 bg-gray-100 rounded w-4/5"></div>
            <div class="border-t border-gray-200 my-2"></div>
            <div class="h-16 bg-gray-200 rounded w-full"></div>
            <div class="h-3 bg-gray-100 rounded w-full"></div>
          </div>
          <div class="mt-3 text-xs text-gray-400">Secondary (1/3)</div>
        </slot>
      </div>
    </div>
  </div>
</template>
