import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import Header from '../components/Layout/Header'
import toast from 'react-hot-toast'
import { User, Save, BookOpen, Mail, Hash } from 'lucide-react'

const BRANCHES = [
  'Computer Science Engineering', 'Mechanical Engineering',
  'Electrical Engineering', 'Civil Engineering',
  'Electronics & Communication', 'Information Technology'
]

export default function ProfilePage() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    branch: user?.branch || '',
    semester: user?.semester || '',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await authAPI.updateMe({ ...form, semester: form.semester ? parseInt(form.semester) : null })
      toast.success('Profile updated!')
    } catch { toast.error('Update failed') }
    finally { setSaving(false) }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="page-title mb-6 flex items-center gap-2">
          <User className="w-6 h-6 text-primary-600" /> My Profile
        </h1>

        <div className="card mb-4 flex items-center gap-4 bg-gradient-to-br from-primary-50 to-sky-50 border-primary-100">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-sky-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {user?.full_name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-slate-800 font-display text-lg">{user?.full_name}</p>
            <p className="text-sm text-slate-500 flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{user?.email}</p>
            {user?.enrollment_no && <p className="text-sm text-slate-500 flex items-center gap-1"><Hash className="w-3.5 h-3.5" />{user?.enrollment_no}</p>}
            <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold
              ${user?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-primary-100 text-primary-700'}`}>
              {user?.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="card space-y-4">
          <h3 className="section-title">Edit Details</h3>
          <div>
            <label className="label">Full Name</label>
            <input className="input-field" value={form.full_name}
              onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Branch</label>
            <select className="select-field" value={form.branch}
              onChange={e => setForm(p => ({ ...p, branch: e.target.value }))}>
              <option value="">Select Branch</option>
              {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Current Semester</label>
            <select className="select-field" value={form.semester}
              onChange={e => setForm(p => ({ ...p, semester: e.target.value }))}>
              <option value="">Select Semester</option>
              {[1,2,3,4,5,6].map(n => <option key={n} value={n}>Semester {n}</option>)}
            </select>
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full justify-center">
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
