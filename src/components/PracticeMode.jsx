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
  const [showVerse, setShowVerse] = useState(false)

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
        <div className="mb-4">
          {showVerse ? (
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-xs text-gray-400 mb-1">Full verse:</p>
              <p className="text-gray-700 text-sm italic">"{verse.text}"</p>
            </div>
          ) : (
            <button
              onClick={() => setShowVerse(true)}
              className="w-full border border-blue-200 text-blue-600 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              Show verse
            </button>
          )}
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => {
            setInputs({})
            setChecked(false)
            setScore(null)
            setShowVerse(false)
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
  const [refInput, setRefInput] = useState('')
  const [result, setResult] = useState(null)
  const [showVerse, setShowVerse] = useState(false)

  const checkAnswer = () => {
    const normalize = str => str.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
    
    // Check verse text
    const correct = normalize(verse.text)
    const attempt = normalize(input)
    const correctWords = correct.split(' ')
    const attemptWords = attempt.split(' ')
    const wordMatches = correctWords.filter((word, i) => word === attemptWords[i]).length
    const verseScore = Math.round((wordMatches / correctWords.length) * 100)

    // Check reference
    const correctRef = normalize(verse.reference)
    const attemptRef = normalize(refInput)
    const refCorrect = correctRef === attemptRef

    const overallScore = refCorrect
      ? verseScore
      : Math.round(verseScore * 0.8) // penalize if reference is wrong

    setResult({
      verseScore,
      refCorrect,
      overallScore,
      correct: overallScore >= 80 && refCorrect
    })
  }

  const handleRetry = () => {
    setInput('')
    setRefInput('')
    setResult(null)
    setShowVerse(false)
  }

  if (result) {
    return (
      <div className="text-center">
        <div className="text-6xl mb-4">{result.correct ? '🎉' : '😅'}</div>
        <h3 className={`text-2xl font-bold mb-2 ${result.correct ? 'text-green-600' : 'text-orange-500'}`}>
          {result.correct ? 'Great job!' : 'Almost there!'}
        </h3>

        <div className="flex gap-4 justify-center mb-6">
          <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
            result.verseScore >= 80 ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-600'
          }`}>
            Verse: {result.verseScore}%
          </div>
          <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
            result.refCorrect ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-600'
          }`}>
            Reference: {result.refCorrect ? '✓ Correct' : `✗ It's ${verse.reference}`}
          </div>
        </div>

        <div className="mb-6">
          {showVerse ? (
            <div className="bg-blue-50 rounded-xl p-6 text-left">
              <p className="text-xs text-gray-400 mb-2">Correct verse:</p>
              <p className="text-gray-800 italic">"{verse.text}"</p>
              <p className="text-blue-600 font-semibold mt-2">{verse.reference}</p>
            </div>
          ) : (
            <button
              onClick={() => setShowVerse(true)}
              className="w-full border border-blue-200 text-blue-600 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              Show verse
            </button>
          )}
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
      <div className="bg-gray-100 rounded-lg p-4 text-center mb-6">
        <p className="text-gray-500 text-sm font-medium">No hints — type the verse AND reference from memory</p>
      </div>

      <div className="mb-4">
        <label className="text-xs text-gray-500 mb-1 block">Verse text</label>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type the full verse from memory..."
          rows={5}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div className="mb-6">
        <label className="text-xs text-gray-500 mb-1 block">Reference</label>
        <input
          type="text"
          value={refInput}
          onChange={e => setRefInput(e.target.value)}
          placeholder="e.g. John 3:16"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        onClick={checkAnswer}
        disabled={input.trim().length < 3 || refInput.trim().length < 3}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        Check my answer
      </button>
    </div>
  )
}

function Level4({ verse, onNext }) {
  const words = verse.text.split(' ')
  const [scrambled] = useState(() => [...words].sort(() => Math.random() - 0.5))
  const [selected, setSelected] = useState([])
  const [used, setUsed] = useState([])
  const [result, setResult] = useState(null)
  const [showVerse, setShowVerse] = useState(false)

  const handleWordClick = (word, index) => {
    if (used.includes(index)) return
    setSelected(prev => [...prev, { word, index }])
    setUsed(prev => [...prev, index])
  }

  const handleRemove = (index) => {
    const item = selected[index]
    setUsed(prev => prev.filter(i => i !== item.index))
    setSelected(prev => prev.filter((_, i) => i !== index))
  }

  const checkAnswer = () => {
    const attempt = selected.map(s => s.word).join(' ')
    const normalize = str => str.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim()
    const correctWords = normalize(verse.text).split(' ')
    const attemptWords = normalize(attempt).split(' ')
    const matches = correctWords.filter((word, i) => word === attemptWords[i]).length
    const score = Math.round((matches / correctWords.length) * 100)
    setResult({ score, correct: score >= 90 })
  }

  const handleRetry = () => {
    setSelected([])
    setUsed([])
    setResult(null)
    setShowVerse(false)
  }

  if (result) {
    return (
      <div className="text-center">
        <div className="text-6xl mb-4">{result.correct ? '🏆' : '😅'}</div>
        <h3 className={`text-2xl font-bold mb-2 ${result.correct ? 'text-green-600' : 'text-orange-500'}`}>
          {result.correct ? 'Mastered!' : 'Not quite!'}
        </h3>
        <p className="text-gray-500 mb-6">You got {result.score}% correct</p>

        <div className="mb-6">
          {showVerse ? (
            <div className="bg-blue-50 rounded-xl p-6 text-left">
              <p className="text-xs text-gray-400 mb-2">Correct verse:</p>
              <p className="text-gray-800 italic">"{verse.text}"</p>
              <p className="text-blue-600 font-semibold mt-2">{verse.reference}</p>
            </div>
          ) : (
            <button
              onClick={() => setShowVerse(true)}
              className="w-full border border-blue-200 text-blue-600 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              Show verse
            </button>
          )}
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
      <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 text-center mb-6">
        <p className="text-xs text-purple-400 uppercase tracking-widest mb-1 font-semibold">Final Level — Word Puzzle</p>
        <p className="text-purple-700 font-bold text-xl">{verse.reference}</p>
        <p className="text-purple-400 text-xs mt-1">Tap the words in the correct order</p>
      </div>

      {/* Selected words area */}
      <div className="min-h-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 p-3 mb-4 flex flex-wrap gap-2 items-start">
        {selected.length === 0 && (
          <p className="text-gray-300 text-sm w-full text-center mt-2">Your verse will appear here...</p>
        )}
        {selected.map((item, i) => (
          <button
            key={i}
            onClick={() => handleRemove(i)}
            className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium hover:bg-red-100 hover:text-red-600 transition-colors"
            title="Click to remove"
          >
            {item.word}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center mb-4">Click a word below to add it — click a selected word to remove it</p>

      {/* Scrambled words */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {scrambled.map((word, i) => (
          <button
            key={i}
            onClick={() => handleWordClick(word, i)}
            disabled={used.includes(i)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              used.includes(i)
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
            }`}
          >
            {word}
          </button>
        ))}
      </div>

      <button
        onClick={checkAnswer}
        disabled={selected.length === 0}
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