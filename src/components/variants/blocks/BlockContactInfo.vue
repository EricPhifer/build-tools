<script setup lang="ts">
import { ref } from 'vue'
import { useSiteContext } from '../../../composables/useSiteContext'

withDefaults(defineProps<{
  introText?: string
  email?: string
  phone?: string
  showPhone?: boolean
  responseTime?: string
  preferenceNotes?: string
}>(), {
  introText: 'No sales pitch, just an honest conversation about what your business needs and whether we\'re the right fit.',
  email: '',
  phone: '',
  showPhone: true,
  responseTime: 'We typically respond within 1 business day',
  preferenceNotes: ''
})

const site = useSiteContext()
const form = ref({ name: '', email: '', message: '' })
const sent = ref(false)
function send() { if (form.value.name && form.value.email && form.value.message) sent.value = true }
</script>

<template>
  <section class="py-16 px-6 bg-white @container">
    <div class="max-w-5xl mx-auto">
      <div class="grid grid-cols-1 @md:grid-cols-2 gap-12">
        <!-- Left column — contact details -->
        <div class="space-y-6">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 mb-4 leading-tight">Let's Talk</h2>
            <p class="text-gray-600 text-base leading-relaxed">{{ introText }}</p>
          </div>

          <!-- Email -->
          <div>
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Email</p>
            <a
              :href="`mailto:${email || site.contactEmail}`"
              class="text-sm font-medium transition-colors hover:underline"
              :style="{ color: site.primaryColor }"
            >{{ email || site.contactEmail }}</a>
          </div>

          <!-- Phone (optional) -->
          <div v-if="showPhone && phone">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Phone</p>
            <a
              :href="`tel:${phone.replace(/\D/g, '')}`"
              class="text-sm font-medium text-gray-700 hover:underline"
            >{{ phone }}</a>
          </div>

          <!-- Response time -->
          <div v-if="responseTime" class="flex items-start gap-2.5 rounded-xl bg-gray-50 border border-gray-100 p-4">
            <span class="text-lg leading-none mt-0.5">⏱</span>
            <p class="text-sm text-gray-600">{{ responseTime }}</p>
          </div>

          <!-- Preference notes -->
          <p v-if="preferenceNotes" class="text-sm text-gray-500 italic">{{ preferenceNotes }}</p>
        </div>

        <!-- Right column — contact form -->
        <div v-if="!sent" class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">Send a Message</h3>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Full Name <span class="text-red-400">*</span></label>
            <input v-model="form.name" type="text" placeholder="Your name" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Email <span class="text-red-400">*</span></label>
            <input v-model="form.email" type="email" placeholder="your@email.com" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-600 mb-1">Message <span class="text-red-400">*</span></label>
            <textarea v-model="form.message" rows="4" placeholder="How can we help?" class="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 resize-none" />
          </div>
          <button
            @click="send"
            class="w-full py-3 text-white font-semibold rounded-xl text-sm transition-colors"
            :style="{ backgroundColor: site.primaryColor }"
          >Send Message</button>
        </div>

        <!-- Success state -->
        <div v-else class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-center min-h-70">
          <div class="text-center">
            <div class="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" :style="{ backgroundColor: site.primaryColor + '1a' }">
              <span class="text-xl">&#10003;</span>
            </div>
            <p class="font-semibold text-gray-900 mb-1">Message sent!</p>
            <p class="text-gray-500 text-sm">We'll be in touch shortly.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
