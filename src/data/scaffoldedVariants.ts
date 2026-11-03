// Header and footer variants the website template actually implements.
// Keep in step with HEADER_VARIANTS / FOOTER_VARIANTS in
// build-script/pws-scaffolder/lib/frontend.js: the scaffolder stops on any
// other id. The rest of the library stays browsable as design reference.
// No variant selected = the template's own default header / footer.
export const SCAFFOLDED_VARIANTS = new Set([
  'header-split-cta',
  'header-transparent-jc',
  'footer-big-cta',
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
])

export function isScaffoldedBlock(blockId: string): boolean {
  return SCAFFOLDED_BLOCKS.has(blockId)
}
