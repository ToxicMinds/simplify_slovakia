/**
 * storage.js
 * 
 * Centralized localStorage management for session persistence
 */

const STORAGE_KEYS = {
  FLOW_ID: 'simplify_slovakia_flow_id',
  PROGRESS: 'simplify_slovakia_progress',  // Existing, keep for compatibility
  INTAKE: 'simplify_slovakia_intake',      // Existing, keep for compatibility
  SESSION: 'simplify_slovakia_session',    // NEW: unified session state
}

/**
 * Save complete session state
 */
export function saveSession(state) {
  try {
    const sessionData = {
      flowId: state.flowId,
      completedSteps: Array.from(state.completedSteps || []),
      expandedSteps: Array.from(state.expandedSteps || []),
      documents: state.documents || {},
      intakeAnswers: state.intakeAnswers || null,
      showIntake: state.showIntake ?? true,
      timestamp: new Date().toISOString(),
    }
    
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData))
    
    // Also save to individual keys for backward compatibility
    if (state.flowId) {
      localStorage.setItem(STORAGE_KEYS.FLOW_ID, state.flowId)
    }
    
    return true
  } catch (error) {
    console.error('Failed to save session:', error)
    return false
  }
}

/**
 * Load complete session state
 */
export function loadSession() {
  try {
    const sessionJson = localStorage.getItem(STORAGE_KEYS.SESSION)
    
    if (!sessionJson) {
      // Try loading from old format for backward compatibility
      const oldFlowId = localStorage.getItem(STORAGE_KEYS.FLOW_ID)
      const oldProgress = localStorage.getItem(`progress_${oldFlowId}`)
      const oldIntake = localStorage.getItem(STORAGE_KEYS.INTAKE)
      
      if (oldFlowId) {
        const progressData = oldProgress ? JSON.parse(oldProgress) : {}
        const intakeData = oldIntake ? JSON.parse(oldIntake) : null
        
        return {
          flowId: oldFlowId,
          completedSteps: new Set(progressData.completed || []),
          expandedSteps: new Set(),
          documents: progressData.documents || {},
          intakeAnswers: intakeData,
          showIntake: false,
          timestamp: progressData.lastUpdated,
        }
      }
      
      return null
    }
    
    const sessionData = JSON.parse(sessionJson)
    
    return {
      flowId: sessionData.flowId,
      completedSteps: new Set(sessionData.completedSteps || []),
      expandedSteps: new Set(sessionData.expandedSteps || []),
      documents: sessionData.documents || {},
      intakeAnswers: sessionData.intakeAnswers,
      showIntake: sessionData.showIntake ?? true,
      timestamp: sessionData.timestamp,
    }
  } catch (error) {
    console.error('Failed to load session:', error)
    return null
  }
}

/**
 * Clear session (for logout or reset)
 */
export function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEYS.SESSION)
    localStorage.removeItem(STORAGE_KEYS.FLOW_ID)
    // Keep PROGRESS and INTAKE for now (backward compatibility)
    return true
  } catch (error) {
    console.error('Failed to clear session:', error)
    return false
  }
}

/**
 * Check if session exists
 */
export function hasSession() {
  return localStorage.getItem(STORAGE_KEYS.SESSION) !== null ||
         localStorage.getItem(STORAGE_KEYS.FLOW_ID) !== null
}