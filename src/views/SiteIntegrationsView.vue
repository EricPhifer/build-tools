<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, Database, Mail, Send, Lock, Youtube, CreditCard, HeartHandshake } from 'lucide-vue-next'
import { useCompositionStore } from '../stores/composition'
import { useWorkflowStore } from '../stores/workflow'

const router = useRouter()
const composition = useCompositionStore()
const workflow = useWorkflowStore()

workflow.goToStep('site')

const env = computed(() => composition.siteBuilder.envConfig)
const bundle = computed(() => composition.siteBuilder.bundle)
const businessType = computed(() => composition.siteBuilder.businessType)
const isNonprofit = computed(() => businessType.value === 'nonprofit')

// Helper: bind a single field via setEnvConfig
function update(key: keyof typeof env.value, val: string | unknown) {
  composition.setEnvConfig({ [key]: val } as Partial<typeof env.value>)
}

const inputClass = 'w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 font-mono'
const inputStyle = {
  backgroundColor: 'var(--theme-bg-secondary)',
  borderColor: 'var(--theme-border)',
  color: 'var(--theme-text-primary)',
  '--tw-ring-color': 'var(--theme-primary)'
} as Record<string, string>

function back() {
  router.push('/site')
}
function next() {
  router.push('/site/checklist')
}
</script>

