import type { BundleType, SitemapPage } from '../types/registry'

// Pages flagged Enrich-only or Growth-only stay in the Sitemap (so moving the
// client up a bundle brings them back) but are left out of everything that
// builds the site: meta tags, menus, previews, the export and the scaffold.
const RANK: Record<BundleType, number> = { starter: 0, foundation: 1, enrich: 2, growth: 3 }

export function pageInBundle(page: Pick<SitemapPage, 'isEnrichOnly' | 'isGrowthOnly'>, bundle: BundleType | null | undefined): boolean {
  if (!bundle) return true
  if (page.isGrowthOnly) return RANK[bundle] >= RANK.growth
  if (page.isEnrichOnly) return RANK[bundle] >= RANK.enrich
  return true
}
