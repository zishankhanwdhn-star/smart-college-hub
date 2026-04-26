import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { academicAPI, resourceAPI } from '../../services/api'
import Header from '../../components/Layout/Header'
import Footer from '../../components/Layout/Footer'
import { PageLoader, EmptyState, ContentTypeBadge, FileIcon, formatSize, formatDate, Modal } from '../../components/UI'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { FileText, Download, Eye, ArrowLeft, Upload, StickyNote, HelpCircle, Star, BookMarked } from 'lucide-react'

const CONTENT_TABS = [
  { key: null,                   label: 'All',          icon: FileText },
  { key: 'notes',                label: 'Notes',        icon: StickyNote },
  { key: 'pyq',                  label: 'PYQ',          icon: HelpCircle },
  { key: 'important_questions',  label: 'Imp. Q',       icon: Star },
  { key: 'syllabus',             label: 'Syllabus',     icon: BookMarked },
]

export default function UnitPage() {
  const { unitId } = useParams()
  const [unit, setUnit] = useState(null)
  const [resources, setResources] = useState([])
  const [activeTab, setActiveTab] = useState(null)
  const [loading, setLoading] = useState(true)
  const [previewRes, setPreviewRes] = useState(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  const fetchResources = async (ct) => {
    setLoading(true)
    try {
      const r = await resourceAPI.getByUnit(unitId, ct)
      setResources(r.data)
    } finally { setLoading(false) }
  }

  useEffect(() => {
    academicAPI.getUnit(unitId).then(r => setUnit(r.data))
    fetchResources(null)
  }, [unitId])

  const handleTabChange = (key) => { setActiveTab(key); fetchResources(key) }

  const handleDownload = (res) => {
    resourceAPI.logView(res.id).catch(() => {})
    const url = resourceAPI.downloadUrl(res.id)
    const link = document.createElement('a')
    link.href = url; link.download = res.file_name; link.click()
    toast.success('Download started!')
  }

  const handleView = (res) => {
    resourceAPI.logView(res.id).catch(() => {})
    setPreviewRes(res)
  }

  const filtered = resources
  const fileUrl = (res) => `/files/${res.file_path?.split('/').pop()}`

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 mb-5 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {unit && (
          <div className="card mb-6 border-l-4 border-primary-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center font-bold text-primary-700 font-display text-lg">
                {unit.number}
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Unit {unit.number}</p>
                <h1 className="text-lg font-bold text-slate-800 font-display">{unit.title}</h1>
              </div>
            </div>
          </div>
        )}

        {/* Tab bar */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {CONTENT_TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key ?? 'all'}
              onClick={() => handleTabChange(key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all
                ${activeTab === key
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-primary-50 hover:border-primary-200'}`}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}

          {user && (
            <Link to={`/upload?unit=${unitId}`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-all ml-auto">
              <Upload className="w-3.5 h-3.5" /> Upload Here
            </Link>
          )}
        </div>

        {/* Resources */}
        {loading ? <PageLoader /> : filtered.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No resources here yet"
            description="Be the first to upload study materials for this unit!"
            action={user ? <Link to={`/upload?unit=${unitId}`} className="btn-primary">Upload Now</Link> : <Link to="/login" className="btn-primary">Login to Upload</Link>}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map(res => (
              <div key={res.id} className="card hover:shadow-card-hover transition-all">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <FileIcon fileType={res.file_type} className="w-9 h-9" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-semibold text-slate-800 text-sm leading-tight">{res.title}</p>
                        {res.description && <p className="text-xs text-slate-500 mt-0.5">{res.description}</p>}
                      </div>
                      <ContentTypeBadge type={res.content_type} />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-2.5">
                      <span className="text-xs text-slate-400">{res.file_name}</span>
                      <span className="text-xs text-slate-400">{formatSize(res.file_size)}</span>
                      <span className="text-xs text-slate-400">{formatDate(res.created_at)}</span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Eye className="w-3 h-3" /> {res.view_count}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <Download className="w-3 h-3" /> {res.download_count}
                      </span>
                    </div>
                    {res.uploader && (
                      <p className="text-xs text-slate-400 mt-1">Uploaded by {res.uploader.full_name}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {res.file_type === 'pdf' && (
                      <button onClick={() => handleView(res)} className="btn-secondary text-xs px-3 py-1.5 gap-1">
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                    )}
                    <button onClick={() => handleDownload(res)} className="btn-primary text-xs px-3 py-1.5 gap-1">
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PDF Preview Modal */}
      <Modal
        open={!!previewRes}
        onClose={() => setPreviewRes(null)}
        title={previewRes?.title}
        maxWidth="max-w-4xl"
      >
        {previewRes && (
          <div className="space-y-3">
            <iframe
              src={`/files/${previewRes.file_path?.split('/').pop()}`}
              className="w-full h-[60vh] rounded-xl border border-slate-200"
              title={previewRes.title}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setPreviewRes(null)} className="btn-secondary text-sm">Close</button>
              <button onClick={() => handleDownload(previewRes)} className="btn-primary text-sm">
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          </div>
        )}
      </Modal>
      <Footer />
    </div>
  )
}
