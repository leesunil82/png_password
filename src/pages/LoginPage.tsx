import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../lib/auth'
import ThemeToggle from '../components/ThemeToggle'

export default function LoginPage() {
  const [id, setId] = useState('')
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (login(id, pw)) {
      navigate('/upload')
    } else {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.')
      setPw('')
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col transition-colors">
      <header className="flex justify-end p-4">
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 transition-colors">
            <div className="mb-8 text-center">
              <img src="/images/logo.png" alt="FAM4 로고" className="w-24 h-24 object-contain mx-auto mb-3" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                PNG 비밀번호 삽입
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">로그인 후 이용할 수 있습니다</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  아이디
                </label>
                <input
                  type="text"
                  value={id}
                  onChange={e => setId(e.target.value)}
                  autoComplete="username"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-slate-300 dark:border-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  placeholder="아이디 입력"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  비밀번호
                </label>
                <input
                  type="password"
                  value={pw}
                  onChange={e => setPw(e.target.value)}
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border border-slate-300 dark:border-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  placeholder="비밀번호 입력"
                />
              </div>

              {error && (
                <p className="text-red-500 dark:text-red-400 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors mt-2"
              >
                로그인
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
