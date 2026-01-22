import { useState, useEffect } from 'react';
import { getBillingLogs } from '../api';

export default function BillingHistory({ auth }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadLogs();
  }, [auth.token]);

  const loadLogs = async () => {
    try {
      const data = await getBillingLogs(auth.token);
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const formatAmount = (amount, token) => {
    if (token === 'IDRX') return `${amount.toLocaleString()} IDRX`;
    return `$${(amount / 1000000).toFixed(2)}`;
  };

  const filteredLogs = logs.filter(log => 
    filter === 'all' || log.status === filter
  );

  const totalSuccess = logs.filter(l => l.status === 'success').reduce((sum, l) => sum + (l.amount || 0), 0);
  const totalFailed = logs.filter(l => l.status === 'failed').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Billing History</h1>
          <p className="text-slate-400 mt-1">View all payment transactions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="glass rounded-xl p-4">
          <p className="text-slate-400 text-sm">Total Collected</p>
          <p className="text-2xl font-bold text-emerald-400">${(totalSuccess / 1000000).toFixed(2)}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-slate-400 text-sm">Successful</p>
          <p className="text-2xl font-bold">{logs.filter(l => l.status === 'success').length}</p>
        </div>
        <div className="glass rounded-xl p-4">
          <p className="text-slate-400 text-sm">Failed</p>
          <p className="text-2xl font-bold text-red-400">{totalFailed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['all', 'success', 'failed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-slate-400">No billing logs yet</p>
            <p className="text-slate-500 text-sm mt-2">Logs will appear here when subscriptions are charged</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-400 text-sm bg-slate-900/50">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Subscriber</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Transaction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-900/30 transition-colors">
                    <td className="px-6 py-4 text-sm">{formatDate(log.createdAt)}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{log.planName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-sm text-slate-400">
                        {log.subscriberWallet?.slice(0, 6)}...{log.subscriberWallet?.slice(-4)}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{formatAmount(log.amount, log.payToken)}</p>
                      <p className="text-xs text-slate-500">{log.payToken}</p>
                    </td>
                    <td className="px-6 py-4">
                      {log.status === 'success' ? (
                        <span className="badge-active">Success</span>
                      ) : (
                        <div>
                          <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-medium">
                            Failed
                          </span>
                          {log.reason && (
                            <p className="text-xs text-slate-500 mt-1">{log.reason}</p>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {log.txHash ? (
                        <a 
                          href={`https://basescan.org/tx/${log.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          View →
                        </a>
                      ) : (
                        <span className="text-slate-500 text-sm">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
