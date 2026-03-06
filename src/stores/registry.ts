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
    tags: ['full-width', 'simple', 'single-column']
  },
  {
    id: 'template-sidebar-left',
    name: 'Sidebar Left',
    description: 'Left sidebar with main content area — ideal for navigation or filters.',
    component: () => import('../components/variants/templates/TemplateSidebarLeft.vue'),
    layout: ['header', 'sidebar', 'content'],
    tags: ['sidebar', 'two-column', 'navigation']
  },
  {
    id: 'template-sidebar-right',
    name: 'Sidebar Right',
    description: 'Main content with right sidebar — great for related content or widgets.',
    component: () => import('../components/variants/templates/TemplateSidebarRight.vue'),
    layout: ['header', 'content', 'sidebar'],
    tags: ['sidebar', 'two-column', 'widgets']
  },
  {
    id: 'template-narrow',
    name: 'Narrow / Article',
    description: 'Centered narrow column — ideal for long-form articles, blogs, and documentation.',
    component: () => import('../components/variants/templates/TemplateNarrow.vue'),
    layout: ['content'],
    tags: ['narrow', 'article', 'blog', 'prose', 'reading']
  },
  {
    id: 'template-wide',
    name: 'Wide / Full Bleed',
    description: 'Edge-to-edge layout with no padding constraints — best for galleries and visual showcases.',
    component: () => import('../components/variants/templates/TemplateWide.vue'),
    layout: ['content'],
    tags: ['wide', 'full-bleed', 'gallery', 'visual', 'portfolio']
  },
  {
    id: 'template-sticky-left',
    name: 'Sticky Sidebar Left',
    description: 'Left sidebar that sticks while the main content scrolls — great for table of contents or filters.',
    component: () => import('../components/variants/templates/TemplateStickyLeft.vue'),
    layout: ['header', 'sidebar', 'content'],
    tags: ['sticky', 'sidebar', 'toc', 'filters', 'docs']
  },
  {
    id: 'template-two-column',
    name: 'Two Column Equal',
    description: 'Two equally-sized columns side by side — perfect for comparison or split content.',
    component: () => import('../components/variants/templates/TemplateTwoColumn.vue'),
    layout: ['header', 'content', 'right'],
    tags: ['two-column', 'equal', 'comparison', 'split']
  },
  {
    id: 'template-three-column',
    name: 'Three Column',
    description: 'Three equal columns — ideal for feature grids, services, or card-based content.',
    component: () => import('../components/variants/templates/TemplateThreeColumn.vue'),
    layout: ['header', 'content', 'col2', 'col3'],
    tags: ['three-column', 'grid', 'features', 'cards']
  },
  {
    id: 'template-narrow-sidebar',
    name: 'Narrow + Sidebar',
    description: 'Narrow readable main area with a compact right sidebar for related links or TOC.',
    component: () => import('../components/variants/templates/TemplateNarrowSidebar.vue'),
    layout: ['header', 'content', 'sidebar'],
    tags: ['narrow', 'sidebar', 'article', 'toc', 'related']
  },
  {
    id: 'template-landing',
    name: 'Landing / Conversion',
    description: 'Full-width sections with no max-width — designed for high-converting landing pages.',
    component: () => import('../components/variants/templates/TemplateLanding.vue'),
    layout: ['content'],
    tags: ['landing', 'conversion', 'marketing', 'full-width', 'cta'],
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
    id: 'block-timeline',
    name: 'Timeline',
    description: 'Vertical milestone timeline with year circles, titles, and descriptions.',
    component: () => import('../components/variants/blocks/BlockTimeline.vue'),
    category: 'about',
    tags: ['timeline', 'history', 'milestones'],
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
