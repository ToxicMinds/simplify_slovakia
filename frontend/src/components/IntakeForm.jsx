import Logo from './components/Logo'
import { useState } from 'react'
import { API_URL } from '../config'
import { saveSession } from '../utils/storage'

/**
 * IntakeForm.jsx
 *
 * PURPOSE: Ask users questions to recommend the right flow
 * LOCATION: frontend/src/components/IntakeForm.jsx
 *
 * ARCHITECTURE:
 * - Uses eligibility dimensions from rules/immigration/eligibility.yaml
 * - Calls /recommend-flow endpoint
 * - Shows recommendation + allows override
 * - Passes selected flow_id to parent (App.jsx)
 */

function IntakeForm({ onFlowSelected, onShowManualSelector }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({
    nationality: null,
    entry_context: null,
    purpose: null,
    city: null,
  })
  const [recommendation, setRecommendation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const questions = [
    {
      id: 'nationality',
      question: "What's your citizenship status?",
      options: [
        { value: 'EU', label: "I'm an EU/EEA/Swiss citizen" },
        { value: 'NON_EU', label: "I'm from outside the EU/EEA/Switzerland" },
      ],
    },
    {
      id: 'entry_context',
      question: "Where are you right now?",
      options: [
        { value: 'FIRST_ENTRY', label: "I haven't arrived in Slovakia yet" },
        { value: 'IN_COUNTRY', label: "I'm already in Slovakia" },
      ],
    },
    {
      id: 'purpose',
      question: "What brings you to Slovakia?",
      options: [
        { value: 'EMPLOYMENT', label: "Employment (I have a job offer)" },
        { value: 'BUSINESS', label: "Starting a business / Freelancing" },
        { value: 'FAMILY', label: "Joining family who lives here" },
        { value: 'STUDY', label: "University or studies" },
      ],
    },
    {
      id: 'city',
      question: "Which city will you live in?",
      options: [
        { value: 'BRATISLAVA', label: "Bratislava" },
        { value: 'OTHER', label: "Other city" },
      ],
    },
  ]

  const handleAnswer = (questionId, value) => {
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      getRecommendation(newAnswers)
    }
  }

  const getRecommendation = async (finalAnswers) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/recommend-flow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalAnswers),
      })

      if (!response.ok) {
        throw new Error('Failed to get recommendation')
      }

      const data = await response.json()
      setRecommendation(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  /* ==============================
     UPDATED: ACCEPT RECOMMENDATION
     ============================== */
  const handleAcceptRecommendation = () => {
    if (!recommendation?.flow_id) return

    const intakeData = {
      answers,
      recommendation,
      accepted: true,
      timestamp: new Date().toISOString(),
    }

    // Legacy storage (keep for now)
    localStorage.setItem(
      'simplify_slovakia_intake',
      JSON.stringify(intakeData)
    )

    // Unified session storage
    saveSession({
      flowId: recommendation.flow_id,
      completedSteps: [],
      expandedSteps: [],
      documents: {},
      intakeAnswers: intakeData,
      showIntake: false,
    })

    onFlowSelected(recommendation.flow_id)
  }

  const handleShowAllFlows = () => {
    localStorage.setItem(
      'simplify_slovakia_intake',
      JSON.stringify({
        answers,
        recommendation,
        accepted: false,
        timestamp: new Date().toISOString(),
      })
    )

    onShowManualSelector()
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100
  const currentQuestionData = questions[currentQuestion]

  /* ==============================
     LOADING STATE
     ============================== */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Finding the best flow for you...</p>
        </div>
      </div>
    )
  }

  /* ==============================
     RECOMMENDATION SCREEN
     ============================== */
  if (recommendation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <header className="bg-white shadow-md">
          <div className="max-w-3xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-indigo-600">Simplify Slovakia</h1>
            <p className="text-gray-600 mt-2">Here's what we recommend</p>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Based on your answers:</h2>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">👤 Your Profile</h3>
              <ul className="space-y-1 text-gray-700 text-sm">
                <li>• Citizenship: {answers.nationality === 'EU' ? 'EU/EEA/Swiss' : 'Non-EU'}</li>
                <li>• Status: {answers.entry_context === 'FIRST_ENTRY' ? "Haven't arrived yet" : 'Already in Slovakia'}</li>
                <li>• Purpose: {answers.purpose}</li>
                <li>• City: {answers.city}</li>
              </ul>
            </div>

            <div className="border-l-4 border-indigo-600 bg-indigo-50 p-4 mb-6">
              <h3 className="font-semibold text-indigo-900 mb-2">✨ We recommend:</h3>
              <p className="text-lg font-bold text-indigo-700">{recommendation.title}</p>
              {recommendation.reason && (
                <p className="text-sm text-indigo-600 mt-2">{recommendation.reason}</p>
              )}
              <div className="text-sm text-indigo-600 mt-2">
                <span className="font-medium">{recommendation.step_count} steps</span>
                {' • '}
                <span>Flow ID: {recommendation.flow_id}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleAcceptRecommendation}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700"
              >
                Start This Flow →
              </button>

              <button
                onClick={handleShowAllFlows}
                className="w-full bg-white text-gray-700 py-3 px-6 rounded-lg font-semibold border-2 border-gray-300 hover:border-gray-400"
              >
                No, show me all options
              </button>
            </div>

            {recommendation.confidence === 'low' && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  ⚠️ We couldn't find an exact match for your situation.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    )
  }

  /* ==============================
     ERROR STATE
     ============================== */
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-700 mb-4">Error</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleShowAllFlows}
            className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700"
          >
            See All Flows Instead
          </button>
        </div>
      </div>
    )
  }

  /* ==============================
     QUESTION FLOW
     ============================== */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-indigo-600">Simplify Slovakia</h1>
          <p className="text-gray-600 mt-2">Let's find the right path for you</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {currentQuestionData.question}
          </h2>

          <div className="space-y-3">
            {currentQuestionData.options.map(option => (
              <button
                key={option.value}
                onClick={() => handleAnswer(currentQuestionData.id, option.value)}
                className="w-full text-left p-4 rounded-lg border-2 border-gray-300 hover:border-indigo-600 hover:bg-indigo-50"
              >
                <span className="text-lg">{option.label}</span>
              </button>
            ))}
          </div>

          {currentQuestion > 0 && (
            <button
              onClick={() => setCurrentQuestion(currentQuestion - 1)}
              className="mt-6 text-gray-600 hover:text-gray-900 font-medium"
            >
              ← Back
            </button>
          )}

          <div className="mt-8 text-center">
            <button
              onClick={handleShowAllFlows}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Skip this and show me all flows
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default IntakeForm