import React from 'react';
import { RefreshCw, Coins, Printer, ShieldCheck, Clock, AlertTriangle, Mail } from 'lucide-react';
import SEO from '../../components/SEO';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen text-slate-100 selection:bg-indigo-500 selection:text-white">
      <SEO
        title="Refund & Cancellation Policy – Prime ID Pro"
        description="Official Refund and Cancellation Policy for Prime ID Pro. Clear terms for credit wallet top-ups, transaction disputes, and payment reconciliations."
        canonical="https://primeidpro.online/refund-policy"
      />

      <section className="py-16 lg:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
            <RefreshCw className="w-3.5 h-3.5" /> Financial Policies
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Refund &amp; Cancellation Policy
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            Last Updated: January 1, 2026 • Platform: https://primeidpro.online
          </p>
        </div>

        <div className="space-y-8 text-sm text-slate-300 leading-relaxed bg-slate-900/70 border border-slate-800 p-8 sm:p-10 rounded-3xl backdrop-blur-xl">
          {/* Section 1 */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" /> 1. Digital Credit Wallet Purchases
            </h2>
            <p>
              Credit top-up packages purchased on Prime ID Pro (Starter Pack ₹100, Growth Pack ₹500, Studio Pro ₹1,000, Enterprise Hub ₹2,000) are digital software goods that are delivered and credited immediately to your studio operator wallet upon successful payment verification.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-3 pt-6 border-t border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" /> 2. Payment Failures &amp; Auto-Reconciliation
            </h2>
            <p>
              In rare instances where an amount is debited from your bank account or UPI application via Razorpay but credits do not immediately appear due to network drops:
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs text-slate-300">
              <li>Our automated webhook server verifies and reconciles the transaction within <strong>5 to 10 minutes</strong>.</li>
              <li>If the payment fails to authenticate or cannot be reconciled, Razorpay automatically reverses the amount back to your source bank account, credit/debit card, or UPI handle within <strong>5 to 7 business days</strong> as per standard banking protocol.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-3 pt-6 border-t border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Printer className="w-5 h-5 text-indigo-400" /> 3. Customer Kiosk Orders &amp; Hardware Errors
            </h2>
            <p>
              If a customer places an order via the counter QR Kiosk and a local hardware malfunction occurs (e.g. printer paper jam, ribbon outage, physical printer disconnection):
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs text-slate-300">
              <li>The center operator can immediately re-trigger the print job from the desktop queue without incurring duplicate platform credit charges.</li>
              <li>If physical fulfillment is not possible, the operator can issue an immediate cash or UPI refund directly to the customer at the center desk.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="space-y-3 pt-6 border-t border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-cyan-400" /> 4. Cancellation Policy
            </h2>
            <p>
              Because wallet credits are immediately usable upon purchase and do not expire, credit package purchases cannot be cancelled once used. If a studio center wishes to deactivate their account with an unutilized balance, they can submit a refund request to our support desk.
            </p>
          </div>

          {/* Section 5 */}
          <div className="space-y-3 pt-6 border-t border-slate-800">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-rose-400" /> 5. Dispute Resolution &amp; Support Contact
            </h2>
            <p>
              If you experience any billing discrepancy or payment issue, contact our support team with your <strong>Razorpay Payment ID</strong> and Registered Email/Phone:
            </p>
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
              <div className="text-white font-bold">Prime ID Pro Billing &amp; Reconciliation Support</div>
              <div className="text-slate-400">Email: <span className="font-mono text-indigo-400">primeidpro@gmail.com</span></div>
              <div className="text-slate-400">WhatsApp Helpline: <span className="text-slate-200">+91 9831665184 (WhatsApp Only)</span></div>
              <div className="text-slate-400">Response Window: Within 24 hours (Monday – Saturday)</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
