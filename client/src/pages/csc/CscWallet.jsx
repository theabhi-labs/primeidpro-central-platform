import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Coins,
  History
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { cscService, paymentService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';

const CscWallet = () => {
  const { studioCenter, refreshUser } = useAuth();
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topupModalOpen, setTopupModalOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState(500);
  const [topupLoading, setTopupLoading] = useState(false);
  const [walletInfo, setWalletInfo] = useState(null);

  const loadLedger = async () => {
    try {
      setLoading(true);
      const res = await cscService.getWalletAndLedger();
      if (res.success && res.data) {
        const transactions = Array.isArray(res.data.transactions)
          ? res.data.transactions
          : Array.isArray(res.data)
          ? res.data
          : [];
        setLedger(transactions);
        if (res.data.wallet) {
          setWalletInfo(res.data.wallet);
        }
      }
    } catch (err) {
      error('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedger();
  }, []);

  const handleTopup = async (e) => {
    e.preventDefault();
    if (topupAmount < 50) return error('Minimum recharge is ₹50');

    setTopupLoading(true);
    try {
      // 1. Create Razorpay order
      const orderRes = await paymentService.createWalletTopupOrder(topupAmount);
      if (!orderRes.success || !orderRes.data) {
        throw new Error(orderRes.message || 'Failed to initialize top-up order');
      }

      const { orderId, amount, currency, keyId } = orderRes.data;

      // 2. Open Razorpay Checkout or fallback simulation
      const options = {
        key: keyId || 'rzp_test_PrimeIdProSandbox2026',
        amount,
        currency: currency || 'INR',
        name: 'Prime ID Pro Wallet Recharge',
        description: `Wallet Recharge of ₹${topupAmount}`,
        order_id: orderId,
        handler: async (response) => {
          try {
            const verifyRes = await paymentService.verifyWalletTopup({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amountInr: topupAmount
            });

            if (verifyRes.success) {
              confetti({ particleCount: 80, spread: 60 });
              success(`Wallet recharged with ₹${topupAmount}!`);
              setTopupModalOpen(false);
              await refreshUser();
              loadLedger();
            }
          } catch (verErr) {
            error('Top-up verification failed');
          }
        },
        theme: { color: '#4F46E5' }
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Simulation mode
        info('Processing simulated wallet top-up...');
        const verifyRes = await paymentService.verifyWalletTopup({
          razorpay_order_id: orderId,
          razorpay_payment_id: `pay_topup_${Date.now()}`,
          razorpay_signature: 'simulated_success_signature',
          amountInr: topupAmount
        });
        confetti({ particleCount: 80, spread: 60 });
        success(`Wallet recharged with ₹${topupAmount}!`);
        setTopupModalOpen(false);
        await refreshUser();
        loadLedger();
      }
    } catch (err) {
      error('Top-up failed: ' + (err.formattedMessage || err.message));
    } finally {
      setTopupLoading(false);
    }
  };

  const currentBalance = walletInfo?.currentBalance ?? studioCenter?.walletBalance ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Studio Wallet &amp; Ledger</h1>
          <p className="text-xs text-slate-400">
            Automated double-entry credit ledger for desktop print deductions and Razorpay top-ups.
          </p>
        </div>

        <Button
          onClick={() => setTopupModalOpen(true)}
          icon={Plus}
          variant="emerald"
          size="md"
        >
          Recharge Wallet
        </Button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/40 backdrop-blur-xl shadow-xl space-y-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Available Print Credits
          </span>
          <div className="text-3xl sm:text-4xl font-black text-emerald-400">
            ₹{currentBalance}
          </div>
          <div className="text-xs text-slate-400">
            Deducted automatically at ₹2 (2 credits) per photo print job.
          </div>
        </div>

        <StatCard
          title="Avg. Cost Per Photo"
          value="₹2.00"
          subtitle="Fixed platform fee (2 credits)"
          icon={Coins}
          color="indigo"
        />

        <StatCard
          title="Print Capacity"
          value={`${Math.floor(currentBalance / 2)} Photos`}
          subtitle="Prints available with balance"
          icon={CreditCard}
          color="cyan"
        />
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden backdrop-blur-xl shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            Transaction Audit Trail
          </h3>
          <Button variant="outline" size="sm" onClick={loadLedger} icon={RefreshCw} isLoading={loading}>
            Refresh
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Description</th>
                <th className="py-3.5 px-4">Credits</th>
                <th className="py-3.5 px-4">Balance After</th>
                <th className="py-3.5 px-4">Reference</th>
                <th className="py-3.5 px-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {ledger.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-500">
                    No wallet transactions recorded yet.
                  </td>
                </tr>
              ) : (
                ledger.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold">
                      {(item.transactionType === 'PURCHASE' || item.transactionType === 'WALLET_RECHARGE' || item.type === 'WALLET_RECHARGE') ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <ArrowDownLeft className="w-3.5 h-3.5" /> Recharge
                        </span>
                      ) : (item.transactionType === 'JOB_DEDUCTION' || item.transactionType === 'JOB_DEBIT' || item.type === 'JOB_DEBIT') ? (
                        <span className="text-rose-400 flex items-center gap-1">
                          <ArrowUpRight className="w-3.5 h-3.5" /> Job Debit
                        </span>
                      ) : item.transactionType === 'REFUND' ? (
                        <span className="text-cyan-400 flex items-center gap-1">
                          <ArrowDownLeft className="w-3.5 h-3.5" /> Refund
                        </span>
                      ) : (
                        <span className="text-indigo-400">{item.transactionType || item.type}</span>
                      )}
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
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                      {item.referenceId || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 font-mono text-[11px]">
                      {new Date(item.createdAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Topup Modal */}
      <Modal
        isOpen={topupModalOpen}
        onClose={() => setTopupModalOpen(false)}
        title="Recharge Studio Wallet"
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleTopup} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Select Recharge Amount (INR)
            </label>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[200, 500, 1000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setTopupAmount(amt)}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                    topupAmount === amt
                      ? 'border-indigo-500 bg-indigo-600/20 text-white'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="50"
              required
              value={topupAmount}
              onChange={(e) => setTopupAmount(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
            Powered by Razorpay. 100% secure payment with UPI, cards, and net banking.
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setTopupModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="emerald"
              isLoading={topupLoading}
            >
              Pay ₹{topupAmount}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CscWallet;
