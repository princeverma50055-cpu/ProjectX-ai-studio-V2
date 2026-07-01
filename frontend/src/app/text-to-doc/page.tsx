'use client'
import { useState } from 'react'
import { Download, FileText, FileType, Sparkles, Copy } from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://projectx-backend-9g80.onrender.com'

const formats = [
  {
    id: 'text-to-beautifulpdf',
    label: '📄 Beautiful PDF',
    desc: 'Professional PDF with header, footer & page numbers',
    ext: 'pdf',
    color: 'border-red-500/40 bg-red-500/5',
    active: 'border-red-500 bg-red-500/15',
    badge: 'Most Popular'
  },
  {
    id: 'text-to-docx',
    label: '📝 Word Document',
    desc: 'Editable .doc file for Microsoft Word',
    ext: 'doc',
    color: 'border-blue-500/40 bg-blue-500/5',
    active: 'border-blue-500 bg-blue-500/15',
    badge: null
  },
]

export default function TextToDocPage() {
  const [text, setText] = useState('')
  const [title, setTitle] = useState('')
  const [selectedFormat, setSelectedFormat] = useState(formats[0])
  const [converting, setConverting] = useState(false)

  async function convert() {
    if (!text.trim()) return toast.error('Please paste or type your text first')

    setConverting(true)
    try {
      const formData = new FormData()
      formData.append('text', text)
      formData.append('title', title || 'Document')

      const res = await fetch(`${API_URL}/api/convert/${selectedFormat.id}`, {
        method: 'POST',
        body: formData
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || 'Conversion failed')
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title || 'document'}.${selectedFormat.ext}`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`Downloaded as .${selectedFormat.ext}!`)
    } catch (err: any) {
      toast.error(err.message || 'Conversion failed')
    } finally {
      setConverting(false)
    }
  }

  function clearAll() {
    setText('')
    setTitle('')
    toast.success('Cleared!')
  }

  function pasteFromClipboard() {
    navigator.clipboard.readText().then(t => {
      setText(t)
      toast.success('Pasted from clipboard!')
    }).catch(() => toast.error('Clipboard access denied'))
  }

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const charCount = text.length

  return (
    <div className="min-h-screen pt-24 pb-16 grid-pattern">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs mb-4">
            <Sparkles className="w-3 h-3" /> Text to Document Converter
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Convert Text to <span className="gradient-text">PDF or DOC</span>
          </h1>
          <p className="text-white/40 text-sm">
            Paste any text, add a title, choose format and download instantly
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: Settings */}
          <div className="space-y-4">

            {/* Format selector */}
            <div className="glass rounded-2xl border border-dark-500/40 p-5">
              <h3 className="text-sm font-semibold text-white/70 mb-3">Choose Format</h3>
              <div className="space-y-3">
                {formats.map(format => (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      selectedFormat.id === format.id ? format.active : format.color
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-white">{format.label}</span>
                      {format.badge && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/20">
                          {format.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-white/40">{format.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Title input */}
            <div className="glass rounded-2xl border border-dark-500/40 p-5">
              <h3 className="text-sm font-semibold text-white/70 mb-3">Document Title</h3>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Enter document title..."
                className="w-full px-4 py-3 glass rounded-xl border border-dark-500/40 text-white placeholder-white/20 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>

            {/* Stats */}
            {text && (
              <div className="glass rounded-2xl border border-dark-500/40 p-5">
                <h3 className="text-sm font-semibold text-white/70 mb-3">Document Stats</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-cyan-400">{wordCount}</p>
                    <p className="text-xs text-white/30">Words</p>
                  </div>
                  <div className="glass rounded-xl p-3 text-center">
                    <p className="text-lg font-bold text-purple-400">{charCount}</p>
                    <p className="text-xs text-white/30">Characters</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Text input */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass rounded-2xl border border-dark-500/40 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white/70">Your Text</h3>
                <div className="flex gap-2">
                  <button
                    onClick={pasteFromClipboard}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg glass border border-dark-500/40 text-white/50 hover:text-cyan-400 transition-colors"
                  >
                    <Copy className="w-3 h-3" /> Paste
                  </button>
                  <button
                    onClick={clearAll}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg glass border border-dark-500/40 text-white/50 hover:text-red-400 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Paste or type your text here...

You can paste anything:
• Blog posts
• Articles
• Notes
• Reports
• Essays
• Any text content"
                className="w-full min-h-[400px] p-4 glass rounded-xl border border-dark-500/50 text-white placeholder-white/20 text-sm leading-relaxed focus:outline-none focus:border-cyan-500/50 transition-colors resize-y"
                style={{ background: 'rgba(13,17,23,0.8)' }}
              />
            </div>

            {/* Convert button */}
            <button
              onClick={convert}
              disabled={converting || !text.trim()}
              className="w-full py-4 flex items-center justify-center gap-3 text-base font-semibold rounded-xl text-white disabled:opacity-50 transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)' }}
            >
              {converting ? (
                <>
                  <div className="loading-dots"><span></span><span></span><span></span></div>
                  Converting...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Download as {selectedFormat.label}
                </>
              )}
            </button>

            {/* Tips */}
            <div className="glass rounded-xl border border-dark-500/40 p-4">
              <h4 className="text-xs font-semibold text-white/50 mb-2">💡 Tips</h4>
              <ul className="text-xs text-white/30 space-y-1">
                <li>• Use blank lines to separate paragraphs in your PDF</li>
                <li>• Add a clear title for professional-looking documents</li>
                <li>• PDF format includes header, footer & page numbers automatically</li>
                <li>• DOC format can be edited in Microsoft Word or Google Docs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
