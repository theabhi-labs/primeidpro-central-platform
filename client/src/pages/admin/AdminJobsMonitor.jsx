import React, { useState, useEffect } from 'react';
import {
  Activity,
  Search,
  RefreshCw,
  Eye,
  Clock,
  Printer,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { adminService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';

const AdminJobsMonitor = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { error } = useToast();

  const loadJobs = async () => {
    try {
      setLoading(true);
      const res = await adminService.listJobs({
        search,
        status: statusFilter || undefined,
        limit: 30
      });
      if (res.success && res.data) {
        setJobs(res.data);
      }
    } catch (err) {
      error('Failed to load global jobs feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 8000);
    return () => clearInterval(interval);
  }, [statusFilter]);

  const openJobModal = (job) => {
    setSelectedJob(job);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Global Job Monitor</h1>
          <p className="text-xs text-slate-400">
            Real-time feed of all photo and ID card print jobs across all connected CSC studios nationwide.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadJobs} icon={RefreshCw} isLoading={loading}>
          Refresh Feed
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['', 'PAID', 'DISPATCHED', 'PROCESSING', 'PRINTING', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st || 'All Statuses'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search Job Code, Customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadJobs()}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Jobs Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Job Code</th>
                <th className="py-3.5 px-4">Studio Center</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Service</th>
                <th className="py-3.5 px-4">Price / Credit</th>
                <th className="py-3.5 px-4">Job State</th>
                <th className="py-3.5 px-4">Device</th>
                <th className="py-3.5 px-4 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-slate-500">
                    No jobs matching filter.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                      {job.jobCode}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{job.centerId?.centerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{job.centerId?.centerCode}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{job.customerName}</div>
                      <div className="text-[11px] text-slate-500">{job.customerPhone}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-300">
                      {job.serviceName} ({job.copies}x)
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-emerald-400">₹{job.priceInr}</span>
                      <span className="text-slate-500 text-[11px] ml-1">/ -₹{job.creditCost}</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={job.jobStatus} size="sm" />
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {job.claimedByDeviceId?.deviceId || 'Queue Waiting'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openJobModal(job)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-white transition-all"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Audit Inspector • ${selectedJob?.jobCode}`}
        maxWidth="max-w-lg"
      >
        {selectedJob && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Customer Name &amp; Phone:</span>
                <span className="font-bold text-white">{selectedJob.customerName} ({selectedJob.customerPhone})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Studio:</span>
                <span className="font-bold text-white">{selectedJob.centerId?.centerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Razorpay Payment ID:</span>
                <span className="font-mono text-emerald-400">{selectedJob.razorpayPaymentId || 'CASH_OR_SIM'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Photo Auto-Purged:</span>
                <span className="font-mono font-bold text-amber-400">{selectedJob.isPhotoPurged ? 'YES (Purged from Storage)' : 'ACTIVE (<10m TTL)'}</span>
              </div>
            </div>

            <div>
              <span className="font-bold uppercase tracking-wider text-slate-400 block mb-2">Audit History</span>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {selectedJob.statusHistory?.map((h, i) => (
                  <div key={i} className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-300">
                      <span>{h.status} • {h.source}</span>
                      <span className="text-slate-500 font-mono">{new Date(h.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{h.message}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminJobsMonitor;
