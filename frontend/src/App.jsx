import Logo from './components/Logo'
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
      const savedSession = loadSession()
      if (savedSession && savedSession.flowId) {
        console.log('Restoring session:', savedSession.flowId)
        setSelectedFlowId(savedSession.flowId)
        setCompletedSteps(savedSession.completedSteps || new Set())
        setExpandedSteps(savedSession.expandedSteps || new Set())
        setDocuments(savedSession.documents || {})
        setShowIntake(false)
      }
    } catch (e) {
      console.error('Session restore failed:', e)
      // Don't clear all storage, just log the error
    }
  }, [])

  /* ============================
     SAVE SESSION ON CHANGE
     ============================ */
  useEffect(() => {
    if (!selectedFlowId) return

    const sessionData = {
      flowId: selectedFlowId,
      completedSteps: Array.from(completedSteps),
      expandedSteps: Array.from(expandedSteps),
      documents,
      showIntake,
    }

    saveSession(sessionData)

    // Backward compatibility
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
      setError(null)
      try {
        const response = await fetch(`${API_URL}/flow/${selectedFlowId}`)
        if (!response.ok) throw new Error('Failed to fetch flow data')
        const data = await response.json()
        setFlowData(data)
      } catch (err) {
        console.error('Fetch error:', err)
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
      const newSet = new Set(prev)
      if (newSet.has(stepId)) {
        newSet.delete(stepId)
      } else {
        newSet.add(stepId)
      }
      return newSet
    })
  }

  const toggleStepExpansion = (stepId) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev)
      if (newSet.has(stepId)) {
        newSet.delete(stepId)
      } else {
        newSet.add(stepId)
      }
      return newSet
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
     ACTIONS
     ============================ */
  const handleFlowSelected = (flowId) => {
    setSelectedFlowId(flowId)
    setShowIntake(false)
  }

  const handleShowManualSelector = () => {
    setShowIntake(false)
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

  const handlePrint = () => {
    window.print()
  }

  const handleClearProgress = () => {
    if (confirm('Clear all progress for this flow? This cannot be undone.')) {
      setCompletedSteps(new Set())
      setDocuments({})
      if (selectedFlowId) {
        localStorage.removeItem(`progress_${selectedFlowId}`)
      }
    }
  }

  const handleExport = () => {
    const data = {
      flowId: selectedFlowId,
      completed: Array.from(completedSteps),
      documents: documents,
      exportedAt: new Date().toISOString(),
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `simplify-slovakia-progress-${Date.now()}.json`
    a.click()
  }

  /* ============================
     RENDER GATES
     ============================ */
  
  // Intake Form
  if (!selectedFlowId && showIntake) {
    return (
      <IntakeForm
        onFlowSelected={handleFlowSelected}
        onShowManualSelector={handleShowManualSelector}
      />
    )
  }

  // Manual Selector
  if (!selectedFlowId && !showIntake) {
    return <FlowSelector onFlowSelected={handleFlowSelected} />
  }

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading your checklist...</p>
        </div>
      </div>
    )
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-700 mb-4">Connection Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleResetFlow}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  /* ============================
     MAIN CHECKLIST VIEW
     ============================ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with actions */}
      <header className="bg-white shadow-md print:shadow-none">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-indigo-600">Simplify Slovakia</h1>
              <p className="text-gray-600 mt-2">
                {flowData?.flow?.persona_id?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </p>
            </div>
            <div className="flex gap-2 print:hidden">
              <button
                onClick={handlePrint}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
              <button
                onClick={handleResetFlow}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
              >
                Change Flow
              </button>
              <button
                onClick={handleClearProgress}
                className="bg-red-50 text-red-700 px-4 py-2 rounded hover:bg-red-100 print:hidden"
              >
                Clear Progress
              </button>
              <button
                onClick={handleExport}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 print:hidden"
              >
                Export Progress
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="max-w-5xl mx-auto px-4 py-6 print:py-2">
        <div className="bg-white rounded-lg shadow-md p-6 print:shadow-none print:border">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">Progress</span>
            <span className="text-sm font-semibold text-indigo-600">
              {completedSteps.size} of {flowData?.steps?.length || 0} completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 print:h-2">
            <div 
              className="bg-indigo-600 h-3 rounded-full transition-all duration-300 print:h-2"
              style={{ width: `${getCompletionPercentage()}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">{getCompletionPercentage()}% Complete</p>
        </div>
      </div>

      {/* Document Tracker */}
      <div className="max-w-5xl mx-auto px-4 pb-6">
        <DocumentTracker 
          documents={documents} 
          onToggle={toggleDocument}
        />
      </div>

      {/* Steps List */}
      <main className="max-w-5xl mx-auto px-4 pb-12">
        <div className="space-y-4">
          {flowData?.steps?.map((step) => {
            const isCompleted = completedSteps.has(step.step_id)
            const isExpanded = expandedSteps.has(step.step_id)
            
            return (
              <div 
                key={step.step_id}
                className={`bg-white rounded-lg shadow-md overflow-hidden transition-all print:break-inside-avoid print:shadow-none print:border ${
                  isCompleted ? 'opacity-75 border-2 border-green-300' : ''
                }`}
              >
                <div className="p-6 print:p-4">
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => toggleStepCompletion(step.step_id)}
                      className={`flex-shrink-0 w-6 h-6 rounded border-2 transition-all print:hidden ${
                        isCompleted 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-gray-300 hover:border-indigo-500'
                      }`}
                    >
                      {isCompleted && (
                        <svg className="w-full h-full text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    {/* Checkbox for print */}
                    <div className="hidden print:block flex-shrink-0 w-4 h-4 border-2 border-gray-400 rounded"></div>

                    <div className="flex-grow">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-indigo-600">
                              Step {step.order}
                            </span>
                            {isCompleted && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full print:hidden">
                                Completed
                              </span>
                            )}
                          </div>
                          <h3 className={`text-xl font-bold ${isCompleted ? 'line-through text-gray-500' : 'text-gray-800'} print:text-lg`}>
                            {step.title}
                          </h3>
                          <p className="text-gray-600 mt-2 text-sm">{step.description}</p>
                        </div>
                        
                        <button
                          onClick={() => toggleStepExpansion(step.step_id)}
                          className="flex-shrink-0 text-indigo-600 hover:text-indigo-800 transition-colors print:hidden"
                        >
                          <svg 
                            className={`w-6 h-6 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Details - always shown in print, expandable on screen */}
                  {(isExpanded || window.matchMedia('print').matches) && (
                    <div className="mt-6 pt-6 border-t border-gray-200 space-y-4 print:mt-4 print:pt-4">
                      {step.why_it_matters && (
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2 text-sm">Why It Matters</h4>
                          <p className="text-gray-600 text-sm">{step.why_it_matters}</p>
                        </div>
                      )}

                      {step.preconditions && step.preconditions.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2 text-sm">Prerequisites</h4>
                          <ul className="space-y-1">
                            {step.preconditions.map((precond, idx) => (
                              <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                <span className="text-indigo-600 mt-1">•</span>
                                <span>{precond.replace(/_/g, ' ')}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {step.outputs && step.outputs.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2 text-sm">Produces</h4>
                          <ul className="space-y-1">
                            {step.outputs.map((output, idx) => (
                              <li key={idx} className="text-sm text-green-700 flex items-start gap-2">
                                <span className="text-green-600 mt-1">✓</span>
                                <span>{output.replace(/_/g, ' ')}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {step.official_links && step.official_links.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2 text-sm">Official Resources</h4>
                          <ul className="space-y-2">
                            {step.official_links.map((link, idx) => (
                              <li key={idx}>
                                <a 
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-indigo-600 hover:text-indigo-800 underline flex items-center gap-1 print:text-black"
                                >
                                  {link.authority}
                                  <svg className="w-3 h-3 print:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                  <span className="hidden print:inline text-xs text-gray-500">({link.url})</span>
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {step.failure_modes && step.failure_modes.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 print:border-yellow-400">
                          <h4 className="font-semibold text-yellow-800 mb-2 text-sm">⚠️ Common Pitfalls</h4>
                          <ul className="space-y-2">
                            {step.failure_modes.map((failure, idx) => (
                              <li key={idx} className="text-sm">
                                <p className="text-yellow-900 font-medium">{failure.what_breaks}</p>
                                <p className="text-yellow-700">{failure.consequence}</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-md mt-12 print:hidden">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>Simplify Slovakia • Deterministic Bureaucracy Navigation</p>
          <p className="mt-1">
            Flow: <span className="font-mono text-xs">{flowData?.flow?.flow_id}</span> • Version {flowData?.flow?.version}
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Progress automatically saved to your browser
          </p>
        </div>
      </footer>

      {/* Print styles */}
      <style>{`
        @media print {
          @page {
            margin: 1cm;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:inline {
            display: inline !important;
          }
        }
      `}</style>
    </div>
  )
}

export default App
