import React from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  Cpu,
  Sparkles,
  Printer,
  Layers,
  ShieldCheck,
  Zap,
  ArrowRight,
  Monitor,
  Smartphone,
  CheckCircle2,
  HardDrive,
  QrCode,
  Lock,
  Scissors,
  FileCheck,
  RefreshCw,
  Sliders,
  CreditCard,
  Headphones
} from 'lucide-react';
import SEO from '../../components/SEO';

export default function FeaturesPage() {
  const featureList = [
    {
      title: 'Bulk Photo Processing',
      desc: 'Process 1, 5, 10, or 20+ photos simultaneously with automatic proportion scaling, rotation calibration, and orientation alignment for multi-member family orders.',
      badge: 'Batch Processing',
      icon: Layers
    },
    {
      title: 'Passport-Size & Visa Photo Preparation',
      desc: 'Automatic face landmark detection and biometric proportion cropping complying with Indian Passport (35x45mm), US Visa (2x2 inch), Schengen, and Stamp size standards.',
      badge: 'Biometric AI',
      icon: Cpu
    },
    {
      title: 'Multiple Photo Sheet Printing',
      desc: 'Composes multi-photo grids on 4x6, 5x7, and A4 photo paper sheets with crisp cutting guides and custom border margins for easy manual cutting.',
      badge: 'Smart Layouts',
      icon: Scissors
    },
    {
      title: 'Customer Self-Service QR Kiosk',
      desc: 'Customers scan a QR code placed on your shop desk using any smartphone. No mobile app download needed. Direct mobile camera and gallery upload with instant preview.',
      badge: 'Zero Waiting Time',
      icon: QrCode
    },
    {
      title: 'Restore Mode & Background Removal',
      desc: 'Embedded local Rembg AI engine isolates human portraits and replaces cluttered home backgrounds with studio white, light blue, or custom solid backdrops in seconds.',
      badge: '100% Offline AI',
      icon: Sparkles
    },
    {
      title: 'ID Card Preparation',
      desc: 'Quickly prepare and format standardized citizen portrait photographs for PVC smart cards, student admission badges, and corporate credentials.',
      badge: 'PVC & ID Cards',
      icon: FileCheck
    },
    {
      title: 'Photo Processing Workflows',
      desc: 'Seamless pipeline from counter QR upload to 1-click Windows desktop printing, eliminating messy file sharing over WhatsApp, Bluetooth, or email.',
      badge: 'Automated Pipeline',
      icon: Zap
    },
    {
      title: 'Desktop Software Licensing & Pairing',
      desc: 'Lightweight standalone Windows installer with 6-digit terminal pairing. Flexible pay-as-you-grow credit licensing at ₹2 per photo with lifetime validity.',
      badge: 'No Subscription',
      icon: CreditCard
    },
    {
      title: 'Product-Related Support & Diagnostics',
      desc: 'Integrated printer driver diagnostics, real-time socket communication, and dedicated technical helpdesk for studio hardware configuration.',
      badge: 'Dedicated Help',
      icon: Headphones
    }
  ];

  return (
    <div className="min-h-screen text-slate-100 selection:bg-indigo-500 selection:text-white">
      <SEO
        title="Prime ID Pro Features – Bulk Photo, QR Scanner & More"
        description="Explore Prime ID Pro features: Bulk photo processing, passport photo preparation, QR kiosk scanning, local AI background removal, and 300 DPI direct printing."
        canonical="https://primeidpro.online/features"
      />

      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Zap className="w-3.5 h-3.5" /> Comprehensive Feature Suite
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Engineered For High-Speed CSC &amp; Cyber Cafe Workflows
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-400">
            Discover why digital center operators across India rely on Prime ID Pro for rapid passport photo processing, multi-photo layouts, and direct printer streaming.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureList.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="bg-slate-900/70 border border-slate-800 p-8 rounded-3xl relative flex flex-col justify-between hover:border-indigo-500/40 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-block px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold rounded-full">
                      {f.badge}
                    </span>
                    <div className="p-2 rounded-xl bg-slate-800 border border-slate-700/60 text-indigo-400 group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-20 bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-indigo-950/80 border border-indigo-500/30 rounded-3xl p-10 sm:p-12 text-center relative overflow-hidden backdrop-blur-xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Experience High-Speed Photo Processing Today
          </h2>
          <p className="mt-3 text-slate-300 max-w-xl mx-auto text-sm">
            Sign up your CSC / Cyber Cafe center in under 2 minutes and start printing with instant starter credits.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/buy"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all text-sm"
            >
              Buy Software &amp; Credits <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/download"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-all text-sm"
            >
              Download Windows App
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
