<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth0 } from '@auth0/auth0-vue'
import { LayoutDashboard, FileEdit, Blocks, FolderOpen, LogOut, ChevronLeft, ChevronRight, ChevronDown, Check, UserCircle, Flag, RotateCcw } from 'lucide-vue-next'
import ThemeToggle from './ThemeToggle.vue'
import { useSidebarStore } from '../stores/sidebar'
import { useWorkflowStore } from '../stores/workflow'
import LogoIcon from './LogoIcon.vue'
import type { WorkflowStep } from '../types/registry'

const route = useRoute()
const router = useRouter()
const { user, logout } = useAuth0()
const sidebar = useSidebarStore()
const workflow = useWorkflowStore()

const expandedSections = ref<Record<string, boolean>>({
  '/site': true
})

// Workflow nav items (numbered steps)
const workflowItems = computed(() => [
  { name: 'Client Setup', path: '/client', icon: UserCircle, step: 'client' as WorkflowStep, stepNumber: 1 },
  {
    name: 'Site Builder',
    path: '/site',
    icon: Blocks,
    step: 'site' as WorkflowStep,
    stepNumber: 2,
    children: [
      { name: 'Header', path: '/site/header' },
      { name: 'Footer', path: '/site/footer' },
      { name: 'Main', path: '/site/main' }
    ]
  },
  { name: 'CMS', path: '/cms', icon: FileEdit, step: 'cms' as WorkflowStep, stepNumber: 3 },
  { name: 'Dashboards', path: '/dashboards', icon: LayoutDashboard, step: 'dashboard' as WorkflowStep, stepNumber: 4 },
  { name: 'Finalize', path: '/finalize', icon: Flag, step: 'finalize' as WorkflowStep, stepNumber: 5 }
])

// Non-workflow items (no step number)
const bottomItems = computed(() => [
  { name: 'Portfolio', path: '/products/portfolio', icon: FolderOpen }
])

const getStepStatus = (step: WorkflowStep) => workflow.stepStatuses[step]
const isStepLocked = (step: WorkflowStep) => getStepStatus(step) === 'locked'
const isStepComplete = (step: WorkflowStep) => getStepStatus(step) === 'complete'

const isActive = (path: string) => {
  if (path === '/site') {
    return route.path === '/site' || route.path.startsWith('/site/')
  }
  return route.path === path || route.path.startsWith(path + '/')
}

const isChildActive = (path: string) => {
  return route.path === path
}

const handleLogout = () => {
  logout({ logoutParams: { returnTo: window.location.origin } })
}

const confirmingReset = ref(false)

const handleReset = () => {
  if (!confirmingReset.value) {
    confirmingReset.value = true
    setTimeout(() => { confirmingReset.value = false }, 3000)
    return
  }
  confirmingReset.value = false
  workflow.resetWorkflow()
  router.push('/client')
}

// Close mobile menu on navigation
watch(() => route.path, () => {
  if (sidebar.isMobile) {
    sidebar.closeMobile()
  }
})

const handleNavClick = (path: string) => {
  router.push(path)
  if (sidebar.isMobile) {
    sidebar.closeMobile()
  }
}

const toggleSection = (path: string) => {
  expandedSections.value[path] = !expandedSections.value[path]
}
</script>

