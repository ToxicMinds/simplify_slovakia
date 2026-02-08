// frontend/src/hooks/useSession.js
// FIXED VERSION - Added console logging for debugging

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
  const [session, setSession] = useState(() => {
    const loaded = loadSession()
    // ✅ RESTORED: Console logging for debugging
    console.log('📦 Session loaded:', loaded)
    return loaded
  })
  
  // Auto-save whenever session changes
  useEffect(() => {
    saveSession(session)
    // ✅ RESTORED: Console logging for debugging
    console.log('💾 Session saved:', session)
    
    // Also log raw localStorage for debugging
    const raw = localStorage.getItem('simplify_slovakia_session')
    console.log('🔍 Raw localStorage:', raw)
  }, [session])
  
  // Actions
  const actions = {
    // Start intake questionnaire
    startIntake: () => {
      console.log('🎯 Action: startIntake')
      setSession(transitionToIntake())
    },
    
    // Select a flow (from intake or manual selection)
    selectFlow: (flowId) => {
      console.log('🎯 Action: selectFlow', flowId)
      setSession(transitionToInFlow(flowId, {
        intakeAnswers: session.intakeAnswers
      }))
    },
    
    // Show manual flow selector
    showFlowSelector: () => {
      console.log('🎯 Action: showFlowSelector')
      setSession(transitionToSelectingFlow(session.intakeAnswers))
    },
    
    // Toggle step completion
    toggleStepCompletion: (stepId) => {
      console.log('🎯 Action: toggleStepCompletion', stepId)
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
      console.log('🎯 Action: clearProgress')
      setSession(prev => ({
        ...prev,
        completedSteps: new Set(),
        documents: {}
      }))
    },
    
    // Full reset - back to intake
    reset: () => {
      console.log('🎯 Action: reset - clearing all data and returning to intake')
      clearStorageSession()
      setSession(transitionToIntake())
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
    showFlowSelector: session.mode === SESSION_MODES.SELECTING_FLOW,
    showFlow: session.mode === SESSION_MODES.IN_FLOW && session.flowId,
    
    // Quick access to data
    selectedFlowId: session.flowId,
    completedSteps: session.completedSteps,
    expandedSteps: session.expandedSteps,
    documents: session.documents,
    intakeAnswers: session.intakeAnswers
  }
}
