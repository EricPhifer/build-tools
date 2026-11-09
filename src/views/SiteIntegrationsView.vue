<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, Database, Mail, Send, Lock, Youtube, HeartHandshake, Copy, Check } from 'lucide-vue-next'
import { useCompositionStore, type EnvConfig } from '../stores/composition'
import { useWorkflowStore } from '../stores/workflow'
import IntegrationSection from '../components/IntegrationSection.vue'

const router = useRouter()
const composition = useCompositionStore()
const workflow = useWorkflowStore()

workflow.goToStep('site')

const env = computed(() => composition.siteBuilder.envConfig)
const bundle = computed(() => composition.siteBuilder.bundle)
const businessType = computed(() => composition.siteBuilder.businessType)
const isNonprofit = computed(() => businessType.value === 'nonprofit')
const isGrowth = computed(() => bundle.value === 'growth')

function update(key: keyof EnvConfig, val: string) {
  composition.setEnvConfig({ [key]: val } as Partial<EnvConfig>)
}

// Stripe webhook settings, exactly as Stripe asks for them
const domain = computed(() => workflow.clientInfo?.domain || '<domain>')
const webhookUrl = computed(() => `https://${domain.value}/api/donation-webhook`)
const WEBHOOK_EVENTS = ['checkout.session.completed', 'checkout.session.async_payment_succeeded', 'invoice.paid']

const copied = ref<string | null>(null)
function copy(key: string, text: string) {
  navigator.clipboard.writeText(text).then(() => {
    copied.value = key
    setTimeout(() => { if (copied.value === key) copied.value = null }, 1500)
  }).catch(() => {})
}

