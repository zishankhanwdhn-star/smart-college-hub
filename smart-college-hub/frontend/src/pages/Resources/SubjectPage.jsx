import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { academicAPI } from '../../services/api'
import Header from '../../components/Layout/Header'
import Footer from '../../components/Layout/Footer'
import { PageLoader, EmptyState, Breadcrumb } from '../../components/UI'
import { BookOpen, ChevronRight, FileText, ArrowLeft } from 'lucide-react'

export default function SubjectPage() {
  const { branchId, semId, subjectId } = useParams()
  const [subject, setSubject] = useState(null)
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      academicAPI.getSubject(subjectId),
      academicAPI.getUnits(subjectId)
    ]).then(([sr, ur]) => {
      setSubject(sr.data); setUnits(ur.data)
    }).finally(() => setLoading(false))
  }, [subjectId])

  if (loading) return <><Header /><PageLoader /></>

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600 mb-5 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Subject header */}
        <div className="card mb-6 bg-gradient-to-br from-primary-600 to-sky-600 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display mb-1">{subject?.name}</h1>
              {subject?.code && <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">{subject.code}</span>}
              <p className="text-blue-100 text-sm mt-2">{units.length} Units · Click a unit to view study materials</p>
            </div>
          </div>
        </div>

        {/* Units list */}
        <h2 className="section-title mb-4">Units</h2>
        {units.length === 0 ? (
          <EmptyState icon={FileText} title="No units yet" description="Units will be added soon." />
        ) : (
          <div className="space-y-3">
            {units.map(unit => (
              <Link
                key={unit.id}
                to={`/resources/unit/${unit.id}`}
                className="card-hover flex items-center gap-4 group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center font-bold text-primary-700 font-display flex-shrink-0 group-hover:bg-primary-100 transition-colors">
                  {unit.number}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 group-hover:text-primary-700 transition-colors">{unit.title}</p>
                  {unit.resource_count > 0
                    ? <p className="text-xs text-emerald-600 font-medium mt-0.5">{unit.resource_count} resource{unit.resource_count !== 1 ? 's' : ''} available</p>
                    : <p className="text-xs text-slate-400 mt-0.5">No resources yet — be the first to upload!</p>
                  }
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary-500 transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
