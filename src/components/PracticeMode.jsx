import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

function Level1({ verse, onNext }) {
  return (
    <div className="text-center">
      <p className="text-sm text-gray-400 mb-6">Read the verse a few times until it feels familiar</p>
      <div className="bg-blue-50 rounded-xl p-8 mb-8">
        <p className="text-gray-800 text-lg leading-relaxed italic">"{verse.text}"</p>
        <p className="text-blue-600 font-semibold mt-4">{verse.reference}</p>
      </div>
      <button
        onClick={onNext}
        className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        I've read it — Next Level →
      </button>
    </div>
  )
}

function Level2({ verse, onNext }) {
  // Show first letter of each word
  const hinted = verse.text
    .split(' ')
    .map(word => {
      const clean = word.replace(/[^a-zA-Z]/g, '')
      const punct = word.replace(/[a-zA-Z]/g, '')
      return clean ? clean[0] + '_'.repeat(clean.length - 1) + punct : word
    })
    .join(' ')

  return (
    <div className="text-center">
      <p className="text-sm text-gray-400 mb-6">Each word is shown as its first letter — can you fill in the rest?</p>
      <div className="bg-yellow-50 rounded-xl p-8 mb-4">
        <p className="text-gray-700 text-lg leading-relaxed font-mono">{hinted}</p>
        <p className="text-blue-600 font-semibold mt-4">{verse.reference}</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-8">
        <p className="text-xs text-gray-400 mb-2">Full verse for reference:</p>
        <p className="text-gray-600 text-sm italic">"{verse.text}"</p>
      </div>
      <button
        onClick={onNext}
        className="bg-yellow-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-yellow-600 transition-colors"
      >
        Ready to type it — Next Level →
      </button>
    </div>
  )
}

