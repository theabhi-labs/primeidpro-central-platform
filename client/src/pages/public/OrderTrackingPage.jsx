import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Sparkles, RefreshCw, AlertCircle, ArrowLeft } from 'lucide-react';
import { customerService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import LiveTracker from '../../components/LiveTracker';
import Button from '../../components/Button';

const OrderTrackingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { error } = useToast();

  const [jobCode, setJobCode] = useState(searchParams.get('jobCode') || '');
  const [trackingPin, setTrackingPin] = useState(searchParams.get('trackingPin') || '');
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchOrderStatus = async (code, pin) => {
    if (!code) return;
    try {
      setLoading(true);
      const res = await customerService.trackOrder(code, pin);
      if (res.success && res.data?.job) {
        setJob(res.data.job);
      }
    } catch (err) {
      error(err.formattedMessage || 'Order not found');
      setJob(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const code = searchParams.get('jobCode');
    const pin = searchParams.get('trackingPin');
    if (code) {
      setJobCode(code);
      setTrackingPin(pin || '');
      fetchOrderStatus(code, pin);
    }
  }, [searchParams]);

  // Live polling every 4 seconds if job is in progress
  useEffect(() => {
    if (!job || job.jobStatus === 'COMPLETED' || !autoRefresh) return;

    const interval = setInterval(() => {
      customerService
        .trackOrder(job.jobCode, trackingPin)
        .then((res) => {
          if (res.success && res.data?.job) {
            setJob(res.data.job);
          }
        })
        .catch(() => {});
    }, 4000);

    return () => clearInterval(interval);
  }, [job, trackingPin, autoRefresh]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!jobCode.trim()) return;
    setSearchParams({
      jobCode: jobCode.trim().toUpperCase(),
      ...(trackingPin ? { trackingPin: trackingPin.trim() } : {})
    });
    fetchOrderStatus(jobCode.trim().toUpperCase(), trackingPin.trim());
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 min-h-screen">
      {/* Search Header */}
      <div className="mb-8 text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Real-Time Order Tracking
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          Track the live progression of your passport photo print from cloud transfer to AI background replacement and physical printing.
        </p>

        <form
          onSubmit={handleSubmit}
          className="max-w-xl mx-auto p-2 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center gap-2 mt-6"
        >
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              required
              placeholder="Job Code (e.g. PIP-2026-98124)"
              value={jobCode}
              onChange={(e) => setJobCode(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono uppercase"
            />
          </div>
          <input
            type="text"
            placeholder="4-Digit PIN"
            value={trackingPin}
            onChange={(e) => setTrackingPin(e.target.value)}
            maxLength={4}
            className="w-full sm:w-28 px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-center"
          />
          <Button type="submit" variant="primary" size="md" isLoading={loading} className="w-full sm:w-auto">
            Search
          </Button>
        </form>
      </div>

      {/* Live Tracker Result */}
      {job ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Live socket polling active</span>
            </div>
            <button
              onClick={() => fetchOrderStatus(job.jobCode, trackingPin)}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh Now
            </button>
          </div>

          <LiveTracker job={job} />
        </div>
      ) : (
        <div className="p-12 rounded-3xl bg-slate-900/50 border border-slate-800/80 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Order Selected</h3>
            <p className="text-xs text-slate-400 mt-1">
              Enter your Job Code and 4-digit PIN above to track live printing progress.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTrackingPage;
