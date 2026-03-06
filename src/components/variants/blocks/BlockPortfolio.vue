<script setup lang="ts">
withDefaults(defineProps<{
  heading?: string
  subheading?: string
  projects?: Array<{ title: string; category: string; description: string; color: string }>
}>(), {
  heading: 'Our Work',
  subheading: 'A selection of projects we\'re proud of. Each one solved a real problem for a real client.',
  projects: () => [
    { title: 'Retail Rebrand', category: 'Branding', description: 'Complete identity overhaul for a mid-size retail chain, resulting in 40% higher brand recall.', color: 'from-violet-400 to-purple-600' },
    { title: 'SaaS Launch', category: 'Strategy', description: 'Go-to-market strategy and execution for a B2B SaaS platform — 800 signups in first month.', color: 'from-blue-400 to-indigo-600' },
    { title: 'E-Commerce Scale', category: 'Implementation', description: 'Migrated and optimised a legacy store, cutting page load by 60% and boosting conversions.', color: 'from-emerald-400 to-teal-600' },
    { title: 'Healthcare Portal', category: 'Consulting', description: 'Patient-facing web portal for a regional health network, serving 50,000+ users monthly.', color: 'from-rose-400 to-pink-600' },
    { title: 'Logistics Dashboard', category: 'Analytics', description: 'Real-time operations dashboard with custom KPIs for a national freight company.', color: 'from-amber-400 to-orange-600' },
    { title: 'Non-Profit Campaign', category: 'Strategy', description: 'Digital fundraising campaign that exceeded the target by 220% in eight weeks.', color: 'from-cyan-400 to-sky-600' },
  ]
})
</script>

<template>
  <section class="py-16 px-6 bg-gray-50 @container">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-3">{{ heading }}</h2>
        <p class="text-gray-500 text-base max-w-2xl mx-auto">{{ subheading }}</p>
      </div>

      <div class="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3 gap-6">
        <div
          v-for="project in projects"
          :key="project.title"
          class="group bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-shadow"
        >
          <!-- Colour placeholder image -->
          <div :class="`bg-gradient-to-br ${project.color} h-40 flex items-end p-4`">
            <span class="text-xs font-semibold text-white/80 bg-black/20 px-2 py-0.5 rounded-full">
              {{ project.category }}
            </span>
          </div>

          <div class="p-5">
            <h3 class="font-bold text-gray-900 mb-2">{{ project.title }}</h3>
            <p class="text-gray-500 text-sm leading-relaxed">{{ project.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
