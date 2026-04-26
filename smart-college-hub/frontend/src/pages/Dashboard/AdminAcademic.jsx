import { useState, useEffect } from 'react'
import { academicAPI, adminAcademicAPI } from '../../services/api'
import AdminLayout from '../../components/Layout/AdminLayout'
import { PageLoader, EmptyState, Modal } from '../../components/UI'
import toast from 'react-hot-toast'
import { Plus, BookOpen, ChevronRight, Edit2, GraduationCap } from 'lucide-react'

export default function AdminAcademic() {
  const [branches, setBranches] = useState([])
  const [selBranch, setSelBranch] = useState(null)
  const [semesters, setSemesters] = useState([])
  const [selSem, setSelSem] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [selSubject, setSelSubject] = useState(null)
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)

  // Modals
  const [addSubjectModal, setAddSubjectModal] = useState(false)
  const [addUnitModal, setAddUnitModal] = useState(false)
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '' })
  const [unitForm, setUnitForm] = useState({ title: '', description: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    academicAPI.getBranches().then(r => setBranches(r.data)).finally(() => setLoading(false))
  }, [])

  const loadSemesters = async (branch) => {
    setSelBranch(branch); setSelSem(null); setSubjects([]); setSelSubject(null); setUnits([])
    const r = await academicAPI.getSemesters(branch.id)
    setSemesters(r.data)
  }

  const loadSubjects = async (sem) => {
    setSelSem(sem); setSelSubject(null); setUnits([])
    const r = await academicAPI.getSubjects(sem.id)
    setSubjects(r.data)
  }

  const loadUnits = async (subj) => {
    setSelSubject(subj)
    const r = await academicAPI.getUnits(subj.id)
    setUnits(r.data)
  }

  const addSubject = async () => {
    if (!selSem || !subjectForm.name) return
    setSaving(true)
    try {
      await adminAcademicAPI.createSubject({ ...subjectForm, semester_id: selSem.id })
      toast.success('Subject added!')
      setAddSubjectModal(false)
      setSubjectForm({ name: '', code: '' })
      const r = await academicAPI.getSubjects(selSem.id)
      setSubjects(r.data)
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed') }
    finally { setSaving(false) }
  }

  const addUnit = async () => {
    if (!selSubject || !unitForm.title) return
    setSaving(true)
    try {
      await adminAcademicAPI.createUnit({ ...unitForm, subject_id: selSubject.id, number: units.length + 1 })
      toast.success('Unit added!')
      setAddUnitModal(false)
      setUnitForm({ title: '', description: '' })
      const r = await academicAPI.getUnits(selSubject.id)
      setUnits(r.data)
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed') }
    finally { setSaving(false) }
  }

  if (loading) return <AdminLayout title="Academic Management"><PageLoader /></AdminLayout>

  return (
    <AdminLayout title="Academic Management">
      <p className="text-slate-500 text-sm mb-6">Manage branches, semesters, subjects, and units.</p>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

        {/* Branches */}
        <div>
          <h3 className="section-title mb-3">Branches</h3>
          <div className="space-y-1.5">
            {branches.map(b => (
              <button key={b.id} onClick={() => loadSemesters(b)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm border-2 text-left transition-all
                  ${selBranch?.id === b.id ? 'border-primary-500 bg-primary-50' : 'border-slate-200 bg-white hover:border-primary-200'}`}>
                <GraduationCap className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <span className="flex-1 font-medium text-slate-800 text-xs">{b.code}</span>
                {selBranch?.id === b.id && <ChevronRight className="w-3.5 h-3.5 text-primary-500" />}
              </button>
            ))}
          </div>
        </div>

        {/* Semesters */}
        <div>
          <h3 className="section-title mb-3">Semesters</h3>
          {!selBranch ? <p className="text-slate-400 text-sm">← Select branch</p> : (
            <div className="grid grid-cols-3 gap-1.5">
              {semesters.map(s => (
                <button key={s.id} onClick={() => loadSubjects(s)}
                  className={`py-3 rounded-xl border-2 text-sm font-bold transition-all
                    ${selSem?.id === s.id ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 bg-white text-slate-700 hover:border-primary-200'}`}>
                  {s.number}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Subjects */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="section-title">Subjects</h3>
            {selSem && (
              <button onClick={() => setAddSubjectModal(true)} className="btn-primary text-xs px-3 py-1.5">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            )}
          </div>
          {!selSem ? <p className="text-slate-400 text-sm">← Select semester</p> : subjects.length === 0 ? (
            <p className="text-slate-400 text-sm">No subjects yet</p>
          ) : (
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {subjects.map(s => (
                <button key={s.id} onClick={() => loadUnits(s)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm border text-left transition-all
                    ${selSubject?.id === s.id ? 'border-primary-500 bg-primary-50' : 'border-slate-200 bg-white hover:border-primary-200'}`}>
                  <BookOpen className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                  <span className="flex-1 font-medium text-slate-800 text-xs truncate">{s.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Units */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="section-title">Units</h3>
            {selSubject && (
              <button onClick={() => setAddUnitModal(true)} className="btn-primary text-xs px-3 py-1.5">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            )}
          </div>
          {!selSubject ? <p className="text-slate-400 text-sm">← Select subject</p> : units.length === 0 ? (
            <p className="text-slate-400 text-sm">No units yet</p>
          ) : (
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {units.map(u => (
                <div key={u.id} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs">
                  <span className="w-5 h-5 rounded-lg bg-primary-100 text-primary-700 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">{u.number}</span>
                  <span className="flex-1 text-slate-700 font-medium truncate">{u.title}</span>
                  <span className="text-slate-400">{u.resource_count ?? 0}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Subject Modal */}
      <Modal open={addSubjectModal} onClose={() => setAddSubjectModal(false)} title="Add New Subject">
        <div className="space-y-4">
          <div>
            <label className="label">Subject Name *</label>
            <input className="input-field" placeholder="e.g. Data Structures" value={subjectForm.name}
              onChange={e => setSubjectForm(p => ({ ...p, name: e.target.value }))} />
          </div>
          <div>
            <label className="label">Subject Code</label>
            <input className="input-field" placeholder="e.g. CS-201" value={subjectForm.code}
              onChange={e => setSubjectForm(p => ({ ...p, code: e.target.value }))} />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setAddSubjectModal(false)} className="btn-secondary text-sm">Cancel</button>
            <button onClick={addSubject} disabled={saving || !subjectForm.name} className="btn-primary text-sm">
              <Plus className="w-4 h-4" /> Add Subject
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Unit Modal */}
      <Modal open={addUnitModal} onClose={() => setAddUnitModal(false)} title="Add New Unit">
        <div className="space-y-4">
          <div>
            <label className="label">Unit Title *</label>
            <input className="input-field" placeholder="e.g. Arrays and Linked Lists" value={unitForm.title}
              onChange={e => setUnitForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea rows={2} className="input-field resize-none" placeholder="Optional topic description"
              value={unitForm.description} onChange={e => setUnitForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          <p className="text-xs text-slate-400">Will be created as Unit {units.length + 1}</p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setAddUnitModal(false)} className="btn-secondary text-sm">Cancel</button>
            <button onClick={addUnit} disabled={saving || !unitForm.title} className="btn-primary text-sm">
              <Plus className="w-4 h-4" /> Add Unit
            </button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  )
}
