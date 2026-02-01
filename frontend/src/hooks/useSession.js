/**
 * useSession.js - CORRECTED VERSION v2
 * 
 * Location: ~/simplify_slovakia/frontend/src/hooks/useSession.js (NEW FILE)
 * 
 * FIX: Reset goes back to INTAKE mode (matches original behavior)
 */

import { useState, useEffect } from 'react'
import {
  loadSession,
  saveSession,
  clearSession as clearStorageSession,
  SESSION_MODES,
  transitionToIntake,
  transitionToSelectingFlow,
  transitionToInFlow
} from '../utils/storage'

export function useSession() {
  // Load session on mount
  const [session, setSession] = useState(() => loadSession())
  
  // Auto-save whenever session changes
  useEffect(() => {
    saveSession(session)
  }, [session])
  
  // Actions
  const actions = {
    // Start intake questionnaire
    startIntake: () => {
      setSession(transitionToIntake())
    },
    
    // Select a flow (from intake or manual selection)
    selectFlow: (flowId) => {
      setSession(transitionToInFlow(flowId, {
        intakeAnswers: session.intakeAnswers
      }))
    },
    
    // Show manual flow selector
    showFlowSelector: () => {
      setSession(transitionToSelectingFlow(session.intakeAnswers))
    },
    
    // Toggle step completion
    toggleStepCompletion: (stepId) => {
      setSession(prev => ({
        ...prev,
        completedSteps: (() => {
          const newSet = new Set(prev.completedSteps)
          if (newSet.has(stepId)) {
            newSet.delete(stepId)
          } else {
            newSet.add(stepId)
          }
          return newSet
        })()
      }))
    },
    
    // Toggle step expansion
    toggleStepExpansion: (stepId) => {
      setSession(prev => ({
        ...prev,
        expandedSteps: (() => {
          const newSet = new Set(prev.expandedSteps)
          if (newSet.has(stepId)) {
            newSet.delete(stepId)
          } else {
            newSet.add(stepId)
          }
          return newSet
        })()
      }))
    },
    
    // Toggle document
    toggleDocument: (docName) => {
      setSession(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [docName]: !prev.documents[docName]
        }
      }))
    },
    
    // Clear progress (but stay in same flow)
    clearProgress: () => {
      setSession(prev => ({
        ...prev,
        completedSteps: new Set(),
        documents: {}
      }))
    },
    
    // Full reset - back to intake (matches original behavior)
    reset: () => {
      clearStorageSession()
      setSession(transitionToIntake())  // ✅ Reset to INTAKE, not SELECTING_FLOW
    },
    
    // Export session
    exportSession: () => {
      return {
        flowId: session.flowId,
        completed: Array.from(session.completedSteps),
        documents: session.documents,
        exportedAt: new Date().toISOString()
      }
    }
  }
  
  return {
    // Session state
    session,
    mode: session.mode,
    
    // Expose SESSION_MODES for components
    SESSION_MODES,
    
    // Actions
    actions,
    
    // Convenience flags
    showIntake: session.mode === SESSION_MODES.INTAKE,
    showFlowSelector: session.mode === SESSION_MODES.SELECTING_FLOW && !session.flowId,
    showFlow: session.mode === SESSION_MODES.IN_FLOW && session.flowId,
    
    // Quick access to data
    selectedFlowId: session.flowId,
    completedSteps: session.completedSteps,
    expandedSteps: session.expandedSteps,
    documents: session.documents,
    intakeAnswers: session.intakeAnswers
  }
}
