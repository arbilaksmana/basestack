import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function ConnectWallet({ wallet, auth, redirectTo = '/dashboard' }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const address = await wallet.connectWallet();
      if (address) {
        await auth.login(address, wallet.signMessage);
        navigate(redirectTo);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto text-center py-20">
      <div className="glass rounded-2xl p-8">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🔗</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Connect Your Wallet</h1>
        <p className="text-slate-400 mb-8">
          Connect your wallet to access the merchant dashboard and manage your subscription plans.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleConnect}
          disabled={loading}
          className="btn-primary w-full text-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Connecting...
            </span>
          ) : (
            'Connect with MetaMask'
          )}
        </button>

        <p className="text-slate-500 text-sm mt-6">
          Don't have MetaMask?{' '}
          <a 
            href="https://metamask.io/download/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300"
          >
            Download here
          </a>
        </p>
      </div>
    </div>
  );
}
