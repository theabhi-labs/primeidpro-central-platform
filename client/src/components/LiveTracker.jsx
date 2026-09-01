import React from 'react';
import Badge from './Badge';
import {
  CheckCircle2,
  Clock,
  Printer,
  Sparkles,
  Store,
  Download,
  AlertCircle,
  FileCheck,
  ShieldCheck,
  Zap
} from 'lucide-react';

const LiveTracker = ({ job }) => {
  if (!job) return null;

  const isComplete = job.jobStatus === 'COMPLETED';

  return (
    <div className="space-y-6">
      {/* Header Status Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Order ID:</span>
              <span className="text-sm font-extrabold text-indigo-400 font-mono">{job.jobCode}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {job.serviceName}
            </h2>
            <div className="text-xs text-slate-400 mt-1">
              Customer: <span className="text-white font-medium">{job.customerName}</span> • Quantity: <span className="text-white font-medium">{job.copies} Prints</span>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <Badge status={job.jobStatus} size="lg" />
            <span className="text-xs font-bold text-emerald-400">
              ₹{job.priceInr} Paid • {job.paymentStatus}
            </span>
          </div>
        </div>

        {/* Completion Notice & Digital Photo Download */}
        {isComplete ? (
          <div className="mt-6 p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-bold text-emerald-200">
                  🎉 Prints are Ready at the Studio Counter!
                </div>
                <div className="text-xs text-emerald-300/80">
                  Please show your PIN (<span className="font-mono font-bold text-white">#{job.jobCode}</span>) at the counter for pickup.
                </div>
              </div>
            </div>
            {job.temporaryPhotoUrl && !job.isPhotoPurged && (
              <a
                href={job.temporaryPhotoUrl}
                download={`PrimeIdPro-${job.jobCode}.jpg`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
              >
                <Download className="w-4 h-4" />
                Download Digital Copy
              </a>
            )}
          </div>
        ) : (
          <div className="mt-6 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 flex items-center gap-3 text-xs text-indigo-300">
            <Zap className="w-4 h-4 text-indigo-400 animate-pulse flex-shrink-0" />
            <span>
              Real-time update: Physical desktop client is actively preparing your 300 DPI layout.
            </span>
          </div>
        )}
      </div>

      {/* Vertical Stepper Timeline */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" />
          Live Processing Milestones
        </h3>

        <div className="space-y-6 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
          {job.steps?.map((step, idx) => {
            const isDone = step.done;
            const isCurrent = !isDone && (idx === 0 || job.steps[idx - 1]?.done);

            return (
              <div key={step.key} className="flex items-start gap-4 relative z-10">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isDone
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : isCurrent
                      ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20 animate-pulse'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>

                <div className="flex-1">
                  <div className={`text-sm font-bold ${isDone ? 'text-white' : isCurrent ? 'text-indigo-300' : 'text-slate-500'}`}>
                    {step.label}
                  </div>
                  {isCurrent && (
                    <div className="text-xs text-indigo-400 mt-0.5 animate-pulse">
                      In progress right now...
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Studio Location Card */}
      {job.center && (
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Store className="w-6 h-6" />
          </div>
          <div className="flex-1 text-xs">
            <div className="font-bold text-sm text-white">{job.center.centerName}</div>
            <div className="text-slate-400 mt-0.5">{job.center.address}, {job.center.city}, {job.center.state} - {job.center.pincode}</div>
            <div className="text-slate-400 mt-1">Phone: <span className="text-indigo-400 font-semibold">{job.center.phone}</span></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveTracker;
