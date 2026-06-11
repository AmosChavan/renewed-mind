function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Renewed Mind</h1>
        <p className="text-xs text-gray-500">Your AI Bible study companion</p>
      </div>
      <nav className="flex gap-4 text-sm text-gray-600">
        <button className="hover:text-blue-700 font-medium">Study</button>
        <button className="hover:text-blue-700 font-medium">Memory Vault</button>
        <button className="hover:text-blue-700 font-medium">Journal</button>
      </nav>
    </header>
  )
}

export default Header