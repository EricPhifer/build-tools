# Build Tools + Scaffolder Updates
## Growth Bundle Readiness — Joseph Center Reference Build

**Purpose:** Update Build Tools (`build-tools/`) and the scaffolder (`build-script/pws-scaffolder/`) so the Growth bundle tier is fully configured and the Joseph Center site can be run through the pipeline end-to-end.

**Tech stack:** Vue 3 + TypeScript (Build Tools UI), Node.js (scaffolder CLI)

**Do not modify** any Foundation or Enrich behavior. All changes are additive.

---

## PART 1 — BUILD TOOLS

### Task 1 — Add `isGrowthOnly` flag to page shape

**File:** `src/data/siteBuilderData.ts`

Find the TypeScript type definition for a sitemap page (the same object shape that has `isEnrichOnly`). Add a parallel optional boolean field:

```ts
isGrowthOnly?: boolean
```

Then find every place in the sitemap step UI (`src/views/site/SitemapView.vue` or equivalent) where `isEnrichOnly` pages are conditionally shown or disabled based on the selected bundle tier. Apply the same gating logic for `isGrowthOnly` — pages with this flag should only be selectable when `bundle === 'growth'`.

Also update the JSON export shape in `src/stores/composition.ts` (or wherever pages are serialized) so `isGrowthOnly` is included in the exported `{domain}-build-config.json`.

---

### Task 2 — Expand `EXTRA_PAGES['nonprofit']`

**File:** `src/data/siteBuilderData.ts`

Find the `EXTRA_PAGES` constant and replace the `nonprofit` entry. Current value is approximately `[Donate, Board]`. Replace with the full list below.

Each page object should follow the same shape as existing EXTRA_PAGES entries (id, name, slug, nav, isCore, isLegal, isEnrichOnly, isGrowthOnly, blocks suggestion array).

```ts
EXTRA_PAGES['nonprofit'] = [
  // — Available at all tiers —
  { id: 'donate',        name: 'Donate',          slug: '/donate',          nav: true  },
  { id: 'board',         name: 'Our Board',        slug: '/board',           nav: false },

  // — Enrich+ —
  { id: 'staff',         name: 'Our Staff',        slug: '/staff',           nav: false, isEnrichOnly: true },
  { id: 'testimonies',   name: 'Testimonies',      slug: '/testimonies',     nav: false, isEnrichOnly: true },
  { id: 'events',        name: 'Events',           slug: '/events',          nav: true,  isEnrichOnly: true },
  { id: 'volunteer',     name: 'Volunteer Form',   slug: '/forms/volunteer', nav: false, isEnrichOnly: true },
  { id: 'referral',      name: 'Referral Form',    slug: '/forms/referral',  nav: false, isEnrichOnly: true },

  // — Growth only —
  { id: 'transparency',  name: 'Transparency',     slug: '/transparency',    nav: false, isGrowthOnly: true },
  { id: 'media',         name: 'Media',            slug: '/media',           nav: true,  isGrowthOnly: true },
  { id: 'programs',      name: 'Programs',         slug: '/programs',        nav: true,  isGrowthOnly: true },
  { id: 'event-detail',  name: 'Event Detail',     slug: '/events/:slug',    nav: false, isGrowthOnly: true, isDynamic: true },

  // — Nonprofit-specific repeatable pages (Growth) —
  { id: 'program-page',      name: 'Program Page',      slug: '/programs/:slug',           nav: false, isGrowthOnly: true, isRepeatable: true },
  { id: 'program-donations', name: 'Program Donations', slug: '/programs/:slug/donations', nav: false, isGrowthOnly: true, isRepeatable: true },
]
```

If `isDynamic` and `isRepeatable` flags don't exist yet on the page shape, add them as optional booleans alongside `isGrowthOnly` in Task 1.

---

### Task 3–8 — Add new blocks to the registry

