import type {
  BusinessType, BusinessTypeInfo, SitemapPage,
  LegalPageContent, ChecklistItem, ChecklistCategory,
  AppScreen, AppViewType, DataEntity, DataFieldType
} from '../types/registry'

// ─── Business Types ────────────────────────────────────────────────────────

export const BUSINESS_TYPES: BusinessTypeInfo[] = [
  {
    id: 'local_service',
    label: 'Local Service Business',
    schemaType: 'LocalBusiness',
    description: 'Contractor, landscaper, plumber, electrician, cleaner, etc.',
    icon: 'Wrench'
  },
  {
    id: 'consultant',
    label: 'Professional / Consultant',
    schemaType: 'ProfessionalService',
    description: 'Coach, advisor, agency, freelancer, consultant.',
    icon: 'Briefcase'
  },
  {
    id: 'nonprofit',
    label: 'Nonprofit',
    schemaType: 'NGO',
    description: '501(c)(3), foundation, community organization.',
    icon: 'Heart'
  },
  {
    id: 'church',
    label: 'Church / Religious Org',
    schemaType: 'Church',
    description: 'Congregation, ministry, faith community.',
    icon: 'Building2'
  },
  {
    id: 'hoa',
    label: 'HOA / Association',
    schemaType: 'HoaOrganization',
    description: 'Homeowners association, neighborhood association.',
    icon: 'Home'
  },
  {
    id: 'retail',
    label: 'Retail / Store',
    schemaType: 'Store',
    description: 'Physical or online product sales.',
    icon: 'ShoppingBag'
  },
  {
    id: 'creative',
    label: 'Author / Creative',
    schemaType: 'Person',
    description: 'Personal brand, author, artist, portfolio.',
    icon: 'Palette'
  },
  {
    id: 'technology',
    label: 'Technology / Web Services',
    schemaType: 'ProfessionalService',
    description: 'Web agency, SaaS, dev studio, digital services provider.',
    icon: 'Monitor'
  },
  // ── Project Mode types ──────────────────────────────────────────────────
  {
    id: 'project_it',
    label: 'IT Business',
    schemaType: 'ProfessionalService',
    description: 'IT services, managed services, infrastructure, tech support.',
    icon: 'Server'
  },
  {
    id: 'project_web',
    label: 'Web Business',
    schemaType: 'ProfessionalService',
    description: 'Web design & development, digital agency, freelance web work.',
    icon: 'Globe'
  },
  {
    id: 'project_dashboard',
    label: 'Dashboard / App',
    schemaType: 'SoftwareApplication',
    description: 'Internal tool, data dashboard, admin panel, or specialized app.',
    icon: 'LayoutDashboard'
  },
  {
    id: 'project_compilation',
    label: 'Compilation / Catalog',
    schemaType: 'CollectionPage',
    description: 'Searchable collection of projects, songs, learning notes, or reference material.',
    icon: 'Database'
  },
  {
    id: 'project_meal_plan',
    label: 'Meal Plan',
    schemaType: 'SoftwareApplication',
    description: 'Recipe collection, meal planning tool, shopping list generator.',
    icon: 'UtensilsCrossed'
  }
]

// ─── Sitemap Defaults ──────────────────────────────────────────────────────

const CORE_PAGES: SitemapPage[] = [
  { id: 'home', name: 'Home', slug: '/', nav: 'primary', isCore: true, isLegal: false, isEnrichOnly: false },
  { id: 'about', name: 'About', slug: '/about', nav: 'primary', isCore: true, isLegal: false, isEnrichOnly: false },
  { id: 'contact', name: 'Contact', slug: '/contact', nav: 'primary', isCore: true, isLegal: false, isEnrichOnly: false },
  { id: 'privacy', name: 'Privacy Policy', slug: '/privacy-policy', nav: 'footer', isCore: true, isLegal: true, isEnrichOnly: false, blocks: ['block-text'] },
  { id: 'terms', name: 'Terms & Conditions', slug: '/terms-and-conditions', nav: 'footer', isCore: true, isLegal: true, isEnrichOnly: false, blocks: ['block-text'] },
  { id: 'accessibility', name: 'Accessibility Statement', slug: '/accessibility', nav: 'footer', isCore: true, isLegal: true, isEnrichOnly: false, blocks: ['block-text'] },
  { id: 'cookie', name: 'Cookie Policy', slug: '/cookie-policy', nav: 'footer', isCore: true, isLegal: true, isEnrichOnly: false, blocks: ['block-text'] }
]

