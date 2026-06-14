/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CreditCard, Check, Zap, Award, Sparkles, X, ShieldCheck, Heart, RefreshCw } from 'lucide-react';

interface SubscriptionsProps {
  currentPlan: string;
  onPlanUpgrade: (newPlan: 'Free' | 'Pro' | 'Business') => void;
}

export default function Subscriptions({ currentPlan, onPlanUpgrade }: SubscriptionsProps) {
  const [activeCheckoutModelPlan, setActiveCheckoutModelPlan] = useState<'Pro' | 'Business' | null>(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paySuccessMsg, setPaySuccessMsg] = useState<string | null>(null);

  // Form controls simulation
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');

  const plans = [
    {
      id: 'Free',
      name: 'Starter Free',
      price: '$0',
      freq: 'forever',
      desc: 'Ideal for weekend creators testing out copy outlines.',
      credits: 20,
      features: [
        'Limited AI Credits (20 Generations)',
        'Standard Copywriter Engine',
        'Hashtag score calculations',
        'Single Brand Voice Profile',
        'Local draft persistence'
      ],
      color: 'border-zinc-800 bg-zinc-955/20 text-zinc-400'
    },
    {
      id: 'Pro',
      name: 'Professional Scale',
      price: '$49',
      freq: 'per month',
      desc: 'Optimized for agencies, startups, and full-time content hubs.',
      credits: 100,
      features: [
        'Advanced AI Credits (100 token limit)',
        'Full Multi-platform Suites Generator',
        'SEO blog article outlines & metas',
        'Active Content planning calendar',
        'Social Scheduler Queue (Celery-Redis worker)',
        'Unlimited custom Brand Voices',
        'Direct copying and editable sandboxes'
      ],
      color: 'border-indigo-500 bg-indigo-950/20 text-indigo-200 ring-2 ring-indigo-500/20',
      popular: true
    },
    {
      id: 'Business',
      name: 'Enterprise Business',
      price: '$149',
      freq: 'per month',
      desc: 'Engineered for premium agencies and high-growth copywriting staff.',
      credits: 500,
      features: [
        'Enterprise AI Credits (500 token limit)',
        'Teammate collaborative approvals room',
        'Advanced long-term views & clicks charts',
        'One-click multi-channel blog repurposing',
        'System Admin custom controller dashboard',
        'Fast dedicated Gemini model fine-tuning links',
        'Priority SLA support channels'
      ],
      color: 'border-purple-500 bg-purple-950/20 text-purple-200'
    }
  ];

  const handleExecutePaymentSimulation = async () => {
    if (!activeCheckoutModelPlan) return;
    setSubmittingPayment(true);
    try {
      const response = await fetch('/api/payments/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: activeCheckoutModelPlan })
      });
      const data = await response.json();
      if (data.success) {
        setPaySuccessMsg(`Simulated Payment successful! Transaction: ${data.transactionId}. Upgraded to ${activeCheckoutModelPlan} license.`);
        onPlanUpgrade(activeCheckoutModelPlan);
        setTimeout(() => {
          setActiveCheckoutModelPlan(null);
          setPaySuccessMsg(null);
        }, 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingPayment(false);
    }
  };

  return (
    <div id="subscriptions-pricing-tab" className="space-y-8 animate-fade-in">
      <div className="text-center max-w-xl mx-auto space-y-2 select-none">
        <h3 className="text-xl font-bold text-white tracking-tight">Flexible SaaS Subscriptions</h3>
        <p className="text-xs text-zinc-400">Upgrade to Pro or Business to access scheduling campaigns, multi-channel repurposers, and team work desks.</p>
      </div>

      {/* Plans comparison cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch max-w-6xl mx-auto">
        {plans.map((p) => {
          const isCurrent = currentPlan === p.id;
          return (
            <div key={p.id} className={`border rounded-2xl p-6.5 flex flex-col justify-between relative shadow-md transition-transform hover:-translate-y-0.5 ${p.color}`}>
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white border border-indigo-400/30 text-[9px] font-mono tracking-widest uppercase font-extrabold px-3 py-1 rounded-full">
                  Highly Popular
                </span>
              )}

              <div className="space-y-4">
                <div className="flex justify-between items-baseline">
                  <h4 className="text-sm font-bold font-sans text-white">{p.name}</h4>
                  {isCurrent && (
                    <span className="text-[10px] font-mono bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded">
                      Active
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-400 min-h-[40px] leading-relaxed">{p.desc}</p>

                <div className="flex items-baseline gap-1.5 py-2">
                  <span className="text-3xl font-bold text-white tracking-tight font-mono">{p.price}</span>
                  <span className="text-xs text-zinc-550 font-sans">/ {p.freq}</span>
                </div>

                {/* Features checklists */}
                <ul className="space-y-2 text-[11px] font-sans text-zinc-350 pt-4 border-t border-zinc-900">
                  {p.features.map((ft, fIdx) => (
                    <li key={fIdx} className="flex gap-2 items-start">
                      <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                      <span>{ft}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action buttons triggers */}
              <div className="pt-6">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2.5 bg-zinc-950 border border-zinc-900 rounded-lg text-xs font-semibold text-zinc-500 cursor-not-allowed"
                  >
                    Current Active Plan
                  </button>
                ) : (
                  <button
                    id={`upgrade-button-${p.id}`}
                    onClick={() => {
                      if (p.id === 'Free') {
                        onPlanUpgrade('Free');
                      } else {
                        setActiveCheckoutModelPlan(p.id as any);
                      }
                    }}
                    className={`w-full py-2.5 rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-98 ${
                      p.popular
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 text-white'
                        : 'bg-zinc-900 hover:bg-zinc-850 text-white'
                    }`}
                  >
                    {p.id === 'Free' ? 'Downgrade to Free' : `Upgrade to ${p.id}`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Razorpay simulation Checkout Gateway popup Modal dialog */}
      {activeCheckoutModelPlan && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-950 border border-zinc-800 max-w-md w-full rounded-2xl overflow-hidden shadow-2xl relative animate-fade-in flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-zinc-900/40 p-5 border-b border-zinc-900 flex justify-between items-center bg-zinc-950/20">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-400" />
                <div>
                  <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wide">Razorpay Checkout Sandbox</h4>
                  <p className="text-[10px] text-zinc-500 font-sans">Simulated Payment Gateway Platform</p>
                </div>
              </div>
              <button
                onClick={() => setActiveCheckoutModelPlan(null)}
                className="p-1 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body form details */}
            <div className="p-6 space-y-4">
              <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl space-y-1">
                <p className="text-xs font-semibold text-zinc-200">Purchasing: {activeCheckoutModelPlan} Subscription</p>
                <p className="text-[11px] text-indigo-400 font-mono">Amount due: {activeCheckoutModelPlan === 'Pro' ? '$49.00 / mo' : '$149.00 / mo'}</p>
              </div>

              {/* simulated inputs */}
              <div className="space-y-3 font-mono text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Card Number</label>
                  <input
                    id="sub-card-number"
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2.5 text-xs text-zinc-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Expiry (MM/YY)</label>
                    <input
                      id="sub-card-expiry"
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2.5 text-xs text-zinc-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Secure CVV</label>
                    <input
                      id="sub-card-cvv"
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded-lg p-2.5 text-xs text-zinc-200"
                    />
                  </div>
                </div>
              </div>

              {/* Status or payment successful messages */}
              {paySuccessMsg ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/15 rounded-lg flex items-center gap-2 text-xs text-emerald-400 font-mono">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{paySuccessMsg}</span>
                </div>
              ) : (
                <div className="text-[10px] text-zinc-500 font-sans flex items-center gap-1 leading-normal italic py-1 border-t border-zinc-900/60 mt-3 pt-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Payment is fully simulated. No real currency is spent. Clicking authorize updates state live on port 3000 server.
                </div>
              )}
            </div>

            {/* Modal Footer actions */}
            {!paySuccessMsg && (
              <div className="p-5 border-t border-zinc-900 bg-zinc-950/20 flex gap-2 justify-end">
                <button
                  onClick={() => setActiveCheckoutModelPlan(null)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs text-zinc-350 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  id="sub-auth-checkout-btn"
                  onClick={handleExecutePaymentSimulation}
                  disabled={submittingPayment}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  {submittingPayment ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                  <span>Authorize Checkout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
