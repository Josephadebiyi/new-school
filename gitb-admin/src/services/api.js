// In production the frontend is hosted on Hostinger while the API is on Render.
// VITE_API_BASE is set to the Render URL in .env.production so all fetch calls
// hit the correct server. In dev, it's empty and Vite proxies /api/* locally.
const API_BASE = import.meta.env.VITE_API_BASE || '';

// Normalise a course document from the backend into a consistent shape.
// The backend schema uses: id (UUID), price (number), outcomes, certifications,
// duration_value + duration_unit, course_type, department, pricing_tiers, etc.
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
    description: c.description || '',
    overview: c.overview || c.description || '',
    img: c.image_url || c.img || c.image || '',
    duration: durationStr,
    level: c.level || c.course_type || '',
    category: c.category || c.department || '',
    slug: c.slug || '',
    code: c.code || '',
    price: {
      monthly: c.monthly_price ?? c.tuition_monthly ?? c.price?.monthly ?? 0,
      upfront: c.price?.upfront ?? (typeof c.price === 'number' ? c.price : 0),
    },
    payment_options: c.payment_options || ['one_time'],
    pricing_tiers: Array.isArray(c.pricing_tiers) ? c.pricing_tiers : [],
    topics: c.outcomes || c.topics || c.what_you_learn || c.learning_outcomes || [],
    modules: c.modules || [],
    curriculum: c.curriculum || c.weeks || [],
    certificates: c.certifications || c.certificates || [],
    requirements: c.requirements || [],
    contact: c.contact || 'admissions@gitb.lt',
    status: c.status || (c.is_active ? 'active' : 'inactive'),
    total_lessons: c.total_lessons || 0,
    units: c.units || 0,
    cohort_start_date: c.cohort_start_date || '',
    brochure_url: c.brochure_url || '',
    career_opportunities: c.career_opportunities || [],
    career_pathways: c.career_pathways || [],
    salary_trend: c.salary_trend || [],
    feature_highlights: c.feature_highlights || [],
  };
}

// ─── Public Course Routes ────────────────────────────────────────────────────

export async function fetchCourses() {
  const res = await fetch(`${API_BASE}/api/courses/public`);
  if (!res.ok) throw new Error('Failed to fetch courses');
  const data = await res.json();
  return Array.isArray(data) ? data.map(normalizeCourse) : [];
}

export async function fetchConfig() {
  try {
    const res = await fetch(`${API_BASE}/api/config`);
    if (!res.ok) throw new Error('Failed to fetch config');
    return res.json();
  } catch {
    return { dashboardBanner: { imageUrl: '', linkUrl: '' } };
  }
}

export async function fetchCountries() {
  try {
    const res = await fetch(`${API_BASE}/api/countries`);
    if (!res.ok) throw new Error('Failed to fetch countries');
    return res.json();
  } catch {
    return [];
  }
}

