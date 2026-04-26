import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import AdminLayout from '../../components/Layout/AdminLayout'
import { StatusBadge, ContentTypeBadge, formatDate, formatSize, PageLoader, EmptyState, Modal } from '../../components/UI'
import toast from 'react-hot-toast'
import { FileText, CheckCircle2, XCircle, Trash2, Search, AlertCircle } from 'lucide-react'

const STATUS_TABS = ['all', 'pending', 'approved', 'rejected']

export default function AdminResources() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeStatus, setActiveStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [actioning, setActioning] = useState(null)

  const load = async (status) => {
    setLoading(true)
    try {
      const r = await adminAPI.allResources(status === 'all' ? null : status)
      setResources(r.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load(activeStatus) }, [activeStatus])

  const filtered = resources.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.file_name.toLowerCase().includes(search.toLowerCase()) ||
    r.uploader?.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  const approve = async (id) => {
    setActioning(id)
    try {
      await adminAPI.approve(id, { status: 'approved' })
      toast.success('Approved!'); load(activeStatus)
    } catch { toast.error('Failed') } finally { setActioning(null) }
  }

  const reject = async () => {
    setActioning(rejectModal.id)
    try {
      await adminAPI.approve(rejectModal.id, { status: 'rejected', rejection_reason: rejectReason })
      toast.success('Rejected.'); setRejectModal(null); setRejectReason(''); load(activeStatus)
    } catch { toast.error('Failed') } finally { setActioning(null) }
  }

  const deleteRes = async (id) => {
    if (!confirm('Delete this resource permanently?')) return
    try { await adminAPI.deleteResource(id); toast.success('Deleted'); load(activeStatus) }
    catch { toast.error('Failed to delete') }
  }

  return (
    <AdminLayout title="Manage Resources">
      {/* Tabs + search */}
      <div className="flex flex-wrap gap-3 items-center mb-6">
        <div className="flex gap-1.5">
          {STATUS_TABS.map(s => (
            <button key={s} onClick={() => setActiveStatus(s)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all
                ${activeStatus === s ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {s}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input-field pl-9 w-56" placeholder="Search resources..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? <PageLoader /> : filtered.length === 0 ? (
        <EmptyState icon={FileText} title="No resources found" />
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Uploader</th>
                  <th>Size</th>
                  <th>Date</th>
                  <th>Stats</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    <td>
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{r.title}</p>
                        <p className="text-xs text-slate-400">{r.file_name}</p>
                      </div>
                    </td>
                    <td><ContentTypeBadge type={r.content_type} /></td>
                    <td>
                      <div>
                        <p className="text-sm text-slate-700">{r.uploader?.full_name || '—'}</p>
                        <p className="text-xs text-slate-400">{r.uploader?.enrollment_no || ''}</p>
                      </div>
                    </td>
                    <td className="text-slate-500 text-sm">{formatSize(r.file_size)}</td>
                    <td className="text-slate-500 text-sm">{formatDate(r.created_at)}</td>
                    <td className="text-slate-500 text-xs">
                      👁 {r.view_count} · ⬇ {r.download_count}
                    </td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        {r.status === 'pending' && (
                          <>
                            <button onClick={() => approve(r.id)} disabled={actioning === r.id}
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors" title="Approve">
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => setRejectModal(r)}
                              className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors" title="Reject">
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button onClick={() => deleteRes(r.id)}
                          className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={!!rejectModal} onClose={() => { setRejectModal(null); setRejectReason('') }} title="Reject Resource">
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            Rejecting <strong>"{rejectModal?.title}"</strong>
          </div>
          <div>
            <label className="label">Rejection Reason</label>
            <textarea rows={3} className="input-field resize-none" placeholder="Reason for rejection..."
              value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => { setRejectModal(null); setRejectReason('') }} className="btn-secondary text-sm">Cancel</button>
            <button onClick={reject} className="btn-danger text-sm"><XCircle className="w-4 h-4" /> Reject</button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  )
}
