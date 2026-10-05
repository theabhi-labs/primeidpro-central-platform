import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Printer,
  Download,
  Copy,
  ExternalLink,
  Sparkles,
  Smartphone,
  CheckCircle2
} from 'lucide-react';
import { cscService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/Button';

const CscKioskQr = () => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  const loadKioskQr = async () => {
    try {
      setLoading(true);
      const res = await cscService.getKioskQr();
      if (res.success && res.data) {
        setQrData(res.data);
      }
    } catch (err) {
      error('Failed to generate studio QR code');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKioskQr();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const displayKioskUrl = qrData?.kioskUrl
    ? (qrData.kioskUrl.includes('api.primeidpro.online')
        ? qrData.kioskUrl.replace('api.primeidpro.online/api/v1', 'www.primeidpro.online').replace('api.primeidpro.online', 'www.primeidpro.online')
        : qrData.kioskUrl)
    : `${window.location.origin}/order/${qrData?.qrToken || qrData?.slug || ''}`;

  const handleCopyLink = () => {
    if (!displayKioskUrl) return;
    navigator.clipboard.writeText(displayKioskUrl);
    success('Kiosk direct link copied to clipboard!');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Counter Kiosk QR Poster</h1>
          <p className="text-xs text-slate-400">
            Print this poster and place it on your studio front desk. Customers can scan to order directly.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handlePrint} icon={Printer} variant="emerald" size="md">
            Print Counter Poster
          </Button>
          <Button onClick={handleCopyLink} icon={Copy} variant="outline" size="md">
            Copy Kiosk Link
          </Button>
        </div>
      </div>

      {/* Printable Poster Card */}
      {qrData ? (
        <div className="printable-poster p-8 sm:p-10 rounded-3xl bg-white text-slate-900 border border-slate-200 text-center shadow-2xl space-y-5 max-w-md mx-auto print:shadow-none">
          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <span className="font-black text-2xl tracking-tight text-indigo-700">PRIME ID PRO</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                KIOSK
              </span>
            </div>
            <div className="text-sm font-black text-slate-800 uppercase tracking-wider">
              {qrData.centerName}
            </div>
            <div className="text-xs font-mono text-slate-500">
              Center ID: {qrData.centerCode}
            </div>
          </div>

          {/* QR Code Container */}
          <div className="my-3 flex justify-center">
            <div className="p-3.5 bg-white border-4 border-indigo-600 rounded-3xl shadow-xl inline-block print:shadow-none print:p-2.5">
              <img
                src={qrData.qrDataUrl}
                alt="Kiosk QR Code"
                className="w-56 h-56 object-contain print:w-48 print:h-48"
              />
            </div>
          </div>

          {/* Instruction Steps */}
          <div className="p-3.5 bg-slate-50 rounded-2xl text-left border border-slate-200 text-xs space-y-2 font-semibold text-slate-700 print:p-3 print:space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center font-bold flex-shrink-0">1</span>
              <span>Scan QR code with your mobile camera</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center font-bold flex-shrink-0">2</span>
              <span>Upload photo &amp; select size (Passport / Visa)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center font-bold flex-shrink-0">3</span>
              <span>Pay online &amp; collect instant prints at this counter</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-mono break-all pt-1">
            {displayKioskUrl}
          </div>
        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-slate-900 text-center text-slate-400">
          Generating Kiosk QR...
        </div>
      )}
    </div>
  );
};

export default CscKioskQr;