function Level3({ verse, onNext, onRetry }) {
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)

  const checkAnswer = () => {
    const normalize = str => str.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
    const correct = normalize(verse.text)
    const attempt = normalize(input)

    // Calculate similarity percentage
    const correctWords = correct.split(' ')
    const attemptWords = attempt.split(' ')
    const matches = correctWords.filter((word, i) => word === attemptWords[i]).length
    const score = Math.round((matches / correctWords.length) * 100)

    setResult({ score, correct: score >= 80 })
  }

  if (result) {
    return (
      <div className="text-center">
        <div className={`text-6xl mb-4`}>{result.correct ? '🎉' : '😅'}</div>
        <h3 className={`text-2xl font-bold mb-2 ${result.correct ? 'text-green-600' : 'text-orange-500'}`}>
          {result.correct ? 'Great job!' : 'Almost there!'}
        </h3>
        <p className="text-gray-500 mb-6">You got {result.score}% correct</p>

        <div className="bg-blue-50 rounded-xl p-6 mb-8 text-left">
          <p className="text-xs text-gray-400 mb-2">Correct verse:</p>
          <p className="text-gray-800 italic">"{verse.text}"</p>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={onRetry}
            className="border border-gray-300 text-gray-600 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Try again
          </button>
          {result.correct && (
            <button
              onClick={onNext}
              className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
            >
              Next Level →
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm text-gray-400 mb-2 text-center">Type the verse from memory</p>
      <p className="text-blue-600 font-semibold text-center mb-6">{verse.reference}</p>
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Start typing the verse..."
        rows={5}
        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 resize-none"
      />
      <button
        onClick={checkAnswer}
        disabled={input.trim().length < 5}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        Check my answer
      </button>
    </div>
  )
}

function Level4({ verse, onNext, onRetry }) {
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)

  const checkAnswer = () => {
    const normalize = str => str.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
    const correct = normalize(verse.text)
    const attempt = normalize(input)
    const correctWords = correct.split(' ')
    const attemptWords = attempt.split(' ')
    const matches = correctWords.filter((word, i) => word === attemptWords[i]).length
    const score = Math.round((matches / correctWords.length) * 100)
    setResult({ score, correct: score >= 90 })
  }

  if (result) {
    return (
      <div className="text-center">
        <div className="text-6xl mb-4">{result.correct ? '🏆' : '😅'}</div>
        <h3 className={`text-2xl font-bold mb-2 ${result.correct ? 'text-green-600' : 'text-orange-500'}`}>
          {result.correct ? 'Mastered!' : 'Not quite!'}
        </h3>
        <p className="text-gray-500 mb-6">You got {result.score}% correct</p>
        <div className="bg-blue-50 rounded-xl p-6 mb-8 text-left">
          <p className="text-xs text-gray-400 mb-2">Correct verse:</p>
          <p className="text-gray-800 italic">"{verse.text}"</p>
        </div>
        <div className="flex gap-3 justify-center">
          <button onClick={onRetry} className="border border-gray-300 text-gray-600 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
            Try again
          </button>
          {result.correct && (
            <button onClick={onNext} className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
              ✓ Mark as Mastered
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm text-gray-400 mb-2 text-center">Type the entire verse — reference only, no hints!</p>
      <div className="bg-gray-100 rounded-xl p-6 text-center mb-6">
        <p className="text-blue-600 font-bold text-xl">{verse.reference}</p>
        <p className="text-gray-400 text-sm mt-1">{verse.translation}</p>
      </div>
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Type the full verse from memory..."
        rows={5}
        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 resize-none"
      />
      <button
        onClick={checkAnswer}
        disabled={input.trim().length < 5}
        className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
      >
        Check my answer
      </button>
    </div>
  )
}

export default function PracticeMode({ verse, onBack }) {
  const [currentLevel, setCurrentLevel] = useState(verse.level || 1)
  const [completed, setCompleted] = useState(false)

  const levelLabels = {
    1: { label: 'Level 1 — Read', color: 'bg-gray-200 text-gray-700' },
    2: { label: 'Level 2 — Hints', color: 'bg-yellow-200 text-yellow-800' },
    3: { label: 'Level 3 — Type', color: 'bg-blue-200 text-blue-800' },
    4: { label: 'Level 4 — Master', color: 'bg-purple-200 text-purple-800' },
  }

  const advanceLevel = async () => {
    const nextLevel = Math.min(currentLevel + 1, 4)
    setCurrentLevel(nextLevel)

    // Update level and streak in Supabase
    const today = new Date().toISOString().split('T')[0]
    const newStreak = (verse.streak || 0) + 1

    await supabase
      .from('memory_verses')
      .update({
        level: nextLevel,
        streak: newStreak,
        last_practiced: today
      })
      .eq('id', verse.id)

    if (nextLevel === 4 && currentLevel === 4) {
      setCompleted(true)
    }
  }

  const retry = () => {
    setCurrentLevel(currentLevel)
  }

  if (completed) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="text-6xl mb-4">🎊</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verse Mastered!</h2>
        <p className="text-gray-500 mb-2">{verse.reference}</p>
        <p className="text-gray-400 text-sm mb-8">This verse is now in your long-term memory</p>
        <button
          onClick={onBack}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700"
        >
          Back to Vault
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to Vault
        </button>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map(l => (
            <div
              key={l}
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                l === currentLevel
                  ? levelLabels[l].color
                  : l < currentLevel
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {l < currentLevel ? '✓' : `L${l}`}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-xl mx-auto">
        {currentLevel === 1 && (
          <Level1 verse={verse} onNext={advanceLevel} />
        )}
        {currentLevel === 2 && (
          <Level2 verse={verse} onNext={advanceLevel} />
        )}
        {currentLevel === 3 && (
          <Level3 verse={verse} onNext={advanceLevel} onRetry={retry} />
        )}
        {currentLevel === 4 && (
          <Level4 verse={verse} onNext={advanceLevel} onRetry={retry} />
        )}
      </div>
    </div>
  )
}