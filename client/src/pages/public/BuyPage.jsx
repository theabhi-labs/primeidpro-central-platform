import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  Download,
  Key,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Coins,
  ArrowRight,
  Monitor,
  HelpCircle,
  Clock,
  Laptop,
  Check,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import SEO from '../../components/SEO';

export default function BuyPage() {
  const [selectedPlan, setSelectedPlan] = useState(2); // Studio Pro selected by default

  const packages = [
    {
      id: 0,
      name: 'Starter Pack',
      price: 100,
      credits: 100,
      photos: 50,
      bonus: null,
      popular: false,
      desc: 'Ideal for small cyber cafés & initial testing',
      features: [
        '50 Photo prints processing capacity',
        'Standard ₹2 per photo rate (2 credits)',
        'Full desktop software access',
        'Unlimited Windows PC pairing',
        'Credits never expire'
      ]
    },
    {
      id: 1,
      name: 'Growth Pack',
      price: 500,
      credits: 550,
      photos: 275,
      bonus: '+50 Bonus Credits',
      popular: false,
      desc: 'Great for active cyber cafés & CSC centers',
      features: [
        '275 Photo prints processing capacity',
        '+50 Free bonus credits included',
        'Customer QR Kiosk generation',
        'Priority print queue processing',
        'Credits never expire'
      ]
    },
    {
      id: 2,
      name: 'Studio Pro',
      price: 1000,
      credits: 1150,
      photos: 575,
      bonus: '+150 Bonus Credits',
      popular: true,
      desc: 'Recommended for busy photo studios & CSC hubs',
      features: [
        '575 Photo prints processing capacity',
        '+150 Free bonus credits included',
        'Multi-photo batch layout editor',
        'Real-time customer live tracker',
        'Dedicated VIP studio support'
      ]
    },
    {
      id: 3,
      name: 'Enterprise Hub',
      price: 2000,
      credits: 2400,
      photos: 1200,
      bonus: '+400 Bonus Credits',
      popular: false,
      desc: 'High-volume commercial printing & institutions',
      features: [
        '1,200 Photo prints processing capacity',
        '+400 Free bonus credits included',
        'Multi-terminal licensing support',
        'Custom watermark logo configuration',
        '24/7 Priority technical assistance'
      ]
    }
  ];

  return (
    <div className="min-h-screen text-slate-100 selection:bg-indigo-500 selection:text-white">
      <SEO
        title="Buy Prime ID Pro – Download & Activate Software"
        description="Purchase Prime ID Pro desktop software license and credit packs. Instant activation, secure Razorpay checkout, 100% offline-ready Windows photo processing."
        canonical="https://primeidpro.online/buy"
      />

      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
            <CreditCard className="w-3.5 h-3.5" /> Official Software License &amp; Credits
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Buy Prime ID Pro Software License
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-400">
            Get instant access to Prime ID Pro desktop software. Select your credit package, pay securely via Razorpay, and activate your terminal in under 2 minutes.
          </p>
        </div>

        {/* Pricing & License Packages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {packages.map((pkg) => {
            const isSelected = selectedPlan === pkg.id;
            return (
              <div
                key={pkg.id}
                onClick={() => setSelectedPlan(pkg.id)}
                className={`p-8 rounded-3xl flex flex-col justify-between relative cursor-pointer transition-all ${
                  pkg.popular
                    ? 'bg-gradient-to-b from-indigo-950/70 to-slate-900/90 border-2 border-indigo-500 shadow-2xl shadow-indigo-600/20'
                    : isSelected
                    ? 'bg-slate-900 border-2 border-indigo-400 shadow-xl shadow-indigo-950/50'
                    : 'bg-slate-900/80 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-500 text-white text-[10px] font-black rounded-full uppercase tracking-wider shadow-md">
                    Most Popular
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-500 text-white'
                          : 'border-slate-700 bg-slate-950'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </div>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">₹{pkg.price}</span>
                    <span className="text-xs text-slate-400 font-medium">one-time</span>
                  </div>

                  {pkg.bonus ? (
                    <p className="text-xs text-emerald-400 font-bold mt-2">{pkg.bonus}</p>
                  ) : (
                    <p className="text-xs text-slate-400 mt-2">{pkg.credits} Credits</p>
                  )}

                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {pkg.desc}
                  </p>

                  <div className="mt-6 space-y-3 text-xs text-slate-300">
                    {pkg.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2">
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 ${
                            pkg.popular ? 'text-indigo-400' : 'text-slate-400'
                          }`}
                        />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-800/80">
                  <Link
                    to="/register"
                    className={`w-full py-3 text-center text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      pkg.popular
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                  >
                    Buy {pkg.name} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* What You Are Purchasing & How It Works Breakdown */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-12 mb-16 backdrop-blur-xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center">
            How Purchase, Download &amp; Activation Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3 p-6 rounded-2xl bg-slate-950/70 border border-slate-800/80">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                1
              </div>
              <h3 className="text-base font-bold text-white">1. Secure Online Payment</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pay safely using Razorpay with UPI (Google Pay, PhonePe, Paytm), Debit/Credit Cards, or Net Banking. Transactions are encrypted using TLS 1.3 and SHA-256 signatures.
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-2xl bg-slate-950/70 border border-slate-800/80">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
                2
              </div>
              <h3 className="text-base font-bold text-white">2. Instant Download &amp; Account</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your operator account is credited immediately upon payment. Download the standalone Windows installer (x64) directly from the portal with embedded AI offline engines.
              </p>
            </div>

            <div className="space-y-3 p-6 rounded-2xl bg-slate-950/70 border border-slate-800/80">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                3
              </div>
              <h3 className="text-base font-bold text-white">3. 6-Digit Pairing &amp; Ready</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Open Prime ID Pro on your Windows PC, enter the 6-digit terminal pairing code from your operator dashboard, and start processing customer passport photos instantly.
              </p>
            </div>
          </div>
        </div>

        {/* Purchase Summary Table & Security Guarantees */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              What Is Included With Your Purchase
            </h3>
            <ul className="space-y-3 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span><strong>Prime ID Pro Desktop Software</strong> for 64-bit Windows (10 / 11)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span><strong>Local Rembg AI Engine</strong> for automatic background removal</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span><strong>Biometric Face Landmark Alignment</strong> (Passport, Visa, Stamp, PVC)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span><strong>Customer QR Self-Service Kiosk</strong> generator for your shop counter</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span><strong>Direct 300 DPI Native Windows Printer Drivers</strong> (DNP, Canon, Epson, Brother)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span><strong>Lifetime Validity</strong> on all purchased print credits with zero expiration</span>
              </li>
            </ul>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-cyan-400" />
              Need Assistance Before Purchasing?
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              If you have questions regarding printer compatibility, hardware requirements, or center onboarding, our support team is available to assist you.
            </p>
            <div className="space-y-2.5 pt-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="font-semibold text-white">Email:</span>
                <span className="font-mono text-indigo-400">support@primeidpro.online</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="font-semibold text-white">Helpline:</span>
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="font-semibold text-white">Operating Hours:</span>
                <span>Monday – Saturday, 9:00 AM – 7:00 PM IST</span>
              </div>
            </div>
            <div className="pt-4">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all"
              >
                Contact Sales &amp; Support <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
