import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import AdminLayout from '../../components/Layout/AdminLayout'
import { PageLoader, EmptyState, formatDateTime } from '../../components/UI'
import { FileSearch, Eye, Download } from 'lucide-react'

export default function AdminLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    adminAPI.accessLogs().then(r => setLogs(r.data)).finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? logs : logs.filter(l => l.action === filter)

  return (
    <AdminLayout title="Access Logs">
      <div className="flex gap-1.5 mb-6">
        {['all', 'view', 'download'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all
              ${filter === f ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {f}
          </button>
        ))}
        <span className="ml-auto text-sm text-slate-500 self-center">{filtered.length} entries</span>
      </div>

      {loading ? <PageLoader /> : filtered.length === 0 ? (
        <EmptyState icon={FileSearch} title="No access logs" />
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>User</th>
                  <th>File</th>
                  <th>IP Address</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.id}>
                    <td>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                        ${l.action === 'download' ? 'bg-sky-100 text-sky-700' : 'bg-purple-100 text-purple-700'}`}>
                        {l.action === 'download' ? <Download className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {l.action}
                      </span>
                    </td>
                    <td>
                      {l.user ? (
                        <div>
                          <p className="text-sm font-medium text-slate-800">{l.user.full_name}</p>
                          <p className="text-xs text-slate-400">{l.user.email}</p>
                        </div>
                      ) : <span className="text-slate-400 text-sm">Anonymous</span>}
                    </td>
                    <td>
                      {l.resource ? (
                        <div>
                          <p className="text-sm text-slate-800">{l.resource.title}</p>
                          <p className="text-xs text-slate-400">{l.resource.file_name}</p>
                        </div>
                      ) : <span className="text-slate-400 text-sm">ID #{l.resource_id}</span>}
                    </td>
                    <td className="text-slate-500 text-sm font-mono">{l.ip_address || '—'}</td>
                    <td className="text-slate-500 text-sm">{formatDateTime(l.accessed_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
