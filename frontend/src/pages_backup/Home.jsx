import { Link } from 'react-router-dom';

export default function Home() {
  const features = [
    {
      icon: '💳',
      title: 'Multi-Token Payments',
      description: 'Accept IDRX, USDC, and USDT on Base network with automatic conversion'
    },
    {
      icon: '🔄',
      title: 'Automated Billing',
      description: 'Keeper bot handles recurring charges automatically every billing cycle'
    },
    {
      icon: '📊',
      title: 'Real-time Analytics',
      description: 'Track MRR, subscriber growth, and revenue metrics in real-time'
    },
    {
      icon: '🔐',
      title: 'Wallet Authentication',
      description: 'Secure login with MetaMask signature verification'
    },
    {
      icon: '⚡',
      title: 'Instant Settlement',
      description: 'Receive payments directly to your wallet with no intermediaries'
    },
    {
      icon: '🌐',
      title: 'Global Access',
      description: 'Accept payments from anywhere in the world, 24/7'
    }
  ];

  const stats = [
    { value: '$2.5M+', label: 'Total Volume' },
    { value: '10K+', label: 'Subscriptions' },
    { value: '500+', label: 'Merchants' },
    { value: '99.9%', label: 'Uptime' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-transparent"></div>
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-6 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 rounded-full text-blue-400 text-sm mb-8">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
              Built on Base Network
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="gradient-text">Web3 Subscription</span>
              <br />
              Payment Gateway
            </h1>
            
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
              Accept recurring crypto payments with ease. Create subscription plans, 
              manage subscribers, and automate billing with smart contracts.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/dashboard" className="btn-primary text-lg">
                Launch Dashboard →
              </Link>
              <a href="#features" className="btn-secondary text-lg">
                Learn More
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto">
            {stats.map((stat, i) => (
              <div key={i} className="glass rounded-2xl p-6 text-center card-hover">
                <p className="text-3xl font-bold gradient-text">{stat.value}</p>
                <p className="text-slate-400 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need for <span className="gradient-text">Web3 subscriptions</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              A complete solution for merchants to accept recurring crypto payments
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="glass rounded-2xl p-8 card-hover">
                <div className="text-4xl mb-4 float">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-slate-900/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: '01', title: 'Create Plan', desc: 'Set up subscription plans with pricing in multiple tokens' },
              { step: '02', title: 'Share Link', desc: 'Share your checkout link with customers' },
              { step: '03', title: 'Get Paid', desc: 'Receive automatic recurring payments to your wallet' }
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-6xl font-bold text-slate-800 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-slate-400">{item.desc}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 right-0 w-1/2 h-0.5 bg-gradient-to-r from-blue-600 to-transparent"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="glass rounded-3xl p-12 text-center max-w-4xl mx-auto pulse-glow">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to accept crypto subscriptions?
            </h2>
            <p className="text-slate-400 mb-8">
              Connect your wallet and create your first plan in minutes
            </p>
            <Link to="/dashboard" className="btn-primary text-lg inline-block">
              Get Started Free →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800">
        <div className="container mx-auto px-6 text-center text-slate-500 text-sm">
          <p>© 2024 BaseStack. Built for Base Hackathon.</p>
        </div>
      </footer>
    </div>
  );
}
