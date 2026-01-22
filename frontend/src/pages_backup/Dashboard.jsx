import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardMetrics, getPlans } from '../api';

export default function Dashboard({ auth }) {
  const [metrics, setMetrics] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [auth.token]);

  const loadData = async () => {
    try {
      const [metricsData, plansData] = await Promise.all([
        getDashboardMetrics(auth.token),
        getPlans(auth.token)
      ]);
      setMetrics(metricsData);
      setPlans(plansData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatMRR = (mrr) => {
    if (!mrr) return '$0';
    return `$${(mrr / 1000000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatInterval = (seconds) => {
    const days = seconds / 86400;
    if (days === 7) return 'Weekly';
    if (days === 30) return 'Monthly';
    if (days === 90) return 'Quarterly';
    if (days === 365) return 'Yearly';
    return `${days} days`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome back, {auth.merchant?.walletAddress?.slice(0, 8)}...</p>
        </div>
        <Link to="/plans/create" className="btn-primary">
          + Create New Plan
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-sm">Active Subscribers</span>
            <span className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
              👥
            </span>
          </div>
          <p className="text-3xl font-bold">{metrics?.activeCount || 0}</p>
          <p className="text-emerald-400 text-sm mt-2">+12% from last month</p>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-sm">Past Due</span>
            <span className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-400">
              ⚠️
            </span>
          </div>
          <p className="text-3xl font-bold">{metrics?.pastDueCount || 0}</p>
          <p className="text-amber-400 text-sm mt-2">Needs attention</p>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-sm">Total Subscribers</span>
            <span className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
              📊
            </span>
          </div>
          <p className="text-3xl font-bold">{metrics?.totalSubscribers || 0}</p>
          <p className="text-slate-400 text-sm mt-2">All time</p>
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-400 text-sm">Monthly Revenue</span>
            <span className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
              💰
            </span>
          </div>
          <p className="text-3xl font-bold gradient-text">{formatMRR(metrics?.mrr)}</p>
          <p className="text-purple-400 text-sm mt-2">MRR</p>
        </div>
      </div>

      {/* Plans Section */}
      <div className="glass rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Your Plans</h2>
          <Link to="/plans" className="text-blue-400 hover:text-blue-300 text-sm">
            View all →
          </Link>
        </div>

        {plans.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2">No plans yet</h3>
            <p className="text-slate-400 mb-6">Create your first subscription plan to start accepting payments</p>
            <Link to="/plans/create" className="btn-primary inline-block">
              Create Plan
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.slice(0, 6).map(plan => (
              <div key={plan.id} className="bg-slate-900/50 rounded-xl p-5 border border-slate-800 card-hover">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold">{plan.name}</h3>
                  <span className={plan.status === 'active' ? 'badge-active' : 'badge-canceled'}>
                    {plan.status}
                  </span>
                </div>
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">{plan.description || 'No description'}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Billing</span>
                    <span>{formatInterval(plan.billingInterval)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">USDC</span>
                    <span>${(plan.priceUsdc / 1000000).toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <code className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                      /checkout/{plan.slug}
                    </code>
                    <button 
                      onClick={() => navigator.clipboard.writeText(`${window.location.origin}/checkout/${plan.slug}`)}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <Link to="/plans/create" className="glass rounded-xl p-6 card-hover group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              ➕
            </div>
            <div>
              <h3 className="font-semibold">Create Plan</h3>
              <p className="text-slate-400 text-sm">Add new subscription</p>
            </div>
          </div>
        </Link>

        <Link to="/analytics" className="glass rounded-xl p-6 card-hover group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              📈
            </div>
            <div>
              <h3 className="font-semibold">Analytics</h3>
              <p className="text-slate-400 text-sm">View detailed stats</p>
            </div>
          </div>
        </Link>

        <Link to="/subscriptions" className="glass rounded-xl p-6 card-hover group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
              👥
            </div>
            <div>
              <h3 className="font-semibold">Subscribers</h3>
              <p className="text-slate-400 text-sm">Manage customers</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
