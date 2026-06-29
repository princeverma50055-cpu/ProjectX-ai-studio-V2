'use client'
import Link from 'next/link'
import { Zap, Twitter, Linkedin, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-dark-500/40 bg-dark-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg">
                <span className="gradient-text-cyan">ProjectX</span>
                <span className="text-white/80"> AI Studio</span>
              </span>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed mb-5 max-w-xs">
              Premium AI writing tools, document conversion, PDF utilities and OCR — free, no signup required.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: <Twitter className="w-3.5 h-3.5" />, href: 'https://twitter.com' },
                { icon: <Linkedin className="w-3.5 h-3.5" />, href: 'https://linkedin.com/in/prince-verma-2b100240a' },
                { icon: <Mail className="w-3.5 h-3.5" />, href: 'mailto:princeverma50055@gmail.com' },
              ].map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg glass flex items-center justify-center text-white/40 hover:text-cyan-400 transition-colors">
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white/80 mb-4">AI Tools</h4>
            <ul className="space-y-2.5">
              {[['AI Writer', '/ai-writer'], ['AI Chat', '/extra-tools?tool=ai_chat'], ['Code Generator', '/extra-tools?tool=code_generator'], ['Keyword Generator', '/extra-tools?tool=keyword_generator']].map(([label, href]) => (
                <li key={label}><Link href={href} className="text-sm text-white/40 hover:text-cyan-400 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white/80 mb-4">Document Tools</h4>
            <ul className="space-y-2.5">
              {[['File Converter', '/file-converter'], ['PDF Tools', '/pdf-tools'], ['OCR Tools', '/ocr'], ['Pricing', '/pricing']].map(([label, href]) => (
                <li key={label}><Link href={href} className="text-sm text-white/40 hover:text-cyan-400 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-dark-500/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">© 2026 ProjectX AI Studio by Prince Verma. All rights reserved.</p>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            All Systems Operational
          </span>
        </div>
      </div>
    </footer>
  )
}
