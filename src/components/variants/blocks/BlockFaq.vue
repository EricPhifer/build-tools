<script setup lang="ts">
import { ref } from 'vue'

withDefaults(defineProps<{
  heading?: string
  subheading?: string
  items?: Array<{ question: string; answer: string }>
}>(), {
  heading: 'Frequently Asked Questions',
  subheading: 'Everything you need to know. Can\'t find an answer? Reach out to our team.',
  items: () => [
    { question: 'How long does a typical project take?', answer: 'Most projects are completed within 4–8 weeks depending on scope. We\'ll give you a clear timeline during our initial consultation.' },
    { question: 'What is included in the pricing?', answer: 'All packages include initial consultation, project planning, full implementation, testing, and a 30-day post-launch support period.' },
    { question: 'Do you work with small businesses?', answer: 'Absolutely. We work with businesses of all sizes, from solo founders to established companies. Our packages are designed to scale.' },
    { question: 'Can I make changes after the project is delivered?', answer: 'Yes — we offer ongoing maintenance retainers and ad-hoc change requests. Just get in touch and we\'ll scope the work for you.' },
    { question: 'How do I get started?', answer: 'Simply reach out via our contact form or give us a call. We\'ll schedule a free discovery call to learn about your goals and recommend the best approach.' },
  ]
})

const open = ref<number | null>(null)

function toggle(idx: number) {
  open.value = open.value === idx ? null : idx
}
</script>

<template>
  <section class="py-16 px-6 bg-white @container">
    <div class="max-w-3xl mx-auto">
      <div class="text-center mb-10">
        <h2 class="text-3xl font-bold text-gray-900 mb-3">{{ heading }}</h2>
        <p class="text-gray-500 text-base">{{ subheading }}</p>
      </div>

      <div class="divide-y divide-gray-200 border-y border-gray-200">
        <div v-for="(item, idx) in items" :key="idx">
          <button
            @click="toggle(idx)"
            class="w-full flex items-center justify-between py-5 text-left gap-4"
          >
            <span class="font-medium text-gray-900 text-sm @md:text-base">{{ item.question }}</span>
            <span
              class="shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs transition-transform duration-200"
              :class="open === idx ? 'rotate-45' : ''"
            >+</span>
          </button>
          <div v-if="open === idx" class="pb-5 text-gray-600 text-sm leading-relaxed">
            {{ item.answer }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
