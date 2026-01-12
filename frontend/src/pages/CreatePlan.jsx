import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPlan, getPrices } from '../api';

export default function CreatePlan({ auth }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);
  const [rates, setRates] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    billingInterval: 30,
    priceUsd: '',
  });

  const intervals = [
    { value: 7, label: 'Weekly', desc: 'Billed every 7 days' },
    { value: 30, label: 'Monthly', desc: 'Billed every 30 days' },
    { value: 90, label: 'Quarterly', desc: 'Billed every 3 months' },
    { value: 365, label: 'Yearly', desc: 'Billed every year' }
  ];

  // Fetch exchange rates
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const data = await getPrices();
        setRates(data);
      } catch (err) {
        console.error('Failed to fetch rates:', err);
        // Use fallback rate
        setRates({ USD_TO_IDR: 16000 });
      }
    };
    fetchRates();
    // Refresh rates every 60 seconds
    const interval = setInterval(fetchRates, 60000);
    return () => clearInterval(interval);
  }, []);

  // Calculate IDRX from USD
  const calculateIdrx = (usd) => {
    if (!usd || !rates) return 0;
    return Math.round(parseFloat(usd) * rates.USD_TO_IDR);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!form.name.trim()) {
        throw new Error('Plan name is required');
      }
      if (!form.priceUsd || parseFloat(form.priceUsd) <= 0) {
        throw new Error('Price must be greater than 0');
      }

      const priceUsd = parseFloat(form.priceUsd);
      const priceIdrx = calculateIdrx(priceUsd);

      await createPlan({
        name: form.name.trim(),
        description: form.description.trim(),
        billingInterval: form.billingInterval * 86400,
        priceIdrx: priceIdrx,
        priceUsdc: Math.round(priceUsd * 1000000),
        priceUsdt: Math.round(priceUsd * 1000000)
      }, auth.token);

      navigate('/plans');
    } catch (err) {
      setError(err.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return form.name.trim() !== '';
    if (step === 2) return true;
    if (step === 3) return form.priceUsd && parseFloat(form.priceUsd) > 0;
    return false;
  };

  const clearError = () => {
    if (error) setError(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link to="/plans" className="text-slate-400 hover:text-white text-sm mb-4 inline-block">
          ← Back to Plans
        </Link>
        <h1 className="text-3xl font-bold">Create New Plan</h1>
        <p className="text-slate-400 mt-1">Set up a subscription plan for your customers</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-xl">❌</span>
            <div>
              <p className="font-medium text-red-400">Error Creating Plan</p>
              <p className="text-sm text-slate-400 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress */}
      <div className="flex items-center gap-4 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
              step >= s ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'
            }`}>
              {s}
            </div>
            <span className={`text-sm ${step >= s ? 'text-white' : 'text-slate-500'}`}>
              {s === 1 ? 'Details' : s === 2 ? 'Billing' : 'Pricing'}
            </span>
            {s < 3 && <div className={`flex-1 h-0.5 ${step > s ? 'bg-blue-600' : 'bg-slate-800'}`}></div>}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="glass rounded-2xl p-8">
          {/* Step 1: Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Plan Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => { setForm({ ...form, name: e.target.value }); clearError(); }}
                  className="input"
                  placeholder="e.g., Pro Plan, Premium, Enterprise"
                  autoFocus
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => { setForm({ ...form, description: e.target.value }); clearError(); }}
                  className="input min-h-[120px]"
                  placeholder="Describe what's included in this plan..."
                  maxLength={500}
                />
              </div>
            </div>
          )}

          {/* Step 2: Billing */}
          {step === 2 && (
            <div>
              <label className="block text-sm text-slate-400 mb-4">Billing Interval</label>
              <div className="grid grid-cols-2 gap-4">
                {intervals.map(int => (
                  <button
                    key={int.value}
                    type="button"
                    onClick={() => { setForm({ ...form, billingInterval: int.value }); clearError(); }}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      form.billingInterval === int.value
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <p className="font-semibold">{int.label}</p>
                    <p className="text-sm text-slate-400">{int.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Pricing - Single USD input with auto-convert */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 text-blue-400 text-sm">
                  <span>💡</span>
                  <span>Set price in USD - we'll auto-convert to all supported tokens</span>
                </div>
              </div>

              <div className="flex items-center gap-4 p-6 bg-slate-900/50 rounded-xl">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center text-2xl">
                  💵
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-slate-400 mb-2">Price (USD) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={form.priceUsd}
                      onChange={e => { setForm({ ...form, priceUsd: e.target.value }); clearError(); }}
                      className="input pl-8"
                      placeholder="10.00"
                      min="0.01"
                      autoFocus
                    />
                  </div>
                </div>
              </div>

              {/* Auto-converted prices */}
              {form.priceUsd && parseFloat(form.priceUsd) > 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-slate-400">Converted prices:</p>
                  
                  <div className="grid gap-3">
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">💵</span>
                        <span>USDC</span>
                      </div>
                      <span className="font-mono">${parseFloat(form.priceUsd).toFixed(2)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">💲</span>
                        <span>USDT</span>
                      </div>
                      <span className="font-mono">${parseFloat(form.priceUsd).toFixed(2)}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🇮🇩</span>
                        <span>IDRX</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono">{calculateIdrx(form.priceUsd).toLocaleString()}</span>
                        {rates && (
                          <p className="text-xs text-slate-500">
                            Rate: 1 USD = {rates.USD_TO_IDR?.toLocaleString()} IDR
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-slate-800">
            {step > 1 ? (
              <button type="button" onClick={() => setStep(step - 1)} className="btn-secondary" disabled={loading}>
                ← Back
              </button>
            ) : <div></div>}

            {step < 3 ? (
              <button type="button" onClick={() => setStep(step + 1)} disabled={!canProceed()} className="btn-primary">
                Continue →
              </button>
            ) : (
              <button type="submit" disabled={loading || !canProceed()} className="btn-primary min-w-[140px]">
                {loading ? 'Creating...' : 'Create Plan'}
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Preview */}
      {step === 3 && form.name && form.priceUsd && (
        <div className="mt-6 glass rounded-2xl p-6">
          <h3 className="text-sm text-slate-400 mb-4">Preview</h3>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold text-lg">{form.name}</p>
              <p className="text-slate-400 text-sm">
                {intervals.find(i => i.value === form.billingInterval)?.label} billing
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">${parseFloat(form.priceUsd).toFixed(2)}</p>
              <p className="text-slate-400 text-sm">per {intervals.find(i => i.value === form.billingInterval)?.label.toLowerCase()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
