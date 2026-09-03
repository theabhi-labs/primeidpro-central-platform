import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  Edit2,
  CheckCircle2,
  XCircle,
  Coins,
  ShieldCheck,
  Laptop,
  Plus
} from 'lucide-react';
import { adminService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';

const AdminStudios = () => {
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStudio, setSelectedStudio] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [walletAdjustment, setWalletAdjustment] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isVerified, setIsVerified] = useState(true);
  const [saving, setSaving] = useState(false);
  const { success, error } = useToast();

  const loadStudios = async () => {
    try {
      setLoading(true);
      const res = await adminService.listStudios({ search });
      if (res.success && res.data) {
        setStudios(res.data);
      }
    } catch (err) {
      error('Failed to load studios list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudios();
  }, []);

  const openEditModal = (studio) => {
    setSelectedStudio(studio);
    setIsActive(studio.isActive);
    setIsVerified(studio.isVerified);
    setWalletAdjustment(0);
    setAdjustmentReason('');
    setEditModalOpen(true);
  };

  const handleSaveStudio = async (e) => {
    e.preventDefault();
    if (!selectedStudio) return;

    setSaving(true);
    try {
      const res = await adminService.updateStudio(selectedStudio._id, {
        isActive,
        isVerified,
        walletAdjustment: Number(walletAdjustment),
        adjustmentReason
      });

      if (res.success) {
        success('Studio updated successfully');
        setEditModalOpen(false);
        loadStudios();
      }
    } catch (err) {
      error(err.formattedMessage || 'Failed to update studio');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Studio &amp; CSC Partners</h1>
          <p className="text-xs text-slate-400">
            Manage authorized studios, verify center licenses, and perform manual wallet credit adjustments.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadStudios} icon={RefreshCw} isLoading={loading}>
          Refresh
        </Button>
      </div>

      {/* Studios Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden backdrop-blur-xl shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search studio name, code, city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadStudios()}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Center Code</th>
                <th className="py-3.5 px-4">Studio / User</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Account Email</th>
                <th className="py-3.5 px-4">Machine Hardware ID</th>
                <th className="py-3.5 px-4">Wallet Balance</th>
                <th className="py-3.5 px-4">Desktop Status</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {studios.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-slate-500">
                    No studios found.
                  </td>
                </tr>
              ) : (
                studios.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                      {s.centerCode}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {s.centerName}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {s.city}, {s.state}
                    </td>
                                        <td className="py-3 px-4">
                      <div className="font-mono text-cyan-300 font-bold">{s.email}</div>
                      <div className="text-[10px] text-slate-500">{s.phone}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {s.primaryMachineId ? (
                        <div className="flex flex-col gap-1">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-950 border border-cyan-800/50 text-cyan-300 text-[11px] font-bold select-all inline-block w-fit">
                            {s.primaryMachineId}
                          </span>
                          {s.devicesCount > 1 && (
                            <span className="text-[10px] text-slate-400">+{s.devicesCount - 1} more PC</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-600 italic text-[11px]">No machine bound</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-extrabold text-emerald-400 font-mono">
                      {s.walletBalance} Tokens
                    </td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Laptop className="w-3.5 h-3.5 text-slate-400" />
                        <span>{s.devicesCount || 0} PC</span>
                        {s.hasOnlineDevice && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" title="Online Active"></span>}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={s.isActive ? 'ACTIVE' : 'BLOCKED'} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openEditModal(s)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-white transition-all"
                        title="Edit Studio"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Studio Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Manage Studio • ${selectedStudio?.centerName}`}
        maxWidth="max-w-md"
      >
        {selectedStudio && (
          <form onSubmit={handleSaveStudio} className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div><strong>Center Code:</strong> <span className="font-mono text-indigo-400">{selectedStudio.centerCode}</span></div>
              <div><strong>Current Wallet Balance:</strong> <span className="font-bold text-emerald-400">₹{selectedStudio.walletBalance}</span></div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Adjust Wallet Balance (₹) (+ to credit, - to debit)
              </label>
              <input
                type="number"
                placeholder="0"
                value={walletAdjustment}
                onChange={(e) => setWalletAdjustment(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {walletAdjustment !== 0 && (
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Reason for Adjustment *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Promotional credit top-up"
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            <div className="pt-2 flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-800"
                />
                <span>Active / Receiving Cloud Orders</span>
              </label>
            </div>

            <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-800">
              <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={saving}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default AdminStudios;
