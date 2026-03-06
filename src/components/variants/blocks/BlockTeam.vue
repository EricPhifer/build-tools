<script setup lang="ts">
import { useSiteContext } from '../../../composables/useSiteContext'

withDefaults(defineProps<{
  heading?: string
  subheading?: string
  members?: Array<{ name: string; role: string; bio?: string; initials?: string; color?: string }>
}>(), {
  heading: 'Meet Our Team',
  subheading: 'The passionate people behind the work.',
  members: () => [
    { name: 'Alex Rivera', role: 'Founder & CEO', bio: 'Visionary leader with 15 years building companies from the ground up.', initials: 'AR', color: 'bg-violet-100 text-violet-600' },
    { name: 'Jordan Lee', role: 'Head of Strategy', bio: 'Data-driven strategist who turns complex challenges into clear roadmaps.', initials: 'JL', color: 'bg-sky-100 text-sky-600' },
    { name: 'Morgan Chen', role: 'Lead Designer', bio: 'Crafts experiences that are beautiful, intuitive, and built to convert.', initials: 'MC', color: 'bg-emerald-100 text-emerald-600' },
    { name: 'Taylor Brooks', role: 'Client Success', bio: 'Dedicated to making sure every client achieves their goals and more.', initials: 'TB', color: 'bg-rose-100 text-rose-600' },
  ]
})

const site = useSiteContext()
</script>

<template>
  <section class="py-16 px-6 bg-gray-50 @container">
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-3">{{ heading }}</h2>
        <p class="text-gray-500 text-base max-w-xl mx-auto">{{ subheading }}</p>
      </div>

      <div class="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-4 gap-6">
        <div
          v-for="member in members"
          :key="member.name"
          class="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm"
        >
          <!-- Avatar (uses per-member color if set, otherwise brand primary) -->
          <div
            class="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4"
            :class="member.color"
          >
            {{ member.initials ?? member.name.charAt(0) }}
          </div>
          <h3 class="font-semibold text-gray-900 mb-1">{{ member.name }}</h3>
          <p class="text-sm font-medium mb-3" :style="{ color: site.primaryColor }">{{ member.role }}</p>
          <p v-if="member.bio" class="text-gray-500 text-xs leading-relaxed">{{ member.bio }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
