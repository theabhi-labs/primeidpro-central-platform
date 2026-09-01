import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, HelpCircle, ArrowRight, Sparkles } from 'lucide-react';

export default function FaqPage() {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: 'What is Prime ID Pro and how does it connect my shop to customers?',
      a: 'Prime ID Pro is an integrated photo processing and high-speed desktop printing ecosystem designed for CSC centers, cyber cafes, photocopy shops, and studio operators across India. It connects mobile customer kiosks to an offline-capable Windows desktop application via cloud sync, eliminating manual photo transfer friction.'
    },
    {
      q: 'How does the Credit System and wallet deduction work?',
      a: 'Prime ID Pro charges 2 credits per photo printed (1 photo = 2 credits = ₹2). There are no recurring monthly subscription fees. Operators purchase credit packages via UPI / Razorpay and use them on demand as customers order. Balance deductions occur upon print job confirmation.'
    },
    {
      q: 'Can multiple photos or family members be processed in a single order?',
      a: 'Yes. Customers can select and upload 1, 2, 3, 5, 10 or 20+ photos in a single order. The desktop client batches them seamlessly and creates multi-photo print sheets with standard cut guides.'
    },
    {
      q: 'How are customer photos kept secure and private?',
      a: 'Customer photos are temporarily held in encrypted object storage and are permanently auto-purged exactly 10 minutes after the desktop app confirms print completion. Photos are never stored permanently in database tables or shared.'
    },
    {
      q: 'How do I pair my desktop computer with my studio account?',
      a: 'Log in to your CSC Operator Portal, navigate to "Desktop Clients", and click "Generate Pairing Code". Enter the 6-digit code inside your Prime ID Pro Windows application to bind the machine securely.'
    },
    {
      q: 'Which printers and paper sizes are supported?',
      a: 'All standard dye-sublimation and inkjet printers from DNP, Canon Selphy, Epson, Brother, and HP on 4x6, 5x7, and A4 photo paper are natively supported.'
    }
  ];

  return (
    <div className="min-h-screen text-slate-100 selection:bg-indigo-500 selection:text-white">
      <section className="py-16 lg:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
            <HelpCircle className="w-3.5 h-3.5" /> Help &amp; Support Center
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-base text-slate-400 max-w-xl mx-auto">
            Everything you need to know about setting up your CSC center, pairing desktop printers, and processing customer orders.
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
                <div className="px-6 pb-6 text-sm sm:text-base text-slate-400 leading-relaxed border-t border-slate-800/50 pt-4 font-normal">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 p-8 rounded-3xl bg-slate-900/70 border border-slate-800 text-center space-y-3">
          <h3 className="text-lg font-bold text-white">Still have questions?</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Our technical support team is available to assist you with printer setup and studio onboarding.
          </p>
          <div className="pt-2">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
            >
              Contact Support <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
