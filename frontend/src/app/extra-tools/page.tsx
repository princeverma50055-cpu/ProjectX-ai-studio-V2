'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Zap, Copy, Download, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

const extraTools = [
  { id: 'ai_chat', label: '💬 AI Chat', desc: 'Chat with AI assistant', placeholder: 'Ask me anything...', isChat: true },
  { id: 'code_generator', label: '💻 Code Generator', desc: 'Generate production-ready code', placeholder: 'Describe what code you need (e.g., "Python script to send emails via Gmail API")' },
  { id: 'image_prompt', label: '🎨 Image Prompt Generator', desc: 'Create detailed AI image prompts', placeholder: 'Describe the image (e.g., "futuristic city at night with neon lights")' },
  { id: 'title_generator', label: '🏷️ Title Generator', desc: 'Generate click-worthy titles', placeholder: 'Describe your content (e.g., "blog post about AI tools for entrepreneurs")' },
  { id: 'keyword_generator', label: '🔑 Keyword Generator', desc: 'Generate SEO keywords', placeholder: 'Enter your topic (e.g., "digital marketing for small businesses in India")' },
  { id: 'meta_description', label: '📋 Meta Description', desc: 'Write SEO meta descriptions', placeholder: 'Describe your webpage (e.g., "AI writing tool homepage offering blog writer, SEO articles")' },
  { id: 'faq_generator', label: '❓ FAQ Generator', desc: 'Generate FAQs with schema markup', placeholder: 'Enter your product/topic (e.g., "ProjectX AI Studio - AI writing and document tool")' },
]

function ExtraToolsContent() {
  const searchParams = useSearchParams()
  const [selectedTool, setSelectedTool] = useState(extraTools[0])
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<{ role: string; text: string }[]>([])
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  useEffect(() => {
    const toolId = searchParams.get('tool')
    if (toolId) {
      const found = extraTools.find(t => t.id === toolId)
      if (found) setSelectedTool(found)
    }
  }, [searchParams])

  async function generate() {
    if (!input.trim()) return toast.error('Please enter a prompt')
    setLoading(true)
    try {
      if (selectedTool.isChat) {
        const newHistory = [...chatHistory, { role: 'user', text: input }]
        setChatHistory(newHistory); setInput('')
        const res = await fetch(`${API}/api/ai/chat`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: input })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message)
        setChatHistory([...newHistory, { role: 'assistant', text: data.response }])
      } else {
        const res = await fetch(`${API}/api/ai/generate`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ toolType: selectedTool.id, input })
        })
        const data = await res.json()
        if (!res.ok) {
          if (res.status === 429) return toast.error('Daily limit reached! Upgrade to Premium.')
          throw new Error(data.message)
        }
        setOutput(data.result)
        toast.success('Generated!')
      }
    } catch (err: any) {
      toast.error(err.message || 'Generation failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 grid-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Extra AI Tools</h1>
          <p className="text-white/40 text-sm">AI Chat, Code Generator, SEO Tools & more</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass rounded-2xl border border-dark-500/40 overflow-hidden">
            <div className="px-4 py-3 border-b border-dark-500/40">
              <h3 className="text-sm font-semibold text-white/70">Select Tool</h3>
            </div>
            {extraTools.map((tool) => (
              <button key={tool.id} onClick={() => { setSelectedTool(tool); setOutput(''); setChatHistory([]) }}
                className={`w-full text-left px-4 py-3.5 transition-all border-l-2 ${selectedTool.id === tool.id ? 'bg-indigo-500/10 border-l-indigo-500 text-white' : 'border-l-transparent text-white/50 hover:bg-white/3 hover:text-white/80'}`}>
                <div className="text-sm font-medium mb-0.5">{tool.label}</div>
                <p className="text-xs text-white/30">{tool.desc}</p>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2 space-y-4">
            {selectedTool.isChat ? (
              <div className="glass rounded-2xl border border-dark-500/40 p-5 flex flex-col min-h-[500px]">
                <div className="flex-1 space-y-4 mb-4 overflow-y-auto max-h-[400px]">
                  {chatHistory.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-40 gap-3 text-center">
                      <MessageSquare className="w-10 h-10 text-white/10" />
                      <p className="text-sm text-white/20">Start a conversation with AI</p>
                    </div>
                  )}
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-cyan-500/20 text-white border border-cyan-500/20' : 'glass text-white/80 border border-dark-500/40'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {loading && <div className="flex justify-start"><div className="glass px-4 py-3 rounded-2xl border border-dark-500/40"><div className="loading-dots"><span></span><span></span><span></span></div></div></div>}
                </div>
                <div className="flex gap-3 border-t border-dark-500/40 pt-4">
                  <input type="text" value={input} onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && generate()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 glass rounded-xl border border-dark-500/50 text-white placeholder-white/20 text-sm focus:outline-none focus:border-cyan-500/50" />
                  <button onClick={generate} disabled={loading || !input.trim()} className="btn-primary px-5 disabled:opacity-50">
                    <Zap className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="glass rounded-2xl border border-dark-500/40 p-5">
                  <h3 className="text-sm font-semibold text-white mb-3">{selectedTool.label}</h3>
                  <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={selectedTool.placeholder} className="ai-textarea min-h-[120px]" />
                  <div className="flex justify-end mt-3">
                    <button onClick={generate} disabled={loading || !input.trim()} className="btn-primary flex items-center gap-2 text-sm py-2.5 px-6 disabled:opacity-50">
                      {loading ? <><div className="loading-dots"><span></span><span></span><span></span></div> Generating...</> : <><Zap className="w-3.5 h-3.5" /> Generate</>}
                    </button>
                  </div>
                </div>
                <div className="glass rounded-2xl border border-dark-500/40 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white">Output</h3>
                    {output && (
                      <div className="flex gap-2">
                        <button onClick={() => { navigator.clipboard.writeText(output); toast.success('Copied!') }} className="p-1.5 text-white/30 hover:text-cyan-400 transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                        <button onClick={() => { const blob = new Blob([output], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${selectedTool.id}.txt`; a.click() }} className="p-1.5 text-white/30 hover:text-emerald-400 transition-colors"><Download className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
                  </div>
                  <div className="min-h-[300px]">
                    {output
                      ? <div className="whitespace-pre-wrap text-sm text-white/80 leading-relaxed font-mono">{output}</div>
                      : <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-3 text-center"><div className="text-4xl opacity-20">✨</div><p className="text-sm text-white/20">Output will appear here</p></div>}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ExtraToolsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 flex items-center justify-center text-white/50">Loading...</div>}>
      <ExtraToolsContent />
    </Suspense>
  )
}
