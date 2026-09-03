import React, { useState, useEffect } from 'react';
import {
  Laptop,
  ShieldCheck,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Clock,
  Printer,
  Download,
  KeyRound
} from 'lucide-react';
import { cscService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import Button from '../../components/Button';

const CscDevicePairing = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  const loadDevices = async () => {
    try {
      setLoading(true);
      const res = await cscService.getConnectedDevices();
      if (res.success && res.data) {
        setDevices(res.data);
      }
    } catch (err) {
      error('Failed to load registered desktop devices');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (deviceId) => {
    if (!window.confirm('Are you sure you want to revoke this desktop device authorization?')) return;
    try {
      const res = await cscService.revokeDevice(deviceId);
      if (res.success) {
        success('Device authorization revoked.');
        loadDevices();
      }
    } catch (err) {
      error('Failed to revoke device');
    }
  };

  useEffect(() => {
    loadDevices();
    const interval = setInterval(loadDevices, 8000); // 8s live device sync
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Desktop Client Devices</h1>
          <p className="text-xs text-slate-400">
            Manage your authorized desktop computers running Prime ID Pro.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadDevices} icon={RefreshCw} isLoading={loading}>
          Refresh Devices
        </Button>
      </div>

      {/* Direct Login Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-cyan-950/40 border border-cyan-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Direct Account Login Connection</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              To connect any computer, open the Prime ID Pro desktop application and log in with your <strong className="text-white">Account Email &amp; Password</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Desktop Hardware Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {devices.length === 0 ? (
          <div className="col-span-2 p-10 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mx-auto">
              <Laptop className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No Desktop Devices Connected Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                Install Prime ID Pro on your PC and log in using your account credentials to automatically bind your hardware and sync tokens.
              </p>
            </div>
          </div>
        ) : (
          devices.map((device) => (
            <div
              key={device._id}
              className={`p-6 rounded-2xl border backdrop-blur-xl transition-all ${
                device.isOnline
                  ? 'bg-slate-900/80 border-cyan-500/40 shadow-xl shadow-cyan-950/20'
                  : 'bg-slate-950/60 border-slate-800 opacity-80'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-3 rounded-xl ${
                      device.isOnline
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    <Laptop className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      {device.deviceName}
                      <Badge status={device.isOnline ? 'ONLINE' : 'OFFLINE'} size="sm" />
                    </div>
                    <div className="text-xs font-mono text-cyan-400 mt-0.5">
                      Machine ID: <span className="font-bold select-all">{device.installationId || device.deviceId}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRevoke(device._id)}
                  title="Revoke Device"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Specs & Metrics */}
              <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs text-slate-400">
                <div>
                  <span className="block text-[10px] uppercase text-slate-500">App Version:</span>
                  <span className="font-bold text-white">v{device.appVersion || '1.0.0'}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-slate-500">Status:</span>
                  <span className="font-bold text-emerald-400">{device.status || 'ACTIVE'}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-slate-500">Hardware Bound:</span>
                  <span className="font-mono text-slate-300 truncate block">
                    {device.installationId ? 'Hardware Verified' : 'Standard'}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-slate-500">Last Seen:</span>
                  <span className="font-mono text-slate-300">
                    {device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString() : 'Never'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CscDevicePairing;
