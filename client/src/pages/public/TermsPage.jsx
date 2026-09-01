import React from 'react';
import { FileText, Shield, Coins, Laptop } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen text-slate-100 selection:bg-indigo-500 selection:text-white">
      <section className="py-16 lg:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
            <FileText className="w-3.5 h-3.5" /> Legal Agreement
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            Last Updated: January 1, 2026 • https://primeidpro.online
          </p>
        </div>

        <div className="space-y-6 text-sm text-slate-300 leading-relaxed bg-slate-900/70 border border-slate-800 p-8 sm:p-10 rounded-3xl backdrop-blur-xl">
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400" /> 1. Acceptance of Terms
            </h2>
            <p>
              By accessing the Prime ID Pro Central Web Platform or using the Prime ID Pro Windows desktop application, you agree to comply with and be bound by these terms. If you do not agree to these terms, please do not use the service.
            </p>
          </div>

          <div className="space-y-3 pt-6 border-t border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" /> 2. Credits &amp; Immutable Wallet Rules
            </h2>
            <p>
              Platform credits are purchased in advance by CSC / Studio operators. Each photo print consumes exactly 2 credits (₹2). Studio wallet balances are strictly non-negative. Deductions are triggered atomically upon verified completion of the print job on the desktop hardware.
            </p>
          </div>

          <div className="space-y-3 pt-6 border-t border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Laptop className="w-5 h-5 text-cyan-400" /> 3. Hardware &amp; Printer Compatibility
            </h2>
            <p>
              Prime ID Pro provides software connectivity for legitimate photo studios and cyber cafes. Operators are responsible for maintaining their own Windows hardware, paper supplies, and printer drivers.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
