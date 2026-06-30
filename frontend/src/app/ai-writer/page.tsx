'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://projectx-backend-9g80.onrender.com'

const tools = [
  { id: 'blog_writer', label: '📝 Blog Writer', placeholder: 'Enter blog topic...' },
  { id: 'seo_article', label: '🔍 SEO Article', placeholder: 'Enter SEO topic...' },
  { id: 'essay', label: '📄 Essay Writer', placeholder: 'Enter essay topic...' },
  { id: 'story', label: '📖 Story Writer', placeholder: 'Describe story...' },
  { id: 'youtube_script', label: '🎬 YouTube Script', placeholder: 'Enter video topic...' },
  { id: 'email_writer', label: '✉️ Email Writer', placeholder: 'Enter email purpose...' },
  { id: 'resume_writer', label: '👔 Resume Writer', placeholder: 'Enter details...' },
  { id: 'cover_letter', label: '📋 Cover Letter', placeholder: 'Enter job info...' },
  { id: 'product_description', label: '🛍️ Product Description', placeholder: 'Describe product...' },
  { id: 'social_media_caption', label: '📱 Social Caption', placeholder: 'Enter post idea...' },
  { id: 'rewrite_content', label: '🔄 Rewrite Content', placeholder: 'Paste content...' },
  { id: 'grammar_checker', label: '✅ Grammar Checker', placeholder: 'Paste text...' },
  { id: 'summarizer', label: '📌 Summarizer', placeholder: 'Paste text...' },
  { id: 'translator', label: '🌐 Translator', placeholder: 'Enter text...' },
  { id: 'humanize_ai', label: '🧠 Humanize AI Text', placeholder: 'Paste AI text...' },
]

function AIWriterContent() {
  const searchParams = useSearchParams()
  const [selectedTool, setSelectedTool] = useState(tools[0])
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    const toolId = searchParams.get('tool')
    const found = tools.find(t => t.id === toolId)
    if (found) setSelectedTool(found)
  }, [searchParams])

  async function generate() {
    if (!input.trim()) {
      toast.error('Please enter prompt')
      return
    }

    setLoading(true)
    setOutput('')

    try {
      let res = await fetch(`${API_URL}/api/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolType: selectedTool.id,
          input: input.trim()
        })
      })

      let contentType = res.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        // Backend cold-starting on Render free tier, wait & retry once
        await new Promise(resolve => setTimeout(resolve, 5000))
        res = await fetch(`${API_URL}/api/ai/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            toolType: selectedTool.id,
            input: input.trim()
          })
        })
      }

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.message || 'Request failed')
      }

      const finalOutput = data.result || data.text || data.message || data.content || JSON.stringify(data)

      setOutput(finalOutput)
      setRemaining(data.remainingGenerations ?? null)
      toast.success('Generated successfully!')
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Failed to fetch')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">AI Writer</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass p-4 rounded-xl">
            {tools.map(tool => (
              <button
                key={tool.id}
                onClick={() => { setSelectedTool(tool); setOutput('') }}
                className={`w-full text-left p-2 rounded ${selectedTool.id === tool.id ? 'bg-cyan-500/20 text-white' : 'text-white/50'}`}
              >
                {tool.label}
              </button>
            ))}
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="glass p-4 rounded-xl">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={selectedTool.placeholder}
                className="w-full h-32 p-3 bg-black/30 text-white rounded border border-white/10"
              />
              <button
                onClick={generate}
                disabled={loading}
                className="mt-3 px-4 py-2 bg-cyan-500 text-black rounded font-bold hover:bg-cyan-400 disabled:opacity-50"
              >
                {loading ? 'Generating...' : 'Generate'}
              </button>
            </div>

            <div className="glass p-4 rounded-xl min-h-[200px] text-white/80 whitespace-pre-wrap">
              {loading ? <p>Generating...</p> : output ? <div className="prose prose-invert max-w-none">{output}</div> : <p>No output yet</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AIWriterPage() {
  return (
    <Suspense fallback={<div className="text-white">Loading...</div>}>
      <AIWriterContent />
    </Suspense>
  )
}
