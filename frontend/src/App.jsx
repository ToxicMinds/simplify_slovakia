import { useState, useEffect } from 'react'
import FlowSelector from './components/FlowSelector'
import IntakeForm from './components/IntakeForm'
import DocumentTracker from './components/DocumentTracker'
import { API_URL } from './config'
import { saveSession, loadSession, clearSession } from './utils/storage'

function App() {
  const [selectedFlowId, setSelectedFlowId] = useState(null)
  const [showIntake, setShowIntake] = useState(true)
  const [flowData, setFlowData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [completedSteps, setCompletedSteps] = useState(new Set())
  const [expandedSteps, setExpandedSteps] = useState(new Set())
  const [documents, setDocuments] = useState({})

  /* ============================
     RESTORE SESSION ON MOUNT
     ============================ */
  useEffect(() => {
    try {
      const savedSession = loadSession?.()
      // Only restore if we actually have a saved flowId
      if (savedSession && savedSession.flowId) {
        console.log('Restoring session:', savedSession.flowId)
        setSelectedFlowId(savedSession.flowId)
        setCompletedSteps(new Set(savedSession.completedSteps ?? []))
        setExpandedSteps(new Set(savedSession.expandedSteps ?? []))
        // Ensure documents is an object to prevent .map or key-access errors
        setDocuments(savedSession.documents && typeof savedSession.documents === 'object' ? savedSession.documents : {})
        setShowIntake(false)
      }
    } catch (e) {
      console.error('Session restore failed, clearing storage', e)
      localStorage.clear()
    }
  }, [])


  /* ============================
     SAVE SESSION ON CHANGE
     ============================ */
  useEffect(() => {
    // Only save if a flow is actively selected
    if (!selectedFlowId) return

    const sessionData = {
      flowId: selectedFlowId,
      completedSteps: Array.from(completedSteps),
      expandedSteps: Array.from(expandedSteps),
      documents,
      showIntake,
    }

    saveSession(sessionData)

    // Backward compatibility sync
    localStorage.setItem(
      `progress_${selectedFlowId}`,
      JSON.stringify({
        completed: Array.from(completedSteps),
        documents,
        lastUpdated: new Date().toISOString(),
      })
    )
  }, [selectedFlowId, completedSteps, expandedSteps, documents, showIntake])

  /* ============================
     FETCH FLOW DATA
     ============================ */
  useEffect(() => {
    if (!selectedFlowId) {
      setFlowData(null)
      return
    }

    const fetchFlow = async () => {
      setLoading(true)
      setError(null) // Clear previous errors
      try {
        const response = await fetch(`${API_URL}/flow/${selectedFlowId}`)
        if (!response.ok) throw new Error(`Server responded with ${response.status}: Failed to fetch flow`)
        const data = await response.json()
        setFlowData(data)
      } catch (err) {
        console.error("Fetch error:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchFlow()
  }, [selectedFlowId])

  /* ============================
     STATE MUTATORS
     ============================ */
  const toggleStepCompletion = (stepId) => {
    setCompletedSteps(prev => {
      const s = new Set(prev)
      s.has(stepId) ? s.delete(stepId) : s.add(stepId)
      return s
    })
  }

  const toggleStepExpansion = (stepId) => {
    setExpandedSteps(prev => {
      const s = new Set(prev)
      s.has(stepId) ? s.delete(stepId) : s.add(stepId)
      return s
    })
  }

  const toggleDocument = (docName) => {
    setDocuments(prev => ({ ...prev, [docName]: !prev[docName] }))
  }

  const getCompletionPercentage = () => {
    if (!flowData?.steps) return 0
    return Math.round((completedSteps.size / flowData.steps.length) * 100)
  }

  /* ============================
     FLOW CONTROL
     ============================ */
  const handleFlowSelected = (flowId) => {
    setSelectedFlowId(flowId)
    setShowIntake(false)
    // Clear old flow progress when a brand new flow is selected via UI
    setCompletedSteps(new Set())
    setDocuments({})
  }

  const handleShowManualSelector = () => {
    setShowIntake(false)
    setSelectedFlowId(null)
  }

  const handleResetFlow = () => {
    if (confirm('Are you sure you want to start over? This will clear all your progress.')) {
      clearSession()
      setSelectedFlowId(null)
      setFlowData(null)
      setCompletedSteps(new Set())
      setDocuments({})
      setExpandedSteps(new Set())
      setShowIntake(true)
      setError(null)
    }
  }

  /* ============================
     RENDER GATES
     ============================ */
  
  // 1. Loading State
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-medium">Loading flow details...</div>
  }

  // 2. Error State
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-xl text-center">
          <p className="text-red-600 mb-4 font-bold">Error: {error}</p>
          <button 
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            onClick={handleResetFlow}
          >
            Return to Start
          </button>
        </div>
      </div>
    )
  }

  if (!flowData) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      Loading flow…
    </div>
  )
}


  // 3. Intake Form
  if (!selectedFlowId && showIntake) {
    return (
      <IntakeForm
        onFlowSelected={handleFlowSelected}
        onShowManualSelector={handleShowManualSelector}
      />
    )
  }

  // 4. Manual Selector
  if (!selectedFlowId && !showIntake) {
    return <FlowSelector onFlowSelected={handleFlowSelected} />
  }

  /* ============================
     MAIN VIEW
     ============================ */
  return (
    
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-indigo-900">{flowData?.title || 'Your Roadmap'}</h1>
          <button onClick={handleResetFlow} className="text-sm text-indigo-600 hover:underline">Reset Progress</button>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-full h-4 mb-8 overflow-hidden shadow-inner">
          <div 
            className="bg-indigo-600 h-full transition-all duration-500" 
            style={{ width: `${getCompletionPercentage()}%` }}
          />
        </div>

        {/* Logic for Checklist and DocumentTracker goes here */}
        {flowData && (
          <DocumentTracker 
            steps={flowData.steps}
            completedSteps={completedSteps}
            toggleStepCompletion={toggleStepCompletion}
            expandedSteps={expandedSteps}
            toggleStepExpansion={toggleStepExpansion}
            documents={documents}
            toggleDocument={toggleDocument}
          />
        )}
      </div>
    </div>
  )
}

export default App
