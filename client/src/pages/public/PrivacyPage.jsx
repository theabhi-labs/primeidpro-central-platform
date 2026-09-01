import React from 'react';
import { ShieldCheck, Lock, Clock, Database, EyeOff } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen text-slate-100 selection:bg-indigo-500 selection:text-white">
      <section className="py-16 lg:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-3.5 h-3.5" /> Biometric Privacy &amp; Data Security
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Privacy Policy &amp; 10-Minute Auto-Purge
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            Effective Date: January 1, 2026 • Platform: https://primeidpro.online
          </p>
        </div>

        <div className="space-y-6 text-sm text-slate-300 leading-relaxed bg-slate-900/70 border border-slate-800 p-8 sm:p-10 rounded-3xl backdrop-blur-xl">
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" /> 1. Ephemeral Storage &amp; 10-Minute Automatic Purge
            </h2>
            <p>
              Customer photos uploaded via the Prime ID Pro QR Kiosk or web order portal are treated as strictly ephemeral data. Upon job completion and physical print confirmation by the desktop application, our automated background sweep permanently wipes the photo binaries from cloud object storage within exactly <strong>10 minutes</strong>. We never store customer photos permanently in our database.
            </p>
          </div>

          <div className="space-y-3 pt-6 border-t border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-400" /> 2. Data Encryption &amp; Payment Security
            </h2>
            <p>
              All communication between customer mobile browsers, cloud backend APIs, and local desktop applications is encrypted in transit using TLS 1.3. Payment transactions are processed securely through Razorpay with HMAC SHA-256 cryptographic signatures. No card details or UPI PINs are ever stored on our servers.
            </p>
          </div>

          <div className="space-y-3 pt-6 border-t border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" /> 3. Studio Partner Data
            </h2>
            <p>
              We collect operator contact information (name, business name, email, phone number, and center address) strictly for authentication, hardware terminal pairing, and financial ledger accounting. We do not sell or rent partner data to third parties.
            </p>
          </div>

          <div className="space-y-3 pt-6 border-t border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-rose-400" /> 4. Biometric Data Processing
            </h2>
            <p>
              Facial landmark detection and background segmentation occur locally on the operator's PC via embedded AI engines. Biometric measurements are discarded immediately after print sheet composition.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
