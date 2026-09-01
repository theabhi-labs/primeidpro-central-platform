import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  QrCode,
  Printer,
  ShieldCheck,
  Zap,
  Coins,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Download,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Monitor,
  Smartphone,
  Lock,
  Clock,
  Store,
  CreditCard,
  Sliders,
  Check
} from 'lucide-react';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [activeStep, setActiveStep] = useState(0);

  const workflowSteps = [
    {
      step: '01',
      title: 'Customer Scans Kiosk QR',
      subtitle: 'Zero App Installation Needed',
      desc: 'Customer scans the studio counter QR code using any smartphone camera or UPI scanner to launch the instant web kiosk.',
      icon: QrCode,
      color: 'indigo'
    },
    {
      step: '02',
      title: 'Uploads & AI Biometric Crop',
      subtitle: 'Single or Multi-Photo Batch',
      desc: 'Uploads 1 to 20+ photos from gallery with automatic face detection, standard sizing (Passport, Visa, Stamp), and background color selection.',
      icon: Sparkles,
      color: 'cyan'
    },
    {
      step: '03',
      title: 'Instant Online or Cash Payment',
      subtitle: 'Seamless Razorpay & Cash Options',
      desc: 'Customer pays securely via UPI QR, Google Pay, PhonePe, Cards, or chooses direct Counter Cash payment.',
      icon: CreditCard,
      color: 'emerald'
    },
    {
      step: '04',
      title: 'Real-time Desktop App Sync',
      subtitle: 'Zero WhatsApp / Bluetooth Hassle',
      desc: 'Order arrives directly into your Windows desktop app queue instantly over secure sockets without email or manual downloads.',
      icon: Monitor,
      color: 'indigo'
    },
    {
      step: '05',
      title: '1-Click 300 DPI Studio Print',
      subtitle: 'Direct Raw Printer Communication',
      desc: 'Offline AI removes background and creates automated 4x6 / A4 grids. Click print for immediate raw dye-sub or inkjet output.',
      icon: Printer,
      color: 'amber'
    }
  ];

  const faqs = [
    {
      q: 'What is Prime ID Pro and how does it work for CSC & Cyber Cafe operators?',
      a: 'Prime ID Pro is an end-to-end automated photo processing and direct printing ecosystem. You place your personalized QR code at your shop counter. Customers scan the QR, upload photos directly from their phone gallery, customize photo sizes, and complete payment. The photos instantly sync to your Windows desktop PC without the friction of WhatsApp or email, where our offline AI creates 300 DPI print grids in one click.'
    },
    {
      q: 'Does the Prime ID Pro Windows desktop app work offline without internet?',
      a: 'Yes. The Prime ID Pro Electron desktop application is built with 100% offline capability. Local AI face landmark detection, Rembg background removal, 300 DPI passport/visa layout rendering, and native printer driver communication all run completely locally on your Windows machine.'
    },
    {
      q: 'How does the Pay-As-You-Grow Credit System work?',
      a: 'There are zero mandatory monthly subscriptions. You only pay for what you print: 1 photo print = 2 credits (₹2). All customer revenue collected at your counter or via online payments belongs 100% to your studio.'
    },
    {
      q: 'Can customers submit multiple photos in a single order?',
      a: 'Yes. Customers can upload multiple photos for family members or different poses (1, 2, 3, 5, 10, or 20+ photos) in a single transaction. The desktop client automatically batches the photos and arranges multi-sheet layouts with standard cut guides.'
    },
    {
      q: 'How is customer photo privacy and security guaranteed?',
      a: 'We adhere to a strict 10-Minute Auto-Purge policy. Exactly 10 minutes after a print job is completed by the desktop app, the temporary photo binaries are permanently wiped from cloud object storage. Customer photos are never permanently stored or shared.'
    },
    {
      q: 'Which photo printers and paper formats are supported?',
      a: 'Prime ID Pro supports all standard Windows printers including DNP (DS-RX1HS, DS620), Canon (Selphy CP1300/CP1500, Pixma G-series), Epson (L8050, L805, L3250), Brother, and HP dye-sublimation and inkjet photo printers on 4x6, 5x7, and A4 photo paper.'
    }
  ];

  const packages = [
    {
      name: 'Starter Pack',
      price: 100,
      credits: 100,
      photos: 50,
      popular: false,
      features: [
        '50 Photo prints capacity',
        '₹2 per photo processed',
        'Unlimited desktop pairing',
        'Credits never expire',
        'Email & community support'
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
        'Full QR Kiosk features',
        'Priority print queue routing',
        'Standard operator helpline'
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
        'Multi-photo batch layout editor',
        'Real-time customer tracker',
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
        'Multi-operator terminal support',
        'Custom brand watermark option',
        '24/7 Dedicated account manager'
      ]
    }
  ];

  return (
    <div className="min-h-screen text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* 1. HERO SECTION */}
      <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
        {/* Subtle Ambient Glows */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-indigo-600/15 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-40 left-1/4 w-[400px] h-[300px] bg-cyan-600/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-8 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Designed specifically for CSC, Cyber Cafe &amp; Photocopy Centers
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1] max-w-5xl mx-auto">
            High-Speed Photo Processing &amp; Printing for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-300 to-indigo-300">
              CSC &amp; Cyber Cafe Studios
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Eliminate WhatsApp sharing and manual cropping. Let customers scan your counter QR, upload photos, and send 300 DPI print-ready sheets directly to your Windows desktop app.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-2xl shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2.5 transform hover:-translate-y-0.5"
            >
              <Store className="w-5 h-5" />
              Start Your Center Now
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/download"
              className="w-full sm:w-auto px-8 py-4 text-base font-bold text-slate-200 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 rounded-2xl transition-all flex items-center justify-center gap-2.5"
            >
              <Download className="w-5 h-5 text-indigo-400" />
              Download Windows App
            </Link>

            <Link
              to="/order"
              className="w-full sm:w-auto px-6 py-4 text-sm font-semibold text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-1.5"
            >
              <Smartphone className="w-4 h-4 text-cyan-400" />
              Customer Self-Order Kiosk →
            </Link>
          </div>

          {/* Interactive 5-Step Pipeline Card */}
          <div className="mt-14 max-w-5xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl text-left">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Automated End-to-End Workflow
                </span>
              </div>
              <span className="text-xs text-indigo-400 font-medium">Click any step to view details</span>
            </div>

            {/* Stepper Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {workflowSteps.map((step, idx) => {
                const Icon = step.icon;
                const isSelected = activeStep === idx;
                return (
                  <button
                    key={step.step}
                    onClick={() => setActiveStep(idx)}
                    className={`p-4 rounded-2xl border text-left transition-all relative ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-950/60'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-xs font-mono font-bold ${
                          isSelected ? 'text-indigo-400' : 'text-slate-500'
                        }`}
                      >
                        {step.step}
                      </span>
                      <Icon
                        className={`w-4 h-4 ${isSelected ? 'text-indigo-300' : 'text-slate-400'}`}
                      />
                    </div>
                    <div
                      className={`text-xs font-bold leading-snug ${
                        isSelected ? 'text-white' : 'text-slate-300'
                      }`}
                    >
                      {step.title}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Step Content */}
            <div className="mt-6 p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-bold text-indigo-400 uppercase tracking-wide">
                  Step {workflowSteps[activeStep].step} — {workflowSteps[activeStep].subtitle}
                </div>
                <div className="text-sm text-slate-200 leading-relaxed font-normal">
                  {workflowSteps[activeStep].desc}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to="/features"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all flex items-center gap-1.5"
                >
                  Explore Tech Specs <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-10 border-t border-slate-800/80">
            <div className="text-center p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <div className="text-3xl font-black text-white">100%</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Offline AI Engine</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <div className="text-3xl font-black text-indigo-400">₹2 / photo</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Pay-Per-Photo Rate</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <div className="text-3xl font-black text-cyan-400">300 DPI</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Studio Print Quality</div>
            </div>
            <div className="text-center p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
              <div className="text-3xl font-black text-emerald-400">10-Min</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Privacy Auto-Purge</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ENTERPRISE CAPABILITIES GRID */}
      <section className="py-24 bg-slate-900/40 border-y border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">
              Built For Speed &amp; Accuracy
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Powerful Features for High-Volume Digital Studios
            </p>
            <p className="mt-4 text-slate-400 text-sm sm:text-base">
              Say goodbye to messy file transfers, mismatched photo aspect ratios, and manual background cleanups.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Cpu className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">AI Face Mesh Landmark Detection</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Automatic proportion calibration adhering strictly to Indian Passport (35x45mm), Schengen, US Visa (2x2 inch), and PVC ID standards.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Local Rembg Background Removal</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Embedded local AI engine replaces cluttered home backgrounds with pure studio white, light blue, or custom solid backdrops in under 2 seconds.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Printer className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Native Direct Windows Printing</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Bypasses generic print dialogue boxes to stream raw 300 DPI bitmaps directly to DNP, Canon Selphy, Epson, and Brother photo printers.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Layers className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Multi-Photo Batch Uploads</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Customers can upload multiple individual photos or entire family batches in a single order with unified multi-sheet layout composition.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Coins className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Double-Entry Credit Wallet</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Zero lock-in subscriptions. Top up credits on demand with Razorpay UPI. Deductions are atomic, non-negative, and verifiable.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">10-Minute Auto Privacy Purge</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Customer photos are automatically purged 10 minutes post-printing. No permanent image retention, ensuring full biometric privacy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRANSPARENT PRICING SECTION */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">
              Simple &amp; Transparent
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Pay-Per-Photo Credit Packages
            </p>
            <p className="mt-4 text-slate-400 text-sm sm:text-base">
              1 Photo = 2 Credits (₹2). No monthly recurring fees. Keep 100% of the customer printing revenue you collect at your counter.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {packages.map((pkg, idx) => (
              <div
                key={idx}
                className={`p-8 rounded-3xl flex flex-col justify-between relative transition-all ${
                  pkg.popular
                    ? 'bg-gradient-to-b from-indigo-950/60 to-slate-900/90 border-2 border-indigo-500 shadow-2xl shadow-indigo-600/15'
                    : 'bg-slate-900/80 border border-slate-800'
                }`}
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

                <Link
                  to="/register"
                  className={`mt-8 w-full py-3 text-center text-xs font-bold rounded-xl transition-all ${
                    pkg.popular
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                >
                  Choose {pkg.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FAQ ACCORDION SECTION */}
      <section className="py-24 bg-slate-900/40 border-t border-slate-800/80 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">
              Help Center &amp; Inquiries
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Frequently Asked Questions
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-slate-800/90 bg-slate-900/60 rounded-2xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-semibold text-slate-200 hover:text-white"
                >
                  <span className="text-base sm:text-lg">{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-indigo-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-6 text-sm text-slate-400 leading-relaxed border-t border-slate-800/50 pt-4 font-normal">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION SECTION */}
      <section className="py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-indigo-950/90 via-slate-900/90 to-indigo-950/90 border border-indigo-500/30 rounded-3xl p-10 sm:p-16 text-center relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Ready to modernize your CSC / Cyber Cafe Studio?
            </h2>
            <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto">
              Join thousands of digital operators across India delivering fast, professional photo prints.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="px-8 py-4 text-base font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-2xl shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2.5"
              >
                <Store className="w-5 h-5" />
                Register Your Studio Now
              </Link>
              <Link
                to="/download"
                className="px-8 py-4 text-base font-bold text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded-2xl transition-all flex items-center gap-2.5"
              >
                <Download className="w-5 h-5 text-indigo-400" />
                Download Windows App
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
