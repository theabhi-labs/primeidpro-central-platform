import React from 'react';
import { Link } from 'react-router-dom';
import { Download, Monitor, CheckCircle2, ShieldCheck, HardDrive, Zap, Cpu, Key, ArrowRight } from 'lucide-react';
import SEO from '../../components/SEO';

export default function DownloadPage() {
  return (
    <div className="min-h-screen text-slate-100 selection:bg-indigo-500 selection:text-white">
      <SEO
        title="Download Prime ID Pro Desktop App – Windows Setup"
        description="Download Prime ID Pro Windows desktop application. 100% offline AI photo processing, local background removal, face mesh cropping, and 300 DPI direct printing."
        canonical="https://primeidpro.online/download"
      />

      <section className="py-16 lg:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Monitor className="w-3.5 h-3.5" /> Windows 10 &amp; 11 64-Bit Edition
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Download Prime ID Pro Desktop App
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
            The ultra-fast, 100% offline-ready desktop client for Windows PCs. Handles local AI background removal, face mesh calibration, and raw 300 DPI direct printer streaming.
          </p>
        </div>

        {/* Download Showcase Box */}
        <div className="bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full">
                Latest Stable Release: v1.0.0 (Production Ready)
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Prime ID Pro for Windows (x64)
              </h2>
              <p className="text-sm text-slate-400 max-w-md leading-relaxed">
                Includes embedded Rembg AI engine, OpenCV face detector, SQLite WAL local queue, and direct Windows printer drivers.
              </p>
              <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400 pt-2">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Digitally Signed
                </span>
                <span className="flex items-center gap-1.5">
                  <HardDrive className="w-4 h-4 text-indigo-400" /> ~267 MB Standalone Installer
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 w-full md:w-auto">
              <a
                href="https://github.com/theabhi-labs/primeidpro-core/releases/download/v1.0.0/PrimeIdPro.Setup.1.0.0.exe"
                className="w-full md:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5"
              >
                <Download className="w-5 h-5" />
                Download for Windows (x64)
              </a>
              <span className="text-[11px] text-slate-500">
                Supports Windows 10 (Build 19041+) &amp; Windows 11
              </span>
            </div>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Zero cloud dependency for editing</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>DNP, Canon, Epson, Brother ready</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>6-Digit Kiosk pairing code</span>
            </div>
          </div>
        </div>

        {/* 3 Step Installation & Activation Guide */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Step 1</div>
            <h4 className="text-sm font-bold text-white">Download &amp; Install</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Run `PrimeIdPro.Setup.1.0.0.exe` on your Windows PC. No manual configuration or third-party plugins needed.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Step 2</div>
            <h4 className="text-sm font-bold text-white">Pair Your Machine</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Log in to your operator dashboard, generate a 6-digit terminal code, and enter it inside the desktop software.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 3</div>
            <h4 className="text-sm font-bold text-white">Start Direct Printing</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Place your counter QR code. Orders stream automatically to your local print queue for 1-click output.
            </p>
          </div>
        </div>

        {/* Pairing Guide CTA */}
        <div className="mt-10 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-white">Need to register your studio or top up credits?</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Create your operator account in under 2 minutes or purchase print credit packs.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/buy"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all shrink-0"
            >
              Buy License Packs
            </Link>
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all shrink-0"
            >
              Operator Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
