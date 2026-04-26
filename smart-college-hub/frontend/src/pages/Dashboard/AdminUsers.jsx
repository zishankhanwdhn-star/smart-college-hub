import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import AdminLayout from '../../components/Layout/AdminLayout'
import { PageLoader, EmptyState, formatDate, Modal } from '../../components/UI'
import toast from 'react-hot-toast'
import { Users, Search, UserCheck, UserX, Shield } from 'lucide-react'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('student')
  const [editUser, setEditUser] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    adminAPI.getUsers(roleFilter || null).then(r => setUsers(r.data)).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [roleFilter])

  const filtered = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.enrollment_no || '').includes(search)
  )

  const toggleActive = async (u) => {
    try {
      await adminAPI.updateUser(u.id, { is_active: !u.is_active })
      toast.success(u.is_active ? 'User deactivated' : 'User activated')
      load()
    } catch { toast.error('Failed') }
  }

  const saveEdit = async () => {
    setSaving(true)
    try {
      await adminAPI.updateUser(editUser.id, { full_name: editUser.full_name, branch: editUser.branch })
      toast.success('User updated'); setEditUser(null); load()
    } catch { toast.error('Failed') } finally { setSaving(false) }
  }

  return (
    <AdminLayout title="User Management">
      <div className="flex flex-wrap gap-3 items-center mb-6">
        <div className="flex gap-1.5">
          {['student', 'admin', ''].map(r => (
            <button key={r || 'all'} onClick={() => setRoleFilter(r)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all
                ${roleFilter === r ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {r || 'All'}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input-field pl-9 w-56" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? <PageLoader /> : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No users found" />
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Enrollment No.</th>
                  <th>Branch</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-sky-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {u.full_name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 text-sm">{u.full_name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-slate-600 text-sm">{u.enrollment_no || '—'}</td>
                    <td className="text-slate-600 text-sm">{u.branch || '—'}</td>
                    <td>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
                        ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-primary-100 text-primary-700'}`}>
                        {u.role === 'admin' && <Shield className="w-3 h-3" />}
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
                        ${u.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                        {u.is_active ? '● Active' : '○ Inactive'}
                      </span>
                    </td>
                    <td className="text-slate-500 text-sm">{formatDate(u.created_at)}</td>
                    <td>
                      <div className="flex gap-1.5">
                        <button onClick={() => setEditUser({ ...u })}
                          className="px-3 py-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-primary-50 hover:text-primary-600 text-xs font-medium transition-colors">
                          Edit
                        </button>
                        {u.role !== 'admin' && (
                          <button onClick={() => toggleActive(u)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                              ${u.is_active ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}>
                            {u.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit User">
        {editUser && (
          <div className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input-field" value={editUser.full_name}
                onChange={e => setEditUser(p => ({ ...p, full_name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Branch</label>
              <input className="input-field" value={editUser.branch || ''}
                onChange={e => setEditUser(p => ({ ...p, branch: e.target.value }))} />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEditUser(null)} className="btn-secondary text-sm">Cancel</button>
              <button onClick={saveEdit} disabled={saving} className="btn-primary text-sm">Save Changes</button>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  )
}
