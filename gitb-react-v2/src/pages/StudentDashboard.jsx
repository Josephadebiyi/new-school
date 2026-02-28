import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Monitor, ClipboardList, CreditCard, User, LogOut,
  ChevronLeft, ChevronRight, Menu, X, CheckCircle, Circle, Play, FileText,
  Link as LinkIcon, File, Clock, Award, AlertCircle, Upload, Save,
  ExternalLink, TrendingUp, BookMarked, XCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  getMyCourses, getMyEnrollments, getCourseMaterials, getCourseQuizzes,
  getQuizById, submitQuiz, getMyQuizResults, markLessonComplete,
  getCourseProgress, createTuitionPayment, updateProfile, uploadFile,
  fetchCourses, studentAddCourse,
} from '../services/api';

function isYouTube(url) {
  return url && (url.includes('youtube.com') || url.includes('youtu.be'));
}
function getYouTubeEmbedUrl(url) {
  if (!url) return '';
  const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}
function groupByWeek(materials) {
  const groups = {};
  (materials || []).forEach((m) => {
    const week = m.week ?? m.week_number ?? 1;
    if (!groups[week]) groups[week] = [];
    groups[week].push(m);
  });
  return groups;
}
function TypeIcon({ type }) {
  switch ((type || '').toLowerCase()) {
    case 'video': return <Play size={14} className="text-green-400" />;
    case 'pdf': return <FileText size={14} className="text-red-400" />;
    case 'link': return <LinkIcon size={14} className="text-blue-400" />;
    default: return <File size={14} className="text-gray-400" />;
  }
}

