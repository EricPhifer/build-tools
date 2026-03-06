import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useCompositionStore } from './composition'
import type { ClientInfo, WorkflowStep, StepStatus, PortfolioEntry, PortfolioStatus } from '../types/registry'

const STORAGE_KEY = 'build-tools-workflow'

export interface StepDefinition {
  id: WorkflowStep
  label: string
  route: string
  stepNumber: number
}

export interface ExtendSnapshot {
  pageIds: string[]    // IDs of pages from the original build
}

const STEP_ORDER: StepDefinition[] = [
  { id: 'client', label: 'Client Setup', route: '/client', stepNumber: 1 },
  { id: 'site', label: 'Site Builder', route: '/site', stepNumber: 2 },
  { id: 'cms', label: 'CMS', route: '/cms', stepNumber: 3 },
  { id: 'dashboard', label: 'Dashboards', route: '/dashboards', stepNumber: 4 },
  { id: 'finalize', label: 'Finalize', route: '/finalize', stepNumber: 5 }
]

function createDefaultStatuses(): Record<WorkflowStep, StepStatus> {
  return {
    client: 'available',
    site: 'locked',
    cms: 'locked',
    dashboard: 'locked',
    finalize: 'locked'
  }
}

interface WorkflowState {
  currentStep: WorkflowStep
  stepStatuses: Record<WorkflowStep, StepStatus>
  clientInfo: ClientInfo | null
  savedClients: ClientInfo[]
  savedPortfolio: PortfolioEntry[]
  finalizeProgress: Record<string, boolean>
  extendMode: boolean
  extendSnapshot: ExtendSnapshot | null
  extendSourceEntryId: string | null
}

function loadFromStorage(): WorkflowState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        currentStep: parsed.currentStep || 'client',
        stepStatuses: { ...createDefaultStatuses(), ...parsed.stepStatuses },
        clientInfo: parsed.clientInfo || null,
        savedClients: parsed.savedClients || [],
        savedPortfolio: parsed.savedPortfolio || [],
        finalizeProgress: parsed.finalizeProgress || {},
        extendMode: parsed.extendMode || false,
        extendSnapshot: parsed.extendSnapshot || null,
        extendSourceEntryId: parsed.extendSourceEntryId || null
      }
    }
  } catch {
    // Ignore parse errors
  }
  return {
    currentStep: 'client',
    stepStatuses: createDefaultStatuses(),
    clientInfo: null,
    savedClients: [],
    savedPortfolio: [],
    finalizeProgress: {},
    extendMode: false,
    extendSnapshot: null,
    extendSourceEntryId: null
  }
}