**File:** `src/data/registryData.ts` (or wherever `BLOCKS` / block registry is defined)
**Preview components:** `src/components/variants/blocks/`

Add the following 6 block entries to the block registry. For each one, also create a preview Vue component at the path listed. The preview component is for Build Tools display only — it does not ship to clients. Keep previews simple: correct layout structure, placeholder content, brand-accurate colors using CSS variables.

---

#### Block A — `BlockVideoGrid`

```ts
{
  id: 'block-video-grid',
  componentName: 'BlockVideoGrid',
  name: 'Video Grid',
  category: 'media',
  description: 'Grid of video thumbnails with play button overlays and name banners. Used for testimonial video collections.',
  schemaRequirements: ['testimonialVideo'],
  // testimonialVideo fields needed: id, name, youtubeId, thumbnailUrl
}
```

**Preview layout:** 2-column grid of video cards. Each card: 16:9 thumbnail image placeholder with a centered red play button circle overlay, gold background name banner at the bottom with white text. On hover, play button scales up slightly.

---

#### Block B — `BlockPodcastEpisodes`

```ts
{
  id: 'block-podcast-episodes',
  componentName: 'BlockPodcastEpisodes',
  name: 'Podcast Episodes',
  category: 'media',
  description: 'Episode grid for a YouTube/podcast series. Shows thumbnail, title, publish date, and platform links. Featured episode gets hero treatment at top.',
  schemaRequirements: ['coffeeEpisode'],
  // coffeeEpisode fields needed: videoId, title, description, publishedAt, thumbnailUrl, episodeNumber, platforms, featured
}
```

**Preview layout:** Featured episode banner at top (full-width, YouTube thumbnail, title overlay, platform pill buttons: Spotify, Apple, Amazon). Below: 3-column episode grid with thumbnail, ep number, title, date, platform icons.

---

#### Block C — `BlockTransparency`

```ts
{
  id: 'block-transparency',
  componentName: 'BlockTransparency',
  name: 'Transparency / Annual Reports',
  category: 'content',
  description: 'Sorted list of downloadable annual reports and 990 PDFs. Staff uploads PDFs in Sanity Studio; frontend renders as year-grouped download links.',
  schemaRequirements: ['annualReport'],
  // annualReport fields needed: year, title, file (PDF asset URL)
}
```

**Preview layout:** Clean two-column list. Left: year (bold). Right: document title + download icon link. Grouped by year descending. Light cream background section.

---

#### Block D — `BlockDynamicForm`

```ts
{
  id: 'block-dynamic-form',
  componentName: 'BlockDynamicForm',
  name: 'Dynamic Form',
  category: 'forms',
  description: 'Renders a form defined by a Sanity dynamicForm document. Fetched by slug at runtime. Handles text, email, phone, select, checkbox, checkbox-group, date, number, and textarea field types. Submits to submit-dynamic-form Netlify function.',
  schemaRequirements: ['dynamicForm'],
  // dynamicForm fields needed: title, slug, active, activeDates, fields[], successMessage, notifyEmail
}
```

**Preview layout:** Form with green header bar (form title), then labeled input fields in a clean single-column layout. Submit button: green, pill-shaped, full-width. Shows inactive state overlay if `active = false`.

---

#### Block E — `BlockEventRegistration`

```ts
{
  id: 'block-event-registration',
  componentName: 'BlockEventRegistration',
  name: 'Event Registration',
  category: 'forms',
  description: 'RSVP form for a single event. Reads registration config (enabled, capacity, closingDate) from the event Sanity document. Shows capacity progress bar. Auto-disables after closing date. Submits to submit-event-registration Netlify function.',
  schemaRequirements: ['event'],
  // event fields needed: registration.enabled, registration.capacity, registration.closingDate
}
```

**Preview layout:** Event detail summary at top (title, date, location). Capacity bar (e.g. "14 of 50 spots filled") in gold. Registration form below: first name, last name, email, phone, party size, notes. Green submit button.

---