const EXTRA_PAGES: Record<BusinessType, SitemapPage[]> = {
  local_service: [
    { id: 'services', name: 'Services', slug: '/services', nav: 'primary', isCore: false, isLegal: false, isEnrichOnly: false },
    { id: 'service-area', name: 'Service Area', slug: '/service-area', nav: 'primary', isCore: false, isLegal: false, isEnrichOnly: false },
    { id: 'testimonials', name: 'Testimonials', slug: '/testimonials', nav: 'primary', isCore: false, isLegal: false, isEnrichOnly: false }
  ],
  consultant: [
    { id: 'services', name: 'Services', slug: '/services', nav: 'primary', isCore: false, isLegal: false, isEnrichOnly: false },
    { id: 'process', name: 'Process', slug: '/process', nav: 'primary', isCore: false, isLegal: false, isEnrichOnly: false },
    { id: 'case-studies', name: 'Case Studies', slug: '/case-studies', nav: 'primary', isCore: false, isLegal: false, isEnrichOnly: false }
  ],
  nonprofit: [
    { id: 'mission', name: 'Mission', slug: '/mission', nav: 'primary', isCore: false, isLegal: false, isEnrichOnly: false },
    { id: 'get-involved', name: 'Get Involved', slug: '/get-involved', nav: 'primary', isCore: false, isLegal: false, isEnrichOnly: false },
    { id: 'donate', name: 'Donate', slug: '/donate', nav: 'primary', isCore: false, isLegal: false, isEnrichOnly: false },
    { id: 'board', name: 'Board', slug: '/board', nav: 'footer', isCore: false, isLegal: false, isEnrichOnly: false }
  ],
  church: [
    { id: 'beliefs', name: 'Beliefs', slug: '/beliefs', nav: 'primary', isCore: false, isLegal: false, isEnrichOnly: false },
    { id: 'ministries', name: 'Ministries', slug: '/ministries', nav: 'primary', isCore: false, isLegal: false, isEnrichOnly: false },
    { id: 'events', name: 'Events', slug: '/events', nav: 'primary', isCore: false, isLegal: false, isEnrichOnly: false },
    { id: 'staff', name: 'Staff', slug: '/staff', nav: 'footer', isCore: false, isLegal: false, isEnrichOnly: false },
    { id: 'give', name: 'Give', slug: '/give', nav: 'primary', isCore: false, isLegal: false, isEnrichOnly: false }
  ],
  hoa: [
    { id: 'announcements', name: 'Announcements', slug: '/announcements', nav: 'primary', isCore: false, isLegal: false, isEnrichOnly: false },
    { id: 'documents', name: 'Documents', slug: '/documents', nav: 'primary', isCore: false, isLegal: false, isEnrichOnly: false },
    { id: 'board-members', name: 'Board Members', slug: '/board-members', nav: 'primary', isCore: false, isLegal: false, isEnrichOnly: false },
    { id: 'pay-dues', name: 'Pay Dues', slug: '/pay-dues', nav: 'primary', isCore: false, isLegal: false, isEnrichOnly: false }
  ],
  retail: [
    { id: 'shop', name: 'Shop', slug: '/shop', nav: 'primary', isCore: false, isLegal: false, isEnrichOnly: false },
    { id: 'faq', name: 'FAQ', slug: '/faq', nav: 'footer', isCore: false, isLegal: false, isEnrichOnly: false },
    { id: 'shipping', name: 'Shipping & Returns', slug: '/shipping-returns', nav: 'footer', isCore: false, isLegal: false, isEnrichOnly: false }
  ],
  creative: [
    { id: 'work', name: 'Work', slug: '/work', nav: 'primary', isCore: false, isLegal: false, isEnrichOnly: false },
    { id: 'speaking', name: 'Speaking', slug: '/speaking', nav: 'primary', isCore: false, isLegal: false, isEnrichOnly: false },
    { id: 'press', name: 'Press', slug: '/press', nav: 'footer', isCore: false, isLegal: false, isEnrichOnly: false }
  ],
  technology: [
    { id: 'services', name: 'Services', slug: '/services', nav: 'primary', isCore: false, isLegal: false, isEnrichOnly: false },
    { id: 'portfolio', name: 'Portfolio', slug: '/portfolio', nav: 'primary', isCore: false, isLegal: false, isEnrichOnly: false },
    { id: 'process', name: 'Process', slug: '/process', nav: 'primary', isCore: false, isLegal: false, isEnrichOnly: false },
    { id: 'support', name: 'Support', slug: '/support', nav: 'footer', isCore: false, isLegal: false, isEnrichOnly: false }
  ],
  // ── Project Mode extras ─────────────────────────────────────────────────
  project_it: [
    { id: 'services', name: 'Services', slug: '/services', nav: 'primary', isCore: false, isLegal: false, isEnrichOnly: false },
    { id: 'portfolio', name: 'Portfolio', slug: '/portfolio', nav: 'primary', isCore: false, isLegal: false, isEnrichOnly: false },
    { id: 'stack', name: 'Stack', slug: '/stack', nav: 'footer', isCore: false, isLegal: false, isEnrichOnly: false }
  ],
  project_web: [
    { id: 'services', name: 'Services', slug: '/services', nav: 'primary', isCore: false, isLegal: false, isEnrichOnly: false },
    { id: 'work', name: 'Work', slug: '/work', nav: 'primary', isCore: false, isLegal: false, isEnrichOnly: false },
    { id: 'process', name: 'Process', slug: '/process', nav: 'primary', isCore: false, isLegal: false, isEnrichOnly: false }
  ],
  project_dashboard: [
    { id: 'dashboard', name: 'Dashboard', slug: '/dashboard', nav: 'primary', isCore: false, isLegal: false, isEnrichOnly: false },
    { id: 'docs', name: 'Docs', slug: '/docs', nav: 'footer', isCore: false, isLegal: false, isEnrichOnly: false },
    { id: 'settings', name: 'Settings', slug: '/settings', nav: 'footer', isCore: false, isLegal: false, isEnrichOnly: false }
  ],
  project_compilation: [
    { id: 'browse', name: 'Browse', slug: '/browse', nav: 'primary', isCore: false, isLegal: false, isEnrichOnly: false },
    { id: 'search', name: 'Search', slug: '/search', nav: 'primary', isCore: false, isLegal: false, isEnrichOnly: false },
    { id: 'submit', name: 'Submit', slug: '/submit', nav: 'footer', isCore: false, isLegal: false, isEnrichOnly: false }
  ],
  project_meal_plan: [
    { id: 'recipes', name: 'Recipes', slug: '/recipes', nav: 'primary', isCore: false, isLegal: false, isEnrichOnly: false },
    { id: 'meal-plans', name: 'Meal Plans', slug: '/meal-plans', nav: 'primary', isCore: false, isLegal: false, isEnrichOnly: false },
    { id: 'shopping-list', name: 'Shopping List', slug: '/shopping-list', nav: 'primary', isCore: false, isLegal: false, isEnrichOnly: false }
  ]
}