export const useWorkflowStore = defineStore('workflow', () => {
  const initial = loadFromStorage()

  const currentStep = ref<WorkflowStep>(initial.currentStep)
  const stepStatuses = ref<Record<WorkflowStep, StepStatus>>(initial.stepStatuses)
  const clientInfo = ref<ClientInfo | null>(initial.clientInfo)
  const savedClients = ref<ClientInfo[]>(initial.savedClients)
  const savedPortfolio = ref<PortfolioEntry[]>(initial.savedPortfolio)
  const finalizeProgress = ref<Record<string, boolean>>(initial.finalizeProgress)
  const extendMode = ref<boolean>(initial.extendMode)
  const extendSnapshot = ref<ExtendSnapshot | null>(initial.extendSnapshot)
  const extendSourceEntryId = ref<string | null>(initial.extendSourceEntryId)

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      currentStep: currentStep.value,
      stepStatuses: stepStatuses.value,
      clientInfo: clientInfo.value,
      savedClients: savedClients.value,
      savedPortfolio: savedPortfolio.value,
      finalizeProgress: finalizeProgress.value,
      extendMode: extendMode.value,
      extendSnapshot: extendSnapshot.value,
      extendSourceEntryId: extendSourceEntryId.value
    }))
  }

  // === Computed ===
  const steps = computed(() =>
    STEP_ORDER.map(step => ({
      ...step,
      status: stepStatuses.value[step.id]
    }))
  )

  const currentStepIndex = computed(() =>
    STEP_ORDER.findIndex(s => s.id === currentStep.value)
  )

  const progressPercent = computed(() => {
    const completed = Object.values(stepStatuses.value).filter(s => s === 'complete').length
    return Math.round((completed / STEP_ORDER.length) * 100)
  })

  // === Actions ===
  function setClient(client: ClientInfo) {
    clientInfo.value = client
    // Sync project name to composition store
    const composition = useCompositionStore()
    composition.setProjectName(client.name)
    save()
  }

  function saveClient(client: ClientInfo) {
    const idx = savedClients.value.findIndex(c => c.id === client.id)
    if (idx >= 0) {
      savedClients.value[idx] = { ...client, updatedAt: new Date().toISOString() }
    } else {
      savedClients.value.push({ ...client, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    }
    save()
  }

  function searchClients(query: string): ClientInfo[] {
    if (!query.trim()) return savedClients.value
    const q = query.toLowerCase()
    return savedClients.value.filter(c =>
      c.name.toLowerCase().includes(q) || c.domain.toLowerCase().includes(q)
    )
  }

  function goToStep(step: WorkflowStep) {
    const status = stepStatuses.value[step]
    if (status === 'locked') return
    currentStep.value = step
    // Mark as in-progress if it was just available
    if (status === 'available') {
      stepStatuses.value[step] = 'in-progress'
    }
    save()
  }

  function completeStep(step: WorkflowStep) {
    stepStatuses.value[step] = 'complete'
    // Unlock the next step
    const idx = STEP_ORDER.findIndex(s => s.id === step)
    if (idx >= 0 && idx < STEP_ORDER.length - 1) {
      const nextStep = STEP_ORDER[idx + 1]!.id
      if (stepStatuses.value[nextStep] === 'locked') {
        stepStatuses.value[nextStep] = 'available'
      }
    }
    save()
  }

  function getStepRoute(step: WorkflowStep): string {
    return STEP_ORDER.find(s => s.id === step)?.route ?? '/client'
  }

  function getNextStep(): StepDefinition | null {
    const idx = STEP_ORDER.findIndex(s => s.id === currentStep.value)
    if (idx >= 0 && idx < STEP_ORDER.length - 1) {
      return STEP_ORDER[idx + 1]!
    }
    return null
  }

  function addPortfolioEntry(entry: PortfolioEntry) {
    const idx = savedPortfolio.value.findIndex(e => e.id === entry.id)
    if (idx >= 0) {
      savedPortfolio.value[idx] = entry
    } else {
      savedPortfolio.value.unshift(entry)
    }
    save()
  }

  function removePortfolioEntry(id: string) {
    savedPortfolio.value = savedPortfolio.value.filter(e => e.id !== id)
    save()
  }

  function updatePortfolioStatus(id: string, status: PortfolioStatus) {
    const entry = savedPortfolio.value.find(e => e.id === id)
    if (entry) {
      entry.status = status
      save()
    }
  }

  function setFinalizeProgress(progress: Record<string, boolean>) {
    finalizeProgress.value = progress
    save()
  }

  function updatePortfolioFinalizeProgress(entryId: string, progress: Record<string, boolean>) {
    const entry = savedPortfolio.value.find(e => e.id === entryId)
    if (entry) {
      entry.finalizeProgress = progress
      save()
    }
  }

  function enterExtendMode(entryId: string, pageIds: string[]) {
    stepStatuses.value = {
      client: 'complete',
      site: 'complete',
      cms: 'complete',
      dashboard: 'complete',
      finalize: 'complete'
    }
    currentStep.value = 'site'
    extendMode.value = true
    extendSnapshot.value = { pageIds }
    extendSourceEntryId.value = entryId
    save()
  }

  function exitExtendMode() {
    extendMode.value = false
    extendSnapshot.value = null
    extendSourceEntryId.value = null
    save()
  }

  function resetWorkflow() {
    currentStep.value = 'client'
    stepStatuses.value = createDefaultStatuses()
    clientInfo.value = null
    finalizeProgress.value = {}
    extendMode.value = false
    extendSnapshot.value = null
    extendSourceEntryId.value = null
    const composition = useCompositionStore()
    composition.reset()
    save()
  }

  return {
    currentStep,
    stepStatuses,
    clientInfo,
    savedClients,
    savedPortfolio,
    finalizeProgress,
    extendMode,
    extendSnapshot,
    extendSourceEntryId,
    steps,
    currentStepIndex,
    progressPercent,
    setClient,
    saveClient,
    searchClients,
    goToStep,
    completeStep,
    getStepRoute,
    getNextStep,
    addPortfolioEntry,
    removePortfolioEntry,
    updatePortfolioStatus,
    setFinalizeProgress,
    updatePortfolioFinalizeProgress,
    enterExtendMode,
    exitExtendMode,
    resetWorkflow,
    STEP_ORDER
  }
})
