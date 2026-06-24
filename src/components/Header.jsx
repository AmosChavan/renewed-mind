export default function Header({ currentPage, onNavigate }) {
  const navItems = [
    { id: 'study', label: 'Study' },
    { id: 'vault', label: 'Memory Vault' },
    { id: 'journal', label: 'Journal' },
  ]

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Renewed Mind</h1>
        <p className="text-xs text-gray-500">Your AI Bible study companion</p>
      </div>
      <nav className="flex gap-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentPage === item.id
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  )
}