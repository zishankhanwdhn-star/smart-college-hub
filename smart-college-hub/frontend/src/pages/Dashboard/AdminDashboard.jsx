import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminAPI } from '../../services/api'
import AdminLayout from '../../components/Layout/AdminLayout'
import { StatCard, StatusBadge, ContentTypeBadge, formatDate, formatSize, PageLoader, Modal } from '../../components/UI'
import toast from 'react-hot-toast'
import {
  Users, FileText, Clock, Download, Eye, BookMarked,
  CheckCircle2, XCircle, TrendingUp, Plus, AlertCircle
} from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [actioning, setActioning] = useState(null)

  const load = async () => {
    try {
      const [sr, pr] = await Promise.all([adminAPI.stats(), adminAPI.getPending()])
      setStats(sr.data); setPending(pr.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const approve = async (id) => {
    setActioning(id)
    try {
      await adminAPI.approve(id, { status: 'approved' })
      toast.success('Resource approved!')
      setPending(prev => prev.filter(p => p.id !== id))
      setStats(prev => prev ? { ...prev, pending_approvals: prev.pending_approvals - 1, total_resources: prev.total_resources + 1 } : prev)
    } catch { toast.error('Failed') } finally { setActioning(null) }
  }

  const reject = async () => {
    if (!rejectModal) return
    setActioning(rejectModal.id)
    try {
      await adminAPI.approve(rejectModal.id, { status: 'rejected', rejection_reason: rejectReason })
      toast.success('Resource rejected.')
      setPending(prev => prev.filter(p => p.id !== rejectModal.id))
      setStats(prev => prev ? { ...prev, pending_approvals: prev.pending_approvals - 1 } : prev)
      setRejectModal(null); setRejectReason('')
    } catch { toast.error('Failed') } finally { setActioning(null) }
  }

  if (loading) return <AdminLayout><PageLoader /></AdminLayout>

  return (
    <AdminLayout title="Admin Dashboard">

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard icon={Users}       label="Total Students"  value={stats?.total_users || 0}        color="primary" trend={stats?.new_users_today} />
        <StatCard icon={FileText}    label="Approved Files"  value={stats?.total_resources || 0}    color="emerald" />
        <StatCard icon={Clock}       label="Pending"         value={stats?.pending_approvals || 0}  color="amber" />
        <StatCard icon={Download}    label="Total Downloads" value={stats?.total_downloads || 0}    color="sky" />
        <StatCard icon={Eye}         label="Total Views"     value={stats?.total_views || 0}        color="purple" />
        <StatCard icon={BookMarked}  label="Uploaded Today"  value={stats?.resources_today || 0}   color="rose" trend={stats?.resources_today} />
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { to: '/admin/resources',  icon: BookMarked, label: 'Manage Resources', color: 'text-primary-600 bg-primary-50' },
          { to: '/admin/users',      icon: Users,      label: 'Manage Users',     color: 'text-purple-600 bg-purple-50' },
          { to: '/admin/analytics',  icon: TrendingUp, label: 'Analytics',        color: 'text-emerald-600 bg-emerald-50' },
          { to: '/admin/logs',       icon: Eye,        label: 'Access Logs',      color: 'text-sky-600 bg-sky-50' },
        ].map(item => (
          <Link key={item.to} to={item.to} className="card-hover flex items-center gap-3 text-sm font-semibold text-slate-700">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.color}`}>
              <item.icon className="w-4 h-4" />
            </div>
            {item.label}
          </Link>
        ))}
      </div>

      {/* Pending approvals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Pending Approvals
            {pending.length > 0 && (
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">{pending.length}</span>
            )}
          </h2>
          <Link to="/admin/resources" className="text-xs text-primary-600 hover:underline">View all →</Link>
        </div>

        {pending.length === 0 ? (
          <div className="card text-center py-12 text-slate-400">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <p className="font-medium text-slate-600">All caught up! No pending approvals.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map(r => (
              <div key={r.id} className="card hover:shadow-card-hover transition-all">
                <div className="flex items-start gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <p className="font-semibold text-slate-800">{r.title}</p>
                      <ContentTypeBadge type={r.content_type} />
                    </div>
                    {r.description && <p className="text-sm text-slate-500 mt-0.5">{r.description}</p>}
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-400">
                      <span>📄 {r.file_name}</span>
                      <span>📦 {formatSize(r.file_size)}</span>
                      <span>📅 {formatDate(r.created_at)}</span>
                      {r.uploader && <span>👤 {r.uploader.full_name} ({r.uploader.enrollment_no || r.uploader.email})</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => approve(r.id)}
                      disabled={actioning === r.id}
                      className="btn-success text-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => setRejectModal(r)}
                      disabled={actioning === r.id}
                      className="btn-danger text-xs"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject modal */}
      <Modal open={!!rejectModal} onClose={() => { setRejectModal(null); setRejectReason('') }} title="Reject Resource">
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Rejecting <strong>"{rejectModal?.title}"</strong>. The student will be notified.</span>
          </div>
          <div>
            <label className="label">Rejection Reason</label>
            <textarea
              rows={3} className="input-field resize-none"
              placeholder="e.g. Duplicate file, Low quality scan, Off-topic content..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => { setRejectModal(null); setRejectReason('') }} className="btn-secondary text-sm">Cancel</button>
            <button onClick={reject} disabled={actioning === rejectModal?.id} className="btn-danger text-sm">
              <XCircle className="w-4 h-4" /> Confirm Reject
            </button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  )
}