export async function fetchStats() {
  try {
    const res = await fetch(`${API_BASE}/api/public/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  } catch {
    return { graduates: 0, countries: 0, courses: 0 };
  }
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
  return data.data || data;
}

export async function checkApplicationStatus(sessionId) {
  const res = await fetch(`${API_BASE}/api/applications/status/${sessionId}`);
  if (!res.ok) throw new Error('Status check failed');
  return res.json();
}

export async function uploadApplicationDocument(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/api/applications/upload-document`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Upload failed');
  return data; // { url, filename, name, size }
}

// ─── Internships ─────────────────────────────────────────────────────────────

export async function applyToInternship(formData) {
  const res = await fetch(`${API_BASE}/api/internships/apply`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || `Submission failed (${res.status})`);
  }
  return res.json(); // { reference, name, email }
}

export async function getInternships(token) {
  const res = await fetch(`${API_BASE}/api/internships`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load internship applications');
  return res.json();
}

export async function updateInternship(token, id, payload) {
  const res = await fetch(`${API_BASE}/api/internships/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to update');
  return data;
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

export async function forgotPassword(email) {
  const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Request failed');
  return data;
}

export async function resetPassword(token, newPassword) {
  const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, new_password: newPassword }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Reset failed');
  return data;
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

export async function deleteCourse(token, courseId) {
  const res = await fetch(`${API_BASE}/api/courses/${courseId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to delete course');
  return data;
}

// ─── Live Lessons ─────────────────────────────────────────────────────────────

export async function getLiveLessons(token, courseId) {
  const res = await fetch(`${API_BASE}/api/courses/${courseId}/live-lessons`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch live lessons');
  return res.json();
}

export async function createLiveLesson(token, courseId, payload) {
  const res = await fetch(`${API_BASE}/api/courses/${courseId}/live-lessons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to create live lesson');
  return data;
}

export async function updateLiveLesson(token, id, payload) {
  const res = await fetch(`${API_BASE}/api/live-lessons/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to update live lesson');
  return data;
}

export async function deleteLiveLesson(token, id) {
  const res = await fetch(`${API_BASE}/api/live-lessons/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to delete live lesson');
  return data;
}

export async function getMyLiveLessons(token) {
  const res = await fetch(`${API_BASE}/api/my-live-lessons`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch live lessons');
  return res.json();
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

export async function resendCredentials(token, appId) {
  const res = await fetch(`${API_BASE}/api/applications/${appId}/resend-email`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.detail || 'Failed to resend credentials');
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
  const res = await fetch(`${API_BASE}/api/system/settings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load system settings');
  return res.json();
}

export async function updateSystemSettings(token, payload) {
  const res = await fetch(`${API_BASE}/api/system/settings`, {
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
  return data;
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

export async function deleteCourseMaterial(token, courseId, materialId) {
  const res = await fetch(`${API_BASE}/api/courses/${courseId}/materials/${materialId}`, {
    method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete material');
  return res.json();
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

export async function updateQuiz(token, quizId, payload) {
  const res = await fetch(`${API_BASE}/api/admin/quizzes/${quizId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to update quiz');
  return data;
}

export async function deleteQuiz(token, quizId) {
  const res = await fetch(`${API_BASE}/api/admin/quizzes/${quizId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to delete quiz');
  return data;
}

export async function getAdminCourseQuizzes(token, courseId) {
  const res = await fetch(`${API_BASE}/api/admin/courses/${courseId}/quizzes`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch quizzes');
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

export async function createTuitionPayment(token, courseId, paymentPlan, country, couponCode, pricingTierId) {
  const res = await fetch(`${API_BASE}/api/tuition/pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      course_id: courseId,
      payment_plan: paymentPlan,
      country,
      coupon_code: couponCode || undefined,
      pricing_tier_id: pricingTierId || undefined,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || data.error || 'Payment failed');
  return data.data || data;
}

// ─── Coupons (admin, tuition-only discounts) ─────────────────────────────────

export async function getCoupons(token) {
  const res = await fetch(`${API_BASE}/api/coupons`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch coupons');
  return res.json();
}

export async function createCoupon(token, payload) {
  const res = await fetch(`${API_BASE}/api/coupons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to create coupon');
  return data;
}

export async function updateCoupon(token, id, payload) {
  const res = await fetch(`${API_BASE}/api/coupons/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to update coupon');
  return data;
}

export async function deleteCoupon(token, id) {
  const res = await fetch(`${API_BASE}/api/coupons/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete coupon');
  return res.json();
}

export async function getMyReferrals(token) {
  const res = await fetch(`${API_BASE}/api/referrals/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch referral information');
  return res.json();
}

export async function getAdminReferrals(token) {
  const res = await fetch(`${API_BASE}/api/admin/referrals`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch referral data');
  return res.json();
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

export async function deleteUser(token, userId) {
  const res = await fetch(`${API_BASE}/api/users/${userId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to delete user');
  return data;
}

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

export async function seedCourses(token, replace = false) {
  const res = await fetch(`${API_BASE}/api/admin/seed-courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ replace }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || 'Failed to seed courses');
  return data;
}

export async function getActivityLog(token, limit = 100) {
  const res = await fetch(`${API_BASE}/api/admin/activity?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load activity log');
  return res.json();
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
