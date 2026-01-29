import { useState, useEffect, useRef } from 'react'
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
  
  // Track if we have finished the initial load from storage
  const isRestored = useRef(false)

  /* ============================
     RESTORE SESSION ON MOUNT
     ============================ */
  useEffect(() => {
    try {
      const saved = loadSession()
      if (saved && saved.flowId) {
        setSelectedFlowId(saved.flowId)
        // Ensure we handle Sets correctly from storage.js
        setCompletedSteps(saved.completedSteps instanceof Set ? saved.completedSteps : new Set(saved.completedSteps))
        setExpandedSteps(saved.expandedSteps instanceof Set ? saved.expandedSteps : new Set(saved.expandedSteps))
        setDocuments(saved.documents || {})
        setShowIntake(saved.showIntake ?? false)
      }
    } catch (e) {
      console.error('Session restore failed', e)
    } finally {
      isRestored.current = true
    }
  }, [])

  /* ============================
     SAVE SESSION ON CHANGE
     ============================ */
  useEffect(() => {
    // Don't save until we've attempted to restore the initial state
    // and don't save if there's no flow selected
    if (!isRestored.current || !selectedFlowId) return

    saveSession({
      flowId: selectedFlowId,
      completedSteps, // storage.js handles the Array.from conversion
      expandedSteps,
      documents,
      showIntake,
    })
  }, [selectedFlowId, completedSteps, expandedSteps, documents, showIntake])

  /* ============================
     FETCH FLOW DATA
     ============================ */
  useEffect(() => {
    if (!selectedFlowId) return

    const fetchFlow = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`${API_URL}/flow/${selectedFlowId}`)
        if (!response.ok) throw new Error('Failed to fetch flow data')
        const data = await response.json()
        setFlowData(data)
      } catch (err) {
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

  const handleFlowSelected = (flowId) => {
    setCompletedSteps(new Set())
    setDocuments({})
    setSelectedFlowId(flowId)
    setShowIntake(false)
  }

  const handleResetFlow = () => {
    if (window.confirm('Clear all progress?')) {
      clearSession()
      setSelectedFlowId(null)
      setFlowData(null)
      setCompletedSteps(new Set())
      setDocuments({})
      setShowIntake(true)
    }
  }

  if (loading) return <div className="flex h-screen items-center justify-center font-bold">Loading Roadmap...</div>
  
  if (error) return (
    <div className="flex h-screen items-center justify-center flex-col">
      <p className="text-red-500 mb-4">{error}</p>
      <button onClick={handleResetFlow} className="bg-indigo-600 text-white px-4 py-2 rounded">Restart</button>
    </div>
  )

  if (!selectedFlowId) {
    return showIntake 
      ? <IntakeForm onFlowSelected={handleFlowSelected} onShowManualSelector={() => setShowIntake(false)} />
      : <FlowSelector onFlowSelected={handleFlowSelected} />
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800">{flowData?.title}</h1>
          <button onClick={handleResetFlow} className="text-sm text-slate-500 hover:text-red-600">Reset</button>
        </header>
        <div className="w-full bg-white h-3 rounded-full mb-8 overflow-hidden border">
          <div className="bg-indigo-600 h-full transition-all" style={{ width: `${getCompletionPercentage()}%` }} />
        </div>
        <DocumentTracker 
          steps={flowData?.steps || []}
          completedSteps={completedSteps}
          toggleStepCompletion={toggleStepCompletion}
          expandedSteps={expandedSteps}
          toggleStepExpansion={toggleStepExpansion}
          documents={documents}
          toggleDocument={toggleDocument}
        />
      </div>
    </div>
  )
}

export default App
