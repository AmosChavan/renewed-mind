import { useState } from 'react'
import { supabase } from '../supabase'

const TRANSLATION_IDS = {
  'NIV': '78a9f6124f344018-01',
  'CSB': 'a556c5305ee15c3f-01',
  'NLT': 'd6e14a625393b4da-01',
}

const API_KEY = import.meta.env.VITE_BIBLE_API_KEY

const BOOKS = [
  { name: 'Genesis', chapters: 50 }, { name: 'Exodus', chapters: 40 },
  { name: 'Leviticus', chapters: 27 }, { name: 'Numbers', chapters: 36 },
  { name: 'Deuteronomy', chapters: 34 }, { name: 'Joshua', chapters: 24 },
  { name: 'Judges', chapters: 21 }, { name: 'Ruth', chapters: 4 },
  { name: '1 Samuel', chapters: 31 }, { name: '2 Samuel', chapters: 24 },
  { name: '1 Kings', chapters: 22 }, { name: '2 Kings', chapters: 25 },
  { name: '1 Chronicles', chapters: 29 }, { name: '2 Chronicles', chapters: 36 },
  { name: 'Ezra', chapters: 10 }, { name: 'Nehemiah', chapters: 13 },
  { name: 'Esther', chapters: 10 }, { name: 'Job', chapters: 42 },
  { name: 'Psalms', chapters: 150 }, { name: 'Proverbs', chapters: 31 },
  { name: 'Ecclesiastes', chapters: 12 }, { name: 'Song of Solomon', chapters: 8 },
  { name: 'Isaiah', chapters: 66 }, { name: 'Jeremiah', chapters: 52 },
  { name: 'Lamentations', chapters: 5 }, { name: 'Ezekiel', chapters: 48 },
  { name: 'Daniel', chapters: 12 }, { name: 'Hosea', chapters: 14 },
  { name: 'Joel', chapters: 3 }, { name: 'Amos', chapters: 9 },
  { name: 'Obadiah', chapters: 1 }, { name: 'Jonah', chapters: 4 },
  { name: 'Micah', chapters: 7 }, { name: 'Nahum', chapters: 3 },
  { name: 'Habakkuk', chapters: 3 }, { name: 'Zephaniah', chapters: 3 },
  { name: 'Haggai', chapters: 2 }, { name: 'Zechariah', chapters: 14 },
  { name: 'Malachi', chapters: 4 }, { name: 'Matthew', chapters: 28 },
  { name: 'Mark', chapters: 16 }, { name: 'Luke', chapters: 24 },
  { name: 'John', chapters: 21 }, { name: 'Acts', chapters: 28 },
  { name: 'Romans', chapters: 16 }, { name: '1 Corinthians', chapters: 16 },
  { name: '2 Corinthians', chapters: 13 }, { name: 'Galatians', chapters: 6 },
  { name: 'Ephesians', chapters: 6 }, { name: 'Philippians', chapters: 4 },
  { name: 'Colossians', chapters: 4 }, { name: '1 Thessalonians', chapters: 5 },
  { name: '2 Thessalonians', chapters: 3 }, { name: '1 Timothy', chapters: 6 },
  { name: '2 Timothy', chapters: 4 }, { name: 'Titus', chapters: 3 },
  { name: 'Philemon', chapters: 1 }, { name: 'Hebrews', chapters: 13 },
  { name: 'James', chapters: 5 }, { name: '1 Peter', chapters: 5 },
  { name: '2 Peter', chapters: 3 }, { name: '1 John', chapters: 5 },
  { name: '2 John', chapters: 1 }, { name: '3 John', chapters: 1 },
  { name: 'Jude', chapters: 1 }, { name: 'Revelation', chapters: 22 },
]

const OT = BOOKS.slice(0, 39)
const NT = BOOKS.slice(39)

