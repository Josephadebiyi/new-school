// In production the frontend is hosted on Hostinger while the API is on Render.
// VITE_API_BASE is set to the Render URL in .env.production so all fetch calls
// hit the correct server. In dev, it's empty and Vite proxies /api/* locally.
const API_BASE = import.meta.env.VITE_API_BASE || '';

// Normalise a course document from the backend into a consistent shape.
// The backend schema uses: id (UUID), price (number), outcomes, certifications,
// duration_value + duration_unit, course_type, department, etc.
function normalizeCourse(c) {
  const durationStr =
    c.duration ||
    (c.duration_value && c.duration_unit
      ? `${c.duration_value} ${c.duration_unit}`
      : '');

  return {
    id: c.id || c._id || '',
    title: c.title || 'Untitled Course',
    subtitle: c.subtitle || '',
    description: c.description || c.overview || '',
    img: c.image_url || c.img || c.image || '/images/course-uiux.jpg',
    duration: durationStr,
    level: c.level || c.course_type || '',
    category: c.category || c.department || '',
    slug: c.slug || '',
    code: c.code || '',
    price: {
      monthly: c.tuition_monthly ?? c.price?.monthly ?? (typeof c.price === 'number' ? c.price : 0),
      quarterly: c.tuition_quarterly ?? c.price?.quarterly ?? 0,
      upfront: c.tuition_upfront ?? c.price?.upfront ?? (typeof c.price === 'number' ? c.price : 0),
    },
    topics: c.outcomes || c.topics || c.what_you_learn || c.learning_outcomes || [],
    curriculum: c.curriculum || c.modules || c.weeks || [],
    certificates: c.certifications || c.certificates || [],
    requirements: c.requirements || [],
    contact: c.contact || 'admissions@gitb.lt',
    status: c.status || (c.is_active ? 'active' : 'inactive'),
    total_lessons: c.total_lessons || 0,
    units: c.units || 0,
  };
}

// ─── Public Course Routes ────────────────────────────────────────────────────

export async function fetchCourses() {
  const res = await fetch(`${API_BASE}/api/courses/public`);
  if (!res.ok) throw new Error('Failed to fetch courses');
  const data = await res.json();
  return Array.isArray(data) ? data.map(normalizeCourse) : [];
}

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/api/public/stats`);
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function fetchCourseById(id) {
  const res = await fetch(`${API_BASE}/api/courses/public/${id}`);
  if (!res.ok) throw new Error('Course not found');
  const data = await res.json();
  return normalizeCourse(data);
}

// ─── Applications ────────────────────────────────────────────────────────────

export async function createApplication(payload) {
  const res = await fetch(`${API_BASE}/api/applications/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.detail || 'Submission failed');
  return data.data || data; // backend wraps in { data: { checkout_url } }
}

export async function checkApplicationStatus(sessionId) {
  const res = await fetch(`${API_BASE}/api/applications/status/${sessionId}`);
  if (!res.ok) throw new Error('Status check failed');
  return res.json();
}

// ─── Student Auth ────────────────────────────────────────────────────────────

export async function loginUser(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.detail || 'Login failed');
  return data; // { access_token, user }
}

