import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Printer,
  Clock,
  CheckCircle2,
  Wallet,
  Laptop,
  QrCode,
  Sparkles,
  TrendingUp,
  Plus,
  RefreshCw,
  Store,
  ChevronRight
} from 'lucide-react';
import { cscService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import KioskQRModal from '../../components/KioskQRModal';

const CscDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrData, setQrData] = useState(null);
  const { error } = useToast();
  const navigate = useNavigate();

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await cscService.getDashboardStats();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      error(err.formattedMessage || 'Failed to load studio dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenQR = async () => {
    try {
      const res = await cscService.getKioskQr();
      if (res.success && res.data) {
        setQrData(res.data);
        setQrModalOpen(true);
      }
    } catch (err) {
      error('Failed to generate Kiosk QR');
    }
  };

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const metrics = data?.metrics || data?.stats || {};
  const wallet = data?.wallet || {};
  const center = data?.center || {};

  return (
    <div className="space-y-8">
      {/* Studio Banner & Quick Actions */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {center.centerCode || 'CSC-HUB'}
            </span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Studio Online
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {center.centerName || 'Studio Management Hub'}
          </h1>
          <p className="text-xs text-slate-400">
            Real-time bridge with Prime ID Pro Electron desktop application.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => navigate('/csc/walk-in')}
            icon={Plus}
            variant="primary"
            size="md"
          >
            Walk-in Order
          </Button>
          <Button
            onClick={handleOpenQR}
            icon={QrCode}
            variant="glass"
            size="md"
          >
            Counter QR Poster
          </Button>
          <Button
            onClick={() => navigate('/csc/devices')}
            icon={Laptop}
            variant="outline"
            size="md"
          >
            Desktop Pairing
          </Button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Orders"
          value={metrics.todayOrders ?? metrics.todayJobsCount ?? 0}
          subtitle="Orders received today"
          icon={Sparkles}
          color="indigo"
        />
        <StatCard
          title="Pending Print Queue"
          value={metrics.pendingJobs ?? metrics.pendingJobsCount ?? 0}
          subtitle="Awaiting desktop print"
          icon={Printer}
          color="cyan"
        />
        <StatCard
          title="Today's Revenue"
          value={`₹${metrics.todayRevenue || 0}`}
          subtitle="Gross customer payments"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Studio Wallet Balance"
          value={`₹${wallet.currentBalance ?? center.walletBalance ?? 0}`}
          subtitle="Available print credits"
          icon={Wallet}
          color="amber"
        />
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => navigate('/csc/jobs')}
          className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition-all duration-300 hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-indigo-600/10 text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <Printer className="w-6 h-6" />
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 transition-colors" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Live Print Queue</h3>
          <p className="text-xs text-slate-400">
            Monitor incoming customer print jobs and verify desktop print execution.
          </p>
        </div>

        <div
          onClick={() => navigate('/csc/wallet')}
          className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all duration-300 hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-emerald-600/10 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <Wallet className="w-6 h-6" />
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Wallet &amp; Top-up</h3>
          <p className="text-xs text-slate-400">
            Recharge credit balance via Razorpay and audit job deduction ledger.
          </p>
        </div>

        <div
          onClick={() => navigate('/csc/devices')}
          className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all duration-300 hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-cyan-600/10 text-cyan-400 group-hover:bg-cyan-600 group-hover:text-white transition-all">
              <Laptop className="w-6 h-6" />
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Desktop App Binding</h3>
          <p className="text-xs text-slate-400">
            Pair your counter PC running the Prime ID Pro Electron application.
          </p>
        </div>
      </div>

      {/* Kiosk QR Modal */}
      <KioskQRModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        qrData={qrData}
      />
    </div>
  );
};

export default CscDashboard;
