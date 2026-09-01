import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Upload,
  User,
  Phone,
  Printer,
  CheckCircle2,
  Crop,
  Layers,
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { cscService, customerService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/Button';

const CscWalkInOrder = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [serviceType, setServiceType] = useState('PASSPORT_PHOTO');
  const [copies, setCopies] = useState(8);
  const [priceInr, setPriceInr] = useState(50);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadedStorageKey, setUploadedStorageKey] = useState(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoPreview(URL.createObjectURL(file));
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const res = await customerService.uploadPhoto(formData);
      if (res.success && res.data) {
        setUploadedStorageKey(res.data.storageKey);
        setUploadedPhotoUrl(res.data.photoUrl);
        success('Customer photo uploaded.');
      }
    } catch (err) {
      error('Failed to upload photo');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWalkIn = async (e) => {
    e.preventDefault();
    if (!customerName) return error('Customer name is required');

    setLoading(true);
    try {
      const res = await cscService.createWalkInOrder({
        customerName,
        customerPhone: customerPhone || '9876543210',
        serviceType,
        copies,
        priceInr,
        storageKey: uploadedStorageKey,
        photoUrl: uploadedPhotoUrl
      });

      if (res.success && res.data) {
        confetti({ particleCount: 60, spread: 50 });
        success(`Walk-in order #${res.data.jobCode} dispatched to desktop printer!`);
        navigate('/csc/jobs');
      }
    } catch (err) {
      error(err.formattedMessage || 'Failed to create walk-in order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Walk-in Counter Order</h1>
          <p className="text-xs text-slate-400">
            Instant manual intake for counter customers. Marked cash-paid and dispatched directly.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => navigate('/csc/dashboard')} icon={ArrowLeft}>
          Back
        </Button>
      </div>

      {/* Form */}
      <form onSubmit={handleCreateWalkIn} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-xl">
        {/* Customer Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Customer Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Kumar"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+91 9876543210"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Template & Quantity */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Format Type
            </label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="PASSPORT_PHOTO">Indian Passport (35x45mm)</option>
              <option value="VISA_PHOTO">US / Visa (2x2 inch)</option>
              <option value="STAMP_PHOTO">Stamp Size (25x30mm)</option>
              <option value="PVC_ID_CARD">PVC Smart ID Card</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Copies
            </label>
            <input
              type="number"
              min="1"
              max="64"
              value={copies}
              onChange={(e) => setCopies(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Cash Amount Collected (₹)
            </label>
            <input
              type="number"
              min="0"
              value={priceInr}
              onChange={(e) => setPriceInr(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 font-bold text-emerald-400"
            />
          </div>
        </div>

        {/* Optional Photo Attachment */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">
            Customer Photo File (Optional or capture on desktop)
          </label>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
            {photoPreview ? (
              <div className="inline-block relative">
                <img
                  src={photoPreview}
                  alt="Customer Preview"
                  className="w-28 h-36 object-cover rounded-lg border border-slate-700 mx-auto"
                />
                <label className="cursor-pointer text-xs text-indigo-400 hover:text-indigo-300 block mt-2">
                  Replace Photo
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
                </label>
              </div>
            ) : (
              <label className="cursor-pointer block text-xs text-slate-400">
                <Upload className="w-6 h-6 text-slate-500 mx-auto mb-1" />
                <span>Click to attach photo file</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
              </label>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            icon={Printer}
            variant="emerald"
            size="lg"
            isLoading={loading}
          >
            Dispatch to Desktop Printer
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CscWalkInOrder;
