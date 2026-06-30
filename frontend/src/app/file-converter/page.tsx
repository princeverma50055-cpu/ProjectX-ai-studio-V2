'use client'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Download, FileType, ArrowRight, X, CheckCircle, Copy } from 'lucide-react'
import toast from 'react-hot-toast'

const conversions = [
  { from: 'TXT', to: 'PDF', id: 'text-to-pdf', desc: 'Convert plain text to PDF', accept: '.txt' },
  { from: 'PDF', to: 'TXT', id: 'pdf-to-text', desc: 'Extract text from PDF', accept: '.pdf' },
  { from: 'DOCX', to: 'TXT', id: 'docx-to-text', desc: 'Extract text from Word doc', accept: '.docx' },
  { from: 'PNG', to: 'JPG', id: 'image-convert', desc: 'Convert PNG to JPEG', accept: '.png', extra: { targetFormat: 'jpg' } },
  { from: 'JPG', to: 'PNG', id: 'image-convert', desc: 'Convert JPEG to PNG', accept: '.jpg,.jpeg', extra: { targetFormat: 'png' } },
  { from: 'WEBP', to: 'PNG', id: 'image-convert', desc: 'Convert WebP to PNG', accept: '.webp', extra: { targetFormat: 'png' } },
  { from: 'WEBP', to: 'JPG', id: 'image-convert', desc: 'Convert WebP to JPEG', accept: '.webp', extra: { targetFormat: 'jpg' } },
  { from: 'IMG', to: 'PDF', id: 'image-to-pdf', desc: 'Convert images to PDF', accept: '.png,.jpg,.jpeg,.webp', multiple: true },
]

