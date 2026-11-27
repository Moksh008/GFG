import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700 text-center">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 mb-4">
          React + Tailwind CSS
        </h1>
        <p className="text-slate-400 mb-6 text-sm">
          Vite + React configured with Tailwind CSS
        </p>

        <button
          onClick={() => setCount((c) => c + 1)}
          className="px-6 py-2.5 rounded-lg font-semibold bg-teal-500 hover:bg-teal-400 active:scale-95 transition duration-150 text-slate-900 shadow-md"
        >
          Count is {count}
        </button>

        <div className="mt-6 pt-6 border-t border-slate-700/60 text-xs text-slate-500">
          Edit <code className="text-teal-400 bg-slate-900/60 px-1.5 py-0.5 rounded">src/App.jsx</code> to get started
        </div>
      </div>
    </div>
  )
}

export default App
