import { defineStore } from 'pinia'
import type { ComponentVariant, SiteSection, PageTemplate, ContentBlock, BlockCategory } from '../types/registry'

// === Header Variants ===
// All header variants support an optional authEnabled field in siteSettings
// which toggles a login / account button in the header.
const headerVariants: ComponentVariant[] = [
  {
    id: 'header-centered',
    name: 'Centered Header',
    section: 'header',
    description: 'Logo and navigation centered, clean and minimal.',
    component: () => import('../components/variants/headers/HeaderCentered.vue'),
    tags: ['centered', 'clean', 'minimal'],
    styleNotes: 'Center-aligned layout. Desktop: logo h1 text-2xl font-bold centered, nav flex justify-center gap-8 hidden md:flex, auth/darkmode absolute right-6. Mobile: flex items-center justify-between px-6 py-4, hamburger toggle, menu absolute top-full z-50 bg-white px-6 py-4 flex flex-col gap-1 rounded-lg items. Border-b border-gray-200, bg-white, max-w-6xl mx-auto.',
    schemaRequirements: [
      {
        documentType: 'siteSettings',
        title: 'Site Settings',
        fields: [
          { name: 'siteName', type: 'string', description: 'Site name displayed in header', required: true },
          { name: 'authEnabled', type: 'boolean', description: 'Show login / account button in header' }
        ]
      },
      {
        documentType: 'navigation',
        title: 'Navigation',
        fields: [
          { name: 'items', type: 'array', description: 'Navigation menu items', of: 'menuItem', required: true }
        ]
      }
    ]
  },
  {
    id: 'header-split',
    name: 'Split Header',
    section: 'header',
    description: 'Logo left, navigation right — classic split layout with mobile hamburger.',
    component: () => import('../components/variants/headers/HeaderSplit.vue'),
    tags: ['split', 'classic', 'responsive'],
    styleNotes: 'Split logo-left nav-right. max-w-6xl mx-auto px-6 py-4 flex items-center justify-between. Logo h1 text-xl font-bold. Desktop nav: hidden md:flex gap-6, links text-gray-600 hover:text-gray-900 font-medium. Mobile: hamburger md:hidden p-2, menu absolute top-full z-50 max-w-6xl px-6 py-4 flex flex-col gap-1. Border-b border-gray-200, bg-white.',
    schemaRequirements: [
      {
        documentType: 'siteSettings',
        title: 'Site Settings',
        fields: [
          { name: 'siteName', type: 'string', description: 'Site name displayed in header', required: true },
          { name: 'logo', type: 'image', description: 'Site logo displayed in header' },
          { name: 'authEnabled', type: 'boolean', description: 'Show login / account button in header' }
        ]
      },
      {
        documentType: 'navigation',
        title: 'Navigation',
        fields: [
          { name: 'items', type: 'array', description: 'Navigation menu items', of: 'menuItem', required: true }
        ]
      }
    ]
  },
  {
    id: 'header-minimal',
    name: 'Minimal Header',
    section: 'header',
    description: 'Site name only with hamburger menu. Ultra-clean.',
    component: () => import('../components/variants/headers/HeaderMinimal.vue'),
    tags: ['minimal', 'hamburger', 'mobile-first'],
    styleNotes: 'Ultra-minimal single-line. max-w-6xl mx-auto px-6 py-3. Logo span text-lg font-semibold text-gray-800. Only hamburger on mobile md:hidden rounded-lg hover:bg-gray-100. Mobile menu: absolute top-full z-50 shadow-lg px-6 py-4 flex flex-col gap-1, items px-3 py-2.5 rounded-lg text-sm font-medium. Border-b border-gray-100, bg-white.',
    schemaRequirements: [
      {
        documentType: 'siteSettings',
        title: 'Site Settings',
        fields: [
          { name: 'siteName', type: 'string', description: 'Site name displayed in header', required: true },
          { name: 'authEnabled', type: 'boolean', description: 'Show login / account button in header' }
        ]
      }
    ]
  },

  // ── Foundation additions ──────────────────────────────────────────────────
  {
    id: 'header-split-cta',
    name: 'Split + CTA',
    section: 'header',
    description: 'Logo left, nav center, prominent CTA button right. Ideal for service businesses.',
    component: () => import('../components/variants/headers/HeaderSplitCta.vue'),
    tags: ['split', 'cta', 'service', 'foundation'],
    styleNotes: 'Logo left, nav center flex-1, CTA button right. max-w-6xl mx-auto px-6 py-4 gap-8. Desktop nav: hidden md:flex gap-6. CTA: px-4 py-2 rounded-lg bg-blue-600 text-white font-medium. Mobile menu separates nav from CTA with pt-3 border-t border-gray-100 mt-2. Links text-gray-600 hover:text-gray-900 text-sm font-medium. Border-b border-gray-200, bg-white.',
    schemaRequirements: [
      {
        documentType: 'siteSettings',
        title: 'Site Settings',
        fields: [
          { name: 'siteName', type: 'string', description: 'Site name displayed in header', required: true },
          { name: 'logo', type: 'image', description: 'Site logo' },
          { name: 'ctaLabel', type: 'string', description: 'CTA button label (e.g. "Book Now")', required: true },
          { name: 'ctaUrl', type: 'string', description: 'CTA button destination URL', required: true },
          { name: 'authEnabled', type: 'boolean', description: 'Show login / account button in header' }
        ]
      },
      {
        documentType: 'navigation',
        title: 'Navigation',
        fields: [
          { name: 'items', type: 'array', description: 'Navigation menu items', of: 'menuItem', required: true }
        ]
      }
    ]
  },
  {
    id: 'header-logo-split',
    name: 'Logo Center Split',
    section: 'header',
    description: 'Centered logo with nav links balanced left and right. Brand-forward layout.',
    component: () => import('../components/variants/headers/HeaderLogoSplit.vue'),
    tags: ['centered-logo', 'split-nav', 'brand', 'restaurant', 'boutique', 'foundation'],
    styleNotes: 'Logo centered, nav split left/right. max-w-6xl mx-auto px-6 py-4 hidden md:flex gap-6. Logo h1 text-xl font-bold px-6 shrink-0. Nav items split via computed leftLinks/rightLinks, text-sm font-medium text-gray-600 hover:text-gray-900. Mobile: logo centered, hamburger toggles single-column menu px-3 py-2.5. Border-b border-gray-200, bg-white.',
    schemaRequirements: [
      {
        documentType: 'siteSettings',
        title: 'Site Settings',
        fields: [
          { name: 'siteName', type: 'string', description: 'Site name displayed in header', required: true },
          { name: 'logo', type: 'image', description: 'Site logo (centered)' },
          { name: 'authEnabled', type: 'boolean', description: 'Show login / account button in header' }
        ]
      },
      {
        documentType: 'navigation',
        title: 'Navigation',
        fields: [
          { name: 'items', type: 'array', description: 'Navigation items — split evenly left/right of logo', of: 'menuItem', required: true }
        ]
      }
    ]
  },

  // ── Enrich additions ──────────────────────────────────────────────────────
  {
    id: 'header-dropdown',
    name: 'Dropdown Nav',
    section: 'header',
    description: 'Logo left, nav with hover/click dropdown submenus, CTA button right.',
    component: () => import('../components/variants/headers/HeaderDropdown.vue'),
    tags: ['dropdown', 'nested', 'submenu', 'enrich'],
    styleNotes: 'Logo left, nav with dropdown submenus, CTA right. max-w-6xl mx-auto px-6 py-4 gap-8. Desktop nav: hidden md:flex gap-1, relative divs with mouseenter/mouseleave. Dropdown: absolute top-full mt-1 w-48 rounded-xl shadow-lg py-1 z-50 bg-white. Items px-4 py-2.5 text-sm. Mobile: expandable sections with ml-4 indentation. CTA px-4 py-2 rounded-lg bg-blue-600. Border-b border-gray-200, bg-white.',
    schemaRequirements: [
      {
        documentType: 'siteSettings',
        title: 'Site Settings',
        fields: [
          { name: 'siteName', type: 'string', description: 'Site name displayed in header', required: true },
          { name: 'logo', type: 'image', description: 'Site logo' },
          { name: 'ctaLabel', type: 'string', description: 'CTA button label' },
          { name: 'ctaUrl', type: 'string', description: 'CTA button URL' },
          { name: 'authEnabled', type: 'boolean', description: 'Show login / account button in header' }
        ]
      },
      {
        documentType: 'navigation',
        title: 'Navigation',
        fields: [
          { name: 'items', type: 'array', description: 'Navigation items — each may include a children array for dropdowns', of: 'menuItem', required: true }
        ]
      }
    ]
  },
  {
    id: 'header-transparent',
    name: 'Transparent Hero',
    section: 'header',
    description: 'Starts transparent over hero image, transitions to solid background on scroll.',
    component: () => import('../components/variants/headers/HeaderTransparent.vue'),
    tags: ['transparent', 'hero', 'scroll', 'hospitality', 'creative', 'enrich'],
    styleNotes: 'Transparent → solid on scroll. Preview: relative, live: fixed top-0 left-0 right-0 z-50. Scrolled: bg-white border-b shadow-sm, text switches gray-600/gray-900. Unscrolled: text-white/90. Desktop nav: hidden md:flex gap-6. Mobile hamburger, menu bg-white always. max-w-6xl mx-auto px-6 py-4, duration-300 transitions.',
    schemaRequirements: [
      {
        documentType: 'siteSettings',
        title: 'Site Settings',
        fields: [
          { name: 'siteName', type: 'string', description: 'Site name displayed in header', required: true },
          { name: 'logo', type: 'image', description: 'Site logo (light version recommended for transparent state)' },
          { name: 'authEnabled', type: 'boolean', description: 'Show login / account button in header' }
        ]
      },
      {
        documentType: 'navigation',
        title: 'Navigation',
        fields: [
          { name: 'items', type: 'array', description: 'Navigation menu items', of: 'menuItem', required: true }
        ]
      }
    ]
  },
  {
    id: 'header-announcement',
    name: 'Announcement Bar',
    section: 'header',
    description: 'Dismissible promo/alert bar above the main nav. Great for promotions and events.',
    component: () => import('../components/variants/headers/HeaderAnnouncement.vue'),
    tags: ['announcement', 'promo', 'alert', 'ecommerce', 'events', 'enrich'],
    styleNotes: 'Two-part: announcement bar + main header. Bar: bg-blue-600 text-white text-sm px-6 py-2 flex justify-center gap-4, dismissible button, optional link. Main: max-w-6xl mx-auto px-6 py-4 bg-white border-b border-gray-200. Desktop nav: hidden md:flex gap-6. Mobile menu absolute top-full z-50. Links text-gray-600 text-sm font-medium.',
    schemaRequirements: [
      {
        documentType: 'siteSettings',
        title: 'Site Settings',
        fields: [
          { name: 'siteName', type: 'string', description: 'Site name displayed in header', required: true },
          { name: 'logo', type: 'image', description: 'Site logo' },
          { name: 'authEnabled', type: 'boolean', description: 'Show login / account button in header' }
        ]
      },
      {
        documentType: 'navigation',
        title: 'Navigation',
        fields: [
          { name: 'items', type: 'array', description: 'Navigation menu items', of: 'menuItem', required: true }
        ]
      },
      {
        documentType: 'announcementBar',
        title: 'Announcement Bar',
        fields: [
          { name: 'text', type: 'string', description: 'Announcement message text', required: true },
          { name: 'linkLabel', type: 'string', description: 'Optional link label (e.g. "Learn more")' },
          { name: 'linkUrl', type: 'string', description: 'Optional link destination' },
          { name: 'dismissible', type: 'boolean', description: 'Whether the bar can be dismissed by the user' }
        ]
      }
    ]
  },

  // ── Growth additions ──────────────────────────────────────────────────────
  {
    id: 'header-utility-bar',
    name: 'Utility Bar',
    section: 'header',
    description: 'Two-row header: top utility row with phone, hours, and social links; main nav below.',
    component: () => import('../components/variants/headers/HeaderUtilityBar.vue'),
    tags: ['utility-bar', 'two-row', 'healthcare', 'professional', 'growth'],
    styleNotes: 'Two-row header. Top utility bar: bg-gray-800 text-gray-300 text-xs px-6 py-2, flex gap-5 with phone/hours icons w-3.5 h-3.5, social icons. Main nav: bg-white border-b px-6 py-4. Desktop nav: hidden md:flex gap-6 text-sm font-medium. Mobile: hamburger toggles menu with px-3 py-2.5 items. max-w-6xl mx-auto throughout.',
    schemaRequirements: [
      {
        documentType: 'siteSettings',
        title: 'Site Settings',
        fields: [
          { name: 'siteName', type: 'string', description: 'Site name displayed in header', required: true },
          { name: 'logo', type: 'image', description: 'Site logo' },
          { name: 'authEnabled', type: 'boolean', description: 'Show login / account button in header' }
        ]
      },
      {
        documentType: 'navigation',
        title: 'Navigation',
        fields: [
          { name: 'items', type: 'array', description: 'Primary navigation items', of: 'menuItem', required: true }
        ]
      },
      {
        documentType: 'utilityBar',
        title: 'Utility Bar',
        fields: [
          { name: 'phone', type: 'string', description: 'Phone number displayed in utility row' },
          { name: 'hoursLabel', type: 'string', description: 'Business hours label (e.g. "Mon–Fri 9am–5pm")' },
          { name: 'socialLinks', type: 'array', description: 'Social media links in utility row', of: 'socialLink' }
        ]
      }
    ]
  },
  {
    id: 'header-search',
    name: 'Nav + Search',
    section: 'header',
    description: 'Logo left, nav, and a search icon that expands inline or opens a modal overlay.',
    component: () => import('../components/variants/headers/HeaderSearch.vue'),
    tags: ['search', 'media', 'saas', 'publishing', 'growth'],
    styleNotes: 'Logo left, nav center, search+auth right. max-w-6xl mx-auto px-6 py-4 gap-6. Search: conditional render, border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 when open, input w-40 bg-transparent placeholder-gray-400 focus:outline-none. Nav text-sm font-medium text-gray-600. Mobile: search icon toggles input above nav. Border-b border-gray-200, bg-white.',
    schemaRequirements: [
      {
        documentType: 'siteSettings',
        title: 'Site Settings',
        fields: [
          { name: 'siteName', type: 'string', description: 'Site name displayed in header', required: true },
          { name: 'logo', type: 'image', description: 'Site logo' },
          { name: 'searchEnabled', type: 'boolean', description: 'Toggle site-wide search on/off' },
          { name: 'authEnabled', type: 'boolean', description: 'Show login / account button in header' }
        ]
      },
      {
        documentType: 'navigation',
        title: 'Navigation',
        fields: [
          { name: 'items', type: 'array', description: 'Navigation menu items', of: 'menuItem', required: true }
        ]
      }
    ]
  },
  {
    id: 'header-mega-menu',
    name: 'Mega Menu',
    section: 'header',
    description: 'Full-width dropdown panel with column groups, icons, and optional featured card. Enterprise/SaaS standard.',
    component: () => import('../components/variants/headers/HeaderMegaMenu.vue'),
    tags: ['mega-menu', 'saas', 'enterprise', 'columns', 'growth'],
    styleNotes: 'Logo left, nav with mega panels, CTA right. max-w-6xl mx-auto px-6 py-4. Desktop nav: hidden md:flex gap-1. Mega panel: absolute left-0 right-0 bg-white shadow-xl z-50 px-6 py-8. Columns: flex gap-12, min-w-35 each. Featured card: w-56 bg-blue-50 rounded-xl p-5. Mobile: expandable sections ml-4. CTA px-4 py-2 rounded-lg bg-blue-600. Border-b border-gray-200, bg-white.',
    schemaRequirements: [
      {
        documentType: 'siteSettings',
        title: 'Site Settings',
        fields: [
          { name: 'siteName', type: 'string', description: 'Site name displayed in header', required: true },
          { name: 'logo', type: 'image', description: 'Site logo' },
          { name: 'ctaLabel', type: 'string', description: 'Header CTA button label' },
          { name: 'ctaUrl', type: 'string', description: 'Header CTA button URL' },
          { name: 'authEnabled', type: 'boolean', description: 'Show login / account button in header' }
        ]
      },
      {
        documentType: 'navigation',
        title: 'Navigation',
        fields: [
          { name: 'items', type: 'array', description: 'Top-level nav items — each may include megaMenuSections with column groups and a featured card', of: 'menuItem', required: true }
        ]
      }
    ]
  },
  {
    id: 'header-sidebar',
    name: 'Sidebar Nav',
    section: 'header',
    description: 'Fixed collapsible left sidebar — replaces top header for dashboard and app builds.',
    component: () => import('../components/variants/headers/HeaderSidebar.vue'),
    tags: ['sidebar', 'dashboard', 'app', 'vertical', 'collapsible', 'growth'],
    styleNotes: 'Fixed vertical sidebar. flex flex-col bg-gray-900 text-white min-h-[300px] transition-all duration-300. Collapsed: w-16, expanded: w-56. Header: flex px-4 py-5 border-b border-gray-700. Nav: flex-1 p-3 space-y-1, items px-3 py-2.5 rounded-lg text-sm. First item bg-blue-600, others text-gray-300 hover:bg-gray-700. Dark mode + auth panels: border-t border-gray-700 p-3 bottom. Icons w-5 h-5 shrink-0.',
    schemaRequirements: [
      {
        documentType: 'siteSettings',
        title: 'Site Settings',
        fields: [
          { name: 'siteName', type: 'string', description: 'App or site name shown in sidebar header', required: true },
          { name: 'logo', type: 'image', description: 'App logo displayed in sidebar' },
          { name: 'authEnabled', type: 'boolean', description: 'Show user account panel at bottom of sidebar' }
        ]
      },
      {
        documentType: 'navigation',
        title: 'Navigation',
        fields: [
          { name: 'items', type: 'array', description: 'Sidebar navigation items with optional icon and section grouping', of: 'menuItem', required: true }
        ]
      }
    ]
  },

  // ── Auth-forward variant ──────────────────────────────────────────────────
  {
    id: 'header-auth',
    name: 'Auth Header',
    section: 'header',
    description: 'Portal-focused header built around the authenticated user — avatar, role, notifications, and account dropdown.',
    component: () => import('../components/variants/headers/HeaderAuth.vue'),
    tags: ['auth', 'portal', 'dashboard', 'account', 'growth'],
    styleNotes: 'Auth-forward header. max-w-6xl mx-auto px-6 py-3 flex justify-between. Logo: flex gap-3 w-8 h-8 rounded-lg bg-blue-600. Desktop nav: hidden md:flex gap-1, items px-3 py-2 rounded-md text-sm. Logged-in: notifications dropdown (abs right-0 w-80 z-50), avatar w-7 h-7 rounded-full bg-blue-600, account menu abs right-0 w-56 z-50. Mobile hamburger md:hidden. Border-b border-gray-200, bg-white.',
    schemaRequirements: [
      {
        documentType: 'siteSettings',
        title: 'Site Settings',
        fields: [
          { name: 'siteName', type: 'string', description: 'App or portal name shown in header', required: true },
          { name: 'logo', type: 'image', description: 'App logo' },
          { name: 'authEnabled', type: 'boolean', description: 'Always true for this variant — auth is the primary affordance' }
        ]
      },
      {
        documentType: 'navigation',
        title: 'Navigation',
        fields: [
          { name: 'items', type: 'array', description: 'Navigation items displayed alongside the auth controls', of: 'menuItem', required: true }
        ]
      }
    ]
  }
]