#### Block F — `BlockDividerDiagonal`

```ts
{
  id: 'block-divider-diagonal',
  componentName: 'BlockDividerDiagonal',
  name: 'Diagonal Section Divider',
  category: 'layout',
  description: 'Angled section divider using CSS clip-path. Accepts a color (gold, green, cream) and an optional centered title. Signature visual element for The Joseph Center — reusable for any client.',
  schemaRequirements: [],
  styleNotes: 'Use clip-path: polygon(0 15%, 100% 0, 100% 85%, 0 100%) on a full-width div. Height ~80px without title, ~120px with title. Title: white, uppercase, centered, font-weight 600. Colors map to CSS vars: gold=var(--color-secondary), green=var(--color-primary), cream=var(--color-bg-secondary).'
}
```

**Preview layout:** Full-width angled band in gold with white centered uppercase title text. Show the diagonal cut clearly at top and bottom edges.

---

### Task 9–10 — Dashboard config: Growth widget types

**File:** `src/types/dashboard.ts` (or wherever `DashboardConfig` and `enabledWidgets` union type are defined)
**File:** `src/views/DashboardConfigView.vue` (or equivalent dashboard config step)

**Step 1 — Extend the widget union type:**

```ts
type DashboardWidget =
  // Existing (Enrich+)
  | 'analytics'
  | 'tutorials'
  | 'links'
  | 'quickActions'
  | 'contentEditor'
  // New — Growth tier
  | 'submissions'
  | 'eventRegistrations'
  | 'subscribers'
  // New — Growth + nonprofit only
  | 'coffeeChat'
  | 'annualReports'
```

**Step 2 — Gate in the UI:**

In the dashboard config step, add the new widgets to the widget picker. Apply the following visibility rules:

- `submissions`, `eventRegistrations`, `subscribers` — only show when `bundle === 'growth'`
- `coffeeChat`, `annualReports` — only show when `bundle === 'growth' && businessType === 'nonprofit'`

Widget display names and descriptions for the picker:

| Widget ID | Label | Description |
|---|---|---|
| submissions | Form Submissions | View volunteer, referral, and dynamic form submissions from Turso |
| eventRegistrations | Event Registrations | Per-event RSVP lists with capacity tracking and export |
| subscribers | Newsletter Subscribers | AWeber list size and recent signup count |
| coffeeChat | Coffee Chat Episodes | Manage podcast episodes — featured flag, platform links |
| annualReports | Annual Reports | View and manage uploaded 990s and annual report PDFs |

---

### Task 11 — Growth env vars in the Finalize checklist

**File:** wherever the 58-item deployment checklist is defined (likely `src/data/checklistData.ts` or similar)

Add a new conditional section to the checklist that only appears when `bundle === 'growth'`. Group as **"Growth Services"**:

```
TURSO_DATABASE_URL          — Turso LibSQL connection URL for the client DB
TURSO_AUTH_TOKEN            — Turso auth token
AWEBER_CLIENT_ID            — AWeber OAuth client ID
AWEBER_CLIENT_SECRET        — AWeber OAuth client secret
AWEBER_ACCOUNT_ID           — AWeber account ID
AWEBER_LIST_ID              — AWeber subscriber list ID for this client
RESEND_API_KEY              — Already present for Foundation; confirm it's in Growth too
STRIPE_SECRET_KEY           — Stripe secret key (scaffolded; activate at Phase 2)
STRIPE_WEBHOOK_SECRET       — Stripe webhook signing secret (Phase 2)
VITE_DONATION_PROVIDER      — Set to "harness" initially; switch to "stripe" at cutover
SANITY_WRITE_TOKEN          — Sanity editor-role token for scheduled sync functions
VITE_AUTH0_DOMAIN           — Auth0 tenant domain for gated dashboard routes
VITE_AUTH0_CLIENT_ID        — Auth0 application client ID
```

Add a nested sub-section under Growth that only appears when `businessType === 'nonprofit'`:

