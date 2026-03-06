<script setup lang="ts">
withDefaults(defineProps<{
  heading?: string
  logos?: Array<{ name: string }>
}>(), {
  heading: 'Trusted by leading companies',
  logos: () => [
    { name: 'Acme Corp' },
    { name: 'Stellar Inc' },
    { name: 'Nexus Group' },
    { name: 'Brightline' },
    { name: 'Apex Ltd' },
    { name: 'Orbit Co' },
  ]
})
</script>

<template>
  <section class="py-10 px-6 bg-white border-y border-gray-100">
    <div class="max-w-5xl mx-auto">
      <p class="text-center text-sm font-medium text-gray-400 uppercase tracking-widest mb-8">{{ heading }}</p>

      <div class="flex flex-wrap items-center justify-center gap-6 md:gap-10">
        <div
          v-for="logo in logos"
          :key="logo.name"
          class="px-6 py-3 rounded-lg bg-gray-50 border border-gray-100"
        >
          <span class="text-sm font-semibold text-gray-300 tracking-wide">{{ logo.name }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