const inputClass = 'w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 font-mono'
const inputStyle = {
  backgroundColor: 'var(--theme-bg-secondary)',
  borderColor: 'var(--theme-border)',
  color: 'var(--theme-text-primary)',
  '--tw-ring-color': 'var(--theme-primary)'
} as Record<string, string>
const labelStyle = { color: 'var(--theme-text-secondary)' }
const hintStyle = { color: 'var(--theme-text-muted)' }

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
      <h1 class="text-2xl font-bold" :style="{ color: 'var(--theme-text-primary)' }">Integrations</h1>
      <p class="text-sm mt-1" :style="{ color: 'var(--theme-text-muted)' }">
        Third-party services this site uses: the Growth services, and donations on any tier.
        <strong>Nothing here is needed to continue or to build.</strong> Fill in what you have; anything left blank is
        set later in Netlify (it's on the Finalize env checklist). Tick "Set up later in Netlify" to put a whole service aside.
      </p>
    </div>

    <div v-if="!isGrowth && !composition.usesDonations"
      class="rounded-lg p-6 text-center"
      :style="{ backgroundColor: 'var(--theme-warning-light)', color: 'var(--theme-warning)' }">
      <p class="text-sm font-medium">Nothing to set here: below Growth this step is only for donations, and no page has the Donation block. Current bundle: <strong>{{ bundle ?? 'not set' }}</strong>.</p>
      <button
        @click="router.push('/site/bundle')"
        class="text-xs mt-3 px-3 py-1.5 rounded-lg font-medium"
        :style="{ backgroundColor: 'var(--theme-warning)', color: 'var(--theme-text-inverse)' }"
      >Change Bundle</button>
    </div>

    <div v-else class="space-y-6">
      <!-- Resend -->
      <IntegrationSection id="resend" title="Resend" :icon="Mail" :vars="['RESEND_API_KEY', 'CONTACT_TO_EMAIL']">
        <p class="text-xs mb-4" :style="hintStyle">
          Sends form notifications (and donation receipts). Get the API key at <a href="https://resend.com/api-keys" target="_blank" rel="noopener" class="underline">resend.com/api-keys</a>.
        </p>
        <div class="grid md:grid-cols-2 gap-3">
          <label>
            <span class="block text-xs font-medium mb-1.5" :style="labelStyle">API Key <span class="font-mono opacity-60">RESEND_API_KEY</span></span>
            <input :value="env.resendApiKey" @input="update('resendApiKey', ($event.target as HTMLInputElement).value)" type="text" placeholder="re_xxxx" :class="inputClass" :style="inputStyle" />
            <span class="block text-xs mt-1" :style="hintStyle">If blank: no notification emails or donation receipts; form entries still reach the dashboard inbox.</span>
          </label>
          <label>
            <span class="block text-xs font-medium mb-1.5" :style="labelStyle">Contact-to email <span class="font-mono opacity-60">CONTACT_TO_EMAIL</span></span>
            <input :value="env.contactToEmail" @input="update('contactToEmail', ($event.target as HTMLInputElement).value)" type="email" placeholder="staff@client.org" :class="inputClass" :style="inputStyle" />
            <span class="block text-xs mt-1" :style="hintStyle">If blank: the contact email from Client Setup is used.</span>
          </label>
        </div>
      </IntegrationSection>

      <!-- Sanity Write -->
      <IntegrationSection v-if="isGrowth" id="sanity-write" title="Sanity (Write Token)" :icon="Lock" :vars="['SANITY_WRITE_TOKEN']">
        <p class="text-xs mb-4" :style="hintStyle">
          Editor-role token for sync functions (e.g. sync-coffee-chat) and recording Studio publishes. Generate in sanity.io/manage → API → Tokens.
        </p>
        <label>
          <span class="block text-xs font-medium mb-1.5" :style="labelStyle">Write Token <span class="font-mono opacity-60">SANITY_WRITE_TOKEN</span></span>
          <input :value="env.sanityWriteToken" @input="update('sanityWriteToken', ($event.target as HTMLInputElement).value)" type="text" placeholder="sk..." :class="inputClass" :style="inputStyle" />
          <span class="block text-xs mt-1" :style="hintStyle">If blank: sync functions and publish history don't run.</span>
        </label>
      </IntegrationSection>

      <!-- Turso -->
      <IntegrationSection v-if="isGrowth" id="turso" title="Turso" :icon="Database" :vars="['TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN']">
        <p class="text-xs mb-4" :style="hintStyle">
          Provision via <code class="font-mono px-1 rounded" :style="{ backgroundColor: 'var(--theme-bg-secondary)' }">turso db create [client-slug]</code> in your terminal.
        </p>
        <div class="grid md:grid-cols-2 gap-3">
          <label>
            <span class="block text-xs font-medium mb-1.5" :style="labelStyle">Database URL <span class="font-mono opacity-60">TURSO_DATABASE_URL</span></span>
            <input :value="env.tursoDatabaseUrl" @input="update('tursoDatabaseUrl', ($event.target as HTMLInputElement).value)" type="text" placeholder="libsql://..." :class="inputClass" :style="inputStyle" />
          </label>
          <label>
            <span class="block text-xs font-medium mb-1.5" :style="labelStyle">Auth Token <span class="font-mono opacity-60">TURSO_AUTH_TOKEN</span></span>
            <input :value="env.tursoAuthToken" @input="update('tursoAuthToken', ($event.target as HTMLInputElement).value)" type="text" placeholder="eyJ..." :class="inputClass" :style="inputStyle" />
          </label>
        </div>
        <p class="text-xs mt-1" :style="hintStyle">If blank: event registrations can't be saved.</p>
      </IntegrationSection>

      <!-- AWeber: set in the Pipeline, not on the site -->
      <section v-if="isGrowth" class="p-5 rounded-xl border" :style="{ backgroundColor: 'var(--theme-bg-card)', borderColor: 'var(--theme-border)' }">
        <header class="flex items-center gap-2 mb-1">
          <Send class="w-4 h-4" :style="{ color: 'var(--theme-primary)' }" />
          <h2 class="text-base font-semibold" :style="{ color: 'var(--theme-text-primary)' }">AWeber newsletter</h2>
        </header>
        <p class="text-xs" :style="hintStyle">
          Nothing to enter here: the website holds no AWeber credentials. Newsletter signups go to the client's dashboard
          inbox and are emailed to them on every tier. On Growth, the Pipeline also adds them to the client's list in the
          agency AWeber account: create the list in AWeber, then choose it on the client's page in the Pipeline
          (Newsletter List).
        </p>
      </section>

      <!-- Donations: the client's own Stripe account, any tier -->
      <IntegrationSection
        id="stripe"
        title="Donations (Stripe)"
        :icon="HeartHandshake"
        :vars="['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET', 'DONATION_ORG_NAME', 'DONATION_EIN', 'STRIPE_PORTAL_LOGIN_URL']"
        :badge="composition.usesDonations ? undefined : 'No Donation block on any page'"
      >
        <template #later>
          Until the keys are set, the Donation block shows "Online giving is not available right now" when someone tries to give.
          The webhook settings are in the project's README under Donations.
        </template>

        <p class="text-xs mb-4" :style="hintStyle">
          Used when a page has the Donation block, on any tier. Gifts go through Stripe Checkout on the <strong>client's own</strong>
          Stripe account, one-time or monthly; each paid gift is receipted by email, sent to the client and filed in their
          dashboard inbox. Set it up in Stripe test mode first; switch to live keys at launch.
        </p>

        <!-- 1. Restricted key -->
        <h3 class="text-xs font-semibold uppercase tracking-wide mb-2" :style="labelStyle">1 · Restricted key</h3>
        <p class="text-xs mb-3" :style="hintStyle">
          Stripe → Developers → API keys → <strong>Create restricted key</strong>. Name it "Website donations" and set
          <strong>Checkout Sessions</strong>, <strong>Products</strong> and <strong>Prices</strong> to <strong>Write</strong>; leave everything else at None.
        </p>
        <label class="block mb-5">
          <span class="block text-xs font-medium mb-1.5" :style="labelStyle">Secret Key <span class="font-mono opacity-60">STRIPE_SECRET_KEY</span></span>
          <input :value="env.stripeSecretKey" @input="update('stripeSecretKey', ($event.target as HTMLInputElement).value)" type="text" placeholder="rk_test_... or rk_live_..." :class="inputClass" :style="inputStyle" />
          <span class="block text-xs mt-1" :style="hintStyle">If blank: the Donation block shows "Online giving is not available right now".</span>
        </label>

        <!-- 2. Webhook -->
        <h3 class="text-xs font-semibold uppercase tracking-wide mb-2" :style="labelStyle">2 · Webhook</h3>
        <p class="text-xs mb-3" :style="hintStyle">Stripe → Developers → Webhooks → <strong>Add destination</strong>, with these settings:</p>
        <dl class="text-xs rounded-lg border divide-y mb-3" :style="{ borderColor: 'var(--theme-border)' }">
          <div class="grid grid-cols-[9rem_1fr] gap-3 px-3 py-2" :style="{ borderColor: 'var(--theme-border)' }">
            <dt :style="labelStyle">Events from</dt>
            <dd :style="{ color: 'var(--theme-text-primary)' }">Your account <span :style="hintStyle">(not connected accounts)</span></dd>
          </div>
          <div class="grid grid-cols-[9rem_1fr] gap-3 px-3 py-2" :style="{ borderColor: 'var(--theme-border)' }">
            <dt :style="labelStyle">API version</dt>
            <dd :style="{ color: 'var(--theme-text-primary)' }">Leave the default <span :style="hintStyle">(the site reads both the older and newer formats)</span></dd>
          </div>
          <div class="grid grid-cols-[9rem_1fr] gap-3 px-3 py-2" :style="{ borderColor: 'var(--theme-border)' }">
            <dt :style="labelStyle">Events <span :style="hintStyle">(3)</span></dt>
            <dd class="space-y-1">
              <div v-for="ev in WEBHOOK_EVENTS" :key="ev" class="flex items-center gap-2">
                <span class="font-mono" :style="{ color: 'var(--theme-text-primary)' }">{{ ev }}</span>
                <button type="button" class="p-0.5 rounded" :aria-label="`Copy ${ev}`" :style="hintStyle" @click="copy(ev, ev)">
                  <Check v-if="copied === ev" class="w-3.5 h-3.5" /><Copy v-else class="w-3.5 h-3.5" />
                </button>
              </div>
            </dd>
          </div>
          <div class="grid grid-cols-[9rem_1fr] gap-3 px-3 py-2" :style="{ borderColor: 'var(--theme-border)' }">
            <dt :style="labelStyle">Destination type</dt>
            <dd :style="{ color: 'var(--theme-text-primary)' }">Webhook endpoint</dd>
          </div>
          <div class="grid grid-cols-[9rem_1fr] gap-3 px-3 py-2" :style="{ borderColor: 'var(--theme-border)' }">
            <dt :style="labelStyle">Payload style</dt>
            <dd :style="{ color: 'var(--theme-text-primary)' }">Snapshot <span :style="hintStyle">(if Stripe asks; thin payloads won't work)</span></dd>
          </div>
          <div class="grid grid-cols-[9rem_1fr] gap-3 px-3 py-2" :style="{ borderColor: 'var(--theme-border)' }">
            <dt :style="labelStyle">Endpoint URL</dt>
            <dd class="flex items-center gap-2 min-w-0">
              <span class="font-mono break-all" :style="{ color: 'var(--theme-text-primary)' }">{{ webhookUrl }}</span>
              <button type="button" class="p-0.5 rounded shrink-0" aria-label="Copy endpoint URL" :style="hintStyle" @click="copy('url', webhookUrl)">
                <Check v-if="copied === 'url'" class="w-3.5 h-3.5" /><Copy v-else class="w-3.5 h-3.5" />
              </button>
            </dd>
          </div>
          <div class="grid grid-cols-[9rem_1fr] gap-3 px-3 py-2" :style="{ borderColor: 'var(--theme-border)' }">
            <dt :style="labelStyle">Description</dt>
            <dd :style="{ color: 'var(--theme-text-primary)' }">Website donations: receipts and dashboard inbox</dd>
          </div>
        </dl>
        <p class="text-xs mb-3" :style="hintStyle">
          Test mode and live mode each need their own webhook. In test mode, point it at the staging site
          (<span class="font-mono">https://&lt;staging&gt;.netlify.app/api/donation-webhook</span>) and use that webhook's
          secret on staging. After creating it, open the webhook and reveal its <strong>Signing secret</strong>.
        </p>
        <label class="block mb-5">
          <span class="block text-xs font-medium mb-1.5" :style="labelStyle">Signing secret <span class="font-mono opacity-60">STRIPE_WEBHOOK_SECRET</span></span>
          <input :value="env.stripeWebhookSecret" @input="update('stripeWebhookSecret', ($event.target as HTMLInputElement).value)" type="text" placeholder="whsec_..." :class="inputClass" :style="inputStyle" />
          <span class="block text-xs mt-1" :style="hintStyle">If blank: gifts still go through, but no receipt is sent and nothing reaches the dashboard inbox.</span>
        </label>

        <!-- 3. Receipt + cancelling -->
        <h3 class="text-xs font-semibold uppercase tracking-wide mb-2" :style="labelStyle">3 · Receipt and monthly gifts</h3>
        <div class="grid md:grid-cols-2 gap-3">
          <label>
            <span class="block text-xs font-medium mb-1.5" :style="labelStyle">Legal name on receipts <span class="font-mono opacity-60">DONATION_ORG_NAME</span></span>
            <input :value="env.donationOrgName" @input="update('donationOrgName', ($event.target as HTMLInputElement).value)" type="text" placeholder="Leave blank to use the business name" :class="inputClass" :style="inputStyle" />
            <span class="block text-xs mt-1" :style="hintStyle">Optional. If blank: the business name is used.</span>
          </label>
          <label>
            <span class="block text-xs font-medium mb-1.5" :style="labelStyle">EIN <span class="font-mono opacity-60">DONATION_EIN</span></span>
            <input :value="env.donationEin" @input="update('donationEin', ($event.target as HTMLInputElement).value)" type="text" placeholder="12-3456789" :class="inputClass" :style="inputStyle" />
            <span class="block text-xs mt-1" :style="hintStyle">Optional. If blank: the receipt has no EIN line or "No goods or services" statement. Set it for a 501(c)(3).</span>
          </label>
          <label class="md:col-span-2">
            <span class="block text-xs font-medium mb-1.5" :style="labelStyle">Customer portal login link <span class="font-mono opacity-60">STRIPE_PORTAL_LOGIN_URL</span></span>
            <input :value="env.stripePortalLoginUrl" @input="update('stripePortalLoginUrl', ($event.target as HTMLInputElement).value)" type="url" placeholder="https://billing.stripe.com/p/login/..." :class="inputClass" :style="inputStyle" />
            <span class="block text-xs mt-1" :style="hintStyle">Stripe → Settings → Billing → Customer portal → turn on the login link. Optional. If blank: monthly donors' receipts say to reply to the email to cancel.</span>
          </label>
        </div>
      </IntegrationSection>

      <!-- YouTube — Coffee Chat (nonprofit only) -->
      <IntegrationSection v-if="isGrowth && isNonprofit" id="youtube" title="YouTube — Coffee Chat" :icon="Youtube" :vars="['YOUTUBE_API_KEY', 'COFFEE_CHAT_PLAYLIST_ID']">
        <p class="text-xs mb-4" :style="hintStyle">
          Get a Data API v3 key at <a href="https://console.cloud.google.com" target="_blank" rel="noopener" class="underline">console.cloud.google.com</a>. Playlist ID is the part after <code>?list=</code> in the YouTube URL.
        </p>
        <div class="grid md:grid-cols-2 gap-3">
          <label>
            <span class="block text-xs font-medium mb-1.5" :style="labelStyle">YouTube API Key <span class="font-mono opacity-60">YOUTUBE_API_KEY</span></span>
            <input :value="env.youtubeApiKey" @input="update('youtubeApiKey', ($event.target as HTMLInputElement).value)" type="text" :class="inputClass" :style="inputStyle" />
          </label>
          <label>
            <span class="block text-xs font-medium mb-1.5" :style="labelStyle">Coffee Chat Playlist ID <span class="font-mono opacity-60">COFFEE_CHAT_PLAYLIST_ID</span></span>
            <input :value="env.coffeeChatPlaylistId" @input="update('coffeeChatPlaylistId', ($event.target as HTMLInputElement).value)" type="text" placeholder="PLxxxxx" :class="inputClass" :style="inputStyle" />
          </label>
        </div>
      </IntegrationSection>
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
