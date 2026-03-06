import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Project, ProjectType, ProjectStatus, ProjectLink } from '../types/registry'

const STORAGE_KEY = 'build-tools-projects'

const SEED_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'Phifer Web Solutions — Site Rebuild',
    type: 'personal_website',
    description: 'Rebuilding my own agency site with updated portfolio, services, and case studies.',
    status: 'in_progress',
    links: [],
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'proj-2',
    name: 'Board Game Rules & Tools Dashboard',
    type: 'dashboard',
    description: 'Specialized dashboard for tracking board game rules, reference cards, and game tools.',
    status: 'planning',
    links: [],
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'proj-3',
    name: 'Song Database UI',
    type: 'database_catalog',
    description: 'Database interface for cataloging and browsing a song collection.',
    status: 'planning',
    links: [],
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'proj-4',
    name: 'Meal Planner',
    type: 'custom_tool',
    description: 'Custom meal planning tool with recipe management and grocery list generation.',
    status: 'planning',
    links: [],
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'proj-5',
    name: 'Carpentry Projects Database',
    type: 'database_catalog',
    description: 'Catalog of carpentry projects with plans, materials lists, and build notes.',
    status: 'planning',
    links: [],
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

function loadFromStorage(): Project[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored) as Project[]
  } catch {
    // Ignore parse errors
  }
  // Seed on first load
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_PROJECTS))
  return SEED_PROJECTS
}

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>(loadFromStorage())

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects.value))
  }

  function getProject(id: string): Project | undefined {
    return projects.value.find(p => p.id === id)
  }

  function createProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Project {
    const project: Project = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    projects.value.unshift(project)
    save()
    return project
  }

  function updateProject(id: string, partial: Partial<Omit<Project, 'id' | 'createdAt'>>) {
    const project = projects.value.find(p => p.id === id)
    if (project) {
      Object.assign(project, { ...partial, updatedAt: new Date().toISOString() })
      save()
    }
  }

  function addLink(projectId: string, link: Omit<ProjectLink, 'id'>) {
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      project.links.push({ ...link, id: crypto.randomUUID() })
      project.updatedAt = new Date().toISOString()
      save()
    }
  }

  function removeLink(projectId: string, linkId: string) {
    const project = projects.value.find(p => p.id === projectId)
    if (project) {
      project.links = project.links.filter(l => l.id !== linkId)
      project.updatedAt = new Date().toISOString()
      save()
    }
  }

  function deleteProject(id: string) {
    projects.value = projects.value.filter(p => p.id !== id)
    save()
  }

  return {
    projects,
    getProject,
    createProject,
    updateProject,
    addLink,
    removeLink,
    deleteProject
  }
})
