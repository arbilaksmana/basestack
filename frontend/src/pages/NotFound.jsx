import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto text-center py-20">
      <div className="text-8xl mb-6">🔍</div>
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <h2 className="text-xl text-slate-400 mb-8">Page Not Found</h2>
      <p className="text-slate-500 mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex justify-center gap-4">
        <Link to="/" className="btn-primary">
          Go Home
        </Link>
        <Link to="/dashboard" className="btn-secondary">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