export default function StudentDashboard() {
  const { user, token, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [myResults, setMyResults] = useState([]);
  const [progress, setProgress] = useState({});
  const [allCourses, setAllCourses] = useState([]);
  const [addingCourse, setAddingCourse] = useState('');
  const [addCourseMsg, setAddCourseMsg] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({ first_name: '', last_name: '', phone: '', profilePicture: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quizTimeLeft, setQuizTimeLeft] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    loadInitial();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadInitial() {
    setLoading(true); setError('');
    try {
      const [coursesData, enrollData, resultsData, allCoursesData] = await Promise.allSettled([
        getMyCourses(token), getMyEnrollments(token), getMyQuizResults(token), fetchCourses(),
      ]);
      const c = coursesData.status === 'fulfilled' ? coursesData.value : [];
      const e = enrollData.status === 'fulfilled' ? enrollData.value : [];
      const r = resultsData.status === 'fulfilled' ? resultsData.value : [];
      if (allCoursesData.status === 'fulfilled') setAllCourses(Array.isArray(allCoursesData.value) ? allCoursesData.value : []);
      setCourses(c);
      setEnrollments(Array.isArray(e) ? e : []);
      setMyResults(Array.isArray(r) ? r : []);
      if (user) setProfileForm({ first_name: user.first_name || '', last_name: user.last_name || '', phone: user.phone || '', profilePicture: user.profile_picture || user.profilePicture || '' });
      if (c.length > 0) {
        const progressMap = {};
        await Promise.allSettled(c.map(async (course) => {
          try { const p = await getCourseProgress(token, course.id); progressMap[course.id] = p?.percentage ?? 0; }
          catch { progressMap[course.id] = 0; }
        }));
        setProgress(progressMap);
      }
    } catch { setError('Failed to load dashboard data. Please refresh.'); }
    finally { setLoading(false); }
  }

  const loadCourseData = useCallback(async (course) => {
    if (!course) return;
    setSelectedCourse(course); setMaterials([]); setQuizzes([]); setSelectedMaterial(null); setActiveQuiz(null); setQuizResult(null);
    try {
      const [matsData, quizData, progressData] = await Promise.allSettled([
        getCourseMaterials(token, course.id), getCourseQuizzes(token, course.id), getCourseProgress(token, course.id),
      ]);
      if (matsData.status === 'fulfilled') {
        const completedIds = new Set(
          progressData.status === 'fulfilled' ? (progressData.value?.completed_lesson_ids || []) : []
        );
        const mats = (Array.isArray(matsData.value) ? matsData.value : []).map(m => ({ ...m, completed: completedIds.has(m.id) }));
        setMaterials(mats);
      }
      if (quizData.status === 'fulfilled') setQuizzes(Array.isArray(quizData.value) ? quizData.value : []);
    } catch { /* silently fail */ }
  }, [token]);

  function openStudy(course) { loadCourseData(course); setActiveView('study'); setMobileOpen(false); }
  function openQuizzes(course) { loadCourseData(course); setActiveView('quizzes'); setMobileOpen(false); }

  async function handleMarkComplete(material) {
    if (!selectedCourse) return;
    try {
      await markLessonComplete(token, selectedCourse.id, material.id);
      setMaterials((prev) => prev.map((m) => m.id === material.id ? { ...m, completed: true } : m));
      const p = await getCourseProgress(token, selectedCourse.id);
      setProgress((prev) => ({ ...prev, [selectedCourse.id]: p?.percentage ?? 0 }));
    } catch { /* ignore */ }
  }

  function selectMaterial(material) {
    setSelectedMaterial(material);
  }

  async function startQuiz(quiz) {
    try {
      const full = await getQuizById(token, quiz.id);
      setActiveQuiz(full); setQuizAnswers({}); setQuizResult(null);
      const mins = full.time_limit_minutes ?? full.time_limit ?? 0;
      setQuizTimeLeft(mins > 0 ? mins * 60 : null);
    } catch { setError('Failed to load quiz.'); }
  }

  useEffect(() => {
    if (quizTimeLeft === null) return;
    if (quizTimeLeft <= 0) { handleSubmitQuiz(); return; }
    timerRef.current = setTimeout(() => setQuizTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [quizTimeLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmitQuiz() {
    clearTimeout(timerRef.current); setQuizTimeLeft(null);
    if (!activeQuiz) return;
    try {
      const answers = Object.entries(quizAnswers).map(([question_id, selected_answer]) => ({ question_id, selected_answer }));
      const result = await submitQuiz(token, activeQuiz.id, answers);
      setQuizResult(result); setActiveQuiz(null);
      const r = await getMyQuizResults(token); setMyResults(Array.isArray(r) ? r : []);
    } catch (err) { setError(err.message || 'Failed to submit quiz.'); }
  }

  async function handlePayment(courseIdOrEnrollment) {
    setPaymentLoading(true); setError('');
    try {
      const courseId = typeof courseIdOrEnrollment === 'string'
        ? courseIdOrEnrollment
        : courseIdOrEnrollment.course_id || courseIdOrEnrollment.courseId;
      const plan = (typeof courseIdOrEnrollment === 'object' && courseIdOrEnrollment.payment_plan) || 'one_time';
      const data = await createTuitionPayment(token, courseId, plan, window.location.origin);
      const url = data?.checkout_url || data?.data?.checkout_url;
      if (url) window.location.href = url;
      else setError('No checkout URL returned. Please contact support.');
    } catch (err) { setError(err.message || 'Payment failed. Please try again.'); }
    finally { setPaymentLoading(false); }
  }

  async function handleAddCourse(courseId) {
    setAddingCourse(courseId); setAddCourseMsg('');
    try {
      await studentAddCourse(token, courseId);
      setAddCourseMsg('Course added! Pay tuition to unlock full access.');
      await loadInitial();
    } catch (err) {
      setAddCourseMsg(err.message || 'Failed to add course.');
    } finally { setAddingCourse(''); }
  }

  async function handleProfileImageUpload(e) {
    const file = e.target.files[0]; if (!file) return;
    try { const data = await uploadFile(token, file); setProfileForm((p) => ({ ...p, profilePicture: data.url })); }
    catch { setProfileMsg('Image upload failed.'); }
  }

  async function handleProfileSave(e) {
    e.preventDefault(); setProfileSaving(true); setProfileMsg('');
    try {
      const updated = await updateProfile(token, { first_name: profileForm.first_name, last_name: profileForm.last_name, phone: profileForm.phone, profilePicture: profileForm.profilePicture });
      updateUser({ first_name: profileForm.first_name, last_name: profileForm.last_name, phone: profileForm.phone, profilePicture: profileForm.profilePicture });
      setProfileMsg('Profile updated successfully.');
    } catch { setProfileMsg('Failed to update profile.'); }
    finally { setProfileSaving(false); }
  }

  function handleLogout() { logout(); navigate('/login'); }
  function formatTimer(s) { const m = Math.floor(s / 60); const sec = s % 60; return `${m}:${sec.toString().padStart(2, '0')}`; }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'browse', label: 'Browse Courses', icon: BookOpen },
    { id: 'study', label: 'Study Room', icon: Monitor },
    { id: 'quizzes', label: 'Quizzes', icon: ClipboardList },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  // ─── VIEWS ────────────────────────────────────────────────────────────────

  function DashboardView() {
    const total = courses.length;
    const completed = courses.filter((c) => (progress[c.id] ?? 0) >= 100).length;
    const avg = total > 0 ? Math.round(courses.reduce((s, c) => s + (progress[c.id] ?? 0), 0) / total) : 0;
    return (
      <div className="space-y-6">
        <div className="rounded-2xl p-6 text-white shadow-lg" style={{ background: 'linear-gradient(135deg, #0C4E3A 0%, #0a3d2d 100%)' }}>
          <h2 className="text-2xl font-bold mb-1">Welcome back, {user?.first_name || 'Student'}!</h2>
          <p className="text-green-200 text-sm">Keep up the great work. You're on your way to success.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Enrolled Courses', value: total, icon: BookOpen, bg: 'bg-green-50', fg: 'text-green-700' },
            { label: 'Completed', value: completed, icon: Award, bg: 'bg-yellow-50', fg: 'text-yellow-700' },
            { label: 'Avg. Progress', value: `${avg}%`, icon: TrendingUp, bg: 'bg-blue-50', fg: 'text-blue-700' },
          ].map(({ label, value, icon: Icon, bg, fg }) => (
            <div key={label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3 ${bg} ${fg}`}><Icon size={20} /></div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">My Courses</h3>
          {courses.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-dashed border-gray-200">
              <BookMarked size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">You are not enrolled in any courses yet.</p>
              <button onClick={() => navigate('/courses')} className="mt-4 px-5 py-2 rounded-xl text-white text-sm font-medium" style={{ backgroundColor: '#0C4E3A' }}>Browse Courses</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course) => (
                <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <img src={course.img || '/images/course-uiux.jpg'} alt={course.title} className="w-full h-36 object-cover" onError={(e) => { e.target.src = '/images/course-uiux.jpg'; }} />
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-1 truncate">{course.title}</h4>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${progress[course.id] ?? 0}%`, backgroundColor: '#D4F542' }} />
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">{progress[course.id] ?? 0}%</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openStudy(course)} className="flex-1 text-sm py-1.5 rounded-lg font-medium text-white" style={{ backgroundColor: '#0C4E3A' }}>Study</button>
                      <button onClick={() => openQuizzes(course)} className="flex-1 text-sm py-1.5 rounded-lg font-medium border" style={{ borderColor: '#0C4E3A', color: '#0C4E3A' }}>Quizzes</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {myResults.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Quiz Results</h3>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
              {myResults.slice(0, 5).map((result, i) => (
                <div key={result.id || i} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{result.quiz_title || `Quiz ${i + 1}`}</p>
                    <p className="text-xs text-gray-400">{result.course_title || ''}</p>
                  </div>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${result.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                    {Math.round(result.percentage ?? result.score ?? 0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  function BrowseCoursesView() {
    // Build a map of enrollments by course_id for quick lookup
    const enrollmentMap = {};
    enrollments.forEach((e) => { enrollmentMap[e.course_id] = e; });

    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Browse Courses</h2>
          <p className="text-sm text-gray-500 mt-0.5">Add any course to your dashboard. Pay tuition to unlock full access.</p>
        </div>
        {addCourseMsg && (
          <div className={`px-4 py-3 rounded-xl text-sm font-medium ${addCourseMsg.includes('added') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{addCourseMsg}</div>
        )}
        {allCourses.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-dashed border-gray-200">
            <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No courses available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {allCourses.map((course) => {
              const enrollment = enrollmentMap[course.id];
              const isPaid = enrollment?.payment_status === 'paid';
              const isPending = enrollment && !isPaid;

              return (
                <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                  <div className="relative">
                    <img src={course.img || '/images/course-uiux.jpg'} alt={course.title} className="w-full h-36 object-cover" onError={(e) => { e.target.src = '/images/course-uiux.jpg'; }} />
                    {isPaid && (
                      <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Enrolled</span>
                    )}
                    {isPending && (
                      <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">Unpaid</span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1 truncate">{course.title}</h4>
                    <p className="text-xs text-gray-400 mb-1">{course.category} {course.duration ? `· ${course.duration}` : ''}</p>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2 flex-1">{course.description}</p>
                    {course.price?.upfront > 0 && (
                      <p className="text-sm font-bold text-gray-700 mb-3">
                        €{course.price.upfront.toLocaleString()}
                        {course.price.monthly > 0 && <span className="text-xs font-normal text-gray-400 ml-1">or €{course.price.monthly}/mo</span>}
                      </p>
                    )}
                    {isPaid ? (
                      <button onClick={() => { openStudy(courses.find((c) => c.id === course.id) || course); setActiveView('study'); }} className="w-full py-2 rounded-xl text-white text-sm font-semibold" style={{ backgroundColor: '#0C4E3A' }}>
                        Open Course
                      </button>
                    ) : isPending ? (
                      <div className="space-y-2">
                        <p className="text-xs text-yellow-700 bg-yellow-50 px-3 py-1.5 rounded-lg text-center">Added — pay tuition to unlock</p>
                        <div className="flex gap-2">
                          {course.price?.monthly > 0 && (
                            <button onClick={() => handlePayment(course.id)} disabled={paymentLoading} className="flex-1 py-2 rounded-xl text-xs font-semibold border-2 disabled:opacity-50" style={{ borderColor: '#0C4E3A', color: '#0C4E3A' }}>
                              Pay €{course.price.monthly}/mo
                            </button>
                          )}
                          <button onClick={() => handlePayment(course.id)} disabled={paymentLoading} className="flex-1 py-2 rounded-xl text-white text-xs font-semibold disabled:opacity-50" style={{ backgroundColor: '#0C4E3A' }}>
                            {paymentLoading ? '...' : course.price?.upfront > 0 ? `Pay €${course.price.upfront}` : 'Pay Tuition'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => handleAddCourse(course.id)} disabled={addingCourse === course.id} className="w-full py-2 rounded-xl text-white text-sm font-semibold disabled:opacity-50" style={{ backgroundColor: '#0C4E3A' }}>
                        {addingCourse === course.id ? 'Adding…' : '+ Add to Dashboard'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  function StudyView() {
    const weekGroups = groupByWeek(materials);
    const weeks = Object.keys(weekGroups).sort((a, b) => Number(a) - Number(b));
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-xl font-bold text-gray-900">Study Room</h2>
          {courses.length > 0 && (
            <select value={selectedCourse?.id || ''} onChange={(e) => { const c = courses.find((x) => x.id === e.target.value); if (c) loadCourseData(c); }} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-700">
              <option value="">Select a course</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          )}
        </div>
        {!selectedCourse ? (
          <div className="bg-white rounded-xl p-8 text-center border border-dashed border-gray-200"><Monitor size={40} className="mx-auto text-gray-300 mb-3" /><p className="text-gray-500">Select a course above to start studying.</p></div>
        ) : (() => {
          const enrollment = enrollments.find((e) => e.course_id === selectedCourse.id);
          const isPaid = enrollment?.payment_status === 'paid' || !enrollment;
          if (!isPaid) return (
            <div className="bg-white rounded-xl p-10 text-center border border-gray-100 shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-50 flex items-center justify-center">
                <CreditCard size={28} className="text-yellow-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Tuition Payment Required</h3>
              <p className="text-sm text-gray-500 mb-5 max-w-sm mx-auto">Pay your tuition fee to unlock all materials, assignments, and quizzes for <strong>{selectedCourse.title}</strong>.</p>
              <button onClick={() => handlePayment(selectedCourse.id)} disabled={paymentLoading} className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-50" style={{ backgroundColor: '#0C4E3A' }}>
                {paymentLoading ? 'Starting…' : 'Pay Tuition Now'}
              </button>
            </div>
          );
          return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 space-y-3">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-bold" style={{ color: '#0C4E3A' }}>{progress[selectedCourse.id] ?? 0}%</span>
                </div>
                <div className="bg-gray-100 rounded-full h-2">
                  <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${progress[selectedCourse.id] ?? 0}%`, backgroundColor: '#D4F542' }} />
                </div>
              </div>
              {weeks.length === 0 ? (
                <div className="bg-white rounded-xl p-6 text-center border border-dashed border-gray-200"><p className="text-gray-400 text-sm">No materials available yet.</p></div>
              ) : weeks.map((week) => (
                <div key={week} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white" style={{ backgroundColor: '#0C4E3A' }}>Week {week}</div>
                  <div className="divide-y divide-gray-50">
                    {weekGroups[week].map((mat) => (
                      <button key={mat.id} onClick={() => selectMaterial(mat)} className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors ${selectedMaterial?.id === mat.id ? 'bg-lime-50' : ''}`}>
                        <div className="mt-0.5 flex-shrink-0">{mat.completed ? <CheckCircle size={16} className="text-green-500" /> : <Circle size={16} className="text-gray-300" />}</div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5"><TypeIcon type={mat.type} /><span className="text-xs text-gray-400 capitalize">{mat.type}</span></div>
                          <p className="text-sm font-medium text-gray-800 truncate">{mat.title}</p>
                          {mat.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{mat.description}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-2">
              {!selectedMaterial ? (
                <div className="bg-white rounded-xl p-8 text-center border border-dashed border-gray-200 min-h-64 flex flex-col items-center justify-center"><BookOpen size={40} className="text-gray-300 mb-3" /><p className="text-gray-500">Select a lesson to begin.</p></div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5"><TypeIcon type={selectedMaterial.type} /><span className="text-xs text-gray-400 capitalize">{selectedMaterial.type}</span></div>
                      <h3 className="font-semibold text-gray-900">{selectedMaterial.title}</h3>
                    </div>
                    {selectedMaterial.completed
                      ? <span className="flex items-center gap-1 text-green-600 text-sm font-medium"><CheckCircle size={16} /> Completed</span>
                      : <button onClick={() => handleMarkComplete(selectedMaterial)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: '#0C4E3A' }}><CheckCircle size={14} /> Mark Done</button>
                    }
                  </div>
                  <div className="p-5">
                    {selectedMaterial.description && <p className="text-gray-600 text-sm mb-4">{selectedMaterial.description}</p>}
                    {selectedMaterial.type === 'video' && selectedMaterial.url && (
                      isYouTube(selectedMaterial.url)
                        ? <div className="aspect-video rounded-lg overflow-hidden bg-black"><iframe src={getYouTubeEmbedUrl(selectedMaterial.url)} title={selectedMaterial.title} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>
                        : <video src={selectedMaterial.url} controls className="w-full rounded-lg bg-black" />
                    )}
                    {selectedMaterial.type === 'pdf' && selectedMaterial.url && (
                      <a href={selectedMaterial.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium text-sm" style={{ backgroundColor: '#0C4E3A' }}><FileText size={16} /> Open PDF <ExternalLink size={14} /></a>
                    )}
                    {selectedMaterial.type === 'link' && selectedMaterial.url && (
                      <a href={selectedMaterial.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium text-sm" style={{ backgroundColor: '#0C4E3A' }}><LinkIcon size={16} /> Open Link <ExternalLink size={14} /></a>
                    )}
                    {selectedMaterial.type !== 'video' && selectedMaterial.type !== 'pdf' && selectedMaterial.type !== 'link' && selectedMaterial.url && (
                      <a href={selectedMaterial.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium text-sm" style={{ backgroundColor: '#0C4E3A' }}><File size={16} /> Open File <ExternalLink size={14} /></a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
        })()}
      </div>
    );
  }

  function QuizView() {
    if (quizResult) {
      const pct = quizResult.percentage ?? quizResult.score ?? 0;
      const passed = quizResult.passed ?? pct >= 60;
      return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
              {passed ? <Award size={40} className="text-green-600" /> : <XCircle size={40} className="text-red-500" />}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{passed ? 'Congratulations!' : 'Quiz Complete'}</h3>
            <p className="text-gray-500 mb-4">{passed ? 'You passed this quiz.' : 'You did not reach the passing score.'}</p>
            <div className="text-5xl font-black mb-2" style={{ color: passed ? '#0C4E3A' : '#dc2626' }}>{Math.round(pct)}%</div>
            <p className="text-sm text-gray-400">{quizResult.score} / {quizResult.total_points} points</p>
            {Array.isArray(quizResult.answers) && quizResult.answers.length > 0 && (
              <div className="mt-6 text-left space-y-3">
                <h4 className="font-semibold text-gray-700 text-sm">Answer Breakdown</h4>
                {quizResult.answers.map((ans, i) => (
                  <div key={i} className={`rounded-xl p-4 border ${ans.is_correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <p className="text-sm font-medium text-gray-800 mb-1">Q{i + 1}: {ans.question_text}</p>
                    <p className="text-xs text-gray-500">Your answer: <span className="font-medium">{ans.selected_answer ?? '(none)'}</span></p>
                    {!ans.is_correct && <p className="text-xs text-green-700 mt-0.5">Correct: <span className="font-medium">{ans.correct_answer}</span></p>}
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => { setQuizResult(null); setActiveQuiz(null); }} className="mt-6 px-6 py-2 rounded-xl text-white font-medium" style={{ backgroundColor: '#0C4E3A' }}>Back to Quizzes</button>
          </div>
        </motion.div>
      );
    }

    if (activeQuiz) {
      const questions = activeQuiz.questions || [];
      return (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">{activeQuiz.title}</h3>
            {quizTimeLeft !== null && (
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold ${quizTimeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-lime-100 text-green-800'}`}>
                <Clock size={14} />{formatTimer(quizTimeLeft)}
              </div>
            )}
          </div>
          <div className="space-y-4">
            {questions.map((q, qi) => {
              const options = q.options || q.choices || [];
              return (
                <div key={q.id || qi} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <p className="font-medium text-gray-900 mb-3"><span className="text-sm text-gray-400 mr-2">Q{qi + 1}.</span>{q.question || q.text}</p>
                  <div className="space-y-2">
                    {options.map((opt, oi) => {
                      const optVal = typeof opt === 'string' ? opt : opt.text || opt.value;
                      const isSelected = quizAnswers[q.id ?? qi] === optVal;
                      return (
                        <label key={oi} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                          <input type="radio" name={`q-${q.id ?? qi}`} value={optVal} checked={isSelected} onChange={() => setQuizAnswers((prev) => ({ ...prev, [q.id ?? qi]: optVal }))} className="accent-green-600" />
                          <span className="text-sm text-gray-800">{optVal}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-3">
            <button onClick={() => { clearTimeout(timerRef.current); setActiveQuiz(null); setQuizTimeLeft(null); }} className="px-5 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">Cancel</button>
            <button onClick={handleSubmitQuiz} className="flex-1 py-2 rounded-xl text-white font-bold text-sm" style={{ backgroundColor: '#0C4E3A' }}>Submit Quiz</button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-xl font-bold text-gray-900">Quizzes</h2>
          {courses.length > 0 && (
            <select value={selectedCourse?.id || ''} onChange={(e) => { const c = courses.find((x) => x.id === e.target.value); if (c) loadCourseData(c); }} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-700">
              <option value="">Select a course</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          )}
        </div>
        {!selectedCourse ? (
          <div className="bg-white rounded-xl p-8 text-center border border-dashed border-gray-200"><ClipboardList size={40} className="mx-auto text-gray-300 mb-3" /><p className="text-gray-500">Select a course to view its quizzes.</p></div>
        ) : quizzes.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-dashed border-gray-200"><p className="text-gray-400">No quizzes available for this course yet.</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quizzes.map((quiz) => {
              const existingResult = myResults.find((r) => r.quiz_id === quiz.id);
              const pct = existingResult?.percentage ?? existingResult?.score;
              const passed = existingResult?.passed ?? (pct != null && pct >= 60);
              return (
                <div key={quiz.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div><h4 className="font-semibold text-gray-900">{quiz.title}</h4>{quiz.description && <p className="text-xs text-gray-400 mt-0.5">{quiz.description}</p>}</div>
                    {existingResult && <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ml-2 ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{passed ? 'Passed' : 'Failed'}{pct != null ? ` · ${Math.round(pct)}%` : ''}</span>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                    {quiz.time_limit_minutes && <span className="flex items-center gap-1"><Clock size={12} /> {quiz.time_limit_minutes} min</span>}
                  </div>
                  <button onClick={() => startQuiz(quiz)} className="w-full py-2 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-opacity" style={{ backgroundColor: '#0C4E3A' }}>
                    {existingResult ? 'Retake Quiz' : 'Start Quiz'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
        {myResults.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 mt-6">All My Results</h3>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y">
              {myResults.map((r, i) => {
                const pct = r.percentage ?? r.score ?? 0;
                const pass = r.passed ?? pct >= 60;
                return (
                  <div key={r.id || i} className="flex items-center justify-between px-4 py-3">
                    <div><p className="text-sm font-medium text-gray-800">{r.quiz_title || `Quiz ${i + 1}`}</p><p className="text-xs text-gray-400">{r.course_title || ''}</p></div>
                    <div className="flex items-center gap-2">
                      {pass ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-400" />}
                      <span className={`text-sm font-bold ${pass ? 'text-green-700' : 'text-red-600'}`}>{Math.round(pct)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  function PaymentsView() {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Payments</h2>
        {enrollments.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-dashed border-gray-200"><CreditCard size={40} className="mx-auto text-gray-300 mb-3" /><p className="text-gray-500">No enrollment payment records found.</p></div>
        ) : (
          <div className="space-y-4">
            {enrollments.map((enrollment, i) => {
              const isPaid = enrollment.payment_status === 'paid';
              const isOverdue = enrollment.is_overdue === true;
              const courseName = enrollment.course_title || courses.find((c) => c.id === enrollment.course_id)?.title || `Course ${i + 1}`;
              const plan = enrollment.payment_plan || 'one-time';
              const amount = enrollment.amount_due ?? enrollment.balance ?? enrollment.course_price ?? null;
              return (
                <div key={enrollment.id || i} className={`bg-white rounded-xl shadow-sm border p-5 ${isOverdue ? 'border-red-300' : 'border-gray-100'}`}>
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{courseName}</h4>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        <span>Plan: <span className="font-medium text-gray-700 capitalize">{plan}</span></span>
                        {amount != null && <span>Amount: <span className="font-medium text-gray-700">€{Number(amount).toFixed(2)}</span></span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${isPaid ? 'bg-green-100 text-green-700' : isOverdue ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'}`}>
                        {isPaid ? 'Paid' : isOverdue ? 'Overdue' : 'Unpaid'}
                      </span>
                      {!isPaid && (
                        <button disabled={paymentLoading} onClick={() => handlePayment(enrollment)} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50" style={{ backgroundColor: isOverdue ? '#dc2626' : '#0C4E3A' }}>
                          <CreditCard size={14} />{paymentLoading ? 'Redirecting...' : 'Make Payment'}
                        </button>
                      )}
                    </div>
                  </div>
                  {isOverdue && <div className="mt-3 flex items-center gap-2 text-red-600 text-xs"><AlertCircle size={14} />Payment overdue. Please pay to maintain course access.</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  function ProfileView() {
    const fileInputRef = useRef(null);
    return (
      <div className="max-w-lg space-y-5">
        <h2 className="text-xl font-bold text-gray-900">My Profile</h2>
        <form onSubmit={handleProfileSave} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border-2 border-gray-200">
                {profileForm.profilePicture ? <img src={profileForm.profilePicture} alt="Profile" className="w-full h-full object-cover" /> : <User size={32} className="text-gray-400" />}
              </div>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full text-white flex items-center justify-center shadow" style={{ backgroundColor: '#0C4E3A' }}><Upload size={13} /></button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleProfileImageUpload} />
            </div>
            <div>
              <p className="font-semibold text-gray-800">{`${profileForm.first_name} ${profileForm.last_name}`.trim() || user?.email}</p>
              <p className="text-sm text-gray-400">{user?.email}</p>
              <p className="text-xs text-gray-400 capitalize mt-0.5">{user?.role || 'student'}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input type="text" value={profileForm.first_name} onChange={(e) => setProfileForm((p) => ({ ...p, first_name: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input type="text" value={profileForm.last_name} onChange={(e) => setProfileForm((p) => ({ ...p, last_name: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700" />
          </div>
          {profileMsg && <p className={`text-sm font-medium ${profileMsg.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{profileMsg}</p>}
          <button type="submit" disabled={profileSaving} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-semibold disabled:opacity-50" style={{ backgroundColor: '#0C4E3A' }}>
            <Save size={16} />{profileSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    );
  }

  // ─── SIDEBAR COMPONENT ────────────────────────────────────────────────────

  function SidebarContent({ collapsed }) {
    return (
      <div className="flex flex-col h-full">
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
          <img src="/images/gitb-logo.png" alt="GITB" className="w-8 h-8 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
          {!collapsed && <div><p className="text-white font-bold text-sm">GITB Academy</p><p className="text-green-300 text-xs">Student Portal</p></div>}
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = activeView === id;
            return (
              <button key={id} onClick={() => { setActiveView(id); setMobileOpen(false); }} title={collapsed ? label : undefined} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${collapsed ? 'justify-center' : ''}`} style={active ? { backgroundColor: '#D4F542', color: '#0C4E3A' } : { color: 'rgba(255,255,255,0.8)' }}>
                <Icon size={18} />
                {!collapsed && <span>{label}</span>}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10">
          {!collapsed && (
            <div className="px-2 py-2 mb-1">
              <p className="text-white text-xs font-medium truncate">{`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email}</p>
              <p className="text-green-300 text-xs truncate">{user?.email}</p>
            </div>
          )}
          <button onClick={handleLogout} title={collapsed ? 'Logout' : undefined} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-white/10 transition-all ${collapsed ? 'justify-center' : ''}`} style={{ color: 'rgba(255,255,255,0.7)' }}>
            <LogOut size={18} />{!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    );
  }

  // ─── LOADING ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-3" style={{ borderColor: '#0C4E3A', borderTopColor: 'transparent' }} />
          <p className="text-gray-500 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col fixed top-0 left-0 h-full z-30 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'}`}
        style={{ backgroundColor: '#0C4E3A', backgroundImage: 'url(/images/sidebar.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundBlendMode: 'overlay' }}
      >
        <SidebarContent collapsed={!sidebarOpen} />
        <button
          onClick={() => setSidebarOpen((o) => !o)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors z-10"
        >
          {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-black/50 z-40 md:hidden" />
            <motion.aside initial={{ x: -288 }} animate={{ x: 0 }} exit={{ x: -288 }} transition={{ type: 'tween', duration: 0.25 }} className="fixed top-0 left-0 h-full w-72 z-50 flex flex-col md:hidden" style={{ backgroundColor: '#0C4E3A' }}>
              <SidebarContent collapsed={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-16'}`}>
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center gap-3">
          <button className="md:hidden p-1.5 rounded-lg text-gray-600 hover:bg-gray-100" onClick={() => setMobileOpen((o) => !o)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="font-bold text-gray-900 text-base flex-1 capitalize">{navItems.find((n) => n.id === activeView)?.label ?? 'Dashboard'}</h1>
          {selectedCourse && (activeView === 'study' || activeView === 'quizzes') && (
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full" style={{ backgroundColor: '#D4F542', color: '#0C4E3A' }}>
              <BookOpen size={12} />{selectedCourse.title}
            </span>
          )}
          <button onClick={() => setActiveView('profile')} className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border-2 border-gray-200 hover:border-green-700 transition-colors flex-shrink-0">
            {profileForm.profilePicture ? <img src={profileForm.profilePicture} alt="" className="w-full h-full object-cover" /> : <User size={16} className="text-gray-500" />}
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-4 md:px-6 py-6">
          {error && (
            <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span className="flex-1">{error}</span>
              <button onClick={() => setError('')} className="ml-2 text-red-400 hover:text-red-600"><X size={14} /></button>
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div key={activeView} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
              {activeView === 'dashboard' && <DashboardView />}
              {activeView === 'browse' && <BrowseCoursesView />}
              {activeView === 'study' && <StudyView />}
              {activeView === 'quizzes' && <QuizView />}
              {activeView === 'payments' && <PaymentsView />}
              {activeView === 'profile' && <ProfileView />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
