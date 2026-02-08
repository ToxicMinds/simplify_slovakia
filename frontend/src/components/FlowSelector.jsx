// frontend/src/components/FlowSelector.jsx
// FIXED VERSION - Added back to intake button

import { useState, useEffect } from 'react'
import { API_URL } from '../config'
import Logo from './Logo'

function FlowSelector({ onFlowSelected, onBackToIntake }) {
  const [flows, setFlows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchFlows = async () => {
      try {
        const response = await fetch(`${API_URL}/flows`)
        if (!response.ok) throw new Error('Failed to fetch flows')
        const data = await response.json()
        
        // Sort flows by priority and category
        const sortedFlows = (data.flows || []).sort((a, b) => {
          // Priority order: CRITICAL > HIGH > MEDIUM > LOW
          const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
          const aPriority = priorityOrder[a.priority] ?? 4
          const bPriority = priorityOrder[b.priority] ?? 4
          
          if (aPriority !== bPriority) return aPriority - bPriority
          
          // Then by step count (fewer steps first for simple flows)
          return (a.step_count || 0) - (b.step_count || 0)
        })
        
        setFlows(sortedFlows)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }
    
    fetchFlows()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading flows...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-700 mb-4">Connection Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Logo />
            {onBackToIntake && (
              <button
                onClick={onBackToIntake}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to questionnaire
              </button>
            )}
          </div>
          <p className="text-gray-600 mt-2">Browse all immigration flows</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* Info banner */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8 rounded-r">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                Select the flow that best matches your situation. Each flow provides a complete step-by-step checklist.
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {flows.map((flow) => {
            // Get priority badge
            const getPriorityBadge = (priority) => {
              switch (priority) {
                case 'CRITICAL':
                  return <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded">URGENT</span>
                case 'HIGH':
                  return <span className="px-2 py-1 text-xs font-semibold bg-orange-100 text-orange-800 rounded">HIGH PRIORITY</span>
                case 'MEDIUM':
                  return <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded">RECOMMENDED</span>
                default:
                  return null
              }
            }

            // Get difficulty badge
            const getDifficultyBadge = (difficulty) => {
              switch (difficulty) {
                case 'VERY_HARD':
                  return <span className="text-xs text-red-600">⚠️ Complex</span>
                case 'HARD':
                  return <span className="text-xs text-orange-600">⚡ Challenging</span>
                case 'MEDIUM':
                  return <span className="text-xs text-blue-600">📋 Moderate</span>
                case 'EASY':
                  return <span className="text-xs text-green-600">✓ Simple</span>
                default:
                  return null
              }
            }

            return (
              <button
                key={flow.flow_id}
                onClick={() => onFlowSelected(flow.flow_id)}
                className="bg-white rounded-lg shadow-lg p-6 text-left hover:shadow-xl transition-all border-2 border-transparent hover:border-indigo-500 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    {flow.priority && getPriorityBadge(flow.priority)}
                  </div>
                  <svg className="w-6 h-6 text-indigo-600 flex-shrink-0 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors">
                  {flow.title || flow.flow_id}
                </h2>

                {flow.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {flow.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 items-center text-sm text-gray-500 mb-3">
                  {flow.difficulty && getDifficultyBadge(flow.difficulty)}
                  <span>•</span>
                  <span>{flow.step_count} steps</span>
                  {flow.estimated_timeline && (
                    <>
                      <span>•</span>
                      <span>⏱️ {flow.estimated_timeline}</span>
                    </>
                  )}
                </div>

                {flow.estimated_cost && (
                  <p className="text-xs text-gray-500">
                    💰 Est. cost: {flow.estimated_cost}
                  </p>
                )}

                {flow.tags && flow.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {flow.tags.slice(0, 3).map((tag) => (
                      <span 
                        key={tag}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {flow.recommended_for && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                      <span className="font-semibold">Best for:</span> {flow.recommended_for}
                    </p>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {flows.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No flows available</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default FlowSelector
