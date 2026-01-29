import { useEffect, useState } from 'react'
import FlowSelector from './components/FlowSelector'
import FlowViewer from './components/FlowViewer'
import IntakeForm from './components/IntakeForm'
import { loadSession, saveSession } from './utils/session'

function App() {
  const [selectedFlowId, setSelectedFlowId] = useState(null)
  const [completedSteps, setCompletedSteps] = useState(new Set())
  const [expandedSteps, setExpandedSteps] = useState(new Set())
  const [documents, setDocuments] = useState([])
  const [showIntake, setShowIntake] = useState(true)

  // -------------------------------
  // RESTORE SESSION (ONCE)
  // -------------------------------
  useEffect(() => {
    try {
      const savedSession = loadSession?.()

      if (!savedSession || !savedSession.flowId) return

      console.log('Restoring session:', savedSession.flowId)

      setSelectedFlowId(savedSession.flowId)
      setCompletedSteps(new Set(savedSession.completedSteps ?? []))
      setExpandedSteps(new Set(savedSession.expandedSteps ?? []))
      setDocuments(savedSession.documents ?? [])
      setShowIntake(false)
    } catch (e) {
      console.error('Session restore failed, clearing storage', e)
      localStorage.clear()
    }
  }, [])

  // -------------------------------
  // SAVE SESSION (ON CHANGE)
  // -------------------------------
  useEffect(() => {
    if (!selectedFlowId) return

    saveSession({
      flowId: selectedFlowId,
      completedSteps: Array.from(completedSteps),
      expandedSteps: Array.from(expandedSteps),
      documents,
      showIntake,
      intakeAnswers: null,
    })

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

  // -------------------------------
  // HANDLERS
  // -------------------------------
  const handleFlowSelect = (flowId) => {
    setSelectedFlowId(flowId)
    setCompletedSteps(new Set())
    setExpandedSteps(new Set())
    setDocuments([])
    setShowIntake(true)
  }

  const handleIntakeSubmit = (answers) => {
    console.log('Intake submitted:', answers)
    setShowIntake(false)
  }

  // -------------------------------
  // RENDER
  // -------------------------------
  return (
    <div style={{ padding: '1.5rem', maxWidth: '960px', margin: '0 auto' }}>
      <h1>Simplify Slovakia</h1>

      {!selectedFlowId && (
        <FlowSelector onSelect={handleFlowSelect} />
      )}

      {selectedFlowId && showIntake && (
        <IntakeForm onSubmit={handleIntakeSubmit} />
      )}

      {selectedFlowId && !showIntake && (
        <FlowViewer
          flowId={selectedFlowId}
          completedSteps={completedSteps}
          setCompletedSteps={setCompletedSteps}
          expandedSteps={expandedSteps}
          setExpandedSteps={setExpandedSteps}
          documents={documents}
          setDocuments={setDocuments}
        />
      )}
    </div>
  )
}

export default App
