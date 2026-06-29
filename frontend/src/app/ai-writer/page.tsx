'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Zap, Copy, Download, RefreshCw, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

const tools = [
  { id: 'blog_writer', label: '📝 Blog Writer', placeholder: 'Enter your blog topic (e.g., "10 tips for remote work productivity in 2026")' },
  { id: 'seo_article', label: '🔍 SEO Article', placeholder: 'Enter topic and target keyword (e.g., "best AI tools for small business, keyword: AI tools")' },
  { id: 'essay', label: '📄 Essay Writer', placeholder: 'Enter essay topic (e.g., "Climate change impacts on developing nations - argumentative essay")' },
  { id: 'story', label: '📖 Story Writer', placeholder: 'Describe your story idea (e.g., "A detective in 2090 Tokyo solving crimes using AI")' },
  { id: 'youtube_script', label: '🎬 YouTube Script', placeholder: 'Enter video topic (e.g., "How to start dropshipping in 2026 - for beginners")' },
  { id: 'email_writer', label: '✉️ Email Writer', placeholder: 'Describe the email purpose (e.g., "Follow-up email to client after proposal, professional tone")' },
  { id: 'resume_writer', label: '👔 Resume Writer', placeholder: 'Enter your role (e.g., "Digital Marketing Manager, 5 years experience, skills: SEO, PPC")' },
  { id: 'cover_letter', label: '📋 Cover Letter', placeholder: 'Describe the job (e.g., "Software Engineer at Google, 3 years Python experience")' },
  { id: 'product_description', label: '🛍️ Product Description', placeholder: 'Describe your product (e.g., "Noise-cancelling earbuds, 30hr battery, premium sound, ₹2999")' },
  { id: 'social_media_caption', label: '📱 Social Media Caption', placeholder: 'Describe what you want to post (e.g., "Launching my new AI automation service")' },
  { id: 'rewrite_content', label: '🔄 Rewrite Content', placeholder: 'Paste the content you want rewritten...' },
  { id: 'grammar_checker', label: '✅ Grammar Checker', placeholder: 'Paste your text to check grammar and spelling...' },
  { id: 'summarizer', label: '📌 Summarizer', placeholder: 'Paste the text you want summarized...' },
  { id: 'translator', label: '🌐 Translator', placeholder: 'Enter text and target language (e.g., "Translate to Hindi: Hello, how are you?")' },
  { id: 'humanize_ai', label: '🧠 Humanize AI Text', placeholder: 'Paste AI-generated text to make it sound human...' },
]

function AIWriterContent() {
  const searchParams = useSearchParams()
  const [selectedTool, setSelectedTool] = useState(tools[0])
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [remaining, setRemaining] = useState<number | null>(null)
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  useEffect(() => {
    const toolId = searchParams.get('tool')
    if (toolId) {
      const found = tools.find(t => t.id === toolId)
      if (found) setSelectedTool(found)
    }
  }, [searchParams])

  useEffect(() => {
    setWordCount(output ? output.trim().split(/\s+/).filter(Boolean).length : 0)
  }, [output])

  async function generate() {
    if (!input.trim()) return toast.error('Please enter a prompt first')
    setLoading(true)
    setOutput('')
    try {
      const res = await fetch(`${API}/api/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolType: selectedTool.id, input: input.trim() })
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 429) return toast.error('Daily limit reached! Upgrade to Premium.')
        throw new Error(data.message || 'Generation failed')
      }
      setOutput(data.result)
      if (data.remainingGenerations !== null) setRemaining(data.remainingGenerations)
      toast.success('Generated successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 grid-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">AI Content Generator</h1>
          <p className="text-white/40 text-sm">{remaining !== null ? `${remaining} generations remaining today` : '5 free generations per day'}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass rounded-2xl border border-dark-500/40 overflow-hidden">
            <div className="px-4 py-3 border-b border-dark-500/40">
              <h3 className="text-sm font-semibold text-white/70">Select Tool</h3>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              {tools.map((tool) => (
                <button key={tool.id} onClick={() => { setSelectedTool(tool); setOutput('') }}
                  className={`w-full text-left px-4 py-3 text-sm transition-all border-l-2 ${selectedTool.id === tool.id ? 'bg-cyan-500/10 border-l-cyan-500 text-white' : 'border-l-transparent text-white/50 hover:bg-white/3 hover:text-white/80'}`}>
                  {tool.label}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="glass rounded-2xl border border-dark-500/40 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Your Prompt</h3>
                <span className="text-xs text-white/30">{input.length} chars</span>
              </div>
              <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={selectedTool.placeholder}
                className="ai-textarea min-h-[140px]"
                onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) generate() }} />
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-white/30">⌘ + Enter to generate</span>
                <button onClick={generate} disabled={loading || !input.trim()}
                  className="btn-primary flex items-center gap-2 text-sm py-2.5 px-6 disabled:opacity-50">
                  {loading ? <><div className="loading-dots"><span></span><span></span><span></span></div> Generating...</> : <><Zap className="w-3.5 h-3.5" /> Generate</>}
                </button>
              </div>
            </div>

            <div className="glass rounded-2xl border border-dark-500/40 p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-white">Generated Output</h3>
                  {wordCount > 0 && <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{wordCount} words</span>}
                </div>
                {output && (
                  <div className="flex gap-2">
                    <button onClick={() => setOutput('')} className="p-1.5 text-white/30 hover:text-white transition-colors"><RefreshCw className="w-3.5 h-3.5" /></button>
                    <button onClick={() => { navigator.clipboard.writeText(output); toast.success('Copied!') }} className="p-1.5 text-white/30 hover:text-cyan-400 transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                    <button onClick={() => {
                      const blob = new Blob([output], { type: 'text/plain' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url; a.download = `${selectedTool.id}.txt`; a.click()
                      toast.success('Downloaded!')
                    }} className="p-1.5 text-white/30 hover:text-emerald-400 transition-colors"><Download className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              </div>
              <div className="min-h-[300px]">
                {loading && <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-4"><div className="loading-dots"><span></span><span></span><span></span></div><p className="text-sm text-white/30">Generating your content...</p></div>}
                {!loading && output && <div className="whitespace-pre-wrap text-sm text-white/80 leading-relaxed font-mono">{output}</div>}
                {!loading && !output && <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-3 text-center"><div className="text-4xl opacity-20">✨</div><p className="text-sm text-white/20">Your AI-generated content will appear here</p></div>}
              </div>
            </div>

            {remaining !== null && remaining <= 2 && (
              <div className="glass rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <div>
                    <p className="text-sm font-medium text-white">{remaining} generations left today</p>
                    <p className="text-xs text-white/40">Upgrade for unlimited access</p>
                  </div>
                </div>
                <Link href="/pricing" className="btn-primary text-xs py-2 px-4 whitespace-nowrap">Upgrade ₹99</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AIWriterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 flex items-center justify-center text-white/50">Loading...</div>}>
      <AIWriterContent />
    </Suspense>
  )
}
