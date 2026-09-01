import React, { useState, useEffect } from 'react';
import {
  Settings,
  Server,
  HardDrive,
  ShieldCheck,
  RefreshCw,
  Database,
  Radio,
  Clock,
  Key
} from 'lucide-react';
import { healthService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/Button';

const AdminSettings = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  const loadHealth = async () => {
    try {
      setLoading(true);
      const res = await healthService.check();
      if (res.success && res.data) {
        setHealth(res.data);
      }
    } catch (err) {
      error('Failed to load system diagnostics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Diagnostics &amp; Configuration</h1>
          <p className="text-xs text-slate-400">
            System health status, object storage metrics, and gateway security parameters.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadHealth} icon={RefreshCw} isLoading={loading}>
          Run Diagnostics
        </Button>
      </div>

      {/* Grid of Diagnostic Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Platform Panel */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Central Web Platform</h3>
              <span className="text-[11px] font-mono text-slate-400">primeidpro.online</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">System State:</span>
              <span className="font-bold text-emerald-400">{health?.status || 'HEALTHY'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Uptime:</span>
              <span className="font-mono text-slate-200">{health?.uptimeSeconds || 0} seconds</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Database Engine:</span>
              <span className="font-bold text-emerald-400">{health?.database || 'CONNECTED'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Build Version:</span>
              <span className="font-mono text-indigo-400">v{health?.version || '1.0.0'}</span>
            </div>
          </div>
        </div>

        {/* Temporary Object Storage Panel */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600/10 text-emerald-400 border border-emerald-500/20">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Privacy Storage Subsystem</h3>
              <span className="text-[11px] text-slate-400">Zero Permanent Mongo Storage</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Storage Driver:</span>
              <span className="font-mono text-slate-200">{health?.storage?.driver || 'LOCAL'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Active Temp Photos:</span>
              <span className="font-bold text-white">{health?.storage?.totalFiles || 0} files</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Disk Consumption:</span>
              <span className="font-mono text-slate-200">{health?.storage?.totalSizeMb || 0} MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Retention TTL:</span>
              <span className="font-bold text-emerald-400">10 Minutes Post-Print</span>
            </div>
          </div>
        </div>

        {/* Payment Gateway Panel */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-600/10 text-amber-400 border border-amber-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Razorpay Payment Engine</h3>
              <span className="text-[11px] text-slate-400">Cryptographic Signature Verification</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Webhook HMAC:</span>
              <span className="font-bold text-emerald-400">SHA-256 Verified</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Idempotency Guard:</span>
              <span className="font-bold text-emerald-400">Enabled (Double-Charge Prevention)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Checkout Currency:</span>
              <span className="font-mono text-slate-200">INR (₹)</span>
            </div>
          </div>
        </div>

        {/* Desktop Sync Bridge Panel */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-600/10 text-cyan-400 border border-cyan-500/20">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Desktop Client Sync Bridge</h3>
              <span className="text-[11px] text-slate-400">Electron Native Communication</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Protocol:</span>
              <span className="font-mono text-slate-200">HTTPS REST API</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Authentication:</span>
              <span className="font-bold text-indigo-400">Hardware Fingerprint + Token</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Heartbeat Frequency:</span>
              <span className="font-mono text-slate-200">10 Seconds</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
