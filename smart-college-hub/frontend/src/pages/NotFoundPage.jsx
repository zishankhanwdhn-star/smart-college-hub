import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-primary-50 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
        <span className="text-5xl font-black font-display text-primary-300">404</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-800 font-display mb-2">Page Not Found</h1>
      <p className="text-slate-500 mb-8 max-w-xs">The page you're looking for doesn't exist or has been moved.</p>
      <div className="flex gap-3">
        <button onClick={() => window.history.back()} className="btn-secondary text-sm">
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
        <Link to="/" className="btn-primary text-sm">
          <Home className="w-4 h-4" /> Home
        </Link>
      </div>
    </div>
  )
}