<template>
  <div class="p-6 lg:p-8 max-w-4xl">
    <button
      @click="back"
      class="flex items-center gap-1.5 text-sm mb-6 transition-colors"
      :style="{ color: 'var(--theme-text-secondary)' }"
    >
      <ArrowLeft class="w-4 h-4" />
      Back to Site Builder
    </button>

    <div class="mb-8">
      <p class="text-xs font-semibold uppercase tracking-widest mb-1" :style="{ color: 'var(--theme-primary)' }">Step 2 · Integrations</p>
      <h1 class="text-2xl font-bold" :style="{ color: 'var(--theme-text-primary)' }">Growth-tier Integrations</h1>
      <p class="text-sm mt-1" :style="{ color: 'var(--theme-text-muted)' }">
        Configure the third-party services this Growth client uses. All fields optional — fill what you have, add the rest in Netlify env vars later.
      </p>
    </div>

    <div v-if="bundle !== 'growth'"
      class="rounded-lg p-6 text-center"
      :style="{ backgroundColor: 'var(--theme-warning-light)', color: 'var(--theme-warning)' }">
      <p class="text-sm font-medium">This step is only relevant for Growth-tier projects. Current bundle: <strong>{{ bundle ?? 'not set' }}</strong>.</p>
      <button
        @click="router.push('/site/bundle')"
        class="text-xs mt-3 px-3 py-1.5 rounded-lg font-medium"
        :style="{ backgroundColor: 'var(--theme-warning)', color: 'var(--theme-text-inverse)' }"
      >Change Bundle</button>
    </div>

    <div v-else class="space-y-6">
      <!-- Resend -->
      <section class="p-5 rounded-xl border" :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }">
        <header class="flex items-center gap-2 mb-1">
          <Mail class="w-4 h-4" :style="{ color: 'var(--theme-primary)' }" />
          <h2 class="text-base font-semibold" :style="{ color: 'var(--theme-text-primary)' }">Resend</h2>
        </header>
        <p class="text-xs mb-4" :style="{ color: 'var(--theme-text-muted)' }">
          Used to send form notifications. Get your API key at <a href="https://resend.com/api-keys" target="_blank" rel="noopener" class="underline">resend.com/api-keys</a>.
        </p>
        <div class="grid md:grid-cols-2 gap-3">
          <label>
            <span class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">API Key <span class="font-mono opacity-60">RESEND_API_KEY</span></span>
            <input :value="env.resendApiKey" @input="update('resendApiKey', ($event.target as HTMLInputElement).value)" type="text" placeholder="re_xxxx" :class="inputClass" :style="inputStyle" />
          </label>
          <label>
            <span class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">Contact-to email <span class="font-mono opacity-60">CONTACT_TO_EMAIL</span></span>
            <input :value="env.contactToEmail" @input="update('contactToEmail', ($event.target as HTMLInputElement).value)" type="email" placeholder="staff@client.org" :class="inputClass" :style="inputStyle" />
          </label>
        </div>
      </section>

      <!-- Sanity Write -->
      <section class="p-5 rounded-xl border" :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }">
        <header class="flex items-center gap-2 mb-1">
          <Lock class="w-4 h-4" :style="{ color: 'var(--theme-primary)' }" />
          <h2 class="text-base font-semibold" :style="{ color: 'var(--theme-text-primary)' }">Sanity (Write Token)</h2>
        </header>
        <p class="text-xs mb-4" :style="{ color: 'var(--theme-text-muted)' }">
          Editor-role token for sync functions (e.g. sync-coffee-chat). Generate in Sanity Studio → API → Tokens.
        </p>
        <label>
          <span class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">Write Token <span class="font-mono opacity-60">SANITY_WRITE_TOKEN</span></span>
          <input :value="env.sanityWriteToken" @input="update('sanityWriteToken', ($event.target as HTMLInputElement).value)" type="text" placeholder="sk..." :class="inputClass" :style="inputStyle" />
        </label>
      </section>

      <!-- Turso -->
      <section class="p-5 rounded-xl border" :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }">
        <header class="flex items-center gap-2 mb-1">
          <Database class="w-4 h-4" :style="{ color: 'var(--theme-primary)' }" />
          <h2 class="text-base font-semibold" :style="{ color: 'var(--theme-text-primary)' }">Turso</h2>
        </header>
        <p class="text-xs mb-4" :style="{ color: 'var(--theme-text-muted)' }">
          Provision via <code class="font-mono px-1 rounded" :style="{ backgroundColor: 'var(--theme-bg-secondary)' }">turso db create [client-slug]</code> in your terminal.
        </p>
        <div class="grid md:grid-cols-2 gap-3">
          <label>
            <span class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">Database URL <span class="font-mono opacity-60">TURSO_DATABASE_URL</span></span>
            <input :value="env.tursoDatabaseUrl" @input="update('tursoDatabaseUrl', ($event.target as HTMLInputElement).value)" type="text" placeholder="libsql://..." :class="inputClass" :style="inputStyle" />
          </label>
          <label>
            <span class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">Auth Token <span class="font-mono opacity-60">TURSO_AUTH_TOKEN</span></span>
            <input :value="env.tursoAuthToken" @input="update('tursoAuthToken', ($event.target as HTMLInputElement).value)" type="text" placeholder="eyJ..." :class="inputClass" :style="inputStyle" />
          </label>
        </div>
      </section>

      <!-- AWeber -->
      <section class="p-5 rounded-xl border" :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }">
        <header class="flex items-center gap-2 mb-1">
          <Send class="w-4 h-4" :style="{ color: 'var(--theme-primary)' }" />
          <h2 class="text-base font-semibold" :style="{ color: 'var(--theme-text-primary)' }">AWeber</h2>
        </header>
        <p class="text-xs mb-4" :style="{ color: 'var(--theme-text-muted)' }">
          OAuth credentials from <a href="https://labs.aweber.com" target="_blank" rel="noopener" class="underline">labs.aweber.com → My Apps</a>.
        </p>
        <div class="grid md:grid-cols-2 gap-3">
          <label>
            <span class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">Client ID <span class="font-mono opacity-60">AWEBER_CLIENT_ID</span></span>
            <input :value="env.aweberClientId" @input="update('aweberClientId', ($event.target as HTMLInputElement).value)" type="text" :class="inputClass" :style="inputStyle" />
          </label>
          <label>
            <span class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">Client Secret <span class="font-mono opacity-60">AWEBER_CLIENT_SECRET</span></span>
            <input :value="env.aweberClientSecret" @input="update('aweberClientSecret', ($event.target as HTMLInputElement).value)" type="text" :class="inputClass" :style="inputStyle" />
          </label>
          <label>
            <span class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">Account ID <span class="font-mono opacity-60">AWEBER_ACCOUNT_ID</span></span>
            <input :value="env.aweberAccountId" @input="update('aweberAccountId', ($event.target as HTMLInputElement).value)" type="text" :class="inputClass" :style="inputStyle" />
          </label>
          <label>
            <span class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">List ID <span class="font-mono opacity-60">AWEBER_LIST_ID</span></span>
            <input :value="env.aweberListId" @input="update('aweberListId', ($event.target as HTMLInputElement).value)" type="text" :class="inputClass" :style="inputStyle" />
          </label>
        </div>
      </section>

      <!-- Donation Provider -->
      <section class="p-5 rounded-xl border" :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }">
        <header class="flex items-center gap-2 mb-1">
          <HeartHandshake class="w-4 h-4" :style="{ color: 'var(--theme-primary)' }" />
          <h2 class="text-base font-semibold" :style="{ color: 'var(--theme-text-primary)' }">Donation Provider</h2>
        </header>
        <p class="text-xs mb-4" :style="{ color: 'var(--theme-text-muted)' }">
          Switch to Stripe after live keys are activated and recurring donors have migrated.
        </p>
        <div class="space-y-3">
          <div class="flex gap-4">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" :checked="env.donationProvider === 'harness'" @change="update('donationProvider', 'harness')" />
              <span class="text-sm" :style="{ color: 'var(--theme-text-primary)' }">Harness Giving (Phase 1)</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="radio" :checked="env.donationProvider === 'stripe'" @change="update('donationProvider', 'stripe')" />
              <span class="text-sm" :style="{ color: 'var(--theme-text-primary)' }">Stripe Checkout (Phase 2)</span>
            </label>
          </div>
          <label v-if="env.donationProvider === 'harness'">
            <span class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">Harness Giving URL <span class="font-mono opacity-60">VITE_HARNESS_GIVING_URL</span></span>
            <input :value="env.harnessGivingUrl" @input="update('harnessGivingUrl', ($event.target as HTMLInputElement).value)" type="url" placeholder="https://givebutter.com/..." :class="inputClass" :style="inputStyle" />
          </label>
        </div>
      </section>

      <!-- Stripe (collapsed for Phase 2) -->
      <section class="p-5 rounded-xl border" :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }">
        <header class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-2">
            <CreditCard class="w-4 h-4" :style="{ color: 'var(--theme-primary)' }" />
            <h2 class="text-base font-semibold" :style="{ color: 'var(--theme-text-primary)' }">Stripe</h2>
          </div>
          <span class="text-xs px-2 py-0.5 rounded" :style="{ backgroundColor: 'var(--theme-warning-light)', color: 'var(--theme-warning)' }">Activated in Phase 2</span>
        </header>
        <p class="text-xs mb-4" :style="{ color: 'var(--theme-text-muted)' }">
          Required when Donation Provider switches to Stripe.
        </p>
        <div class="grid md:grid-cols-2 gap-3">
          <label>
            <span class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">Secret Key <span class="font-mono opacity-60">STRIPE_SECRET_KEY</span></span>
            <input :value="env.stripeSecretKey" @input="update('stripeSecretKey', ($event.target as HTMLInputElement).value)" type="text" placeholder="sk_live_..." :class="inputClass" :style="inputStyle" />
          </label>
          <label>
            <span class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">Webhook Secret <span class="font-mono opacity-60">STRIPE_WEBHOOK_SECRET</span></span>
            <input :value="env.stripeWebhookSecret" @input="update('stripeWebhookSecret', ($event.target as HTMLInputElement).value)" type="text" placeholder="whsec_..." :class="inputClass" :style="inputStyle" />
          </label>
        </div>
      </section>

      <!-- YouTube — Coffee Chat (nonprofit only) -->
      <section v-if="isNonprofit" class="p-5 rounded-xl border" :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }">
        <header class="flex items-center gap-2 mb-1">
          <Youtube class="w-4 h-4" :style="{ color: 'var(--theme-primary)' }" />
          <h2 class="text-base font-semibold" :style="{ color: 'var(--theme-text-primary)' }">YouTube — Coffee Chat</h2>
        </header>
        <p class="text-xs mb-4" :style="{ color: 'var(--theme-text-muted)' }">
          Get a Data API v3 key at <a href="https://console.cloud.google.com" target="_blank" rel="noopener" class="underline">console.cloud.google.com</a>. Playlist ID is the part after <code>?list=</code> in the YouTube URL.
        </p>
        <div class="grid md:grid-cols-2 gap-3">
          <label>
            <span class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">YouTube API Key <span class="font-mono opacity-60">YOUTUBE_API_KEY</span></span>
            <input :value="env.youtubeApiKey" @input="update('youtubeApiKey', ($event.target as HTMLInputElement).value)" type="text" :class="inputClass" :style="inputStyle" />
          </label>
          <label>
            <span class="block text-xs font-medium mb-1.5" :style="{ color: 'var(--theme-text-secondary)' }">Coffee Chat Playlist ID <span class="font-mono opacity-60">COFFEE_CHAT_PLAYLIST_ID</span></span>
            <input :value="env.coffeeChatPlaylistId" @input="update('coffeeChatPlaylistId', ($event.target as HTMLInputElement).value)" type="text" placeholder="PLxxxxx" :class="inputClass" :style="inputStyle" />
          </label>
        </div>
      </section>
    </div>

    <!-- Continue -->
    <div class="flex justify-end mt-8">
      <button
        @click="next"
        class="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        :style="{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
      >
        Continue
        <ArrowRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
