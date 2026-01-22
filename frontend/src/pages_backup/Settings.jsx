import { useState, useEffect } from 'react';
import { getMerchantProfile, updateMerchantProfile } from '../api';

export default function Settings({ auth, wallet }) {
  const [merchantName, setMerchantName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [auth.token]);

  const loadProfile = async () => {
    try {
      const profile = await getMerchantProfile(auth.token);
      setMerchantName(profile.name || '');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await updateMerchantProfile({ name: merchantName }, auth.token);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const maskToken = (token) => {
    if (!token) return '';
    return '•'.repeat(20) + token.slice(-8);
  };

  const getApiBaseUrl = () => {
    // Use environment-aware URL
    if (import.meta.env.VITE_API_URL) {
      return import.meta.env.VITE_API_URL;
    }
    return `${window.location.protocol}//${window.location.hostname}:3000/api`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your account and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-6">Profile</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Business Name</label>
              <input
                type="text"
                value={merchantName}
                onChange={e => setMerchantName(e.target.value)}
                className="input max-w-md"
                placeholder="Your business name"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Wallet Address</label>
              <div className="flex items-center gap-3">
                <code className="flex-1 max-w-md px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-sm font-mono truncate">
                  {auth.merchant?.walletAddress || wallet.address}
                </code>
                <button
                  onClick={() => copyToClipboard(auth.merchant?.walletAddress || wallet.address)}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all whitespace-nowrap"
                >
                  Copy
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Merchant ID</label>
              <code className="px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-sm font-mono inline-block">
                #{auth.merchant?.id}
              </code>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800 flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            {saved && (
              <span className="text-emerald-400 text-sm">✓ Saved successfully</span>
            )}
          </div>
        </div>

        {/* API Keys Section - Security Enhanced */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-2">API Access</h2>
          <p className="text-slate-400 text-sm mb-4">Use these credentials to integrate with your application</p>
          
          {/* Security Warning */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-medium text-amber-400">Security Notice</p>
                <p className="text-sm text-slate-400 mt-1">
                  Keep your API credentials secret. Never share them publicly or commit them to version control.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">API Base URL</label>
              <div className="flex items-center gap-3">
                <code className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-sm font-mono">
                  {getApiBaseUrl()}
                </code>
              </div>
              <p className="text-slate-500 text-xs mt-2">Configure via VITE_API_URL environment variable</p>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Authentication Token</label>
              <div className="flex items-center gap-3">
                <code className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-sm font-mono truncate">
                  {showToken ? auth.token : maskToken(auth.token)}
                </code>
                <button
                  onClick={() => setShowToken(!showToken)}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all whitespace-nowrap"
                >
                  {showToken ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="text-slate-500 text-xs mt-2">
                Include in Authorization header: <code className="bg-slate-800 px-1 rounded">Bearer {'<token>'}</code>
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-slate-500 text-sm">
              🔒 Token expires in 7 days. Re-authenticate to get a new token.
            </p>
          </div>
        </div>

        {/* Supported Tokens */}
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-2">Supported Tokens</h2>
          <p className="text-slate-400 text-sm mb-6">Tokens available for subscription payments</p>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-900/50 rounded-xl p-4 text-center">
              <span className="text-2xl">🇮🇩</span>
              <p className="font-semibold mt-2">IDRX</p>
              <p className="text-slate-500 text-xs">Indonesian Rupiah Token</p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4 text-center">
              <span className="text-2xl">💵</span>
              <p className="font-semibold mt-2">USDC</p>
              <p className="text-slate-500 text-xs">USD Coin</p>
            </div>
            <div className="bg-slate-900/50 rounded-xl p-4 text-center">
              <span className="text-2xl">💲</span>
              <p className="font-semibold mt-2">USDT</p>
              <p className="text-slate-500 text-xs">Tether USD</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