// === Footer Variants ===
const footerVariants: ComponentVariant[] = [
  {
    id: 'footer-simple',
    name: 'Simple Footer',
    section: 'footer',
    description: 'Centered copyright with optional social links.',
    component: () => import('../components/variants/footers/FooterSimple.vue'),
    tags: ['simple', 'centered', 'social'],
    styleNotes: 'Minimal centered footer. bg-gray-50 border-t border-gray-200, max-w-6xl mx-auto px-6 py-8 text-center. Social: flex justify-center gap-6 mb-4 text-gray-500 text-sm hover:text-gray-700. Nav: flex justify-center gap-5 mb-4 text-xs text-gray-400 hover:text-gray-600 whitespace-nowrap. Copyright: text-sm text-gray-500.',
    schemaRequirements: [
      {
        documentType: 'siteSettings',
        title: 'Site Settings',
        fields: [
          { name: 'copyrightText', type: 'string', description: 'Copyright text in footer' }
        ]
      },
      {
        documentType: 'socialLinks',
        title: 'Social Links',
        fields: [
          { name: 'items', type: 'array', description: 'Social media links', of: 'socialLink' }
        ]
      }
    ]
  },
  {
    id: 'footer-columns',
    name: 'Column Footer',
    section: 'footer',
    description: 'Multi-column footer with link groups and copyright bar.',
    component: () => import('../components/variants/footers/FooterColumns.vue'),
    tags: ['columns', 'links', 'corporate'],
    styleNotes: 'Dark multi-column footer. bg-gray-900 text-gray-300, max-w-6xl mx-auto px-6 py-12. Columns: grid grid-cols-2 md:grid-cols-3 gap-8 mb-8. Headers h3: text-white font-semibold mb-3. Links: text-sm hover:text-white space-y-2. Bottom: border-t border-gray-700 pt-6 text-center text-sm text-gray-500.',
    schemaRequirements: [
      {
        documentType: 'siteSettings',
        title: 'Site Settings',
        fields: [
          { name: 'copyrightText', type: 'string', description: 'Copyright text in footer' }
        ]
      },
      {
        documentType: 'footerColumns',
        title: 'Footer Columns',
        fields: [
          { name: 'columns', type: 'array', description: 'Column groups with title and links', of: 'footerColumn', required: true }
        ]
      }
    ]
  },
  {
    id: 'footer-minimal',
    name: 'Minimal Footer',
    section: 'footer',
    description: 'Single-line minimal footer with just copyright text.',
    component: () => import('../components/variants/footers/FooterMinimal.vue'),
    tags: ['minimal', 'single-line', 'clean'],
    styleNotes: 'Single-line footer. bg-white border-t border-gray-100, max-w-6xl mx-auto px-6 py-4 flex justify-center gap-6 flex-wrap. Links: text-xs text-gray-400 hover:text-gray-600. Separator: text-gray-300 text-xs. Copyright: text-xs text-gray-400.',
    schemaRequirements: [
      {
        documentType: 'siteSettings',
        title: 'Site Settings',
        fields: [
          { name: 'copyrightText', type: 'string', description: 'Copyright text in footer' }
        ]
      }
    ]
  },
  {
    id: 'footer-logo-tagline',
    name: 'Logo + Tagline Footer',
    section: 'footer',
    description: 'Centered brand name with tagline, social icon circles, and copyright.',
    component: () => import('../components/variants/footers/FooterLogoTagline.vue'),
    tags: ['brand', 'centered', 'social', 'minimal'],
    styleNotes: 'Centered brand footer. bg-white border-t border-gray-100, max-w-6xl mx-auto px-6 py-14 text-center. Brand h2: text-3xl font-bold text-gray-900 mb-2. Tagline: text-gray-500 text-base mb-10 max-w-sm mx-auto. Social: flex justify-center gap-3 mb-10, w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200. Links: flex justify-center gap-6 flex-wrap mb-6 text-xs. Copyright: border-t border-gray-100 pt-6 text-sm text-gray-400.',
    schemaRequirements: [
      {
        documentType: 'siteSettings',
        title: 'Site Settings',
        fields: [
          { name: 'siteName', type: 'string', description: 'Brand name displayed in footer' },
          { name: 'tagline', type: 'string', description: 'Short tagline beneath brand name' },
          { name: 'copyrightText', type: 'string', description: 'Copyright text in footer' }
        ]
      },
      {
        documentType: 'socialLinks',
        title: 'Social Links',
        fields: [
          { name: 'items', type: 'array', description: 'Social media links', of: 'socialLink' }
        ]
      }
    ]
  },
  {
    id: 'footer-big-cta',
    name: 'Big CTA Footer',
    section: 'footer',
    description: 'Dark band with bold call-to-action headline and button, slim copyright bar.',
    component: () => import('../components/variants/footers/FooterBigCta.vue'),
    tags: ['cta', 'conversion', 'dark', 'bold'],
    styleNotes: 'Two-section footer. CTA band: bg-gray-900 text-white px-6 py-16, max-w-3xl mx-auto text-center. Headline h2: text-3xl font-bold mb-3. Subtext: text-gray-400 text-lg mb-8. Button: px-8 py-3 rounded-xl bg-white text-gray-900 font-semibold hover:bg-gray-100. Bottom bar: bg-black px-6 py-5. Nav: flex justify-center gap-5 flex-wrap mb-3 text-xs text-gray-600 hover:text-gray-400. Copyright + social: flex justify-between gap-4 flex-wrap text-sm text-gray-500.',
    schemaRequirements: [
      {
        documentType: 'siteSettings',
        title: 'Site Settings',
        fields: [
          { name: 'ctaHeadline', type: 'string', description: 'CTA headline in footer band' },
          { name: 'ctaSubtext', type: 'string', description: 'Supporting text beneath CTA headline' },
          { name: 'ctaLabel', type: 'string', description: 'CTA button label' },
          { name: 'ctaUrl', type: 'url', description: 'CTA button destination URL' },
          { name: 'copyrightText', type: 'string', description: 'Copyright text in footer' }
        ]
      },
      {
        documentType: 'socialLinks',
        title: 'Social Links',
        fields: [
          { name: 'items', type: 'array', description: 'Social media links', of: 'socialLink' }
        ]
      }
    ]
  },
  {
    id: 'footer-newsletter',
    name: 'Newsletter Footer',
    section: 'footer',
    description: 'Email signup form alongside link columns — ideal for blogs and SaaS.',
    component: () => import('../components/variants/footers/FooterNewsletter.vue'),
    tags: ['newsletter', 'email', 'signup', 'links'],
    styleNotes: 'Newsletter footer. bg-white border-t border-gray-200, max-w-6xl mx-auto px-6 py-12. Grid md:grid-cols-2 gap-10 mb-10. Left: newsletter form, input px-4 py-2.5 rounded-lg border border-gray-200 flex-1, button px-5 py-2.5 rounded-lg bg-gray-900 text-white. Right: grid grid-cols-2 gap-8, headers text-sm font-semibold mb-3. Bottom: border-t border-gray-100 pt-6 copyright text-sm text-gray-400 and social links.',
    schemaRequirements: [
      {
        documentType: 'siteSettings',
        title: 'Site Settings',
        fields: [
          { name: 'newsletterHeadline', type: 'string', description: 'Newsletter section headline' },
          { name: 'newsletterSubtext', type: 'string', description: 'Supporting text for newsletter signup' },
          { name: 'copyrightText', type: 'string', description: 'Copyright text in footer' }
        ]
      },
      {
        documentType: 'footerColumns',
        title: 'Footer Columns',
        fields: [
          { name: 'columns', type: 'array', description: 'Column groups with title and links', of: 'footerColumn', required: true }
        ]
      },
      {
        documentType: 'socialLinks',
        title: 'Social Links',
        fields: [
          { name: 'items', type: 'array', description: 'Social media links', of: 'socialLink' }
        ]
      }
    ]
  },
  {
    id: 'footer-mega',
    name: 'Mega Footer',
    section: 'footer',
    description: 'Brand column with description and socials plus three link group columns.',
    component: () => import('../components/variants/footers/FooterMega.vue'),
    tags: ['mega', 'columns', 'brand', 'agency'],
    styleNotes: 'Wide multi-column footer. bg-white border-t border-gray-200, max-w-6xl mx-auto px-6 py-12. Grid md:grid-cols-4 gap-8 mb-10. Brand column: h2 text-xl font-bold mb-2, description text-sm text-gray-500 mb-5. Link columns: h3 text-sm font-semibold text-gray-900 mb-3, ul space-y-2.5 text-sm. Social: flex gap-2, w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200. Bottom: border-t border-gray-100 pt-6 text-sm text-gray-400.',
    schemaRequirements: [
      {
        documentType: 'siteSettings',
        title: 'Site Settings',
        fields: [
          { name: 'siteName', type: 'string', description: 'Brand name in footer' },
          { name: 'description', type: 'text', description: 'Short brand description' },
          { name: 'copyrightText', type: 'string', description: 'Copyright text in footer' }
        ]
      },
      {
        documentType: 'footerColumns',
        title: 'Footer Columns',
        fields: [
          { name: 'columns', type: 'array', description: 'Column groups with title and links', of: 'footerColumn', required: true }
        ]
      },
      {
        documentType: 'socialLinks',
        title: 'Social Links',
        fields: [
          { name: 'items', type: 'array', description: 'Social media links', of: 'socialLink' }
        ]
      }
    ]
  },
  {
    id: 'footer-stacked-dark',
    name: 'Stacked Dark Footer',
    section: 'footer',
    description: 'Dark footer with brand description and socials left, link columns right.',
    component: () => import('../components/variants/footers/FooterStackedDark.vue'),
    tags: ['dark', 'stacked', 'brand', 'columns'],
    styleNotes: 'Dark stacked footer. bg-gray-900 text-gray-300, max-w-6xl mx-auto px-6 py-12. Grid md:grid-cols-3 gap-10 mb-10. Brand: h2 text-xl font-bold text-white mb-3, description text-sm text-gray-400 mb-6. Link columns: h3 text-sm font-semibold text-white mb-4, ul space-y-2.5 text-sm text-gray-400 hover:text-white. Social: flex gap-2, w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700. Bottom: border-t border-gray-800 pt-6 text-sm text-gray-500.',
    schemaRequirements: [
      {
        documentType: 'siteSettings',
        title: 'Site Settings',
        fields: [
          { name: 'siteName', type: 'string', description: 'Brand name in footer' },
          { name: 'description', type: 'text', description: 'Short brand description' },
          { name: 'copyrightText', type: 'string', description: 'Copyright text in footer' }
        ]
      },
      {
        documentType: 'footerColumns',
        title: 'Footer Columns',
        fields: [
          { name: 'columns', type: 'array', description: 'Column groups with title and links', of: 'footerColumn', required: true }
        ]
      },
      {
        documentType: 'socialLinks',
        title: 'Social Links',
        fields: [
          { name: 'items', type: 'array', description: 'Social media links', of: 'socialLink' }
        ]
      }
    ]
  },
  {
    id: 'footer-divided',
    name: 'Divided Footer',
    section: 'footer',
    description: 'Three-row layout with horizontal dividers — brand, nav links, copyright.',
    component: () => import('../components/variants/footers/FooterDivided.vue'),
    tags: ['divided', 'clean', 'structured', 'minimal'],
    styleNotes: 'Minimal divided rows. bg-white border-t border-gray-200, max-w-6xl mx-auto px-6. Row 1: py-6 flex justify-between gap-4 flex-wrap, logo text-lg font-bold, social text-sm text-gray-500 hover:text-gray-800. Row 2: py-5 border-t border-gray-100, nav flex justify-center gap-7 flex-wrap text-sm. Row 3: py-4 border-t border-gray-100, copyright text-xs text-gray-400 text-center.',
    schemaRequirements: [
      {
        documentType: 'siteSettings',
        title: 'Site Settings',
        fields: [
          { name: 'siteName', type: 'string', description: 'Brand name in footer' },
          { name: 'copyrightText', type: 'string', description: 'Copyright text in footer' }
        ]
      },
      {
        documentType: 'socialLinks',
        title: 'Social Links',
        fields: [
          { name: 'items', type: 'array', description: 'Social media links', of: 'socialLink' }
        ]
      },
      {
        documentType: 'siteNavigation',
        title: 'Site Navigation',
        fields: [
          { name: 'footerLinks', type: 'array', description: 'Footer navigation links', of: 'navLink' }
        ]
      }
    ]
  },
  {
    id: 'footer-centered-full',
    name: 'Centered Full Footer',
    section: 'footer',
    description: 'Fully centered stacked layout — brand, tagline, nav links, social icons, copyright.',
    component: () => import('../components/variants/footers/FooterCenteredFull.vue'),
    tags: ['centered', 'full', 'stacked', 'clean'],
    styleNotes: 'Centered full footer. bg-gray-50 border-t border-gray-200, max-w-6xl mx-auto px-6 py-14 flex flex-col items-center text-center gap-7. Brand h2: text-2xl font-bold text-gray-900 mb-1, tagline text-gray-500 text-sm. Nav: flex flex-wrap justify-center gap-x-7 gap-y-2 text-sm text-gray-500 hover:text-gray-800. Social: flex justify-center gap-3, w-9 h-9 rounded-full bg-white border border-gray-200 hover:border-gray-300. Copyright: text-xs text-gray-400.',
    schemaRequirements: [
      {
        documentType: 'siteSettings',
        title: 'Site Settings',
        fields: [
          { name: 'siteName', type: 'string', description: 'Brand name in footer' },
          { name: 'tagline', type: 'string', description: 'Short tagline beneath brand name' },
          { name: 'copyrightText', type: 'string', description: 'Copyright text in footer' }
        ]
      },
      {
        documentType: 'socialLinks',
        title: 'Social Links',
        fields: [
          { name: 'items', type: 'array', description: 'Social media links', of: 'socialLink' }
        ]
      },
      {
        documentType: 'siteNavigation',
        title: 'Site Navigation',
        fields: [
          { name: 'footerLinks', type: 'array', description: 'Footer navigation links', of: 'navLink' }
        ]
      }
    ]
  }
]

