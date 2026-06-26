export default function Header({ currentPage, onNavigate, theme, onToggleTheme }) {
  const navItems = [
    { id: 'study', label: 'Study' },
    { id: 'vault', label: 'Memory Vault' },
    { id: 'journal', label: 'Journal' },
  ]

  return (
    <header style={{
      background: 'var(--bg-header)',
      borderBottom: '0.5px solid var(--header-border)',
    }} className="px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Renewed Mind
        </h1>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          Your AI Bible study companion
        </p>
      </div>

      <div className="flex items-center gap-2">
        <nav className="flex gap-1 mr-3">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                background: currentPage === item.id ? 'var(--nav-active-bg)' : 'transparent',
                color: currentPage === item.id ? 'var(--nav-active-text)' : 'var(--text-secondary)',
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          style={{
            background: 'var(--accent-light)',
            color: 'var(--accent-text)',
            border: '0.5px solid var(--border-color)',
          }}
          className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? (
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          ) : (
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          )}
        </button>
      </div>
    </header>
  )
}