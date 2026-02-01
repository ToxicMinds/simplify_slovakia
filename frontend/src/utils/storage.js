/**
 * storage.js - CORRECTED VERSION v2
 * 
 * Replaces: ~/simplify_slovakia/frontend/src/utils/storage.js
 * 
 * FIXES:
 * 1. Properly converts Arrays to Sets when loading
 * 2. Defaults to INTAKE mode (matches your original behavior)
 */

// ============================================================================
// SESSION MODES - Explicit state machine
// ============================================================================

export const SESSION_MODES = {
  INTAKE: 'INTAKE',
  SELECTING_FLOW: 'SELECTING_FLOW',
  IN_FLOW: 'IN_FLOW'
}

// ============================================================================
// STORAGE KEY
// ============================================================================

const STORAGE_KEY = 'simplify_slovakia_session'

// Old keys for backward compatibility during migration
const OLD_KEYS = {
  FLOW_ID: 'simplify_slovakia_flow_id',
  PROGRESS: 'simplify_slovakia_progress',
  INTAKE: 'simplify_slovakia_intake',
  SESSION: 'simplify_slovakia_session',
}

// ============================================================================
// VALIDATION - Enforce invariants
// ============================================================================

/**
 * Validate session against mode-specific invariants
 */
function validateSession(session) {
  if (!session || !session.mode) return false
  
  switch (session.mode) {
    case SESSION_MODES.INTAKE:
      // INTAKE requires intakeAnswers, forbids flowId
      if (session.flowId) return false
      return true
      
    case SESSION_MODES.SELECTING_FLOW:
      // SELECTING_FLOW forbids flowId (can have intakeAnswers with recommendation)
      if (session.flowId) return false
      return true
      
    case SESSION_MODES.IN_FLOW:
      // IN_FLOW requires flowId
      if (!session.flowId) return false
      return true
      
    default:
      return false
  }
}

// ============================================================================
// MIGRATION - Convert old format
// ============================================================================

/**
 * Migrate from old storage format (your current format)
 */