<template>
  <!-- Mobile Backdrop Overlay -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="sidebar.isMobile && sidebar.isMobileOpen"
        class="fixed inset-0 bg-black/50 z-40 lg:hidden"
        @click="sidebar.closeMobile"
      />
    </Transition>
  </Teleport>

  <!-- Sidebar -->
  <aside
    class="h-screen fixed left-0 flex flex-col border-r transition-all duration-300 z-50"
    :class="[
      sidebar.isMobile ? 'w-16' : sidebar.widthClass,
      sidebar.isMobile ? (sidebar.isMobileOpen ? 'translate-x-0' : '-translate-x-full') : '',
      !sidebar.isMobile ? 'translate-x-0' : '',
      sidebar.isMobile ? 'top-[60px]' : 'top-0'
    ]"
    :style="{
      backgroundColor: 'var(--theme-sidebar-bg)',
      borderColor: 'var(--theme-border)',
      height: sidebar.isMobile ? 'calc(100vh - 60px)' : '100vh'
    }"
  >
    <!-- Header (Desktop only) -->
    <div v-if="!sidebar.isMobile" class="p-4 border-b relative" :style="{ borderColor: 'var(--theme-border)' }">
      <div v-if="!sidebar.isCollapsed">
        <h1 class="text-lg font-bold" :style="{ color: 'var(--theme-text-primary)' }">Phifer Web Solutions</h1>
        <p class="text-xs" :style="{ color: 'var(--theme-text-muted)' }">Build Tools</p>
      </div>
      <div v-else class="flex justify-center py-1">
        <LogoIcon class="w-12 h-12" :style="{ color: 'var(--theme-primary)' }" />
      </div>

      <!-- Desktop Collapse Toggle Button -->
      <button
        @click="sidebar.toggle"
        class="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-colors"
        :style="{
          backgroundColor: 'var(--theme-bg-primary)',
          color: 'var(--theme-text-secondary)',
          borderColor: 'var(--theme-border)'
        }"
        style="border-width: 1px;"
        :title="sidebar.isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      >
        <ChevronLeft v-if="!sidebar.isCollapsed" class="w-4 h-4" />
        <ChevronRight v-else class="w-4 h-4" />
      </button>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 p-2 overflow-y-auto" :class="{ 'px-2': sidebar.isCollapsed || sidebar.isMobile, 'p-4': !sidebar.isCollapsed && !sidebar.isMobile }">
      <!-- Workflow Steps -->
      <ul class="space-y-1">
        <li v-for="item in workflowItems" :key="item.path">
          <!-- Items with children (Site Builder) -->
          <template v-if="item.children">
            <button
              @click="isStepLocked(item.step) ? undefined : ((sidebar.isCollapsed || sidebar.isMobile) ? handleNavClick(item.path) : toggleSection(item.path))"
              class="flex items-center rounded-lg transition-all w-full text-left"
              :class="[
                (sidebar.isCollapsed || sidebar.isMobile) ? 'justify-center px-2 py-3' : 'gap-3 px-3 py-3',
                isStepLocked(item.step) ? 'opacity-40 cursor-not-allowed' : '',
                !isActive(item.path) && !isStepLocked(item.step) ? 'hover:bg-[var(--theme-sidebar-hover)]' : ''
              ]"
              :style="isActive(item.path) && !isStepLocked(item.step)
                ? { backgroundColor: 'var(--theme-sidebar-active)', color: 'var(--theme-text-inverse)' }
                : { color: 'var(--theme-sidebar-text)' }"
              :title="(sidebar.isCollapsed || sidebar.isMobile) ? item.name : undefined"
              :disabled="isStepLocked(item.step)"
            >
              <!-- Step number / check badge (collapsed) -->
              <span
                v-if="sidebar.isCollapsed || sidebar.isMobile"
                class="relative"
              >
                <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
                <span
                  v-if="isStepComplete(item.step)"
                  class="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center"
                  :style="isActive(item.path)
                    ? { backgroundColor: 'var(--theme-text-inverse)', color: 'var(--theme-primary)' }
                    : { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
                >
                  <Check class="w-2 h-2" />
                </span>
              </span>
              <!-- Expanded view -->
              <template v-if="!sidebar.isCollapsed && !sidebar.isMobile">
                <span
                  class="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  :style="isStepComplete(item.step) && isActive(item.path)
                    ? { backgroundColor: 'var(--theme-text-inverse)', color: 'var(--theme-primary)' }
                    : isStepComplete(item.step)
                      ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }
                      : isActive(item.path)
                        ? { backgroundColor: 'var(--theme-text-inverse)', color: 'var(--theme-sidebar-active)' }
                        : { backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }"
                >
                  <Check v-if="isStepComplete(item.step)" class="w-3 h-3" />
                  <template v-else>{{ item.stepNumber }}</template>
                </span>
                <span class="font-medium flex-1">{{ item.name }}</span>
                <ChevronDown
                  class="w-4 h-4 transition-transform duration-200"
                  :class="{ 'rotate-180': expandedSections[item.path] }"
                />
              </template>
            </button>

            <!-- Sub-items (only shown when expanded and not collapsed) -->
            <ul
              v-if="!sidebar.isCollapsed && !sidebar.isMobile && expandedSections[item.path] && !isStepLocked(item.step)"
              class="ml-8 mt-1 space-y-1"
            >
              <li v-for="child in item.children" :key="child.path">
                <button
                  @click="handleNavClick(child.path)"
                  class="flex items-center gap-2 px-3 py-2 rounded-lg transition-all w-full text-left text-sm"
                  :class="!isChildActive(child.path) ? 'hover:bg-[var(--theme-sidebar-hover)]' : ''"
                  :style="isChildActive(child.path)
                    ? { backgroundColor: 'var(--theme-sidebar-active)', color: 'var(--theme-text-inverse)' }
                    : { color: 'var(--theme-sidebar-text)' }"
                >
                  <span class="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    :style="{ backgroundColor: isChildActive(child.path) ? 'var(--theme-text-inverse)' : 'var(--theme-text-muted)' }"
                  />
                  {{ child.name }}
                </button>
              </li>
            </ul>
          </template>

          <!-- Regular workflow items -->
          <template v-else>
            <button
              @click="isStepLocked(item.step) ? undefined : handleNavClick(item.path)"
              class="flex items-center rounded-lg transition-all w-full text-left"
              :class="[
                (sidebar.isCollapsed || sidebar.isMobile) ? 'justify-center px-2 py-3' : 'gap-3 px-3 py-3',
                isStepLocked(item.step) ? 'opacity-40 cursor-not-allowed' : '',
                !isActive(item.path) && !isStepLocked(item.step) ? 'hover:bg-[var(--theme-sidebar-hover)]' : ''
              ]"
              :style="isActive(item.path) && !isStepLocked(item.step)
                ? { backgroundColor: 'var(--theme-sidebar-active)', color: 'var(--theme-text-inverse)' }
                : { color: 'var(--theme-sidebar-text)' }"
              :title="(sidebar.isCollapsed || sidebar.isMobile) ? item.name : undefined"
              :disabled="isStepLocked(item.step)"
            >
              <!-- Step number / check badge (collapsed) -->
              <span
                v-if="sidebar.isCollapsed || sidebar.isMobile"
                class="relative"
              >
                <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
                <span
                  v-if="isStepComplete(item.step)"
                  class="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center"
                  :style="isActive(item.path)
                    ? { backgroundColor: 'var(--theme-text-inverse)', color: 'var(--theme-primary)' }
                    : { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
                >
                  <Check class="w-2 h-2" />
                </span>
              </span>
              <!-- Expanded view -->
              <template v-if="!sidebar.isCollapsed && !sidebar.isMobile">
                <span
                  class="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  :style="isStepComplete(item.step) && isActive(item.path)
                    ? { backgroundColor: 'var(--theme-text-inverse)', color: 'var(--theme-primary)' }
                    : isStepComplete(item.step)
                      ? { backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }
                      : isActive(item.path)
                        ? { backgroundColor: 'var(--theme-text-inverse)', color: 'var(--theme-sidebar-active)' }
                        : { backgroundColor: 'var(--theme-bg-tertiary)', color: 'var(--theme-text-muted)' }"
                >
                  <Check v-if="isStepComplete(item.step)" class="w-3 h-3" />
                  <template v-else>{{ item.stepNumber }}</template>
                </span>
                <span class="font-medium">{{ item.name }}</span>
              </template>
            </button>
          </template>
        </li>
      </ul>

      <!-- Separator -->
      <div
        v-if="!sidebar.isCollapsed && !sidebar.isMobile"
        class="my-3 border-t"
        :style="{ borderColor: 'var(--theme-border)' }"
      />

      <!-- Non-workflow items (Portfolio) -->
      <ul class="space-y-1" :class="{ 'mt-2': sidebar.isCollapsed || sidebar.isMobile }">
        <li v-for="item in bottomItems" :key="item.path">
          <button
            @click="handleNavClick(item.path)"
            class="flex items-center rounded-lg transition-all w-full text-left"
            :class="[
              (sidebar.isCollapsed || sidebar.isMobile) ? 'justify-center px-2 py-3' : 'gap-3 px-3 py-3',
              !isActive(item.path) ? 'hover:bg-[var(--theme-sidebar-hover)]' : ''
            ]"
            :style="isActive(item.path)
              ? { backgroundColor: 'var(--theme-sidebar-active)', color: 'var(--theme-text-inverse)' }
              : { color: 'var(--theme-sidebar-text)' }"
            :title="(sidebar.isCollapsed || sidebar.isMobile) ? item.name : undefined"
          >
            <component :is="item.icon" class="w-5 h-5 shrink-0" />
            <span v-if="!sidebar.isCollapsed && !sidebar.isMobile" class="font-medium">{{ item.name }}</span>
          </button>
        </li>
      </ul>

    </nav>

    <!-- Footer -->
    <div class="p-2 border-t space-y-3" :class="{ 'px-2': sidebar.isCollapsed || sidebar.isMobile, 'p-4': !sidebar.isCollapsed && !sidebar.isMobile }" :style="{ borderColor: 'var(--theme-border)' }">
      <!-- Collapsed/Mobile: Theme Toggle stacked above user -->
      <div v-if="sidebar.isCollapsed || sidebar.isMobile" class="flex justify-center">
        <ThemeToggle />
      </div>

      <!-- User Info -->
      <div class="flex items-center" :class="(sidebar.isCollapsed || sidebar.isMobile) ? 'justify-center' : 'gap-3'">
        <img
          v-if="user?.picture"
          :src="user.picture"
          :alt="user.name || 'User'"
          class="w-10 h-10 rounded-full flex-shrink-0"
          :title="(sidebar.isCollapsed || sidebar.isMobile) ? user?.name : undefined"
        />
        <div
          v-else
          class="w-10 h-10 rounded-full flex items-center justify-center font-semibold flex-shrink-0"
          :style="{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-inverse)' }"
          :title="(sidebar.isCollapsed || sidebar.isMobile) ? user?.name : undefined"
        >
          {{ user?.name?.charAt(0) || 'U' }}
        </div>
        <div v-if="!sidebar.isCollapsed && !sidebar.isMobile" class="flex-1 min-w-0">
          <p class="text-sm font-medium truncate" :style="{ color: 'var(--theme-text-primary)' }">{{ user?.name || 'User' }}</p>
          <p class="text-xs truncate" :style="{ color: 'var(--theme-text-muted)' }">{{ user?.email }}</p>
        </div>
        <!-- Expanded Desktop: Theme Toggle inline with user info -->
        <ThemeToggle v-if="!sidebar.isCollapsed && !sidebar.isMobile" />
      </div>

      <!-- Reset Button -->
      <button
        @click="handleReset"
        class="flex items-center w-full text-sm rounded-lg transition-colors"
        :class="[
          (sidebar.isCollapsed || sidebar.isMobile) ? 'justify-center px-2 py-3' : 'gap-2 px-3 py-3',
          confirmingReset ? 'hover:bg-(--theme-danger-light)' : 'hover:bg-(--theme-sidebar-hover)'
        ]"
        :style="{ color: confirmingReset ? 'var(--theme-danger)' : 'var(--theme-text-muted)' }"
        :title="(sidebar.isCollapsed || sidebar.isMobile) ? (confirmingReset ? 'Confirm Reset' : 'Reset Workflow') : undefined"
      >
        <RotateCcw class="w-4 h-4 shrink-0" />
        <span v-if="!sidebar.isCollapsed && !sidebar.isMobile">
          {{ confirmingReset ? 'Confirm Reset?' : 'Reset' }}
        </span>
      </button>

      <!-- Logout Button -->
      <button
        @click="handleLogout"
        class="flex items-center w-full text-sm rounded-lg transition-colors hover:bg-[var(--theme-danger-light)]"
        :class="(sidebar.isCollapsed || sidebar.isMobile) ? 'justify-center px-2 py-3' : 'gap-2 px-3 py-3'"
        :style="{ color: 'var(--theme-danger)' }"
        :title="(sidebar.isCollapsed || sidebar.isMobile) ? 'Log Out' : undefined"
      >
        <LogOut class="w-4 h-4 flex-shrink-0" />
        <span v-if="!sidebar.isCollapsed && !sidebar.isMobile">Log Out</span>
      </button>
    </div>
  </aside>
</template>
