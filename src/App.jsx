import Header from './components/Header'
import BibleReader from './components/BibleReader'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <BibleReader />
      </main>
    </div>
  )
}

export default App