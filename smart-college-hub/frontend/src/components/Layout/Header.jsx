import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { notifAPI } from '../../services/api'
import {
  BookOpen, Upload, LayoutDashboard, LogOut, User, Bell,
  Menu, X, ChevronDown, Shield, BookMarked, Search
} from 'lucide-react'

export default function Header() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const userRef = useRef(null)
  const notifRef = useRef(null)

  useEffect(() => {
    if (user) {
      notifAPI.getAll().then(r => {
        setNotifications(r.data)
        setUnreadCount(r.data.filter(n => !n.is_read).length)
      }).catch(() => {})
    }
  }, [user, location.pathname])

  useEffect(() => {
    const handler = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = () => { logout(); navigate('/') }

  const markRead = async (id) => {
    await notifAPI.markRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllRead = async () => {
    await notifAPI.markAllRead()
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  const navLinks = user
    ? isAdmin
      ? [
          { to: '/admin', icon: Shield, label: 'Dashboard' },
          { to: '/admin/resources', icon: BookMarked, label: 'Resources' },
          { to: '/admin/users', icon: User, label: 'Users' },
          { to: '/admin/analytics', icon: LayoutDashboard, label: 'Analytics' },
        ]
      : [
          { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
          { to: '/resources', icon: BookOpen, label: 'Browse' },
          { to: '/search', icon: Search, label: 'Search' },
          { to: '/upload', icon: Upload, label: 'Upload' },
        ]
    : [
        { to: '/resources', icon: BookOpen, label: 'Browse Resources' },
        { to: '/search', icon: Search, label: 'Search' },
        { to: '/login', icon: User, label: 'Login' },
      ]

  const isActive = (to) => location.pathname === to || (to !== '/' && location.pathname.startsWith(to))

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Left: College Logo + Name */}
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-sky-500 flex items-center justify-center flex-shrink-0 shadow-sm">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block min-w-0">
              <p className="text-sm font-bold text-slate-800 font-display leading-tight truncate">GPC Waidhan</p>
              <p className="text-xs text-slate-500 leading-tight">RGPV Affiliated</p>
            </div>
          </Link>

          {/* Center: Nav (desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all
                  ${isActive(to)
                    ? 'bg-primary-50 text-primary-700 font-semibold'
                    : 'text-slate-600 hover:text-primary-700 hover:bg-slate-50'}`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>

          {/* Right: RGPV logo + user */}
          <div className="flex items-center gap-2">
            {/* RGPV badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary-50 rounded-xl border border-primary-100">
              <div className="w-5 h-5 rounded bg-primary-600 flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">R</span>
              </div>
              <span className="text-xs font-semibold text-primary-700">RGPV</span>
            </div>

            {user && (
              <>
                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotifOpen(p => !p)}
                    className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-elevated border border-slate-100 z-50 overflow-hidden animate-slide-up">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                        <span className="font-semibold text-slate-800 font-display text-sm">Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-xs text-primary-600 hover:underline font-medium">Mark all read</button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="text-center text-sm text-slate-400 py-8">No notifications</p>
                        ) : notifications.map(n => (
                          <div
                            key={n.id}
                            onClick={() => !n.is_read && markRead(n.id)}
                            className={`px-4 py-3 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors
                              ${!n.is_read ? 'bg-primary-50/50' : ''}`}
                          >
                            <div className="flex items-start gap-2">
                              {!n.is_read && <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5 flex-shrink-0" />}
                              <div>
                                <p className={`text-sm font-medium ${!n.is_read ? 'text-slate-800' : 'text-slate-600'}`}>{n.title}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* User menu */}
                <div className="relative" ref={userRef}>
                  <button
                    onClick={() => setUserMenuOpen(p => !p)}
                    className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-sky-500 flex items-center justify-center text-white text-sm font-bold">
                      {user.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[100px] truncate">
                      {user.full_name?.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-elevated border border-slate-100 z-50 overflow-hidden animate-slide-up">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-800">{user.full_name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        <span className={`mt-1 inline-block text-xs px-2 py-0.5 rounded-full font-medium
                          ${isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-primary-100 text-primary-700'}`}>
                          {user.role}
                        </span>
                      </div>
                      <Link to="/profile" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                        <User className="w-4 h-4" /> My Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {!user && (
              <Link to="/login" className="btn-primary text-sm px-4 py-2">Login</Link>
            )}

            {/* Mobile toggle */}
            <button className="md:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600"
              onClick={() => setMobileOpen(p => !p)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3 animate-slide-up">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <Link
              key={to} to={to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium
                ${isActive(to) ? 'bg-primary-50 text-primary-700' : 'text-slate-700 hover:bg-slate-50'}`}
            >
              <Icon className="w-4 h-4" /> {label}
            </Link>
          ))}
          {user && (
            <button onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 w-full mt-1">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          )}
        </div>
      )}
    </header>
  )
}
