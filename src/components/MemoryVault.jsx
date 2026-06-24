import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const LEVELS = {
  1: { label: 'Reading', color: 'bg-gray-100 text-gray-600' },
  2: { label: 'Hints', color: 'bg-yellow-100 text-yellow-700' },
  3: { label: 'Typing', color: 'bg-blue-100 text-blue-700' },
  4: { label: 'Mastered', color: 'bg-green-100 text-green-700' },
}

export default function MemoryVault({ onPractice }) {
  const [verses, setVerses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVerses()
  }, [])

  const fetchVerses = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('memory_verses')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setVerses(data)
    setLoading(false)
  }

  const deleteVerse = async (id) => {
    const { error } = await supabase
      .from('memory_verses')
      .delete()
      .eq('id', id)

    if (!error) setVerses(verses.filter(v => v.id !== id))
  }

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-sm">Loading your vault...</p>
      </div>
    )
  }

  if (verses.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <div className="text-4xl mb-4">📖</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Your vault is empty</h3>
        <p className="text-sm text-gray-400">
          Go to the Bible Reader, select any verse text, and save it to your Memory Vault.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Memory Vault</h2>
          <p className="text-sm text-gray-400 mt-0.5">{verses.length} verse{verses.length !== 1 ? 's' : ''} saved</p>
        </div>
      </div>

      <div className="grid gap-4">
        {verses.map(verse => (
          <div key={verse.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold text-gray-900">{verse.reference}</span>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    {verse.translation}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEVELS[verse.level].color}`}>
                    {LEVELS[verse.level].label}
                  </span>
                  {verse.streak > 0 && (
                    <span className="text-xs text-orange-500 font-medium">
                      🔥 {verse.streak} day streak
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed italic">
                  "{verse.text}"
                </p>
              </div>

              <div className="flex flex-col gap-2 flex-shrink-0">
                <button
                  onClick={() => onPractice(verse)}
                  className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Practice
                </button>
                <button
                  onClick={() => deleteVerse(verse.id)}
                  className="text-red-400 hover:text-red-600 text-xs text-center transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}