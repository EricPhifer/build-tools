// Header and footer variants the website template actually implements.
// Keep in step with HEADER_VARIANTS / FOOTER_VARIANTS in
// build-script/pws-scaffolder/lib/frontend.js: the scaffolder stops on any
// other id. The rest of the library stays browsable as design reference.
// No variant selected = the template's own default header / footer.
export const SCAFFOLDED_VARIANTS = new Set([
  'header-split',
  'header-split-cta',
  'header-centered',
  'header-minimal',
  'header-logo-split',
  'header-transparent',
  'header-utility-bar',
  'header-announcement',
  'header-transparent-jc',
  'footer-simple',
  'footer-columns',
  'footer-minimal',
  'footer-logo-tagline',
  'footer-big-cta',
  'footer-newsletter',
  'footer-mega',
  'footer-stacked-dark',
  'footer-divided',
  'footer-centered-full',
])

export function isScaffolded(variantId: string | null | undefined): boolean {
  return !variantId || SCAFFOLDED_VARIANTS.has(variantId)
}

// Content blocks that have a real section type in the website template and
// Studio. Keep in step with SECTION_TYPES in
// build-script/pws-scaffolder/lib/sections.js. Any other block still scaffolds,
// but the page gets no section for it (editors use Text Content instead).
export const SCAFFOLDED_BLOCKS = new Set([
  'block-hero',
  'block-features', 'block-services', 'block-service-list',
  'block-stats',
  'block-process', 'block-timeline',
  'block-testimonials',
  'block-pricing',
  'block-cta',
  'block-faq',
  'block-split',
  'block-contact', 'block-contact-info', 'block-contact-form',
  'block-text',
  'block-portfolio',
  'block-team',
  'block-gallery',
  'block-map',
  'block-video',
  'block-logos',
  'block-dynamic-form',
  'block-blog-preview',
  'block-transparency',
  'block-podcast-episodes',
  'block-video-grid',
  'block-divider-diagonal',
  'block-event-registration',
  'block-newsletter',
  'block-donation',
])

// Built only on Growth: they need the client's own database (`growthOnly` in
// SECTION_TYPES). On other tiers the scaffolder leaves them out.
export const GROWTH_ONLY_BLOCKS = new Set([
  'block-event-registration',
])

export function isScaffoldedBlock(blockId: string, bundle?: string | null): boolean {
  return SCAFFOLDED_BLOCKS.has(blockId) && (bundle === 'growth' || !GROWTH_ONLY_BLOCKS.has(blockId))
}