// === Page Templates ===
const pageTemplates: PageTemplate[] = [
  {
    id: 'template-full-width',
    name: 'Full Width',
    description: 'Single column layout — content blocks stack vertically across the full width.',
    component: () => import('../components/variants/templates/TemplateFullWidth.vue'),
    layout: ['content'],
    tags: ['full-width', 'simple', 'single-column'],
    styleNotes: 'Full width layout. Single content slot, no sidebar. Content renders edge-to-edge within page container. p-6 space-y-4.'
  },
  {
    id: 'template-sidebar-left',
    name: 'Sidebar Left',
    description: 'Left sidebar with main content area — ideal for navigation or filters.',
    component: () => import('../components/variants/templates/TemplateSidebarLeft.vue'),
    layout: ['header', 'sidebar', 'content'],
    tags: ['sidebar', 'two-column', 'navigation'],
    styleNotes: 'Left sidebar layout. Two-section flex. Sidebar w-1/4 border-r p-4 bg-gray-50. Content flex-1 p-6. Header slot: border-b h-20 bg-gray-700 rounded-lg.'
  },
  {
    id: 'template-sidebar-right',
    name: 'Sidebar Right',
    description: 'Main content with right sidebar — great for related content or widgets.',
    component: () => import('../components/variants/templates/TemplateSidebarRight.vue'),
    layout: ['header', 'content', 'sidebar'],
    tags: ['sidebar', 'two-column', 'widgets'],
    styleNotes: 'Right sidebar layout. Two-section flex. Content flex-1 p-6. Sidebar w-1/4 border-l p-4 bg-gray-50. Header slot: border-b h-20 bg-gray-700 rounded-lg.'
  },
  {
    id: 'template-narrow',
    name: 'Narrow / Article',
    description: 'Centered narrow column — ideal for long-form articles, blogs, and documentation.',
    component: () => import('../components/variants/templates/TemplateNarrow.vue'),
    layout: ['content'],
    tags: ['narrow', 'article', 'blog', 'prose', 'reading'],
    styleNotes: 'Narrow article layout. Single content slot max-w-2xl mx-auto px-6 py-6. Ideal for long-form text content like blog posts or legal pages.'
  },
  {
    id: 'template-wide',
    name: 'Wide / Full Bleed',
    description: 'Edge-to-edge layout with no padding constraints — best for galleries and visual showcases.',
    component: () => import('../components/variants/templates/TemplateWide.vue'),
    layout: ['content'],
    tags: ['wide', 'full-bleed', 'gallery', 'visual', 'portfolio'],
    styleNotes: 'Wide/full-bleed layout. Content renders edge-to-edge with no padding. space-y-2. For landing pages with full-width hero sections and feature bands.'
  },
  {
    id: 'template-sticky-left',
    name: 'Sticky Sidebar Left',
    description: 'Left sidebar that sticks while the main content scrolls — great for table of contents or filters.',
    component: () => import('../components/variants/templates/TemplateStickyLeft.vue'),
    layout: ['header', 'sidebar', 'content'],
    tags: ['sticky', 'sidebar', 'toc', 'filters', 'docs'],
    styleNotes: 'Sticky sidebar left. Sidebar w-1/4 border-r p-4 bg-gray-50 self-start sticky top-0. Content flex-1 p-6 scrollable. Header slot: border-b h-20.'
  },
  {
    id: 'template-two-column',
    name: 'Two Column Equal',
    description: 'Two equally-sized columns side by side — perfect for comparison or split content.',
    component: () => import('../components/variants/templates/TemplateTwoColumn.vue'),
    layout: ['header', 'content', 'right'],
    tags: ['two-column', 'equal', 'comparison', 'split'],
    styleNotes: 'Two equal columns. Header slot: border-b h-20. Two-column flex: each flex-1 p-5. Left: content slot. Right: col2 slot. Both equal width.'
  },
  {
    id: 'template-three-column',
    name: 'Three Column',
    description: 'Three equal columns — ideal for feature grids, services, or card-based content.',
    component: () => import('../components/variants/templates/TemplateThreeColumn.vue'),
    layout: ['header', 'content', 'col2', 'col3'],
    tags: ['three-column', 'grid', 'features', 'cards'],
    styleNotes: 'Three equal columns. Header slot: border-b h-20. Three-column flex: each flex-1 p-4 with border-r between. Col 1: content, Col 2: col2 slot, Col 3: col3 slot.'
  },
  {
    id: 'template-narrow-sidebar',
    name: 'Narrow + Sidebar',
    description: 'Narrow readable main area with a compact right sidebar for related links or TOC.',
    component: () => import('../components/variants/templates/TemplateNarrowSidebar.vue'),
    layout: ['header', 'content', 'sidebar'],
    tags: ['narrow', 'sidebar', 'article', 'toc', 'related'],
    styleNotes: 'Narrow article + sidebar. Content flex-1 p-6 max-w-lg mx-auto. Sidebar w-56 border-l p-4 bg-gray-50 for related content/TOC. Header slot: border-b h-20.'
  },
  {
    id: 'template-landing',
    name: 'Landing / Conversion',
    description: 'Full-width sections with no max-width — designed for high-converting landing pages.',
    component: () => import('../components/variants/templates/TemplateLanding.vue'),
    layout: ['content'],
    tags: ['landing', 'conversion', 'marketing', 'full-width', 'cta'],
    styleNotes: 'Landing page layout. Hero zone h-28 bg-gray-700. Feature sections h-14 bg-gray-200/100. CTA zone h-14 bg-gray-600. Content in space-y-2 px-3 pb-3. Designed for conversion-focused pages.',
    defaultBlocks: { content: ['block-hero', 'block-cta'] },
    requiredBlocks: { content: ['block-hero', 'block-cta'] }
  },
  {
    id: 'template-magazine',
    name: 'Magazine / Featured',
    description: 'Full-width featured zone with a 2/3 + 1/3 content grid below — editorial style.',
    component: () => import('../components/variants/templates/TemplateMagazine.vue'),
    layout: ['featured', 'content', 'secondary'],
    tags: ['magazine', 'editorial', 'featured', 'news', 'blog'],
    styleNotes: 'Magazine layout. Featured zone: border-b h-24 bg-gray-300. Two-column: primary flex-[2] border-r p-4 (2/3 width), secondary flex-1 p-4 bg-gray-50 (1/3 width). For content-heavy pages with featured content.',
    defaultBlocks: { featured: ['block-hero'] },
    requiredBlocks: { featured: ['block-hero'] }
  }
]

