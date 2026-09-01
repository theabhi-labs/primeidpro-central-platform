import React, { useState, useEffect } from 'react';
import {
  Laptop,
  Key,
  ShieldCheck,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Clock,
  Printer
} from 'lucide-react';
import { cscService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';

const CscDevicePairing = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pairingData, setPairingData] = useState(null);
  const [pairingLoading, setPairingLoading] = useState(false);
  const [pairModalOpen, setPairModalOpen] = useState(false);
  const { success, error, info } = useToast();

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

  const handleGeneratePairingCode = async () => {
    try {
      setPairingLoading(true);
      const res = await cscService.generatePairingCode();
      if (res.success && res.data) {
        setPairingData(res.data);
        setPairModalOpen(true);
        success('New 6-digit pairing code generated!');
      }
    } catch (err) {
      error('Failed to generate pairing code');
    } finally {
      setPairingLoading(false);
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
    const interval = setInterval(loadDevices, 6000); // 6s live device ping
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Desktop Client Pairing</h1>
          <p className="text-xs text-slate-400">
            Pair your physical Windows PCs running the Prime ID Pro Electron application.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleGeneratePairingCode}
            icon={Key}
            variant="primary"
            size="md"
            isLoading={pairingLoading}
          >
            Generate Pairing Code
          </Button>
          <Button variant="outline" size="sm" onClick={loadDevices} icon={RefreshCw} isLoading={loading}>
            Refresh
          </Button>
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
              <h3 className="text-base font-bold text-white">No Desktop Devices Paired Yet</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                Click "Generate Pairing Code" above, launch your Prime ID Pro desktop app, and enter the 6-digit code.
              </p>
            </div>
          </div>
        ) : (
          devices.map((device) => (
            <div
              key={device._id}
              className={`p-6 rounded-2xl border backdrop-blur-xl transition-all ${
                device.isOnline
                  ? 'bg-slate-900/80 border-indigo-500/30 shadow-xl shadow-indigo-950/30'
                  : 'bg-slate-950/60 border-slate-800 opacity-75'
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
                    <div className="text-xs font-mono text-indigo-400 mt-0.5">
                      ID: {device.deviceId}
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
                  <span className="font-bold text-white">v{device.appVersion}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-slate-500">Jobs Printed:</span>
                  <span className="font-bold text-emerald-400">{device.metrics?.jobsCompleted || 0}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-slate-500">Printer:</span>
                  <span className="font-medium text-slate-300 truncate block">
                    {device.metrics?.printerName || 'Default Windows Printer'}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-slate-500">Last Seen:</span>
                  <span className="font-mono text-slate-300">
                    {device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleTimeString() : 'Never'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pairing Code Modal */}
      <Modal
        isOpen={pairModalOpen}
        onClose={() => setPairModalOpen(false)}
        title="Desktop App 6-Digit Pairing Code"
        maxWidth="max-w-md"
      >
        {pairingData && (
          <div className="space-y-6 text-center">
            <div>
              <p className="text-xs text-slate-400 mb-4">
                Open Prime ID Pro Electron application on your studio PC, go to <strong>Settings → Connect to Cloud</strong>, and enter this code:
              </p>

              <div className="p-6 rounded-2xl bg-slate-950 border-2 border-dashed border-indigo-500/60 inline-block">
                <div className="text-4xl font-black text-indigo-400 tracking-[0.3em] font-mono">
                  {pairingData.pairingCode}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-amber-400">
                <Clock className="w-3.5 h-3.5" />
                <span>Code expires in 15 minutes</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 text-left space-y-1">
              <div>• <strong>Studio:</strong> {pairingData.centerName}</div>
              <div>• <strong>Center Code:</strong> {pairingData.centerCode}</div>
              <div>• Automatically generates a permanent hardware bound token.</div>
            </div>

            <Button onClick={() => setPairModalOpen(false)} variant="primary" className="w-full">
              Done
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CscDevicePairing;
