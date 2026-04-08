// ─── Central API utility ─────────────────────────────────────────────────────
// All backend calls go through this file.
// Set VITE_API_BASE in .env to override (e.g. for production deployment)

const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

// ── Token helpers ────────────────────────────────────────────────────────────
export const getToken  = () => localStorage.getItem('token');
export const getRole   = () => localStorage.getItem('role');

export const getUserId = () => localStorage.getItem('userid');

export const saveSession = (data) => {
  localStorage.setItem('token',  data.token);
  localStorage.setItem('role',   data.role);
  localStorage.setItem('uname',  data.user?.name || '');

  const id = String(data.user?._id || data.user?.user_id || '');
  localStorage.setItem('userid', id);

  if (data.role === 'admin')  localStorage.setItem('adminid',  id);
  if (data.role === 'writer') localStorage.setItem('writerid', id);
  if (data.role === 'reader') localStorage.setItem('readerid', id);
};

export const clearSession = () => {
  ['token','role','uname','userid','adminid','writerid','readerid'].forEach(k => localStorage.removeItem(k));
};

export const isLoggedIn = () => !!getToken();

// ── HTTP helpers ─────────────────────────────────────────────────────────────
const authHeaders = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

const get = (url) =>
  fetch(`${BASE}${url}`, { headers: authHeaders() }).then(r => r.json());

const post = (url, body) =>
  fetch(`${BASE}${url}`, {
    method: 'POST', headers: authHeaders(), body: JSON.stringify(body),
  }).then(r => r.json());

const put = (url, body) =>
  fetch(`${BASE}${url}`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify(body),
  }).then(r => r.json());

const del = (url) =>
  fetch(`${BASE}${url}`, { method: 'DELETE', headers: authHeaders() }).then(r => r.json());

const postForm = (url, formData) =>
  fetch(`${BASE}${url}`, {
    method: 'POST',
    headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {},
    body: formData,
  }).then(r => r.json());

const putForm = (url, formData) =>
  fetch(`${BASE}${url}`, {
    method: 'PUT',
    headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {},
    body: formData,
  }).then(r => r.json());

// ── Static asset URLs ─────────────────────────────────────────────────────────
export const imgUrl = (filename) => filename ? `${BASE}/book_img/${filename}` : null;
export const pdfUrl = (filename) => filename ? `${BASE}/book_pdf/${filename}` : null;

