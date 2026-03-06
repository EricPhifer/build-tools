import { computed } from 'vue'
import { useRegistryStore } from '../stores/registry'
import type { SiteSection, BlockCategory } from '../types/registry'

export function useRegistry() {
  const store = useRegistryStore()

  const allVariants = computed(() => store.variants)
  const allTemplates = computed(() => store.templates)
  const allBlocks = computed(() => store.blocks)

  const sections: SiteSection[] = ['header', 'footer', 'main']

  function getVariantsForSection(section: SiteSection) {
    return store.getVariantsBySection(section)
  }

  function getVariantById(id: string) {
    return store.getVariantById(id)
  }

  function getTemplates() {
    return store.getTemplates()
  }

  function getTemplateById(id: string) {
    return store.getTemplateById(id)
  }

  function getBlocks() {
    return store.getBlocks()
  }

  function getBlocksByCategory(category: BlockCategory) {
    return store.getBlocksByCategory(category)
  }

  function getBlockById(id: string) {
    return store.getBlockById(id)
  }

  return {
    allVariants,
    allTemplates,
    allBlocks,
    sections,
    getVariantsForSection,
    getVariantById,
    getTemplates,
    getTemplateById,
    getBlocks,
    getBlocksByCategory,
    getBlockById
  }
}
