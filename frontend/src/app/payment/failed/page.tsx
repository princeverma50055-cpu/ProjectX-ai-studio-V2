'use client'
import Link from 'next/link'
import { XCircle, RefreshCw, Mail } from 'lucide-react'

export default function PaymentFailed() {
  return (
    <div className="min-h-screen pt-24 flex items-center justify-center px-4">
      <div className="glass rounded-3xl border border-red-500/30 p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Payment Failed</h1>
        <p className="text-white/50 mb-2">No money was deducted. Please try again.</p>
        <p className="text-sm text-white/30 mb-8">Or pay directly via UPI: <span className="text-cyan-400">princeverma8753-1@oksbi</span></p>
        <div className="space-y-3">
          <Link href="/pricing" className="btn-primary w-full flex items-center justify-center gap-2 py-3">
            <RefreshCw className="w-4 h-4" /> Try Again
          </Link>
          <a href="mailto:princeverma50055@gmail.com?subject=Payment Issue"
            className="btn-secondary w-full py-3 text-center flex items-center justify-center gap-2">
            <Mail className="w-4 h-4" /> Contact Support
          </a>
        </div>
      </div>
    </div>
  )
}