export async function getStudentDashboard(token) {
  const res = await fetch(`${API_BASE}/api/dashboard/student`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load dashboard');
  return res.json();
}

export async function getMyCourses(token) {
  const res = await fetch(`${API_BASE}/api/my-courses`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load courses');
  const data = await res.json();
  return Array.isArray(data) ? data.map(normalizeCourse) : [];
}

// ─── Admin API ───────────────────────────────────────────────────────────────

export async function getAdminDashboard(token) {
  const res = await fetch(`${API_BASE}/api/dashboard/admin`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load admin dashboard');
  return res.json();
}

export async function getAdminCourses(token) {
  const res = await fetch(`${API_BASE}/api/courses`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load courses');
  const data = await res.json();
  return Array.isArray(data) ? data.map(normalizeCourse) : [];
}

export async function createCourse(token, payload) {
  const res = await fetch(`${API_BASE}/api/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.detail || 'Failed to create course');
  return data;
}

export async function updateCourse(token, courseId, payload) {
  const res = await fetch(`${API_BASE}/api/courses/${courseId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.detail || 'Failed to update course');
  return data;
}

export async function getApplications(token) {
  const res = await fetch(`${API_BASE}/api/applications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load applications');
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function approveApplication(token, appId) {
  const res = await fetch(`${API_BASE}/api/applications/${appId}/approve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.detail || 'Failed to approve');
  return data;
}

export async function rejectApplication(token, appId) {
  const res = await fetch(`${API_BASE}/api/applications/${appId}/reject`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.detail || 'Failed to reject');
  return data;
}

export async function getUsers(token) {
  const res = await fetch(`${API_BASE}/api/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load users');
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function getSystemSettings(token) {
  const res = await fetch(`${API_BASE}/api/system-config`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load system settings');
  return res.json();
}

export async function updateSystemSettings(token, payload) {
  const res = await fetch(`${API_BASE}/api/system-config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update system settings');
  return res.json();
}

export async function updateProfile(token, payload) {
  const res = await fetch(`${API_BASE}/api/users/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return res.json();
}

export async function createUser(token, payload) {
  const res = await fetch(`${API_BASE}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.detail || 'Failed to create user');
  return data;
}

export async function uploadFile(token, file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Upload failed');
  return data; // { url }
}

export async function getCourseMaterials(token, courseId) {
  const res = await fetch(`${API_BASE}/api/courses/${courseId}/materials`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load materials');
  return res.json();
}

export async function addCourseMaterial(token, courseId, payload) {
  const res = await fetch(`${API_BASE}/api/courses/${courseId}/materials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to add material');
  return data;
}

// ─── Quizzes ─────────────────────────────────────────────────────────────────

export async function getCourseQuizzes(token, courseId) {
  const res = await fetch(`${API_BASE}/api/courses/${courseId}/quizzes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch quizzes');
  return res.json();
}

export async function getQuizById(token, quizId) {
  const res = await fetch(`${API_BASE}/api/quizzes/${quizId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch quiz');
  return res.json();
}

export async function submitQuiz(token, quizId, answers) {
  const res = await fetch(`${API_BASE}/api/quizzes/${quizId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ answers }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || data.error || 'Failed to submit quiz');
  return data;
}

export async function getMyQuizResults(token) {
  const res = await fetch(`${API_BASE}/api/my-quiz-results`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch quiz results');
  return res.json();
}

export async function adminCreateQuiz(token, payload) {
  const res = await fetch(`${API_BASE}/api/admin/quizzes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to create quiz');
  return data;
}

export async function getAdminCourseQuizzes(token, courseId) {
  const res = await fetch(`${API_BASE}/api/admin/courses/${courseId}/quizzes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch quizzes');
  return res.json();
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export async function markLessonComplete(token, courseId, materialId) {
  const res = await fetch(`${API_BASE}/api/progress/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ course_id: courseId, material_id: materialId }),
  });
  if (!res.ok) throw new Error('Failed to mark lesson complete');
  return res.json();
}

export async function getCourseProgress(token, courseId) {
  const res = await fetch(`${API_BASE}/api/progress/${courseId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch progress');
  return res.json();
}

// ─── Enrollments & Tuition ───────────────────────────────────────────────────

export async function getMyEnrollments(token) {
  const res = await fetch(`${API_BASE}/api/my-enrollments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch enrollments');
  return res.json();
}

export async function createTuitionPayment(token, courseId, paymentPlan, originUrl) {
  const res = await fetch(`${API_BASE}/api/tuition/pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ course_id: courseId, payment_plan: paymentPlan, origin_url: originUrl }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || data.error || 'Payment failed');
  // backend wraps in { data: { checkout_url } } or returns checkout_url directly
  return data.data || data;
}

export async function updateCoursePricing(token, courseId, payload) {
  const res = await fetch(`${API_BASE}/api/courses/${courseId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to update pricing');
  return data;
}

export async function updateUserById(token, userId, payload) {
  const res = await fetch(`${API_BASE}/api/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to update user');
  return data;
}

// ─── Student Self-Service Enrollment ─────────────────────────────────────────

export async function studentAddCourse(token, courseId) {
  const res = await fetch(`${API_BASE}/api/student/add-course`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ course_id: courseId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to add course');
  return data;
}

// ─── Admin Enrollment ────────────────────────────────────────────────────────

export async function adminEnrollStudent(token, userId, courseId) {
  const res = await fetch(`${API_BASE}/api/enrollments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ user_id: userId, course_id: courseId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to enroll student');
  return data;
}

// ─── Admin Course Assignment ─────────────────────────────────────────────────

export async function assignCourseToTeacher(token, teacherId, courseId) {
  const res = await fetch(`${API_BASE}/api/admin/teachers/${teacherId}/assign-course`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ course_id: courseId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to assign course');
  return data;
}

export async function removeTeacherCourse(token, teacherId, courseId) {
  const res = await fetch(`${API_BASE}/api/admin/teachers/${teacherId}/courses/${courseId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to remove course assignment');
  return data;
}

export async function sendTestEmails(token, email) {
  const res = await fetch(`${API_BASE}/api/admin/test-emails`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to send test emails');
  return data;
}

// ─── Teacher / Instructor ────────────────────────────────────────────────────

export async function getTeacherCourses(token) {
  const res = await fetch(`${API_BASE}/api/teacher/courses`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to fetch courses');
  const data = await res.json();
  return Array.isArray(data) ? data.map(normalizeCourse) : [];
}
export async function getTeacherCourseStudents(token, courseId) {
  const res = await fetch(`${API_BASE}/api/teacher/courses/${courseId}/students`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to fetch students');
  return res.json();
}
export async function getTeacherStudents(token) {
  const res = await fetch(`${API_BASE}/api/teacher/students`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to fetch students');
  return res.json();
}
export async function updateStudentGrade(token, payload) {
  const res = await fetch(`${API_BASE}/api/teacher/grades`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update grade');
  return res.json();
}
export async function getTeacherGroups(token) {
  const res = await fetch(`${API_BASE}/api/teacher/groups`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to fetch groups');
  return res.json();
}
export async function createTeacherGroup(token, payload) {
  const res = await fetch(`${API_BASE}/api/teacher/groups`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to create group');
  return data;
}
export async function updateTeacherGroup(token, groupId, payload) {
  const res = await fetch(`${API_BASE}/api/teacher/groups/${groupId}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update group');
  return res.json();
}
export async function deleteTeacherGroup(token, groupId) {
  const res = await fetch(`${API_BASE}/api/teacher/groups/${groupId}`, {
    method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete group');
  return res.json();
}
export async function sendBulkEmail(token, payload) {
  const res = await fetch(`${API_BASE}/api/teacher/bulk-email`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to send emails');
  return data;
}
export async function getTeacherContract(token) {
  const res = await fetch(`${API_BASE}/api/teacher/contract`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to fetch contract');
  return res.json();
}
export async function signTeacherContract(token, signature) {
  const res = await fetch(`${API_BASE}/api/teacher/contract/sign`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ signature }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to sign contract');
  return data;
}
export async function updateTeacherProfile(token, payload) {
  const res = await fetch(`${API_BASE}/api/teacher/profile`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return res.json();
}
export async function bulkUploadQuizzes(token, courseId, quizzes) {
  const res = await fetch(`${API_BASE}/api/teacher/quiz-bulk`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ course_id: courseId, quizzes }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to upload quizzes');
  return data;
}
export async function deleteCourseMaterial(token, courseId, materialId) {
  const res = await fetch(`${API_BASE}/api/courses/${courseId}/materials/${materialId}`, {
    method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete material');
  return res.json();
}

// ─── Activity Log ────────────────────────────────────────────────────────────

export async function getActivityLog(token, limit = 100) {
  const res = await fetch(`${API_BASE}/api/admin/activity?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load activity log');
  return res.json();
}

export async function deleteUser(token, userId) {
  const res = await fetch(`${API_BASE}/api/users/${userId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to delete user');
  return data;
}

// ─── Newsletter ──────────────────────────────────────────────────────────────

export async function subscribeNewsletter(email) {
  const res = await fetch(`${API_BASE}/api/newsletter/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Subscription failed');
  return data;
}
