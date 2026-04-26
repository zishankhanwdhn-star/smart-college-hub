import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, BookOpen, LogIn, Shield } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.full_name?.split(' ')[0]}!`)
      navigate(user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.')
    } finally { setLoading(false) }
  }

  const demoLogin = async (role) => {
    const creds = role === 'admin'
      ? { email: 'admin@gpcwaidhan.ac.in', password: 'Admin@123' }
      : { email: 'student@gpcwaidhan.ac.in', password: 'Student@123' }
    setForm(creds)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-600 to-sky-500 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-800 font-display text-sm">GPC Waidhan · Resource Hub</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-sky-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-elevated">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold font-display text-slate-800 mb-1">Welcome Back</h1>
            <p className="text-sm text-slate-500">Sign in to access your resources</p>
          </div>

          {/* Demo login quick buttons */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            <button onClick={() => demoLogin('student')}
              className="text-xs px-3 py-2 rounded-xl bg-primary-50 border border-primary-200 text-primary-700 font-medium hover:bg-primary-100 transition-colors">
              👨‍🎓 Demo Student
            </button>
            <button onClick={() => demoLogin('admin')}
              className="text-xs px-3 py-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 font-medium hover:bg-purple-100 transition-colors flex items-center justify-center gap-1">
              <Shield className="w-3 h-3" /> Demo Admin
            </button>
          </div>

          <form onSubmit={handle} className="card space-y-4">
            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}
            <div>
              <label className="label">Email Address</label>
              <input
                type="email" required
                className="input-field"
                placeholder="your@email.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} required
                  className="input-field pr-10"
                  placeholder="Enter password"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:underline">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
