import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Printer,
  QrCode,
  Wallet,
  Laptop,
  Users,
  ShieldAlert,
  Coins,
  Settings,
  Sliders,
  Sparkles,
  ArrowLeft,
  Activity,
  FileCheck
} from 'lucide-react';

const Sidebar = ({ type = 'csc' }) => {
  const { user, studioCenter } = useAuth();
  const navigate = useNavigate();

  const cscLinks = [
    { to: '/csc/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/csc/jobs', icon: Printer, label: 'Print Queue' },
    { to: '/csc/walk-in', icon: Sparkles, label: 'Walk-in Customer' },
    { to: '/csc/kiosk-qr', icon: QrCode, label: 'Counter Kiosk QR' },
    { to: '/csc/settings', icon: Settings, label: 'Service Settings' },
    { to: '/csc/devices', icon: Laptop, label: 'Desktop Clients' },
    { to: '/csc/wallet', icon: Wallet, label: 'Wallet & Ledger' }
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/admin/studios', icon: Users, label: 'CSC Studios' },
    { to: '/admin/devices', icon: Laptop, label: 'Desktop Devices' },
    { to: '/admin/jobs', icon: Activity, label: 'Global Job Feed' },
    { to: '/admin/ledger', icon: Coins, label: 'Financial Ledger' },
    { to: '/admin/pricing', icon: Sliders, label: 'Pricing Matrix' },
    { to: '/admin/releases', icon: FileCheck, label: 'Desktop Releases' },
    { to: '/admin/settings', icon: Settings, label: 'Diagnostics & Config' }
  ];

  const links = type === 'admin' ? adminLinks : cscLinks;

  return (
    <aside className="w-64 bg-slate-950/70 border-r border-slate-800/80 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between backdrop-blur-xl">
      <div className="space-y-6">
        {/* Portal Header Profile Card */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
            {type === 'admin' ? '🛡️ Super Admin Control' : '🏪 CSC Studio Portal'}
          </div>
          <div className="font-bold text-sm text-white truncate">
            {type === 'admin' ? user?.name : studioCenter?.centerName || 'Studio Center'}
          </div>
          {type === 'csc' && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">Credit Balance:</span>
              <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                ₹{studioCenter?.walletBalance || 0}
              </span>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? type === 'admin'
                        ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30 shadow-lg shadow-rose-950/50'
                        : 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-lg shadow-indigo-950/50'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Return to Public Store */}
      <div className="pt-4 border-t border-slate-800/80">
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Customer Storefront
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
