'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Zap, ArrowRight } from 'lucide-react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan')
  return (
    <div className="min-h-screen pt-24 flex items-center justify-center px-4">
      <div className="glass rounded-3xl border border-emerald-500/30 p-10 max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Payment Successful!</h1>
        <p className="text-white/50 mb-2">
          {plan === 'premium_lifetime' ? '🎉 You now have Lifetime Access!' : '🚀 Premium Monthly activated!'}
        </p>
        <p className="text-sm text-white/30 mb-8">Start using unlimited AI tools right now.</p>
        <div className="space-y-3">
          <Link href="/ai-writer" className="btn-primary w-full flex items-center justify-center gap-2 py-3">
            <Zap className="w-4 h-4" /> Start Using AI Writer <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/" className="btn-secondary w-full py-3 text-center block">Back to Home</Link>
        </div>
        <p className="text-xs text-white/20 mt-6">Support: princeverma50055@gmail.com</p>
      </div>
    </div>
  )
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 flex items-center justify-center text-white/50">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
