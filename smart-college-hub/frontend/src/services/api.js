import axios from 'axios'

// 🔥 FIXED BASE URL (IMPORTANT)
const BASE = 'https://smart-college-hub-production.up.railway.app/api'

const api = axios.create({ baseURL: BASE })

// Attach token automatically
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: data => api.post('/auth/register', data),
  login:    data => api.post('/auth/login', data),
  me:       ()   => api.get('/auth/me'),
  updateMe: data => api.put('/auth/me', data),
}

// ─── Academic ─────────────────────────────────────────────────────────────────
export const academicAPI = {
  getBranches:  ()         => api.get('/academic/branches'),
  getSemesters: branchId   => api.get(`/academic/branches/${branchId}/semesters`),
  getSubjects:  semId      => api.get(`/academic/semesters/${semId}/subjects`),
  getSubject:   subjectId  => api.get(`/academic/subjects/${subjectId}`),
  getUnits:     subjectId  => api.get(`/academic/subjects/${subjectId}/units`),
  getUnit:      unitId     => api.get(`/academic/units/${unitId}`),
}

// ─── Resources ────────────────────────────────────────────────────────────────
export const resourceAPI = {
  upload: formData => api.post('/resources/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getByUnit:     (unitId, contentType) => api.get(`/resources/unit/${unitId}`, { params: contentType ? { content_type: contentType } : {} }),
  getOne:        id        => api.get(`/resources/${id}`),
  downloadUrl:   id        => `${BASE}/resources/${id}/download`,
  logView:       id        => api.post(`/resources/${id}/view`),
  myUploads:     ()        => api.get('/resources/my/uploads'),
}

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminAPI = {
  stats:         ()          => api.get('/admin/stats'),
  getPending:    ()          => api.get('/admin/pending'),
  approve:       (id, data)  => api.put(`/admin/resources/${id}/approve`, data),
  allResources:  (status)    => api.get('/admin/all-resources', { params: status ? { status } : {} }),
  deleteResource:(id)        => api.delete(`/admin/resources/${id}`),
  getUsers:      (role)      => api.get('/admin/users', { params: role ? { role } : {} }),
  updateUser:    (id, data)  => api.put(`/admin/users/${id}`, data),
  topSubjects:   ()          => api.get('/admin/analytics/top-subjects'),
  topContributors:()         => api.get('/admin/analytics/top-contributors'),
  topFiles:      ()          => api.get('/admin/analytics/top-files'),
  accessLogs:    ()          => api.get('/admin/analytics/access-logs'),
}

// ─── Notifications ────────────────────────────────────────────────────────────
export const notifAPI = {
  getAll:    ()  => api.get('/notifications/'),
  markRead:  id  => api.put(`/notifications/${id}/read`),
  markAllRead:() => api.put('/notifications/read-all'),
}

// ─── Admin Academic ───────────────────────────────────────────────────────────
export const adminAcademicAPI = {
  createSubject: (data)    => api.post('/admin/academic/subjects', data),
  createUnit:    (data)    => api.post('/admin/academic/units', data),
  deleteSubject: (id)      => api.delete(`/admin/academic/subjects/${id}`),
  deleteUnit:    (id)      => api.delete(`/admin/academic/units/${id}`),
}

export default api