export function getDefaultSitemapPages(type: BusinessType): SitemapPage[] {
  return [
    ...CORE_PAGES.map(p => ({ ...p })),
    ...EXTRA_PAGES[type].map(p => ({ ...p }))
  ]
}

// ─── App Screen Defaults ───────────────────────────────────────────────────

function screen(id: string, name: string, route: string, viewType: AppViewType, description?: string, isEnrichOnly?: boolean): AppScreen {
  return { id, name, route, viewType, description, isEnrichOnly: isEnrichOnly ?? false }
}

const APP_SCREENS: Partial<Record<BusinessType, AppScreen[]>> = {
  project_dashboard: [
    screen('dashboard', 'Main Dashboard', '/dashboard', 'dashboard', 'Overview metrics and key data at a glance.'),
    screen('detail', 'Detail View', '/dashboard/:id', 'detail', 'Drill-down for a single record or metric.', true),
    screen('settings', 'Settings', '/settings', 'settings', 'App configuration and preferences.'),
    screen('login', 'Login', '/login', 'auth', 'Authentication screen.')
  ],
  project_compilation: [
    screen('browse', 'Browse', '/', 'list', 'Browsable index of all entries with filtering and search.'),
    screen('detail', 'Entry Detail', '/entry/:id', 'detail', 'Full view of a single entry.'),
    screen('search', 'Search Results', '/search', 'list', 'Filtered results view.', true),
    screen('add', 'Add Entry', '/admin/add', 'form', 'Form to submit a new entry.', true),
    screen('edit', 'Edit Entry', '/admin/edit/:id', 'form', 'Edit an existing entry.', true)
  ],
  project_meal_plan: [
    screen('recipes', 'Recipe Index', '/recipes', 'list', 'Browse and filter all saved recipes.'),
    screen('recipe-detail', 'Recipe Detail', '/recipes/:id', 'detail', 'Full recipe view with ingredients and steps.'),
    screen('planner', 'Meal Planner', '/planner', 'dashboard', 'Weekly meal plan builder — assign recipes to days.'),
    screen('shopping-list', 'Shopping List', '/shopping-list', 'list', 'Auto-generated shopping list from the current meal plan.'),
    screen('add-recipe', 'Add Recipe', '/admin/recipe', 'form', 'Form to create a new recipe.', true),
    screen('edit-recipe', 'Edit Recipe', '/admin/recipe/:id', 'form', 'Edit an existing recipe.', true)
  ]
}

