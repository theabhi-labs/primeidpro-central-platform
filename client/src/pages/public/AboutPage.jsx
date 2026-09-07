import React from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  Layers,
  Sparkles,
  Printer,
  ShieldCheck,
  Cpu,
  Users,
  Store,
  CheckCircle2,
  ArrowRight,
  Lock,
  Headphones,
  QrCode,
  Laptop,
  Linkedin,
  Mail
} from 'lucide-react';
import SEO from '../../components/SEO';

export default function AboutPage() {
  const targetAudiences = [
    {
      title: 'CSC Center Operators',
      desc: 'Process citizen passport photos, government scheme ID pictures, and exam application photos in seconds directly at your center desk.'
    },
    {
      title: 'Cyber Cafés & Internet Kiosks',
      desc: 'Allow walk-in customers to self-upload via QR codes, eliminating WhatsApp and Bluetooth file transfer clutter.'
    },
    {
      title: 'Professional Photo Studios',
      desc: 'Utilize automated AI background removal and 300 DPI raw driver streaming to high-speed dye-sublimation printers.'
    },
    {
      title: 'Printing & Photocopy Shops',
      desc: 'Generate multi-photo batch layouts (4x6, 5x7, A4) with automatic cutting guides for family and student group orders.'
    },
    {
      title: 'Computer Centres & Institutes',
      desc: 'Prepare standardized student ID photos, admit card photos, and batch admission photos with consistent proportions.'
    },
    {
      title: 'Commercial Enterprises',
      desc: 'Streamline employee ID badge photo preparation with automated background normalization and high-speed batch output.'
    }
  ];

  const coreServices = [
    {
      title: 'Bulk Photo Processing',
      desc: 'Process multiple individual customer photos or large family groups simultaneously with automatic resizing and orientation.'
    },
    {
      title: 'Passport-Size Photo Preparation',
      desc: 'Automatic biometric proportion calibration adhering to Indian Passport (35x45mm), PAN Card, Stamp, and international Visa standards.'
    },
    {
      title: 'Multiple Photo Printing',
      desc: 'Automatically compose multi-photo grids on 4x6, 5x7, and A4 photo paper sheets with crisp cut guidelines.'
    },
    {
      title: 'Customer QR Code Scanning',
      desc: 'Self-service QR kiosk allows customers to upload photos from their smartphone gallery without downloading any mobile app.'
    },
    {
      title: 'Restore Mode & Touchups',
      desc: 'Local AI background replacement (studio white, light blue, solid colors) and sharpness enhancement.'
    },
    {
      title: 'ID Card Preparation',
      desc: 'Format digital photographs for PVC smart cards, student identification badges, and corporate credentials.'
    },
    {
      title: 'Photo Processing Workflows',
      desc: 'End-to-end operational pipeline from counter QR upload to 1-click Windows desktop printing.'
    },
    {
      title: 'Desktop Software Licensing',
      desc: 'Affordable, transparent pay-per-photo credit licensing with lifetime validity and zero forced monthly subscriptions.'
    },
    {
      title: 'Product-Related Support',
      desc: 'Dedicated technical assistance for hardware driver configuration, terminal pairing, and ledger reconciliation.'
    }
  ];

  return (
    <div className="min-h-screen text-slate-100 selection:bg-indigo-500 selection:text-white">
      <SEO
        title="About Prime ID Pro – Photo Processing Software"
        description="Learn about Prime ID Pro, the premier desktop photo processing software for CSC operators, cyber cafés, photo studios, and printing shops across India."
        canonical="https://primeidpro.online/about"
      />

      <section className="py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Laptop className="w-3.5 h-3.5" /> About Prime ID Pro
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Empowering Digital Centers With High-Speed Photo Technology
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-400">
            Prime ID Pro is an advanced Windows desktop software platform engineered to simplify photo processing, passport photo preparation, and direct printing for commercial operators across India.
          </p>
        </div>

        {/* Mission & Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              What Is Prime ID Pro?
            </h2>
            <p>
              Prime ID Pro is a comprehensive desktop software solution tailored specifically for businesses that process and print photographs daily. Traditional photo cropping, background replacement, and printer sizing often involve complicated multi-step software and manual file transfer over WhatsApp or Bluetooth.
            </p>
            <p>
              Prime ID Pro replaces this fragmented workflow with a unified, high-speed ecosystem. Customers scan a personalized counter QR code to upload photos from their mobile browser. The photos transfer seamlessly to the operator's Windows desktop application, where offline AI automatically handles face landmark alignment, background replacement, and 300 DPI raw printer streaming in a single click.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/features"
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all text-xs flex items-center gap-2"
              >
                Explore Features <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/buy"
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 transition-all text-xs"
              >
                View Plans &amp; Pricing
              </Link>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Our Core Principles
            </h3>
            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-indigo-400" /> 100% Offline AI Reliability
                </div>
                <p className="text-slate-400">
                  Critical image processing algorithms (face detection, Rembg background removal, print rendering) execute directly on the local PC without depending on internet speed.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-400" /> 10-Minute Privacy Auto-Purge
                </div>
                <p className="text-slate-400">
                  Customer uploaded photos are strictly temporary and are permanently purged 10 minutes post-printing to guarantee citizen biometric privacy.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-cyan-400" /> Operator First Economics
                </div>
                <p className="text-slate-400">
                  Pay-as-you-grow credit licensing at ₹2 per photo. Zero forced recurring subscriptions; 100% of customer counter payments remain with the center owner.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Who We Serve */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">
              Target Customers
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">
              Built For Commercial Photo &amp; Document Centers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {targetAudiences.map((aud, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 hover:border-indigo-500/30 transition-all"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <h3 className="text-sm font-bold text-white">{aud.title}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed pl-6">{aud.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Comprehensive Services Grid */}
        <div className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">
              Our Capabilities
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">
              Software Services &amp; Technical Capabilities
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {coreServices.map((srv, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2"
              >
                <h3 className="text-sm font-bold text-indigo-300">{srv.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{srv.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Leadership & Founder Section */}
        <div className="mb-20 p-8 sm:p-10 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Leadership &amp; Engineering</span>
            <h3 className="text-xl sm:text-2xl font-bold text-white">Abhishek Yadav (Founder &amp; Lead Architect)</h3>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Leading the development of Prime ID Pro's high-speed image processing engine and secure cloud synchronization platform.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://www.linkedin.com/in/abhishek-yadav-rootabhi/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <Linkedin className="w-4 h-4" /> Connect on LinkedIn
            </a>
            <a
              href="mailto:primeidpro@gmail.com"
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
            >
              <Mail className="w-4 h-4" /> Email
            </a>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="p-10 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-4">
          <h3 className="text-2xl font-bold text-white">Have Questions or Need Help Getting Started?</h3>
          <p className="text-xs text-slate-400 max-w-lg mx-auto">
            Our support team is ready to assist you with printer driver configuration, wallet top-ups, and studio onboarding.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <Headphones className="w-4 h-4" /> Contact Support
            </Link>
            <Link
              to="/download"
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition-all"
            >
              Download Windows Software
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
