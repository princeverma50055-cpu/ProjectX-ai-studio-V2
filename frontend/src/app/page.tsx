'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Zap, Search, ArrowRight, CheckCircle, Star, Shield, Clock, Sparkles, ChevronDown } from 'lucide-react'

const stats = [
  { value: '15,800+', label: 'AI Generations' },
  { value: '8,200+', label: 'Files Converted' },
  { value: '30+', label: 'AI Tools' },
  { value: '100%', label: 'Free to Start' },
]

const tools = [
  { icon: '✍️', name: 'AI Writer', desc: '15 writing tools — blogs, emails, scripts, resumes & more', href: '/ai-writer', color: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/20', badge: 'Popular' },
  { icon: '🔄', name: 'File Converter', desc: 'Convert 16+ file formats instantly', href: '/file-converter', color: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/20' },
  { icon: '📄', name: 'PDF Tools', desc: 'Merge, split, compress, rotate, watermark & more', href: '/pdf-tools', color: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/20' },
  { icon: '👁️', name: 'OCR Tool', desc: 'Extract text from images & PDFs. 12+ languages', href: '/ocr', color: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/20' },
  { icon: '💻', name: 'Code Generator', desc: 'Generate clean production-ready code instantly', href: '/extra-tools?tool=code_generator', color: 'from-indigo-500/20 to-blue-500/20', border: 'border-indigo-500/20' },
  { icon: '🔑', name: 'Keyword Generator', desc: 'SEO keywords, long-tail & LSI keywords', href: '/extra-tools?tool=keyword_generator', color: 'from-rose-500/20 to-red-500/20', border: 'border-rose-500/20' },
]

const writingTools = ['Blog Writer','SEO Article','Essay Writer','YouTube Script','Email Writer','Resume Writer','Cover Letter','Story Writer','Product Description','Social Media Caption','Grammar Checker','Summarizer','Translator','Humanize AI','Rewrite Content']

const faqs = [
  { q: 'Do I need to create an account?', a: 'No. Use all tools instantly without any signup, account, or email verification.' },
  { q: 'What is the free plan limit?', a: 'Free plan: 5 AI generations/day, max 5000 words each. Upgrade for unlimited.' },
  { q: 'How does payment work?', a: 'Razorpay (UPI, cards, net banking) or direct UPI: princeverma8753-1@oksbi. Premium Monthly ₹99, Lifetime ₹100.' },
  { q: 'Which AI model is used?', a: 'Google Gemini Pro as primary, OpenAI GPT-3.5 as fallback for best quality.' },
  { q: 'Are uploaded files secure?', a: 'Files are processed and auto-deleted immediately after conversion. Never stored.' },
  { q: 'What formats are supported?', a: 'PDF, DOCX, TXT, PNG, JPG, WEBP, CSV, XLSX, EPUB, HTML, Markdown, PPT and more.' },
]

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [typedText, setTypedText] = useState('')
  const phrases = ['Blog Posts', 'SEO Articles', 'YouTube Scripts', 'Cover Letters', 'AI Code', 'Product Descriptions']
  const [phraseIndex, setPhraseIndex] = useState(0)

  useEffect(() => {
    let i = 0
    let currentPhrase = phrases[phraseIndex]
    let isDeleting = false

    const interval = setInterval(() => {
      if (!isDeleting && i <= currentPhrase.length) {
        setTypedText(currentPhrase.slice(0, i))
        i++
        if (i > currentPhrase.length) setTimeout(() => { isDeleting = true }, 1500)
      } else if (isDeleting) {
        setTypedText(currentPhrase.slice(0, i))
        i--
        if (i < 0) {
          isDeleting = false
          setPhraseIndex(prev => (prev + 1) % phrases.length)
          currentPhrase = phrases[(phraseIndex + 1) % phrases.length]
          i = 0
        }
      }
    }, 80)
    return () => clearInterval(interval)
  }, [phraseIndex])

  const filteredTools = tools.filter(t => !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.desc.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden grid-pattern">
        <div className="orb w-96 h-96 bg-cyan-500" style={{top:'-10rem',left:'-10rem'}}></div>
        <div className="orb w-80 h-80 bg-purple-600" style={{bottom:'-10rem',right:'-10rem'}}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-cyan-500/20 text-xs text-cyan-400 font-medium mb-8">
            <Sparkles className="w-3 h-3" />
            Powered by Gemini Pro & GPT-3.5 — No Signup Required
            <Sparkles className="w-3 h-3" />
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="text-white">Generate</span><br />
            <span className="gradient-text">
              {typedText || '\u00A0'}
              <span className="animate-pulse text-cyan-400">|</span>
            </span><br />
            <span className="text-white">with AI</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            30+ AI tools for writing, document conversion, PDF editing & OCR.<br />
            <strong className="text-white/70">Free to use. No login. Instant access.</strong>
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/ai-writer" className="btn-primary flex items-center gap-2 text-base px-8 py-4 glow-cyan">
              <Zap className="w-4 h-4" /> Start Writing Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/pricing" className="btn-secondary flex items-center gap-2 text-base px-8 py-4">
              Premium — ₹99/mo or ₹100 Lifetime
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="glass rounded-xl p-4 border border-dark-500/40">
                <div className="text-2xl font-bold gradient-text-cyan">{stat.value}</div>
                <div className="text-xs text-white/40 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="py-8 border-y border-dark-500/30 bg-dark-800/30">
        <div className="max-w-2xl mx-auto px-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search AI tools, converters, PDF utilities..."
              className="w-full pl-11 pr-4 py-4 glass rounded-2xl border border-dark-500/50 text-white placeholder-white/30 text-sm focus:outline-none focus:border-cyan-500/50 transition-colors" />
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Everything You Need, <span className="gradient-text">In One Place</span></h2>
          <p className="text-white/40 max-w-xl mx-auto">No switching between tools. No subscriptions needed. Just open and use.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTools.map((tool) => (
            <Link key={tool.name} href={tool.href} className={`tool-card glass rounded-2xl p-6 border ${tool.border} bg-gradient-to-br ${tool.color} relative overflow-hidden group`}>
              {tool.badge && <span className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-medium border border-cyan-500/20">{tool.badge}</span>}
              <div className="text-3xl mb-4">{tool.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{tool.name}</h3>
              <p className="text-sm text-white/50 leading-relaxed mb-4">{tool.desc}</p>
              <div className="flex items-center gap-1 text-cyan-400 text-sm font-medium group-hover:gap-2 transition-all">
                Open Tool <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Writing Tools */}
      <section className="py-16 bg-dark-800/30 border-y border-dark-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">15 AI Writing Tools — <span className="gradient-text-cyan">All Free</span></h2>
            <p className="text-white/40 text-sm">5 generations/day on free plan • Unlimited on Premium</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {writingTools.map((tool) => (
              <Link key={tool} href={`/ai-writer?tool=${tool.toLowerCase().replace(/ /g, '_')}`}
                className="glass rounded-xl px-4 py-3 text-sm text-white/60 hover:text-white hover:border-cyan-500/40 border border-dark-500/40 transition-all text-center hover:bg-cyan-500/5">
                {tool}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: <Shield className="w-6 h-6" />, title: 'No Signup Required', desc: 'Start using all tools immediately. No account, no email, no verification needed.', color: 'text-cyan-400' },
            { icon: <Zap className="w-6 h-6" />, title: 'AI-Powered Quality', desc: 'Google Gemini Pro + OpenAI GPT-3.5 ensure the best output quality every time.', color: 'text-purple-400' },
            { icon: <Clock className="w-6 h-6" />, title: 'Instant Processing', desc: 'Files processed instantly. Outputs generated in seconds. No waiting, no queues.', color: 'text-emerald-400' },
          ].map((f) => (
            <div key={f.title} className="glass rounded-2xl p-6 border border-dark-500/40 text-center">
              <div className={`inline-flex w-12 h-12 rounded-xl bg-dark-600 items-center justify-center mb-4 ${f.color}`}>{f.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-16 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 border-y border-dark-500/30">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs mb-6">
            <Star className="w-3 h-3" /> Best Deal
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Premium Lifetime at Just <span className="gradient-text">₹100</span></h2>
          <p className="text-white/50 mb-8">One-time payment. Unlimited AI forever. No monthly bills. No ads.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pricing" className="btn-primary px-8 py-3 flex items-center justify-center gap-2">
              <Zap className="w-4 h-4" /> Get Lifetime for ₹100
            </Link>
            <Link href="/pricing" className="btn-secondary px-8 py-3">View All Plans</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="glass rounded-xl border border-dark-500/40 overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left text-sm font-medium text-white hover:text-cyan-400 transition-colors">
                {faq.q}
                <ChevronDown className={`w-4 h-4 text-white/30 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && <div className="px-6 pb-4 text-sm text-white/50 leading-relaxed border-t border-dark-500/30 pt-4">{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 relative overflow-hidden">
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Start Creating with AI <span className="gradient-text">Right Now</span></h2>
          <p className="text-white/40 mb-8">No signup. No credit card. No limits on getting started.</p>
          <Link href="/ai-writer" className="btn-primary text-base px-10 py-4 inline-flex items-center gap-2">
            <Zap className="w-4 h-4" /> Open AI Writer — It's Free
          </Link>
        </div>
      </section>
    </div>
  )
}
