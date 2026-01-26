import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-purple-600 mb-8">
          Simplify Slovakia
        </h1>
        <p className="text-xl text-gray-700 mb-6">
          Navigate Slovak bureaucracy with confidence
        </p>
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
          <button
            onClick={() => setCount((count) => count + 1)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Count is {count}
          </button>
          <p className="mt-4 text-sm text-gray-600">
            Click the button to test React state
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
