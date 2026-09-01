import React, { useState, useEffect } from 'react';
import {
  Laptop,
  Search,
  RefreshCw,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Radio,
  Clock,
  Printer
} from 'lucide-react';
import { adminService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import Button from '../../components/Button';

const AdminDevices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { success, error } = useToast();

  const loadDevices = async () => {
    try {
      setLoading(true);
      const res = await adminService.listDevices({ search });
      if (res.success && res.data) {
        setDevices(res.data);
      }
    } catch (err) {
      error('Failed to load registered desktop devices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
    const interval = setInterval(loadDevices, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await adminService.updateDevice(id, { status });
      if (res.success) {
        success(`Device status updated to ${status}`);
        loadDevices();
      }
    } catch (err) {
      error('Failed to update device status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Desktop Client Hardware</h1>
          <p className="text-xs text-slate-400">
            Registered Prime ID Pro Electron desktop installations across India with hardware binding details.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadDevices} icon={RefreshCw} isLoading={loading}>
          Refresh
        </Button>
      </div>

      {/* Devices Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden backdrop-blur-xl shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Device ID, Installation ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadDevices()}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Device ID</th>
                <th className="py-3.5 px-4">Studio / Location</th>
                <th className="py-3.5 px-4">Machine Name</th>
                <th className="py-3.5 px-4">Version</th>
                <th className="py-3.5 px-4">Prints Done</th>
                <th className="py-3.5 px-4">Ping Status</th>
                <th className="py-3.5 px-4">Access Status</th>
                <th className="py-3.5 px-4 text-right">Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {devices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-slate-500">
                    No desktop devices found.
                  </td>
                </tr>
              ) : (
                devices.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                      {d.deviceId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{d.centerId?.centerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{d.centerId?.centerCode} • {d.centerId?.city}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-300">
                      {d.deviceName}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      v{d.appVersion}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-400">
                      {d.metrics?.jobsCompleted || 0}
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={d.isOnline ? 'ONLINE' : 'OFFLINE'} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={d.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      {d.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleUpdateStatus(d._id, 'REVOKED')}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[11px] font-semibold transition-all"
                        >
                          Revoke
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(d._id, 'ACTIVE')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold transition-all"
                        >
                          Activate
                        </button>
                      )}
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

export default AdminDevices;
