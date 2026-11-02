// Per-site environment variable checklist, generated from the build config.
// At the RMWS launch the website's Netlify env was missing the forms vars, so
// submissions were emailed but never reached the dashboard. This lists every
// variable each Netlify site needs: where it goes, its scope, and where the
// value comes from. Finalize shows it as a checklist phase and the export
// carries it, so the scaffolder can write ENV-CHECKLIST.md into the project.
//
// Keep in step with what the templates actually read:
// pws-foundation-template/netlify/functions, pws-dashboard-template/.env.example.

export type EnvSite = 'website' | 'studio' | 'dashboard'

export interface EnvVarItem {
  site: EnvSite
  name: string
  /** Netlify scope: 'builds' for VITE_ / SANITY_STUDIO_ values compiled into the bundle, 'functions' for server-side */
  scope: 'builds' | 'functions'
  /** Mark "Contains secret values" in Netlify */
  secret: boolean
  optional?: boolean
  source: string
}

export const ENV_SITE_LABELS: Record<EnvSite, string> = {
  website: 'Website',
  studio: 'Studio',
  dashboard: 'Dashboard',
}

// The subset of the export this needs
interface ChecklistConfig {
  client?: { domain?: string | null } | null
  project?: { bundle?: string | null; businessType?: string | null } | null
  auth?: { enabled?: boolean } | null
  dashboard?: {
    submissionKinds?: unknown[]
    useGoogleAnalytics?: boolean
    profile?: string
  } | null
}

export function buildEnvChecklist(config: ChecklistConfig): EnvVarItem[] {
  const domain = config.client?.domain || '<domain>'
  const bundle = config.project?.bundle
  const isGrowth = bundle === 'growth'
  const isNonprofit = config.project?.businessType === 'nonprofit'
  const dash = config.dashboard ?? {}
  const inbox = (dash.submissionKinds ?? []).length > 0
  const ga4 = !!dash.useGoogleAnalytics
  const items: EnvVarItem[] = []
  const add = (site: EnvSite, name: string, scope: EnvVarItem['scope'], secret: boolean, source: string, optional = false) =>
    items.push({ site, name, scope, secret, source, ...(optional ? { optional } : {}) })

  // ── Website ──
  add('website', 'VITE_SANITY_PROJECT_ID', 'builds', false, 'sanity.io/manage → project ID')
  add('website', 'VITE_SANITY_DATASET', 'builds', false, '"production" (or "staging" on the staging site)')
  add('website', 'VITE_SITE_URL', 'builds', false, `https://${domain}`)
  add('website', 'RESEND_API_KEY', 'functions', true, 'Resend → API Keys (sending access for the client domain)')
  add('website', 'CONTACT_TO_EMAIL', 'functions', false, "the client's inbox for contact messages")
  add('website', 'CONTACT_FROM_EMAIL', 'functions', false, `a verified Resend sender, e.g. website@${domain}`)
  if (inbox) {
    add('website', 'FORMS_INTAKE_URL', 'functions', false, `https://dashboard.${domain}/.netlify/functions/form-submissions`)
    add('website', 'FORMS_INTAKE_SECRET', 'functions', true, ".pws-secrets.json in the project folder — the dashboard's value, exactly")
  }
  if (config.auth?.enabled) {
    add('website', 'VITE_AUTH0_DOMAIN', 'builds', false, 'Auth0 → Applications → the SPA app → Domain')
    add('website', 'VITE_AUTH0_CLIENT_ID', 'builds', false, 'Auth0 → Applications → the SPA app → Client ID')
  }
  if (isGrowth) {
    add('website', 'SANITY_WRITE_TOKEN', 'functions', true, 'sanity.io/manage → API → Tokens (Editor), for the sync functions and recording Studio publishes')
    add('website', 'DEPLOY_WEBHOOK_SECRET', 'functions', true, ".pws-secrets.json (in the scaffolded .env); the same value goes on the Sanity webhook")
    add('website', 'NETLIFY_DEPLOY_HOOK_URL', 'functions', true, 'Netlify → Build hooks → "Studio publish" on the production branch')
    add('website', 'NETLIFY_STAGING_DEPLOY_HOOK_URL', 'functions', true, 'a second build hook on the staging branch', true)
    add('website', 'TURSO_DATABASE_URL', 'functions', false, "the client's own Growth database (not the agency database)")
    add('website', 'TURSO_AUTH_TOKEN', 'functions', true, 'turso db tokens create <client db>')
    add('website', 'AWEBER_CLIENT_ID', 'functions', false, 'AWeber developer app')
    add('website', 'AWEBER_CLIENT_SECRET', 'functions', true, 'AWeber developer app')
    add('website', 'AWEBER_ACCOUNT_ID', 'functions', false, 'AWeber account')
    add('website', 'AWEBER_LIST_ID', 'functions', false, 'AWeber list for the newsletter')
    add('website', 'VITE_DONATION_PROVIDER', 'builds', false, '"harness" now; "stripe" at the Phase 2 cutover')
    add('website', 'VITE_HARNESS_GIVING_URL', 'builds', false, "the client's Harness Giving page", true)
    add('website', 'STRIPE_SECRET_KEY', 'functions', true, 'Stripe → Developers → API keys (activate at cutover)', true)
    add('website', 'STRIPE_WEBHOOK_SECRET', 'functions', true, 'Stripe → Webhooks → the donations endpoint (activate at cutover)', true)
    if (isNonprofit) {
      add('website', 'YOUTUBE_API_KEY', 'functions', true, 'Google Cloud → YouTube Data API key')
      add('website', 'COFFEE_CHAT_PLAYLIST_ID', 'functions', false, 'the YouTube playlist ID')
    }
  }

  // ── Studio ──
  add('studio', 'SANITY_STUDIO_PROJECT_ID', 'builds', false, 'sanity.io/manage → project ID')
  add('studio', 'SANITY_STUDIO_DATASET', 'builds', false, '"production"')
  if (isGrowth) {
    add('studio', 'SANITY_STUDIO_MONTHLY_BUILDS', 'builds', false, 'builds included per month, shown in "Publish site" (blank = just count)', true)
  }

  // ── Dashboard ──
  add('dashboard', 'VITE_AUTH0_DOMAIN', 'builds', false, 'Auth0 → Applications → the dashboard SPA app → Domain')
  add('dashboard', 'VITE_AUTH0_CLIENT_ID', 'builds', false, 'Auth0 → Applications → the dashboard SPA app → Client ID')
  add('dashboard', 'AUTH0_DOMAIN', 'functions', false, 'same value as VITE_AUTH0_DOMAIN')
  add('dashboard', 'AUTH0_CLIENT_ID', 'functions', false, 'same value as VITE_AUTH0_CLIENT_ID')
  add('dashboard', 'AUTH0_ALLOWED_EMAILS', 'functions', false, 'comma-separated logins allowed in (set it if sign-ups are open)', true)
  add('dashboard', 'PIPELINE_FUNCTIONS_URL', 'functions', false, 'https://isyourwebsitegood.com/.netlify/functions')
  add('dashboard', 'PIPELINE_DASHBOARD_KEY', 'functions', true, "Pipeline → the client's ClientDetail page → Issue dashboard key")
  add('dashboard', 'PIPELINE_CLIENT_ID', 'functions', false, "the client's id in the Pipeline (already in the scaffolded .env)")
  // Billing is on every tier, Sustain included
  add('dashboard', 'STRIPE_CONFIG', 'functions', true, 'JSON {"secretKey","publishableKey","webhookSecret"} for the agency Stripe account')
  add('dashboard', 'STRIPE_CUSTOMER_ID', 'functions', false, "the client's cus_… in Stripe")
  add('dashboard', 'STRIPE_LEGACY_CUSTOMER_IDS', 'functions', false, 'older cus_… records, history only', true)
  if (ga4) {
    add('dashboard', 'GA4_PROPERTY_ID', 'functions', false, 'GA4 → Admin → Property details (numeric, not the G- ID)')
    add('dashboard', 'GA4_CLIENT_EMAIL', 'functions', false, 'service account email with Viewer on the property')
    add('dashboard', 'GA4_PRIVATE_KEY', 'functions', true, "that service account's private key, newlines as \\n")
  } else {
    add('dashboard', 'SIMPLE_ANALYTICS_API_KEY', 'functions', true, 'Simple Analytics → Account → API keys')
    add('dashboard', 'ANALYTICS_HOSTNAME', 'functions', false, `${domain} (as listed in Simple Analytics, no sa. prefix)`)
    add('dashboard', 'PSI_API_KEY', 'functions', true, 'Google Cloud → PageSpeed Insights API key (anonymous requests are refused)')
  }
  add('dashboard', 'CLIENT_TIMEZONE', 'functions', false, 'e.g. America/Denver, for calendar months in reports')
  add('dashboard', 'RESEND_API_KEY', 'functions', true, 'Resend → API Keys')
  add('dashboard', 'CONTACT_TO_EMAIL', 'functions', false, 'where support requests land')
  add('dashboard', 'CONTACT_FROM_EMAIL', 'functions', false, 'a verified Resend sender')
  if (inbox) {
    add('dashboard', 'FORMS_INTAKE_SECRET', 'functions', true, ".pws-secrets.json in the project folder — the website's value, exactly")
  }

  return items
}

