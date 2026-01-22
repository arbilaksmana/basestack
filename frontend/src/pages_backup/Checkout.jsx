import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPlanBySlug, initCheckout, confirmCheckout } from '../api';

const TOKENS = [
  { id: 'IDRX', name: 'IDRX', icon: '🇮🇩', color: 'blue' },
  { id: 'USDC', name: 'USDC', icon: '💵', color: 'blue' },
  { id: 'USDT', name: 'USDT', icon: '💲', color: 'green' }
];

export default function Checkout({ wallet }) {
  const { slug } = useParams();
  const [plan, setPlan] = useState(null);
  const [selectedToken, setSelectedToken] = useState('USDC');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState('select'); // select, confirm, success
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPlan();
  }, [slug]);

  const loadPlan = async () => {
    try {
      const data = await getPlanBySlug(slug);
      setPlan(data);
    } catch (err) {
      setError('Plan not found');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!wallet.isConnected) {
      await wallet.connectWallet();
      return;
    }

    setStep('confirm');
  };

  const handleConfirm = async () => {
    setProcessing(true);
    setError(null);

    try {
      // Init checkout
      await initCheckout(plan.id, {
        walletAddress: wallet.address,
        selectedToken,
        country: 'ID'
      });

      // Simulate tx (in real app, call smart contract)
      const fakeTxHash = '0x' + Array(64).fill(0).map(() => 
        Math.floor(Math.random() * 16).toString(16)).join('');

      // Confirm
      await confirmCheckout(plan.id, {
        walletAddress: wallet.address,
        selectedToken,
        txHash: fakeTxHash
      });

      setStep('success');
    } catch (err) {
      setError(err.message);
      setStep('select');
    } finally {
      setProcessing(false);
    }
  };

  const formatPrice = (token) => {
    if (!plan) return '';
    const price = plan.prices[token];
    if (token === 'IDRX') return `${price.toLocaleString()} IDRX`;
    return `$${(price / 1000000).toFixed(2)}`;
  };

  const formatInterval = (seconds) => {
    const days = seconds / 86400;
    if (days === 7) return 'week';
    if (days === 30) return 'month';
    if (days === 90) return 'quarter';
    if (days === 365) return 'year';
    return `${days} days`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error && !plan) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold mb-2">Plan Not Found</h2>
        <p className="text-slate-400 mb-6">This subscription plan doesn't exist or has been removed.</p>
        <Link to="/" className="btn-primary inline-block">Go Home</Link>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">✓</span>
        </div>
        <h2 className="text-3xl font-bold mb-2">Subscription Active!</h2>
        <p className="text-slate-400 mb-8">
          You're now subscribed to <span className="text-white">{plan.name}</span>
        </p>
        <div className="glass rounded-xl p-6 mb-8 text-left">
          <div className="flex justify-between mb-3">
            <span className="text-slate-400">Plan</span>
            <span>{plan.name}</span>
          </div>
          <div className="flex justify-between mb-3">
            <span className="text-slate-400">Amount</span>
            <span>{formatPrice(selectedToken)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Billing</span>
            <span>Every {formatInterval(plan.billingInterval)}</span>
          </div>
        </div>
        <Link to="/subscriptions" className="btn-primary inline-block">
          View My Subscriptions →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-8">
      {/* Plan Header */}
      <div className="glass rounded-2xl p-8 mb-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <h1 className="text-2xl font-bold">{plan.name}</h1>
          <p className="text-slate-400 mt-2">{plan.description}</p>
        </div>

        {step === 'select' && (
          <>
            {/* Token Selection */}
            <div className="mb-6">
              <label className="block text-sm text-slate-400 mb-3">Select Payment Token</label>
              <div className="space-y-2">
                {TOKENS.map(token => (
                  <button
                    key={token.id}
                    onClick={() => setSelectedToken(token.id)}
                    className={`w-full p-4 rounded-xl border-2 flex items-center justify-between transition-all ${
                      selectedToken === token.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{token.icon}</span>
                      <span className="font-semibold">{token.name}</span>
                    </div>
                    <span className="text-lg font-semibold">{formatPrice(token.id)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-slate-900/50 rounded-xl p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Subtotal</span>
                <span>{formatPrice(selectedToken)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Billing cycle</span>
                <span>Every {formatInterval(plan.billingInterval)}</span>
              </div>
              <div className="border-t border-slate-700 my-3"></div>
              <div className="flex justify-between text-lg font-semibold">
                <span>Total today</span>
                <span className="gradient-text">{formatPrice(selectedToken)}</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleSubscribe}
              className="btn-primary w-full text-lg"
            >
              {wallet.isConnected ? 'Subscribe Now' : 'Connect Wallet to Subscribe'}
            </button>

            {wallet.isConnected && (
              <p className="text-center text-slate-500 text-sm mt-4">
                Connected: {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
              </p>
            )}
          </>
        )}

        {step === 'confirm' && (
          <div className="text-center">
            <div className="bg-slate-900/50 rounded-xl p-6 mb-6">
              <p className="text-slate-400 mb-2">You're about to pay</p>
              <p className="text-4xl font-bold gradient-text mb-2">{formatPrice(selectedToken)}</p>
              <p className="text-slate-400">with {selectedToken}</p>
            </div>

            <p className="text-slate-400 text-sm mb-6">
              By confirming, you authorize recurring charges every {formatInterval(plan.billingInterval)}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('select')}
                disabled={processing}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={processing}
                className="btn-primary flex-1"
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Confirm Payment'
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Security Note */}
      <div className="text-center text-slate-500 text-sm">
        <p>🔒 Secured by Base Network</p>
        <p className="mt-1">Powered by BaseStack</p>
      </div>
    </div>
  );
}
