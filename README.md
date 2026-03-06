# Build Tools

Internal tooling for configuring, scaffolding, and deploying client websites. Walks through a structured 5-step workflow that outputs a typed build config JSON used by the build script to generate production-ready Vue 3 + Sanity CMS projects.

This app is for **internal use only** — it is not public-facing and requires Auth0 authentication.

---

## Tech Stack

- **Vue 3** + Vite + TypeScript
- **Tailwind CSS v4** (Vite plugin)
- **Pinia** — state management
- **Vue Router 4**
- **Auth0** — authentication (`@auth0/auth0-vue`)
- **Netlify** — hosting + serverless functions
- **Turso (libSQL)** — client data backend (accessed via Netlify functions)
- **Lucide Vue Next** — icons
- **PWA** — offline-capable via `vite-plugin-pwa`

---

## Prerequisites

- Node.js 20+
- npm or pnpm
- Netlify CLI (`npm i -g netlify-cli`) — required to run functions locally

---

## Local Development

```bash
npm install

# Run with Netlify dev (enables serverless functions at localhost:8890)
netlify dev

# Or run Vite only (no functions — some features will be unavailable)
npm run dev   # runs on port 5176
```

The Netlify dev server proxies the Vite app at port 5176 and exposes functions at port 8890.

### Environment Variables

Copy `.env.example` and fill in values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `VITE_AUTH0_DOMAIN` | Auth0 tenant domain (e.g. `dev-xxx.us.auth0.com`) |
| `VITE_AUTH0_CLIENT_ID` | Auth0 application Client ID |

Netlify functions also require server-side env vars (set in Netlify dashboard, not `.env`):

| Variable | Description |
|---|---|
| `TURSO_DATABASE_URL` | Turso database URL |
| `TURSO_AUTH_TOKEN` | Turso auth token |

---

## Build & Deploy

```bash
npm run build     # type-check + Vite build → dist/
```

Deployed via Netlify. Push to the connected GitHub repo — Netlify builds and deploys automatically.

---

## Project Structure

```
src/
├── components/         # Shared UI components (WorkflowProgress, etc.)
├── composables/        # useClientApi — API calls to Netlify functions
├── data/               # Static registry data (blocks, templates, headers, footers)
├── plugins/            # Auth0 plugin setup
├── router/             # Vue Router — all protected routes use Auth0 guard
├── stores/
│   ├── workflow.ts     # Step tracking, client info, portfolio entries, extend mode
│   ├── composition.ts  # Site composition, siteBuilder config, dashboard config
│   └── registry.ts     # Block/template/variant registry (read-only reference data)
├── types/
│   ├── registry.ts     # All shared types (ClientInfo, SitemapPage, PortfolioEntry, etc.)
│   └── dashboard.ts    # DashboardConfig type
├── views/              # One file per route
└── main.ts

netlify/
└── functions/
    ├── search-clients.ts    # GET — search saved clients from Turso
    ├── get-client.ts        # GET — fetch single client by ID
    └── get-brand-kit.ts     # GET — fetch brand kit (colors, fonts, logos)
```

---

## Workflow

The app guides you through 5 steps to configure a client project:

| Step | Route | Purpose |
|------|-------|---------|
| 1. Client Setup | `/client` | Load or create a client — pulls brand kit (colors, fonts, logos) from the client API |
| 2. Site Builder | `/site/*` | Choose bundle type, business type, header/footer variants, page template, sitemap, legal content |
| 3. CMS | `/cms` | Review auto-generated Sanity schema requirements from selected blocks |
| 4. Dashboard | `/dashboards` | Configure the client's dashboard (analytics, quick actions, tutorial videos, helpful links, content editors) |
| 5. Finalize | `/finalize` | Review config summary, export `{slug}-build-config.json`, track 46-item deployment checklist |

On completion, the project is saved to the **Project Portfolio** (`/products/portfolio`) with links to the live site, studio, and dashboard.

---

## Key Features

### Build Config Export
The Finalize step exports a typed JSON file (`{slug}-build-config.json`) containing the complete project configuration — site components, page map with block assignments, Sanity schema requirements, environment variables, dashboard config, and brand kit. This file is consumed by the build script to scaffold the production project.

### Project Portfolio
Completed projects live at `/products/portfolio`. Each card shows:
- Status badge (Building / Active / Maintenance) — click to cycle
- Links to live site, Sanity studio, and client dashboard
- Deployment checklist progress (46 items)
- Export config (re-download original JSON)
- Re-open (extend mode — see below)

### Extend Mode
Re-open a completed project to add new pages, blocks, or dashboard items without re-doing the original build:

1. Click **Re-open** on any portfolio card
2. The original config is loaded back into the builder stores
3. Original pages are locked (amber lock icon — can't delete or edit nav assignment)
4. Add new pages and assign blocks as normal
5. Go to Finalize → **Export Delta Config** downloads `{slug}-build-config-delta.json` containing only the new additions
6. **Complete Extension** updates the portfolio entry's stored config to the new full state and exits extend mode

### Dashboard Preview
The `/dashboards` step includes a live iframe preview at `/preview/dashboard` showing the client's dashboard with their brand colors and logo applied. The preview uses a sidebar nav layout with Overview, Analytics, Content, Resources, and Contact pages.

### Preview System
Headers, footers, and individual pages can be previewed in isolation via iframe routes (`/preview/header`, `/preview/footer`, `/preview/page`). Each preview receives brand colors, fonts, and content via URL query params.

---

## Security

- All routes except `/preview/*` and `/callback` require Auth0 authentication
- `X-Robots-Tag: noindex` on all routes — this tool is not indexable
- `X-Frame-Options: DENY` on all routes except `/preview/*` (SAMEORIGIN for iframe embedding)
- All data is persisted to `localStorage` — no sensitive client data is sent to the browser beyond what Auth0 and the Netlify functions return

---

## State Persistence

All workflow and composition state is stored in `localStorage` under two keys:

- `build-tools-workflow` — current step, step statuses, client info, saved clients, portfolio entries, extend mode state
- `build-tools-site-builder` — site builder data (bundle, sitemap, dashboard config, env config, legal content)

State survives page refresh. Use the **Reset** action (available in the UI) or clear localStorage manually to start fresh.