```
YOUTUBE_API_KEY             — YouTube Data API v3 key for playlist sync
COFFEE_CHAT_PLAYLIST_ID     — YouTube playlist ID for the Coffee Chat series
VITE_HARNESS_GIVING_URL     — Current Harness Giving donation link (Phase 1 only)
```

---

### Task 12 — New Sanity schemas in the CMS review step

**File:** wherever schema requirements are merged across selected blocks (`src/stores/composition.ts` or `src/utils/schemaUtils.ts`)

The CMS review step merges `schemaRequirements` from all selected blocks and headers/footers into a deduplicated list. Ensure the following new schema types are recognized and display correctly in the CMS step when their corresponding blocks are used:

| Schema type | Required by block | Fields to display in CMS step |
|---|---|---|
| `annualReport` | BlockTransparency | year (number), title (string), file (file/PDF), description (text) |
| `coffeeEpisode` | BlockPodcastEpisodes | videoId, title, description, publishedAt, thumbnailUrl, episodeNumber, platforms[], featured, syncedFields[] |
| `dynamicForm` | BlockDynamicForm | title, slug, active, activeDates, fields[], successMessage, notifyEmail |
| `event.registration` | BlockEventRegistration | Extend existing `event` schema with registration object: {enabled, capacity, closingDate} |

---

## PART 2 — SCAFFOLDER

All scaffolder changes are in `build-script/pws-scaffolder/`. The main entry is `scaffold.js` with sub-generators for `frontend`, `studio`, and `dashboard`.

### Task 13 — Generate `netlify/functions/` for Growth tier

**File:** `scaffold.js` — frontend generator section

When the build config contains `project.bundle === 'growth'`, scaffold the full functions folder. Currently only `send-message.ts` is generated. Add conditional logic:

```js
if (config.project.bundle === 'growth') {
  generateFunctions(config, outputDir)
}
```

Create a `generateFunctions(config, outputDir)` helper that copies function templates from `templates/functions/` into `{outputDir}/netlify/functions/`. Templates to create:

| Template file | Description |
|---|---|
| `submit-volunteer.ts` | Validate body → write to Turso `volunteer_submissions` → Resend confirmation to applicant → AWeber tag: volunteer-submitted |
| `submit-referral.ts` | Validate body → write to Turso `referral_submissions` → Resend notification to JC staff |
| `submit-contact.ts` | Resend notification to staff — no Turso write |
| `subscribe-newsletter.ts` | POST to AWeber API → add subscriber to list with tag: newsletter |
| `get-form.ts` | GET Sanity read client → fetch `dynamicForm` document by slug → return fields array |
| `submit-dynamic-form.ts` | Fetch form schema → validate active/dates → write to `form_submissions` → Resend to `notifyEmail` |
| `submit-event-registration.ts` | Check current count vs capacity in Turso → write to `event_registrations` → Resend confirmation → AWeber tag: event-{slug} |
| `create-donation-session.ts` | Stripe Checkout session — SCAFFOLDED ONLY, returns 501 until `VITE_DONATION_PROVIDER=stripe` |
| `verify-donation.ts` | Stripe webhook handler — SCAFFOLDED ONLY, same guard |

Each function template should include:
- Correct TypeScript imports (turso client, resend, etc.)
- Input validation with 400 error response
- Try/catch with 500 error response
- CORS headers
- Placeholder comments marking Phase 2 sections for Stripe functions

Also ensure `netlify.toml` is generated (or updated) with a `[functions]` block pointing to `netlify/functions/`.

---

### Task 14 — Generate `sync-coffee-chat.ts` for nonprofit Growth

**File:** `scaffold.js` — nonprofit conditional branch

When `bundle === 'growth' && businessType === 'nonprofit'`, additionally generate `netlify/functions/sync-coffee-chat.ts`.

