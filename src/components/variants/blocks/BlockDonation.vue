<script setup lang="ts">
import { computed, ref } from 'vue'
import { Lock } from 'lucide-vue-next'
import { useSiteContext } from '../../../composables/useSiteContext'

withDefaults(defineProps<{
  heading?: string
  intro?: string
}>(), {
  heading: 'Support Our Work',
  intro: 'Your gift keeps our programs running.'
})

const site = useSiteContext()
const amounts = [25, 50, 100, 250]
const choice = ref<number | 'other'>(50)
const monthly = ref(false)
const label = computed(() => {
  const amount = choice.value === 'other' ? '' : ` $${choice.value}`
  return monthly.value ? `Give${amount} monthly` : `Give${amount}`
})
const pill = (on: boolean) => on
  ? { backgroundColor: site.primaryColor, borderColor: site.primaryColor, color: '#fff' }
  : { backgroundColor: '#fff', borderColor: '#e5e7eb', color: '#111827' }
</script>

<template>
  <section class="py-16 px-6 bg-gray-50">
    <div class="max-w-xl mx-auto">
      <h2 class="text-3xl font-bold text-gray-900 text-center">{{ heading }}</h2>
      <p class="text-gray-600 text-center mt-3">{{ intro }}</p>

      <div class="grid grid-cols-2 gap-2 mt-8 mb-5">
        <button v-for="m in [false, true]" :key="String(m)" type="button" class="rounded-lg border px-4 py-2.5 font-semibold text-sm" :style="pill(monthly === m)" @click="monthly = m">
          {{ m ? 'Monthly' : 'One-time' }}
        </button>
      </div>

      <p class="text-sm font-semibold text-gray-900 mb-2">Amount</p>
      <div class="grid grid-cols-4 gap-2">
        <button v-for="n in amounts" :key="n" type="button" class="rounded-lg border px-4 py-2.5 font-semibold text-sm" :style="pill(choice === n)" @click="choice = n">${{ n }}</button>
        <button type="button" class="col-span-4 rounded-lg border px-4 py-2.5 font-semibold text-sm" :style="pill(choice === 'other')" @click="choice = 'other'">Other amount</button>
      </div>

      <button type="button" class="w-full mt-6 rounded-lg px-6 py-3 font-semibold text-white" :style="{ backgroundColor: site.primaryColor }">{{ label }}</button>
      <p class="mt-3 flex items-center justify-center gap-1.5 text-sm text-gray-500">
        <Lock class="w-3.5 h-3.5" /> Secure payment by Stripe. You'll get a receipt by email.
      </p>
    </div>
  </section>
</template>
