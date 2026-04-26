import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { academicAPI } from '../services/api'
import toast from 'react-hot-toast'
import { BookOpen, UserPlus, Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    full_name: '', email: '', enrollment_no: '', password: '', branch: '', semester: ''
  })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [branches, setBranches] = useState([])

  useEffect(() => {
    academicAPI.getBranches().then(r => setBranches(r.data)).catch(() => {})
  }, [])

  const f = (k) => e => setForm(p => ({ ...p, [k]: e.target.value }))

  const handle = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const payload = {
        ...form,
        semester: form.semester ? parseInt(form.semester) : null
      }
      await register(payload)
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-600 to-sky-500 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-800 font-display text-sm">GPC Waidhan · Resource Hub</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-elevated">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold font-display text-slate-800 mb-1">Create Account</h1>
            <p className="text-sm text-slate-500">Join the GPC Waidhan Resource Portal</p>
          </div>

          <form onSubmit={handle} className="card space-y-4">
            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label">Full Name *</label>
                <input type="text" required className="input-field" placeholder="Your full name" value={form.full_name} onChange={f('full_name')} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Email Address *</label>
                <input type="email" required className="input-field" placeholder="your@email.com" value={form.email} onChange={f('email')} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Enrollment Number</label>
                <input type="text" className="input-field" placeholder="e.g. 0901CS21001 (optional)" value={form.enrollment_no} onChange={f('enrollment_no')} />
              </div>
              <div>
                <label className="label">Branch</label>
                <select className="select-field" value={form.branch} onChange={f('branch')}>
                  <option value="">Select Branch</option>
                  {branches.map(b => <option key={b.id} value={b.name}>{b.code} — {b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Current Semester</label>
                <select className="select-field" value={form.semester} onChange={f('semester')}>
                  <option value="">Select Sem</option>
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>Semester {n}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="label">Password *</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'} required minLength={6}
                    className="input-field pr-10"
                    placeholder="Minimum 6 characters"
                    value={form.password} onChange={f('password')}
                  />
                  <button type="button" onClick={() => setShowPw(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
