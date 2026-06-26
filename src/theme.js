export function applyTheme(mode) {
  document.body.classList.remove('light', 'dark')
  document.body.classList.add(mode)
  localStorage.setItem('rm-theme', mode)
}

export function getStoredTheme() {
  return localStorage.getItem('rm-theme') || 'light'
}