import React from 'react';
import { ShieldCheck, Lock, Clock, Database, EyeOff, Mail, FileText, CheckCircle2 } from 'lucide-react';
import SEO from '../../components/SEO';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen text-slate-100 selection:bg-indigo-500 selection:text-white">
      <SEO
        title="Privacy Policy – Prime ID Pro"
        description="Official Privacy Policy of Prime ID Pro. Details on our 10-minute ephemeral photo auto-purge, local AI biometric processing, and secure 256-bit encryption."
        canonical="https://primeidpro.online/privacy-policy"
      />

      <section className="py-16 lg:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-3.5 h-3.5" /> Biometric Privacy &amp; Data Security
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Privacy Policy &amp; Data Protection
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            Last Updated: January 1, 2026 • Platform: https://primeidpro.online
          </p>
        </div>

        <div className="space-y-8 text-sm text-slate-300 leading-relaxed bg-slate-900/70 border border-slate-800 p-8 sm:p-10 rounded-3xl backdrop-blur-xl">
          {/* Section 1 */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" /> 1. Ephemeral Storage &amp; 10-Minute Automatic Purge
            </h2>
            <p>
              Prime ID Pro is engineered with privacy-by-design principles. Customer photos uploaded through our counter QR kiosk or web order portal are treated as strictly ephemeral, temporary data.
            </p>
            <p>
              Upon print job completion and physical receipt confirmation by the local desktop application, our automated background sweeper permanently deletes all photo binaries from cloud object storage within exactly <strong>10 minutes</strong>. We do not maintain any permanent gallery, archive, or database of citizen photographs.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3 pt-6 border-t border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-400" /> 2. Data Encryption &amp; Payment Security
            </h2>
            <p>
              All network transmissions between customer mobile web browsers, cloud synchronization servers, and local Windows desktop clients are encrypted in transit using industry-standard TLS 1.3 encryption.
            </p>
            <p>
              All online payment transactions (credit wallet top-ups and customer kiosk orders) are processed securely through <strong>Razorpay</strong> via PCI-DSS compliant checkout. Sensitive financial details such as card numbers, CVVs, and UPI PINs are handled exclusively by Razorpay and are never accessed, stored, or processed on our servers.
            </p>
          </div>

          {/* Section 3 */}
          <div className="space-y-3 pt-6 border-t border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <EyeOff className="w-5 h-5 text-cyan-400" /> 3. Local Biometric Image Processing
            </h2>
            <p>
              Facial landmark detection, proportion scaling, and AI background segmentation (via embedded Rembg and OpenCV engines) occur <strong>locally on the operator's PC hardware</strong>. Raw biometric measurements are never transmitted to external cloud servers or sold to third-party data brokers.
            </p>
          </div>

          {/* Section 4 */}
          <div className="space-y-3 pt-6 border-t border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-400" /> 4. Studio Partner &amp; Account Information
            </h2>
            <p>
              When a CSC operator or studio center registers on Prime ID Pro, we collect basic contact information (operator name, center name, email address, phone number, and physical center address). This information is utilized exclusively for account authentication, hardware terminal pairing, financial accounting, and platform support communications.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-3 pt-6 border-t border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-rose-400" /> 5. User Rights &amp; Data Deletion Requests
            </h2>
            <p>
              Studio operators and customers have the right to request access to or deletion of their account records at any time. Because customer photos are automatically purged after 10 minutes, no photo data retention exists to be deleted manually.
            </p>
          </div>

          {/* Section 6 */}
          <div className="space-y-3 pt-6 border-t border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-400" /> 6. Privacy Officer &amp; Inquiries
            </h2>
            <p>
              If you have any questions or concerns regarding our privacy practices, you can contact our privacy officer directly:
            </p>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
              <div className="text-white font-bold">Prime ID Pro Privacy &amp; Compliance Team</div>
              <div className="text-slate-400">Email: <span className="font-mono text-indigo-400">support@primeidpro.online</span></div>
              <div className="text-slate-400">Website: https://primeidpro.online</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
