import { useState, useEffect } from 'react';
import { getDashboardMetrics, getPlans } from '../api';

export default function Analytics({ auth }) {
  const [metrics, setMetrics] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

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

  // Mock data for charts (in real app, fetch from API)
  const revenueData = [
    { month: 'Jul', value: 2400 },
    { month: 'Aug', value: 3200 },
    { month: 'Sep', value: 2800 },
    { month: 'Oct', value: 4100 },
    { month: 'Nov', value: 3800 },
    { month: 'Dec', value: 5200 },
  ];

  const maxRevenue = Math.max(...revenueData.map(d => d.value));

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
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-slate-400 mt-1">Track your subscription performance</p>
        </div>
        <div className="flex gap-2">
          {['7d', '30d', '90d', '1y'].map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass rounded-2xl p-6">
          <p className="text-slate-400 text-sm mb-2">Monthly Revenue</p>
          <p className="text-3xl font-bold gradient-text">
            ${((metrics?.mrr || 0) / 1000000).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
          <p className="text-emerald-400 text-sm mt-2">↑ 12.5% vs last month</p>
        </div>

        <div className="glass rounded-2xl p-6">
          <p className="text-slate-400 text-sm mb-2">Active Subscribers</p>
          <p className="text-3xl font-bold">{metrics?.activeCount || 0}</p>
          <p className="text-emerald-400 text-sm mt-2">↑ 8 new this month</p>
        </div>

        <div className="glass rounded-2xl p-6">
          <p className="text-slate-400 text-sm mb-2">Churn Rate</p>
          <p className="text-3xl font-bold">2.4%</p>
          <p className="text-emerald-400 text-sm mt-2">↓ 0.5% improvement</p>
        </div>

        <div className="glass rounded-2xl p-6">
          <p className="text-slate-400 text-sm mb-2">Avg. Revenue/User</p>
          <p className="text-3xl font-bold">
            ${metrics?.activeCount ? ((metrics.mrr / 1000000) / metrics.activeCount).toFixed(2) : '0'}
          </p>
          <p className="text-slate-400 text-sm mt-2">Per subscriber</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold mb-6">Revenue Trend</h3>
          <div className="h-64 flex items-end gap-4">
            {revenueData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all hover:from-blue-500 hover:to-blue-300"
                  style={{ height: `${(d.value / maxRevenue) * 100}%` }}
                ></div>
                <span className="text-xs text-slate-400">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Subscriber Growth */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold mb-6">Subscriber Status</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Active</span>
                <span className="font-semibold">{metrics?.activeCount || 0}</span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${metrics?.totalSubscribers ? (metrics.activeCount / metrics.totalSubscribers) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Past Due</span>
                <span className="font-semibold">{metrics?.pastDueCount || 0}</span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${metrics?.totalSubscribers ? (metrics.pastDueCount / metrics.totalSubscribers) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Canceled</span>
                <span className="font-semibold">
                  {(metrics?.totalSubscribers || 0) - (metrics?.activeCount || 0) - (metrics?.pastDueCount || 0)}
                </span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-slate-600 rounded-full"
                  style={{ width: `${metrics?.totalSubscribers ? (((metrics.totalSubscribers - metrics.activeCount - metrics.pastDueCount) / metrics.totalSubscribers) * 100) : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Subscribers</span>
              <span className="font-semibold">{metrics?.totalSubscribers || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Plans Performance */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold mb-6">Plans Performance</h3>
        {plans.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No plans created yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-400 text-sm">
                  <th className="pb-4">Plan</th>
                  <th className="pb-4">Price (USDC)</th>
                  <th className="pb-4">Billing</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4 text-right">Subscribers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {plans.map(plan => (
                  <tr key={plan.id}>
                    <td className="py-4">
                      <p className="font-medium">{plan.name}</p>
                      <p className="text-slate-500 text-sm">{plan.slug}</p>
                    </td>
                    <td className="py-4">${(plan.priceUsdc / 1000000).toFixed(2)}</td>
                    <td className="py-4">
                      {plan.billingInterval === 2592000 ? 'Monthly' : 
                       plan.billingInterval === 604800 ? 'Weekly' : 
                       `${plan.billingInterval / 86400}d`}
                    </td>
                    <td className="py-4">
                      <span className={plan.status === 'active' ? 'badge-active' : 'badge-canceled'}>
                        {plan.status}
                      </span>
                    </td>
                    <td className="py-4 text-right font-medium">-</td>
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
