import { useState, useEffect } from 'react'

function App() {
  const [flowData, setFlowData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [completedSteps, setCompletedSteps] = useState(new Set())
  const [expandedSteps, setExpandedSteps] = useState(new Set())

  // Fetch flow data from backend
  useEffect(() => {
    const fetchFlow = async () => {
      try {
        const response = await fetch('http://localhost:8000/resolve-flow')
        if (!response.ok) throw new Error('Failed to fetch flow data')
        const data = await response.json()
        setFlowData(data)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }
    
    fetchFlow()
  }, [])

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

  const getCompletionPercentage = () => {
    if (!flowData?.steps) return 0
    return Math.round((completedSteps.size / flowData.steps.length) * 100)
  }

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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-700 mb-4">Connection Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-sm text-gray-600">Make sure your backend is running:</p>
          <code className="block bg-gray-100 p-2 rounded mt-2 text-xs">
            cd backend && uvicorn app.main:app --reload --port 8000
          </code>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-indigo-600">Simplify Slovakia</h1>
          <p className="text-gray-600 mt-2">
            {flowData?.flow?.persona_id?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </p>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">Progress</span>
            <span className="text-sm font-semibold text-indigo-600">
              {completedSteps.size} of {flowData?.steps?.length || 0} completed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${getCompletionPercentage()}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">{getCompletionPercentage()}% Complete</p>
        </div>
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
                className={`bg-white rounded-lg shadow-md overflow-hidden transition-all ${
                  isCompleted ? 'opacity-75 border-2 border-green-300' : ''
                }`}
              >
                {/* Step Header */}
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleStepCompletion(step.step_id)}
                      className={`flex-shrink-0 w-6 h-6 rounded border-2 transition-all ${
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

                    {/* Step Content */}
                    <div className="flex-grow">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-indigo-600">
                              Step {step.order}
                            </span>
                            {isCompleted && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                Completed
                              </span>
                            )}
                          </div>
                          <h3 className={`text-xl font-bold ${isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                            {step.title}
                          </h3>
                          <p className="text-gray-600 mt-2">{step.description}</p>
                        </div>
                        
                        {/* Expand Button */}
                        <button
                          onClick={() => toggleStepExpansion(step.step_id)}
                          className="flex-shrink-0 text-indigo-600 hover:text-indigo-800 transition-colors"
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

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                      {/* Why It Matters */}
                      {step.why_it_matters && (
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">Why It Matters</h4>
                          <p className="text-gray-600 text-sm">{step.why_it_matters}</p>
                        </div>
                      )}

                      {/* Preconditions */}
                      {step.preconditions && step.preconditions.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">Prerequisites</h4>
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

                      {/* Outputs */}
                      {step.outputs && step.outputs.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">Produces</h4>
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

                      {/* Official Links */}
                      {step.official_links && step.official_links.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">Official Resources</h4>
                          <ul className="space-y-2">
                            {step.official_links.map((link, idx) => (
                              <li key={idx}>
                                <a 
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-indigo-600 hover:text-indigo-800 underline flex items-center gap-1"
                                >
                                  {link.authority}
                                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Failure Modes */}
                      {step.failure_modes && step.failure_modes.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                          <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Common Pitfalls</h4>
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
      <footer className="bg-white shadow-md mt-12">
        <div className="max-w-5xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>Simplify Slovakia • Deterministic Bureaucracy Navigation</p>
          <p className="mt-1">
            Flow: <span className="font-mono text-xs">{flowData?.flow?.flow_id}</span> • Version {flowData?.flow?.version}
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App