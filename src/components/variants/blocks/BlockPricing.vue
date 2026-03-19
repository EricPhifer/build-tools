<script setup lang="ts">
import { useSiteContext } from '../../../composables/useSiteContext'

withDefaults(defineProps<{
  heading?: string
  subheading?: string
  tiers?: Array<{ name: string; price: string; period?: string; description: string; features: string[]; cta: string; highlighted?: boolean }>
}>(), {
  heading: 'Simple, Transparent Pricing',
  subheading: 'No hidden fees. Choose the plan that fits your needs and scale as you grow.',
  tiers: () => [
    {
      name: 'Starter',
      price: '$999',
      period: 'one-time',
      description: 'Everything you need to launch your online presence.',
      features: ['Up to 5 pages', 'Mobile responsive', 'Contact form', 'Basic SEO setup', '30-day support'],
      cta: 'Get Started'
    },
    {
      name: 'Growth',
      price: '$2,499',
      period: 'one-time',
      description: 'Advanced features for businesses ready to scale.',
      features: ['Up to 15 pages', 'CMS integration', 'Blog or news section', 'Analytics setup', 'Email integration', '90-day support'],
      cta: 'Get Started',
      highlighted: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'Fully tailored solutions for complex requirements.',
      features: ['Unlimited pages', 'Custom integrations', 'Advanced automation', 'Dedicated account manager', 'Priority support'],
      cta: 'Contact Us'
    }
  ]
})

const site = useSiteContext()
</script>

<template>
  <section class="py-16 px-6 bg-white @container">
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-3">{{ heading }}</h2>
        <p class="text-gray-500 text-base max-w-xl mx-auto">{{ subheading }}</p>
      </div>

      <div class="grid grid-cols-1 @md:grid-cols-3 gap-6 items-start">
        <div
          v-for="tier in tiers"
          :key="tier.name"
          class="rounded-2xl border p-8 flex flex-col"
          :class="tier.highlighted ? 'text-white shadow-xl scale-105' : 'bg-white border-gray-200'"
          :style="tier.highlighted ? { backgroundColor: site.primaryColor, borderColor: site.primaryColor } : {}"
        >
          <!-- Popular badge -->
          <div v-if="tier.highlighted" class="text-xs font-bold uppercase tracking-widest text-white/70 mb-3">Most Popular</div>

          <h3 class="text-xl font-bold mb-1" :class="tier.highlighted ? 'text-white' : 'text-gray-900'">{{ tier.name }}</h3>
          <p class="text-sm mb-4" :class="tier.highlighted ? 'text-white/70' : 'text-gray-500'">{{ tier.description }}</p>

          <div class="mb-6">
            <span class="text-4xl font-extrabold" :class="tier.highlighted ? 'text-white' : 'text-gray-900'">{{ tier.price }}</span>
            <span v-if="tier.period" class="text-sm ml-1" :class="tier.highlighted ? 'text-white/60' : 'text-gray-400'">{{ tier.period }}</span>
          </div>

          <ul class="space-y-3 mb-8 flex-1">
            <li v-for="feature in tier.features" :key="feature" class="flex items-start gap-2 text-sm">
              <span :style="tier.highlighted ? { color: 'rgba(255,255,255,0.65)' } : { color: site.primaryColor }">✓</span>
              <span :class="tier.highlighted ? 'text-white/80' : 'text-gray-700'">{{ feature }}</span>
            </li>
          </ul>

          <a
            href="#"
            class="block text-center py-3 rounded-xl font-semibold text-sm transition-colors"
            :class="tier.highlighted ? 'bg-white hover:bg-gray-50' : 'text-white'"
            :style="tier.highlighted ? { color: site.primaryColor } : { backgroundColor: site.primaryColor }"
          >{{ tier.cta }}</a>
        </div>
      </div>
    </div>
  </section>
</template>