export function envItemId(item: EnvVarItem): string {
  return `env-${item.site}-${item.name}`
}

export function envItemLabel(item: EnvVarItem): string {
  const traits = [
    item.scope === 'builds' ? 'Builds scope' : 'Functions scope',
    item.secret ? 'secret' : null,
    item.optional ? 'optional' : null,
  ].filter(Boolean).join(', ')
  return `${ENV_SITE_LABELS[item.site]}: \`${item.name}\` (${traits}) — ${item.source}`
}

/** Markdown version, written into the project folder by the scaffolder */
export function envChecklistMarkdown(items: EnvVarItem[]): string {
  const lines = [
    '# Environment variables',
    '',
    'Set these on each Netlify site (the right account and site), then **redeploy**: functions only see env changes after a new deploy.',
    'Builds scope = compiled into the bundle (never put a secret in a VITE_ variable). Secret = tick "Contains secret values".',
  ]
  for (const site of Object.keys(ENV_SITE_LABELS) as EnvSite[]) {
    const rows = items.filter(i => i.site === site)
    if (!rows.length) continue
    lines.push('', `## ${ENV_SITE_LABELS[site]}`, '', '| | Variable | Scope | Secret | Value from |', '|---|---|---|---|---|')
    for (const r of rows) {
      lines.push(`| [ ] | \`${r.name}\`${r.optional ? ' (optional)' : ''} | ${r.scope} | ${r.secret ? 'yes' : ''} | ${r.source.replace(/\|/g, '\\|')} |`)
    }
  }
  return lines.join('\n') + '\n'
}
