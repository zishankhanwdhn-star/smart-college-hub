import { Link } from 'react-router-dom'
import { BookOpen, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-600 to-sky-500 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-800 font-display text-sm">Resource Hub</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Academic resource platform for Government Polytechnic College Waidhan students, affiliated to RGPV University.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-700 text-sm mb-3 font-display">Quick Links</h4>
            <ul className="space-y-1.5">
              {[
                { to: '/', label: 'Home' },
                { to: '/resources', label: 'Browse Resources' },
                { to: '/search', label: 'Search' },
                { to: '/upload', label: 'Upload Material' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-xs text-slate-500 hover:text-primary-600 transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-700 text-sm mb-3 font-display">Content Types</h4>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li>📝 Lecture Notes</li>
              <li>📋 Previous Year Questions</li>
              <li>⭐ Important Questions</li>
              <li>📚 Syllabus</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-100 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-slate-500 font-display font-medium">
            Government Polytechnic College Waidhan · RGPV University, Bhopal, M.P.
          </p>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-400" /> for students
          </p>
        </div>
      </div>
    </footer>
  )
}
