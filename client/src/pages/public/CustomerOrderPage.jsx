import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Camera,
  CheckCircle2,
  Sparkles,
  Store,
  CreditCard,
  Banknote,
  ShieldCheck,
  MapPin,
  Plus,
  Minus,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { customerService, paymentService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/Button';

export default function CustomerOrderPage() {
  const { slug, token } = useParams();
  const [searchParams] = useSearchParams();
  const { success, error } = useToast();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Center & Settings
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [serviceSettings, setServiceSettings] = useState({
    pricePerPhoto: 7,
    minimumQuantity: 4,
    maximumQuantity: 32,
    onlinePaymentEnabled: true,
    cashPaymentEnabled: true,
  });

  // Photo & Order State
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadedStorageKey, setUploadedStorageKey] = useState(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const [copies, setCopies] = useState(8);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH'); // Default Cash at Counter

  // Completed State
  const [completedOrder, setCompletedOrder] = useState(null);

  // 1. Load Studio Details & Pricing
  useEffect(() => {
    const loadStudioData = async () => {
      try {
        setInitialLoading(true);
        const centerRes = await customerService.listCenters();
        const centerList = (centerRes.success && centerRes.data) ? centerRes.data : [];

        const targetId = slug || token || searchParams.get('center') || searchParams.get('token');
        let activeCenter = null;

        if (targetId && centerList.length > 0) {
          activeCenter = centerList.find(
            (c) =>
              (c.slug && c.slug.toLowerCase() === targetId.toLowerCase()) ||
              (c.centerCode && c.centerCode.toUpperCase() === targetId.toUpperCase()) ||
              (c.qrToken && c.qrToken === targetId) ||
              (c._id && c._id.toString() === targetId)
          );
        }

        if (!activeCenter && targetId) {
          try {
            const singleRes = await customerService.getCenter(targetId);
            activeCenter = singleRes.data?.data || singleRes.data;
          } catch (e) {}
        }

        if (!activeCenter && centerList.length > 0) {
          activeCenter = centerList[0];
        }

        if (activeCenter) {
          setSelectedCenter(activeCenter);
          if (activeCenter.serviceSettings) {
            setServiceSettings((prev) => ({
              ...prev,
              ...activeCenter.serviceSettings,
            }));
            const defMin = activeCenter.serviceSettings.minimumQuantity || 4;
            setCopies(Math.max(defMin, 8));
          }
        }
      } catch (err) {
        error('Failed to load studio details: ' + (err.formattedMessage || err.message));
      } finally {
        setInitialLoading(false);
      }
    };

    loadStudioData();
  }, [slug, token, searchParams]);

  // Handle Photo Upload
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);

    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const res = await customerService.uploadPhoto(formData);
      if (res.success && res.data) {
        setUploadedStorageKey(res.data.storageKey);
        setUploadedPhotoUrl(res.data.photoUrl);
        success('Photo uploaded successfully!');
      }
    } catch (err) {
      error('Upload failed: ' + (err.formattedMessage || err.message));
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Quantity presets
  const minCopies = serviceSettings.minimumQuantity || 4;
  const maxCopies = serviceSettings.maximumQuantity || 32;
  const pricePerUnit = serviceSettings.pricePerPhoto || 7;
  const totalPrice = copies * pricePerUnit;

  const quickPresets = [4, 8, 16, 24, 32].filter(
    (q) => q >= minCopies && q <= maxCopies
  );

  // Submit Order directly to Studio Counter
  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!selectedCenter) {
      error('Studio Center not identified. Please re-scan QR code.');
      return;
    }
    if (!uploadedStorageKey && !uploadedPhotoUrl) {
      error('Please select or take a photo first.');
      if (fileInputRef.current) fileInputRef.current.click();
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        centerId: selectedCenter._id,
        customerName: customerName.trim() || 'Walk-in Customer',
        customerPhone: `99999${Date.now().toString().slice(-5)}`,
        customerEmail: `customer_${Date.now().toString().slice(-5)}@primeidpro.customer`,
        serviceType: 'PASSPORT_PHOTO',
        quantity: Number(copies),
        copies: Number(copies),
        storageKey: uploadedStorageKey,
        photoUrl: uploadedPhotoUrl,
        paymentMethod: paymentMethod === 'CASH' ? 'CASH' : 'RAZORPAY',
      };

      const orderRes = await customerService.createOrder(orderPayload);
      if (!orderRes.success || !orderRes.data) {
        throw new Error(orderRes.message || 'Could not place order');
      }

      const order = orderRes.data.order || orderRes.data.job || {};
      const job = orderRes.data.job || orderRes.data.order || {};
      const razorpayOrder = orderRes.data.razorpayOrder;
      const orderJobId = job.id || job.jobId || order.id || order._id;

      // Handle Cash at Counter
      if (paymentMethod === 'CASH' || !razorpayOrder) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setCompletedOrder({
          ...order,
          ...job,
          orderId: orderJobId,
          copies,
          totalPrice,
          paymentMethod: 'CASH',
        });
        success('🎉 Order sent directly to Studio Counter!');
        return;
      }

      // Handle Razorpay / UPI Online Checkout
      if (razorpayOrder) {
        const options = {
          key: razorpayOrder.keyId || 'rzp_test_PrimeIdProSandbox2026',
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency || 'INR',
          name: selectedCenter.centerName || 'PRIME ID PRO',
          description: `Passport Photo Print (${copies} Copies)`,
          order_id: razorpayOrder.orderId,
          handler: async (response) => {
            try {
              const verifyRes = await paymentService.verifyJobPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                jobId: orderJobId,
              });

              confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
              setCompletedOrder({
                ...order,
                ...job,
                ...verifyRes.data,
                orderId: orderJobId,
                copies,
                totalPrice,
                paymentMethod: 'ONLINE',
              });
              success('🎉 Payment verified! Photo sent to studio desktop.');
            } catch (verErr) {
              error('Payment verification: ' + (verErr.formattedMessage || verErr.message));
            }
          },
          prefill: {
            name: customerName || 'Walk-in Customer',
          },
          theme: {
            color: '#06b6d4',
          },
        };

        if (window.Razorpay) {
          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          // Dev sandbox simulation
          const verifyRes = await paymentService.verifyJobPayment({
            razorpay_order_id: razorpayOrder.orderId,
            razorpay_payment_id: `pay_sim_${Date.now()}`,
            razorpay_signature: 'simulated_success_signature',
            jobId: orderJobId,
          });
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          setCompletedOrder({
            ...order,
            ...job,
            ...verifyRes.data,
            orderId: orderJobId,
            copies,
            totalPrice,
            paymentMethod: 'ONLINE',
          });
        }
      }
    } catch (err) {
      error('Order failed: ' + (err.formattedMessage || err.message));
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-300">Connecting to Studio Counter...</p>
      </div>
    );
  }

  // ==========================================
  // SUCCESS SCREEN
  // ==========================================
  if (completedOrder) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />

          <div className="w-20 h-20 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full uppercase tracking-wider border border-emerald-500/30">
              ⚡ Sent To Studio PC
            </span>
            <h2 className="text-2xl font-black text-white">Order Received!</h2>
            <p className="text-xs text-slate-400">
              Your photo has been sent to <strong className="text-slate-200">{selectedCenter?.centerName || 'Studio Desk'}</strong>. AI background removal and 300 DPI sheet layout are in progress.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-left space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Order Reference:</span>
              <span className="font-mono font-bold text-cyan-400">#{String(completedOrder.orderId || completedOrder._id || '1001').slice(-6).toUpperCase()}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Prints Count:</span>
              <span className="font-bold text-white">{completedOrder.copies || copies} Passport Photos</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Total Amount:</span>
              <span className="font-bold text-emerald-400">₹{completedOrder.totalPrice || totalPrice}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Payment:</span>
              <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${completedOrder.paymentMethod === 'CASH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                {completedOrder.paymentMethod === 'CASH' ? '💵 Pay Cash at Counter' : '✅ Paid Online'}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-slate-500">
            Please collect your printed physical photos from the studio operator.
          </p>

          <Button
            onClick={() => {
              setCompletedOrder(null);
              setPhotoPreview(null);
              setUploadedStorageKey(null);
            }}
            variant="outline"
            className="w-full justify-center text-xs py-3"
          >
            Order Another Photo
          </Button>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN SIMPLE 2-STEP CUSTOMER ORDERING FORM
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Studio Header Card */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800/80 px-4 py-5">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner flex-shrink-0">
            <Store className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-white truncate">
                {selectedCenter?.centerName || 'Studio Photo Counter'}
              </h1>
              <span className="px-1.5 py-0.5 bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold rounded">
                VERIFIED
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
              <span className="truncate">{selectedCenter?.city || selectedCenter?.address || 'Counter Express Print'}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-5 space-y-4">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handlePhotoSelect}
          className="hidden"
        />

        {/* STEP 1: PHOTO UPLOAD */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-black text-xs flex items-center justify-center">
                1
              </div>
              <h2 className="text-sm font-extrabold text-white">Upload Your Photo</h2>
            </div>
            <span className="text-[11px] font-medium text-cyan-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Auto AI Clean
            </span>
          </div>

          {!photoPreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-cyan-500 bg-slate-950/60 hover:bg-slate-950 rounded-2xl p-7 text-center cursor-pointer transition-all group flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                <Camera className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">Tap to Take or Select Photo</p>
                <p className="text-xs text-slate-400">Camera or Gallery (Selfie / Portrait)</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 flex items-center justify-center max-h-64 group">
                <img
                  src={photoPreview}
                  alt="Customer Photo"
                  className="max-h-60 w-auto object-contain rounded-xl p-2"
                />
                {isUploadingPhoto && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-cyan-400 text-xs font-bold gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    <span>Uploading Photo...</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Photo Ready</span>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3" /> Change Photo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* STEP 2: CHOOSE QUANTITY (COUNT) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-black text-xs flex items-center justify-center">
                2
              </div>
              <h2 className="text-sm font-extrabold text-white">How Many Photos?</h2>
            </div>
            <span className="text-xs font-bold text-slate-400">
              ₹{pricePerUnit} / photo
            </span>
          </div>

          {/* Quick Presets */}
          <div className="grid grid-cols-4 gap-2">
            {quickPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setCopies(preset)}
                className={`py-2.5 px-2 rounded-2xl border text-xs font-black transition-all flex flex-col items-center justify-center gap-0.5 ${
                  copies === preset
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-[1.02]'
                    : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <span>{preset} Photos</span>
                <span className={`text-[10px] font-bold ${copies === preset ? 'text-slate-900' : 'text-slate-400'}`}>
                  ₹{preset * pricePerUnit}
                </span>
              </button>
            ))}
          </div>

          {/* Custom Stepper */}
          <div className="flex items-center justify-between bg-slate-950/80 border border-slate-800 rounded-2xl p-2.5">
            <button
              type="button"
              disabled={copies <= minCopies}
              onClick={() => setCopies((prev) => Math.max(minCopies, prev - 1))}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-white flex items-center justify-center transition-all"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="text-center">
              <span className="text-lg font-black text-white">{copies}</span>
              <span className="text-xs text-slate-400 ml-1.5 font-bold">Passport Photos</span>
            </div>

            <button
              type="button"
              disabled={copies >= maxCopies}
              onClick={() => setCopies((prev) => Math.min(maxCopies, prev + 1))}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-white flex items-center justify-center transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Live Total Display */}
          <div className="bg-cyan-950/40 border border-cyan-500/30 rounded-2xl p-3 flex items-center justify-between">
            <span className="text-xs font-bold text-cyan-300">Total Amount:</span>
            <span className="text-xl font-black text-cyan-400">₹{totalPrice}</span>
          </div>
        </div>

        {/* STEP 3: PAYMENT METHOD */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-black text-xs flex items-center justify-center">
              3
            </div>
            <h2 className="text-sm font-extrabold text-white">Choose How to Pay</h2>
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('CASH')}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                paymentMethod === 'CASH'
                  ? 'bg-amber-950/60 border-amber-400 text-white shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <Banknote className={`w-4 h-4 ${paymentMethod === 'CASH' ? 'text-amber-400' : 'text-slate-500'}`} />
                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${paymentMethod === 'CASH' ? 'border-amber-400 bg-amber-400' : 'border-slate-700'}`}>
                  {paymentMethod === 'CASH' && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                </span>
              </div>
              <div>
                <div className="text-xs font-black text-white">Pay at Counter</div>
                <div className="text-[10px] text-slate-400">Cash on Collection</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('ONLINE')}
              className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                paymentMethod === 'ONLINE'
                  ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-md'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <CreditCard className={`w-4 h-4 ${paymentMethod === 'ONLINE' ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${paymentMethod === 'ONLINE' ? 'border-cyan-400 bg-cyan-400' : 'border-slate-700'}`}>
                  {paymentMethod === 'ONLINE' && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                </span>
              </div>
              <div>
                <div className="text-xs font-black text-white">UPI / Online</div>
                <div className="text-[10px] text-slate-400">GPay, PhonePe, Paytm</div>
              </div>
            </button>
          </div>

          {/* Optional Name */}
          <div className="pt-1">
            <input
              type="text"
              placeholder="Your Name (Optional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="button"
          disabled={loading || isUploadingPhoto}
          onClick={handleSubmitOrder}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-[0.98] disabled:opacity-50 text-slate-950 font-black text-base transition-all shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 border border-cyan-300/40"
        >
          {loading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Sending Order to Studio...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Print {copies} Photos — ₹{totalPrice}</span>
              <ArrowRight className="w-5 h-5 ml-1" />
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>Studio Express Print • High Definition 300 DPI</span>
        </p>
      </div>
    </div>
  );
}
