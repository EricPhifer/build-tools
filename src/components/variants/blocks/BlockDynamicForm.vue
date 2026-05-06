<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  active?: boolean
}>(), {
  title: 'Volunteer Application',
  active: true
})
</script>

<template>
  <section class="py-16 px-6 bg-white">
    <div class="max-w-2xl mx-auto">
      <div class="rounded-lg overflow-hidden shadow-md relative" :class="{ 'opacity-60': !active }">
        <div class="p-4 text-white" :style="{ backgroundColor: 'var(--color-primary)' }">
          <h2 class="text-xl font-bold">{{ title }}</h2>
        </div>
        <div class="bg-white p-6 border-x border-b border-gray-200 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name <span class="text-red-500">*</span></label>
            <input type="text" disabled class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email <span class="text-red-500">*</span></label>
            <input type="email" disabled class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" disabled class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Departments of interest</label>
            <div class="space-y-1">
              <label class="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" disabled /> Mentorship
              </label>
              <label class="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" disabled /> Events
              </label>
              <label class="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" disabled /> Administrative
              </label>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tell us about yourself</label>
            <textarea rows="3" disabled class="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50" />
          </div>
          <button
            type="button"
            disabled
            class="w-full py-3 rounded-full text-white font-semibold transition-opacity"
            :style="{ backgroundColor: 'var(--color-primary)' }"
          >Submit</button>
        </div>
        <div v-if="!active" class="absolute inset-0 flex items-center justify-center bg-white/80">
          <span class="text-lg font-semibold text-gray-700">Form is currently closed</span>
        </div>
      </div>
    </div>
  </section>
</template>
