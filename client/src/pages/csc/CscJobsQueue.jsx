import React, { useState, useEffect } from 'react';
import {
  Printer,
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Layers,
  Sparkles,
  Banknote
} from 'lucide-react';
import { cscService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';

const CscJobsQueue = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selectedJob, setSelectedJob] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { error, success } = useToast();

  const loadJobs = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 15,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: search.trim() || undefined
      };
      const res = await cscService.getJobsQueue(params);
      if (res.success && res.data) {
        setJobs(res.data.orders || res.data.jobs || res.data);
        setPagination(res.data.pagination || {});
      }
    } catch (err) {
      error('Failed to load studio print queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
    const interval = setInterval(loadJobs, 8000); // 8s live polling
    return () => clearInterval(interval);
  }, [statusFilter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadJobs();
  };

  const openDetails = (job) => {
    setSelectedJob(job);
    setDetailsModalOpen(true);
  };

  const handleMarkCashReceived = async (orderId) => {
    if (!orderId) return;
    try {
      setActionLoading(true);
      const res = await cscService.markCashReceived(orderId);
      if (res.success) {
        success('Cash payment confirmed! Order dispatched to desktop print queue.');
        loadJobs();
        if (detailsModalOpen) setDetailsModalOpen(false);
      }
    } catch (err) {
      error(err.formattedMessage || err.message || 'Failed to confirm cash received');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Studio Print Queue</h1>
          <p className="text-xs text-slate-400">
            Real-time incoming orders dispatched to your connected Prime ID Pro desktop client.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadJobs}
            icon={RefreshCw}
            isLoading={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['ALL', 'PENDING', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by ID or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </form>
      </div>

      {/* Jobs Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Job / Order Code</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Template &amp; Size</th>
                <th className="py-3.5 px-4">Copies</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Time</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-500">
                    No print jobs found in this queue view.
                  </td>
                </tr>
              ) : (
                jobs.map((item) => {
                  const jobCode = item.jobId?.jobCode || item.jobCode || item.orderId;
                  const status = item.jobId?.jobStatus || item.orderStatus || item.jobStatus;
                  const copies = item.quantity || item.copies || item.jobId?.copies || 1;
                  const price = item.totalAmount || item.priceInr || 0;

                  return (
                    <tr key={item._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                        {jobCode}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{item.customerName}</div>
                        <div className="text-[11px] text-slate-500">{item.customerPhone}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-200">
                        {item.serviceName}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        {copies}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-400">
                        ₹{price}
                      </td>
                      <td className="py-3 px-4">
                        <Badge status={status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {(item.paymentStatus === 'CASH_PENDING' || status === 'CREATED') && (
                            <button
                              onClick={() => handleMarkCashReceived(item.orderId || item._id)}
                              disabled={actionLoading}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
                              title="Collect Cash & Send to Printer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Collect ₹{price} &amp; Print</span>
                            </button>
                          )}
                          <button
                            onClick={() => openDetails(item)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-white transition-all"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing Page {pagination.page} of {pagination.totalPages} ({pagination.total} total orders)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrevPage}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={`Order Details • ${selectedJob?.jobCode}`}
        maxWidth="max-w-md"
      >
        {selectedJob && (
          <div className="space-y-4">
            {/* Customer & Service Info */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Customer:</span>
                <span className="font-bold text-white">{selectedJob.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Phone:</span>
                <span className="text-indigo-400 font-mono">{selectedJob.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Template:</span>
                <span className="font-bold text-white">{selectedJob.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Quantity:</span>
                <span className="font-bold text-white">{selectedJob.copies} Prints</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment:</span>
                <span className="font-bold text-emerald-400">₹{selectedJob.priceInr || selectedJob.totalAmount} ({selectedJob.paymentStatus})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <Badge status={selectedJob.jobStatus || selectedJob.orderStatus} size="sm" />
              </div>
            </div>

            {/* Photo Preview if not purged */}
            {selectedJob.temporaryPhotoUrl && !selectedJob.isPhotoPurged && (
              <div className="text-center">
                <span className="text-[11px] text-slate-400 block mb-2">Temporary Customer Photo:</span>
                <img
                  src={selectedJob.temporaryPhotoUrl}
                  alt="Customer Portrait"
                  className="w-36 h-48 object-cover rounded-xl border border-slate-700 mx-auto shadow-lg"
                />
              </div>
            )}

            {/* Cash Confirmation Action Button */}
            {(selectedJob.paymentStatus === 'CASH_PENDING' || selectedJob.jobStatus === 'CREATED' || selectedJob.orderStatus === 'CREATED') && (
              <Button
                onClick={() => handleMarkCashReceived(selectedJob.orderId || selectedJob._id || selectedJob.id)}
                icon={CheckCircle}
                variant="emerald"
                size="md"
                className="w-full"
                isLoading={actionLoading}
              >
                Confirm Cash (₹{selectedJob.totalAmount || selectedJob.priceInr}) &amp; Send to Printer
              </Button>
            )}

            {/* Status History Timeline */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Audit Timeline
              </span>
              <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                {selectedJob.statusHistory?.map((h, i) => (
                  <div key={i} className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px]">
                    <div className="flex items-center justify-between font-semibold text-slate-300">
                      <span>{h.status}</span>
                      <span className="text-slate-500 font-mono">{new Date(h.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-slate-400 mt-0.5">{h.message}</div>
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

export default CscJobsQueue;
