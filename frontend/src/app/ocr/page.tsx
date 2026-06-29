'use client'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Eye, Upload, Copy, Download, Globe } from 'lucide-react'
import toast from 'react-hot-toast'

const languages = [
  { code: 'eng', name: 'English' }, { code: 'hin', name: 'Hindi' },
  { code: 'fra', name: 'French' }, { code: 'deu', name: 'German' },
  { code: 'spa', name: 'Spanish' }, { code: 'por', name: 'Portuguese' },
  { code: 'chi_sim', name: 'Chinese' }, { code: 'jpn', name: 'Japanese' },
  { code: 'kor', name: 'Korean' }, { code: 'ara', name: 'Arabic' },
  { code: 'rus', name: 'Russian' }, { code: 'ita', name: 'Italian' },
]

export default function OCRPage() {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [language, setLanguage] = useState('eng')
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<{ text: string; confidence: number; wordCount: number } | null>(null)
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0]
    setFile(f); setResult(null)
    if (f.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = e => setPreview(e.target?.result as string)
      reader.readAsDataURL(f)
    } else setPreview(null)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, multiple: false,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.tiff'], 'application/pdf': ['.pdf'] }
  })

  async function extractText() {
    if (!file) return toast.error('Please upload an image first')
    setProcessing(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('language', language)
      const res = await fetch(`${API}/api/ocr/image-to-text`, { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'OCR failed')
      setResult(data)
      toast.success(`Extracted ${data.wordCount} words — ${data.confidence}% confidence!`)
    } catch (err: any) {
      toast.error(err.message || 'OCR failed')
    } finally { setProcessing(false) }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 grid-pattern">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs mb-4">
            <Eye className="w-3 h-3" /> OCR — 12 Languages
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Image to Text (OCR)</h1>
          <p className="text-white/40 text-sm">Extract text from images and PDFs with AI-powered OCR</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="glass rounded-2xl border border-dark-500/40 p-5">
              <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-3">
                <Globe className="w-4 h-4" /> Select Language
              </label>
              <div className="grid grid-cols-3 gap-2">
                {languages.map(lang => (
                  <button key={lang.code} onClick={() => setLanguage(lang.code)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${language === lang.code ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'glass text-white/40 border border-dark-500/40 hover:text-white/70'}`}>
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            <div {...getRootProps()} className={`glass rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all ${isDragActive ? 'border-emerald-400 bg-emerald-500/10' : 'border-dark-500/60 hover:border-emerald-500/40 hover:bg-emerald-500/5'}`}>
              <input {...getInputProps()} />
              {preview
                ? <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
                : <><Upload className="w-10 h-10 text-white/20 mx-auto mb-4" /><p className="text-white/60 font-medium mb-1">Drop image or PDF here</p><p className="text-white/30 text-sm">PNG, JPG, WEBP, TIFF, PDF • Max 20MB</p></>}
              {file && <p className="text-xs text-white/30 mt-3 truncate">{file.name}</p>}
            </div>

            <button onClick={extractText} disabled={processing || !file}
              className="w-full py-4 flex items-center justify-center gap-2 font-semibold rounded-xl text-white disabled:opacity-50 transition-all"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              {processing
                ? <><div className="loading-dots"><span></span><span></span><span></span></div> Extracting...</>
                : <><Eye className="w-4 h-4" /> Extract Text</>}
            </button>
          </div>

          <div className="glass rounded-2xl border border-dark-500/40 p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Extracted Text</h3>
              {result && (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/30">{result.wordCount} words • {result.confidence}% accuracy</span>
                  <button onClick={() => { navigator.clipboard.writeText(result.text); toast.success('Copied!') }} className="p-1.5 text-white/30 hover:text-cyan-400 transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                  <button onClick={() => {
                    const blob = new Blob([result.text], { type: 'text/plain' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url; a.download = 'extracted_text.txt'; a.click()
                  }} className="p-1.5 text-white/30 hover:text-emerald-400 transition-colors"><Download className="w-3.5 h-3.5" /></button>
                </div>
              )}
            </div>
            <div className="flex-1 min-h-[300px]">
              {result
                ? <div className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap font-mono">{result.text || 'No text detected.'}</div>
                : <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-3 text-center"><Eye className="w-10 h-10 text-white/10" /><p className="text-sm text-white/20">Extracted text will appear here</p></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
