import { useState } from 'react'
import Header from './components/Header'
import BibleReader from './components/BibleReader'
import MemoryVault from './components/MemoryVault'
import PracticeMode from './components/PracticeMode'

export default function App() {
  const [page, setPage] = useState('study')
  const [practiceVerse, setPracticeVerse] = useState(null)

  const handlePractice = (verse) => {
    setPracticeVerse(verse)
    setPage('practice')
  }

  const handleBackFromPractice = () => {
    setPracticeVerse(null)
    setPage('vault')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage={page} onNavigate={setPage} />
      <main className="max-w-5xl mx-auto px-6 py-8">
        {page === 'study' && <BibleReader />}
        {page === 'vault' && <MemoryVault onPractice={handlePractice} />}
        {page === 'practice' && practiceVerse && (
          <PracticeMode
            verse={practiceVerse}
            onBack={handleBackFromPractice}
          />
        )}
      </main>
    </div>
  )
}