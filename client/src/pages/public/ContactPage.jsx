import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, CheckCircle2, Headphones, Clock, HelpCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import SEO from '../../components/SEO';

export default function ContactPage() {
  const { success } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    inquiryType: 'Technical Support',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      success('Thank you for contacting Prime ID Pro! Our support team will reach out within 24 hours.');
      setForm({ name: '', email: '', phone: '', inquiryType: 'Technical Support', message: '' });
    }, 400);
  };

  return (
    <div className="min-h-screen text-slate-100 selection:bg-indigo-500 selection:text-white">
      <SEO
        title="Contact Prime ID Pro – Sales & Technical Support"
        description="Contact Prime ID Pro for software sales, technical support, printer pairing guidance, and wallet inquiries. Fast response for CSC and studio centers."
        canonical="https://primeidpro.online/contact"
      />

      <section className="py-16 lg:py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Headphones className="w-3.5 h-3.5" /> Sales &amp; Technical Support
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            Get in Touch With Prime ID Pro
          </h1>
          <p className="mt-4 text-base text-slate-400 max-w-xl mx-auto">
            Have questions about desktop printer setup, wallet credit top-ups, or software onboarding? Our engineering and customer support team is here to assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Info cards */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-white">Direct Contact Information</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              We assist digital photo studios, cyber cafés, CSC centers, and photocopy shops across all states in India.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Official Email Support</div>
                  <div className="text-sm font-bold text-white font-mono">support@primeidpro.online</div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Partner &amp; Sales Helpline</div>
                  <div className="text-sm font-bold text-white">+91 98765 43210</div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Operating Support Hours</div>
                  <div className="text-sm font-bold text-white">Mon – Sat, 9:00 AM – 7:00 PM IST</div>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Web Platform Portal</div>
                  <div className="text-sm font-bold text-white">https://primeidpro.online</div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-slate-900/90 border border-slate-800 p-8 rounded-3xl backdrop-blur-xl">
            <h3 className="text-xl font-bold text-white mb-6">Send Us a Message</h3>
            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <div className="font-bold text-white text-base">Message Sent Successfully</div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Thank you for reaching out to Prime ID Pro. A support representative will reply to your registered email or phone within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Your Name *</label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Mobile / Phone *</label>
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                      placeholder="name@studio.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Inquiry Subject</label>
                  <select
                    value={form.inquiryType}
                    onChange={(e) => setForm({ ...form, inquiryType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Technical Support">Technical &amp; Printer Support</option>
                    <option value="Sales Inquiry">Software Purchase &amp; Plans</option>
                    <option value="Wallet Topup">Wallet Top-up &amp; Billing</option>
                    <option value="CSC Partnership">CSC &amp; Studio Partnership</option>
                    <option value="Other">Other Query</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Message *</label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Describe your question, printer model, or requirement..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  <Send className="w-4 h-4" /> {isSubmitting ? 'Sending...' : 'Submit Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
