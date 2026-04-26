import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Pages
import LandingPage    from './pages/LandingPage'
import LoginPage      from './pages/LoginPage'
import RegisterPage   from './pages/RegisterPage'
import ResourcesPage  from './pages/Resources/ResourcesPage'
import SubjectPage    from './pages/Resources/SubjectPage'
import UnitPage       from './pages/Resources/UnitPage'
import UploadPage     from './pages/Upload/UploadPage'
import StudentDashboard  from './pages/Dashboard/StudentDashboard'
import AdminDashboard    from './pages/Dashboard/AdminDashboard'
import AdminUsers        from './pages/Dashboard/AdminUsers'
import AdminResources    from './pages/Dashboard/AdminResources'
import AdminAnalytics    from './pages/Dashboard/AdminAnalytics'
import AdminLogs         from './pages/Dashboard/AdminLogs'
import AdminAcademic      from './pages/Dashboard/AdminAcademic'
import SearchPage         from './pages/Resources/SearchPage'
import NotFoundPage   from './pages/NotFoundPage'
import ProfilePage    from './pages/ProfilePage'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="h-screen flex items-center justify-center"><div className="w-8 h-8 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* Resources - public browsing */}
        <Route path="/resources"                element={<ResourcesPage />} />
        <Route path="/resources/:branchId/:semId/:subjectId" element={<SubjectPage />} />
        <Route path="/resources/unit/:unitId"   element={<UnitPage />} />

        {/* Student */}
        <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
        <Route path="/upload"    element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin"           element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users"     element={<ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/resources" element={<ProtectedRoute adminOnly><AdminResources /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute adminOnly><AdminAnalytics /></ProtectedRoute>} />
        <Route path="/admin/logs"      element={<ProtectedRoute adminOnly><AdminLogs /></ProtectedRoute>} />

        <Route path="/admin/academic"  element={<ProtectedRoute adminOnly><AdminAcademic /></ProtectedRoute>} />
        <Route path="/search"          element={<SearchPage />} />
        <Route path="/profile"         element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  )
}
