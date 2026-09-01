import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Edit2,
  RefreshCw,
  CheckCircle2,
  Save,
  Layers,
  Coins
} from 'lucide-react';
import { adminService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/Button';
import Modal from '../../components/Modal';

const AdminPricing = () => {
  const [pricingRules, setPricingRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRule, setSelectedRule] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [customerPrice, setCustomerPrice] = useState(50);
  const [creditCost, setCreditCost] = useState(5);
  const [saving, setSaving] = useState(false);
  const { success, error } = useToast();

  const loadPricing = async () => {
    try {
      setLoading(true);
      const res = await adminService.listPricing();
      if (res.success && res.data) {
        setPricingRules(res.data);
      }
    } catch (err) {
      error('Failed to load pricing matrix');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPricing();
  }, []);

  const openEdit = (rule) => {
    setSelectedRule(rule);
    setCustomerPrice(rule.customerPriceInr);
    setCreditCost(rule.cscCreditCost);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedRule) return;

    setSaving(true);
    try {
      const res = await adminService.updatePricing(selectedRule._id, {
        customerPriceInr: Number(customerPrice),
        cscCreditCost: Number(creditCost)
      });
      if (res.success) {
        success(`Pricing updated for ${selectedRule.name}`);
        setModalOpen(false);
        loadPricing();
      }
    } catch (err) {
      error('Failed to update pricing');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Pricing &amp; Margins Matrix</h1>
          <p className="text-xs text-slate-400">
            Configure customer retail prices and studio platform credit fees per document format.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadPricing} icon={RefreshCw} isLoading={loading}>
          Refresh
        </Button>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pricingRules.map((rule) => (
          <div
            key={rule._id}
            className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl flex flex-col justify-between shadow-xl"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-base text-white">{rule.name}</span>
                <button
                  onClick={() => openEdit(rule)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-white transition-all"
                  title="Edit Pricing"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mb-4">{rule.description}</p>

              <div className="space-y-2 py-3 border-y border-slate-800/80 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Dimensions:</span>
                  <span className="font-mono text-slate-200">{rule.dimensionsMm?.width} x {rule.dimensionsMm?.height} mm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Paper Layout:</span>
                  <span className="font-mono text-slate-200">{rule.paperSize} ({rule.defaultCopies} copies)</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase text-slate-400 block font-semibold">Customer Retail:</span>
                <span className="text-xl font-black text-emerald-400">₹{rule.customerPriceInr}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase text-slate-400 block font-semibold">Platform Fee:</span>
                <span className="text-xl font-black text-indigo-400">₹{rule.cscCreditCost}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Pricing Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Adjust Pricing • ${selectedRule?.name}`}
        maxWidth="max-w-sm"
      >
        {selectedRule && (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Customer Retail Price (₹)
              </label>
              <input
                type="number"
                min="10"
                required
                value={customerPrice}
                onChange={(e) => setCustomerPrice(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-bold text-emerald-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Studio Platform Fee (₹ Credit Debit)
              </label>
              <input
                type="number"
                min="0"
                required
                value={creditCost}
                onChange={(e) => setCreditCost(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-bold text-indigo-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-800">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
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

export default AdminPricing;