export default function FileConverterPage() {
  const [selectedConversion, setSelectedConversion] = useState(conversions[0])
  const [file, setFile] = useState<File | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const [converting, setConverting] = useState(false)
  const [done, setDone] = useState(false)
  const [extractedText, setExtractedText] = useState<string | null>(null)
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if ((selectedConversion as any).multiple) { setFiles(acceptedFiles); setFile(null) }
    else { setFile(acceptedFiles[0]); setFiles([]) }
    setDone(false)
    setExtractedText(null)
  }, [selectedConversion])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: (selectedConversion as any).multiple || false
  })

  async function convert() {
    const filesToSend = (selectedConversion as any).multiple ? files : (file ? [file] : [])
    if (filesToSend.length === 0) return toast.error('Please upload a file first')

    setConverting(true)
    setExtractedText(null)
    try {
      const formData = new FormData()
      if ((selectedConversion as any).multiple) filesToSend.forEach((f: File) => formData.append('files', f))
      else formData.append('file', filesToSend[0])
      if ((selectedConversion as any).extra) {
        Object.entries((selectedConversion as any).extra).forEach(([k, v]) => formData.append(k, v as string))
      }

      const res = await fetch(`${API}/api/convert/${selectedConversion.id}`, { method: 'POST', body: formData })
      if (!res.ok) { const err = await res.json(); throw new Error(err.message || 'Conversion failed') }

      const contentType = res.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        const data = await res.json()
        if (data.text) {
          setExtractedText(data.text)
          setDone(true)
          toast.success('Text extracted successfully!')
        } else {
          toast.success(data.message || 'Done!')
          setDone(true)
        }
        return
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const disp = res.headers.get('content-disposition')
      a.download = disp?.split('filename=')[1]?.replace(/"/g, '') || `converted.${selectedConversion.to.toLowerCase()}`
      a.click()
      URL.revokeObjectURL(url)
      setDone(true)
      toast.success('Converted and downloaded!')
    } catch (err: any) {
      toast.error(err.message || 'Conversion failed')
    } finally {
      setConverting(false)
    }
  }

  function downloadExtractedText() {
    if (!extractedText) return
    const blob = new Blob([extractedText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'extracted_text.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  function copyExtractedText() {
    if (!extractedText) return
    navigator.clipboard.writeText(extractedText)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className="min-h-screen pt-24 pb-16 grid-pattern">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs mb-4">
            <FileType className="w-3 h-3" /> File Converter — 16+ formats
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">File Converter</h1>
          <p className="text-white/40 text-sm">Convert documents and images instantly. No quality loss.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass rounded-2xl border border-dark-500/40 overflow-hidden">
            <div className="px-4 py-3 border-b border-dark-500/40">
              <h3 className="text-sm font-semibold text-white/70">Select Conversion</h3>
            </div>
            {conversions.map((conv) => (
              <button
                key={`${conv.from}-${conv.to}`}
                onClick={() => { setSelectedConversion(conv); setFile(null); setFiles([]); setDone(false); setExtractedText(null) }}
                className={`w-full text-left px-4 py-3.5 transition-all border-l-2 ${
                  selectedConversion.from === conv.from && selectedConversion.to === conv.to
                    ? 'bg-purple-500/10 border-l-purple-500 text-white'
                    : 'border-l-transparent text-white/50 hover:bg-white/3 hover:text-white/80'
                }`}
              >
                <div className="flex items-center gap-2 text-sm font-medium mb-0.5">
                  <span className="px-1.5 py-0.5 rounded bg-dark-600 text-xs font-mono">{conv.from}</span>
                  <ArrowRight className="w-3 h-3 opacity-40" />
                  <span className="px-1.5 py-0.5 rounded bg-dark-600 text-xs font-mono">{conv.to}</span>
                </div>
                <p className="text-xs text-white/30">{conv.desc}</p>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="glass rounded-2xl border border-purple-500/20 p-5 flex items-center gap-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 rounded-lg bg-dark-600 text-sm font-mono font-bold text-white">{selectedConversion.from}</span>
                <ArrowRight className="w-5 h-5 text-purple-400" />
                <span className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-sm font-mono font-bold text-purple-300">{selectedConversion.to}</span>
              </div>
              <p className="text-sm text-white/50">{selectedConversion.desc}</p>
            </div>

            <div {...getRootProps()} className={`glass rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all ${isDragActive ? 'border-purple-400 bg-purple-500/10' : 'border-dark-500/60 hover:border-purple-500/40 hover:bg-purple-500/5'}`}>
              <input {...getInputProps()} />
              <Upload className="w-10 h-10 text-white/20 mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-purple-400 font-medium">Drop your file here...</p>
              ) : (
                <>
                  <p className="text-white/60 font-medium mb-1">Drag & drop your {selectedConversion.from} file here</p>
                  <p className="text-white/30 text-sm">or click to browse • Max 50MB</p>
                </>
              )}
            </div>

            {(file || files.length > 0) && (
              <div className="glass rounded-xl border border-dark-500/40 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-white/70">Selected File{files.length > 1 ? 's' : ''}</h4>
                  <button onClick={() => { setFile(null); setFiles([]); setDone(false); setExtractedText(null) }} className="text-white/30 hover:text-white/60">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {(files.length > 0 ? files : [file!]).map((f, i) => (
                  <div key={i} className="flex items-center gap-3 py-1.5">
                    <FileType className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-white/70 truncate">{f.name}</span>
                    <span className="text-xs text-white/30 ml-auto">{(f.size / 1024).toFixed(0)} KB</span>
                  </div>
                ))}
              </div>
            )}

            {extractedText && (
              <div className="glass rounded-xl border border-emerald-500/30 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-emerald-400">Extracted Text</h4>
                  <div className="flex gap-2">
                    <button onClick={copyExtractedText} className="p-1.5 text-white/40 hover:text-cyan-400 transition-colors" title="Copy">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button onClick={downloadExtractedText} className="p-1.5 text-white/40 hover:text-emerald-400 transition-colors" title="Download as .txt">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto text-sm text-white/70 whitespace-pre-wrap leading-relaxed bg-black/20 rounded-lg p-3">
                  {extractedText}
                </div>
              </div>
            )}

            <button onClick={convert} disabled={converting || (!file && files.length === 0)}
              className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-base disabled:opacity-50">
              {converting
                ? <><div className="loading-dots"><span></span><span></span><span></span></div> Converting...</>
                : done
                  ? <><CheckCircle className="w-5 h-5 text-emerald-400" /> Converted! Convert Another</>
                  : <><Download className="w-5 h-5" /> Convert & Download</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
