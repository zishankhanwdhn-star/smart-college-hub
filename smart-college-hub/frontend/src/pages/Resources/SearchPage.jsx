import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../../components/Layout/Header'
import { ContentTypeBadge, formatDate, formatSize, EmptyState, PageLoader } from '../../components/UI'
import { resourceAPI } from '../../services/api'
import api from '../../services/api'

import toast from 'react-hot-toast'
import { Search, Download, Eye, FileText } from 'lucide-react'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const doSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    try {
      const r = await api.get('/resources/search', { params: { q: query } })
      setResults(r.data)
    } catch {
      // fallback: empty results
      setResults([])
    } finally { setLoading(false); setSearched(true) }
  }

  const handleDownload = (res) => {
    resourceAPI.logView(res.id).catch(() => {})
    const link = document.createElement('a')
    link.href = resourceAPI.downloadUrl(res.id)
    link.download = res.file_name
    link.click()
    toast.success('Download started!')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="text-center mb-8">
          <h1 className="page-title text-3xl mb-2">Search Resources</h1>
          <p className="text-slate-500 text-sm">Find notes, PYQs, and study materials across all subjects</p>
        </div>

        <form onSubmit={doSearch} className="flex gap-2 mb-8">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by title, subject, or content type..."
              className="input-field pl-11 text-base py-3"
              autoFocus
            />
          </div>
          <button type="submit" className="btn-primary px-6">Search</button>
        </form>

        {loading && <PageLoader />}

        {!loading && searched && results.length === 0 && (
          <EmptyState
            icon={Search}
            title="No results found"
            description={`No resources matched "${query}". Try different keywords.`}
          />
        )}

        {!loading && results.length > 0 && (
          <>
            <p className="text-sm text-slate-500 mb-4">{results.length} result{results.length !== 1 ? 's' : ''} for "<strong>{query}</strong>"</p>
            <div className="space-y-3">
              {results.map(res => (
                <div key={res.id} className="card hover:shadow-card-hover transition-all">
                  <div className="flex items-start gap-3">
                    <FileText className="w-9 h-9 text-primary-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <p className="font-semibold text-slate-800">{res.title}</p>
                        <ContentTypeBadge type={res.content_type} />
                      </div>
                      {res.description && <p className="text-sm text-slate-500 mt-0.5">{res.description}</p>}
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-400">
                        <span>📄 {res.file_name}</span>
                        <span>📦 {formatSize(res.file_size)}</span>
                        <span>📅 {formatDate(res.created_at)}</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{res.view_count}</span>
                        <span className="flex items-center gap-1"><Download className="w-3 h-3" />{res.download_count}</span>
                      </div>
                    </div>
                    <button onClick={() => handleDownload(res)} className="btn-primary text-xs px-3 py-1.5 flex-shrink-0">
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {!searched && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['notes', 'pyq', 'important_questions', 'syllabus'].map(ct => (
              <button key={ct} onClick={() => { setQuery(ct); }}
                className="card text-center py-5 hover:shadow-card-hover transition-all cursor-pointer">
                <p className="text-2xl mb-1">
                  {ct === 'notes' ? '📝' : ct === 'pyq' ? '📋' : ct === 'important_questions' ? '⭐' : '📚'}
                </p>
                <p className="text-xs font-semibold text-slate-600 capitalize">{ct.replace('_', ' ')}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
