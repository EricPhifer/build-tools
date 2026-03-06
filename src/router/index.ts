import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from '@auth0/auth0-vue'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  },
  routes: [
    // Public Routes
    {
      path: '/callback',
      name: 'callback',
      component: () => import('../views/CallbackView.vue'),
      meta: { requiresAuth: false, public: true }
    },
    {
      path: '/preview/header',
      name: 'preview-header',
      component: () => import('../views/PreviewHeaderView.vue'),
      meta: { requiresAuth: false, public: true }
    },
    {
      path: '/preview/footer',
      name: 'preview-footer',
      component: () => import('../views/PreviewFooterView.vue'),
      meta: { requiresAuth: false, public: true }
    },
    {
      path: '/preview/page',
      name: 'preview-page',
      component: () => import('../views/PreviewPageView.vue'),
      meta: { requiresAuth: false, public: true }
    },
    {
      path: '/preview/dashboard',
      name: 'preview-dashboard',
      component: () => import('../views/PreviewDashboardView.vue'),
      meta: { requiresAuth: false, public: true }
    },

    // Protected Routes
    {
      path: '/',
      redirect: '/client'
    },
    {
      path: '/client',
      name: 'client-setup',
      component: () => import('../views/ClientSetupView.vue'),
      beforeEnter: authGuard,
      meta: { requiresAuth: true }
    },

    // ─── Site Builder ───────────────────────────────────────────────────────
    {
      path: '/site',
      name: 'site-builder',
      component: () => import('../views/SiteBuilderView.vue'),
      beforeEnter: authGuard,
      meta: { requiresAuth: true }
    },
    {
      path: '/site/bundle',
      name: 'site-bundle',
      component: () => import('../views/SiteBundleView.vue'),
      beforeEnter: authGuard,
      meta: { requiresAuth: true }
    },
    {
      path: '/site/type',
      name: 'site-type',
      component: () => import('../views/SiteTypeView.vue'),
      beforeEnter: authGuard,
      meta: { requiresAuth: true }
    },
    {
      path: '/site/sitemap',
      name: 'site-sitemap',
      component: () => import('../views/SiteSitemapView.vue'),
      beforeEnter: authGuard,
      meta: { requiresAuth: true }
    },
    {
      path: '/site/legal',
      name: 'site-legal',
      component: () => import('../views/SiteLegalView.vue'),
      beforeEnter: authGuard,
      meta: { requiresAuth: true }
    },
    {
      path: '/site/app-screens',
      name: 'site-app-screens',
      component: () => import('../views/SiteAppScreensView.vue'),
      beforeEnter: authGuard,
      meta: { requiresAuth: true }
    },
    {
      path: '/site/data-model',
      name: 'site-data-model',
      component: () => import('../views/SiteDataModelView.vue'),
      beforeEnter: authGuard,
      meta: { requiresAuth: true }
    },
    {
      path: '/site/checklist',
      name: 'site-checklist',
      component: () => import('../views/SiteChecklistView.vue'),
      beforeEnter: authGuard,
      meta: { requiresAuth: true }
    },
    {
      path: '/site/header',
      name: 'site-header',
      component: () => import('../views/SiteHeaderView.vue'),
      beforeEnter: authGuard,
      meta: { requiresAuth: true }
    },
    {
      path: '/site/footer',
      name: 'site-footer',
      component: () => import('../views/SiteFooterView.vue'),
      beforeEnter: authGuard,
      meta: { requiresAuth: true }
    },
    {
      path: '/site/main',
      name: 'site-main',
      component: () => import('../views/SiteMainView.vue'),
      beforeEnter: authGuard,
      meta: { requiresAuth: true }
    },
    {
      path: '/site/page/:pageId',
      name: 'site-page-builder',
      component: () => import('../views/SitePageBuilderView.vue'),
      beforeEnter: authGuard,
      meta: { requiresAuth: true }
    },

    // ─── Other Workflow Steps ────────────────────────────────────────────────
    {
      path: '/cms',
      name: 'cms',
      component: () => import('../views/CmsView.vue'),
      beforeEnter: authGuard,
      meta: { requiresAuth: true }
    },
    {
      path: '/dashboards',
      name: 'dashboards',
      component: () => import('../views/DashboardsView.vue'),
      beforeEnter: authGuard,
      meta: { requiresAuth: true }
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('../views/ProductsView.vue'),
      beforeEnter: authGuard,
      meta: { requiresAuth: true }
    },
    {
      path: '/products/portfolio',
      name: 'products-portfolio',
      component: () => import('../views/ProductsPortfolioView.vue'),
      beforeEnter: authGuard,
      meta: { requiresAuth: true }
    },
    {
      path: '/finalize',
      name: 'finalize',
      component: () => import('../views/FinalizeView.vue'),
      beforeEnter: authGuard,
      meta: { requiresAuth: true }
    },

    // ─── Project Mode ────────────────────────────────────────────────────────
    {
      path: '/projects',
      name: 'projects',
      component: () => import('../views/ProjectsView.vue'),
      beforeEnter: authGuard,
      meta: { requiresAuth: true }
    },
    {
      path: '/projects/new',
      name: 'projects-new',
      component: () => import('../views/ProjectNewView.vue'),
      beforeEnter: authGuard,
      meta: { requiresAuth: true }
    },
    {
      path: '/projects/:id',
      name: 'project-workspace',
      component: () => import('../views/ProjectWorkspaceView.vue'),
      beforeEnter: authGuard,
      meta: { requiresAuth: true }
    }
  ]
})

export default router
