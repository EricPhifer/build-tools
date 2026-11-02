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
