alert("THIS FlowSelector IS LOADED");
import { useState, useEffect } from 'react'

function FlowSelector({ onFlowSelected }) {
  const [flows, setFlows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const API_URL =
      import.meta.env?.VITE_API_URL ??
      'http://localhost:8000'
      
    const fetchFlows = async () => {
      try {
        const response = await fetch(`${API_URL}/flows`)
        if (!response.ok) throw new Error('Failed to fetch flows')
        const data = await response.json()
        setFlows(data.flows)
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
          <h1 className="text-4xl font-bold text-indigo-600">Simplify Slovakia</h1>
          <p className="text-gray-600 mt-2">Select your situation to get started</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          {flows.map((flow) => (
            <button
              key={flow.flow_id}
              onClick={() => onFlowSelected(flow.flow_id)}
              className="bg-white rounded-lg shadow-lg p-8 text-left hover:shadow-xl transition-shadow border-2 border-transparent hover:border-indigo-500"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {flow.title}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {flow.country} • {flow.step_count} steps
                  </p>
                </div>
                <svg className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <p className="text-sm text-gray-500">
                  Version {flow.version}
                </p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Not sure which applies to you?{' '}
            <a href="#" className="text-indigo-600 hover:text-indigo-800 underline">
              Learn more about Slovak immigration
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}

export default FlowSelector