Template logic:
1. Fetch all items from YouTube playlist using `YOUTUBE_API_KEY` + `COFFEE_CHAT_PLAYLIST_ID` via YouTube Data API v3 (`playlistItems.list` with `part=snippet&maxResults=50`)
2. For each video, call Sanity write client `createOrReplace` with `_id: 'youtube-' + videoId`
3. Only overwrite fields listed in `syncedFields` array on the document — skip fields staff has manually edited (those removed from `syncedFields`)
4. On new documents, set `syncedFields: ['title', 'description', 'publishedAt', 'thumbnailUrl']`

---

### Task 15 — Generate `db/migrations/001_initial.sql`

**File:** `scaffold.js` — Growth DB scaffold section

When `bundle === 'growth'`, generate a `db/` folder at the project root with:

**`db/migrations/001_initial.sql`**
```sql
CREATE TABLE IF NOT EXISTS volunteer_submissions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  departments TEXT, -- JSON array
  availability TEXT, -- JSON object
  additional_info TEXT,
  submitted_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS referral_submissions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  referrer_name TEXT NOT NULL,
  referrer_email TEXT NOT NULL,
  referrer_phone TEXT,
  agency TEXT,
  individual_first_name TEXT NOT NULL,
  individual_last_name TEXT NOT NULL,
  preferred_name TEXT,
  dob TEXT,
  reason TEXT,
  submitted_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS form_submissions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  form_slug TEXT NOT NULL,
  data TEXT NOT NULL, -- JSON blob of field values
  email TEXT,
  submitted_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS event_registrations (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  event_slug TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  party_size INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  submitted_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS donations (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  stripe_session_id TEXT UNIQUE,
  amount INTEGER NOT NULL, -- cents
  frequency TEXT NOT NULL, -- one-time | monthly | annual
  donor_email TEXT,
  donor_name TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
```

**`db/seed.ts`** — simple connection test that logs table names. Run manually after first deploy to verify Turso connection.

---

### Task 16 — Scheduled function config in `netlify.toml`

**File:** `scaffold.js` — netlify.toml template

When `bundle === 'growth' && businessType === 'nonprofit'`, append to the generated `netlify.toml`:

```toml
[functions."sync-coffee-chat"]
  schedule = "0 6 * * *"
```

This configures Netlify to run `sync-coffee-chat.ts` daily at 6am UTC.

---

### Tasks 17–20 — New Sanity schema files

**File:** `scaffold.js` — studio generator section
**Output path:** `{studioOutputDir}/schemas/`

Generate the following schema files when the corresponding blocks are included in the build config's `cms.sanityDocumentTypes`. These are TypeScript Sanity v3 schema definitions.

---

#### Task 17 — `annualReport.ts`

```ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'annualReport',
  title: 'Annual Report',
  type: 'document',
  fields: [
    defineField({ name: 'year', title: 'Year', type: 'number', validation: Rule => Rule.required().min(2000).max(2100) }),
    defineField({ name: 'title', title: 'Title', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'file', title: 'PDF File', type: 'file', options: { accept: '.pdf' }, validation: Rule => Rule.required() }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
  ],
  orderings: [{ title: 'Year, Newest First', name: 'yearDesc', by: [{ field: 'year', direction: 'desc' }] }],
  preview: { select: { title: 'title', subtitle: 'year' } }
})
```

---

#### Task 18 — `coffeeEpisode.ts`

```ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'coffeeEpisode',
  title: 'Coffee Chat Episode',
  type: 'document',
  fields: [
    defineField({ name: 'videoId', title: 'YouTube Video ID', type: 'string', readOnly: true }),
    defineField({ name: 'title', title: 'Title', type: 'string' }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 3 }),
    defineField({ name: 'publishedAt', title: 'Published At', type: 'datetime', readOnly: true }),
    defineField({ name: 'thumbnailUrl', title: 'Thumbnail URL', type: 'url', readOnly: true }),
    defineField({ name: 'episodeNumber', title: 'Episode Number', type: 'number' }),
    defineField({
      name: 'platforms',
      title: 'Podcast Platforms',
      type: 'array',
      of: [defineField({
        name: 'platform', title: 'Platform', type: 'object',
        fields: [
          defineField({ name: 'name', title: 'Platform Name', type: 'string' }),
          defineField({ name: 'url', title: 'URL', type: 'url' }),
        ],
        preview: { select: { title: 'name', subtitle: 'url' } }
      })]
    }),
    defineField({ name: 'featured', title: 'Featured Episode', type: 'boolean', initialValue: false }),
    defineField({ name: 'syncedFields', title: 'Auto-synced Fields (do not edit)', type: 'array', of: [{ type: 'string' }], readOnly: true }),
  ],
  orderings: [{ title: 'Published, Newest First', name: 'publishedDesc', by: [{ field: 'publishedAt', direction: 'desc' }] }],
  preview: { select: { title: 'title', subtitle: 'publishedAt', media: 'thumbnailUrl' } }
})
```

---

#### Task 19 — `dynamicForm.ts`

```ts
import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'dynamicForm',
  title: 'Dynamic Form',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Form Title', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'slug', title: 'Slug', type: 'slug', options: { source: 'title' }, validation: Rule => Rule.required() }),
    defineField({ name: 'active', title: 'Active', type: 'boolean', initialValue: true }),
    defineField({
      name: 'activeDates', title: 'Active Date Range (optional)', type: 'object',
      fields: [
        defineField({ name: 'start', title: 'Start Date', type: 'datetime' }),
        defineField({ name: 'end', title: 'End Date', type: 'datetime' }),
      ]
    }),
    defineField({ name: 'description', title: 'Description', type: 'text', rows: 2 }),
    defineField({
      name: 'fields', title: 'Form Fields', type: 'array',
      of: [defineField({
        name: 'formField', title: 'Field', type: 'object',
        fields: [
          defineField({ name: 'label', title: 'Label', type: 'string', validation: Rule => Rule.required() }),
          defineField({ name: 'name', title: 'Field Name (no spaces)', type: 'string', validation: Rule => Rule.required() }),
          defineField({
            name: 'type', title: 'Field Type', type: 'string',
            options: { list: ['text','email','phone','number','date','select','checkbox','checkbox-group','textarea'] }
          }),
          defineField({ name: 'required', title: 'Required', type: 'boolean', initialValue: false }),
          defineField({ name: 'options', title: 'Options (for select/checkbox-group)', type: 'array', of: [{ type: 'string' }] }),
        ],
        preview: { select: { title: 'label', subtitle: 'type' } }
      })]
    }),
    defineField({ name: 'successMessage', title: 'Success Message', type: 'text', rows: 2 }),
    defineField({ name: 'notifyEmail', title: 'Notify Email (staff recipient)', type: 'string' }),
  ],
  preview: { select: { title: 'title', subtitle: 'slug.current' } }
})
```

---

#### Task 20 — Extend `event.ts` with registration fields

**Do not replace the existing event schema.** Find the existing `event` schema file generated by the scaffolder and add the following field to its `fields` array if not already present:

```ts
defineField({
  name: 'registration',
  title: 'Event Registration',
  type: 'object',
  fields: [
    defineField({ name: 'enabled', title: 'Registration Open', type: 'boolean', initialValue: false }),
    defineField({ name: 'capacity', title: 'Capacity (max registrants)', type: 'number' }),
    defineField({ name: 'closingDate', title: 'Registration Closes', type: 'datetime' }),
  ]
})
```

If the event schema doesn't exist yet in the studio template, generate it fully including this field from the start.

---

### Task 21 — Extend `EnvConfig` with Growth-tier integration fields

**File:** `src/stores/composition.ts`

Today `EnvConfig` only carries Sanity + site URL + Auth0 fields. To run a Growth client through the standard workflow without manual env-file editing, extend it:

