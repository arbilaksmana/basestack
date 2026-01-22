import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Navbar({ wallet, auth }) {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleConnect = async () => {
    setLoading(true);
    try {
      const address = await wallet.connectWallet();
      if (address) {
        await auth.login(address, wallet.signMessage);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    wallet.disconnect();
    auth.logout();
    navigate('/');
  };

  const shortAddress = (addr) => 
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '';

  const isActive = (path) => location.pathname === path;

  const navLinks = auth.isAuthenticated ? [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/plans', label: 'Plans', icon: '📋' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/billing', label: 'Billing', icon: '💰' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ] : [];

  return (
    <nav className="glass sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">B</span>
              </div>
              <span className="text-xl font-bold">BaseStack</span>
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(link.path)
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
              {wallet.isConnected && (
                <Link
                  to="/subscriptions"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive('/subscriptions')
                      ? 'bg-blue-600/20 text-blue-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="mr-2">💳</span>
                  My Subscriptions
                </Link>
              )}
            </div>
          </div>

          {/* Wallet */}
          <div className="flex items-center gap-4">
            {wallet.isConnected ? (
              <>
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-xl">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-300 font-mono">
                    {shortAddress(wallet.address)}
                  </span>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                onClick={handleConnect}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Connecting...
                  </span>
                ) : (
                  'Connect Wallet'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