// === Content Blocks ===
const contentBlocks: ContentBlock[] = [
  {
    id: 'block-hero',
    name: 'Hero Section',
    description: 'Large hero area with headline, subtitle, and call-to-action button.',
    component: () => import('../components/variants/blocks/BlockHero.vue'),
    category: 'hero',
    fullWidthOnly: true,
    tags: ['hero', 'banner', 'cta'],
    styleNotes: 'Full-width gradient hero. Inline background-image linear-gradient(135deg, primaryColor, secondaryColor). max-w-4xl mx-auto px-6 py-24 text-center text-white. Title h1: text-4xl md:text-5xl font-bold mb-4 leading-tight. Subtitle: text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto. CTA button: inline-block bg-white font-semibold px-8 py-3 rounded-lg with dynamic primaryColor text.',
    schemaRequirements: [
      {
        documentType: 'page',
        title: 'Page',
        fields: [
          { name: 'heroTitle', type: 'string', description: 'Hero headline text', required: true },
          { name: 'heroSubtitle', type: 'string', description: 'Hero subtitle or tagline' },
          { name: 'heroImage', type: 'image', description: 'Hero background image' },
          { name: 'heroCta', type: 'object', description: 'Call-to-action button (label + URL)' }
        ]
      }
    ]
  },
  {
    id: 'block-services',
    name: 'Services Grid',
    description: 'Six-card services grid with icons, titles, and descriptions on a light background.',
    component: () => import('../components/variants/blocks/BlockServices.vue'),
    category: 'features',
    tags: ['services', 'grid', 'cards'],
    styleNotes: 'Services grid. py-16 px-6 bg-gray-50 @container. max-w-5xl mx-auto. Header: text-center mb-12, h2 text-3xl font-bold, sub text-gray-500. Cards: grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3 gap-6. Each: bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md. Icon text-3xl mb-4, h3 text-lg font-semibold mb-2, desc text-gray-500 text-sm.',
    schemaRequirements: [
      {
        documentType: 'page',
        title: 'Page',
        fields: [
          { name: 'servicesHeading', type: 'string', description: 'Section heading', required: true },
          { name: 'servicesSubheading', type: 'string', description: 'Section subheading' },
          { name: 'services', type: 'array', description: 'Service items (title, description, icon)', of: 'serviceItem', required: true }
        ]
      }
    ]
  },
  {
    id: 'block-features',
    name: 'Feature Grid',
    description: 'Three-column grid of feature cards with icons, titles, and descriptions.',
    component: () => import('../components/variants/blocks/BlockFeatures.vue'),
    category: 'features',
    tags: ['features', 'grid', 'cards'],
    styleNotes: 'Feature grid. py-16 px-6 bg-white @container. max-w-5xl mx-auto. Grid grid-cols-1 @md:grid-cols-3 gap-8. Each: text-center p-6. Icon: text-4xl mb-4. Title h3: text-lg font-semibold text-gray-900 mb-2. Description: text-gray-600 text-sm.',
    schemaRequirements: [
      {
        documentType: 'page',
        title: 'Page',
        fields: [
          { name: 'features', type: 'array', description: 'Feature items (title, description, icon)', of: 'featureItem', required: true }
        ]
      }
    ]
  },
  {
    id: 'block-text',
    name: 'Text Content',
    description: 'Rich text content area for longform copy, articles, or descriptions.',
    component: () => import('../components/variants/blocks/BlockText.vue'),
    category: 'content',
    tags: ['text', 'rich-text', 'article'],
    styleNotes: 'Rich text with markdown. py-12 px-6 bg-white. max-w-3xl mx-auto. Heading h2: text-2xl font-bold text-gray-900 mb-6. Prose: rendered markdown with h1 text-2xl, h2 text-xl, h3 text-lg, paragraphs text-gray-600 leading-relaxed mb-4, lists list-disc pl-5 space-y-1, bold/italic/code styled.',
    schemaRequirements: [
      {
        documentType: 'page',
        title: 'Page',
        fields: [
          { name: 'textHeading', type: 'string', description: 'Section heading' },
          { name: 'bodyContent', type: 'text', description: 'Body text content', required: true }
        ]
      }
    ]
  },
  {
    id: 'block-cta',
    name: 'Call to Action',
    description: 'Prominent CTA banner with headline, supporting text, and action button.',
    component: () => import('../components/variants/blocks/BlockCta.vue'),
    category: 'cta',
    tags: ['cta', 'banner', 'conversion'],
    styleNotes: 'CTA banner. py-16 px-6 bg-gray-900 text-white. max-w-3xl mx-auto text-center. Headline h2: text-3xl font-bold mb-4. Subtext: text-gray-300 text-lg mb-8. Button: inline-block font-semibold px-8 py-3 rounded-lg with dynamic primaryColor background.',
    schemaRequirements: [
      {
        documentType: 'page',
        title: 'Page',
        fields: [
          { name: 'ctaHeadline', type: 'string', description: 'CTA headline', required: true },
          { name: 'ctaText', type: 'string', description: 'Supporting text below headline' },
          { name: 'ctaButtonLabel', type: 'string', description: 'Button label text', required: true },
          { name: 'ctaButtonUrl', type: 'string', description: 'Button link URL', required: true }
        ]
      }
    ]
  },
  {
    id: 'block-gallery',
    name: 'Image Gallery',
    description: 'Responsive image gallery grid with captions.',
    component: () => import('../components/variants/blocks/BlockGallery.vue'),
    category: 'gallery',
    tags: ['gallery', 'images', 'grid'],
    styleNotes: 'Image gallery. py-12 px-6 bg-white. max-w-5xl mx-auto. Grid grid-cols-2 @md:grid-cols-3 gap-4. Each: group relative overflow-hidden rounded-lg aspect-[4/3] bg-gray-200. Caption overlay: absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 px-3 py-2 text-white text-sm font-medium.',
    schemaRequirements: [
      {
        documentType: 'page',
        title: 'Page',
        fields: [
          { name: 'galleryImages', type: 'array', description: 'Gallery images with alt text and captions', of: 'galleryImage', required: true }
        ]
      }
    ]
  },
  {
    id: 'block-testimonials',
    name: 'Testimonials',
    description: 'Three-column grid of customer testimonials with star ratings and author details.',
    component: () => import('../components/variants/blocks/BlockTestimonials.vue'),
    category: 'social-proof',
    tags: ['testimonials', 'reviews', 'social-proof'],
    styleNotes: 'Testimonial cards. py-16 px-6 bg-white @container. max-w-5xl mx-auto. Header text-center mb-12. Cards: grid grid-cols-1 @md:grid-cols-3 gap-6. Each: bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col. Stars: flex gap-0.5 mb-4 text-amber-400. Quote: text-gray-700 text-sm leading-relaxed flex-1 mb-6. Author: flex gap-3, avatar w-10 h-10 rounded-full primaryColor bg, name text-sm font-semibold, title text-xs text-gray-500.',
    schemaRequirements: [
      {
        documentType: 'page',
        title: 'Page',
        fields: [
          { name: 'testimonialsHeading', type: 'string', description: 'Section heading' },
          { name: 'testimonials', type: 'array', description: 'Testimonial items (quote, author, role, rating)', of: 'testimonialItem', required: true }
        ]
      }
    ]
  },
  {
    id: 'block-team',
    name: 'Team / Staff',
    description: 'Four-column team member grid with avatar, name, role, and bio.',
    component: () => import('../components/variants/blocks/BlockTeam.vue'),
    category: 'about',
    tags: ['team', 'staff', 'people'],
    styleNotes: 'Team grid. py-16 px-6 bg-gray-50 @container. max-w-5xl mx-auto. Header text-center mb-12. Cards: grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-4 gap-6. Each: bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center. Avatar: w-16 h-16 rounded-full mx-auto mb-4 dynamic colors. Name h3 font-semibold mb-1. Role text-sm primaryColor. Bio text-gray-500 text-xs.',
    schemaRequirements: [
      {
        documentType: 'page',
        title: 'Page',
        fields: [
          { name: 'teamHeading', type: 'string', description: 'Section heading' },
          { name: 'teamSubheading', type: 'string', description: 'Section subheading' },
          { name: 'teamMembers', type: 'array', description: 'Team member items (name, role, bio, color)', of: 'teamMember', required: true }
        ]
      }
    ]
  },
  {
    id: 'block-stats',
    name: 'Stats / Numbers',
    description: 'Bold statistics banner with four key metrics on an indigo background.',
    component: () => import('../components/variants/blocks/BlockStats.vue'),
    category: 'social-proof',
    fullWidthOnly: true,
    tags: ['stats', 'numbers', 'metrics'],
    styleNotes: 'Stats banner. py-14 px-6 text-white backgroundColor primaryColor. max-w-5xl mx-auto. Heading h2 text-center text-2xl font-bold mb-10 if provided. Grid grid-cols-2 md:grid-cols-4 gap-8 text-center. Value: text-4xl md:text-5xl font-extrabold mb-2. Label: text-white/70 text-sm font-medium uppercase tracking-wide.',
    schemaRequirements: [
      {
        documentType: 'page',
        title: 'Page',
        fields: [
          { name: 'statsHeading', type: 'string', description: 'Optional section heading' },
          { name: 'stats', type: 'array', description: 'Stat items (value, label, prefix, suffix)', of: 'statItem', required: true }
        ]
      }
    ]
  },
  {
    id: 'block-faq',
    name: 'FAQ / Accordion',
    description: 'Expandable FAQ accordion with questions and answers.',
    component: () => import('../components/variants/blocks/BlockFaq.vue'),
    category: 'content',
    tags: ['faq', 'accordion', 'questions'],
    styleNotes: 'FAQ accordion. py-16 px-6 bg-white. max-w-3xl mx-auto. Header text-center mb-10. Items: divide-y divide-gray-200 border-y border-gray-200. Each: w-full flex justify-between py-5 gap-4. Question: font-medium text-gray-900 text-sm @md:text-base. Toggle: shrink-0 w-6 h-6 rounded-full bg-gray-100 text-xs text-gray-500 rotate-45 when open. Answer: pb-5 text-gray-600 text-sm leading-relaxed.',
    schemaRequirements: [
      {
        documentType: 'page',
        title: 'Page',
        fields: [
          { name: 'faqHeading', type: 'string', description: 'Section heading' },
          { name: 'faqSubheading', type: 'string', description: 'Section subheading' },
          { name: 'faqs', type: 'array', description: 'FAQ items (question, answer)', of: 'faqItem', required: true }
        ]
      }
    ]
  },
  {
    id: 'block-process',
    name: 'Process / How It Works',
    description: 'Four-step numbered process flow with icons and connector lines.',
    component: () => import('../components/variants/blocks/BlockProcess.vue'),
    category: 'content',
    tags: ['process', 'steps', 'how-it-works'],
    styleNotes: 'Process steps. py-16 px-6 bg-gray-50 @container. max-w-5xl mx-auto. Header text-center mb-12. Grid grid-cols-1 @md:grid-cols-4 gap-0 relative. Connector: hidden @md:block absolute top-8 left-1/2 w-full h-0.5 primaryColor opacity. Circle: w-16 h-16 rounded-full bg-white border-2 relative z-10 mb-4 primaryColor border. Number: absolute top-0 right-6 w-5 h-5 rounded-full text-white text-xs primaryColor bg. Title h3 font-semibold mb-2, desc text-gray-500 text-sm.',
    schemaRequirements: [
      {
        documentType: 'page',
        title: 'Page',
        fields: [
          { name: 'processHeading', type: 'string', description: 'Section heading' },
          { name: 'processSubheading', type: 'string', description: 'Section subheading' },
          { name: 'steps', type: 'array', description: 'Process step items (title, description, icon)', of: 'processStep', required: true }
        ]
      }
    ]
  },
  {
    id: 'block-pricing',
    name: 'Pricing',
    description: 'Three-tier pricing cards with features list, highlighted recommended tier.',
    component: () => import('../components/variants/blocks/BlockPricing.vue'),
    category: 'cta',
    tags: ['pricing', 'plans', 'tiers'],
    styleNotes: 'Pricing tiers. py-16 px-6 bg-white @container. max-w-5xl mx-auto. Header text-center mb-12. Cards: grid grid-cols-1 @md:grid-cols-3 gap-6 items-start. Each: rounded-2xl border p-8 flex flex-col. Highlighted: scale-105 shadow-xl primaryColor bg/border text-white. Price: text-4xl font-extrabold mb-6. Features: space-y-3 mb-8 with checkmarks. CTA: block py-3 rounded-xl font-semibold text-sm.',
    schemaRequirements: [
      {
        documentType: 'page',
        title: 'Page',
        fields: [
          { name: 'pricingHeading', type: 'string', description: 'Section heading' },
          { name: 'pricingSubheading', type: 'string', description: 'Section subheading' },
          { name: 'plans', type: 'array', description: 'Pricing plan items (name, price, features, highlighted)', of: 'pricingPlan', required: true }
        ]
      }
    ]
  },
  {
    id: 'block-logos',
    name: 'Client Logos / Trust Bar',
    description: 'Horizontal trust bar of client or partner logo placeholders.',
    component: () => import('../components/variants/blocks/BlockLogos.vue'),
    category: 'social-proof',
    tags: ['logos', 'clients', 'trust', 'partners'],
    styleNotes: 'Logo showcase. py-10 px-6 bg-white border-y border-gray-100. max-w-5xl mx-auto. Heading: text-center text-sm font-medium text-gray-400 uppercase tracking-widest mb-8. Logos: flex flex-wrap items-center justify-center gap-6 md:gap-10. Each: px-6 py-3 rounded-lg bg-gray-50 border border-gray-100 text-sm font-semibold text-gray-300.',
    schemaRequirements: [
      {
        documentType: 'page',
        title: 'Page',
        fields: [
          { name: 'logosLabel', type: 'string', description: 'Label above logos (e.g. "Trusted by")' },
          { name: 'logos', type: 'array', description: 'Logo items (name, image)', of: 'logoItem', required: true }
        ]
      }
    ]
  },
  {
    id: 'block-blog-preview',
    name: 'Blog / News Preview',
    description: 'Three latest blog post cards with category badge, excerpt, and read-more link.',
    component: () => import('../components/variants/blocks/BlockBlogPreview.vue'),
    category: 'content',
    tags: ['blog', 'news', 'articles', 'posts'],
    styleNotes: 'Blog preview. py-16 px-6 bg-gray-50 @container. max-w-5xl mx-auto. Header: flex items-end justify-between mb-10. h2 text-3xl font-bold. Link text-sm primaryColor. Cards: grid grid-cols-1 @md:grid-cols-3 gap-6. Each: bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col. Image h-40 gradient primaryColor/secondaryColor. Content p-5: category/date flex gap-2 mb-3, title font-bold mb-2, excerpt text-gray-500 text-sm, read more primaryColor.',
    schemaRequirements: [
      {
        documentType: 'page',
        title: 'Page',
        fields: [
          { name: 'blogHeading', type: 'string', description: 'Blog section heading' },
          { name: 'blogSubheading', type: 'string', description: 'Blog section subheading' }
        ]
      },
      {
        documentType: 'post',
        title: 'Blog Post',
        fields: [
          { name: 'title', type: 'string', description: 'Post title', required: true },
          { name: 'excerpt', type: 'string', description: 'Short excerpt or summary' },
          { name: 'category', type: 'string', description: 'Post category label' },
          { name: 'date', type: 'string', description: 'Publication date' },
          { name: 'slug', type: 'slug', description: 'URL slug', required: true }
        ]
      }
    ]
  },
  {
    id: 'block-video',
    name: 'Video',
    description: 'Full-width video embed section with play button overlay.',
    component: () => import('../components/variants/blocks/BlockVideo.vue'),
    category: 'media',
    tags: ['video', 'embed', 'media'],
    styleNotes: 'Video section. py-16 px-6 bg-white. max-w-3xl mx-auto text-center. h2 text-3xl font-bold mb-3. Sub text-gray-500 mb-8 max-w-xl mx-auto. Placeholder: rounded-2xl overflow-hidden shadow-xl bg-gray-900 aspect-video cursor-pointer group. Gradient overlay: absolute inset-0 opacity-85 linear-gradient primaryColor/secondaryColor. Play button: w-20 h-20 rounded-full bg-white/20 border-2 border-white/50 backdrop-blur-sm. Caption: absolute bottom-4 left-4 right-4 text-white/70 text-xs.',
    schemaRequirements: [
      {
        documentType: 'page',
        title: 'Page',
        fields: [
          { name: 'videoHeading', type: 'string', description: 'Section heading' },
          { name: 'videoSubheading', type: 'string', description: 'Section subheading' },
          { name: 'videoUrl', type: 'string', description: 'YouTube or Vimeo embed URL', required: true },
          { name: 'videoCaption', type: 'string', description: 'Video caption or title overlay' }
        ]
      }
    ]
  },
  {
    id: 'block-newsletter',
    name: 'Newsletter Signup',
    description: 'Email newsletter signup form with indigo background and success state.',
    component: () => import('../components/variants/blocks/BlockNewsletter.vue'),
    category: 'cta',
    tags: ['newsletter', 'email', 'signup', 'subscribe'],
    styleNotes: 'Newsletter signup. py-16 px-6 backgroundColor primaryColor. max-w-xl mx-auto text-center. h2 text-3xl font-bold text-white mb-3. Sub text-white/70 mb-8. Form: flex gap-2 max-w-md mx-auto. Input: flex-1 px-4 py-3 rounded-xl text-sm bg-white. Button: px-5 py-3 bg-white rounded-xl font-semibold primaryColor text hover:bg-gray-50. Success: text-white/80. Note: text-white/50 text-xs mt-4.',
    schemaRequirements: [
      {
        documentType: 'page',
        title: 'Page',
        fields: [
          { name: 'newsletterHeading', type: 'string', description: 'Section heading' },
          { name: 'newsletterSubheading', type: 'string', description: 'Supporting text' },
          { name: 'newsletterCtaLabel', type: 'string', description: 'Subscribe button label' },
          { name: 'newsletterPlaceholder', type: 'string', description: 'Email input placeholder text' }
        ]
      }
    ]
  },
  {
    id: 'block-split',
    name: 'Split / Two Column',
    description: 'Two-column layout with image placeholder and content block, flippable.',
    component: () => import('../components/variants/blocks/BlockSplit.vue'),
    category: 'content',
    fullWidthOnly: true,
    tags: ['split', 'two-column', 'image-text'],
    styleNotes: 'Two-column split. py-16 px-6 bg-white @container. max-w-5xl mx-auto flex flex-col gap-10 items-center, md:flex-row or md:flex-row-reverse via imageRight prop. Text: flex-1, eyebrow text-sm font-semibold uppercase tracking-widest primaryColor, h2 text-3xl font-bold mb-4, body text-gray-600 mb-6, features space-y-2, CTA px-6 py-3 rounded-xl text-white primaryColor bg. Image: flex-1 aspect-4/3 rounded-2xl gradient.',
    schemaRequirements: [
      {
        documentType: 'page',
        title: 'Page',
        fields: [
          { name: 'splitEyebrow', type: 'string', description: 'Eyebrow text above heading' },
          { name: 'splitHeading', type: 'string', description: 'Section heading', required: true },
          { name: 'splitBody', type: 'string', description: 'Body text' },
          { name: 'splitCtaLabel', type: 'string', description: 'CTA button label' },
          { name: 'splitCtaUrl', type: 'string', description: 'CTA button URL' },
          { name: 'splitImage', type: 'image', description: 'Section image' },
          { name: 'splitImageRight', type: 'boolean', description: 'Place image on the right side' },
          { name: 'splitFeatures', type: 'array', description: 'Optional feature bullet points', of: 'splitFeatureItem' }
        ]
      }
    ]
  },
  {
    id: 'block-contact',
    name: 'Contact / Location',
    description: 'Contact section with address, phone, email, hours, map placeholder, and inquiry form.',
    component: () => import('../components/variants/blocks/BlockContact.vue'),
    category: 'contact',
    tags: ['contact', 'form', 'location', 'address'],
    styleNotes: 'Contact with map. py-16 px-6 bg-gray-50 @container. max-w-5xl mx-auto. Header text-center mb-12. Grid grid-cols-1 @md:grid-cols-2 gap-10. Left: contact details space-y-6, labels text-xs uppercase, map placeholder h-36 rounded-xl bg-gray-200. Right: form bg-white rounded-2xl p-6 border border-gray-100 shadow-sm. Inputs px-3 py-2.5 rounded-lg border-gray-200. Button w-full py-3 rounded-xl text-white primaryColor bg.',
    schemaRequirements: [
      {
        documentType: 'page',
        title: 'Page',
        fields: [
          { name: 'contactHeading', type: 'string', description: 'Section heading' },
          { name: 'contactSubheading', type: 'string', description: 'Section subheading' },
          { name: 'contactAddress', type: 'string', description: 'Physical address' },
          { name: 'contactPhone', type: 'string', description: 'Phone number' },
          { name: 'contactEmail', type: 'string', description: 'Contact email address' },
          { name: 'contactHours', type: 'string', description: 'Business hours' }
        ]
      }
    ]
  },
  {
    id: 'block-contact-info',
    name: 'Contact Info',
    description: 'Two-column contact details with intro copy, email, optional phone, response time, and preference notes. Right column reserved for a paired form block.',
    component: () => import('../components/variants/blocks/BlockContactInfo.vue'),
    category: 'contact',
    tags: ['contact', 'info', 'email', 'phone', 'split'],
    styleNotes: 'Two-column contact. py-16 px-6 bg-white @container. max-w-5xl mx-auto grid grid-cols-1 @md:grid-cols-2 gap-12. Left: h2 text-3xl font-bold mb-4, intro text-gray-600, contact items space-y-6 with text-xs uppercase labels and text-sm values, email/phone links primaryColor. Right: form bg-white rounded-2xl p-6 border border-gray-100 shadow-sm. Inputs: w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm. Button: w-full py-3 rounded-xl text-white primaryColor bg.',
    schemaRequirements: [
      {
        documentType: 'page',
        title: 'Page',
        fields: [
          { name: 'contactIntroText', type: 'string', description: 'Empathy intro line' },
          { name: 'contactEmail', type: 'string', description: 'Displayed as mailto link', required: true },
          { name: 'contactPhone', type: 'string', description: 'Phone number (optional)' },
          { name: 'contactShowPhone', type: 'boolean', description: 'Whether to display the phone number' },
          { name: 'contactResponseTime', type: 'string', description: 'Expected response time note' },
          { name: 'contactPreferenceNotes', type: 'string', description: 'Communication preference note' }
        ]
      }
    ]
  },
  {
    id: 'block-timeline',
    name: 'Timeline',
    description: 'Vertical milestone timeline with year circles, titles, and descriptions.',
    component: () => import('../components/variants/blocks/BlockTimeline.vue'),
    category: 'about',
    tags: ['timeline', 'history', 'milestones'],
    styleNotes: 'Vertical timeline. py-16 px-6 bg-white. max-w-3xl mx-auto. Header text-center mb-12. Vertical line: absolute left-8 top-0 bottom-0 w-0.5 primaryColor opacity bg. Milestones: space-y-8. Each: flex gap-6 items-start. Year circle: w-16 h-16 rounded-full bg-white border-2 relative z-10 shrink-0 text-sm font-bold. Final: primaryColor border/color, others opacity-35/55. Content flex-1 pt-3 pb-2, title font-bold mb-1, desc text-gray-500 text-sm.',
    schemaRequirements: [
      {
        documentType: 'page',
        title: 'Page',
        fields: [
          { name: 'timelineHeading', type: 'string', description: 'Section heading' },
          { name: 'timelineSubheading', type: 'string', description: 'Section subheading' },
          { name: 'milestones', type: 'array', description: 'Milestone items (year, title, description)', of: 'milestoneItem', required: true }
        ]
      }
    ]
  },
  {
    id: 'block-portfolio',
    name: 'Portfolio / Case Studies',
    description: 'Six-card portfolio grid with colour-coded project images, category badges, and descriptions.',
    component: () => import('../components/variants/blocks/BlockPortfolio.vue'),
    category: 'gallery',
    tags: ['portfolio', 'case-studies', 'work', 'projects'],
    styleNotes: 'Portfolio grid. py-16 px-6 bg-gray-50 @container. max-w-6xl mx-auto. Header text-center mb-12. Cards: grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3 gap-6. Each: bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg. Gradient placeholder h-40, category badge text-xs text-white/80 bg-black/20 px-2 py-0.5 rounded-full. Title h3 font-bold mb-2, desc text-gray-500 text-sm.',
    schemaRequirements: [
      {
        documentType: 'page',
        title: 'Page',
        fields: [
          { name: 'portfolioHeading', type: 'string', description: 'Portfolio section heading' },
          { name: 'portfolioSubheading', type: 'string', description: 'Portfolio section subheading' }
        ]
      },
      {
        documentType: 'caseStudy',
        title: 'Case Study',
        fields: [
          { name: 'title', type: 'string', description: 'Project title', required: true },
          { name: 'category', type: 'string', description: 'Project category' },
          { name: 'description', type: 'string', description: 'Short project description' },
          { name: 'image', type: 'image', description: 'Project cover image' },
          { name: 'slug', type: 'slug', description: 'URL slug', required: true }
        ]
      }
    ]
  },
  {
    id: 'block-map',
    name: 'Map / Location',
    description: 'Full-width location section with address, contact details, and Google Maps embed placeholder.',
    component: () => import('../components/variants/blocks/BlockMap.vue'),
    category: 'contact',
    tags: ['map', 'location', 'address', 'directions'],
    styleNotes: 'Map block. py-16 px-6 bg-white @container. max-w-5xl mx-auto. Header text-center mb-10. Grid grid-cols-1 @lg:grid-cols-3 gap-8 items-start. Info: space-y-6, labels text-xs uppercase primaryColor, values text-gray-700 text-sm. Map: @lg:col-span-2 rounded-xl overflow-hidden border border-gray-200 shadow-sm h-80 bg-gray-100.',
    schemaRequirements: [
      {
        documentType: 'page',
        title: 'Page',
        fields: [
          { name: 'mapHeading', type: 'string', description: 'Section heading' },
          { name: 'mapAddress', type: 'string', description: 'Physical address', required: true },
          { name: 'mapPhone', type: 'string', description: 'Phone number' },
          { name: 'mapEmail', type: 'string', description: 'Email address' },
          { name: 'mapHours', type: 'string', description: 'Business hours' }
        ]
      }
    ]
  }
]

// === All variants combined ===
const allVariants: ComponentVariant[] = [
  ...headerVariants,
  ...footerVariants
]

export const useRegistryStore = defineStore('registry', () => {
  function getVariantsBySection(section: SiteSection): ComponentVariant[] {
    return allVariants.filter(v => v.section === section)
  }

  function getVariantById(id: string): ComponentVariant | undefined {
    return allVariants.find(v => v.id === id)
  }

  function getTemplates(): PageTemplate[] {
    return pageTemplates
  }

  function getTemplateById(id: string): PageTemplate | undefined {
    return pageTemplates.find(t => t.id === id)
  }

  function getBlocks(): ContentBlock[] {
    return contentBlocks
  }

  function getBlocksByCategory(category: BlockCategory): ContentBlock[] {
    return contentBlocks.filter(b => b.category === category)
  }

  function getBlockById(id: string): ContentBlock | undefined {
    return contentBlocks.find(b => b.id === id)
  }

  return {
    variants: allVariants,
    templates: pageTemplates,
    blocks: contentBlocks,
    getVariantsBySection,
    getVariantById,
    getTemplates,
    getTemplateById,
    getBlocks,
    getBlocksByCategory,
    getBlockById
  }
})
