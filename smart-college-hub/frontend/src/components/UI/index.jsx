import { Loader2, AlertCircle, CheckCircle2, Clock, XCircle, FileText, Image, HelpCircle } from 'lucide-react'

// ─── Loading Spinner ──────────────────────────────────────────────────────────
export function Spinner({ className = 'w-6 h-6' }) {
  return <Loader2 className={`animate-spin text-primary-500 ${className}`} />
}

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <Spinner className="w-8 h-8" />
      <p className="text-sm text-slate-500">Loading...</p>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export function SkeletonCard() {
  return (
    <div className="card space-y-3 animate-pulse">
      <div className="skeleton h-4 w-2/3" />
      <div className="skeleton h-3 w-full" />
      <div className="skeleton h-3 w-1/2" />
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon = FileText, title = 'Nothing here', description = '', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// ─── Alert ────────────────────────────────────────────────────────────────────
export function Alert({ type = 'info', message }) {
  const styles = {
    info:    'bg-blue-50 border-blue-200 text-blue-700',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    error:   'bg-red-50 border-red-200 text-red-700',
  }
  const icons = {
    info: HelpCircle, success: CheckCircle2, warning: AlertCircle, error: XCircle
  }
  const Icon = icons[type]
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm ${styles[type]}`}>
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    pending:  { cls: 'badge-pending',  icon: Clock,        label: 'Pending' },
    approved: { cls: 'badge-approved', icon: CheckCircle2, label: 'Approved' },
    rejected: { cls: 'badge-rejected', icon: XCircle,      label: 'Rejected' },
  }
  const { cls, icon: Icon, label } = map[status] || map.pending
  return <span className={cls}><Icon className="w-3 h-3" />{label}</span>
}

// ─── Content Type Badge ───────────────────────────────────────────────────────
export function ContentTypeBadge({ type }) {
  const map = {
    notes:               { cls: 'badge-notes',     label: 'Notes' },
    pyq:                 { cls: 'badge-pyq',       label: 'PYQ' },
    important_questions: { cls: 'badge-important', label: 'Imp. Questions' },
    syllabus:            { cls: 'badge-syllabus',  label: 'Syllabus' },
  }
  const { cls, label } = map[type] || { cls: 'badge-notes', label: type }
  return <span className={cls}>{label}</span>
}

// ─── File Icon ────────────────────────────────────────────────────────────────
export function FileIcon({ fileType, className = 'w-8 h-8' }) {
  const imageTypes = ['jpg','jpeg','png','gif','webp']
  if (imageTypes.includes(fileType?.toLowerCase())) {
    return <Image className={`text-emerald-500 ${className}`} />
  }
  return <FileText className={`text-primary-500 ${className}`} />
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
export function StatCard({ icon: Icon, label, value, color = 'primary', trend }) {
  const colors = {
    primary: 'bg-primary-50 text-primary-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber:   'bg-amber-50 text-amber-600',
    rose:    'bg-rose-50 text-rose-600',
    purple:  'bg-purple-50 text-purple-600',
    sky:     'bg-sky-50 text-sky-600',
  }
  return (
    <div className="stat-card">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 font-display">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
        {trend !== undefined && (
          <p className={`text-xs font-medium mt-0.5 ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend >= 0 ? '+' : ''}{trend} today
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className={`bg-white rounded-2xl shadow-elevated w-full ${maxWidth} animate-slide-up overflow-hidden`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 font-display">{title}</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────
export function Breadcrumb({ items }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-4 flex-wrap">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-slate-300">/</span>}
          {item.href
            ? <a href={item.href} className="hover:text-primary-600 transition-colors">{item.label}</a>
            : <span className={i === items.length - 1 ? 'text-slate-700 font-medium' : ''}>{item.label}</span>
          }
        </span>
      ))}
    </nav>
  )
}

// ─── Format helpers ───────────────────────────────────────────────────────────
export function formatSize(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function formatDate(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
