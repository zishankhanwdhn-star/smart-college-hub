import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { academicAPI } from '../../services/api'
import Header from '../../components/Layout/Header'
import Footer from '../../components/Layout/Footer'
import { PageLoader, EmptyState } from '../../components/UI'
import { BookOpen, ChevronRight, Cpu, Wrench, Zap, Building2, Radio, Laptop, GraduationCap } from 'lucide-react'

const branchIcons = { CSE: Cpu, ME: Wrench, EE: Zap, CE: Building2, EC: Radio, IT: Laptop }
const branchColors = {
  CSE: 'from-blue-500 to-cyan-500',
  ME:  'from-orange-500 to-amber-500',
  EE:  'from-yellow-500 to-orange-500',
  CE:  'from-slate-500 to-slate-700',
  EC:  'from-purple-500 to-pink-500',
  IT:  'from-emerald-500 to-teal-500',
}

export default function ResourcesPage() {
  const [params] = useSearchParams()
  const [branches, setBranches] = useState([])
  const [semesters, setSemesters] = useState([])
  const [subjects, setSubjects] = useState([])
  const [selBranch, setSelBranch] = useState(null)
  const [selSem, setSelSem] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    academicAPI.getBranches().then(r => { setBranches(r.data); setLoading(false) })
  }, [])

  const selectBranch = async (branch) => {
    setSelBranch(branch); setSelSem(null); setSubjects([])
    const r = await academicAPI.getSemesters(branch.id)
    setSemesters(r.data)
  }

  const selectSem = async (sem) => {
    setSelSem(sem)
    const r = await academicAPI.getSubjects(sem.id)
    setSubjects(r.data)
  }

  const goToSubject = (subject) => {
    navigate(`/resources/${selBranch.id}/${selSem.id}/${subject.id}`)
  }

  if (loading) return <><Header /><PageLoader /></>

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Page title */}
        <div className="mb-8">
          <h1 className="page-title flex items-center gap-2"><BookOpen className="w-7 h-7 text-primary-600" /> Browse Resources</h1>
          <p className="text-slate-500 mt-1 text-sm">Select your branch → semester → subject to find study materials</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Step 1: Branch */}
          <div>
            <h2 className="section-title mb-3 flex items-center gap-2">
              <span className="w-6 h-6 bg-primary-600 text-white rounded-lg flex items-center justify-center text-xs font-bold">1</span>
              Select Branch
            </h2>
            <div className="space-y-2">
              {branches.map(b => {
                const Icon = branchIcons[b.code] || GraduationCap
                const grad = branchColors[b.code] || 'from-slate-500 to-slate-700'
                return (
                  <button
                    key={b.id}
                    onClick={() => selectBranch(b)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border-2 text-left transition-all
                      ${selBranch?.id === b.id
                        ? 'border-primary-500 bg-primary-50 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-primary-200 hover:bg-slate-50'}`}
                  >
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${grad} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{b.name}</p>
                      <p className="text-xs text-slate-500">{b.code}</p>
                    </div>
                    {selBranch?.id === b.id && <ChevronRight className="w-4 h-4 text-primary-500 ml-auto" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step 2: Semester */}
          <div>
            <h2 className="section-title mb-3 flex items-center gap-2">
              <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold
                ${selBranch ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-500'}`}>2</span>
              Select Semester
            </h2>
            {!selBranch ? (
              <div className="card text-center py-10 text-slate-400 text-sm">← Select a branch first</div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {semesters.map(s => (
                  <button
                    key={s.id}
                    onClick={() => selectSem(s)}
                    className={`py-4 rounded-2xl border-2 font-semibold text-sm transition-all
                      ${selSem?.id === s.id
                        ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-primary-200 hover:bg-slate-50'}`}
                  >
                    <div className="text-xs text-slate-500 mb-0.5">SEM</div>
                    <div className="text-lg font-bold font-display">{s.number}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Step 3: Subject */}
          <div>
            <h2 className="section-title mb-3 flex items-center gap-2">
              <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold
                ${selSem ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-500'}`}>3</span>
              Select Subject
            </h2>
            {!selSem ? (
              <div className="card text-center py-10 text-slate-400 text-sm">← Select a semester first</div>
            ) : subjects.length === 0 ? (
              <EmptyState title="No subjects yet" description="Subjects for this semester will be added soon." />
            ) : (
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {subjects.map(s => (
                  <button
                    key={s.id}
                    onClick={() => goToSubject(s)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl border border-slate-200 bg-white hover:border-primary-300 hover:bg-primary-50 hover:shadow-sm text-left transition-all group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-primary-700 truncate">{s.name}</p>
                      {s.code && <p className="text-xs text-slate-500">{s.code}</p>}
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary-500 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