export function getDefaultAppScreens(type: BusinessType): AppScreen[] {
  return (APP_SCREENS[type] ?? []).map(s => ({ ...s }))
}

// ─── Data Model Defaults ───────────────────────────────────────────────────

function field(id: string, name: string, type: DataFieldType, description?: string, required?: boolean) {
  return { id, name, type, description, required: required ?? false }
}

const DATA_MODELS: Partial<Record<BusinessType, DataEntity[]>> = {
  project_dashboard: [
    {
      id: 'metric',
      name: 'Metric',
      description: 'A single trackable data point.',
      fields: [
        field('title', 'title', 'string', 'Display label for this metric.', true),
        field('value', 'value', 'number', 'Current numeric value.', true),
        field('unit', 'unit', 'string', 'Unit of measurement (e.g. $, %, hrs).'),
        field('source', 'source', 'string', 'Where this data comes from.'),
        field('updatedAt', 'updatedAt', 'date', 'When the value was last updated.')
      ]
    }
  ],
  project_compilation: [
    {
      id: 'entry',
      name: 'Entry',
      description: 'A single compiled item in the collection.',
      fields: [
        field('title', 'title', 'string', 'Name or title of the entry.', true),
        field('artist', 'artist', 'string', 'Artist, author, or creator (if applicable).'),
        field('tags', 'tags', 'array', 'Categorization tags.'),
        field('url', 'url', 'string', 'Link to original source or reference.'),
        field('notes', 'notes', 'richtext', 'Extended notes or review.'),
        field('rating', 'rating', 'number', 'Personal rating (e.g. 1–5).')
      ]
    }
  ],
  project_meal_plan: [
    {
      id: 'recipe',
      name: 'Recipe',
      description: 'A single recipe with ingredients and steps.',
      fields: [
        field('title', 'title', 'string', 'Recipe name.', true),
        field('ingredients', 'ingredients', 'array', 'List of ingredients with amounts.', true),
        field('steps', 'steps', 'array', 'Ordered preparation steps.', true),
        field('prepTime', 'prepTime', 'number', 'Prep time in minutes.'),
        field('cookTime', 'cookTime', 'number', 'Cook time in minutes.'),
        field('tags', 'tags', 'array', 'e.g. vegan, quick, breakfast.'),
        field('image', 'image', 'image', 'Photo of the finished dish.')
      ]
    },
    {
      id: 'meal_plan',
      name: 'Meal Plan',
      description: 'A weekly meal plan referencing saved recipes.',
      fields: [
        field('name', 'name', 'string', 'Plan label (e.g. "Week of March 10").', true),
        field('weekOf', 'weekOf', 'date', 'Start date of the week.', true),
        field('days', 'days', 'array', 'Array of day objects each referencing recipe IDs.')
      ]
    }
  ]
}

