import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Zap, Printer, Sparkles, Server, CheckCircle2, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#050811] text-slate-400 text-sm py-16 px-4 sm:px-6 lg:px-8 mt-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
        {/* Brand & Mission Statement */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Printer className="w-4 h-4" />
            </div>
            <span className="font-black text-xl text-white tracking-tight">PRIME ID PRO</span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-400 font-mono border border-indigo-500/25">
              CENTRAL
            </span>
          </div>
          
          <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
            India's premiere automated photo processing and high-speed desktop printing ecosystem for CSC centers, cyber cafes, photocopy shops, and professional photo studios.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[11px] font-mono text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Platform Status: 100% Operational
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              256-Bit Razorpay Encrypted
            </div>
          </div>
        </div>

        {/* Product & Solutions */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Product &amp; Pricing</h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <Link to="/features" className="hover:text-indigo-400 transition-colors">
                Software Features
              </Link>
            </li>
            <li>
              <Link to="/pricing" className="hover:text-indigo-400 transition-colors">
                Pricing &amp; Plans
              </Link>
            </li>
            <li>
              <Link to="/buy" className="hover:text-indigo-400 transition-colors flex items-center gap-1 font-semibold text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Buy Prime ID Pro
              </Link>
            </li>
            <li>
              <Link to="/download" className="hover:text-indigo-400 transition-colors">
                Download Desktop App
              </Link>
            </li>
            <li>
              <Link to="/order" className="hover:text-indigo-400 transition-colors">
                Customer Kiosk Order
              </Link>
            </li>
          </ul>
        </div>

        {/* Company & Support */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Company &amp; Support</h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <Link to="/about" className="hover:text-indigo-400 transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-indigo-400 transition-colors">
                Contact Us
              </Link>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/in/abhishek-yadav-rootabhi/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-blue-400 transition-colors flex items-center gap-1.5 text-blue-300"
              >
                <Linkedin className="w-3.5 h-3.5 text-blue-400" />
                Founder LinkedIn
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/919831665184"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-400 transition-colors text-emerald-300"
              >
                WhatsApp: +91 9831665184
              </a>
            </li>
            <li>
              <a
                href="mailto:primeidpro@gmail.com"
                className="hover:text-indigo-400 transition-colors font-mono"
              >
                primeidpro@gmail.com
              </a>
            </li>
          </ul>
        </div>

        {/* Legal & Policy Pages */}
        <div>
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Legal &amp; Policies</h4>
          <ul className="space-y-2.5 text-xs mb-4">
            <li>
              <Link to="/privacy-policy" className="hover:text-indigo-400 transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms-and-conditions" className="hover:text-indigo-400 transition-colors">
                Terms &amp; Conditions
              </Link>
            </li>
            <li>
              <Link to="/refund-policy" className="hover:text-indigo-400 transition-colors">
                Refund &amp; Cancellation
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-indigo-400 transition-colors">
                Support &amp; Grievance
              </Link>
            </li>
          </ul>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-indigo-400 font-semibold text-[11px]">
              <Lock className="w-3.5 h-3.5" />
              10-Minute Auto-Purge
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              Customer photos are strictly temporary and auto-deleted 10 minutes post-printing.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div>
          © {new Date().getFullYear()} Prime ID Pro (primeidpro.online). All rights reserved.
        </div>
        <div className="flex items-center gap-2">
          <span>Engineered for high-volume automated digital photography across India.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
