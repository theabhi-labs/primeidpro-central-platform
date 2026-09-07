import React from 'react';
import { FileText, Shield, Coins, Laptop, AlertCircle, Scale, CheckCircle2, Mail } from 'lucide-react';
import SEO from '../../components/SEO';

export default function TermsPage() {
  return (
    <div className="min-h-screen text-slate-100 selection:bg-indigo-500 selection:text-white">
      <SEO
        title="Terms & Conditions – Prime ID Pro"
        description="Official Terms and Conditions for Prime ID Pro Central Platform and Desktop Software. License rules, credit wallet terms, and user guidelines."
        canonical="https://primeidpro.online/terms-and-conditions"
      />

      <section className="py-16 lg:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
            <FileText className="w-3.5 h-3.5" /> Legal Terms
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Terms and Conditions
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            Last Updated: January 1, 2026 • Platform: https://primeidpro.online
          </p>
        </div>

        <div className="space-y-8 text-sm text-slate-300 leading-relaxed bg-slate-900/70 border border-slate-800 p-8 sm:p-10 rounded-3xl backdrop-blur-xl">
          {/* Section 1 */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400" /> 1. Acceptance of Terms &amp; Scope of Service
            </h2>
            <p>
              By accessing the Prime ID Pro Central Platform (https://primeidpro.online) or downloading, installing, and utilizing the Prime ID Pro Windows desktop application, you acknowledge that you have read, understood, and agreed to be bound by these Terms and Conditions.
            </p>
            <p>
              Prime ID Pro provides software tools for bulk photo processing, passport-size photo preparation, multi-photo layout printing, QR kiosk scanning, restore mode, ID card preparation, and desktop software licensing.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3 pt-6 border-t border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Laptop className="w-5 h-5 text-cyan-400" /> 2. Software Licensing &amp; Usage Rights
            </h2>
            <p>
              Prime ID Pro grants operators a non-exclusive, non-transferable digital license to operate the desktop software on paired Windows workstations. Operators may not reverse engineer, decompile, redistribute, or resell the underlying software binary.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-3 pt-6 border-t border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" /> 3. Credit Wallet &amp; Pay-Per-Photo Rules
            </h2>
            <p>
              Platform services operate on a transparent pay-per-photo credit model:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs text-slate-300">
              <li>Each processed photo print consumes exactly <strong>2 credits (equivalent to ₹2.00 INR)</strong>.</li>
              <li>Studio wallets maintain an immutable, non-negative balance ledger.</li>
              <li>Deductions occur atomically upon successful physical print execution by the desktop application.</li>
              <li>Purchased credits carry <strong>lifetime validity</strong> and never expire.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="space-y-3 pt-6 border-t border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-emerald-400" /> 4. Payments &amp; Online Processing
            </h2>
            <p>
              All credit purchases and online customer payments are processed via Razorpay. By initiating a transaction, you authorize payment of the specified amount in Indian Rupees (INR). All payments are subject to our <strong>Refund &amp; Cancellation Policy</strong>.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-3 pt-6 border-t border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-rose-400" /> 5. Hardware &amp; Operational Responsibilities
            </h2>
            <p>
              Studio operators are independently responsible for maintaining compatible Windows hardware, photo printers (e.g. DNP, Canon, Epson, Brother), ink cartridges, and paper stock. Prime ID Pro does not manufacture physical printing hardware.
            </p>
          </div>

          {/* Section 6 */}
          <div className="space-y-3 pt-6 border-t border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-400" /> 6. Support &amp; Grievance Redressal
            </h2>
            <p>
              For legal inquiries, account issues, or operational support, contact our team:
            </p>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
              <div className="text-white font-bold">Prime ID Pro Legal &amp; Support Team</div>
              <div className="text-slate-400">Email: <span className="font-mono text-indigo-400">support@primeidpro.online</span></div>
              <div className="text-slate-400">Helpline: +91 98765 43210</div>
              <div className="text-slate-400">Website: https://primeidpro.online</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
