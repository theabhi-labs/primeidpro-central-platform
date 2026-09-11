import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Camera, Lock, Mail, Store, ShieldAlert, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/Button';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const isExpired = searchParams.get('expired');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(email.trim(), password);
      success(`Welcome back, ${user.name}!`);

      if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (user.role === 'CSC_OPERATOR' || user.role === 'CSC') {
        navigate('/csc/dashboard');
      } else {
        navigate('/order');
      }
    } catch (err) {
      error(err.formattedMessage || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Camera className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl text-white tracking-tight">PRIME ID PRO</span>
          </Link>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Sign In to Your Account
          </h2>
          <p className="text-xs text-slate-400">
            Access your CSC Studio dashboard, print queue, or Super Admin control center.
          </p>
        </div>

        {isExpired && (
          <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/40 text-xs text-amber-200 text-center">
            Your session expired. Please sign in again.
          </div>
        )}



        {/* Login Form */}
        <form onSubmit={handleLogin} className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800/80 space-y-5 shadow-2xl backdrop-blur-xl">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                placeholder="name@primeidpro.online"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <Button
            type="submit"
            icon={ArrowRight}
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={loading}
          >
            Sign In
          </Button>

          <div className="text-center text-xs text-slate-400 pt-2">
            Don't have a studio partner account?{' '}
            <Link to="/register" className="font-bold text-indigo-400 hover:text-indigo-300">
              Register Studio
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
