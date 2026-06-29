import { api } from './client'

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then((r) => r.data.data),
  me: () => api.get('/auth/me').then((r) => r.data.data),
}

// Sponsors
export const sponsorsApi = {
  list: (params?: object) => api.get('/sponsors', { params }).then((r) => r.data),
  get: (id: string) => api.get(`/sponsors/${id}`).then((r) => r.data.data),
  create: (data: object) => api.post('/sponsors', data).then((r) => r.data.data),
  update: (id: string, data: object) => api.patch(`/sponsors/${id}`, data).then((r) => r.data.data),
  delete: (id: string) => api.delete(`/sponsors/${id}`).then((r) => r.data),
}

// Studies
export const studiesApi = {
  list: (params?: object) => api.get('/studies', { params }).then((r) => r.data),
  get: (id: string) => api.get(`/studies/${id}`).then((r) => r.data.data),
  create: (data: object) => api.post('/studies', data).then((r) => r.data.data),
  update: (id: string, data: object) => api.patch(`/studies/${id}`, data).then((r) => r.data.data),
}

// Sites
export const sitesApi = {
  list: (params?: object) => api.get('/sites', { params }).then((r) => r.data),
  get: (id: string) => api.get(`/sites/${id}`).then((r) => r.data.data),
}

// Participants
export const participantsApi = {
  list: (params?: object) => api.get('/participants', { params }).then((r) => r.data),
  get: (id: string) => api.get(`/participants/${id}`).then((r) => r.data.data),
  create: (data: object) => api.post('/participants', data).then((r) => r.data.data),
  update: (id: string, data: object) => api.patch(`/participants/${id}`, data).then((r) => r.data.data),
}

// Enrollments
export const enrollmentsApi = {
  list: (params?: object) => api.get('/enrollments', { params }).then((r) => r.data),
  get: (id: string) => api.get(`/enrollments/${id}`).then((r) => r.data.data),
}

// Visits
export const visitsApi = {
  list: (params?: object) => api.get('/visits', { params }).then((r) => r.data),
  get: (id: string) => api.get(`/visits/${id}`).then((r) => r.data.data),
  update: (id: string, data: object) => api.patch(`/visits/${id}`, data).then((r) => r.data.data),
}

// Payments
export const paymentsApi = {
  list: (params?: object) => api.get('/payments', { params }).then((r) => r.data),
  get: (id: string) => api.get(`/payments/${id}`).then((r) => r.data.data),
  approve: (id: string, status: 'APPROVED' | 'REJECTED') =>
    api.patch(`/payments/${id}/approve`, { status }).then((r) => r.data.data),
}

// Messages
export const messagesApi = {
  list: (params?: object) => api.get('/messages', { params }).then((r) => r.data),
  send: (data: object) => api.post('/messages', data).then((r) => r.data.data),
  markRead: (messageIds: string[]) =>
    api.patch('/messages/mark-read', { messageIds }).then((r) => r.data),
}

// Adverse Events
export const adverseEventsApi = {
  list: (params?: object) => api.get('/adverse-events', { params }).then((r) => r.data),
  get: (id: string) => api.get(`/adverse-events/${id}`).then((r) => r.data.data),
  update: (id: string, data: object) => api.patch(`/adverse-events/${id}`, data).then((r) => r.data.data),
}
