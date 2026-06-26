import { useState, useEffect } from 'react'
import Header from './components/Header'
import BibleReader from './components/BibleReader'
import MemoryVault from './components/MemoryVault'
import PracticeMode from './components/PracticeMode'
import { applyTheme, getStoredTheme } from './theme'

export default function App() {
  const [page, setPage] = useState('study')
  const [practiceVerse, setPracticeVerse] = useState(null)
  const [theme, setTheme] = useState(getStoredTheme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
  }

  const handlePractice = (verse) => {
    setPracticeVerse(verse)
    setPage('practice')
  }

  const handleBackFromPractice = () => {
    setPracticeVerse(null)
    setPage('vault')
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)' }}>
      <Header currentPage={page} onNavigate={setPage} theme={theme} onToggleTheme={toggleTheme} />
      <main className="max-w-5xl mx-auto px-6 py-8">
        {page === 'study' && <BibleReader />}
        {page === 'vault' && <MemoryVault onPractice={handlePractice} />}
        {page === 'practice' && practiceVerse && (
          <PracticeMode verse={practiceVerse} onBack={handleBackFromPractice} />
        )}
      </main>
    </div>
  )
}