import React from 'react';
import { RefreshCw, Coins, Printer, ShieldCheck } from 'lucide-react';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen text-slate-100 selection:bg-indigo-500 selection:text-white">
      <section className="py-16 lg:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
            <RefreshCw className="w-3.5 h-3.5" /> Financial Policy
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Refund &amp; Cancellation Policy
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            Effective Date: January 1, 2026 • Platform: https://primeidpro.online
          </p>
        </div>

        <div className="space-y-6 text-sm text-slate-300 leading-relaxed bg-slate-900/70 border border-slate-800 p-8 sm:p-10 rounded-3xl backdrop-blur-xl">
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" /> 1. Studio Credit Wallet Purchases
            </h2>
            <p>
              Credit top-ups for CSC Studio Centers are digital goods credited immediately to your operator wallet. If a payment succeeds on Razorpay but credits are delayed due to network drops, our automated webhook reconciles the transaction within 5 minutes. If an irrecoverable payment failure occurs, refunds are initiated back to the source bank account or UPI handle within 5-7 business days.
            </p>
          </div>

          <div className="space-y-3 pt-6 border-t border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Printer className="w-5 h-5 text-indigo-400" /> 2. Customer Online &amp; Kiosk Orders
            </h2>
            <p>
              For customer online orders, if a print job fails due to local hardware error (e.g. printer paper jam, ink outage), the studio operator can instantly re-trigger the print or issue a direct cash refund at the counter.
            </p>
          </div>

          <div className="space-y-3 pt-6 border-t border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" /> 3. Dispute Resolution
            </h2>
            <p>
              If you experience any billing discrepancy, contact our support team at <strong className="text-white font-mono">support@primeidpro.online</strong> with your Razorpay Payment ID or Studio Center ID for swift reconciliation.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
