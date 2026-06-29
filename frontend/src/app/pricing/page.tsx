'use client'
import { useState } from 'react'
import { Check, Zap, Star, Shield, X, QrCode } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

const plans = [
  {
    id: 'free', name: 'Free', price: '₹0', period: 'forever',
    badge: null, color: 'border-dark-500/40', headerBg: 'bg-dark-600/50',
    features: [
      { text: '5 AI generations per day', included: true },
      { text: 'Max 5,000 words per generation', included: true },
      { text: 'Basic file conversion', included: true },
      { text: '15 AI writing tools', included: true },
      { text: 'OCR image to text', included: true },
      { text: 'Ads shown', included: false },
      { text: 'Unlimited generations', included: false },
      { text: 'Priority processing', included: false },
    ],
    cta: 'Start Free', ctaHref: '/ai-writer',
    ctaClass: 'btn-secondary w-full py-3 text-center block'
  },
  {
    id: 'premium_monthly', name: 'Premium', price: '₹99', period: 'per month',
    badge: 'Most Popular', color: 'border-cyan-500/40',
    headerBg: 'bg-gradient-to-br from-cyan-500/10 to-blue-500/10',
    priceInPaise: 9900,
    features: [
      { text: 'Unlimited AI generations', included: true },
      { text: 'Unlimited word count', included: true },
      { text: 'Unlimited file conversions', included: true },
      { text: 'Faster AI processing', included: true },
      { text: 'Premium PDF tools', included: true },
      { text: 'No advertisements', included: true },
      { text: 'All 30+ AI tools', included: true },
      { text: 'Priority support', included: true },
    ],
    cta: 'Get Premium — ₹99/mo',
    ctaClass: 'btn-primary w-full py-3 text-center block glow-cyan'
  },
  {
    id: 'premium_lifetime', name: 'Lifetime', price: '₹100', period: 'one-time',
    badge: 'Best Value', color: 'border-purple-500/40',
    headerBg: 'bg-gradient-to-br from-purple-500/10 to-pink-500/10',
    priceInPaise: 10000,
    features: [
      { text: 'Lifetime access forever', included: true },
      { text: 'Unlimited AI generations', included: true },
      { text: 'All future features included', included: true },
      { text: 'No advertisements ever', included: true },
      { text: 'Priority processing', included: true },
      { text: 'Priority support', included: true },
      { text: 'All 30+ AI tools', included: true },
      { text: 'No renewal needed', included: true },
    ],
    cta: 'Get Lifetime — ₹100',
    ctaClass: 'w-full py-3 text-center font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90 transition-opacity block'
  }
]

const UPI_ID = 'princeverma8753-1@oksbi'

export default function PricingPage() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [showUPI, setShowUPI] = useState<string | null>(null)
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  async function handlePayment(planId: string, planName: string) {
    setLoadingPlan(planId)
    try {
      const res = await fetch(`${API}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      })
      const data = await res.json()

      if (data.demo) {
        toast('Demo mode — Add Razorpay keys for real payments', { icon: 'ℹ️' })
        setLoadingPlan(null)
        return
      }

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: 'ProjectX AI Studio',
        description: planName,
        order_id: data.orderId,
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch(`${API}/api/payment/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...response, planId })
            })
            const verifyData = await verifyRes.json()
            if (verifyData.success) {
              localStorage.setItem('px_plan_token', verifyData.planToken)
              window.location.href = '/payment/success?plan=' + planId
            }
          } catch { window.location.href = '/payment/failed' }
        },
        theme: { color: '#06b6d4' },
        modal: { ondismiss: () => { toast.error('Payment cancelled'); setLoadingPlan(null) } }
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (err: any) {
      toast.error(err.message || 'Payment failed')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 grid-pattern">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs mb-4">
            <Star className="w-3 h-3" /> Simple, Transparent Pricing
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Choose Your <span className="gradient-text">Plan</span>
          </h1>
          <p className="text-white/40 max-w-lg mx-auto">
            Start free. Upgrade when you need more. Lifetime access for just ₹100.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan) => (
            <div key={plan.id} className={`glass rounded-2xl border ${plan.color} overflow-hidden relative ${plan.badge === 'Best Value' ? 'md:-mt-4 md:mb-4' : ''}`}>
              {plan.badge && (
                <div className={`text-center py-1.5 text-xs font-semibold ${plan.badge === 'Most Popular' ? 'bg-cyan-500 text-white' : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'}`}>
                  {plan.badge === 'Most Popular' ? '🔥 ' : '⭐ '}{plan.badge}
                </div>
              )}
              <div className={`${plan.headerBg} p-6 border-b border-dark-500/30`}>
                <h2 className="text-xl font-bold text-white mb-1">{plan.name}</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-white/40 text-sm">/{plan.period}</span>
                </div>
              </div>
              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((f) => (
                    <li key={f.text} className="flex items-start gap-3 text-sm">
                      {f.included
                        ? <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        : <X className="w-4 h-4 text-white/20 flex-shrink-0 mt-0.5" />}
                      <span className={f.included ? 'text-white/70' : 'text-white/25 line-through'}>{f.text}</span>
                    </li>
                  ))}
                </ul>

                {plan.id === 'free' ? (
                  <Link href={plan.ctaHref!} className={plan.ctaClass}>{plan.cta}</Link>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => handlePayment(plan.id, plan.name)}
                      disabled={loadingPlan === plan.id}
                      className={`${plan.ctaClass} disabled:opacity-60`}
                    >
                      {loadingPlan === plan.id ? 'Processing...' : plan.cta}
                    </button>
                    <button
                      onClick={() => setShowUPI(showUPI === plan.id ? null : plan.id)}
                      className="w-full py-2 text-xs text-white/40 hover:text-white/60 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <QrCode className="w-3 h-3" /> Pay via UPI / QR Code
                    </button>
                    {showUPI === plan.id && (
                      <div className="mt-3 p-4 rounded-xl bg-white/5 border border-dark-500/40 text-center">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=upi://pay?pa=${UPI_ID}&pn=Prince+Verma&am=${(plan as any).priceInPaise / 100}&cu=INR`}
                          alt="UPI QR Code"
                          className="mx-auto mb-3 rounded-lg"
                          width={140} height={140}
                        />
                        <p className="text-xs text-white/60 mb-1">Scan with any UPI app</p>
                        <p className="text-xs font-mono text-cyan-400 select-all">{UPI_ID}</p>
                        <p className="text-xs text-white/30 mt-2">
                          After payment, send screenshot to:<br />
                          <span className="text-cyan-400">princeverma50055@gmail.com</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: '🔒', text: 'Secure Payments', sub: 'Razorpay & UPI' },
            { icon: '⚡', text: 'Instant Activation', sub: 'Access within minutes' },
            { icon: '⭐', text: 'Lifetime Updates', sub: 'All future features' },
            { icon: '✅', text: 'No Signup Needed', sub: 'Use immediately' },
          ].map((b) => (
            <div key={b.text} className="glass rounded-xl p-4 border border-dark-500/40 text-center">
              <div className="text-2xl mb-2">{b.icon}</div>
              <p className="text-xs font-medium text-white/70">{b.text}</p>
              <p className="text-xs text-white/30 mt-0.5">{b.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
