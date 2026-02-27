import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, BookOpen, FileText, CheckCircle, XCircle, Clock, LogOut, Shield,
  TrendingUp, UserCheck, LayoutDashboard, CreditCard, Search, Plus, Trash2,
  Edit, Save, Image as ImageIcon, RefreshCw, Settings as SettingsIcon, User,
  ChevronLeft, ChevronRight, Menu, X, Upload, DollarSign, Tag, AlertCircle,
  ClipboardList, Eye, EyeOff, Download as DownloadIcon, BarChart2, Globe,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getAdminDashboard, getApplications, getAdminCourses, approveApplication,
  rejectApplication, getUsers, createCourse, updateCourse, getSystemSettings,
  updateSystemSettings, updateProfile, getCourseMaterials, addCourseMaterial,
  uploadFile, createUser, adminEnrollStudent,
  assignCourseToTeacher, removeTeacherCourse, sendTestEmails,
} from '../services/api';

const API_BASE = import.meta.env.VITE_API_BASE || '';

const SIDEBAR_ITEMS = [
  { id: 'overview',   label: 'Overview',    icon: LayoutDashboard },
  { id: 'admissions', label: 'Admissions',  icon: FileText },
  { id: 'courses',    label: 'Courses',     icon: BookOpen },
  { id: 'pricing',    label: 'Pricing',     icon: Tag },
  { id: 'students',   label: 'Students',    icon: Users },
  { id: 'staff',      label: 'Staff',       icon: UserCheck },
  { id: 'finance',    label: 'Finance',     icon: CreditCard },
  { id: 'settings',   label: 'Settings',    icon: SettingsIcon },
];

