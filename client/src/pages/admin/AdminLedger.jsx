import React, { useState, useEffect } from 'react';
import {
  Coins,
  Search,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  FileSpreadsheet
} from 'lucide-react';
import { adminService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/Button';

const AdminLedger = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  const loadLedger = async () => {
    try {
      setLoading(true);
      const res = await adminService.listLedger({ limit: 50 });
      if (res.success && res.data) {
        setItems(res.data);
      }
    } catch (err) {
      error('Failed to load global financial ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedger();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Platform Financial Ledger</h1>
          <p className="text-xs text-slate-400">
            Immutable double-entry transaction ledger tracking studio credit recharges and print deductions.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadLedger} icon={RefreshCw} isLoading={loading}>
          Refresh Ledger
        </Button>
      </div>

      {/* Ledger Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Transaction Type</th>
                <th className="py-3.5 px-4">Studio Center</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Credits</th>
                <th className="py-3.5 px-4">Balance After</th>
                <th className="py-3.5 px-4">Idempotency Key</th>
                <th className="py-3.5 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {items.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-500">
                    No transactions recorded.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold">
                      {item.type === 'WALLET_RECHARGE' ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <ArrowDownLeft className="w-3.5 h-3.5" /> Top-up
                        </span>
                      ) : item.type === 'JOB_DEBIT' ? (
                        <span className="text-rose-400 flex items-center gap-1">
                          <ArrowUpRight className="w-3.5 h-3.5" /> Job Debit
                        </span>
                      ) : (
                        <span className="text-amber-400">{item.type}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{item.centerId?.centerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{item.centerId?.centerCode}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-200">
                      {item.description}
                    </td>
                    <td className={`py-3 px-4 font-bold ${item.credits >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {item.credits >= 0 ? `+₹${item.credits}` : `-₹${Math.abs(item.credits)}`}
                    </td>
                    <td className="py-3 px-4 font-bold text-white font-mono">
                      ₹{item.balanceAfter}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 truncate max-w-xs">
                      {item.idempotencyKey || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminLedger;
