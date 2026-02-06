// frontend/src/hooks/useFlowData.js
// Hook to fetch and manage flow data from backend

import { useState, useEffect } from 'react'
import { getFlow } from '../services/flowService'

/**
 * Hook to load flow data from backend
 * 
 * Usage:
 *   const { flowData, steps, loading, error } = useFlowData(flowId)
 */
export function useFlowData(flowId) {
  const [flowData, setFlowData] = useState(null)
  const [steps, setSteps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    if (!flowId) {
      setFlowData(null)
      setSteps([])
      setLoading(false)
      return
    }
    
    setLoading(true)
    setError(null)
    
    getFlow(flowId)
      .then(data => {
        setFlowData(data)
        setSteps(data.steps || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load flow:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [flowId])
  
  return {
    flowData,      // Full flow data (title, description, etc.)
    steps,         // Array of step objects
    loading,       // Boolean: is loading?
    error          // Error message if failed
  }
}
