<script setup lang="ts">
import { ref } from 'vue'
import { useSiteContext } from '../../../composables/useSiteContext'

withDefaults(defineProps<{
  heading?: string
  subheading?: string
  address?: string
  phone?: string
  email?: string
  hours?: string
}>(), {
  heading: 'Get In Touch',
  subheading: 'We\'d love to hear from you. Send us a message and we\'ll get back to you as soon as possible.',
  address: '123 Business Street, Suite 100\nYour City, State 10001',
  phone: '+1 (555) 000-0000',
  email: '',
  hours: 'Monday – Friday, 9am – 5pm'
})

const site = useSiteContext()
const form = ref({ name: '', email: '', message: '' })
const sent = ref(false)
function send() { if (form.value.name && form.value.email) sent.value = true }
</script>

<template>
  <section class="py-16 px-6 bg-gray-50 @container">
    <div class="max-w-5xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-3">{{ heading }}</h2>
        <p class="text-gray-500 text-base max-w-xl mx-auto">{{ subheading }}</p>
      </div>

      <div class="grid grid-cols-1 @md:grid-cols-2 gap-10">
        <!-- Contact details -->
        <div class="space-y-6">
          <div>
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Address</p>
            <p class="text-gray-700 text-sm whitespace-pre-line">{{ address }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Phone</p>
            <p class="text-gray-700 text-sm">{{ phone }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Email</p>
            <p class="text-gray-700 text-sm">{{ email || site.contactEmail }}</p>
          </div>
          <div>
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Hours</p>
            <p class="text-gray-700 text-sm">{{ hours }}</p>
          </div>

          <!-- Map placeholder -->
          <div class="h-36 rounded-xl bg-gray-200 flex items-center justify-center text-gray-400 text-sm mt-2">
            📍 Map
          </div>
        </div>

        <!-- Contact form -->
        <div v-if="!sent" class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Name</label>
            <input v-model="form.name" type="text" placeholder="Your name" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input v-model="form.email" type="email" placeholder="your@email.com" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Message</label>
            <textarea v-model="form.message" rows="4" placeholder="How can we help?" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 resize-none" />
          </div>
          <button
            @click="send"
            class="w-full py-3 text-white font-semibold rounded-xl text-sm transition-colors"
            :style="{ backgroundColor: site.primaryColor }"
          >
            Send Message
          </button>
        </div>

        <div v-else class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-center">
          <div class="text-center">
            <div class="text-4xl mb-3">✅</div>
            <p class="font-semibold text-gray-900 mb-1">Message sent!</p>
            <p class="text-gray-500 text-sm">We'll be in touch shortly.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
