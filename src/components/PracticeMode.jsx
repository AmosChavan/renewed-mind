import { useState } from 'react'
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
  const words = verse.text.split(' ')
  const [inputs, setInputs] = useState({})
  const [checked, setChecked] = useState(false)
  const [score, setScore] = useState(null)

  const normalize = str => str.toLowerCase().replace(/[^a-z]/g, '')

  const handleInput = (i, value) => {
    setInputs(prev => ({ ...prev, [i]: value }))
    setChecked(false)
  }

  const checkAnswers = () => {
    let correct = 0
    words.forEach((word, i) => {
      const cleanWord = normalize(word)
      if (!cleanWord) { correct++; return }
      const restOfWord = cleanWord.slice(1)
      const userInput = normalize(inputs[i] || '')
      if (userInput === restOfWord) correct++
    })
    const pct = Math.round((correct / words.length) * 100)
    setScore(pct)
    setChecked(true)
  }

  return (
    <div>
      <p className="text-sm text-gray-400 mb-6 text-center">
        The first letter of each word is shown — type the rest
      </p>
      <div className="bg-yellow-50 rounded-xl p-6 mb-4">
        <div className="flex flex-wrap gap-2 justify-center">
          {words.map((word, i) => {
            const clean = word.replace(/[^a-zA-Z]/g, '')
            const punct = word.replace(/[a-zA-Z]/g, '')
            const firstLetter = clean[0] || ''
            const restLength = Math.max(clean.length - 1, 1)
            const userVal = inputs[i] || ''
            const restOfWord = normalize(clean).slice(1)
            const isCorrect = checked && normalize(userVal) === restOfWord
            const isWrong = checked && userVal && normalize(userVal) !== restOfWord

            if (!clean) return <span key={i} className="text-gray-600">{word}</span>

            return (
              <div key={i} className="flex items-baseline gap-0.5">
                <span className="font-bold text-gray-700 text-sm">{firstLetter}</span>
                <input
                  type="text"
                  value={userVal}
                  onChange={e => handleInput(i, e.target.value)}
                  className={`py-0.5 text-sm border-b-2 bg-transparent outline-none transition-colors ${
                    isCorrect
                      ? 'border-green-500 text-green-700'
                      : isWrong
                      ? 'border-red-400 text-red-600'
                      : 'border-gray-400 text-gray-800'
                  }`}
                  style={{ width: `${restLength * 10}px` }}
                  placeholder={'_'.repeat(restLength)}
                />
                {punct && <span className="text-gray-600 text-sm">{punct}</span>}
              </div>
            )
          })}
        </div>
        <p className="text-blue-600 font-semibold mt-4 text-center">{verse.reference}</p>
      </div>

      {checked && (
        <div className={`text-center py-2 mb-4 rounded-lg text-sm font-medium ${
          score >= 80 ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-600'
        }`}>
          {score >= 80
            ? `Great! ${score}% correct — you can move on or keep practicing`
            : `${score}% correct — keep trying!`}
        </div>
      )}

      {checked && (
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <p className="text-xs text-gray-400 mb-1">Full verse:</p>
          <p className="text-gray-700 text-sm italic">"{verse.text}"</p>
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => {
            setInputs({})
            setChecked(false)
            setScore(null)
          }}
          className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Clear & retry
        </button>
        <button
          onClick={() => {
            setChecked(false)
            setScore(null)
            setTimeout(checkAnswers, 0)
          }}
          className="flex-1 bg-yellow-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors"
        >
          Check answers
        </button>
        {checked && score >= 80 && (
          <button
            onClick={onNext}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Next Level →
          </button>
        )}
      </div>
    </div>
  )
}

function Level3({ verse, onNext }) {
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
    setResult({ score, correct: score >= 80 })
  }

  const handleRetry = () => {
    setInput('')
    setResult(null)
  }

  if (result) {
    return (
      <div className="text-center">
        <div className="text-6xl mb-4">{result.correct ? '🎉' : '😅'}</div>
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
            onClick={handleRetry}
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

function Level4({ verse, onNext }) {
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

  const handleRetry = () => {
    setInput('')
    setResult(null)
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
          <button
            onClick={handleRetry}
            className="border border-gray-300 text-gray-600 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Try again
          </button>
          {result.correct && (
            <button
              onClick={onNext}
              className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
            >
              ✓ Mark as Mastered
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 text-center mb-6">
        <p className="text-xs text-purple-400 uppercase tracking-widest mb-2 font-semibold">Final Level — No Hints</p>
        <p className="text-purple-700 font-bold text-2xl">{verse.reference}</p>
        <p className="text-purple-400 text-sm mt-1">{verse.translation}</p>
      </div>
      <p className="text-sm text-gray-400 mb-3 text-center">Type the complete verse from memory — no hints!</p>
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Type the full verse from memory..."
        rows={5}
        className="w-full border-2 border-purple-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4 resize-none"
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

    if (currentLevel === 4) {
      setCompleted(true)
    } else {
      setCurrentLevel(nextLevel)
    }
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
        {currentLevel === 1 && <Level1 verse={verse} onNext={advanceLevel} />}
        {currentLevel === 2 && <Level2 verse={verse} onNext={advanceLevel} />}
        {currentLevel === 3 && <Level3 verse={verse} onNext={advanceLevel} />}
        {currentLevel === 4 && <Level4 verse={verse} onNext={advanceLevel} />}
      </div>
    </div>
  )
}