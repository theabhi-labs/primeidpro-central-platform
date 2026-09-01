import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { Printer, Download, QrCode, Sparkles, Smartphone, CheckCircle } from 'lucide-react';

const KioskQRModal = ({ isOpen, onClose, qrData }) => {
  if (!qrData) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.download = `PrimeIdPro-Kiosk-${qrData.centerCode || 'QR'}.png`;
    link.href = qrData.qrDataUrl;
    link.click();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Studio Counter Kiosk QR Poster" maxWidth="max-w-md">
      <div className="space-y-6">
        {/* Printable Poster Card */}
        <div id="printable-kiosk-poster" className="printable-poster p-6 rounded-2xl bg-white text-slate-900 border border-slate-200 text-center shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="font-black text-xl tracking-tight text-indigo-700">PRIME ID PRO</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
              KIOSK
            </span>
          </div>
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
            {qrData.centerName || 'Digital Photo Studio'}
          </div>

          {/* QR Code */}
          <div className="my-3 flex justify-center">
            <div className="p-3 bg-white border-2 border-indigo-600 rounded-2xl shadow-md inline-block">
              <img
                src={qrData.qrDataUrl}
                alt="Studio Kiosk QR"
                className="w-56 h-56 object-contain"
              />
            </div>
          </div>

          {/* Instruction Steps */}
          <div className="mt-4 p-3 bg-slate-50 rounded-xl text-left border border-slate-200 text-xs space-y-1.5 font-medium text-slate-700">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">1</span>
              <span>Scan QR code with your mobile camera</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">2</span>
              <span>Upload photo & select Passport/Visa format</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">3</span>
              <span>Pay online & receive physical prints instantly</span>
            </div>
          </div>

          <div className="mt-3 text-[10px] text-slate-500 font-mono">
            Direct Link: {qrData.kioskUrl || `primeidpro.online/kiosk/${qrData.slug}`}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handlePrint}
            icon={Printer}
            variant="emerald"
            className="flex-1"
          >
            Print Counter Poster
          </Button>
          <Button
            onClick={handleDownloadQR}
            icon={Download}
            variant="secondary"
            className="flex-1"
          >
            Download PNG
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default KioskQRModal;
