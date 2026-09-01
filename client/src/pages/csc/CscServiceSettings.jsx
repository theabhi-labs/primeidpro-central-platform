import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Settings,
  Save,
  QrCode,
  DollarSign,
  Layers,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink
} from 'lucide-react';

export default function CscServiceSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [center, setCenter] = useState(null);
  const [settings, setSettings] = useState({
    pricePerPhoto: 7,
    minimumQuantity: 3,
    maximumQuantity: 20,
    quantityStep: 1,
    onlinePaymentEnabled: true,
    cashPaymentEnabled: true,
    serviceEnabled: true
  });
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setMsg({ text: '', type: '' });

      let serviceData = null;
      let centerData = null;

      try {
        const res = await api.get('/centers/service-settings');
        if (res.data?.data) {
          serviceData = res.data.data.serviceSettings || res.data.data;
          centerData = res.data.data.center || (res.data.data.qrToken ? res.data.data : null);
        }
      } catch (e) {
        // Fallback to /centers/me
      }

      if (!centerData) {
        try {
          const res = await api.get('/centers/me');
          if (res.data?.data) {
            centerData = res.data.data;
            if (!serviceData && res.data.data.serviceSettings) {
              serviceData = res.data.data.serviceSettings;
            }
          }
        } catch (e) {
          // Fallback to /auth/me
          const authRes = await api.get('/auth/me');
          if (authRes.data?.data?.center) {
            centerData = authRes.data.data.center;
            if (!serviceData && authRes.data.data.center.serviceSettings) {
              serviceData = authRes.data.data.center.serviceSettings;
            }
          }
        }
      }

      if (centerData) {
        setCenter(centerData);
      }

      if (serviceData) {
        setSettings({
          pricePerPhoto: serviceData.pricePerPhoto ?? 7,
          minimumQuantity: serviceData.minimumQuantity ?? 3,
          maximumQuantity: serviceData.maximumQuantity ?? 20,
          quantityStep: serviceData.quantityStep ?? 1,
          onlinePaymentEnabled: serviceData.onlinePaymentEnabled ?? true,
          cashPaymentEnabled: serviceData.cashPaymentEnabled ?? true,
          serviceEnabled: serviceData.serviceEnabled ?? true
        });
      }
    } catch (err) {
      setMsg({ text: 'Failed to load service settings', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMsg({ text: '', type: '' });
      const res = await api.put('/centers/service-settings', settings);
      setMsg({ text: 'Service configuration updated successfully!', type: 'success' });
      if (res.data?.data) {
        const updated = res.data.data;
        if (updated.center) setCenter(updated.center);
        else if (updated.qrToken) setCenter(updated);
      }
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Failed to save settings', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const publicUrl = center?.qrToken
    ? `${window.location.origin}/order/${center.qrToken}`
    : (center?.slug
        ? `${window.location.origin}/kiosk/${center.slug}`
        : (center?._id ? `${window.location.origin}/order/${center._id}` : `${window.location.origin}/order`));

  const copyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 animate-pulse">
        Loading service settings...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <Settings className="w-7 h-7 text-brand-400" />
            Photo Service & Pricing Configuration
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure per-photo customer pricing, minimum order quantities, and payment methods for your kiosk.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 flex items-center gap-2 disabled:opacity-50 transition-all self-start sm:self-auto"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {msg.text && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center gap-3 ${
            msg.type === 'success'
              ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-300'
              : 'bg-red-950/60 border border-red-500/30 text-red-300'
          }`}
        >
          {msg.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Public Kiosk Link Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand-400 uppercase tracking-wider block mb-1">
            Your Customer QR & Mobile Web Link
          </span>
          <div className="text-sm text-slate-300 font-mono break-all">{publicUrl}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={copyLink}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl flex items-center gap-1.5 transition-all"
          >
            <Copy className="w-3.5 h-3.5" /> {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-brand-600/20 hover:bg-brand-600/30 text-xs font-bold text-brand-400 border border-brand-500/30 rounded-xl flex items-center gap-1.5 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Preview Kiosk
          </a>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pricing & Quantities */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <DollarSign className="w-5 h-5 text-emerald-400" /> Photo Pricing & Quantities
          </h2>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Customer Price per Photo (₹)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={settings.pricePerPhoto}
              onChange={(e) => setSettings({ ...settings, pricePerPhoto: Number(e.target.value) })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-bold focus:outline-none focus:border-brand-500"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Default is ₹7 per photo. Platform adds a fixed ₹2 platform fee per order.
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Min Quantity</label>
              <input
                type="number"
                min="1"
                max="50"
                value={settings.minimumQuantity}
                onChange={(e) => setSettings({ ...settings, minimumQuantity: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Max Quantity</label>
              <input
                type="number"
                min="1"
                max="100"
                value={settings.maximumQuantity}
                onChange={(e) => setSettings({ ...settings, maximumQuantity: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Step</label>
              <input
                type="number"
                min="1"
                max="10"
                value={settings.quantityStep}
                onChange={(e) => setSettings({ ...settings, quantityStep: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
          <span className="text-[11px] text-slate-500 block">
            Example: Min 3, Max 20, Step 1 allows customers to order 3, 4, 5... up to 20 photos.
          </span>
        </div>

        {/* Payment & Service Controls */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl space-y-5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Layers className="w-5 h-5 text-indigo-400" /> Payment & Service Controls
          </h2>

          <div className="space-y-4 pt-2">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <div>
                <span className="text-sm font-bold text-white block">Online UPI / Card Payments</span>
                <span className="text-xs text-slate-400">Allow customers to pay instantly via Razorpay online</span>
              </div>
              <input
                type="checkbox"
                checked={settings.onlinePaymentEnabled}
                onChange={(e) => setSettings({ ...settings, onlinePaymentEnabled: e.target.checked })}
                className="w-5 h-5 rounded text-brand-600 focus:ring-0 focus:outline-none"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <div>
                <span className="text-sm font-bold text-white block">Cash at Counter</span>
                <span className="text-xs text-slate-400">Allow customers to select cash payment at your shop</span>
              </div>
              <input
                type="checkbox"
                checked={settings.cashPaymentEnabled}
                onChange={(e) => setSettings({ ...settings, cashPaymentEnabled: e.target.checked })}
                className="w-5 h-5 rounded text-brand-600 focus:ring-0 focus:outline-none"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <div>
                <span className="text-sm font-bold text-white block">Online Kiosk Service Active</span>
                <span className="text-xs text-slate-400">Enable or temporarily pause public order intake</span>
              </div>
              <input
                type="checkbox"
                checked={settings.serviceEnabled}
                onChange={(e) => setSettings({ ...settings, serviceEnabled: e.target.checked })}
                className="w-5 h-5 rounded text-brand-600 focus:ring-0 focus:outline-none"
              />
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}
