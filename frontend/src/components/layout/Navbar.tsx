'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Menu, X, Sun, Moon, Zap, ChevronDown } from 'lucide-react'

const navLinks = [
  { label: 'AI Writer', href: '/ai-writer', dropdown: [
    { label: 'Blog Writer', href: '/ai-writer?tool=blog_writer' },
    { label: 'SEO Article', href: '/ai-writer?tool=seo_article' },
    { label: 'Email Writer', href: '/ai-writer?tool=email_writer' },
    { label: 'Resume Writer', href: '/ai-writer?tool=resume_writer' },
    { label: 'YouTube Script', href: '/ai-writer?tool=youtube_script' },
  ]},
  { label: 'File Converter', href: '/file-converter', dropdown: [
    { label: 'File Converter', href: '/file-converter' },
    { label: 'Text to PDF / DOC', href: '/text-to-doc' },
  ]},
  { label: 'PDF Tools', href: '/pdf-tools' },
  { label: 'OCR', href: '/ocr' },
  { label: 'Extra Tools', href: '/extra-tools', dropdown: [
    { label: 'AI Chat', href: '/extra-tools?tool=ai_chat' },
    { label: 'Code Generator', href: '/extra-tools?tool=code_generator' },
    { label: 'Keyword Generator', href: '/extra-tools?tool=keyword_generator' },
    { label: 'FAQ Generator', href: '/extra-tools?tool=faq_generator' },
  ]},
  { label: 'Pricing', href: '/pricing' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass border-b border-dark-500/40 py-3' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-lg">
            <span className="gradient-text-cyan">ProjectX</span>
            <span className="text-white/80 font-medium"> AI Studio</span>
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <div key={link.label} className="relative"
              onMouseEnter={() => (link as any).dropdown && setActiveDropdown(link.label)}
              onMouseLeave={() => setActiveDropdown(null)}>
              <Link href={link.href} className="flex items-center gap-1 px-3 py-2 text-sm text-white/70 hover:text-white rounded-lg hover:bg-white/5 transition-all">
                {link.label}
                {(link as any).dropdown && <ChevronDown className="w-3 h-3 opacity-60" />}
              </Link>
              {(link as any).dropdown && activeDropdown === link.label && (
                <div className="absolute top-full left-0 mt-1 w-52 glass rounded-xl border border-dark-500/50 overflow-hidden shadow-xl">
                  {(link as any).dropdown.map((item: any) => (
                    <Link key={item.label} href={item.href} className="block px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link href="/pricing" className="btn-primary text-sm py-2 px-5 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" /> Upgrade — ₹99
          </Link>
        </div>

        <div className="lg:hidden flex items-center gap-2">
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-lg text-white/60">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-lg text-white/70">
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden glass border-t border-dark-500/40 mt-3">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <div key={link.label}>
                <Link href={link.href} className="block px-4 py-3 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors" onClick={() => setIsOpen(false)}>
                  {link.label}
                </Link>
                {(link as any).dropdown && (
                  <div className="ml-4 space-y-1">
                    {(link as any).dropdown.map((item: any) => (
                      <Link key={item.label} href={item.href} className="block px-4 py-2 text-xs text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-colors" onClick={() => setIsOpen(false)}>
                        → {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-3 border-t border-dark-500/40">
              <Link href="/pricing" className="btn-primary w-full text-center text-sm py-2.5 block" onClick={() => setIsOpen(false)}>
                ⚡ Upgrade — ₹99/mo
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
