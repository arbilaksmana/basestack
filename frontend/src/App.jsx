import { Routes, Route } from 'react-router-dom';
import { useWallet } from './hooks/useWallet';
import { useAuth } from './hooks/useAuth';
import { ToastProvider } from './components/Toast';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Plans from './pages/Plans';
import CreatePlan from './pages/CreatePlan';
import Analytics from './pages/Analytics';
import BillingHistory from './pages/BillingHistory';
import Settings from './pages/Settings';
import Checkout from './pages/Checkout';
import MySubscriptions from './pages/MySubscriptions';
import ConnectWallet from './pages/ConnectWallet';
import NotFound from './pages/NotFound';

// Layout
import Navbar from './components/Navbar';

// Protected Route wrapper
function ProtectedRoute({ children, auth, wallet, redirectTo }) {
  if (!auth.isAuthenticated) {
    return <ConnectWallet wallet={wallet} auth={auth} redirectTo={redirectTo} />;
  }
  return children;
}

export default function App() {
  const wallet = useWallet();
  const auth = useAuth();

  return (
    <ToastProvider>
      <div className="min-h-screen">
        <Navbar wallet={wallet} auth={auth} />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            
            {/* Protected Merchant Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute auth={auth} wallet={wallet} redirectTo="/dashboard">
                <Dashboard auth={auth} />
              </ProtectedRoute>
            } />
            <Route path="/plans" element={
              <ProtectedRoute auth={auth} wallet={wallet} redirectTo="/plans">
                <Plans auth={auth} />
              </ProtectedRoute>
            } />
            <Route path="/plans/create" element={
              <ProtectedRoute auth={auth} wallet={wallet} redirectTo="/plans/create">
                <CreatePlan auth={auth} />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute auth={auth} wallet={wallet} redirectTo="/analytics">
                <Analytics auth={auth} />
              </ProtectedRoute>
            } />
            <Route path="/billing" element={
              <ProtectedRoute auth={auth} wallet={wallet} redirectTo="/billing">
                <BillingHistory auth={auth} />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute auth={auth} wallet={wallet} redirectTo="/settings">
                <Settings auth={auth} wallet={wallet} />
              </ProtectedRoute>
            } />
            
            {/* Public Routes */}
            <Route path="/checkout/:slug" element={<Checkout wallet={wallet} />} />
            <Route path="/checkout" element={<CheckoutLanding />} />
            <Route path="/subscriptions" element={<MySubscriptions wallet={wallet} />} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </ToastProvider>
  );
}

// Checkout landing page when no slug provided
function CheckoutLanding() {
  return (
    <div className="max-w-md mx-auto text-center py-20">
      <div className="text-6xl mb-6">🛒</div>
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <p className="text-slate-400 mb-8">
        To subscribe to a plan, you need a valid checkout link from a merchant.
      </p>
      <p className="text-slate-500 text-sm">
        Example: <code className="bg-slate-800 px-2 py-1 rounded">/checkout/plan-slug</code>
      </p>
    </div>
  );
}
