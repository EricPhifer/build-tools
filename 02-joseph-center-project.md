# Joseph Center — Project Notes

**Layers on top of:** `01-build-tools-scaffolder-updates.md` (Growth bundle platform work, including Tasks 21–24 for Growth-tier integration UI in build-tools)
**Reference:** `../phifer-web-solutions-pipeline.md` (full PWS pipeline)

---

## Configuration

**Everything routine pulls from existing systems** — JC client info (brand kit, NAP, contact email, domain, contracted pricing) lives in the Client Dashboard's Turso DB and is loaded into Build Tools via the standard Client Setup flow (`get-brand-kit` API + `search-clients`).

| Field | Value |
|---|---|
| Bundle | `growth` |
| Business type | `nonprofit` |
| Project mode | `false` |
| Stripe pricing | Custom (tracked in Client Dashboard `custom_pricing`) |

No new bundle type is added to the codebase. JC-specific configuration that doesn't fit into the standard Build Tools workflow is captured below.

---

## Site Composition Notes

JC-specific selections to make in Build Tools (anything not listed uses the standard Build Tools workflow):

- **Header variant:** `header-transparent-jc` — Transparent + Full-Screen Menu. Circular coin logo, gold-outline Volunteer pill button, full-screen green accordion menu, sticky Donate. Already implemented in the existing `vue-josephcentergj` repo. After scaffolding, replace the generated `SiteHeader.vue` with the polished existing component if its scroll/animation tuning is more refined than the scaffolded baseline.
- **Login button in header:** Off. JC's "Volunteer" button is the primary affordance, not Auth0 login. Only flip it on if a board portal or donor-only section is added later.
- **Sitemap parent/child grouping:** The scaffolder auto-derives the menu's accordion structure from sitemap slug paths (e.g. `/programs/day-shelter` becomes a child of `/programs`). When configuring the JC sitemap, lay programs and forms out as nested slugs so the menu builds itself.

## Launch Phasing — Harness → Stripe Cutover

JC ships in two phases:

**Phase 1 — Launch with Harness Giving**
- Set Donation Provider = `harness` in Build Tools Integrations step
- `/donate` and donate CTAs link out to existing Harness Giving page
- Stripe scaffolded but inactive
- Goal: ship the new site without disrupting current giving flow

**Phase 2 — Stripe cutover**
- Activate Stripe (live keys + webhook secret) via Build Tools Integrations
- Flip Donation Provider to `stripe`
- Re-export config + redeploy via scaffolder extend mode
- JC outreach to recurring donors for migration
- Decommission Harness Giving once recurring donors confirm switch

**Phase 2 trigger:** TBD (date or milestone — e.g. 30 days after launch, or after first 10 successful test donations)

**Recurring donor migration:** JC handles donor outreach; we handle technical switch.

---

## Pre-Launch Checklist Additions

JC-specific items beyond the standard Finalize checklist:

- [ ] Harness Giving page URL confirmed and reachable
- [ ] Coffee Chat playlist sync runs locally — first 10 episodes import correctly
- [ ] Annual report PDFs uploaded in Sanity Studio (year + title + file) for 3 most recent years
- [ ] Volunteer + referral form submission tests — Resend confirmation arrives, Turso row written
- [ ] Event registration test on a draft event — capacity counter updates
- [ ] Newsletter signup tagged correctly in AWeber list
- [ ] LocalBusiness JSON-LD validated via Schema.org Markup Validator

## Pre-Phase 2 Checklist

- [ ] Stripe live mode activated + bank account verified
- [ ] Recurring donor list exported from Harness Giving
- [ ] JC board sign-off on Stripe processing fees absorbed by donor vs. JC
- [ ] Recurring donor migration outreach started
- [ ] Test donation completed end-to-end via Stripe Checkout

---

## Open Decisions

- [ ] Phase 2 cutover trigger — fixed date or milestone-driven?
- [ ] Stripe processing fees — donor pays or JC absorbs?
- [ ] Auth-gated pages — does JC have a board portal, donor portal, or volunteer-only section requiring Auth0 gating? (If yes, mark `authRequired: true` on those pages in the Sitemap step.)

---

## Pipeline Doc Updates

After JC launches, update `../phifer-web-solutions-pipeline.md`:
- Add JC as the first Growth-tier reference build
- Note any platform-level lessons learned worth propagating to future Growth clients
- If anything that's currently JC-specific in this doc turns out to be reusable (e.g. Harness-to-Stripe cutover pattern for other nonprofits), promote it into the platform doc / codebase