```ts
export type DonationProvider = 'harness' | 'stripe'

export interface EnvConfig {
  // Existing
  sanityProjectId: string
  sanityDataset: string
  siteUrl: string
  auth0Domain: string
  auth0ClientId: string
  auth0Audience: string
  auth0WhitelistStrategy: Auth0WhitelistStrategy
  auth0RoleName: string
  auth0RolesClaim: string
  auth0WhitelistClaim: string

  // New — Growth tier (only relevant when bundle === 'growth')
  resendApiKey: string             // for form notification emails
  contactToEmail: string           // staff inbox for contact form submissions
  sanityWriteToken: string         // for sync-coffee-chat and other write functions

  // Turso (form submissions, event registrations, donations)
  tursoDatabaseUrl: string
  tursoAuthToken: string

  // AWeber
  aweberClientId: string
  aweberClientSecret: string
  aweberAccountId: string
  aweberListId: string

  // Stripe (Phase 2 — donations)
  stripeSecretKey: string
  stripeWebhookSecret: string

  // Donation provider toggle
  donationProvider: DonationProvider   // 'harness' (Phase 1) | 'stripe' (Phase 2)
  harnessGivingUrl: string              // outbound donate link when provider === 'harness'

  // Nonprofit-only (only relevant when businessType === 'nonprofit')
  youtubeApiKey: string
  coffeeChatPlaylistId: string
}
```

Update `createDefaultEnvConfig()` to default all new fields to `''` and `donationProvider: 'harness'`.

Update the `loadFromBuildConfig` env mapping so all new fields round-trip from the exported `env` block (their `VITE_*` / non-VITE keys).

---

### Task 22 — New "Integrations" sub-step in Site Builder

**File:** new view `src/views/SiteIntegrationsView.vue` + router entry + `WorkflowProgress` step

The current Site Builder hub has Bundle, Business Type, Legal Pages, Sitemap, Header, Footer, Main, Page Builder, etc. Add a new sub-step **Integrations** that appears under Site Builder **only when `bundle === 'growth'`**.

Layout: grouped sections, one per integration. Each section is a card with the relevant input fields and helper text linking to the docs/dashboard for getting credentials.

```
[ Resend ]
  - API Key                                 (env: RESEND_API_KEY)
  - Contact-to email                        (env: CONTACT_TO_EMAIL)
  Helper: "Used to send form notifications. Get your API key at resend.com/api-keys"

[ Sanity (Write) ]
  - Write Token                             (env: SANITY_WRITE_TOKEN)
  Helper: "Editor-role token for sync functions. Generate in Sanity Studio → API → Tokens"

[ Turso ]
  - Database URL                            (env: TURSO_DATABASE_URL)
  - Auth Token                              (env: TURSO_AUTH_TOKEN)
  Helper: "Provision via `turso db create [client-slug]` in your terminal"

[ AWeber ]
  - Client ID                               (env: AWEBER_CLIENT_ID)
  - Client Secret                           (env: AWEBER_CLIENT_SECRET)
  - Account ID                              (env: AWEBER_ACCOUNT_ID)
  - List ID                                 (env: AWEBER_LIST_ID)
  Helper: "OAuth credentials from labs.aweber.com → My Apps"

[ Stripe ]                                  (collapsed by default, with a banner: "Activated in Phase 2")
  - Secret Key                              (env: STRIPE_SECRET_KEY)
  - Webhook Secret                          (env: STRIPE_WEBHOOK_SECRET)

[ Donation Provider ]
  Radio: ( ) Harness Giving (Phase 1)   ( ) Stripe Checkout (Phase 2)
  - Harness Giving URL                      (env: VITE_HARNESS_GIVING_URL)
    (only visible when 'harness' is selected)
  Helper: "Switch to Stripe after live keys are activated and recurring donors have migrated."

[ YouTube — Coffee Chat ]                   (only when businessType === 'nonprofit')
  - YouTube API Key                         (env: YOUTUBE_API_KEY)
  - Coffee Chat Playlist ID                 (env: COFFEE_CHAT_PLAYLIST_ID)
  Helper: "Get a Data API v3 key at console.cloud.google.com. Playlist ID is the part after `?list=` in the YouTube URL."
```