// ── Auth ──────────────────────────────────────────────────────────────────────
export const api = {
  // Auth
  login:           (email, password)      => post('/loginuser', { email, password }),
  registerWriter:  (form)                  => post('/regiswriter', form),
  registerReader:  (form)                  => post('/regisreader', form),

  // Categories
  getCategories:        ()         => get('/getcategorydetail'),
  getSingleCategory:    (cid)      => get(`/getsinglecategorydetail/${cid}`),
  saveCategory:         (cat)      => post('/savecategory', { cat }),
  updateCategory:       (cid, cat) => put(`/updatecategory/${cid}`, { cat }),
  deleteCategory:       (cid)      => del(`/deletecat/${cid}`),

  // Books - Admin
  getBooks:             ()         => get('/getbookdetail'),
  getAllBooks:           ()         => get('/getallbookdetail'),
  getSingleBook:        (bid)      => get(`/getsinglebookdetail/${bid}`),
  saveBook:             (fd)       => postForm('/savebook', fd),
  updateBook:           (bid, fd)  => putForm(`/updatebook/${bid}`, fd),
  deleteBook:           (bid)      => del(`/deletebook/${bid}`),

  // Books - Reader
  readerGetBooks:       ()         => get('/readergetbookdetail'),
  readerGetCatBooks:    (cid)      => get(`/readerfetchcatwisebookdetail/${cid}`),

  // Books - Writer
  writerSaveBook:       (fd)       => postForm('/writersavebook', fd),
  writerUpdateBook:     (bid, fd)  => putForm(`/writerupdatebook/${bid}`, fd),
  writerGetUploaded:    (wid)      => get(`/writergetuploadedbookdetail/${wid}`),
  writerGetAll:         (wid)      => get(`/writergetallbookdetail/${wid}`),

  // Ratings
  submitRating:         (bid, rating, readerid, review='') => post('/submitrating', { bid, rating, readerid, review }),
  getReaderRating:      (bid, readerid)         => get(`/readerfetchrating/${bid}/${readerid}`),
  getBookWiseRating:    (bid)                   => get(`/getbookwiseratingdetail/${bid}`),
  getReaderWiseRating:  (rid)                   => get(`/getreaderwiseratingdetail/${rid}`),

  // Reports (legacy)
  getAllReaders:         () => get('/getallreaderdetail'),
  getAllWriters:         () => get('/getallwriterdetail'),

  // ── Reader Panel ────────────────────────────────────────────────────────────
  readerGetProfile:         (rid)  => get(`/reader/profile/${rid}`),
  readerUpdateProfile:      (data) => put('/reader/profile', data),
  readerGetBookmarks:       ()     => get('/reader/bookmarks'),
  readerToggleBookmark:     (bid)  => post(`/reader/bookmarks/${bid}`, {}),
  readerCheckBookmark:      (bid)  => get(`/reader/bookmarks/${bid}/status`),
  readerGetRecent:          ()     => get('/reader/recent'),
  readerTrackRecent:        (bid)  => post(`/reader/recent/${bid}`, {}),
  readerGetMyRatings:       ()     => get('/reader/ratings'),
  readerGetRecommendations: ()     => get('/reader/recommendations'),
  readerSearch:             (q='',genre='',sort='newest') => get(`/reader/search?q=${encodeURIComponent(q)}&genre=${encodeURIComponent(genre)}&sort=${sort}`),
  readerGetGenres:          ()     => get('/reader/genres'),
  readerToggleFollow:       (wid)  => post(`/reader/follow/${wid}`, {}),
  readerGetFollowing:       ()     => get('/reader/following'),
  readerCheckFollow:        (wid)  => get(`/reader/follow/${wid}/status`),

  // ── Writer followers ────────────────────────────────────────────────────────
  writerGetFollowers:       ()     => get('/writer/followers'),

  // ── Borrow / Return ─────────────────────────────────────────────────────────
  borrowBook:    (bookId)    => post(`/api/borrow/${bookId}/borrow`, {}),
  returnBook:    (borrowId)  => put(`/api/borrow/${borrowId}/return`, {}),
  getMyBorrows:  (status='') => get(`/api/borrow/my${status ? `?status=${status}` : ''}`),

  // ── Auth extras ─────────────────────────────────────────────────────────────
  forgotPassword:           (email)               => post('/api/auth/forgot-password', { email }),
  resetPassword:            (email, code, newPwd) => post('/api/auth/reset-password',  { email, code, newPassword: newPwd }),
  changePassword:           (currentPassword, newPassword) => put('/api/auth/change-password', { currentPassword, newPassword }),

  // ── Writer Panel ─────────────────────────────────────────────────────────────
  writerGetProfile:     (wid)        => get(`/writer/profile/${wid}`),
  writerUpdateProfile:  (data)       => put('/writer/profile', data),
  writerGetAnalytics:   (wid)        => get(`/writer/analytics/${wid}`),
  writerGetReviews:     (bid)        => get(`/writer/books/${bid}/reviews`),
  writerTogglePublish:  (bid)        => put(`/writer/books/${bid}/publish`, {}),
  writerDeleteBook:     (bid)        => del(`/writer/books/${bid}`),
  writerGetNotifications: ()         => get('/writer/notifications'),

  // ── Admin Panel ───────────────────────────────────────────────────────────────
  adminDashboard:       ()          => get('/admin/dashboard'),
  adminGetReaders:      (params='') => get(`/admin/readers${params}`),
  adminBlockUser:       (id)        => put(`/admin/users/${id}/block`, {}),
  adminDeleteUser:      (id)        => del(`/admin/users/${id}`),
  adminGetWriters:      (params='') => get(`/admin/writers${params}`),
  adminGetBookRatings:  (bid)       => get(`/admin/books/${bid}/ratings`),
  adminDeleteRating:    (id)        => del(`/admin/ratings/${id}`),
  adminSearch:          (q)         => get(`/admin/search?q=${encodeURIComponent(q)}`),
  adminToggleFeatured:  (bid)       => put(`/admin/books/${bid}/feature`, {}),
  adminGetAnnouncement: ()          => get('/admin/announcement'),
  adminSetAnnouncement: (text)      => post('/admin/announcement', { announcement: text }),
};

export default api;