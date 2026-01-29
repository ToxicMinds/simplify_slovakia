import { useState } from 'react'
import { API_URL } from '../config'

function IntakeForm({ onFlowSelected, onShowManualSelector }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({ nationality: null, entry_context: null, purpose: null, city: null })
  const [recommendation, setRecommendation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const questions = [
    { id: 'nationality', question: "Citizenship?", options: [{ value: 'EU', label: "EU/EEA" }, { value: 'NON_EU', label: "Non-EU" }] },
    { id: 'entry_context', question: "Location?", options: [{ value: 'FIRST_ENTRY', label: "Outside Slovakia" }, { value: 'IN_COUNTRY', label: "Already inside" }] },
    { id: 'purpose', question: "Purpose?", options: [{ value: 'EMPLOYMENT', label: "Work" }, { value: 'BUSINESS', label: "Freelance" }, { value: 'STUDY', label: "Student" }] },
    { id: 'city', question: "City?", options: [{ value: 'BRATISLAVA', label: "Bratislava" }, { value: 'OTHER', label: "Other" }] },
  ]

  const handleAnswer = async (id, val) => {
    const nextAnswers = { ...answers, [id]: val }
    setAnswers(nextAnswers)
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setLoading(true)
      try {
        const res = await fetch(`${API_URL}/recommend-flow`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(nextAnswers)
        })
        const data = await res.json()
        setRecommendation(data)
      } catch (e) { setError("Failed to get recommendation") }
      setLoading(false)
    }
  }

  if (loading) return <div className="h-screen flex items-center justify-center">Analyzing...</div>
  
  if (recommendation) return (
    <div className="h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <h2 className="text-xl font-bold mb-2">We recommend:</h2>
        <div className="bg-indigo-50 p-4 rounded-lg border-l-4 border-indigo-600 mb-6">
          <p className="font-bold text-indigo-900">{recommendation.title}</p>
          <p className="text-sm text-indigo-700 mt-1">{recommendation.reason}</p>
        </div>
        <button 
          onClick={() => onFlowSelected(recommendation.flow_id)}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold mb-3"
        >
          Start Roadmap
        </button>
        <button onClick={onShowManualSelector} className="w-full text-slate-500 text-sm">See all options</button>
      </div>
    </div>
  )

  const q = questions[currentQuestion]
  return (
    <div className="h-screen flex items-center justify-center bg-indigo-600 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full">
        <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Step {currentQuestion + 1}</p>
        <h2 className="text-2xl font-bold text-slate-800 mb-6">{q.question}</h2>
        <div className="grid gap-3">
          {q.options.map(o => (
            <button key={o.value} onClick={() => handleAnswer(q.id, o.value)} className="w-full text-left p-4 rounded-xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 font-semibold transition-all">
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default IntakeForm