function Badge({ status }) {
  const map = {
    pending:  'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    paid:     'bg-blue-100 text-blue-700',
    unpaid:   'bg-red-100 text-red-700',
    active:   'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-500',
    banned:   'bg-black text-white',
  };
  return (
    <span className={`text-[10px] uppercase tracking-wide font-bold px-2 py-0.5 rounded-full ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
          <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500 font-medium">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}><Icon size={18} /></div>
      </div>
      <p className="text-3xl font-black text-gray-900">{value ?? '—'}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, token, logout, isAuthenticated } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [courses, setCourses] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [systemSettings, setSystemSettings] = useState({ application_fee: 50 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [appFilter, setAppFilter] = useState('all');
  const [uploading, setUploading] = useState(false);

  // Course modal
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  // Pricing modal
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [pricingCourse, setPricingCourse] = useState(null);
  const [pricingForm, setPricingForm] = useState({ price: 0, monthly_price: 0, payment_options: ['one_time'] });

  // Materials modal
  const [isMaterialsModalOpen, setIsMaterialsModalOpen] = useState(false);
  const [selectedCourseForMaterials, setSelectedCourseForMaterials] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [newMaterial, setNewMaterial] = useState({ title: '', type: 'video', url: '', description: '', week: 1, day: null, period_type: 'week' });

  // Quiz modal
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [selectedCourseForQuiz, setSelectedCourseForQuiz] = useState(null);
  const [courseQuizzes, setCourseQuizzes] = useState([]);
  const [newQuiz, setNewQuiz] = useState({ title: '', description: '', time_limit_minutes: 30, questions: [] });
  const [newQuestion, setNewQuestion] = useState({ question: '', options: ['', '', '', ''], correct_answer: '', points: 1 });

  // Student/user edit modal
  const [isUserEditOpen, setIsUserEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Create user modal
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({ first_name: '', last_name: '', email: '', password: '', role: 'student', department: '' });

  // Enroll student modal
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [enrollUserId, setEnrollUserId] = useState('');
  const [enrollUserName, setEnrollUserName] = useState('');
  const [enrollCourseId, setEnrollCourseId] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [enrollMsg, setEnrollMsg] = useState('');
  const [staffSubTab, setStaffSubTab] = useState('teachers');

  // Assign course to teacher modal
  const [isAssignCourseOpen, setIsAssignCourseOpen] = useState(false);
  const [assignTeacher, setAssignTeacher] = useState(null);
  const [assignCourseId, setAssignCourseId] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignMsg, setAssignMsg] = useState('');

  // Test emails
  const [testEmailSending, setTestEmailSending] = useState(false);
  const [testEmailMsg, setTestEmailMsg] = useState('');

  // Material upload ref
  const materialFileRef = useRef(null);
  const [materialUploading, setMaterialUploading] = useState(false);

  // Admin profile modal
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ first_name: '', last_name: '', phone: '', profilePicture: '' });

  const fileInputRef = useRef(null);
  const profileFileRef = useRef(null);
  const userFileRef = useRef(null);

  // ─── DATA LOADING ──────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [dashRes, appRes, courseRes, userRes, settingsRes] = await Promise.allSettled([
        getAdminDashboard(token), getApplications(token), getAdminCourses(token),
        getUsers(token), getSystemSettings(token),
      ]);
      if (dashRes.status === 'fulfilled') setStats(dashRes.value);
      if (appRes.status === 'fulfilled') setApplications(Array.isArray(appRes.value) ? appRes.value : []);
      if (courseRes.status === 'fulfilled') setCourses(Array.isArray(courseRes.value) ? courseRes.value : []);
      if (userRes.status === 'fulfilled') setAllUsers(Array.isArray(userRes.value) ? userRes.value : []);
      if (settingsRes.status === 'fulfilled') setSystemSettings(settingsRes.value || {});
      if (dashRes.status === 'rejected' && dashRes.reason?.message?.includes('token')) {
        logout(); navigate('/login');
      }
    } catch { setError('Failed to load data. Please refresh.'); }
    finally { setLoading(false); }
  }, [token, logout, navigate]);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (user) setProfileForm({ first_name: user.first_name || '', last_name: user.last_name || '', phone: user.phone || '', profilePicture: user.profilePicture || user.profile_picture || '' });
    fetchData();
  }, [isAuthenticated, navigate, fetchData, user]);

  // ─── FILE UPLOAD ───────────────────────────────────────────────────────────

  async function handleFileUpload(file, target) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('File exceeds 5 MB limit.'); return; }
    try {
      setUploading(true);
      const res = await uploadFile(token, file);
      if (target === 'course') setEditingCourse((p) => ({ ...p, img: res.url, image_url: res.url }));
      if (target === 'profile') setProfileForm((p) => ({ ...p, profilePicture: res.url }));
      if (target === 'user') setEditingUser((p) => ({ ...p, profilePicture: res.url }));
    } catch (err) { alert(err.message || 'Upload failed'); }
    finally { setUploading(false); }
  }

  // ─── COURSES ───────────────────────────────────────────────────────────────

  function openCourseModal(course = null) {
    setEditingCourse(course ? { ...course } : { title: '', category: 'Technology', description: '', duration: '', level: '', price: 0, monthly_price: 0, payment_options: ['one_time'], is_active: true, img: '' });
    setIsCourseModalOpen(true);
  }

  async function saveCourse(e) {
    e.preventDefault();
    try {
      if (editingCourse.id || editingCourse._id) {
        await updateCourse(token, editingCourse.id || editingCourse._id, editingCourse);
      } else {
        await createCourse(token, editingCourse);
      }
      setIsCourseModalOpen(false);
      fetchData();
    } catch (err) { alert(err.message); }
  }

  // ─── PRICING ───────────────────────────────────────────────────────────────

  function openPricingModal(course) {
    setPricingCourse(course);
    setPricingForm({
      price: course.price?.upfront ?? course.price ?? 0,
      monthly_price: course.price?.monthly ?? course.monthly_price ?? 0,
      payment_options: course.payment_options || ['one_time'],
    });
    setIsPricingModalOpen(true);
  }

  async function savePricing(e) {
    e.preventDefault();
    try {
      const id = pricingCourse.id || pricingCourse._id;
      await fetch(`${API_BASE}/api/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ price: Number(pricingForm.price), monthly_price: Number(pricingForm.monthly_price), payment_options: pricingForm.payment_options }),
      });
      setIsPricingModalOpen(false);
      fetchData();
    } catch (err) { alert(err.message); }
  }

  function togglePaymentOption(opt) {
    setPricingForm((p) => ({
      ...p,
      payment_options: p.payment_options.includes(opt)
        ? p.payment_options.filter((o) => o !== opt)
        : [...p.payment_options, opt],
    }));
  }

  // ─── MATERIALS ─────────────────────────────────────────────────────────────

  async function openMaterialsModal(course) {
    setSelectedCourseForMaterials(course);
    setIsMaterialsModalOpen(true);
    try {
      const res = await getCourseMaterials(token, course.id || course._id);
      setMaterials(Array.isArray(res) ? res : []);
    } catch { setMaterials([]); }
  }

  async function handleAddMaterial(e) {
    e.preventDefault();
    try {
      await addCourseMaterial(token, selectedCourseForMaterials.id || selectedCourseForMaterials._id, newMaterial);
      setNewMaterial({ title: '', type: 'video', url: '', description: '', week: 1, day: null, period_type: 'week' });
      const res = await getCourseMaterials(token, selectedCourseForMaterials.id || selectedCourseForMaterials._id);
      setMaterials(Array.isArray(res) ? res : []);
    } catch (err) { alert(err.message); }
  }

  // ─── QUIZZES ───────────────────────────────────────────────────────────────

  async function openQuizModal(course) {
    setSelectedCourseForQuiz(course);
    setIsQuizModalOpen(true);
    setNewQuiz({ title: '', description: '', time_limit_minutes: 30, questions: [] });
    try {
      const res = await fetch(`${API_BASE}/api/admin/courses/${course.id || course._id}/quizzes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCourseQuizzes(Array.isArray(data) ? data : []);
    } catch { setCourseQuizzes([]); }
  }

  function addQuestion() {
    if (!newQuestion.question || !newQuestion.correct_answer) { alert('Question text and correct answer are required.'); return; }
    setNewQuiz((p) => ({ ...p, questions: [...p.questions, { ...newQuestion, id: crypto.randomUUID() }] }));
    setNewQuestion({ question: '', options: ['', '', '', ''], correct_answer: '', points: 1 });
  }

  function removeQuestion(idx) {
    setNewQuiz((p) => ({ ...p, questions: p.questions.filter((_, i) => i !== idx) }));
  }

  async function saveQuiz(e) {
    e.preventDefault();
    if (!newQuiz.title || newQuiz.questions.length === 0) { alert('Quiz needs a title and at least one question.'); return; }
    try {
      await fetch(`${API_BASE}/api/admin/quizzes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...newQuiz, course_id: selectedCourseForQuiz.id || selectedCourseForQuiz._id }),
      });
      const res = await fetch(`${API_BASE}/api/admin/courses/${selectedCourseForQuiz.id || selectedCourseForQuiz._id}/quizzes`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setCourseQuizzes(Array.isArray(data) ? data : []);
      setNewQuiz({ title: '', description: '', time_limit_minutes: 30, questions: [] });
      alert('Quiz created successfully!');
    } catch (err) { alert(err.message); }
  }

  async function deleteQuiz(quizId) {
    if (!confirm('Delete this quiz?')) return;
    try {
      await fetch(`${API_BASE}/api/admin/quizzes/${quizId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      setCourseQuizzes((p) => p.filter((q) => q.id !== quizId));
    } catch (err) { alert(err.message); }
  }

  // ─── ENROLL STUDENT ────────────────────────────────────────────────────────

  function openEnrollModal(user) {
    setEnrollUserId(user.id);
    setEnrollUserName(`${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email);
    setEnrollCourseId('');
    setEnrollMsg('');
    setIsEnrollOpen(true);
  }

  async function handleEnroll(e) {
    e.preventDefault();
    if (!enrollCourseId) return;
    setEnrolling(true); setEnrollMsg('');
    try {
      await adminEnrollStudent(token, enrollUserId, enrollCourseId);
      setEnrollMsg('Student enrolled successfully!');
      setEnrollCourseId('');
    } catch (err) {
      setEnrollMsg(err.message || 'Enrollment failed.');
    } finally {
      setEnrolling(false);
    }
  }

  // ─── MATERIAL FILE UPLOAD ──────────────────────────────────────────────────

  async function handleMaterialFileUpload(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('File exceeds 5 MB limit.'); return; }
    setMaterialUploading(true);
    try {
      const res = await uploadFile(token, file);
      const ext = file.name.split('.').pop().toLowerCase();
      const detectedType = ['mp4', 'webm', 'mov'].includes(ext) ? 'video' : ['pdf'].includes(ext) ? 'pdf' : 'document';
      setNewMaterial((p) => ({ ...p, url: res.url, type: p.type || detectedType, title: p.title || file.name.replace(/\.[^/.]+$/, '') }));
    } catch (err) { alert(err.message || 'Upload failed'); }
    finally { setMaterialUploading(false); }
  }

  // ─── ASSIGN COURSE TO TEACHER ─────────────────────────────────────────────

  function openAssignCourseModal(teacher) {
    setAssignTeacher(teacher);
    setAssignCourseId('');
    setAssignMsg('');
    setIsAssignCourseOpen(true);
  }

  async function handleAssignCourse(e) {
    e.preventDefault();
    if (!assignCourseId) return;
    setAssigning(true); setAssignMsg('');
    try {
      const res = await assignCourseToTeacher(token, assignTeacher.id, assignCourseId);
      setAssignMsg(`✓ ${res.course_title} assigned! Notification email sent.`);
      setAssignCourseId('');
      fetchData();
    } catch (err) {
      setAssignMsg(err.message || 'Failed to assign course.');
    } finally { setAssigning(false); }
  }

  async function handleRemoveTeacherCourse(teacher, courseId) {
    if (!confirm('Remove this course assignment?')) return;
    try {
      await removeTeacherCourse(token, teacher.id, courseId);
      fetchData();
    } catch (err) { alert(err.message || 'Failed to remove.'); }
  }

  async function handleSendTestEmails() {
    setTestEmailSending(true); setTestEmailMsg('');
    try {
      await sendTestEmails(token, 'taiwojos2@yahoo.com');
      setTestEmailMsg('✓ 5 test emails sent to taiwojos2@yahoo.com');
    } catch (err) {
      setTestEmailMsg('Error: ' + (err.message || 'Failed'));
    } finally { setTestEmailSending(false); }
  }

  // ─── APPLICATIONS ─────────────────────────────────────────────────────────

  async function handleApprove(appId) {
    if (!confirm('Approve this application? A user account will be created.')) return;
    try { await approveApplication(token, appId); fetchData(); }
    catch (err) { alert(err.message); }
  }

  async function handleReject(appId) {
    if (!confirm('Reject this application?')) return;
    try { await rejectApplication(token, appId); fetchData(); }
    catch (err) { alert(err.message); }
  }

  // ─── USERS ─────────────────────────────────────────────────────────────────

  function openUserEdit(u) {
    setEditingUser({ ...u, password: '' });
    setIsUserEditOpen(true);
  }

  async function saveUserEdit(e) {
    e.preventDefault();
    try {
      const payload = { ...editingUser };
      if (!payload.password) delete payload.password;
      await fetch(`${API_BASE}/api/users/${editingUser.id || editingUser._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      setIsUserEditOpen(false);
      fetchData();
    } catch (err) { alert(err.message); }
  }

  async function saveNewUser(e) {
    e.preventDefault();
    try {
      await createUser(token, newUser);
      setIsCreateUserOpen(false);
      setNewUser({ first_name: '', last_name: '', email: '', password: '', role: 'student', department: '' });
      fetchData();
    } catch (err) { alert(err.message); }
  }

  async function toggleLockUser(u) {
    const action = u.account_status === 'locked' ? 'unlock' : 'lock';
    if (!confirm(`${action === 'lock' ? 'Lock' : 'Unlock'} this account?`)) return;
    try {
      await fetch(`${API_BASE}/api/users/${u.id || u._id}/${action}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } });
      fetchData();
    } catch (err) { alert(err.message); }
  }

  // ─── ADMIN PROFILE ─────────────────────────────────────────────────────────

  async function saveProfile(e) {
    e.preventDefault();
    try {
      await updateProfile(token, profileForm);
      setIsProfileModalOpen(false);
      alert('Profile updated successfully.');
    } catch (err) { alert(err.message); }
  }

  // ─── SETTINGS ──────────────────────────────────────────────────────────────

  async function saveSettings(e) {
    e.preventDefault();
    try {
      await updateSystemSettings(token, systemSettings);
      alert('Settings saved.');
    } catch (err) { alert(err.message); }
  }

  // ─── CSV EXPORT ────────────────────────────────────────────────────────────

  function downloadCSV(data, filename) {
    if (!data?.length) return;
    const keys = Object.keys(data[0]);
    const csv = [keys.join(','), ...data.map((r) => keys.map((k) => JSON.stringify(r[k] ?? '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${filename}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  if (!isAuthenticated) return null;

  // ─── FILTERED DATA ─────────────────────────────────────────────────────────

  const filteredApps = applications.filter((a) => {
    const matchSearch = !searchTerm || `${a.first_name} ${a.last_name} ${a.email}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = appFilter === 'all' || a.status === appFilter;
    return matchSearch && matchStatus;
  });

  const students = allUsers.filter((u) => u.role === 'student' || !u.role);
  const admins = allUsers.filter((u) => ['admin', 'super_admin', 'sub_admin'].includes(u.role));
  const staffOnly = allUsers.filter((u) => ['staff', 'registrar'].includes(u.role));
  const teacherList = allUsers.filter((u) => ['teacher', 'lecturer'].includes(u.role));
  const filteredStudents = students.filter((u) => !searchTerm || `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredAdmins = admins.filter((u) => !searchTerm || `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredStaffOnly = staffOnly.filter((u) => !searchTerm || `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredTeachers = teacherList.filter((u) => !searchTerm || `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(searchTerm.toLowerCase()));

  // ─── SIDEBAR ───────────────────────────────────────────────────────────────

  function SidebarContent({ collapsed }) {
    return (
      <div className="flex flex-col h-full">
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
          <img src="/images/gitb-logo.png" alt="GITB" className="w-8 h-8 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
          {!collapsed && <div><p className="text-white font-bold text-sm">GITB Admin</p><p className="text-green-300 text-xs">Portal</p></div>}
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {SIDEBAR_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button key={id} onClick={() => { setActiveTab(id); setMobileOpen(false); }} title={collapsed ? label : undefined} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${collapsed ? 'justify-center' : ''}`} style={active ? { backgroundColor: '#D4F542', color: '#0B3B2C' } : { color: 'rgba(255,255,255,0.8)' }}>
                <Icon size={18} />{!collapsed && <span>{label}</span>}
              </button>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10">
          {!collapsed && (
            <button onClick={() => setIsProfileModalOpen(true)} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 transition-all mb-1">
              <div className="w-8 h-8 rounded-full bg-white/20 overflow-hidden flex items-center justify-center flex-shrink-0">
                {profileForm.profilePicture ? <img src={profileForm.profilePicture} alt="" className="w-full h-full object-cover" /> : <User size={16} className="text-white" />}
              </div>
              <div className="min-w-0 text-left">
                <p className="text-white text-xs font-medium truncate">{`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email}</p>
                <p className="text-green-300 text-xs truncate">{user?.role || 'admin'}</p>
              </div>
            </button>
          )}
          <button onClick={() => { logout(); navigate('/login'); }} title={collapsed ? 'Logout' : undefined} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-white/10 transition-all ${collapsed ? 'justify-center' : ''}`} style={{ color: 'rgba(255,255,255,0.7)' }}>
            <LogOut size={18} />{!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    );
  }

  // ─── TAB CONTENT ───────────────────────────────────────────────────────────

  function OverviewTab() {
    const pending = applications.filter((a) => a.status === 'pending').length;
    const revenue = stats?.total_revenue ?? 0;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Students" value={stats?.total_students ?? students.length} icon={Users} color="bg-blue-50 text-blue-600" />
          <StatCard label="Active Courses" value={stats?.active_courses ?? courses.filter((c) => c.is_active !== false).length} icon={BookOpen} color="bg-green-50 text-green-600" />
          <StatCard label="Pending Applications" value={pending} icon={Clock} color="bg-yellow-50 text-yellow-600" />
          <StatCard label="Revenue (€)" value={`€${Number(revenue).toLocaleString()}`} icon={DollarSign} color="bg-purple-50 text-purple-600" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Recent Applications</h3>
              <button onClick={() => setActiveTab('admissions')} className="text-xs font-medium" style={{ color: '#0B3B2C' }}>View all</button>
            </div>
            <div className="divide-y divide-gray-50">
              {applications.slice(0, 5).map((app) => (
                <div key={app.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{app.first_name} {app.last_name}</p>
                    <p className="text-xs text-gray-400 truncate">{app.course_title || app.email}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge status={app.status} />
                    {!['approved', 'rejected'].includes(app.status) && (
                      <>
                        <button onClick={() => handleApprove(app.id)} className="text-xs px-2 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 font-medium">Accept</button>
                        <button onClick={() => handleReject(app.id)} className="text-xs px-2 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-medium">Reject</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {applications.length === 0 && <p className="px-5 py-4 text-sm text-gray-400">No applications yet.</p>}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Recent Students</h3>
              <button onClick={() => setActiveTab('students')} className="text-xs font-medium" style={{ color: '#0B3B2C' }}>View all</button>
            </div>
            <div className="divide-y divide-gray-50">
              {students.slice(0, 5).map((s) => (
                <div key={s.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 overflow-hidden flex-shrink-0">
                    {s.profilePicture ? <img src={s.profilePicture} alt="" className="w-full h-full object-cover" /> : (s.first_name?.[0] || 'S')}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{s.first_name} {s.last_name}</p>
                    <p className="text-xs text-gray-400 truncate">{s.email}</p>
                  </div>
                  <Badge status={s.account_status || 'active'} />
                </div>
              ))}
              {students.length === 0 && <p className="px-5 py-4 text-sm text-gray-400">No students yet.</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function AdmissionsTab() {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {['all', 'pending', 'approved', 'rejected'].map((f) => (
              <button key={f} onClick={() => setAppFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors ${appFilter === f ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} style={appFilter === f ? { backgroundColor: '#0B3B2C' } : {}}>
                {f} {f !== 'all' && <span className="ml-1 opacity-70">({applications.filter((a) => a.status === f).length})</span>}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-700 w-48" />
            </div>
            <button onClick={() => downloadCSV(filteredApps, 'applications')} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"><DownloadIcon size={14} /> CSV</button>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b border-gray-100">{['Name', 'Email', 'Course', 'Date', 'Payment', 'Status', 'Actions'].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {filteredApps.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No applications found.</td></tr>}
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{app.first_name} {app.last_name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{app.email}</td>
                    <td className="px-4 py-3 text-gray-700 text-xs max-w-[150px] truncate">{app.course_title || app.course_id}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{app.created_at ? new Date(app.created_at).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3"><Badge status={app.payment_status || 'unpaid'} /></td>
                    <td className="px-4 py-3"><Badge status={app.status} /></td>
                    <td className="px-4 py-3">
                      {!['approved', 'rejected'].includes(app.status) ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleApprove(app.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors">
                            <CheckCircle size={12} /> Accept
                          </button>
                          <button onClick={() => handleReject(app.id)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors">
                            <XCircle size={12} /> Reject
                          </button>
                        </div>
                      ) : (
                        <Badge status={app.status} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  function CoursesTab() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Courses ({courses.length})</h2>
          <button onClick={() => openCourseModal()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ backgroundColor: '#0B3B2C' }}>
            <Plus size={16} /> New Course
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="h-32 overflow-hidden relative">
                <img src={course.img || course.image_url || '/images/course-uiux.jpg'} alt={course.title} className="w-full h-full object-cover" onError={(e) => { e.target.src = '/images/course-uiux.jpg'; }} />
                <div className="absolute top-2 right-2"><Badge status={course.is_active !== false ? 'active' : 'inactive'} /></div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 truncate">{course.title}</h3>
                <p className="text-xs text-gray-400 mb-3 line-clamp-2">{course.description}</p>
                <div className="flex items-center gap-1 mb-3 text-xs text-gray-500">
                  <DollarSign size={12} />
                  <span>€{course.price?.upfront ?? course.price ?? 0} one-time</span>
                  {(course.monthly_price || course.price?.monthly) && <span className="ml-1">/ €{course.monthly_price || course.price?.monthly}/mo</span>}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button onClick={() => openCourseModal(course)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium hover:bg-gray-200"><Edit size={12} /> Edit</button>
                  <button onClick={() => openPricingModal(course)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-yellow-50 text-yellow-700 text-xs font-medium hover:bg-yellow-100"><Tag size={12} /> Pricing</button>
                  <button onClick={() => openMaterialsModal(course)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100"><FileText size={12} /> Materials</button>
                  <button onClick={() => openQuizModal(course)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-50 text-purple-700 text-xs font-medium hover:bg-purple-100"><ClipboardList size={12} /> Quizzes</button>
                </div>
              </div>
            </div>
          ))}
          {courses.length === 0 && <div className="col-span-full text-center py-12 text-gray-400">No courses yet. Create your first course.</div>}
        </div>
      </div>
    );
  }

  function PricingTab() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Pricing Configuration</h2>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4">
          <h3 className="font-semibold text-gray-900 mb-3">Global Settings</h3>
          <form onSubmit={saveSettings} className="flex items-end gap-4 flex-wrap">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Application Fee (€)</label>
              <input type="number" min="0" value={systemSettings.application_fee ?? 50} onChange={(e) => setSystemSettings((p) => ({ ...p, application_fee: Number(e.target.value) }))} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 w-32" />
            </div>
            <button type="submit" className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ backgroundColor: '#0B3B2C' }}>Save Fee</button>
          </form>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start gap-3 mb-4">
                <img src={course.img || course.image_url || '/images/course-uiux.jpg'} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" onError={(e) => { e.target.src = '/images/course-uiux.jpg'; }} />
                <div className="min-w-0"><h4 className="font-semibold text-gray-900 truncate">{course.title}</h4><p className="text-xs text-gray-400">{course.category || course.department}</p></div>
              </div>
              <div className="space-y-2 text-sm mb-3">
                <div className="flex justify-between"><span className="text-gray-500">One-time:</span><span className="font-medium">€{course.price?.upfront ?? course.price ?? 0}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Monthly:</span><span className="font-medium">€{course.monthly_price || course.price?.monthly || 0}/mo</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Options:</span><span className="font-medium capitalize">{(course.payment_options || ['one_time']).join(', ')}</span></div>
              </div>
              <button onClick={() => openPricingModal(course)} className="w-full py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: '#0B3B2C' }}>Edit Pricing</button>
            </div>
          ))}
          {courses.length === 0 && <div className="col-span-full text-center py-12 text-gray-400">No courses to configure.</div>}
        </div>
      </div>
    );
  }

  function UsersTab() {
    const list = filteredStudents;
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <h2 className="text-lg font-bold text-gray-900">Students ({list.length})</h2>
          <div className="flex items-center gap-2">
            <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none w-48" /></div>
            <button onClick={() => { setNewUser((p) => ({ ...p, role: 'student' })); setIsCreateUserOpen(true); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-sm font-medium" style={{ backgroundColor: '#0B3B2C' }}><Plus size={14} /> Add</button>
            <button onClick={() => downloadCSV(list, 'students')} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"><DownloadIcon size={14} /> CSV</button>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b border-gray-100">{['User', 'Email', 'ID', 'Status', 'Actions'].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {list.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No students found.</td></tr>}
                {list.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-500">
                          {u.profilePicture ? <img src={u.profilePicture} alt="" className="w-full h-full object-cover" /> : (u.first_name?.[0] || 'U')}
                        </div>
                        <div><p className="font-medium text-gray-900">{u.first_name} {u.last_name}</p><p className="text-xs text-gray-400 capitalize">{u.role}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs font-mono">{u.student_id || u.id?.slice(0, 8) || '—'}</td>
                    <td className="px-4 py-3"><Badge status={u.account_status || 'active'} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openUserEdit(u)} className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors" title="Edit"><Edit size={14} /></button>
                        <button onClick={() => openEnrollModal(u)} className="px-2 py-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs font-medium transition-colors" title="Enroll in course">+ Enroll</button>
                        <button onClick={() => toggleLockUser(u)} className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${u.account_status === 'locked' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`} title={u.account_status === 'locked' ? 'Unlock' : 'Lock'}>
                          {u.account_status === 'locked' ? 'Unlock' : 'Lock'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  function StaffTab() {
    const SUB_TABS = [
      { id: 'teachers', label: 'Teachers', list: filteredTeachers, role: 'teacher' },
      { id: 'staff',    label: 'Staff',    list: filteredStaffOnly, role: 'staff' },
      { id: 'admins',   label: 'Admins',   list: filteredAdmins, role: 'admin' },
    ];
    const cur = SUB_TABS.find((t) => t.id === staffSubTab) || SUB_TABS[0];
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-1.5">
            {SUB_TABS.map((tab) => (
              <button key={tab.id} onClick={() => setStaffSubTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${staffSubTab === tab.id ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                style={staffSubTab === tab.id ? { backgroundColor: '#0B3B2C' } : {}}>
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${staffSubTab === tab.id ? 'bg-white/25 text-white' : 'bg-white text-gray-500'}`}>{tab.list.length}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none w-48" /></div>
            <button onClick={() => { setNewUser((p) => ({ ...p, role: cur.role })); setIsCreateUserOpen(true); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-white text-sm font-medium" style={{ backgroundColor: '#0B3B2C' }}><Plus size={14} /> Add</button>
            <button onClick={() => downloadCSV(cur.list, cur.id)} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"><DownloadIcon size={14} /> CSV</button>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b border-gray-100">{['User', 'Email', 'Role', 'Status', 'Actions'].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {cur.list.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No {cur.label.toLowerCase()} found.</td></tr>}
                {cur.list.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-500">
                          {u.profilePicture ? <img src={u.profilePicture} alt="" className="w-full h-full object-cover" /> : (u.first_name?.[0] || 'U')}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{u.first_name} {u.last_name}</p>
                          {staffSubTab === 'teachers' && u.assigned_courses?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {u.assigned_courses.map((cid) => {
                                const c = courses.find((x) => x.id === cid || x._id === cid);
                                return c ? (
                                  <span key={cid} className="flex items-center gap-0.5 text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full border border-green-100">
                                    {c.title.length > 20 ? c.title.slice(0, 20) + '…' : c.title}
                                    <button type="button" onClick={() => handleRemoveTeacherCourse(u, cid)} className="text-red-400 hover:text-red-600 ml-0.5 font-bold leading-none">×</button>
                                  </span>
                                ) : null;
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{u.email}</td>
                    <td className="px-4 py-3"><span className="text-xs capitalize bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">{u.role}</span></td>
                    <td className="px-4 py-3"><Badge status={u.account_status || 'active'} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button onClick={() => openUserEdit(u)} className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors" title="Edit"><Edit size={14} /></button>
                        {staffSubTab === 'teachers' && (
                          <button onClick={() => openAssignCourseModal(u)} className="px-2 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 text-xs font-medium transition-colors" title="Assign course">+ Course</button>
                        )}
                        <button onClick={() => toggleLockUser(u)} className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${u.account_status === 'locked' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}`} title={u.account_status === 'locked' ? 'Unlock' : 'Lock'}>
                          {u.account_status === 'locked' ? 'Unlock' : 'Lock'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  function FinanceTab() {
    const paid = applications.filter((a) => a.payment_status === 'paid').length;
    const revenue = stats?.total_revenue ?? 0;
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard label="Total Revenue" value={`€${Number(revenue).toLocaleString()}`} icon={DollarSign} color="bg-green-50 text-green-600" />
          <StatCard label="Paid Applications" value={paid} icon={CheckCircle} color="bg-blue-50 text-blue-600" />
          <StatCard label="Total Applications" value={applications.length} icon={FileText} color="bg-gray-50 text-gray-600" />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Payment Records</h3>
            <button onClick={() => downloadCSV(applications, 'payments')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"><DownloadIcon size={14} /> Export</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b border-gray-100">{['Name', 'Course', 'Amount', 'Payment', 'Status'].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {applications.slice(0, 20).map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{app.first_name} {app.last_name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{app.course_title}</td>
                    <td className="px-4 py-3 text-gray-700">€{systemSettings.application_fee ?? 50}</td>
                    <td className="px-4 py-3"><Badge status={app.payment_status || 'unpaid'} /></td>
                    <td className="px-4 py-3"><Badge status={app.status} /></td>
                  </tr>
                ))}
                {applications.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No payment records.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  function SettingsTab() {
    return (
      <div className="max-w-xl space-y-5">
        <h2 className="text-lg font-bold text-gray-900">System Settings</h2>
        <form onSubmit={saveSettings} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Application Fee (€)</label>
            <input type="number" min="0" value={systemSettings.application_fee ?? 50} onChange={(e) => setSystemSettings((p) => ({ ...p, application_fee: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">University Name</label>
            <input type="text" value={systemSettings.university_name || ''} onChange={(e) => setSystemSettings((p) => ({ ...p, university_name: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700" placeholder="GITB Academy" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
            <input type="email" value={systemSettings.contact_email || ''} onChange={(e) => setSystemSettings((p) => ({ ...p, contact_email: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700" placeholder="admissions@gitb.lt" />
          </div>
          <button type="submit" className="w-full py-2.5 rounded-xl text-white font-semibold text-sm" style={{ backgroundColor: '#0B3B2C' }}>Save Settings</button>
        </form>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Admin Profile</h3>
          <button onClick={() => setIsProfileModalOpen(true)} className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2">
            <User size={16} /> Edit My Profile
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-3">
          <h3 className="font-semibold text-gray-900">Email System Test</h3>
          <p className="text-sm text-gray-500">Send a test email for every notification type to <span className="font-medium text-gray-700">taiwojos2@yahoo.com</span>. Use this to verify Resend is configured correctly.</p>
          <button
            type="button"
            onClick={handleSendTestEmails}
            disabled={testEmailSending}
            className="w-full py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: '#0B3B2C' }}
          >
            {testEmailSending ? <><RefreshCw size={14} className="animate-spin" /> Sending…</> : 'Send Test Emails'}
          </button>
          {testEmailMsg && (
            <p className={`text-sm font-medium px-3 py-2 rounded-lg ${testEmailMsg.startsWith('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{testEmailMsg}</p>
          )}
        </div>
      </div>
    );
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col fixed top-0 left-0 h-full z-30 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`} style={{ backgroundColor: '#0B3B2C', backgroundImage: 'url(/images/sidebar.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundBlendMode: 'overlay' }}>
        <SidebarContent collapsed={!sidebarOpen} />
        <button onClick={() => setSidebarOpen((o) => !o)} className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-gray-900 z-10">
          {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
          <aside className="fixed top-0 left-0 h-full w-72 z-50 flex flex-col lg:hidden" style={{ backgroundColor: '#0B3B2C' }}>
            <SidebarContent collapsed={false} />
          </aside>
        </>
      )}

      {/* Main */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 lg:px-6 py-3 flex items-center gap-3">
          <button className="lg:hidden p-1.5 rounded-lg text-gray-600 hover:bg-gray-100" onClick={() => setMobileOpen((o) => !o)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="font-bold text-gray-900 text-base flex-1 capitalize">{SIDEBAR_ITEMS.find((s) => s.id === activeTab)?.label || 'Dashboard'}</h1>
          <div className="relative hidden md:block">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none w-44" />
          </div>
          <button onClick={() => fetchData()} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100" title="Refresh"><RefreshCw size={16} /></button>
          <button onClick={() => setIsProfileModalOpen(true)} className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
            {profileForm.profilePicture ? <img src={profileForm.profilePicture} alt="" className="w-full h-full object-cover" /> : <User size={16} className="text-gray-500" />}
          </button>
        </header>

        <main className="flex-1 px-4 lg:px-6 py-6">
          {error && (
            <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              <AlertCircle size={16} className="flex-shrink-0" /><span className="flex-1">{error}</span>
              <button onClick={() => setError('')}><X size={14} /></button>
            </div>
          )}
          {loading ? (
            <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 rounded-full animate-spin" style={{ borderColor: '#0B3B2C', borderTopColor: 'transparent' }} /></div>
          ) : (
            <>
              {activeTab === 'overview'   && <OverviewTab />}
              {activeTab === 'admissions' && <AdmissionsTab />}
              {activeTab === 'courses'    && <CoursesTab />}
              {activeTab === 'pricing'    && <PricingTab />}
              {activeTab === 'students'   && <UsersTab />}
              {activeTab === 'staff'      && <StaffTab />}
              {activeTab === 'finance'    && <FinanceTab />}
              {activeTab === 'settings'   && <SettingsTab />}
            </>
          )}
        </main>
      </div>

      {/* ─── MODALS ─────────────────────────────────────────────────────────── */}

      {/* Course Modal */}
      <Modal open={isCourseModalOpen} onClose={() => setIsCourseModalOpen(false)} title={editingCourse?.id ? 'Edit Course' : 'New Course'}>
        {editingCourse && (
          <form onSubmit={saveCourse} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input required value={editingCourse.title} onChange={(e) => setEditingCourse((p) => ({ ...p, title: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input value={editingCourse.category || ''} onChange={(e) => setEditingCourse((p) => ({ ...p, category: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <input value={editingCourse.duration || ''} onChange={(e) => setEditingCourse((p) => ({ ...p, duration: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" placeholder="e.g. 6 months" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows={3} value={editingCourse.description || ''} onChange={(e) => setEditingCourse((p) => ({ ...p, description: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input value={editingCourse.img || editingCourse.image_url || ''} onChange={(e) => setEditingCourse((p) => ({ ...p, img: e.target.value, image_url: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" placeholder="https://..." />
              </div>
              <div className="flex items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Image</label>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e.target.files[0], 'course')} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                    {uploading ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />} Upload
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="is_active" checked={editingCourse.is_active !== false} onChange={(e) => setEditingCourse((p) => ({ ...p, is_active: e.target.checked }))} className="accent-green-700" />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Active (publicly visible)</label>
              </div>
            </div>
            {editingCourse.img && <img src={editingCourse.img} alt="" className="w-full h-32 object-cover rounded-lg" onError={(e) => { e.target.style.display = 'none'; }} />}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setIsCourseModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold" style={{ backgroundColor: '#0B3B2C' }}>Save Course</button>
            </div>
          </form>
        )}
      </Modal>

      {/* Pricing Modal */}
      <Modal open={isPricingModalOpen} onClose={() => setIsPricingModalOpen(false)} title={`Pricing — ${pricingCourse?.title || ''}`}>
        {pricingCourse && (
          <form onSubmit={savePricing} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">One-time Price (€)</label>
              <input type="number" min="0" step="0.01" value={pricingForm.price} onChange={(e) => setPricingForm((p) => ({ ...p, price: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Price (€)</label>
              <input type="number" min="0" step="0.01" value={pricingForm.monthly_price} onChange={(e) => setPricingForm((p) => ({ ...p, monthly_price: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700" />
              <p className="text-xs text-gray-400 mt-1">Leave 0 to disable monthly payments. Students pay this amount per installment.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Enabled Payment Options</label>
              <div className="flex gap-4">
                {[['one_time', 'One-time payment'], ['monthly', 'Monthly installments']].map(([opt, label]) => (
                  <label key={opt} className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${pricingForm.payment_options.includes(opt) ? 'border-green-600 bg-green-50' : 'border-gray-200'}`}>
                    <input type="checkbox" checked={pricingForm.payment_options.includes(opt)} onChange={() => togglePaymentOption(opt)} className="accent-green-600" />
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setIsPricingModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium">Cancel</button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold" style={{ backgroundColor: '#0B3B2C' }}>Save Pricing</button>
            </div>
          </form>
        )}
      </Modal>

      {/* Materials Modal */}
      <Modal open={isMaterialsModalOpen} onClose={() => setIsMaterialsModalOpen(false)} title={`Materials — ${selectedCourseForMaterials?.title || ''}`} wide>
        <div className="space-y-5">
          {materials.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Existing Materials ({materials.length})</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {materials.map((m) => (
                  <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded font-medium capitalize">{(m.type || '').replace('_', ' ')}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">
                      {m.period_type === 'day' ? `Day ${m.day ?? 1}` : `Week ${m.week ?? 1}`}
                    </span>
                    <span className="text-sm text-gray-700 flex-1 truncate">{m.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <form onSubmit={handleAddMaterial} className="space-y-3 border-t border-gray-100 pt-4">
            <h4 className="text-sm font-semibold text-gray-700">Add New Material</h4>

            {/* File Upload Zone */}
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center hover:border-green-400 transition-colors cursor-pointer"
              onClick={() => materialFileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleMaterialFileUpload(f); }}
            >
              <input ref={materialFileRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.webm,.jpg,.jpeg,.png" className="hidden" onChange={(e) => handleMaterialFileUpload(e.target.files[0])} />
              {materialUploading ? (
                <div className="flex items-center justify-center gap-2 text-green-700"><RefreshCw size={18} className="animate-spin" /><span className="text-sm font-medium">Uploading...</span></div>
              ) : newMaterial.url && !newMaterial.url.startsWith('http://') && newMaterial.url.includes('uploads') ? (
                <div className="flex items-center justify-center gap-2 text-green-700"><CheckCircle size={18} /><span className="text-sm font-medium">File uploaded — ready to save</span></div>
              ) : (
                <div>
                  <Upload size={28} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm font-medium text-gray-600">Click or drag & drop to upload</p>
                  <p className="text-xs text-gray-400 mt-0.5">PDF, Video, Images, Documents (max 5 MB)</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
                <input required value={newMaterial.title} onChange={(e) => setNewMaterial((p) => ({ ...p, title: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                <select value={newMaterial.type} onChange={(e) => setNewMaterial((p) => ({ ...p, type: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                  <option value="video">Video</option>
                  <option value="pdf">PDF</option>
                  <option value="link">Link / YouTube</option>
                  <option value="live_recording">Live Recording</option>
                  <option value="document">Document</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Period</label>
                <div className="flex items-center gap-1.5">
                  <div className="flex rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                    <button type="button" onClick={() => setNewMaterial((p) => ({ ...p, period_type: 'week' }))} className={`px-2.5 py-1.5 text-xs font-medium transition-colors ${newMaterial.period_type === 'week' ? 'text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`} style={newMaterial.period_type === 'week' ? { backgroundColor: '#0B3B2C' } : {}}>Wk</button>
                    <button type="button" onClick={() => setNewMaterial((p) => ({ ...p, period_type: 'day' }))} className={`px-2.5 py-1.5 text-xs font-medium transition-colors border-l border-gray-200 ${newMaterial.period_type === 'day' ? 'text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`} style={newMaterial.period_type === 'day' ? { backgroundColor: '#0B3B2C' } : {}}>Day</button>
                  </div>
                  <input type="number" min="1" max={newMaterial.period_type === 'week' ? 52 : 365}
                    value={newMaterial.period_type === 'week' ? newMaterial.week : (newMaterial.day ?? 1)}
                    onChange={(e) => { const v = Number(e.target.value); setNewMaterial((p) => p.period_type === 'week' ? { ...p, week: v } : { ...p, day: v }); }}
                    className="flex-1 min-w-0 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">URL (or YouTube link)</label>
                <input value={newMaterial.url} onChange={(e) => setNewMaterial((p) => ({ ...p, url: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" placeholder="https://youtube.com/... or paste link" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea rows={2} value={newMaterial.description} onChange={(e) => setNewMaterial((p) => ({ ...p, description: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" />
              </div>
            </div>
            <button type="submit" disabled={!newMaterial.url} className="w-full py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-40" style={{ backgroundColor: '#0B3B2C' }}>Add Material</button>
          </form>
        </div>
      </Modal>

      {/* Quiz Modal */}
      <Modal open={isQuizModalOpen} onClose={() => setIsQuizModalOpen(false)} title={`Quizzes — ${selectedCourseForQuiz?.title || ''}`} wide>
        <div className="space-y-5">
          {courseQuizzes.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Existing Quizzes</h4>
              <div className="space-y-2">
                {courseQuizzes.map((q) => (
                  <div key={q.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <div><p className="text-sm font-medium text-gray-800">{q.title}</p><p className="text-xs text-gray-400">{q.questions?.length ?? 0} questions · {q.time_limit_minutes} min</p></div>
                    <button onClick={() => deleteQuiz(q.id)} className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <form onSubmit={saveQuiz} className="space-y-4 border-t border-gray-100 pt-4">
            <h4 className="text-sm font-semibold text-gray-700">Create New Quiz</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Quiz Title *</label>
                <input required value={newQuiz.title} onChange={(e) => setNewQuiz((p) => ({ ...p, title: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Time Limit (mins)</label>
                <input type="number" min="1" value={newQuiz.time_limit_minutes} onChange={(e) => setNewQuiz((p) => ({ ...p, time_limit_minutes: Number(e.target.value) }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <input value={newQuiz.description} onChange={(e) => setNewQuiz((p) => ({ ...p, description: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
            </div>
            {newQuiz.questions.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {newQuiz.questions.map((q, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-green-50 border border-green-100">
                    <span className="text-xs text-green-700 font-bold mt-0.5">Q{i + 1}</span>
                    <span className="text-xs text-gray-700 flex-1">{q.question}</span>
                    <button type="button" onClick={() => removeQuestion(i)} className="text-red-400 hover:text-red-600"><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="border border-dashed border-gray-200 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-gray-600">Add Question</p>
              <input value={newQuestion.question} onChange={(e) => setNewQuestion((p) => ({ ...p, question: e.target.value }))} placeholder="Question text *" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              <div className="grid grid-cols-2 gap-2">
                {newQuestion.options.map((opt, i) => (
                  <input key={i} value={opt} onChange={(e) => { const opts = [...newQuestion.options]; opts[i] = e.target.value; setNewQuestion((p) => ({ ...p, options: opts })); }} placeholder={`Option ${String.fromCharCode(65 + i)}`} className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none" />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Correct Answer (exact text)</label>
                  <input value={newQuestion.correct_answer} onChange={(e) => setNewQuestion((p) => ({ ...p, correct_answer: e.target.value }))} placeholder="Must match one option above" className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Points</label>
                  <input type="number" min="1" value={newQuestion.points} onChange={(e) => setNewQuestion((p) => ({ ...p, points: Number(e.target.value) }))} className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
                </div>
              </div>
              <button type="button" onClick={addQuestion} className="w-full py-2 rounded-lg border border-dashed border-green-400 text-green-700 text-sm font-medium hover:bg-green-50"><Plus size={14} className="inline mr-1" />Add Question</button>
            </div>
            <button type="submit" className="w-full py-2.5 rounded-xl text-white text-sm font-bold" style={{ backgroundColor: '#0B3B2C' }}>Save Quiz</button>
          </form>
        </div>
      </Modal>

      {/* Student/User Edit Modal */}
      <Modal open={isUserEditOpen} onClose={() => setIsUserEditOpen(false)} title="Edit User Profile">
        {editingUser && (
          <form onSubmit={saveUserEdit} className="space-y-4">
            <div className="flex items-center gap-4 mb-2">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center text-xl font-bold text-gray-400 border-2 border-gray-200">
                  {editingUser.profilePicture ? <img src={editingUser.profilePicture} alt="" className="w-full h-full object-cover" /> : (editingUser.first_name?.[0] || 'U')}
                </div>
                <button type="button" onClick={() => userFileRef.current?.click()} className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full text-white flex items-center justify-center shadow" style={{ backgroundColor: '#0B3B2C' }}><Upload size={11} /></button>
                <input ref={userFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e.target.files[0], 'user')} />
              </div>
              <div><p className="font-medium text-gray-800">{editingUser.first_name} {editingUser.last_name}</p><p className="text-sm text-gray-400">{editingUser.email}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">First Name</label>
                <input value={editingUser.first_name || ''} onChange={(e) => setEditingUser((p) => ({ ...p, first_name: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
                <input value={editingUser.last_name || ''} onChange={(e) => setEditingUser((p) => ({ ...p, last_name: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input type="email" value={editingUser.email || ''} onChange={(e) => setEditingUser((p) => ({ ...p, email: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                <input value={editingUser.phone || ''} onChange={(e) => setEditingUser((p) => ({ ...p, phone: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Student ID</label>
                <input value={editingUser.student_id || ''} onChange={(e) => setEditingUser((p) => ({ ...p, student_id: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
                <select value={editingUser.role || 'student'} onChange={(e) => setEditingUser((p) => ({ ...p, role: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                  <option value="student">Student</option><option value="staff">Staff</option><option value="teacher">Teacher</option><option value="admin">Admin</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">New Password (leave blank to keep current)</label>
                <input type="password" value={editingUser.password || ''} onChange={(e) => setEditingUser((p) => ({ ...p, password: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" placeholder="••••••••" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setIsUserEditOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium">Cancel</button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold" style={{ backgroundColor: '#0B3B2C' }}>Save Changes</button>
            </div>
          </form>
        )}
      </Modal>

      {/* Create User Modal */}
      <Modal open={isCreateUserOpen} onClose={() => setIsCreateUserOpen(false)} title="Create New User">
        <form onSubmit={saveNewUser} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">First Name *</label>
              <input required value={newUser.first_name} onChange={(e) => setNewUser((p) => ({ ...p, first_name: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Last Name *</label>
              <input required value={newUser.last_name} onChange={(e) => setNewUser((p) => ({ ...p, last_name: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
              <input required type="email" value={newUser.email} onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Password *</label>
              <input required type="password" value={newUser.password} onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
              <select value={newUser.role} onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                <option value="student">Student</option><option value="staff">Staff</option><option value="teacher">Teacher</option><option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsCreateUserOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold" style={{ backgroundColor: '#0B3B2C' }}>Create User</button>
          </div>
        </form>
      </Modal>

      {/* Enroll Student Modal */}
      <Modal open={isEnrollOpen} onClose={() => setIsEnrollOpen(false)} title={`Enroll Student — ${enrollUserName}`}>
        <form onSubmit={handleEnroll} className="space-y-4">
          <p className="text-sm text-gray-500">Select a course to enroll this student in. Enrollment will be marked as active and paid immediately.</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
            <select required value={enrollCourseId} onChange={(e) => setEnrollCourseId(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700">
              <option value="">— Select a course —</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          {enrollMsg && (
            <p className={`text-sm font-medium px-3 py-2 rounded-lg ${enrollMsg.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{enrollMsg}</p>
          )}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setIsEnrollOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium">Close</button>
            <button type="submit" disabled={enrolling || !enrollCourseId} className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-50" style={{ backgroundColor: '#0B3B2C' }}>
              {enrolling ? 'Enrolling...' : 'Enroll Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Course to Teacher Modal */}
      <Modal open={isAssignCourseOpen} onClose={() => setIsAssignCourseOpen(false)} title={`Assign Course — ${assignTeacher ? `${assignTeacher.first_name} ${assignTeacher.last_name}` : ''}`}>
        <form onSubmit={handleAssignCourse} className="space-y-4">
          <p className="text-sm text-gray-500">Choose a course to assign to this teacher. They will receive an email notification and can access the course materials and enrolled students.</p>
          {assignTeacher?.assigned_courses?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1.5">Currently assigned:</p>
              <div className="flex flex-wrap gap-1.5">
                {assignTeacher.assigned_courses.map((cid) => {
                  const c = courses.find((x) => x.id === cid || x._id === cid);
                  return c ? (
                    <span key={cid} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100">{c.title}</span>
                  ) : null;
                })}
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
            <select required value={assignCourseId} onChange={(e) => setAssignCourseId(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-700">
              <option value="">— Select a course —</option>
              {courses.map((c) => <option key={c.id || c._id} value={c.id || c._id}>{c.title}</option>)}
            </select>
          </div>
          {assignMsg && (
            <p className={`text-sm font-medium px-3 py-2 rounded-lg ${assignMsg.startsWith('✓') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>{assignMsg}</p>
          )}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => setIsAssignCourseOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium">Close</button>
            <button type="submit" disabled={assigning || !assignCourseId} className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-50" style={{ backgroundColor: '#0B3B2C' }}>
              {assigning ? 'Assigning…' : 'Assign Course'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Admin Profile Modal */}
      <Modal open={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} title="My Profile">
        <form onSubmit={saveProfile} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border-2 border-gray-200">
                {profileForm.profilePicture ? <img src={profileForm.profilePicture} alt="" className="w-full h-full object-cover" /> : <User size={28} className="text-gray-400" />}
              </div>
              <button type="button" onClick={() => profileFileRef.current?.click()} className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full text-white flex items-center justify-center shadow" style={{ backgroundColor: '#0B3B2C' }}><Upload size={11} /></button>
              <input ref={profileFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e.target.files[0], 'profile')} />
            </div>
            <div>
              <p className="font-medium text-gray-800">{user?.email}</p>
              <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">First Name</label>
              <input value={profileForm.first_name} onChange={(e) => setProfileForm((p) => ({ ...p, first_name: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
              <input value={profileForm.last_name} onChange={(e) => setProfileForm((p) => ({ ...p, last_name: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
              <input value={profileForm.phone} onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setIsProfileModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold" style={{ backgroundColor: '#0B3B2C' }}>Save Profile</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
