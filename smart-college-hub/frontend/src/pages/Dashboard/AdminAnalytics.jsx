import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import AdminLayout from '../../components/Layout/AdminLayout'
import { PageLoader } from '../../components/UI'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { TrendingUp, Award, Download, BookOpen } from 'lucide-react'

const COLORS = ['#2563eb', '#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6']

export default function AdminAnalytics() {
  const [subjects, setSubjects] = useState([])
  const [contributors, setContributors] = useState([])
  const [topFiles, setTopFiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([adminAPI.topSubjects(), adminAPI.topContributors(), adminAPI.topFiles()])
      .then(([sr, cr, fr]) => { setSubjects(sr.data); setContributors(cr.data); setTopFiles(fr.data) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <AdminLayout title="Analytics"><PageLoader /></AdminLayout>

  const subjectChartData = subjects.slice(0, 8).map(s => ({
    name: s.subject_name.length > 14 ? s.subject_name.slice(0, 14) + '…' : s.subject_name,
    views: s.total_views,
    downloads: s.total_downloads,
  }))

  const pieData = subjects.slice(0, 6).map((s, i) => ({
    name: s.subject_name.length > 18 ? s.subject_name.slice(0, 18) + '…' : s.subject_name,
    value: s.total_views + s.total_downloads,
  }))

  return (
    <AdminLayout title="Analytics & Insights">

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Bar chart */}
        <div className="card">
          <h3 className="section-title mb-4 flex items-center gap-2"><BookOpen className="w-4 h-4 text-primary-500" /> Most Viewed Subjects</h3>
          {subjectChartData.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={subjectChartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Legend />
                <Bar dataKey="views" fill="#2563eb" radius={[6,6,0,0]} name="Views" />
                <Bar dataKey="downloads" fill="#0ea5e9" radius={[6,6,0,0]} name="Downloads" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart */}
        <div className="card">
          <h3 className="section-title mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-purple-500" /> Activity Distribution</h3>
          {pieData.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Contributors + Top Files */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="card">
          <h3 className="section-title mb-4 flex items-center gap-2"><Award className="w-4 h-4 text-amber-500" /> Top Contributors</h3>
          {contributors.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No uploads yet</p>
          ) : (
            <div className="space-y-3">
              {contributors.slice(0, 8).map((c, i) => (
                <div key={c.user_id} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0
                    ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-200 text-slate-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-primary-50 text-primary-600'}`}>
                    {i + 1}
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-sky-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {c.full_name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{c.full_name}</p>
                    <p className="text-xs text-slate-400">{c.enrollment_no || c.email}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-primary-700">{c.approved_count}</p>
                    <p className="text-xs text-slate-400">approved</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="section-title mb-4 flex items-center gap-2"><Download className="w-4 h-4 text-sky-500" /> Most Downloaded Files</h3>
          {topFiles.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No downloads yet</p>
          ) : (
            <div className="space-y-3">
              {topFiles.map((f, i) => (
                <div key={f.resource_id} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0
                    ${i === 0 ? 'bg-amber-100 text-amber-700' : 'bg-primary-50 text-primary-600'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{f.title}</p>
                    <p className="text-xs text-slate-400">{f.subject_name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-sky-600">{f.download_count}</p>
                    <p className="text-xs text-slate-400">downloads</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
