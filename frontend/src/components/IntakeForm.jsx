// frontend/src/components/IntakeForm.jsx
// FIXED VERSION - Proper integration with intakeQuestions.js

import { 
  intakeQuestions, 
  getNextQuestion, 
  validateAnswers,
  getTotalQuestions 
} from '../data/intakeQuestions'
import { useState } from 'react'
import { API_URL } from '../config'
import { saveSession } from '../utils/storage'

function IntakeForm({ onFlowSelected, onShowManualSelector }) {
  // Start with the first question
  const [currentQuestion, setCurrentQuestion] = useState(intakeQuestions[0])
  const [answers, setAnswers] = useState({})
  const [recommendation, setRecommendation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleAnswer = (questionId, value) => {
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)

    // Get the next question based on current answers
    const nextQ = getNextQuestion(newAnswers)
    
    if (nextQ) {
      setCurrentQuestion(nextQ)
    } else {
      // No more questions -> Get recommendation
      getRecommendation(newAnswers)
    }
  }

  const getRecommendation = async (finalAnswers) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/recommend-flow-v2`, {
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
      console.error('Recommendation error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptRecommendation = () => {
    if (!recommendation?.flow_id) return

    const intakeData = {
      answers,
      recommendation,
      accepted: true,
      timestamp: new Date().toISOString(),
    }

    localStorage.setItem('simplify_slovakia_intake', JSON.stringify(intakeData))

    saveSession({
      flowId: recommendation.flow_id,
      completedSteps: [],
      expandedSteps: [],
      documents: {},
      intakeAnswers: intakeData,
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

  // FIXED: Pass answers to getTotalQuestions
  const totalQuestions = getTotalQuestions(answers)
  const progress = totalQuestions > 0 
    ? (Object.keys(answers).length / totalQuestions) * 100 
    : 0

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
            onClick={() => setError(null)}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

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
          <div className="max-w-3xl mx-auto px-4 py-6 flex items-center gap-4">
            <img src="/simplify-slovakia.svg" alt="Logo" className="h-10 w-auto" />
            <div>
              <h1 className="text-3xl font-bold text-indigo-600">Simplify Slovakia</h1>
              <p className="text-gray-600">Here's what we recommend</p>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Based on your answers:</h2>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">👤 Your Profile</h3>
              <ul className="space-y-1 text-gray-700 text-sm">
                {Object.entries(answers).map(([key, value]) => (
                  <li key={key}>
                    • <span className="capitalize">{key.replace(/_/g, ' ')}</span>: <span className="font-medium">{value}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-l-4 border-indigo-600 bg-indigo-50 p-4 mb-6">
              <h3 className="font-semibold text-indigo-900 mb-2">✨ We recommend:</h3>
              <p className="text-lg font-bold text-indigo-700">{recommendation.title || 'Immigration Flow'}</p>
              {recommendation.reason && (
                <p className="text-sm text-indigo-600 mt-2">{recommendation.reason}</p>
              )}
              {recommendation.confidence && (
                <p className="text-xs text-indigo-500 mt-2">
                  Confidence: {recommendation.confidence}
                  {recommendation.score && ` (${recommendation.score}% match)`}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <button
                onClick={handleAcceptRecommendation}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-lg transition-all"
              >
                Start This Flow
              </button>
              <button
                onClick={handleShowAllFlows}
                className="w-full bg-white text-indigo-600 py-4 rounded-xl font-semibold border-2 border-indigo-100 hover:border-indigo-600 transition-all"
              >
                View All Other Flows
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  /* ==============================
     QUESTION SCREEN
     ============================== */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img src="/simplify-slovakia.svg" alt="Logo" className="h-16 w-auto mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-indigo-600">Simplify Slovakia</h1>
          <p className="text-gray-600 mt-2">Let's find the right flow for you</p>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Progress Bar */}
          <div className="h-2 bg-gray-100">
            <div 
              className="h-full bg-indigo-600 transition-all duration-500" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="p-8">
            {/* Question */}
            <div className="mb-8">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl">{currentQuestion.icon}</span>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">{currentQuestion.question}</h2>
                  {currentQuestion.description && (
                    <p className="text-sm text-gray-600 mt-2">{currentQuestion.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(currentQuestion.id, option.value)}
                  className="w-full text-left p-4 rounded-xl border-2 border-gray-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 group-hover:text-indigo-700 mb-1">
                        {option.label}
                      </div>
                      {option.description && (
                        <div className="text-sm text-gray-600">
                          {option.description}
                        </div>
                      )}
                      {option.help && (
                        <div className="text-xs text-gray-500 mt-1">
                          {option.help}
                        </div>
                      )}
                    </div>
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300 group-hover:border-indigo-500 transition-colors flex-shrink-0 mt-1"></div>
                  </div>
                </button>
              ))}
            </div>

            {/* Progress Indicator */}
            <div className="mt-6 text-center text-sm text-gray-500">
              Question {Object.keys(answers).length + 1} of {totalQuestions}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IntakeForm
