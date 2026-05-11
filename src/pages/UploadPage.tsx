import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../lib/auth'
import { embedPassword } from '../lib/png'
import ThemeToggle from '../components/ThemeToggle'

type Stage = 'idle' | 'selected' | 'done'

export default function UploadPage() {
  const [stage, setStage] = useState<Stage>('idle')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (!selected) return
    loadFile(selected)
  }

  function loadFile(selected: File) {
    setFile(selected)
    setFileName(selected.name)
    setPreviewUrl(URL.createObjectURL(selected))
    setStage('selected')
  }

  function handleReset() {
    setStage('idle')
    setFile(null)
    setFileName('')
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleDownload() {
    if (!file) return
    const buffer = await file.arrayBuffer()
    const result = embedPassword(buffer)
    const blob = new Blob([result], { type: 'image/png' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName.replace(/\.png$/i, '_protected.png')
    a.click()
    URL.revokeObjectURL(url)
    setStage('done')
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-slate-900 dark:bg-slate-900 flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
        <h1 className="text-lg font-bold text-slate-100">🔐 PNG 비밀번호 삽입</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-sm rounded-lg text-slate-300 hover:bg-slate-700 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-slate-800 rounded-2xl shadow-xl p-8">

            {/* 상태 A: 파일 업로드 대기 */}
            {stage === 'idle' && (
              <>
                <p className="text-slate-300 text-center mb-6 text-sm">
                  PNG 파일을 선택하면 비밀번호를 삽입하여 다운로드할 수 있습니다.
                </p>
                <button
                  onClick={() => inputRef.current?.click()}
                  className="w-full border-2 border-dashed border-slate-600 hover:border-indigo-500 rounded-xl py-16 flex flex-col items-center gap-3 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                >
                  <span className="text-5xl">🖼️</span>
                  <span className="font-medium">PNG 파일 선택</span>
                  <span className="text-xs text-slate-500">클릭하여 파일 탐색기 열기</span>
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/png"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </>
            )}

            {/* 상태 B: 파일 선택됨 */}
            {stage === 'selected' && previewUrl && (
              <>
                <p className="text-slate-400 text-sm text-center mb-4 truncate">{fileName}</p>
                <img
                  src={previewUrl}
                  alt="미리보기"
                  className="w-full max-h-64 object-contain rounded-lg mb-6 bg-slate-700"
                />
                <button
                  onClick={handleDownload}
                  className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors mb-3"
                >
                  비밀번호 삽입 후 다운로드
                </button>
                <button
                  onClick={handleReset}
                  className="w-full py-2.5 rounded-lg text-slate-400 hover:bg-slate-700 text-sm transition-colors"
                >
                  다른 파일 선택
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/png"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </>
            )}

            {/* 상태 C: 다운로드 완료 */}
            {stage === 'done' && (
              <div className="text-center py-4">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-xl font-bold text-slate-100 mb-2">완료!</h2>
                <p className="text-slate-400 text-sm mb-8">
                  비밀번호가 삽입된 PNG 파일이 다운로드되었습니다.
                </p>
                <button
                  onClick={handleReset}
                  className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
                >
                  새 파일 처리하기
                </button>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  )
}
