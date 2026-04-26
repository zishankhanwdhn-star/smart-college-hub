import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { academicAPI, resourceAPI } from '../../services/api'
import Header from '../../components/Layout/Header'
import Footer from '../../components/Layout/Footer'
import { Alert } from '../../components/UI'
import toast from 'react-hot-toast'
import { Upload, File, X, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react'

const CONTENT_TYPES = [
  { value: 'notes',               label: '📝 Notes' },
  { value: 'pyq',                 label: '📋 Previous Year Questions' },
  { value: 'important_questions', label: '⭐ Important Questions' },
  { value: 'syllabus',            label: '📚 Syllabus' },
]

export default function UploadPage() {
  const [searchParams] = useSearchParams()
  const [branches, setBranches] = useState([])
  const [semesters, setSemesters] = useState([])
  const [subjects, setSubjects] = useState([])
  const [units, setUnits] = useState([])
  const [selBranch, setSelBranch] = useState('')
  const [selSem, setSelSem] = useState('')
  const [selSubject, setSelSubject] = useState('')
  const [selUnit, setSelUnit] = useState(searchParams.get('unit') || '')
  const [form, setForm] = useState({ title: '', description: '', content_type: 'notes' })
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => { academicAPI.getBranches().then(r => setBranches(r.data)) }, [])
  useEffect(() => {
    if (selBranch) academicAPI.getSemesters(selBranch).then(r => setSemesters(r.data))
    else setSemesters([])
    setSelSem(''); setSubjects([]); setSelSubject(''); setUnits([]); setSelUnit('')
  }, [selBranch])
  useEffect(() => {
    if (selSem) academicAPI.getSubjects(selSem).then(r => setSubjects(r.data))
    else setSubjects([])
    setSelSubject(''); setUnits([]); setSelUnit('')
  }, [selSem])
  useEffect(() => {
    if (selSubject) academicAPI.getUnits(selSubject).then(r => setUnits(r.data))
    else setUnits([])
    if (!searchParams.get('unit')) setSelUnit('')
  }, [selSubject])

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) { toast.error('File not allowed. Use PDF, JPG, PNG, DOC, DOCX only.'); return }
    if (accepted.length > 0) { setFile(accepted[0]) }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.jpg','.jpeg','.png'], 'application/msword': ['.doc'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) { toast.error('Please select a file'); return }
    if (!selUnit) { toast.error('Please select a unit'); return }

    const fd = new FormData()
    fd.append('title', form.title)
    fd.append('description', form.description)
    fd.append('unit_id', selUnit)
    fd.append('content_type', form.content_type)
    fd.append('file', file)

    setLoading(true)
    try {
      await resourceAPI.upload(fd)
      setSuccess(true)
      toast.success('Upload submitted! Waiting for admin approval.')
      setFile(null)
      setForm({ title: '', description: '', content_type: 'notes' })
    } catch (err) {
      const msg = err.response?.data?.detail || 'Upload failed'
      toast.error(msg)
    } finally { setLoading(false) }
  }

  const fmtSize = (bytes) => bytes < 1024*1024 ? `${(bytes/1024).toFixed(0)} KB` : `${(bytes/(1024*1024)).toFixed(1)} MB`

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        <div className="mb-6">
          <h1 className="page-title flex items-center gap-2"><Upload className="w-7 h-7 text-primary-600" /> Upload Resource</h1>
          <p className="text-slate-500 text-sm mt-1">Share your notes and help fellow students. All uploads need admin approval.</p>
        </div>

        {success && (
          <Alert type="success" message="Your file has been submitted successfully! It will be visible after admin approval." />
        )}

        <form onSubmit={handleSubmit} className="card space-y-5 mt-4">

          {/* Branch → Sem → Subject → Unit */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 font-display">📍 Select Location</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Branch *</label>
                <select className="select-field" value={selBranch} onChange={e => setSelBranch(e.target.value)} required>
                  <option value="">Select Branch</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.code} — {b.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Semester *</label>
                <select className="select-field" value={selSem} onChange={e => setSelSem(e.target.value)} required disabled={!selBranch}>
                  <option value="">Select Semester</option>
                  {semesters.map(s => <option key={s.id} value={s.id}>Semester {s.number}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Subject *</label>
                <select className="select-field" value={selSubject} onChange={e => setSelSubject(e.target.value)} required disabled={!selSem}>
                  <option value="">Select Subject</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Unit *</label>
                <select className="select-field" value={selUnit} onChange={e => setSelUnit(e.target.value)} required disabled={!selSubject && !searchParams.get('unit')}>
                  <option value="">Select Unit</option>
                  {units.map(u => <option key={u.id} value={u.id}>Unit {u.number}: {u.title}</option>)}
                </select>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Resource details */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 font-display">📄 Resource Details</h3>
            <div className="space-y-3">
              <div>
                <label className="label">Title *</label>
                <input type="text" required className="input-field" placeholder="e.g. Unit 3 - Complete Notes by Rohan"
                  value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea rows={2} className="input-field resize-none" placeholder="Brief description (optional)"
                  value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div>
                <label className="label">Content Type *</label>
                <select className="select-field" value={form.content_type}
                  onChange={e => setForm(p => ({ ...p, content_type: e.target.value }))}>
                  {CONTENT_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Dropzone */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3 font-display">📎 Upload File</h3>
            {!file ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
                  ${isDragActive ? 'border-primary-400 bg-primary-50' : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'}`}
              >
                <input {...getInputProps()} />
                <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6 text-primary-500" />
                </div>
                <p className="text-sm font-medium text-slate-700 mb-1">
                  {isDragActive ? 'Drop file here' : 'Drag & drop or click to browse'}
                </p>
                <p className="text-xs text-slate-400">PDF, JPG, PNG, DOC, DOCX · Max 10MB</p>
              </div>
            ) : (
              <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <File className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
                  <p className="text-xs text-slate-500">{fmtSize(file.size)}</p>
                </div>
                <button type="button" onClick={() => setFile(null)} className="p-1.5 rounded-lg hover:bg-red-100 text-slate-400 hover:text-red-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Your upload will be reviewed by an admin before it becomes visible to other students. You'll receive a notification once it's approved or rejected.</span>
          </div>

          <button type="submit" disabled={loading || !file} className="btn-primary w-full justify-center">
            {loading ? 'Uploading...' : <><Upload className="w-4 h-4" /> Submit for Approval</>}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link to="/dashboard" className="text-sm text-primary-600 hover:underline">View my uploaded files →</Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
