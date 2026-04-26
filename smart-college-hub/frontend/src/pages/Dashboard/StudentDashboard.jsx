import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { resourceAPI, notifAPI } from '../../services/api'
import Header from '../../components/Layout/Header'
import Footer from '../../components/Layout/Footer'
import { StatusBadge, ContentTypeBadge, formatDate, formatSize, EmptyState, PageLoader } from '../../components/UI'
import { Upload, FileText, Clock, CheckCircle2, XCircle, BookOpen, Bell, Download, User } from 'lucide-react'

const tabs = ['All', 'Pending', 'Approved', 'Rejected']

export default function StudentDashboard() {
  const { user } = useAuth()
  const [uploads, setUploads] = useState([])
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')

  useEffect(() => {
    Promise.all([resourceAPI.myUploads(), notifAPI.getAll()])
      .then(([ur, nr]) => { setUploads(ur.data); setNotifications(nr.data) })
      .finally(() => setLoading(false))
  }, [])

  const filtered = activeTab === 'All' ? uploads : uploads.filter(u => u.status === activeTab.toLowerCase())

  const stats = {
    total:    uploads.length,
    approved: uploads.filter(u => u.status === 'approved').length,
    pending:  uploads.filter(u => u.status === 'pending').length,
    rejected: uploads.filter(u => u.status === 'rejected').length,
  }

  if (loading) return <><Header /><PageLoader /></>

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Welcome */}
        <div className="card bg-gradient-to-br from-primary-600 to-sky-600 text-white mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">
                {user?.full_name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold font-display">Hello, {user?.full_name?.split(' ')[0]}! 👋</h1>
                <p className="text-blue-100 text-sm">{user?.branch || 'Student'} · {user?.enrollment_no || user?.email}</p>
              </div>
            </div>
            <Link to="/upload" className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-all text-sm">
              <Upload className="w-4 h-4" /> Upload Resource
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Uploads', value: stats.total, icon: FileText, color: 'bg-slate-100 text-slate-600' },
            { label: 'Approved',      value: stats.approved, icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-600' },
            { label: 'Pending',       value: stats.pending,  icon: Clock,        color: 'bg-amber-100 text-amber-600' },
            { label: 'Rejected',      value: stats.rejected, icon: XCircle,      color: 'bg-red-100 text-red-600' },
          ].map(s => (
            <div key={s.label} className="card flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800 font-display">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* My Uploads */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title">My Uploads</h2>
              <Link to="/upload" className="text-xs text-primary-600 hover:underline font-medium">+ New Upload</Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-1.5 mb-4 flex-wrap">
              {tabs.map(t => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all
                    ${activeTab === t ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  {t} {t !== 'All' && <span className="ml-1">({stats[t.toLowerCase()] ?? 0})</span>}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                icon={Upload}
                title="No uploads yet"
                description="Start contributing by uploading notes, PYQs, or syllabus."
                action={<Link to="/upload" className="btn-primary text-sm">Upload Now</Link>}
              />
            ) : (
              <div className="space-y-3">
                {filtered.map(r => (
                  <div key={r.id} className="card hover:shadow-card-hover transition-all">
                    <div className="flex items-start gap-3">
                      <FileText className="w-8 h-8 text-primary-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <p className="font-semibold text-slate-800 text-sm">{r.title}</p>
                          <StatusBadge status={r.status} />
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          <ContentTypeBadge type={r.content_type} />
                          <span className="text-xs text-slate-400">{formatSize(r.file_size)}</span>
                          <span className="text-xs text-slate-400">{formatDate(r.created_at)}</span>
                        </div>
                        {r.status === 'rejected' && r.rejection_reason && (
                          <p className="text-xs text-red-500 mt-1.5 flex items-start gap-1">
                            <XCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            {r.rejection_reason}
                          </p>
                        )}
                        {r.status === 'approved' && (
                          <div className="flex gap-3 mt-1.5 text-xs text-slate-400">
                            <span className="flex items-center gap-1"><Download className="w-3 h-3" />{r.download_count} downloads</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div>
            <h2 className="section-title mb-3 flex items-center gap-2"><Bell className="w-4 h-4" /> Notifications</h2>
            {notifications.length === 0 ? (
              <div className="card text-center py-8 text-slate-400 text-sm">No notifications yet</div>
            ) : (
              <div className="space-y-2">
                {notifications.slice(0, 8).map(n => (
                  <div key={n.id}
                    className={`px-4 py-3 rounded-xl border text-sm transition-all
                      ${!n.is_read ? 'bg-primary-50 border-primary-100' : 'bg-white border-slate-100'}`}>
                    <p className={`font-medium ${!n.is_read ? 'text-slate-800' : 'text-slate-600'}`}>{n.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{formatDate(n.created_at)}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Quick links */}
            <h2 className="section-title mb-3 mt-6">Quick Actions</h2>
            <div className="space-y-2">
              <Link to="/resources" className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-primary-50 hover:border-primary-200 transition-all">
                <BookOpen className="w-4 h-4 text-primary-500" /> Browse Resources
              </Link>
              <Link to="/upload" className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-primary-50 hover:border-primary-200 transition-all">
                <Upload className="w-4 h-4 text-emerald-500" /> Upload New File
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
