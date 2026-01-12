import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPlans } from '../api';

export default function Plans({ auth }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadPlans();
  }, [auth.token]);

  const loadPlans = async () => {
    try {
      const data = await getPlans(auth.token);
      setPlans(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatInterval = (seconds) => {
    const days = seconds / 86400;
    if (days === 7) return 'Weekly';
    if (days === 30) return 'Monthly';
    if (days === 90) return 'Quarterly';
    if (days === 365) return 'Yearly';
    return `${days} days`;
  };

  const filteredPlans = plans.filter(p => 
    filter === 'all' || p.status === filter
  );

  const copyLink = (slug) => {
    navigator.clipboard.writeText(`${window.location.origin}/checkout/${slug}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Plans</h1>
          <p className="text-slate-400 mt-1">Manage your subscription plans</p>
        </div>
        <Link to="/plans/create" className="btn-primary">
          + Create New Plan
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['all', 'active', 'inactive'].map(f => (
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

      {/* Plans Grid */}
      {filteredPlans.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold mb-2">No plans found</h3>
          <p className="text-slate-400 mb-6">
            {filter === 'all' 
              ? 'Create your first subscription plan'
              : `No ${filter} plans`}
          </p>
          <Link to="/plans/create" className="btn-primary inline-block">
            Create Plan
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map(plan => (
            <div key={plan.id} className="glass rounded-2xl overflow-hidden card-hover">
              {/* Header */}
              <div className="p-6 border-b border-slate-800">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  <span className={plan.status === 'active' ? 'badge-active' : 'badge-canceled'}>
                    {plan.status}
                  </span>
                </div>
                <p className="text-slate-400 text-sm">{plan.description || 'No description'}</p>
              </div>

              {/* Pricing */}
              <div className="p-6 bg-slate-900/30">
                <p className="text-slate-500 text-sm mb-3">Pricing ({formatInterval(plan.billingInterval)})</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-500 mb-1">IDRX</p>
                    <p className="font-semibold">{plan.priceIdrx.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-500 mb-1">USDC</p>
                    <p className="font-semibold">${(plan.priceUsdc / 1000000).toFixed(2)}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-500 mb-1">USDT</p>
                    <p className="font-semibold">${(plan.priceUsdt / 1000000).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-slate-800 flex items-center justify-between">
                <code className="text-xs text-slate-500 truncate max-w-[150px]">
                  /checkout/{plan.slug}
                </code>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyLink(plan.slug)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-all"
                  >
                    Copy Link
                  </button>
                  <Link
                    to={`/checkout/${plan.slug}`}
                    target="_blank"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm transition-all"
                  >
                    Preview
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