export function getDefaultDataModel(type: BusinessType): DataEntity[] {
  return (DATA_MODELS[type] ?? []).map(e => ({
    ...e,
    fields: e.fields.map(f => ({ ...f }))
  }))
}

// ─── Legal Templates ───────────────────────────────────────────────────────

export function buildLegalTemplates(
  businessName: string,
  contactEmail: string,
  domain: string,
  year: number,
  businessType: BusinessType
): LegalPageContent {
  const isRetail = businessType === 'retail'

  const privacyPolicy = `# Privacy Policy

**Last updated:** January 1, ${year}

## Overview

${businessName} ("we," "us," or "our") operates ${domain} and is committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website.

## Information We Collect

**Information you provide directly:**
- Contact form submissions (name, email, phone, message)
- Email newsletter sign-ups
${isRetail ? '- Purchase and shipping information\n- Payment details (processed securely by our payment provider)' : ''}

**Information collected automatically:**
- Browser type and operating system
- Pages visited and time spent on site
- IP address (anonymized where possible)
- Referring website

We use cookies and similar tracking technologies. See our Cookie Policy for details.

## How We Use Your Information

We use collected information to:
- Respond to your inquiries and service requests
- Send relevant communications you have opted into
- Improve our website and services
- Comply with legal obligations
${isRetail ? '- Process and fulfill orders\n- Send order confirmations and shipping updates' : ''}

We do not sell, trade, or rent your personal information to third parties.

## Data Retention

We retain your personal information only as long as necessary to fulfill the purposes outlined in this policy or as required by law.

## Your Rights

You have the right to:
- Request access to your personal data
- Request correction of inaccurate data
- Request deletion of your data
- Opt out of marketing communications at any time

To exercise these rights, contact us at ${contactEmail}.

## Third-Party Services

Our website may use third-party services including Google Analytics, social media platforms, and embedded content. These services have their own privacy policies.

## Children's Privacy

Our website is not directed at children under 13. We do not knowingly collect personal information from children under 13.

## Changes to This Policy

We may update this Privacy Policy periodically. We will notify you of significant changes by posting a notice on our website.

## Contact Us

If you have questions about this Privacy Policy, contact us at:

**${businessName}**
Email: ${contactEmail}
Website: ${domain}`

  const termsAndConditions = `# Terms & Conditions

**Last updated:** January 1, ${year}

## Agreement to Terms

By accessing and using the website at ${domain}, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use this site.

## Use of This Website

You may use this website for lawful purposes only. You agree not to:
- Use this site in any way that violates applicable local, state, or federal laws
- Attempt to gain unauthorized access to any part of the site
- Transmit harmful, offensive, or disruptive content
- Use automated tools to scrape or harvest data from this site

## Intellectual Property

All content on this website — including text, images, logos, and design — is the property of ${businessName} and is protected by applicable intellectual property laws. You may not reproduce, distribute, or use our content without prior written permission.

## Disclaimer of Warranties

This website is provided "as is" without warranties of any kind, either express or implied. ${businessName} does not warrant that the site will be error-free, uninterrupted, or free of viruses or other harmful components.

## Limitation of Liability

To the fullest extent permitted by law, ${businessName} shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of this website.
${isRetail ? `
## Products and Purchases

All product descriptions and pricing are subject to change without notice. We reserve the right to refuse or cancel any order at our discretion. Payment is required in full before orders are processed.
` : ''}
## Links to Third-Party Websites

This site may contain links to external websites. ${businessName} is not responsible for the content or privacy practices of those sites.

## Changes to These Terms

We reserve the right to update these Terms & Conditions at any time. Continued use of the site after changes are posted constitutes your acceptance of the revised terms.

## Governing Law

These Terms are governed by the laws of the state in which ${businessName} operates, without regard to conflict of law provisions.

## Contact Us

For questions about these Terms, contact us at:

**${businessName}**
Email: ${contactEmail}
Website: ${domain}`

  const accessibilityStatement = `# Accessibility Statement

**Last updated:** January 1, ${year}

## Our Commitment

${businessName} is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply relevant accessibility standards.

## Standards We Aim to Meet

We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA. These guidelines explain how to make web content more accessible to people with disabilities.

## Measures We Take

We take the following measures to ensure accessibility:
- Use semantic HTML elements
- Provide text alternatives for non-text content
- Ensure keyboard navigability throughout the site
- Maintain sufficient color contrast
- Use descriptive link text
- Provide visible focus indicators

## Known Limitations

While we strive for full accessibility, some content may not yet meet all standards. We are actively working to address these issues.

## Feedback

We welcome your feedback on the accessibility of ${domain}. If you experience any barriers, please contact us:

Email: ${contactEmail}

We aim to respond to accessibility feedback within 2 business days.

## Formal Complaints

If you are not satisfied with our response, you may contact the relevant accessibility enforcement body in your jurisdiction.`

  const cookiePolicy = `# Cookie Policy

**Last updated:** January 1, ${year}

## What Are Cookies

Cookies are small text files placed on your device when you visit a website. They help the site function properly and provide information to site owners.

## How We Use Cookies

**Essential Cookies**
These cookies are necessary for the website to function. They cannot be disabled.
- Session management
- Security tokens
- Form submission tokens

**Analytics Cookies**
These cookies help us understand how visitors interact with our website. All data is anonymized.
- Google Analytics (page views, session duration, traffic sources)

**Preference Cookies**
These cookies remember your choices to improve your experience.
- Theme preferences (dark/light mode)

## Third-Party Cookies

Some pages on our site may contain content from third parties (e.g., social media embeds, maps, videos). These third parties may place their own cookies on your device. We do not control these cookies.

## Managing Cookies

You can control cookies through your browser settings. Note that disabling cookies may affect the functionality of this site.

For more information on managing cookies, visit [allaboutcookies.org](https://allaboutcookies.org).

## Contact Us

For questions about our use of cookies, contact us at:

**${businessName}**
Email: ${contactEmail}
Website: ${domain}`

  return { privacyPolicy, termsAndConditions, accessibilityStatement, cookiePolicy }
}

