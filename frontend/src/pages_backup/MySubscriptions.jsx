import { useState, useEffect } from 'react';
import { getMySubscriptions, cancelSubscription } from '../api';

export default function MySubscriptions({ wallet }) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [canceling, setCanceling] = useState(null);

  useEffect(() => {
    if (wallet.isConnected) {
      loadSubscriptions();
    }
  }, [wallet.address]);

  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      const data = await getMySubscriptions(wallet.address);
      setSubscriptions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this subscription? This action cannot be undone.')) return;

    setCanceling(id);
    try {
      await cancelSubscription(id, {
        walletAddress: wallet.address,
        txHash: '0x' + Array(64).fill(0).map(() => 
          Math.floor(Math.random() * 16).toString(16)).join('')
      });
      loadSubscriptions();
    } catch (err) {
      alert(err.message);
    } finally {
      setCanceling(null);
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const formatPrice = (amount, token) => {
    if (token === 'IDRX') return `${amount.toLocaleString()} IDRX`;
    return `$${(amount / 1000000).toFixed(2)} ${token}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return 'badge-active';
      case 'past_due': return 'badge-past-due';
      case 'canceled': return 'badge-canceled';
      default: return 'badge-canceled';
    }
  };

  if (!wallet.isConnected) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🔗</span>
        </div>
        <h1 className="text-3xl font-bold mb-4">My Subscriptions</h1>
        <p className="text-slate-400 mb-8">Connect your wallet to view and manage your subscriptions</p>
        <button onClick={wallet.connectWallet} className="btn-primary">
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Subscriptions</h1>
        <p className="text-slate-400 mt-1">
          Manage your active subscriptions • {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">💳</div>
          <h3 className="text-xl font-semibold mb-2">No subscriptions yet</h3>
          <p className="text-slate-400 mb-6">You haven't subscribed to any plans</p>
        </div>
      ) : (
        <div className="space-y-4">
          {subscriptions.map(sub => (
            <div key={sub.id} className="glass rounded-2xl overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Plan Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">⚡</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-lg">{sub.planName}</h3>
                        <span className={getStatusBadge(sub.status)}>{sub.status}</span>
                      </div>
                      <p className="text-slate-400 text-sm">{sub.planDescription || 'Subscription plan'}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="text-2xl font-bold">{formatPrice(sub.amount, sub.payToken)}</p>
                    <p className="text-slate-400 text-sm">per billing cycle</p>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
                  <div>
                    <p className="text-slate-500 text-sm">Payment Token</p>
                    <p className="font-medium">{sub.payToken}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm">Next Payment</p>
                    <p className="font-medium">{formatDate(sub.nextPayment)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm">Started</p>
                    <p className="font-medium">{formatDate(sub.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-sm">Billing</p>
                    <p className="font-medium">
                      {sub.billingInterval === 2592000 ? 'Monthly' : 
                       sub.billingInterval === 604800 ? 'Weekly' : 
                       `${sub.billingInterval / 86400} days`}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                {sub.status === 'active' && (
                  <div className="mt-6 pt-6 border-t border-slate-800 flex justify-end">
                    <button
                      onClick={() => handleCancel(sub.id)}
                      disabled={canceling === sub.id}
                      className="btn-danger"
                    >
                      {canceling === sub.id ? 'Canceling...' : 'Cancel Subscription'}
                    </button>
                  </div>
                )}

                {sub.status === 'past_due' && (
                  <div className="mt-6 pt-6 border-t border-slate-800">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
                      <span className="text-2xl">⚠️</span>
                      <div>
                        <p className="font-medium text-amber-400">Payment Failed</p>
                        <p className="text-sm text-slate-400">Please ensure you have sufficient balance for the next billing attempt</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
