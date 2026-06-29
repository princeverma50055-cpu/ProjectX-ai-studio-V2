'use client'
import { useState } from 'react'
import { Check, X, Star, Zap, Copy, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

const UPI_ID = 'princeverma8753-1@oksbi'
const EMAIL = 'princeverma50055@gmail.com'
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const plans = [
  {
    id: 'free', name: 'Free', price: '₹0', period: 'forever',
    color: 'border-dark-500/40', headerBg: 'bg-dark-600/50', badge: null,
    features: [
      { text: '5 AI generations per day', included: true },
      { text: 'Max 5,000 words per generation', included: true },
      { text: 'Basic file conversion', included: true },
      { text: '15 AI writing tools', included: true },
      { text: 'OCR image to text', included: true },
      { text: 'Ads shown', included: false },
      { text: 'Unlimited generations', included: false },
    ],
    cta: 'Start Free', href: '/ai-writer'
  },
  {
    id: 'premium_monthly', name: 'Premium', price: '₹99', period: 'per month',
    color: 'border-cyan-500/40', headerBg: 'bg-gradient-to-br from-cyan-500/10 to-blue-500/10',
    badge: 'Most Popular', amount: 99,
    features: [
      { text: 'Unlimited AI generations', included: true },
      { text: 'Faster AI responses', included: true },
      { text: 'No advertisements', included: true },
      { text: 'Unlimited file conversions', included: true },
      { text: 'All 30+ AI tools', included: true },
      { text: 'Priority processing', included: true },
      { text: 'Priority support', included: true },
    ],
  },
  {
    id: 'premium_lifetime', name: 'Lifetime', price: '₹100', period: 'one-time',
    color: 'border-purple-500/40', headerBg: 'bg-gradient-to-br from-purple-500/10 to-pink-500/10',
    badge: 'Best Value', amount: 100,
    features: [
      { text: 'Lifetime access forever', included: true },
      { text: 'No renewal needed', included: true },
      { text: 'All future features', included: true },
      { text: 'Unlimited everything', included: true },
      { text: 'No advertisements ever', included: true },
      { text: 'Priority support', included: true },
      { text: 'All 30+ AI tools', included: true },
    ],
  }
]

export default function PricingPage() {
  const [activePlan, setActivePlan] = useState<string | null>(null)
  const [step, setStep] = useState<'qr' | 'verify'>('qr')
  const [txnId, setTxnId] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const selectedPlan = plans.find(p => p.id === activePlan)

  function copyUPI() {
    navigator.clipboard.writeText(UPI_ID)
    toast.success('UPI ID copied!')
  }

  function openGPay(amount: number, planName: string) {
    const upiUrl = `upi://pay?pa=${UPI_ID}&pn=Prince+Verma&am=${amount}&cu=INR&tn=ProjectX+${planName}`
    window.open(upiUrl, '_blank')
  }

  async function submitVerification() {
    if (!txnId.trim()) return toast.error('Please enter your Transaction ID')
    if (!userEmail.trim()) return toast.error('Please enter your email')

    setSubmitting(true)
    try {
      const res = await fetch(`${API}/api/payment/submit-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: activePlan,
          transactionId: txnId,
          userEmail,
          userName
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSubmitted(true)
      toast.success('Payment submitted! We will verify within 24 hours.')
    } catch (err: any) {
      toast.error(err.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 grid-pattern">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs mb-4">
            <Star className="w-3 h-3" /> Simple Pricing — Pay via GPay/UPI
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Choose Your <span className="gradient-text">Plan</span>
          </h1>
          <p className="text-white/40 max-w-lg mx-auto">
            Pay directly via GPay, PhonePe, Paytm or any UPI app. No Razorpay needed.
          </p>
        </div>

        {/* Plans */}
        {!activePlan && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {plans.map((plan) => (
              <div key={plan.id}
                className={`glass rounded-2xl border ${plan.color} overflow-hidden relative ${plan.badge === 'Best Value' ? 'md:-mt-4 md:mb-4' : ''}`}>
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
                    <Link href={plan.href!} className="btn-secondary w-full py-3 text-center block">
                      {plan.cta}
                    </Link>
                  ) : (
                    <button
                      onClick={() => { setActivePlan(plan.id); setStep('qr'); setSubmitted(false) }}
                      className={`w-full py-3 rounded-xl font-semibold text-white transition-all ${
                        plan.id === 'premium_monthly'
                          ? 'btn-primary glow-cyan'
                          : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90'
                      }`}
                    >
                      Pay ₹{(plan as any).amount} via UPI
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Payment Modal */}
        {activePlan && selectedPlan && (
          <div className="max-w-md mx-auto">
            <div className="glass rounded-2xl border border-cyan-500/30 overflow-hidden">

              {/* Header */}
              <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 p-5 border-b border-dark-500/40">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white">{selectedPlan.name} Plan</h2>
                    <p className="text-sm text-white/50">{selectedPlan.price}/{selectedPlan.period}</p>
                  </div>
                  <button onClick={() => setActivePlan(null)} className="text-white/30 hover:text-white text-xl">✕</button>
                </div>
              </div>

              {!submitted ? (
                <div className="p-6 space-y-5">

                  {/* Step 1: Pay */}
                  <div className={`rounded-xl border p-5 ${step === 'qr' ? 'border-cyan-500/40 bg-cyan-500/5' : 'border-dark-500/30 opacity-60'}`}>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-6 h-6 rounded-full bg-cyan-500 text-white text-xs flex items-center justify-center font-bold">1</span>
                      <h3 className="text-sm font-semibold text-white">Pay via GPay / UPI</h3>
                    </div>

                    {/* QR Code */}
                    <div className="text-center mb-4">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=${UPI_ID}%26pn=Prince+Verma%26am=${(selectedPlan as any).amount}%26cu=INR%26tn=ProjectX+${selectedPlan.name}`}
                        alt="UPI QR Code"
                        className="mx-auto rounded-xl border border-white/10 mb-3"
                        width={180} height={180}
                      />
                      <p className="text-xs text-white/40 mb-3">Scan with GPay, PhonePe, Paytm or any UPI app</p>
                    </div>

                    {/* UPI ID */}
                    <div className="glass rounded-xl p-3 flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs text-white/40 mb-0.5">UPI ID</p>
                        <p className="text-sm font-mono text-cyan-400 font-semibold">{UPI_ID}</p>
                      </div>
                      <button onClick={copyUPI} className="p-2 text-white/40 hover:text-cyan-400 transition-colors">
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Amount */}
                    <div className="glass rounded-xl p-3 flex items-center justify-between mb-4">
                      <p className="text-xs text-white/40">Amount to Pay</p>
                      <p className="text-lg font-bold text-white">₹{(selectedPlan as any).amount}</p>
                    </div>

                    {/* Open GPay Button */}
                    <button
                      onClick={() => openGPay((selectedPlan as any).amount, selectedPlan.name)}
                      className="w-full py-3 rounded-xl font-semibold text-white mb-2 flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #4285f4, #34a853)' }}
                    >
                      📱 Open GPay / UPI App
                    </button>
                    <p className="text-xs text-white/30 text-center">or scan QR code above</p>

                    <button
                      onClick={() => setStep('verify')}
                      className="w-full mt-4 py-2.5 rounded-xl text-sm font-medium text-white/60 border border-dark-500/40 hover:border-cyan-500/40 hover:text-white transition-all"
                    >
                      ✅ I have paid — Submit Transaction ID
                    </button>
                  </div>

                  {/* Step 2: Verify */}
                  {step === 'verify' && (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center font-bold">2</span>
                        <h3 className="text-sm font-semibold text-white">Submit Payment Details</h3>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-white/50 mb-1.5">Your Name</label>
                          <input
                            type="text"
                            value={userName}
                            onChange={e => setUserName(e.target.value)}
                            placeholder="Prince Verma"
                            className="w-full px-4 py-2.5 glass rounded-xl border border-dark-500/40 text-white placeholder-white/20 text-sm focus:outline-none focus:border-emerald-500/50"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-white/50 mb-1.5">Your Email *</label>
                          <input
                            type="email"
                            value={userEmail}
                            onChange={e => setUserEmail(e.target.value)}
                            placeholder="your@email.com"
                            className="w-full px-4 py-2.5 glass rounded-xl border border-dark-500/40 text-white placeholder-white/20 text-sm focus:outline-none focus:border-emerald-500/50"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-white/50 mb-1.5">UPI Transaction ID / UTR Number *</label>
                          <input
                            type="text"
                            value={txnId}
                            onChange={e => setTxnId(e.target.value)}
                            placeholder="e.g. 425123456789"
                            className="w-full px-4 py-2.5 glass rounded-xl border border-dark-500/40 text-white placeholder-white/20 text-sm focus:outline-none focus:border-emerald-500/50"
                          />
                          <p className="text-xs text-white/30 mt-1">Find in GPay → Transaction → UTR/Reference Number</p>
                        </div>

                        <button
                          onClick={submitVerification}
                          disabled={submitting}
                          className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
                          style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                        >
                          {submitting
                            ? <><div className="loading-dots"><span></span><span></span><span></span></div> Submitting...</>
                            : <><Send className="w-4 h-4" /> Submit for Verification</>}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Success State */
                <div className="p-8 text-center">
                  <div className="text-5xl mb-4">🎉</div>
                  <h3 className="text-xl font-bold text-white mb-2">Payment Submitted!</h3>
                  <p className="text-sm text-white/50 mb-4">
                    We received your transaction ID. Your <strong className="text-white">{selectedPlan.name}</strong> plan will be activated within <strong className="text-cyan-400">24 hours</strong>.
                  </p>
                  <div className="glass rounded-xl p-4 mb-5 text-left">
                    <p className="text-xs text-white/40 mb-1">Verification email sent to</p>
                    <p className="text-sm text-cyan-400 font-mono">{userEmail}</p>
                  </div>
                  <p className="text-xs text-white/30 mb-5">
                    Questions? Email us: <span className="text-cyan-400">{EMAIL}</span>
                  </p>
                  <div className="space-y-2">
                    <Link href="/ai-writer" className="btn-primary w-full py-3 flex items-center justify-center gap-2">
                      <Zap className="w-4 h-4" /> Continue Using Free Plan
                    </Link>
                    <button onClick={() => setActivePlan(null)} className="btn-secondary w-full py-2.5 text-sm">
                      Back to Plans
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Trust note */}
            <p className="text-center text-xs text-white/25 mt-4">
              🔒 Direct UPI payment • No third-party • Verified by Prince Verma
            </p>
          </div>
        )}

        {/* Trust badges */}
        {!activePlan && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {[
              { icon: '📱', text: 'GPay / PhonePe', sub: 'Any UPI app works' },
              { icon: '⚡', text: 'Fast Activation', sub: 'Within 24 hours' },
              { icon: '🔒', text: 'Direct Payment', sub: 'No middleman' },
              { icon: '📧', text: 'Email Support', sub: EMAIL },
            ].map((b) => (
              <div key={b.text} className="glass rounded-xl p-4 border border-dark-500/40 text-center">
                <div className="text-2xl mb-2">{b.icon}</div>
                <p className="text-xs font-medium text-white/70">{b.text}</p>
                <p className="text-xs text-white/30 mt-0.5 truncate">{b.sub}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