// ─── Build Checklist Defaults ──────────────────────────────────────────────

export function getDefaultChecklist(): Record<ChecklistCategory, ChecklistItem[]> {
  return {
    searchVisibility: [
      { id: 'sv-1', label: 'Title tags set on all pages (business name + location)', status: 'not_started' },
      { id: 'sv-2', label: 'Meta descriptions written for all pages', status: 'not_started' },
      { id: 'sv-3', label: 'Schema.org JSON-LD configured (type from Step 2b)', status: 'not_started' },
      { id: 'sv-4', label: 'XML sitemap generated and submitted', status: 'not_started' },
      { id: 'sv-5', label: 'Google Search Console setup complete', status: 'not_started', actionLabel: 'Open Search Console', actionUrl: 'https://search.google.com/search-console' }
    ],
    googleBusiness: [
      { id: 'gb-1', label: 'NAP on website matches Google Business Profile exactly', status: 'not_started' },
      { id: 'gb-2', label: 'Website URL linked in GBP', status: 'not_started', actionLabel: 'Open Google Business Profile', actionUrl: 'https://business.google.com' },
      { id: 'gb-3', label: 'GBP walkthrough completed with client', status: 'not_started' }
    ],
    socialPresence: [
      { id: 'sp-1', label: 'All social links in site code point to real profile URLs (no placeholder links)', status: 'not_started' },
      { id: 'sp-2', label: 'Brand name consistent across all linked profiles', status: 'not_started' }
    ],
    speedSecurity: [
      { id: 'ss-1', label: 'SSL certificate active and HTTPS redirect confirmed', status: 'not_started' },
      { id: 'ss-2', label: 'Core security headers configured (CSP, X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy, Permissions-Policy)', status: 'not_started' },
      { id: 'ss-3', label: 'Images optimized before upload', status: 'not_started' },
      { id: 'ss-4', label: 'PageSpeed Insights reviewed (mobile + desktop)', status: 'not_started', actionLabel: 'Open PageSpeed Insights', actionUrl: 'https://pagespeed.web.dev' }
    ],
    brandConsistency: [
      { id: 'bc-1', label: 'Favicon uploaded', status: 'not_started' },
      { id: 'bc-2', label: 'Open Graph tags set (og:title, og:description, og:image, og:type)', status: 'not_started' },
      { id: 'bc-3', label: 'NAP present in footer on all pages', status: 'not_started' },
      { id: 'bc-4', label: 'Font count ≤ 3 (enforced in Sanity schema)', status: 'not_started' },
      { id: 'bc-5', label: 'Single H1 per page verified', status: 'not_started' },
      { id: 'bc-6', label: 'Image file naming reviewed (no IMG_2847.jpg style names)', status: 'not_started' }
    ],
    contactAccessibility: [
      { id: 'ca-1', label: 'Dedicated contact page exists', status: 'not_started' },
      { id: 'ca-2', label: 'Phone number has tel: link (click-to-call)', status: 'not_started' },
      { id: 'ca-3', label: 'Contact form is a real inquiry form (not newsletter signup only)', status: 'not_started' },
      { id: 'ca-4', label: 'Business hours posted', status: 'not_started' },
      { id: 'ca-5', label: 'Footer contact info present sitewide', status: 'not_started' },
      { id: 'ca-6', label: 'Google Map embed added (if physical location)', status: 'not_started' }
    ],
    trustCompliance: [
      { id: 'tc-1', label: 'Privacy Policy page published and linked in footer', status: 'not_started' },
      { id: 'tc-2', label: 'Terms & Conditions page published and linked in footer', status: 'not_started' },
      { id: 'tc-3', label: 'Accessibility Statement page published and linked in footer', status: 'not_started' },
      { id: 'tc-4', label: 'Cookie consent banner active', status: 'not_started' },
      { id: 'tc-5', label: 'Copyright block in footer: © [year] [Business Name]. All rights reserved.', status: 'not_started' },
      { id: 'tc-6', label: 'Schema markup confirmed live', status: 'not_started' },
      { id: 'tc-7', label: 'Cookie Policy page published and linked (or covered by banner)', status: 'not_started' }
    ]
  }
}

export const CHECKLIST_CATEGORY_LABELS: Record<ChecklistCategory, string> = {
  searchVisibility: 'Search Visibility',
  googleBusiness: 'Google Business Profile',
  socialPresence: 'Social Presence',
  speedSecurity: 'Speed & Security',
  brandConsistency: 'Brand Consistency',
  contactAccessibility: 'Contact Accessibility',
  trustCompliance: 'Trust & Compliance'
}

export const CHECKLIST_CATEGORY_ORDER: ChecklistCategory[] = [
  'searchVisibility',
  'googleBusiness',
  'socialPresence',
  'speedSecurity',
  'brandConsistency',
  'contactAccessibility',
  'trustCompliance'
]
