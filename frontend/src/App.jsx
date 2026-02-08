// frontend/src/App.jsx
// UPDATED VERSION - Fetches flow data from backend

import React from 'react'
import { useSession } from './hooks/useSession'
import { useFlowData } from './hooks/useFlowData'
import intakeQuestions from './components/IntakeQuestions'
import FlowSelector from './components/FlowSelector'
import Logo from './components/Logo'
import './App.css'

function App() {
  const { 
    session, 
    actions, 
    showIntake, 
    showFlowSelector, 
    showFlow,
    selectedFlowId,
    completedSteps,
    expandedSteps,
    syncing  // If you have database sync
  } = useSession()
  
  // ✅ NEW: Fetch flow data from backend
  const { flowData, steps, loading, error } = useFlowData(selectedFlowId)
  
  // Handle intake completion
  const handleIntakeComplete = (answers) => {
    // Store answers and show flow selector
    actions.showFlowSelector()
  }
  
  // Handle manual flow selection
  const handleFlowSelect = (flowId) => {
    actions.selectFlow(flowId)
  }
  
  // Handle reset
  const handleReset = () => {
    if (window.confirm('Are you sure you want to start over? This will clear all progress.')) {
      actions.reset()
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Logo />
            
            <div className="flex items-center gap-4">
              {syncing && (
                <span className="text-sm text-gray-500">
                  ☁️ Syncing...
                </span>
              )}
              
              {showFlow && (
                <button
                  onClick={handleReset}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Change Flow
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Show intake form */}
        {showIntake && (
          <IntakeFlow onComplete={handleIntakeComplete} />
        )}
        
        {/* Show flow selector */}
        {showFlowSelector && (
          <FlowSelector onSelectFlow={handleFlowSelect} />
        )}
        
        {/* Show selected flow */}
        {showFlow && (
          <div>
            {/* Loading state */}
            {loading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading flow data...</p>
              </div>
            )}
            
            {/* Error state */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-red-800 font-semibold">Error Loading Flow</h3>
                <p className="text-red-600 mt-2">{error}</p>
                <button
                  onClick={handleReset}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Go Back
                </button>
              </div>
            )}
            
            {/* Flow content */}
            {!loading && !error && flowData && (
              <div>
                {/* Flow header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {flowData.title || 'Immigration Flow'}
                  </h1>
                  {flowData.description && (
                    <p className="mt-2 text-gray-600 whitespace-pre-line">
                      {flowData.description}
                    </p>
                  )}
                  {flowData.estimated_timeline && (
                    <p className="mt-4 text-sm text-gray-500">
                      ⏱️ Timeline: {flowData.estimated_timeline}
                    </p>
                  )}
                  {flowData.estimated_cost && (
                    <p className="mt-1 text-sm text-gray-500">
                      💰 Estimated Cost: {flowData.estimated_cost}
                    </p>
                  )}
                </div>
                
                {/* Steps list */}
                <div className="space-y-4">
                  {steps.map((step) => (
                    <div
                      key={step.step_id}
                      className="bg-white rounded-lg shadow-sm overflow-hidden"
                    >
                      {/* Step header */}
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            {/* Checkbox */}
                            <input
                              type="checkbox"
                              checked={completedSteps.has(step.step_id)}
                              onChange={() => actions.toggleStepCompletion(step.step_id)}
                              className="mt-1 h-5 w-5 text-blue-600 rounded"
                            />
                            
                            {/* Step info */}
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {step.order}. {step.title}
                              </h3>
                              
                              {/* Collapsed description preview */}
                              {!expandedSteps.has(step.step_id) && step.description && (
                                <p className="mt-2 text-gray-600 line-clamp-2">
                                  {step.description.split('\n')[0]}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {/* Expand button */}
                          <button
                            onClick={() => actions.toggleStepExpansion(step.step_id)}
                            className="ml-4 text-blue-600 hover:text-blue-700 font-medium"
                          >
                            {expandedSteps.has(step.step_id) ? 'Collapse' : 'Expand'}
                          </button>
                        </div>
                        
                        {/* Expanded content */}
                        {expandedSteps.has(step.step_id) && (
                          <div className="mt-6 pl-9 space-y-4">
                            {/* Description */}
                            {step.description && (
                              <div className="prose max-w-none">
                                <div className="text-gray-700 whitespace-pre-line">
                                  {step.description}
                                </div>
                              </div>
                            )}
                            
                            {/* Why it matters */}
                            {step.why_it_matters && (
                              <div className="bg-blue-50 rounded-lg p-4">
                                <h4 className="font-semibold text-blue-900">
                                  Why This Matters
                                </h4>
                                <p className="mt-2 text-blue-800 whitespace-pre-line">
                                  {step.why_it_matters}
                                </p>
                              </div>
                            )}
                            
                            {/* Official links */}
                            {step.official_links && step.official_links.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  Official Resources
                                </h4>
                                <ul className="mt-2 space-y-2">
                                  {step.official_links.map((link, idx) => (
                                    <li key={idx}>
                                      <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                      >
                                        {link.authority} →
                                      </a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {/* Failure modes */}
                            {step.failure_modes && step.failure_modes.length > 0 && (
                              <div className="bg-red-50 rounded-lg p-4">
                                <h4 className="font-semibold text-red-900">
                                  Common Mistakes
                                </h4>
                                <ul className="mt-2 space-y-2">
                                  {step.failure_modes.map((failure, idx) => (
                                    <li key={idx} className="text-red-800">
                                      <strong>{failure.what_breaks}:</strong>{' '}
                                      {failure.consequence}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
