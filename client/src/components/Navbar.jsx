import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Camera,
  Search,
  Store,
  ShieldAlert,
  LogOut,
  Sparkles,
  CreditCard,
  Download,
  Menu,
  X,
  Layers,
  HelpCircle,
  ArrowRight,
  UserCheck
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isSuperAdmin, isCscOperator, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#070B14]/85 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" onClick={closeMobile} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#070B14] rounded-[10px] flex items-center justify-center">
              <Camera className="w-5 h-5 text-indigo-400 group-hover:text-white transition-colors" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                PRIME ID
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-extrabold rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 tracking-wider uppercase">
                PRO
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block -mt-1 tracking-wider font-mono">
              Central Platform
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-medium text-slate-300">
          <Link
            to="/features"
            className={`px-3 py-1.5 rounded-lg transition-all ${
              isActive('/features')
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Features
          </Link>

          <Link
            to="/pricing"
            className={`px-3 py-1.5 rounded-lg transition-all ${
              isActive('/pricing')
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Pricing & Credits
          </Link>

          <Link
            to="/download"
            className={`px-3 py-1.5 rounded-lg transition-all ${
              isActive('/download')
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Desktop App
          </Link>

          <Link
            to="/order"
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              isActive('/order')
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                : 'text-indigo-300 hover:text-white hover:bg-indigo-950/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Order Photos
          </Link>

          <Link
            to="/track"
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              isActive('/track')
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            Track Order
          </Link>
        </nav>

        {/* Right Desktop Actions */}
        <div className="hidden sm:flex items-center gap-2.5">
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {isSuperAdmin && (
                <Link
                  to="/admin/dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold hover:bg-rose-500/20 transition-all"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  Admin Hub
                </Link>
              )}

              {isCscOperator && (
                <Link
                  to="/csc/dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/20 transition-all"
                >
                  <Store className="w-3.5 h-3.5 text-emerald-400" />
                  CSC Portal
                </Link>
              )}

              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="text-right hidden md:block">
                  <div className="text-xs font-bold text-white leading-tight">{user?.name}</div>
                  <div className="text-[10px] text-slate-400 capitalize">
                    {user?.role?.replace('_', ' ').toLowerCase()}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/30 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 rounded-xl shadow-lg shadow-indigo-600/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-1.5"
              >
                <Store className="w-3.5 h-3.5" />
                CSC Partner Login
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-2xl px-4 py-5 space-y-3 animate-fade-in">
          <nav className="space-y-1">
            <Link
              to="/features"
              onClick={closeMobile}
              className={`block px-3.5 py-2 rounded-xl text-sm font-medium ${
                isActive('/features') ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              Features
            </Link>
            <Link
              to="/pricing"
              onClick={closeMobile}
              className={`block px-3.5 py-2 rounded-xl text-sm font-medium ${
                isActive('/pricing') ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              Pricing & Credits
            </Link>
            <Link
              to="/download"
              onClick={closeMobile}
              className={`block px-3.5 py-2 rounded-xl text-sm font-medium ${
                isActive('/download') ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              Windows Desktop App
            </Link>
            <Link
              to="/order"
              onClick={closeMobile}
              className={`block px-3.5 py-2 rounded-xl text-sm font-medium ${
                isActive('/order') ? 'bg-indigo-600/20 text-indigo-300' : 'text-indigo-400 hover:bg-slate-900'
              }`}
            >
              Order Photos Now
            </Link>
            <Link
              to="/track"
              onClick={closeMobile}
              className={`block px-3.5 py-2 rounded-xl text-sm font-medium ${
                isActive('/track') ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              Track Order Status
            </Link>
            <Link
              to="/faq"
              onClick={closeMobile}
              className={`block px-3.5 py-2 rounded-xl text-sm font-medium ${
                isActive('/faq') ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-300 hover:bg-slate-900'
              }`}
            >
              Help & FAQ
            </Link>
          </nav>

          <div className="pt-3 border-t border-slate-800 space-y-2">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <div className="font-bold text-white">{user?.name}</div>
                  <div className="text-slate-400 capitalize">{user?.role?.replace('_', ' ').toLowerCase()}</div>
                </div>
                {isSuperAdmin && (
                  <Link
                    to="/admin/dashboard"
                    onClick={closeMobile}
                    className="block w-full py-2.5 px-3 rounded-xl text-center text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  >
                    Super Admin Hub
                  </Link>
                )}
                {isCscOperator && (
                  <Link
                    to="/csc/dashboard"
                    onClick={closeMobile}
                    className="block w-full py-2.5 px-3 rounded-xl text-center text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  >
                    CSC Studio Portal
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 px-3 rounded-xl text-center text-xs font-bold bg-slate-900 text-rose-400 border border-slate-800 hover:bg-rose-500/20"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={closeMobile}
                  className="py-2.5 text-center text-xs font-semibold text-slate-300 bg-slate-900 rounded-xl border border-slate-800"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobile}
                  className="py-2.5 text-center text-xs font-bold text-white bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/30"
                >
                  Start Center
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