async function fetchBiblePassage(reference, translationId) {
  const searchRes = await fetch(
    `https://api.scripture.api.bible/v1/bibles/${translationId}/search?query=${encodeURIComponent(reference)}&limit=100`,
    { headers: { 'api-key': API_KEY } }
  )
  const searchData = await searchRes.json()
  if (!searchData.data?.passages?.length) throw new Error('Passage not found.')

  const combined = searchData.data.passages.map(p => p.content).join(' ')
  let processed = combined

  processed = processed.replace(
    /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi,
    (_, inner) => {
      const text = inner.replace(/<[^>]*>/g, '').trim()
      return text ? `\n{{HEADING:${text}}}\n` : ''
    }
  )
  processed = processed.replace(
    /<span[^>]*class="[^"]*heading[^"]*"[^>]*>([\s\S]*?)<\/span>/gi,
    (_, inner) => {
      const text = inner.replace(/<[^>]*>/g, '').trim()
      return text ? `\n{{HEADING:${text}}}\n` : ''
    }
  )
  processed = processed.replace(
    /<span[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/span>/gi,
    (_, inner) => {
      const text = inner.replace(/<[^>]*>/g, '').trim()
      return text ? `\n{{HEADING:${text}}}\n` : ''
    }
  )
  processed = processed.replace(
    /<span[^>]*class="[^"]*v\b[^"]*"[^>]*>(\d+)<\/span>/gi,
    '{{VERSE:$1}}'
  )
  processed = processed.replace(/<[^>]*>/g, ' ')
  processed = processed.replace(/\s+/g, ' ').trim()
  processed = processed.replace(
    /^([^{]+?)(\{\{VERSE:1\}\})/,
    (_, before, verse) => {
      const heading = before.trim()
      return heading ? `{{HEADING:${heading}}}${verse}` : verse
    }
  )
  return processed
}

function SelectionPopup({ position, onSave, onClose }) {
  if (!position) return null
  return (
    <div
      className="fixed z-50 text-xs rounded-lg px-3 py-2 flex items-center gap-2 shadow-lg"
      style={{
        top: position.y - 50,
        left: Math.min(position.x - 60, window.innerWidth - 160),
        background: '#1E293B',
        color: '#FFFFFF',
      }}
    >
      <button onClick={onSave} className="flex items-center gap-1 hover:text-blue-300 transition-colors font-medium">
        🔖 Save to Vault
      </button>
      <button onClick={onClose} className="text-gray-400 hover:text-white ml-1">✕</button>
    </div>
  )
}

function SaveModal({ verse, reference, translation, onClose }) {
  const [ref, setRef] = useState(reference)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const { error } = await supabase.from('memory_verses').insert({
      reference: ref,
      text: verse,
      translation,
      level: 1,
      streak: 0,
    })
    setSaving(false)
    if (error) {
      alert('Error saving: ' + error.message)
    } else {
      setSaved(true)
      setTimeout(onClose, 1200)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
      <div className="rounded-xl shadow-xl p-6 max-w-md w-full" style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-color)' }}>
        <h3 className="font-bold text-lg mb-4" style={{ color: 'var(--text-primary)' }}>Save to Memory Vault</h3>
        <div className="rounded-lg p-4 mb-4" style={{ background: 'var(--bg-passage)' }}>
          <p className="text-sm italic" style={{ color: 'var(--text-primary)' }}>"{verse}"</p>
        </div>
        <div className="mb-4">
          <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>
            Reference — <span style={{ color: 'var(--accent-text)' }}>edit to match exact verses</span>
          </label>
          <input
            type="text"
            value={ref}
            onChange={e => setRef(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm focus:outline-none"
            style={{ background: 'var(--input-bg)', border: '0.5px solid var(--border-color)', color: 'var(--text-primary)' }}
          />
        </div>
        <div className="flex gap-3">
          {saved ? (
            <div className="flex-1 text-sm font-medium py-2 rounded-lg text-center" style={{ background: '#DCFCE7', color: '#166534' }}>
              ✓ Saved to your vault!
            </div>
          ) : (
            <>
              <button
                onClick={onClose}
                className="flex-1 py-2 rounded-lg text-sm font-medium"
                style={{ border: '0.5px solid var(--border-color)', color: 'var(--text-secondary)', background: 'transparent' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                style={{ background: 'var(--btn-bg)', color: 'var(--btn-text)' }}
              >
                {saving ? 'Saving...' : 'Save to Vault'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function PassageText({ text, onSaveVerse }) {
  const [popup, setPopup] = useState(null)
  const [selectedText, setSelectedText] = useState('')
  const [verseRange, setVerseRange] = useState('')

  const handleMouseUp = () => {
    const selection = window.getSelection()
    const selected = selection?.toString().trim()

    if (selected && selected.length > 3) {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      const allSups = Array.from(document.querySelectorAll('sup.verse-num'))

      let startVerse = null
      let endVerse = null

      allSups.forEach(sup => {
        const supRange = document.createRange()
        supRange.selectNode(sup)
        if (supRange.compareBoundaryPoints(Range.END_TO_START, range) <= 0) startVerse = sup.textContent.trim()
        if (supRange.compareBoundaryPoints(Range.START_TO_END, range) <= 0) endVerse = sup.textContent.trim()
      })

      const verseRef = startVerse && endVerse && parseInt(endVerse) > parseInt(startVerse)
        ? `${startVerse}-${endVerse}`
        : startVerse || ''

      setSelectedText(selected)
      setVerseRange(verseRef)
      setPopup({ x: rect.left + rect.width / 2, y: rect.top })
    } else {
      setPopup(null)
      setSelectedText('')
      setVerseRange('')
    }
  }

  const handleSave = () => {
    const cleanText = selectedText.replace(/^\d+/, '').replace(/\s+\d+\s+/g, ' ').trim()
    onSaveVerse(cleanText, verseRange)
    setPopup(null)
    setSelectedText('')
    setVerseRange('')
    window.getSelection()?.removeAllRanges()
  }

  const parts = text.split(/({{HEADING:[^}]+}}|{{VERSE:\d+}})/)

  return (
    <>
      <SelectionPopup position={popup} onSave={handleSave} onClose={() => setPopup(null)} />
      <div className="text-base" style={{ color: 'var(--text-primary)', lineHeight: '1.9' }} onMouseUp={handleMouseUp}>
        {parts.map((part, i) => {
          const headingMatch = part.match(/{{HEADING:(.+)}}/)
          const verseMatch = part.match(/{{VERSE:(\d+)}}/)
          if (headingMatch) {
            return (
              <h3 key={i} className="font-bold text-lg mt-6 mb-2" style={{ color: 'var(--text-primary)' }}>
                {headingMatch[1]}
              </h3>
            )
          }
          if (verseMatch) {
            return (
              <sup key={i} className="verse-num font-bold text-xs mr-0.5 ml-1" style={{ color: 'var(--accent-text)' }}>
                {verseMatch[1]}
              </sup>
            )
          }
          return <span key={i}>{part}</span>
        })}
      </div>
    </>
  )
}

function BookPicker({ onSelect }) {
  const [search, setSearch] = useState('')

  const filtered = BOOKS.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase())
  )

  const OT = filtered.filter(b => BOOKS.indexOf(b) < 39)
  const NT = filtered.filter(b => BOOKS.indexOf(b) >= 39)

  return (
    <div>
      <input
        type="text"
        placeholder="Search any book..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full rounded-lg px-4 py-2 text-sm mb-5 focus:outline-none"
        style={{ background: 'var(--input-bg)', border: '0.5px solid var(--border-color)', color: 'var(--text-primary)' }}
      />

      {OT.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
              Old Testament
            </span>
            <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
          </div>
          <div className="flex flex-wrap gap-2">
            {OT.map(b => (
              <button
                key={b.name}
                onClick={() => onSelect(b)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={{ background: 'var(--pill-bg)', color: 'var(--text-primary)', border: '0.5px solid var(--border-color)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-light)'; e.currentTarget.style.color = 'var(--accent-text)'; e.currentTarget.style.borderColor = 'var(--accent-text)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--pill-bg)'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--border-color)' }}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {NT.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
              New Testament
            </span>
            <div className="flex-1 h-px" style={{ background: 'var(--border-color)' }} />
          </div>
          <div className="flex flex-wrap gap-2">
            {NT.map(b => (
              <button
                key={b.name}
                onClick={() => onSelect(b)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={{ background: 'var(--pill-bg)', color: 'var(--text-primary)', border: '0.5px solid var(--border-color)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-light)'; e.currentTarget.style.color = 'var(--accent-text)'; e.currentTarget.style.borderColor = 'var(--accent-text)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--pill-bg)'; e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--border-color)' }}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


function ChapterPicker({ book, onSelect, onBack }) {
  return (
    <div>
      <button onClick={onBack} className="text-sm hover:underline mb-4 flex items-center gap-1" style={{ color: 'var(--accent-text)' }}>
        ← Back to books
      </button>
      <p className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
        {book.name} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>— select a chapter</span>
      </p>
      <div className="grid grid-cols-8 gap-2 sm:grid-cols-10 lg:grid-cols-12">
        {Array.from({ length: book.chapters }, (_, i) => i + 1).map(ch => (
          <button
            key={ch}
            onClick={() => onSelect(ch)}
            className="h-10 text-sm rounded-lg transition-colors font-medium"
            style={{ background: 'var(--pill-bg)', color: 'var(--text-primary)', border: '0.5px solid var(--border-color)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-light)'; e.currentTarget.style.color = 'var(--accent-text)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--pill-bg)'; e.currentTarget.style.color = 'var(--text-primary)' }}
          >
            {ch}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function BibleReader() {
  const [step, setStep] = useState('book')
  const [selectedBook, setSelectedBook] = useState(null)
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [translation, setTranslation] = useState('NIV')
  const [passage, setPassage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [saveModal, setSaveModal] = useState(null)
  const translations = ['NIV', 'CSB', 'NLT']

  const handleBookSelect = (book) => { setSelectedBook(book); setStep('chapter') }

  const handleChapterSelect = async (chapter) => {
    setSelectedChapter(chapter)
    setStep('passage')
    setLoading(true)
    setError(null)
    setPassage(null)
    const ref = `${selectedBook.name} ${chapter}`
    try {
      const text = await fetchBiblePassage(ref, TRANSLATION_IDS[translation])
      setPassage({ reference: ref, translation, text })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTranslationChange = async (t) => {
    setTranslation(t)
    if (passage) {
      setLoading(true)
      setError(null)
      try {
        const text = await fetchBiblePassage(passage.reference, TRANSLATION_IDS[t])
        setPassage(prev => ({ ...prev, translation: t, text }))
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="rounded-xl p-6" style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-color)' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Bible Reader</h2>
          {selectedBook && (
            <p className="text-sm mt-0.5 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
              <button onClick={() => setStep('book')} className="hover:underline" style={{ color: 'var(--accent-text)' }}>
                {selectedBook.name}
              </button>
              {selectedChapter && (
                <>
                  <span style={{ color: 'var(--border-color)' }}>›</span>
                  <button onClick={() => setStep('chapter')} className="hover:underline" style={{ color: 'var(--accent-text)' }}>
                    Chapter {selectedChapter}
                  </button>
                </>
              )}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {translations.map(t => (
            <button
              key={t}
              onClick={() => handleTranslationChange(t)}
              className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
              style={{
                background: translation === t ? 'var(--pill-active-bg)' : 'var(--pill-bg)',
                color: translation === t ? 'var(--pill-active-text)' : 'var(--pill-text)',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {step === 'book' && <BookPicker onSelect={handleBookSelect} />}
      {step === 'chapter' && selectedBook && (
        <ChapterPicker book={selectedBook} onSelect={handleChapterSelect} onBack={() => setStep('book')} />
      )}

      {step === 'passage' && (
        <div>
          <button
            onClick={() => setStep('chapter')}
            className="text-sm hover:underline mb-4 flex items-center gap-1"
            style={{ color: 'var(--accent-text)' }}
          >
            ← Back to chapters
          </button>

          {loading && (
            <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
              <div className="text-2xl mb-2">📖</div>
              <p className="text-sm">Loading passage...</p>
            </div>
          )}

          {error && (
            <div className="rounded-lg px-4 py-3 text-sm" style={{ background: '#FEF2F2', color: '#991B1B', border: '0.5px solid #FECACA' }}>
              {error}
            </div>
          )}

          {passage && !loading && (
            <div className="rounded-xl p-6" style={{ background: 'var(--bg-passage)', borderLeft: '3px solid var(--passage-border)' }}>
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-lg" style={{ color: 'var(--accent-text)' }}>{passage.reference}</span>
                <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--accent-light)', color: 'var(--accent-text)' }}>
                  {passage.translation}
                </span>
              </div>
              {saveModal && (
                <SaveModal
                  verse={saveModal.text}
                  reference={`${passage.reference}:${saveModal.verseRange}`}
                  translation={passage.translation}
                  onClose={() => setSaveModal(null)}
                />
              )}
              <PassageText
                text={passage.text}
                onSaveVerse={(text, verseRange) => setSaveModal({ text, verseRange })}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}