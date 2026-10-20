import { del, get, http, list, patch, post } from './client';

const chatHeaders = (token) => ({ headers: { 'X-Chat-Token': token } });

/** Every API call the app makes, grouped by resource. */
export const api = {
  auth: {
    sync: (body) => post('/auth/sync', body),
    me: () => get('/auth/me'),
    demo: (role) => post('/auth/demo', { role }).then((r) => r.data),
  },
  profile: {
    get: () => get('/profile'),
    update: (body) => patch('/profile', body),
  },
  meta: {
    stats: () => get('/meta/stats'),
    subjects: () => get('/meta/subjects'),
    locations: () => get('/meta/locations'),
    options: () => get('/meta/options'),
  },
  tuitions: {
    list: (params) => list('/tuitions', params),
    latest: (limit = 6) => get('/tuitions/latest', { limit }),
    get: (id) => get(`/tuitions/${id}`),
    mine: (params) => list('/tuitions/mine', params),
    admin: (params) => list('/tuitions/admin', params),
    create: (body) => post('/tuitions', body),
    update: (id, body) => patch(`/tuitions/${id}`, body),
    remove: (id) => del(`/tuitions/${id}`),
    moderate: (id, body) => patch(`/tuitions/${id}/status`, body),
    applicants: (id) => list(`/tuitions/${id}/applications`),
  },
  applications: {
    apply: (body) => post('/applications', body),
    mine: (params) => list('/applications/mine', params),
    received: (params) => list('/applications/received', params),
    ongoing: (params) => list('/applications/ongoing', params),
    check: (tuitionId) => get(`/applications/check/${tuitionId}`),
    update: (id, body) => patch(`/applications/${id}`, body),
    withdraw: (id) => del(`/applications/${id}`),
    reject: (id) => patch(`/applications/${id}/reject`),
  },
  payments: {
    list: (params) => list('/payments', params),
    checkout: (applicationId) => post('/payments/checkout', { applicationId }).then((r) => r.data),
    confirm: (sessionId) => post('/payments/confirm', { sessionId }),
  },
  tutors: {
    list: (params) => list('/tutors', params),
    featured: (limit = 4) => get('/tutors/featured', { limit }),
    get: (id) => get(`/tutors/${id}`),
  },
  reviews: {
    list: (params) => list('/reviews', params),
    create: (body) => post('/reviews', body),
  },
  bookmarks: {
    list: () => get('/bookmarks'),
    ids: () => get('/bookmarks/ids'),
    add: (tuitionId) => post('/bookmarks', { tuitionId }),
    remove: (tuitionId) => del(`/bookmarks/${tuitionId}`),
  },
  notifications: {
    list: (params) => list('/notifications', params),
    readAll: () => patch('/notifications/read-all'),
    read: (id) => patch(`/notifications/${id}/read`),
    remove: (id) => del(`/notifications/${id}`),
  },
  dashboard: {
    student: () => get('/dashboard/student'),
    tutor: () => get('/dashboard/tutor'),
    admin: (days = 30) => get('/dashboard/admin', { days }),
  },
  users: {
    list: (params) => list('/users', params),
    role: (id, role) => patch(`/users/${id}/role`, { role }),
    verify: (id, verified) => patch(`/users/${id}/verify`, { verified }),
    status: (id, isActive) => patch(`/users/${id}/status`, { isActive }),
    update: (id, body) => patch(`/users/${id}`, body),
    remove: (id) => del(`/users/${id}`),
  },
  chat: {
    start: (body) => post('/chat/sessions', body).then((r) => r.data),
    poll: (token) => http.get('/chat/me', chatHeaders(token)).then((r) => r.data.data),
    send: (token, body) => http.post('/chat/me/messages', { body }, chatHeaders(token)).then((r) => r.data.data),
    sessions: (params) => list('/chat/admin/sessions', params),
    thread: (id) => get(`/chat/admin/sessions/${id}`),
    reply: (id, body) => post(`/chat/admin/sessions/${id}/messages`, { body }),
    status: (id, status) => patch(`/chat/admin/sessions/${id}`, { status }),
  },
  contact: {
    send: (body) => post('/contact', body),
    list: (params) => list('/contact', params),
    status: (id, status) => patch(`/contact/${id}`, { status }),
  },
};

/**
 * Query-key factory. Keys are hierarchical so invalidating
 * ['tuitions'] refreshes every tuition list and detail at once.
 */
export const qk = {
  me: ['me'],
  profile: ['profile'],
  stats: ['meta', 'stats'],
  subjects: ['meta', 'subjects'],
  locations: ['meta', 'locations'],
  options: ['meta', 'options'],
  tuitions: {
    all: ['tuitions'],
    list: (p) => ['tuitions', 'list', p],
    latest: (n) => ['tuitions', 'latest', n],
    detail: (id) => ['tuitions', 'detail', id],
    mine: (p) => ['tuitions', 'mine', p],
    admin: (p) => ['tuitions', 'admin', p],
    applicants: (id) => ['tuitions', 'applicants', id],
  },
  applications: {
    all: ['applications'],
    mine: (p) => ['applications', 'mine', p],
    received: (p) => ['applications', 'received', p],
    ongoing: (p) => ['applications', 'ongoing', p],
    check: (id) => ['applications', 'check', id],
  },
  tutors: {
    all: ['tutors'],
    list: (p) => ['tutors', 'list', p],
    featured: (n) => ['tutors', 'featured', n],
    detail: (id) => ['tutors', 'detail', id],
  },
  reviews: (p) => ['reviews', p],
  payments: (p) => ['payments', p],
  bookmarks: { all: ['bookmarks'], list: ['bookmarks', 'list'], ids: ['bookmarks', 'ids'] },
  notifications: ['notifications'],
  dashboard: (role) => ['dashboard', role],
  users: (p) => ['users', p],
  contact: (p) => ['contact', p],
  chat: { me: (token) => ['chat', 'me', token], sessions: (p) => ['chat', 'sessions', p], thread: (id) => ['chat', 'thread', id] },
};
