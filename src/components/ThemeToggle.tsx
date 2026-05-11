import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme')
    return saved ? saved === 'dark' : true
  })

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  return (
    <button
      onClick={() => setDark(!dark)}
      className="p-2 rounded-lg text-xl transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
      aria-label="테마 전환"
    >
      {dark ? '☀️' : '🌙'}
    </button>
  )
}
