const STORAGE_KEYS = {
  SESSION: 'simplify_slovakia_session',
  FLOW_ID: 'simplify_slovakia_flow_id'
}

export function saveSession(state) {
  try {
    const sessionData = {
      flowId: state.flowId,
      // CRITICAL: Ensure Sets are converted to Arrays for JSON
      completedSteps: Array.from(state.completedSteps || []),
      expandedSteps: Array.from(state.expandedSteps || []),
      documents: state.documents || {},
      showIntake: state.showIntake,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData))
    localStorage.setItem(STORAGE_KEYS.FLOW_ID, state.flowId)
    return true
  } catch (error) {
    console.error('Save failed', error)
    return false
  }
}

export function loadSession() {
  try {
    const sessionJson = localStorage.getItem(STORAGE_KEYS.SESSION)
    if (!sessionJson) return null
    
    const data = JSON.parse(sessionJson)
    return {
      ...data,
      // CRITICAL: Convert Arrays back to Sets for the App state
      completedSteps: new Set(data.completedSteps || []),
      expandedSteps: new Set(data.expandedSteps || []),
    }
  } catch (error) {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.SESSION)
  localStorage.removeItem(STORAGE_KEYS.FLOW_ID)
}
