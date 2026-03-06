<template>
  <div class="min-h-[400px] border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
    <!-- Layout label -->
    <div class="bg-gray-100 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-dashed border-gray-300">
      Narrow / Article Layout
    </div>

    <!-- Narrow centered column -->
    <div class="py-6">
      <div class="max-w-2xl mx-auto px-6">
        <slot name="content">
          <div class="space-y-4">
            <div class="h-7 bg-gray-200 rounded w-2/3"></div>
            <div class="h-3 bg-gray-100 rounded w-full"></div>
            <div class="h-3 bg-gray-100 rounded w-11/12"></div>
            <div class="h-3 bg-gray-100 rounded w-4/5"></div>
            <div class="h-3 bg-gray-100 rounded w-full"></div>
            <div class="h-3 bg-gray-100 rounded w-3/4"></div>
            <div class="h-3 bg-gray-100 rounded w-full"></div>
            <div class="h-3 bg-gray-100 rounded w-5/6"></div>
            <div class="mt-2 text-center text-xs text-gray-400">Narrow prose column</div>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>
