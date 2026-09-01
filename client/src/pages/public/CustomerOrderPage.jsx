import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Upload,
  Camera,
  CheckCircle2,
  Sparkles,
  Store,
  CreditCard,
  Layers,
  Crop,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  Search,
  MapPin,
  Clock
} from 'lucide-react';
import { customerService, paymentService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/Button';
import PhotoCropperModal from '../../components/PhotoCropperModal';

const CustomerOrderPage = () => {
  const { slug, token } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { success, error, info } = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Data States
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [centerSearch, setCenterSearch] = useState('');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [copies, setCopies] = useState(8);

  // Photo & Crop States
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadedStorageKey, setUploadedStorageKey] = useState(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropSettings, setCropSettings] = useState({ zoom: 1, rotation: 0, aspectRatio: 35 / 45 });
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');

  // Customer Form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Completed Order State
  const [completedOrder, setCompletedOrder] = useState(null);

  // Load Templates & Centers
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [tplRes, centerRes] = await Promise.all([
          customerService.getTemplates(),
          customerService.listCenters()
        ]);

        if (tplRes.success && tplRes.data) {
          setTemplates(tplRes.data);
          setSelectedTemplate(tplRes.data[0]);
          setCopies(tplRes.data[0].defaultCopies || 8);
        }

        const centerList = (centerRes.success && centerRes.data) ? centerRes.data : [];
        setCenters(centerList);

        const targetIdentifier = slug || token || searchParams.get('center') || searchParams.get('token');

        let activeCenter = null;
        if (targetIdentifier && centerList.length > 0) {
          activeCenter = centerList.find(
            (c) =>
              (c.slug && c.slug.toLowerCase() === targetIdentifier.toLowerCase()) ||
              (c.centerCode && c.centerCode.toUpperCase() === targetIdentifier.toUpperCase()) ||
              (c.qrToken && c.qrToken === targetIdentifier) ||
              (c._id && c._id.toString() === targetIdentifier)
          );
        }

        // Direct fetch fallback if target was provided but not found in first page list
        if (!activeCenter && targetIdentifier) {
          try {
            const singleCenterRes = await customerService.getCenter(targetIdentifier);
            const foundCenter = singleCenterRes.data?.data || singleCenterRes.data;
            if (foundCenter) {
              activeCenter = foundCenter;
              setCenters((prev) => (prev.some((p) => p._id === foundCenter._id) ? prev : [foundCenter, ...prev]));
            }
          } catch (lookupErr) {
            // direct lookup fallback failed
          }
        }

        if (activeCenter) {
          setSelectedCenter(activeCenter);
          setStep(2); // Jump to photo upload directly
        } else if (centerList.length === 1) {
          setSelectedCenter(centerList[0]);
        }
      } catch (err) {
        error('Failed to load studio details: ' + (err.formattedMessage || err.message));
      }
    };

    loadInitialData();
  }, [slug, token, searchParams]);

  // Handle Photo File Selection
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPhotoPreview(objectUrl);

    // Automatically upload to temporary object storage
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const res = await customerService.uploadPhoto(formData);
      if (res.success && res.data) {
        setUploadedStorageKey(res.data.storageKey);
        setUploadedPhotoUrl(res.data.photoUrl);
        success('Photo uploaded to temporary processing storage');
        setIsCropModalOpen(true);
      }
    } catch (err) {
      error('Upload failed: ' + (err.formattedMessage || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Handle Razorpay Checkout
  const handleProceedToPayment = async (e) => {
    e.preventDefault();

    if (!selectedCenter) {
      error('Please select a studio center');
      setStep(1);
      return;
    }
    if (!uploadedStorageKey) {
      error('Please upload your photo');
      setStep(2);
      return;
    }
    if (!customerName || !customerPhone) {
      error('Please enter your name and contact phone number');
      return;
    }

    setLoading(true);

    try {
      // 1. Create order on server
      const orderPayload = {
        centerId: selectedCenter._id,
        customerName,
        customerPhone,
        customerEmail,
        serviceType: selectedTemplate.serviceType,
        copies,
        storageKey: uploadedStorageKey,
        photoUrl: uploadedPhotoUrl,
        cropSettings,
        backgroundColor,
        paymentMethod: 'RAZORPAY'
      };

      const orderRes = await customerService.createOrder(orderPayload);
      if (!orderRes.success || !orderRes.data) {
        throw new Error(orderRes.message || 'Could not create order');
      }

      const order = orderRes.data.order || orderRes.data.job || {};
      const job = orderRes.data.job || orderRes.data.order || {};
      const razorpayOrder = orderRes.data.razorpayOrder;
      const orderJobId = job.id || job.jobId || order.id;

      // 2. Open Razorpay Checkout or simulate test mode
      if (razorpayOrder) {
        const options = {
          key: razorpayOrder.keyId || 'rzp_test_PrimeIdProSandbox2026',
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency || 'INR',
          name: 'PRIME ID PRO',
          description: `${order.serviceName || job.serviceName || 'Passport Photo'} (${copies} prints)`,
          order_id: razorpayOrder.orderId,
          handler: async (response) => {
            try {
              // 3. Verify Payment
              const verifyRes = await paymentService.verifyJobPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                jobId: orderJobId
              });

              if (verifyRes.success) {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                setCompletedOrder({ ...order, ...job, ...verifyRes.data });
                setStep(5); // Success step
                success('Payment successful! Job dispatched to studio desktop.');
              }
            } catch (verErr) {
              error('Payment verification failed: ' + (verErr.formattedMessage || verErr.message));
            }
          },
          prefill: {
            name: customerName,
            contact: customerPhone,
            email: customerEmail
          },
          theme: {
            color: '#4F46E5'
          }
        };

        // If Razorpay SDK loaded on window
        if (window.Razorpay) {
          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          // Simulation fallback for sandbox / offline dev
          info('Razorpay SDK simulation mode: Auto-capturing test payment...');
          const verifyRes = await paymentService.verifyJobPayment({
            razorpay_order_id: razorpayOrder.orderId,
            razorpay_payment_id: `pay_sim_${Date.now()}`,
            razorpay_signature: 'simulated_success_signature',
            jobId: orderJobId
          });
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          setCompletedOrder({ ...order, ...job, ...verifyRes.data });
          setStep(5);
        }
      }
    } catch (err) {
      error('Order failed: ' + (err.formattedMessage || err.message));
    } finally {
      setLoading(false);
    }
  };

  const filteredCenters = centers.filter(
    (c) =>
      c.centerName.toLowerCase().includes(centerSearch.toLowerCase()) ||
      c.city.toLowerCase().includes(centerSearch.toLowerCase()) ||
      c.pincode.includes(centerSearch) ||
      c.centerCode.toLowerCase().includes(centerSearch.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 min-h-screen">
      {/* Wizard Progress Bar */}
      {step < 5 && (
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span className={step >= 1 ? 'text-indigo-400 font-bold' : ''}>1. Studio Center</span>
            <span className={step >= 2 ? 'text-indigo-400 font-bold' : ''}>2. Photo &amp; Crop</span>
            <span className={step >= 3 ? 'text-indigo-400 font-bold' : ''}>3. Size &amp; Template</span>
            <span className={step >= 4 ? 'text-indigo-400 font-bold' : ''}>4. Payment</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-cyber-cyan transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Step 1: Select Studio Center */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Select Your Nearest Studio</h2>
            <p className="text-xs text-slate-400">
              Your prints will be processed and natively printed on this studio's physical hardware.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by studio name, city, pincode, or center code..."
              value={centerSearch}
              onChange={(e) => setCenterSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Studio List */}
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {filteredCenters.map((center) => (
              <div
                key={center._id}
                onClick={() => setSelectedCenter(center)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                  selectedCenter?._id === center._id
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-950/50'
                    : 'bg-slate-900/70 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-800 text-indigo-400 mt-0.5">
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      {center.centerName}
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {center.centerCode}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {center.address}, {center.city}, {center.state} - {center.pincode}
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      selectedCenter?._id === center._id
                        ? 'border-indigo-500 bg-indigo-500 text-white'
                        : 'border-slate-700'
                    }`}
                  >
                    {selectedCenter?._id === center._id && <CheckCircle2 className="w-4 h-4" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              onClick={() => {
                if (!selectedCenter) return error('Please choose a studio');
                setStep(2);
              }}
              icon={ChevronRight}
              variant="primary"
              size="lg"
              disabled={!selectedCenter}
            >
              Continue to Photo Upload
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Photo Upload & Crop */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-white">Upload Your Photo</h2>
              <p className="text-xs text-slate-400">
                Selected Studio:{' '}
                <span className="text-indigo-400 font-semibold">{selectedCenter?.centerName}</span>
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setStep(1)} icon={ArrowLeft}>
              Change Studio
            </Button>
          </div>

          {/* Upload Area */}
          <div className="p-8 rounded-2xl bg-slate-900/60 border-2 border-dashed border-slate-700 hover:border-indigo-500/50 text-center transition-all">
            {photoPreview ? (
              <div className="space-y-4">
                <div className="relative inline-block">
                  <img
                    src={photoPreview}
                    alt="Selected portrait"
                    className="w-44 h-56 object-cover rounded-xl border border-slate-700 shadow-2xl mx-auto"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCropModalOpen(true)}
                    className="absolute bottom-2 right-2 p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg text-xs font-semibold flex items-center gap-1 transition-all"
                  >
                    <Crop className="w-3.5 h-3.5" />
                    Crop &amp; BG
                  </button>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <label className="cursor-pointer text-xs font-semibold text-indigo-400 hover:text-indigo-300">
                    Replace Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoSelect}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <label className="cursor-pointer block space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-sm font-bold text-white block">
                    Click to browse or take a camera selfie
                  </span>
                  <span className="text-xs text-slate-400 block mt-1">
                    Supports JPEG, PNG, WEBP (Max 25MB). AI Face detection handles alignment.
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoSelect}
                />
              </label>
            )}
          </div>

          {/* Privacy Note */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              Privacy Guarantee: Your raw photo is temporarily processed and automatically wiped 10 minutes post-print.
            </span>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <Button variant="outline" onClick={() => setStep(1)} icon={ArrowLeft}>
              Back
            </Button>
            <Button
              onClick={() => {
                if (!uploadedStorageKey) return error('Please upload a photo first');
                setStep(3);
              }}
              icon={ChevronRight}
              variant="primary"
              size="lg"
              disabled={!uploadedStorageKey}
              isLoading={loading}
            >
              Continue to Sizing
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Size & Template Selection */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Choose ID Format &amp; Quantity</h2>
            <p className="text-xs text-slate-400">
              Select the required government standard or card format.
            </p>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {templates.map((tpl) => (
              <div
                key={tpl.serviceType}
                onClick={() => {
                  setSelectedTemplate(tpl);
                  setCopies(tpl.defaultCopies || 8);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  selectedTemplate?.serviceType === tpl.serviceType
                    ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-950/50'
                    : 'bg-slate-900/70 border-slate-800/80 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-white">{tpl.name}</span>
                    <span className="text-xs font-black text-indigo-400">₹{tpl.customerPriceInr}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">{tpl.description}</p>
                </div>

                <div className="text-[11px] text-slate-500 font-medium">
                  Default: {tpl.defaultCopies} copies • Paper: {tpl.paperSize}
                </div>
              </div>
            ))}
          </div>

          {/* Copies Counter */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-300 block">Print Copies</span>
              <span className="text-[11px] text-slate-400">Number of photos generated on sheet</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCopies((c) => Math.max(1, c - 1))}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-sm"
              >
                -
              </button>
              <span className="font-bold text-base text-white w-6 text-center">{copies}</span>
              <button
                type="button"
                onClick={() => setCopies((c) => c + 1)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center text-sm"
              >
                +
              </button>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <Button variant="outline" onClick={() => setStep(2)} icon={ArrowLeft}>
              Back
            </Button>
            <Button
              onClick={() => setStep(4)}
              icon={ChevronRight}
              variant="primary"
              size="lg"
            >
              Continue to Payment
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Review & Payment Checkout */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Review &amp; Instant Checkout</h2>
            <p className="text-xs text-slate-400">
              Provide contact details to receive your pickup PIN and live tracking status.
            </p>
          </div>

          {/* Customer Input Fields */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Mobile Number (For PIN SMS / WhatsApp) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+91 9876543210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Order Summary Receipt */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Order Breakdown
            </h4>

            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>{selectedTemplate?.name} ({copies} copies)</span>
              <span className="font-semibold text-white">₹{selectedTemplate?.customerPriceInr}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Studio: {selectedCenter?.centerName}</span>
              <span>Online Dispatch: Free</span>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-lg font-extrabold text-white">
              <span>Total Payable</span>
              <span className="text-indigo-400">₹{selectedTemplate?.customerPriceInr}</span>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <Button variant="outline" onClick={() => setStep(3)} icon={ArrowLeft}>
              Back
            </Button>
            <Button
              onClick={handleProceedToPayment}
              icon={CreditCard}
              variant="emerald"
              size="lg"
              isLoading={loading}
            >
              Pay ₹{selectedTemplate?.customerPriceInr} via Razorpay
            </Button>
          </div>
        </div>
      )}

      {/* Step 5: Success & Order Pickup PIN Screen */}
      {step === 5 && completedOrder && (
        <div className="p-8 rounded-3xl bg-slate-900 border border-emerald-500/40 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-3xl font-extrabold text-white">Order Confirmed &amp; Dispatched!</h2>
            <p className="text-xs text-slate-400 mt-1">
              Your photo is currently transferring to the studio's desktop application for 300 DPI native printing.
            </p>
          </div>

          {/* Job Code & PIN Display */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 max-w-md mx-auto space-y-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-mono">Job Tracking Code</span>
              <div className="text-2xl font-black text-indigo-400 font-mono tracking-wider mt-1">
                {completedOrder.jobCode}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-mono">4-Digit Pickup PIN</span>
              <div className="text-3xl font-black text-emerald-400 font-mono tracking-widest mt-1">
                {completedOrder.trackingPin}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              onClick={() =>
                navigate(`/track?jobCode=${completedOrder.jobCode}&trackingPin=${completedOrder.trackingPin}`)
              }
              icon={Sparkles}
              variant="primary"
              size="lg"
            >
              View Live Tracking Stepper
            </Button>
            <Button onClick={() => navigate('/')} variant="outline" size="lg">
              Return Home
            </Button>
          </div>
        </div>
      )}

      {/* Interactive Photo Cropper Modal */}
      <PhotoCropperModal
        isOpen={isCropModalOpen}
        onClose={() => setIsCropModalOpen(false)}
        imageSrc={photoPreview}
        template={selectedTemplate}
        onConfirm={(settings) => {
          setCropSettings(settings.cropSettings);
          setBackgroundColor(settings.backgroundColor);
          success('Photo adjustments saved.');
        }}
      />
    </div>
  );
};

export default CustomerOrderPage;
