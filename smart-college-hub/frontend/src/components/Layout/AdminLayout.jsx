import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Users, BookMarked, BarChart3,
  FileSearch, LogOut, BookOpen, Shield
} from 'lucide-react'

const links = [
  { to: '/admin',            icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/resources',  icon: BookMarked,       label: 'Resources' },
  { to: '/admin/users',      icon: Users,            label: 'Users' },
  { to: '/admin/analytics',  icon: BarChart3,        label: 'Analytics' },
  { to: '/admin/logs',       icon: FileSearch,       label: 'Access Logs' },
  { to: '/admin/academic',   icon: BookOpen,         label: 'Academic' },
]

export function AdminSidebar() {
  const { pathname } = useLocation()
  const { logout } = useAuth()
  const navigate = useNavigate()

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-slate-100 flex flex-col py-6 px-3">
      <div className="flex items-center gap-2 px-3 mb-8">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-primary-600 flex items-center justify-center">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800 font-display">Admin Panel</p>
          <p className="text-xs text-slate-500">GPC Waidhan</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <Link
            key={to} to={to}
            className={`sidebar-link ${pathname === to || (to !== '/admin' && pathname.startsWith(to)) ? 'active' : ''}`}
          >
            <Icon className="w-4 h-4" /> {label}
          </Link>
        ))}
      </nav>
      <div className="px-3 mt-4">
        <Link to="/resources" className="sidebar-link mb-1">
          <BookOpen className="w-4 h-4" /> View Portal
        </Link>
        <button onClick={() => { logout(); navigate('/') }} className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  )
}

export default function AdminLayout({ children, title }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          {title && <h1 className="page-title mb-6">{title}</h1>}
          {children}
        </div>
      </main>
    </div>
  )
}
