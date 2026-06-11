import { useState } from 'react'

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

  if (!searchData.data?.passages?.length) {
    throw new Error('Passage not found.')
  }

  const combined = searchData.data.passages.map(p => p.content).join(' ')

  let processed = combined

  // Replace all heading tags
  processed = processed.replace(
    /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/gi,
    (_, inner) => {
      const text = inner.replace(/<[^>]*>/g, '').trim()
      return text ? `\n{{HEADING:${text}}}\n` : ''
    }
  )

  // Replace heading class spans
  processed = processed.replace(
    /<span[^>]*class="[^"]*heading[^"]*"[^>]*>([\s\S]*?)<\/span>/gi,
    (_, inner) => {
      const text = inner.replace(/<[^>]*>/g, '').trim()
      return text ? `\n{{HEADING:${text}}}\n` : ''
    }
  )

  // Replace title class spans  
  processed = processed.replace(
    /<span[^>]*class="[^"]*title[^"]*"[^>]*>([\s\S]*?)<\/span>/gi,
    (_, inner) => {
      const text = inner.replace(/<[^>]*>/g, '').trim()
      return text ? `\n{{HEADING:${text}}}\n` : ''
    }
  )

  // Replace verse number spans
  processed = processed.replace(
    /<span[^>]*class="[^"]*v\b[^"]*"[^>]*>(\d+)<\/span>/gi,
    '{{VERSE:$1}}'
  )

  // Strip all remaining HTML
  processed = processed.replace(/<[^>]*>/g, ' ')
  processed = processed.replace(/\s+/g, ' ').trim()

  // Any text sitting directly before {{VERSE:1}} that isn't a verse marker is a heading
  processed = processed.replace(
    /^([^{]+?)(\{\{VERSE:1\}\})/,
    (_, before, verse) => {
      const heading = before.trim()
      return heading ? `{{HEADING:${heading}}}${verse}` : verse
    }
  )

  // Same for headings appearing before any verse marker mid-text
  processed = processed.replace(
    /(\{\{VERSE:\d+\}\})\s*([A-Z][^{]{3,60}?)\s*(\{\{VERSE:\d+\}\})/g,
    (_, v1, middle, v2) => {
      const trimmed = middle.trim()
      // If it looks like a title (no period, not too long), treat as heading
      if (!trimmed.includes('.') && trimmed.length < 60) {
        return `${v1}{{HEADING:${trimmed}}}${v2}`
      }
      return `${v1}${middle}${v2}`
    }
  )

  return processed
}

function PassageText({ text }) {
  const parts = text.split(/({{HEADING:[^}]+}}|{{VERSE:\d+}})/)

  return (
    <div className="text-gray-800 text-base">
      {parts.map((part, i) => {
        const headingMatch = part.match(/{{HEADING:(.+)}}/)
        const verseMatch = part.match(/{{VERSE:(\d+)}}/)

        if (headingMatch) {
          return (
            <h3 key={i} className="font-bold text-gray-900 text-lg mt-6 mb-2">
              {headingMatch[1]}
            </h3>
          )
        }

        if (verseMatch) {
          return (
            <sup key={i} className="text-blue-500 font-bold text-xs mr-0.5 ml-1">
              {verseMatch[1]}
            </sup>
          )
        }

        return <span key={i} className="leading-relaxed">{part}</span>
      })}
    </div>
  )
}

function BookPicker({ onSelect }) {
  const [search, setSearch] = useState('')

  const filter = (list) => list.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase())
  )

  const BookButton = ({ book }) => (
    <button
      onClick={() => onSelect(book)}
      className="text-left px-3 py-2 text-sm rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all font-medium text-gray-700"
    >
      {book.name}
    </button>
  )

  return (
    <div>
      <input
        type="text"
        placeholder="Search book..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="mb-5">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
            Old Testament
          </span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>
        <div className="grid grid-cols-4 gap-1 sm:grid-cols-6 lg:grid-cols-8">
          {filter(OT).map(b => <BookButton key={b.name} book={b} />)}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
            New Testament
          </span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>
        <div className="grid grid-cols-4 gap-1 sm:grid-cols-6 lg:grid-cols-8">
          {filter(NT).map(b => <BookButton key={b.name} book={b} />)}
        </div>
      </div>
    </div>
  )
}

function ChapterPicker({ book, onSelect, onBack }) {
  return (
    <div>
      <button onClick={onBack} className="text-sm text-blue-600 hover:underline mb-4 flex items-center gap-1">
        ← Back to books
      </button>
      <p className="text-sm font-semibold text-gray-700 mb-4">
        {book.name} <span className="font-normal text-gray-400">— select a chapter</span>
      </p>
      <div className="grid grid-cols-8 gap-2 sm:grid-cols-10 lg:grid-cols-12">
        {Array.from({ length: book.chapters }, (_, i) => i + 1).map(ch => (
          <button
            key={ch}
            onClick={() => onSelect(ch)}
            className="h-10 text-sm bg-gray-50 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-colors font-medium text-gray-700 border border-gray-200 hover:border-blue-300"
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

  const translations = ['NIV', 'CSB', 'NLT']

  const handleBookSelect = (book) => {
    setSelectedBook(book)
    setStep('chapter')
  }

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
    <div className="bg-white rounded-xl border border-gray-200 p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Bible Reader</h2>
          {selectedBook && (
            <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1">
              <button onClick={() => setStep('book')} className="hover:text-blue-600 hover:underline">
                {selectedBook.name}
              </button>
              {selectedChapter && (
                <>
                  <span className="text-gray-300">›</span>
                  <button onClick={() => setStep('chapter')} className="hover:text-blue-600 hover:underline">
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
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                translation === t
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {step === 'book' && <BookPicker onSelect={handleBookSelect} />}

      {step === 'chapter' && selectedBook && (
        <ChapterPicker
          book={selectedBook}
          onSelect={handleChapterSelect}
          onBack={() => setStep('book')}
        />
      )}

      {step === 'passage' && (
        <div>
          <button
            onClick={() => setStep('chapter')}
            className="text-sm text-blue-600 hover:underline mb-4 flex items-center gap-1"
          >
            ← Back to chapters
          </button>

          {loading && (
            <div className="text-center py-16 text-gray-400">
              <div className="text-2xl mb-2">📖</div>
              <p className="text-sm">Loading passage...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {passage && !loading && (
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-blue-900 text-lg">{passage.reference}</span>
                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-full">
                  {passage.translation}
                </span>
              </div>
              <PassageText text={passage.text} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}