Persist via `composition.setEnvConfig()`. No required fields — admins can save partials and fill in later.

---

### Task 23 — Include Growth integration fields in JSON export

**File:** `src/views/FinalizeView.vue`

Extend the `env` block in `buildExportConfig()` so all Task 21 fields are written when `bundle === 'growth'`. The keys in the export use the conventional env-var names (e.g. `VITE_HARNESS_GIVING_URL`, `RESEND_API_KEY`, etc.). Non-VITE-prefixed vars (server-side only, like `RESEND_API_KEY`, `TURSO_AUTH_TOKEN`, `STRIPE_SECRET_KEY`, etc.) go in the same `env` block — the scaffolder will route them correctly when generating `.env`.

Also add a `donation` block parallel to `auth`:

```
donation: {
  provider: 'harness' | 'stripe',
  harnessGivingUrl?: string
}
```

This makes the donation toggle explicit in the export rather than inferred from env vars alone.

---

### Task 24 — Wire Growth env vars through scaffolder env generation

**File:** `build-script/pws-scaffolder/lib/frontend.js` — `generateEnvFile()` and `generateEnvExample()`

The scaffolder already writes all VITE_* vars from `config.env` to `.env`. Extend the env generation to:

1. Write all Task 21 server-side keys (RESEND_API_KEY, TURSO_*, AWEBER_*, STRIPE_*, SANITY_WRITE_TOKEN, YOUTUBE_API_KEY, COFFEE_CHAT_PLAYLIST_ID) to `.env` when present in the config.
2. Group them in the file with section comments (`# Resend`, `# Turso`, `# AWeber`, etc.) for readability.
3. Mirror the same vars in `.env.example` (keys only, no values — same grouping).
4. Read `config.donation?.provider` and write `VITE_DONATION_PROVIDER` accordingly. If `provider === 'harness'`, also write `VITE_HARNESS_GIVING_URL`.

If `bundle !== 'growth'`, none of the new keys are written — Foundation/Enrich `.env` files stay clean.

---

## Completion Check

Before marking these updates done, verify:

- [ ] `isGrowthOnly` flag exists on page shape and is respected in the sitemap step UI
- [ ] `EXTRA_PAGES['nonprofit']` has all 13 pages listed in Task 2
- [ ] All 6 new blocks appear in the Build Tools block picker with preview components
- [ ] Growth widget types appear in dashboard config step when bundle = growth
- [ ] Nonprofit widgets appear only when bundle = growth + businessType = nonprofit
- [ ] Growth env vars appear in Finalize checklist, nonprofit vars are sub-gated
- [ ] New schema types display correctly in CMS review step
- [ ] Running `node scaffold.js frontend` on a Growth/nonprofit config generates `netlify/functions/` with all 10 functions
- [ ] `sync-coffee-chat.ts` is only generated for nonprofit type
- [ ] `db/migrations/001_initial.sql` is generated for Growth tier
- [ ] `netlify.toml` includes scheduled function block for nonprofit Growth
- [ ] All 4 new Sanity schema files are generated by `node scaffold.js studio`
- [ ] `EnvConfig` extended with all Growth-tier integration fields (Task 21); defaults round-trip via `loadFromBuildConfig`
- [ ] Site Builder shows the new "Integrations" sub-step only when `bundle === 'growth'` (Task 22)
- [ ] YouTube section in Integrations shows only when `businessType === 'nonprofit'`
- [ ] Donation provider radio toggles between Harness (Phase 1) and Stripe (Phase 2)
- [ ] JSON export includes all Growth env keys + `donation` block (Task 23)
- [ ] Scaffolder `.env` and `.env.example` include grouped Growth-tier keys when bundle = growth (Task 24)
