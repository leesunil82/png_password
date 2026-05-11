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
  const [dragging, setDragging] = useState(false)
  const [dragError, setDragError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (!selected) return
    loadFile(selected)
  }

  function loadFile(selected: File) {
    setDragError('')
    setFile(selected)
    setFileName(selected.name)
    setPreviewUrl(URL.createObjectURL(selected))
    setStage('selected')
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setDragging(true)
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files?.[0]
    if (!dropped) return
    if (dropped.type !== 'image/png') {
      setDragError('PNG 파일만 올릴 수 있습니다.')
      return
    }
    loadFile(dropped)
  }

  function handleReset() {
    setStage('idle')
    setFile(null)
    setFileName('')
    setDragError('')
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
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col transition-colors">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 transition-colors">
        <div className="flex items-center gap-2">
          <img src="/images/logo.png" alt="FAM4 로고" className="w-8 h-8 object-contain" />
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">PNG 비밀번호 삽입</h1>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-sm rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 transition-colors">

            {/* 상태 A: 파일 업로드 대기 */}
            {stage === 'idle' && (
              <>
                <p className="text-slate-600 dark:text-slate-300 text-center mb-6 text-sm">
                  PNG 파일을 선택하거나 이 영역에 끌어다 놓으세요.
                </p>
                <div
                  onClick={() => inputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`w-full border-2 border-dashed rounded-xl py-16 flex flex-col items-center gap-3 cursor-pointer transition-colors
                    ${dragging
                      ? 'border-indigo-400 bg-indigo-500/10 text-indigo-500'
                      : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 text-slate-400 dark:text-slate-500 hover:text-indigo-500'
                    }`}
                >
                  <span className="text-5xl">{dragging ? '📂' : '🖼️'}</span>
                  <span className="font-medium">
                    {dragging ? '여기에 놓으세요!' : 'PNG 파일 선택 또는 드래그&드롭'}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">클릭하거나 파일을 끌어다 놓기</span>
                </div>
                {dragError && (
                  <p className="text-red-500 dark:text-red-400 text-sm text-center mt-3">{dragError}</p>
                )}
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
                <p className="text-slate-500 dark:text-slate-400 text-sm text-center mb-4 truncate">{fileName}</p>
                <img
                  src={previewUrl}
                  alt="미리보기"
                  className="w-full max-h-64 object-contain rounded-lg mb-6 bg-slate-100 dark:bg-slate-700"
                />
                <button
                  onClick={handleDownload}
                  className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors mb-3"
                >
                  비밀번호 삽입 후 다운로드
                </button>
                <button
                  onClick={handleReset}
                  className="w-full py-2.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm transition-colors"
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
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">완료!</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
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
