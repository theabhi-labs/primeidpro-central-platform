import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Laptop,
  Activity,
  Coins,
  TrendingUp,
  HardDrive,
  RefreshCw,
  Clock,
  Sparkles
} from 'lucide-react';
import { adminService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import Button from '../../components/Button';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAnalytics();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      error('Failed to load admin analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 15000); // 15s refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold">
              SUPER ADMIN COMMAND CENTER
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Prime ID Pro Platform Overview
          </h1>
          <p className="text-xs text-slate-400">
            Real-time monitoring of all CSC centers, desktop client hardware, and global print queues.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadAnalytics} icon={RefreshCw} isLoading={loading}>
          Refresh Diagnostics
        </Button>
      </div>

      {/* Main KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Gross Revenue"
          value={`₹${data?.totalRevenue || 0}`}
          subtitle="All Razorpay captured orders"
          icon={Coins}
          color="emerald"
        />
        <StatCard
          title="Active Studios / CSCs"
          value={`${data?.activeCenters ?? data?.activeStudios ?? 0} / ${data?.totalCenters ?? data?.totalStudios ?? 0}`}
          subtitle="Verified partner photo studios"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Online Desktop Clients"
          value={`${data?.onlineDevices ?? data?.activeDevices ?? 0} / ${data?.totalDevices ?? 0}`}
          subtitle="Electron apps currently connected"
          icon={Laptop}
          color="cyan"
        />
        <StatCard
          title="Total Completed Prints"
          value={data?.completedJobs || 0}
          subtitle={`+${data?.todayOrders ?? data?.todayJobs ?? 0} received today`}
          icon={Activity}
          color="amber"
        />
      </div>

      {/* Storage & Privacy Health Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
            <HardDrive className="w-4 h-4" />
            Temporary Storage
          </div>
          <div className="text-2xl font-black text-white">
            {data?.storageStats?.totalFiles || 0} Temporary Blobs
          </div>
          <div className="text-xs text-slate-400">
            Total disk: {data?.storageStats?.totalSizeMb || 0} MB • Driver: {data?.storageStats?.driver || 'LOCAL'}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Privacy Policy Retention
          </div>
          <div className="text-2xl font-black text-emerald-400">
            10-Minute Purge
          </div>
          <div className="text-xs text-slate-400">
            Automatic background sweep deletes raw customer photos post-completion.
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
            Security Status
          </div>
          <div className="text-2xl font-black text-white">
            HMAC &amp; DPAPI Active
          </div>
          <div className="text-xs text-slate-400">
            Razorpay signatures &amp; device tokens cryptographically verified.
          </div>
        </div>
      </div>

      {/* Recent Print Jobs Activity Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden backdrop-blur-xl shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            Live Incoming Global Job Feed
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Job Code</th>
                <th className="py-3.5 px-4">Studio Center</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Format</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {data?.recentJobs?.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-500">
                    No recent print jobs found across the network.
                  </td>
                </tr>
              ) : (
                data?.recentJobs?.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                      {job.jobCode}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{job.centerId?.centerName || 'Studio'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{job.centerId?.centerCode}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{job.customerName}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-300">
                      {job.serviceName}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-400">
                      ₹{job.priceInr}
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={job.jobStatus} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                      {new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