function migrateOldSession() {
  try {
    // Try new format first
    const sessionJson = localStorage.getItem(STORAGE_KEY)
    if (sessionJson) {
      const session = JSON.parse(sessionJson)
      if (session.mode) {
        // Already has mode, convert Arrays back to Sets
        const converted = {
          ...session,
          completedSteps: new Set(session.completedSteps || []),
          expandedSteps: new Set(session.expandedSteps || [])
        }
        if (validateSession(converted)) {
          return converted
        }
      }
    }
    
    // Try old format (your current format)
    const oldSession = localStorage.getItem(OLD_KEYS.SESSION)
    if (oldSession) {
      const oldData = JSON.parse(oldSession)
      
      // If has flowId, was showing flow (IN_FLOW mode)
      if (oldData.flowId) {
        return {
          mode: SESSION_MODES.IN_FLOW,
          flowId: oldData.flowId,
          completedSteps: new Set(oldData.completedSteps || []),
          expandedSteps: new Set(oldData.expandedSteps || []),
          documents: oldData.documents || {},
          intakeAnswers: oldData.intakeAnswers || null,
          timestamp: oldData.timestamp || new Date().toISOString()
        }
      }
      
      // If has intakeAnswers but no flowId, was in SELECTING_FLOW
      if (oldData.intakeAnswers) {
        return {
          mode: SESSION_MODES.SELECTING_FLOW,
          flowId: null,
          completedSteps: new Set(),
          expandedSteps: new Set(),
          documents: {},
          intakeAnswers: oldData.intakeAnswers,
          timestamp: oldData.timestamp || new Date().toISOString()
        }
      }
      
      // If showIntake was true, was in INTAKE mode
      if (oldData.showIntake === true) {
        return {
          mode: SESSION_MODES.INTAKE,
          flowId: null,
          completedSteps: new Set(),
          expandedSteps: new Set(),
          documents: {},
          intakeAnswers: null,
          timestamp: oldData.timestamp || new Date().toISOString()
        }
      }
    }
    
    // Check for individual old keys
    const oldFlowId = localStorage.getItem(OLD_KEYS.FLOW_ID)
    if (oldFlowId) {
      const progressKey = `progress_${oldFlowId}`
      const oldProgress = localStorage.getItem(progressKey)
      const progressData = oldProgress ? JSON.parse(oldProgress) : {}
      
      return {
        mode: SESSION_MODES.IN_FLOW,
        flowId: oldFlowId,
        completedSteps: new Set(progressData.completed || []),
        expandedSteps: new Set(),
        documents: progressData.documents || {},
        intakeAnswers: null,
        timestamp: progressData.lastUpdated || new Date().toISOString()
      }
    }
    
    // No old data, return empty
    return null
  } catch (error) {
    console.error('Migration failed:', error)
    return null
  }
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

export function createEmptySession() {
  return {
    mode: SESSION_MODES.INTAKE,  // ✅ Default to intake (matches your original behavior)
    flowId: null,
    completedSteps: new Set(),
    expandedSteps: new Set(),
    documents: {},
    intakeAnswers: null,
    timestamp: new Date().toISOString()
  }
}

// ============================================================================
// PUBLIC API - Load/Save/Clear
// ============================================================================

/**
 * Load session from localStorage
 * Automatically migrates old format and converts Arrays to Sets
 */
export function loadSession() {
  try {
    const migrated = migrateOldSession()
    
    if (migrated && validateSession(migrated)) {
      // Ensure Sets (defensive programming)
      return {
        ...migrated,
        completedSteps: migrated.completedSteps instanceof Set 
          ? migrated.completedSteps 
          : new Set(migrated.completedSteps || []),
        expandedSteps: migrated.expandedSteps instanceof Set 
          ? migrated.expandedSteps 
          : new Set(migrated.expandedSteps || [])
      }
    }
    
    return createEmptySession()
  } catch (error) {
    console.error('Error loading session:', error)
    return createEmptySession()
  }
}

/**
 * Save session to localStorage
 * Validates before saving and converts Sets to Arrays
 */
export function saveSession(session) {
  // Add mode if missing (backward compatibility during transition)
  if (!session.mode) {
    if (session.flowId) {
      session.mode = SESSION_MODES.IN_FLOW
    } else if (session.showIntake === true) {
      session.mode = SESSION_MODES.INTAKE
    } else {
      session.mode = SESSION_MODES.SELECTING_FLOW
    }
  }
  
  // Ensure Sets before validation
  const sessionWithSets = {
    ...session,
    completedSteps: session.completedSteps instanceof Set 
      ? session.completedSteps 
      : new Set(session.completedSteps || []),
    expandedSteps: session.expandedSteps instanceof Set 
      ? session.expandedSteps 
      : new Set(session.expandedSteps || [])
  }
  
  if (!validateSession(sessionWithSets)) {
    console.error('Invalid session state:', sessionWithSets)
    throw new Error('Invalid session state')
  }
  
  // Convert Sets to Arrays for JSON serialization
  const sessionToSave = {
    mode: sessionWithSets.mode,
    flowId: sessionWithSets.flowId || null,
    completedSteps: Array.from(sessionWithSets.completedSteps || []),
    expandedSteps: Array.from(sessionWithSets.expandedSteps || []),
    documents: sessionWithSets.documents || {},
    intakeAnswers: sessionWithSets.intakeAnswers || null,
    timestamp: new Date().toISOString()
  }
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionToSave))
    
    // Also save to old format for backward compatibility (temporary)
    if (sessionWithSets.flowId) {
      localStorage.setItem(OLD_KEYS.FLOW_ID, sessionWithSets.flowId)
      localStorage.setItem(
        `progress_${sessionWithSets.flowId}`,
        JSON.stringify({
          completed: Array.from(sessionWithSets.completedSteps || []),
          documents: sessionWithSets.documents || {},
          lastUpdated: new Date().toISOString()
        })
      )
    }
    
    return true
  } catch (error) {
    console.error('Error saving session:', error)
    return false
  }
}

/**
 * Clear session
 */
export function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(OLD_KEYS.FLOW_ID)
    
    // Clear old progress keys
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('progress_')) {
        localStorage.removeItem(key)
      }
    })
    
    return true
  } catch (error) {
    console.error('Error clearing session:', error)
    return false
  }
}

/**
 * Check if session exists
 */
export function hasSession() {
  return localStorage.getItem(STORAGE_KEY) !== null
}

// ============================================================================
// STATE TRANSITIONS
// ============================================================================

export function transitionToIntake() {
  return {
    mode: SESSION_MODES.INTAKE,
    flowId: null,
    completedSteps: new Set(),
    expandedSteps: new Set(),
    documents: {},
    intakeAnswers: null,
    timestamp: new Date().toISOString()
  }
}

export function transitionToSelectingFlow(intakeAnswers = null) {
  return {
    mode: SESSION_MODES.SELECTING_FLOW,
    flowId: null,
    completedSteps: new Set(),
    expandedSteps: new Set(),
    documents: {},
    intakeAnswers,
    timestamp: new Date().toISOString()
  }
}

export function transitionToInFlow(flowId, preserveData = {}) {
  return {
    mode: SESSION_MODES.IN_FLOW,
    flowId,
    completedSteps: preserveData.completedSteps instanceof Set 
      ? preserveData.completedSteps 
      : new Set(preserveData.completedSteps || []),
    expandedSteps: preserveData.expandedSteps instanceof Set 
      ? preserveData.expandedSteps 
      : new Set(preserveData.expandedSteps || []),
    documents: preserveData.documents || {},
    intakeAnswers: preserveData.intakeAnswers || null,
    timestamp: new Date().toISOString()
  }
}
