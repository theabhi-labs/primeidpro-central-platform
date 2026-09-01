import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Coins, ArrowRight, ShieldCheck, Zap, HelpCircle } from 'lucide-react';

export default function PricingPage() {
  const packages = [
    {
      name: 'Starter Pack',
      price: 100,
      credits: 100,
      photos: 50,
      bonus: null,
      popular: false,
      features: [
        '50 Photo prints capacity',
        '₹2 per photo processed',
        'Unlimited desktop client pairing',
        'Instant wallet top-up via UPI',
        'Credits never expire'
      ]
    },
    {
      name: 'Growth Pack',
      price: 500,
      credits: 550,
      photos: 275,
      bonus: '+50 Bonus Credits',
      popular: false,
      features: [
        '275 Photo prints capacity',
        '+50 Bonus credits included',
        'High-priority print queue',
        'Unlimited desktop pairing',
        'Full QR Kiosk feature suite'
      ]
    },
    {
      name: 'Studio Pro',
      price: 1000,
      credits: 1150,
      photos: 575,
      bonus: '+150 Bonus Credits',
      popular: true,
      features: [
        '575 Photo prints capacity',
        '+150 Free bonus credits',
        'Multi-photo batch layout queue',
        'Real-time customer live tracker',
        'Dedicated VIP studio support'
      ]
    },
    {
      name: 'Enterprise Hub',
      price: 2000,
      credits: 2400,
      photos: 1200,
      bonus: '+400 Bonus Credits',
      popular: false,
      features: [
        '1,200 Photo prints capacity',
        '+400 Free bonus credits',
        'Multi-terminal license pairing',
        'Custom watermark logo support',
        '24/7 Dedicated account manager'
      ]
    }
  ];

  return (
    <div className="min-h-screen text-slate-100 selection:bg-indigo-500 selection:text-white">
      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Coins className="w-3.5 h-3.5" /> No Monthly Subscriptions • Zero Hidden Fees
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Transparent Pay-Per-Photo Credit Packages
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-400">
            Top up your studio wallet on demand. 1 Photo = 2 Credits (₹2). Keep 100% of the customer revenue you collect.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {packages.map((pkg, idx) => (
            <div
              key={idx}
              className={`bg-slate-900/80 border ${
                pkg.popular ? 'border-indigo-500 shadow-2xl shadow-indigo-600/15' : 'border-slate-800'
              } p-8 rounded-3xl flex flex-col justify-between relative transition-all`}
            >
              {pkg.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-500 text-white text-[10px] font-black rounded-full uppercase tracking-wider shadow-md">
                  Most Popular
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">₹{pkg.price}</span>
                </div>
                {pkg.bonus ? (
                  <p className="text-xs text-emerald-400 font-bold mt-2">{pkg.bonus}</p>
                ) : (
                  <p className="text-xs text-slate-400 mt-2">{pkg.credits} Credits</p>
                )}
                <div className="mt-6 space-y-3 text-xs text-slate-300">
                  {pkg.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 className={`w-4 h-4 shrink-0 ${pkg.popular ? 'text-indigo-400' : 'text-slate-400'}`} />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                to="/register"
                className={`mt-8 w-full py-3 text-center text-xs font-bold rounded-xl transition-all ${
                  pkg.popular
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                }`}
              >
                Top Up Now
              </Link>
            </div>
          ))}
        </div>

        {/* Info FAQ Banner */}
        <div className="mt-16 p-8 rounded-3xl bg-slate-900/60 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
          <div className="space-y-1.5">
            <div className="font-bold text-white text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Non-Negative Ledger
            </div>
            <p className="text-slate-400 leading-relaxed">
              Deductions are applied atomically upon confirmation of the print job on the desktop hardware.
            </p>
          </div>
          <div className="space-y-1.5">
            <div className="font-bold text-white text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-400" /> Instant UPI Top-up
            </div>
            <p className="text-slate-400 leading-relaxed">
              Credits reflect immediately via Razorpay UPI webhook reconciliation with zero wait time.
            </p>
          </div>
          <div className="space-y-1.5">
            <div className="font-bold text-white text-sm flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" /> Lifetime Validity
            </div>
            <p className="text-slate-400 leading-relaxed">
              Purchased credits never expire. Use them whenever customers walk in to your cyber cafe or studio.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
