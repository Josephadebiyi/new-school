import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, Users, User, LogOut, Menu, X,
  ChevronLeft, ChevronRight, Upload, Plus, Trash2, Send, Save,
  FileText, Play, Link as LinkIcon, File, CheckCircle, AlertCircle,
  Mail, MessageSquare, UsersRound, ClipboardList, Star, RefreshCw,
  Award, TrendingUp, Edit, Eye, Download,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getTeacherCourses, getTeacherCourseStudents, getTeacherStudents,
  updateStudentGrade, getTeacherGroups, createTeacherGroup, updateTeacherGroup,
  deleteTeacherGroup, sendBulkEmail, getTeacherContract, signTeacherContract,
  updateTeacherProfile, bulkUploadQuizzes, getCourseMaterials, addCourseMaterial,
  deleteCourseMaterial, getCourseQuizzes, uploadFile,
} from '../services/api';

const API_BASE = import.meta.env.VITE_API_BASE || '';

// ─── Terms & Contract Modal ───────────────────────────────────────────────────
function ContractModal({ user, token, onSigned }) {
  const [signature, setSignature] = useState('');
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const scrollRef = useRef(null);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (el && el.scrollTop + el.clientHeight >= el.scrollHeight - 20) setScrolled(true);
  };

  async function handleSign(e) {
    e.preventDefault();
    if (signature.trim().toLowerCase() !== `${user?.first_name} ${user?.last_name}`.toLowerCase()) {
      setError('Signature must match your full name exactly.');
      return;
    }
    setSigning(true); setError('');
    try {
      await signTeacherContract(token, signature);
      onSigned();
    } catch (err) { setError(err.message || 'Failed to sign. Please try again.'); }
    finally { setSigning(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 flex-shrink-0" style={{ backgroundColor: '#0B3B2C' }}>
          <FileText size={20} className="text-white" />
          <div>
            <h2 className="text-white font-bold">Employment Agreement</h2>
            <p className="text-green-300 text-xs">Read the full agreement before signing</p>
          </div>
        </div>

        <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-6 text-sm text-gray-700 space-y-4">
          <div className="text-center border-b pb-4 mb-4">
            <h3 className="font-bold text-lg text-[#0B3B2C]">GITB — Global Institute of Technology and Business</h3>
            <p className="text-gray-500 text-xs">Vilnius, Lithuania · admissions@gitb.lt</p>
            <h4 className="font-bold text-base mt-2">Instructor / Staff Employment Agreement</h4>
          </div>
          <p>This Agreement is entered into between <strong>GITB — Global Institute of Technology and Business</strong> ("the Institution") and <strong>{user?.first_name} {user?.last_name}</strong> ("the Instructor").</p>
          {[
            ['1. Role and Responsibilities', `The Instructor agrees to fulfil their designated role and shall: deliver course content as assigned; upload learning materials, assessments, and resources via the GITB Instructor Portal; grade student work fairly and within agreed timeframes; maintain accurate records of student attendance and progress; communicate professionally with students and staff at all times; attend scheduled meetings and training sessions as required.`],
            ['2. Confidentiality', `The Instructor agrees to maintain strict confidentiality regarding all student data, institutional data, and any proprietary materials shared by GITB. Student personal information shall not be disclosed to any third party under any circumstances.`],
            ['3. Intellectual Property', `All course materials, assessments, and content created by the Instructor in the course of their duties remain the intellectual property of GITB. The Instructor grants GITB a perpetual, royalty-free licence to use any materials they create for institutional purposes.`],
            ['4. Code of Conduct', `The Instructor agrees to uphold GITB's Code of Conduct, which includes professional conduct toward students, zero tolerance for discrimination or harassment, and commitment to academic integrity. Violations may result in immediate termination of this agreement.`],
            ['5. Data Protection (GDPR)', `The Instructor acknowledges their obligations under GDPR (Regulation (EU) 2016/679) and agrees to process student data only for legitimate educational purposes and in accordance with GITB's data protection policies.`],
            ['6. Termination', `Either party may terminate this agreement with 14 days written notice. GITB reserves the right to terminate immediately in cases of gross misconduct, breach of confidentiality, or failure to meet performance standards.`],
            ['7. Governing Law', `This Agreement is governed by the laws of the Republic of Lithuania.`],
          ].map(([title, text]) => (
            <div key={title}>
              <h5 className="font-bold text-[#0B3B2C] mb-1">{title}</h5>
              <p>{text}</p>
            </div>
          ))}
          {!scrolled && <p className="text-center text-xs text-gray-400 animate-pulse mt-4">↓ Scroll to the bottom to sign</p>}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <form onSubmit={handleSign} className="space-y-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Type your full name as digital signature: <span className="text-gray-400 font-normal">({user?.first_name} {user?.last_name})</span>
              </label>
              <input
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder={`${user?.first_name} ${user?.last_name}`}
                disabled={!scrolled}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={!scrolled || !signature.trim() || signing}
              className="w-full py-3 rounded-xl text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              style={{ backgroundColor: '#0B3B2C' }}
            >
              {signing ? 'Signing & sending email copy...' : 'I Agree & Sign Contract'}
            </button>
            <p className="text-xs text-gray-400 text-center">A copy of this signed agreement will be emailed to {user?.email}</p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// ─── TypeIcon helper ──────────────────────────────────────────────────────────
function TypeIcon({ type }) {
  switch ((type || '').toLowerCase()) {
    case 'video': return <Play size={13} className="text-green-500" />;
    case 'pdf': return <FileText size={13} className="text-red-500" />;
    case 'link': return <LinkIcon size={13} className="text-blue-500" />;
    case 'live_recording': return <Play size={13} className="text-purple-500" />;
    default: return <File size={13} className="text-gray-400" />;
  }
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function TeacherDashboard() {
  const { user, token, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeView, setActiveView] = useState('overview');
  const [showContract, setShowContract] = useState(false);
  const [contractChecked, setContractChecked] = useState(false);

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Materials form
  const materialFileRef = useRef(null);
  const [matUploading, setMatUploading] = useState(false);
  const [newMat, setNewMat] = useState({ title: '', type: 'video', url: '', description: '', week: 1, day: null, period_type: 'week' });
  const [matMsg, setMatMsg] = useState('');

  // Groups form
  const [groupForm, setGroupForm] = useState({ name: '', description: '', course_id: '', student_ids: [] });
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupMsg, setGroupMsg] = useState('');

  // Messaging
  const [emailForm, setEmailForm] = useState({ subject: '', body: '', target: 'course', course_id: '', group_id: '', student_ids: [] });
  const [emailSending, setEmailSending] = useState(false);
  const [emailMsg, setEmailMsg] = useState('');

  // Grades
  const [gradeForm, setGradeForm] = useState({ user_id: '', course_id: '', grade: '', grade_notes: '' });
  const [gradeMsg, setGradeMsg] = useState('');

  // Profile
  const [profileForm, setProfileForm] = useState({ first_name: '', last_name: '', phone: '', bio: '', education: '', professional_experience: '', specializations: '', linkedin_url: '', profilePicture: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const profileFileRef = useRef(null);

  // Bulk quiz
  const [bulkQuizFile, setBulkQuizFile] = useState(null);
  const [bulkQuizMsg, setBulkQuizMsg] = useState('');
  const [bulkQuizCourse, setBulkQuizCourse] = useState('');
  const bulkQuizRef = useRef(null);

  // ─── Init ───────────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    if (!token) { navigate('/login'); return; }
    setLoading(true);
    try {
      const [coursesData, allStudData, groupsData] = await Promise.allSettled([
        getTeacherCourses(token),
        getTeacherStudents(token),
        getTeacherGroups(token),
      ]);
      const c = coursesData.status === 'fulfilled' ? coursesData.value : [];
      setCourses(c);
      setAllStudents(allStudData.status === 'fulfilled' ? (Array.isArray(allStudData.value) ? allStudData.value : []) : []);
      setGroups(groupsData.status === 'fulfilled' ? (Array.isArray(groupsData.value) ? groupsData.value : []) : []);
      if (user) setProfileForm({ first_name: user.first_name || '', last_name: user.last_name || '', phone: user.phone || '', bio: user.bio || '', education: user.education || '', professional_experience: user.professional_experience || '', specializations: user.specializations || '', linkedin_url: user.linkedin_url || '', profilePicture: user.profilePicture || '' });
    } catch { setError('Failed to load data. Please refresh.'); }
    finally { setLoading(false); }
  }, [token, user, navigate]);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }
    // Check contract
    getTeacherContract(token).then((res) => {
      setContractChecked(true);
      if (!res.has_agreed_terms) setShowContract(true);
    }).catch(() => setContractChecked(true));
    loadData();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadCourseContent = useCallback(async (course) => {
    setSelectedCourse(course);
    setMaterials([]); setQuizzes([]); setStudents([]);
    try {
      const [mats, qzs, studs] = await Promise.allSettled([
        getCourseMaterials(token, course.id),
        getCourseQuizzes(token, course.id),
        getTeacherCourseStudents(token, course.id),
      ]);
      if (mats.status === 'fulfilled') setMaterials(Array.isArray(mats.value) ? mats.value : []);
      if (qzs.status === 'fulfilled') setQuizzes(Array.isArray(qzs.value) ? qzs.value : []);
      if (studs.status === 'fulfilled') setStudents(Array.isArray(studs.value) ? studs.value : []);
    } catch { /* silent */ }
  }, [token]);

  // ─── Material file upload ────────────────────────────────────────────────────
  async function handleMatFileUpload(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setMatMsg('File exceeds 5 MB limit.'); return; }
    setMatUploading(true);
    try {
      const res = await uploadFile(token, file);
      const ext = file.name.split('.').pop().toLowerCase();
      const detectedType = ['mp4', 'webm', 'mov'].includes(ext) ? 'video' : ['pdf'].includes(ext) ? 'pdf' : 'document';
      setNewMat((p) => ({ ...p, url: res.url, type: p.type || detectedType, title: p.title || file.name.replace(/\.[^/.]+$/, '') }));
      setMatMsg('');
    } catch (err) { setMatMsg(err.message || 'Upload failed'); }
    finally { setMatUploading(false); }
  }

  async function handleAddMaterial(e) {
    e.preventDefault();
    if (!selectedCourse) return;
    try {
      await addCourseMaterial(token, selectedCourse.id, newMat);
      setNewMat({ title: '', type: 'video', url: '', description: '', week: 1, day: null, period_type: 'week' });
      setMatMsg('Material added!');
      const updated = await getCourseMaterials(token, selectedCourse.id);
      setMaterials(Array.isArray(updated) ? updated : []);
    } catch (err) { setMatMsg(err.message || 'Failed to add material'); }
  }

  async function handleDeleteMaterial(mat) {
    if (!confirm(`Delete "${mat.title}"?`)) return;
    try {
      await deleteCourseMaterial(token, selectedCourse.id, mat.id);
      setMaterials((p) => p.filter((m) => m.id !== mat.id));
    } catch (err) { setMatMsg(err.message); }
  }

  // ─── Groups ──────────────────────────────────────────────────────────────────
  async function handleSaveGroup(e) {
    e.preventDefault(); setGroupMsg('');
    try {
      if (editingGroup) {
        await updateTeacherGroup(token, editingGroup.id, groupForm);
        setGroups((p) => p.map((g) => g.id === editingGroup.id ? { ...g, ...groupForm } : g));
        setGroupMsg('Group updated!');
      } else {
        const g = await createTeacherGroup(token, groupForm);
        setGroups((p) => [g, ...p]);
        setGroupMsg('Group created!');
      }
      setGroupForm({ name: '', description: '', course_id: '', student_ids: [] });
      setEditingGroup(null);
    } catch (err) { setGroupMsg(err.message || 'Failed to save group'); }
  }

  async function handleDeleteGroup(group) {
    if (!confirm(`Delete group "${group.name}"?`)) return;
    await deleteTeacherGroup(token, group.id);
    setGroups((p) => p.filter((g) => g.id !== group.id));
  }

  function toggleGroupStudent(studentId) {
    setGroupForm((p) => ({
      ...p,
      student_ids: p.student_ids.includes(studentId)
        ? p.student_ids.filter((id) => id !== studentId)
        : [...p.student_ids, studentId],
    }));
  }

  // ─── Messaging ───────────────────────────────────────────────────────────────
  async function handleSendBulkEmail(e) {
    e.preventDefault(); setEmailSending(true); setEmailMsg('');
    try {
      const payload = { subject: emailForm.subject, body: emailForm.body };
      if (emailForm.target === 'course') payload.course_id = emailForm.course_id;
      else if (emailForm.target === 'group') payload.group_id = emailForm.group_id;
      else payload.student_ids = emailForm.student_ids;
      const res = await sendBulkEmail(token, payload);
      setEmailMsg(`✓ Sent to ${res.sent}/${res.total} recipients.`);
      setEmailForm((p) => ({ ...p, subject: '', body: '' }));
    } catch (err) { setEmailMsg(err.message || 'Failed to send emails'); }
    finally { setEmailSending(false); }
  }

  // ─── Grades ──────────────────────────────────────────────────────────────────
  async function handleSaveGrade(e) {
    e.preventDefault(); setGradeMsg('');
    try {
      await updateStudentGrade(token, gradeForm);
      setGradeMsg('Grade saved!');
      setGradeForm({ user_id: '', course_id: '', grade: '', grade_notes: '' });
    } catch (err) { setGradeMsg(err.message || 'Failed to save grade'); }
  }

  // ─── Profile ─────────────────────────────────────────────────────────────────
  async function handleProfileImageUpload(file) {
    if (!file) return;
    try {
      const res = await uploadFile(token, file);
      setProfileForm((p) => ({ ...p, profilePicture: res.url }));
    } catch { setProfileMsg('Image upload failed.'); }
  }

  async function handleProfileSave(e) {
    e.preventDefault(); setProfileSaving(true); setProfileMsg('');
    try {
      const updated = await updateTeacherProfile(token, profileForm);
      updateUser({ ...profileForm });
      setProfileMsg('Profile updated successfully.');
    } catch (err) { setProfileMsg(err.message || 'Failed to update profile'); }
    finally { setProfileSaving(false); }
  }

  // ─── Bulk Quiz Upload ────────────────────────────────────────────────────────
  async function handleBulkQuizUpload(e) {
    e.preventDefault(); setBulkQuizMsg('');
    if (!bulkQuizCourse) { setBulkQuizMsg('Select a course first.'); return; }
    if (!bulkQuizFile) { setBulkQuizMsg('Select a JSON file to upload.'); return; }
    try {
      const text = await bulkQuizFile.text();
      const parsed = JSON.parse(text);
      const quizArray = Array.isArray(parsed) ? parsed : [parsed];
      const res = await bulkUploadQuizzes(token, bulkQuizCourse, quizArray);
      setBulkQuizMsg(`✓ ${res.created} quiz${res.created !== 1 ? 'zes' : ''} uploaded successfully.`);
      setBulkQuizFile(null);
      if (bulkQuizRef.current) bulkQuizRef.current.value = '';
    } catch (err) { setBulkQuizMsg(err.message || 'Upload failed. Ensure JSON is valid.'); }
  }

  function handleLogout() { logout(); navigate('/login'); }

  // ─── NAV ─────────────────────────────────────────────────────────────────────
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'courses', label: 'My Courses', icon: BookOpen },
    { id: 'materials', label: 'Materials', icon: Upload },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'grades', label: 'Grades', icon: Award },
    { id: 'groups', label: 'Groups', icon: UsersRound },
    { id: 'quizzes', label: 'Quizzes', icon: ClipboardList },
    { id: 'messaging', label: 'Messaging', icon: MessageSquare },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  // ─── VIEWS ───────────────────────────────────────────────────────────────────

  function OverviewView() {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #0B3B2C 0%, #0a3020 100%)' }}>
          <h2 className="text-2xl font-bold mb-1">Welcome, {user?.first_name || 'Instructor'}!</h2>
          <p className="text-green-200 text-sm">Manage your courses, students, and materials from one place.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Courses', value: courses.length, icon: BookOpen, bg: 'bg-green-50', fg: 'text-green-700' },
            { label: 'Students', value: allStudents.length, icon: Users, bg: 'bg-blue-50', fg: 'text-blue-700' },
            { label: 'Groups', value: groups.length, icon: UsersRound, bg: 'bg-purple-50', fg: 'text-purple-700' },
            { label: 'Materials', value: materials.length, icon: FileText, bg: 'bg-yellow-50', fg: 'text-yellow-700' },
          ].map(({ label, value, icon: Icon, bg, fg }) => (
            <div key={label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${bg} ${fg}`}><Icon size={20} /></div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">My Courses</h3>
            {courses.length === 0 ? <p className="text-gray-400 text-sm">No courses assigned yet.</p> : (
              <div className="space-y-2">
                {courses.slice(0, 5).map((c) => (
                  <button key={c.id} onClick={() => { loadCourseContent(c); setActiveView('courses'); }} className="w-full text-left flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <img src={c.img || '/images/course-uiux.jpg'} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" onError={(e) => { e.target.src = '/images/course-uiux.jpg'; }} />
                    <div className="min-w-0"><p className="text-sm font-medium text-gray-900 truncate">{c.title}</p><p className="text-xs text-gray-400">{c.category}</p></div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'Upload Course Material', icon: Upload, view: 'materials' },
                { label: 'Create Student Group', icon: UsersRound, view: 'groups' },
                { label: 'Message Students', icon: MessageSquare, view: 'messaging' },
                { label: 'Update Grades', icon: Award, view: 'grades' },
                { label: 'Upload Quizzes', icon: ClipboardList, view: 'quizzes' },
              ].map(({ label, icon: Icon, view }) => (
                <button key={label} onClick={() => setActiveView(view)} className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
                  <Icon size={16} className="text-green-700" />{label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function CoursesView() {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">My Courses</h2>
        {courses.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-dashed border-gray-200"><BookOpen size={40} className="mx-auto text-gray-300 mb-3" /><p className="text-gray-500">No courses assigned to you yet.</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <img src={course.img || '/images/course-uiux.jpg'} alt={course.title} className="w-full h-32 object-cover" onError={(e) => { e.target.src = '/images/course-uiux.jpg'; }} />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate mb-1">{course.title}</h3>
                  <p className="text-xs text-gray-400 mb-3 line-clamp-2">{course.description}</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button onClick={() => { loadCourseContent(course); setActiveView('materials'); }} className="flex items-center gap-1 justify-center py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100"><Upload size={12} /> Materials</button>
                    <button onClick={() => { loadCourseContent(course); setActiveView('students'); }} className="flex items-center gap-1 justify-center py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100"><Users size={12} /> Students</button>
                    <button onClick={() => { loadCourseContent(course); setActiveView('grades'); }} className="flex items-center gap-1 justify-center py-1.5 rounded-lg bg-yellow-50 text-yellow-700 text-xs font-medium hover:bg-yellow-100"><Award size={12} /> Grades</button>
                    <button onClick={() => { setBulkQuizCourse(course.id); setActiveView('quizzes'); }} className="flex items-center gap-1 justify-center py-1.5 rounded-lg bg-purple-50 text-purple-700 text-xs font-medium hover:bg-purple-100"><ClipboardList size={12} /> Quizzes</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function MaterialsView() {
    const grouped = {};
    materials.forEach((m) => {
      const key = m.period_type === 'day' ? `day_${m.day ?? 1}` : `week_${m.week ?? 1}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(m);
    });
    const weeks = Object.keys(grouped).sort((a, b) => {
      if (a.startsWith('week') && b.startsWith('day')) return -1;
      if (a.startsWith('day') && b.startsWith('week')) return 1;
      return Number(a.split('_')[1]) - Number(b.split('_')[1]);
    });
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap justify-between">
          <h2 className="text-xl font-bold text-gray-900">Course Materials</h2>
          <select value={selectedCourse?.id || ''} onChange={(e) => { const c = courses.find((x) => x.id === e.target.value); if (c) loadCourseContent(c); }} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-700">
            <option value="">— Select course —</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Upload form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4 sticky top-4">
              <h3 className="font-semibold text-gray-800">Add Material</h3>
              {!selectedCourse ? <p className="text-sm text-gray-400">Select a course first.</p> : (
                <form onSubmit={handleAddMaterial} className="space-y-3">
                  <div
                    className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:border-green-400 transition-colors"
                    onClick={() => materialFileRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); handleMatFileUpload(e.dataTransfer.files[0]); }}
                  >
                    <input ref={materialFileRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.webm,.jpg,.jpeg,.png" className="hidden" onChange={(e) => handleMatFileUpload(e.target.files[0])} />
                    {matUploading ? <div className="flex items-center justify-center gap-2 text-green-700"><RefreshCw size={16} className="animate-spin" /><span className="text-sm">Uploading...</span></div>
                      : newMat.url ? <div className="flex items-center justify-center gap-2 text-green-700"><CheckCircle size={16} /><span className="text-sm font-medium">File uploaded</span></div>
                        : <div><Upload size={24} className="mx-auto text-gray-300 mb-1" /><p className="text-sm text-gray-500">Click or drag to upload</p><p className="text-xs text-gray-400">PDF, Video, Docs (max 5 MB)</p></div>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Title *</label>
                    <input required value={newMat.title} onChange={(e) => setNewMat((p) => ({ ...p, title: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                      <select value={newMat.type} onChange={(e) => setNewMat((p) => ({ ...p, type: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                        <option value="video">Video</option>
                        <option value="pdf">PDF</option>
                        <option value="link">Link/YouTube</option>
                        <option value="live_recording">Live Recording</option>
                        <option value="document">Document</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Period</label>
                      <div className="flex items-center gap-1.5">
                        <div className="flex rounded-lg border border-gray-200 overflow-hidden flex-shrink-0">
                          <button type="button" onClick={() => setNewMat((p) => ({ ...p, period_type: 'week' }))} className={`px-2 py-1.5 text-xs font-medium transition-colors ${newMat.period_type === 'week' ? 'text-white' : 'bg-white text-gray-500'}`} style={newMat.period_type === 'week' ? { backgroundColor: '#0B3B2C' } : {}}>Wk</button>
                          <button type="button" onClick={() => setNewMat((p) => ({ ...p, period_type: 'day' }))} className={`px-2 py-1.5 text-xs font-medium transition-colors border-l border-gray-200 ${newMat.period_type === 'day' ? 'text-white' : 'bg-white text-gray-500'}`} style={newMat.period_type === 'day' ? { backgroundColor: '#0B3B2C' } : {}}>Day</button>
                        </div>
                        <input type="number" min="1" max={newMat.period_type === 'week' ? 52 : 365}
                          value={newMat.period_type === 'week' ? newMat.week : (newMat.day ?? 1)}
                          onChange={(e) => { const v = Number(e.target.value); setNewMat((p) => p.period_type === 'week' ? { ...p, week: v } : { ...p, day: v }); }}
                          className="flex-1 min-w-0 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">URL / YouTube link</label>
                    <input value={newMat.url} onChange={(e) => setNewMat((p) => ({ ...p, url: e.target.value }))} placeholder="https://youtube.com/..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                    <textarea rows={2} value={newMat.description} onChange={(e) => setNewMat((p) => ({ ...p, description: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" />
                  </div>
                  {matMsg && <p className={`text-sm ${matMsg.includes('!') ? 'text-green-600' : 'text-red-500'}`}>{matMsg}</p>}
                  <button type="submit" disabled={!newMat.url} className="w-full py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-40" style={{ backgroundColor: '#0B3B2C' }}>Add Material</button>
                </form>
              )}
            </div>
          </div>
          {/* Material list */}
          <div className="lg:col-span-3 space-y-3">
            {!selectedCourse ? null : weeks.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border border-dashed border-gray-200"><p className="text-gray-400">No materials yet. Upload your first one.</p></div>
            ) : weeks.map((week) => (
              <div key={week} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-white" style={{ backgroundColor: '#0B3B2C' }}>{week.startsWith('day_') ? `Day ${week.split('_')[1]}` : `Week ${week.split('_')[1]}`}</div>
                <div className="divide-y divide-gray-50">
                  {grouped[week].map((mat) => (
                    <div key={mat.id} className="flex items-center gap-3 px-4 py-3">
                      <TypeIcon type={mat.type} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{mat.title}</p>
                        {mat.description && <p className="text-xs text-gray-400 truncate">{mat.description}</p>}
                      </div>
                      <a href={mat.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-blue-500 hover:text-blue-700"><Eye size={14} /></a>
                      <button onClick={() => handleDeleteMaterial(mat)} className="p-1.5 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function StudentsView() {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap justify-between">
          <h2 className="text-xl font-bold text-gray-900">Students</h2>
          <select value={selectedCourse?.id || ''} onChange={(e) => { const c = courses.find((x) => x.id === e.target.value); if (c) loadCourseContent(c); }} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-700">
            <option value="">— All students —</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b border-gray-100">{['Student', 'Email', 'Student ID', 'Progress', 'Grade', 'Payment'].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-50">
                {(selectedCourse ? students : allStudents).length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No students found.</td></tr>}
                {(selectedCourse ? students : allStudents).map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 overflow-hidden flex-shrink-0">
                          {s.profilePicture ? <img src={s.profilePicture} alt="" className="w-full h-full object-cover" /> : (s.first_name?.[0] || 'S')}
                        </div>
                        <div><p className="font-medium text-gray-900">{s.first_name} {s.last_name}</p><p className="text-xs text-gray-400">{s.student_id || '—'}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{s.email}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs font-mono">{s.student_id || s.id?.slice(0, 8)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 w-20">
                          <div className="h-1.5 rounded-full" style={{ width: `${s.enrollment?.progress ?? 0}%`, backgroundColor: '#D4F542' }} />
                        </div>
                        <span className="text-xs text-gray-500">{s.enrollment?.progress ?? 0}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="text-xs font-medium text-gray-700">{s.enrollment?.grade || '—'}</span></td>
                    <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.enrollment?.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{s.enrollment?.payment_status || 'unknown'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  function GradesView() {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Update Grades</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Enter Grade</h3>
            <form onSubmit={handleSaveGrade} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Student *</label>
                <select required value={gradeForm.user_id} onChange={(e) => setGradeForm((p) => ({ ...p, user_id: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                  <option value="">— Select student —</option>
                  {allStudents.map((s) => <option key={s.id} value={s.id}>{s.first_name} {s.last_name} ({s.email})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Course *</label>
                <select required value={gradeForm.course_id} onChange={(e) => setGradeForm((p) => ({ ...p, course_id: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                  <option value="">— Select course —</option>
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Grade (e.g. A, B+, 85%, Pass)</label>
                <input required value={gradeForm.grade} onChange={(e) => setGradeForm((p) => ({ ...p, grade: e.target.value }))} placeholder="A, B+, 85%, Pass..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea rows={2} value={gradeForm.grade_notes} onChange={(e) => setGradeForm((p) => ({ ...p, grade_notes: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" />
              </div>
              {gradeMsg && <p className={`text-sm ${gradeMsg.includes('!') ? 'text-green-600' : 'text-red-500'}`}>{gradeMsg}</p>}
              <button type="submit" className="w-full py-2.5 rounded-xl text-white text-sm font-semibold" style={{ backgroundColor: '#0B3B2C' }}>Save Grade</button>
            </form>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Graded Students</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {allStudents.filter((s) => s.enrollment?.grade).length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No grades entered yet.</p>
              ) : allStudents.filter((s) => s.enrollment?.grade).map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                  <div><p className="text-sm font-medium text-gray-800">{s.first_name} {s.last_name}</p><p className="text-xs text-gray-400">{s.email}</p></div>
                  <span className="text-sm font-bold text-[#0B3B2C] px-3 py-1 bg-green-50 rounded-lg">{s.enrollment.grade}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function GroupsView() {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Student Groups</h2>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-4">
              <h3 className="font-semibold text-gray-800 mb-4">{editingGroup ? 'Edit Group' : 'Create Group'}</h3>
              <form onSubmit={handleSaveGroup} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Group Name *</label>
                  <input required value={groupForm.name} onChange={(e) => setGroupForm((p) => ({ ...p, name: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Associated Course</label>
                  <select value={groupForm.course_id} onChange={(e) => setGroupForm((p) => ({ ...p, course_id: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                    <option value="">— All courses —</option>
                    {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                  <input value={groupForm.description} onChange={(e) => setGroupForm((p) => ({ ...p, description: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Add Students ({groupForm.student_ids.length} selected)</label>
                  <div className="max-h-40 overflow-y-auto space-y-1 border border-gray-100 rounded-lg p-2">
                    {allStudents.length === 0 ? <p className="text-xs text-gray-400 text-center py-2">No students available.</p>
                      : allStudents.map((s) => (
                        <label key={s.id} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-50 ${groupForm.student_ids.includes(s.id) ? 'bg-green-50' : ''}`}>
                          <input type="checkbox" checked={groupForm.student_ids.includes(s.id)} onChange={() => toggleGroupStudent(s.id)} className="accent-green-700" />
                          <span className="text-xs text-gray-700">{s.first_name} {s.last_name}</span>
                        </label>
                      ))}
                  </div>
                </div>
                {groupMsg && <p className={`text-sm ${groupMsg.includes('!') ? 'text-green-600' : 'text-red-500'}`}>{groupMsg}</p>}
                <div className="flex gap-2">
                  {editingGroup && <button type="button" onClick={() => { setEditingGroup(null); setGroupForm({ name: '', description: '', course_id: '', student_ids: [] }); setGroupMsg(''); }} className="flex-1 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium">Cancel</button>}
                  <button type="submit" className="flex-1 py-2 rounded-xl text-white text-sm font-semibold" style={{ backgroundColor: '#0B3B2C' }}>{editingGroup ? 'Update Group' : 'Create Group'}</button>
                </div>
              </form>
            </div>
          </div>
          <div className="lg:col-span-3 space-y-3">
            {groups.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border border-dashed border-gray-200"><UsersRound size={40} className="mx-auto text-gray-300 mb-3" /><p className="text-gray-500">No groups yet.</p></div>
            ) : groups.map((g) => (
              <div key={g.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{g.name}</h4>
                    {g.description && <p className="text-xs text-gray-400 mt-0.5">{g.description}</p>}
                    <p className="text-xs text-gray-500 mt-1">{g.student_ids?.length || 0} students{g.course_id ? ` · ${courses.find((c) => c.id === g.course_id)?.title || ''}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => { setEditingGroup(g); setGroupForm({ name: g.name, description: g.description || '', course_id: g.course_id || '', student_ids: g.student_ids || [] }); setGroupMsg(''); }} className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"><Edit size={14} /></button>
                    <button onClick={() => handleDeleteGroup(g)} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function QuizzesView() {
    const template = JSON.stringify([{
      "title": "Sample Quiz Title",
      "description": "Optional description",
      "time_limit_minutes": 30,
      "questions": [
        { "question": "What is 2 + 2?", "options": ["3", "4", "5", "6"], "correct_answer": "4", "points": 1 },
        { "question": "Which planet is largest?", "options": ["Earth", "Mars", "Jupiter", "Saturn"], "correct_answer": "Jupiter", "points": 2 }
      ]
    }], null, 2);

    return (
      <div className="space-y-5">
        <h2 className="text-xl font-bold text-gray-900">Bulk Quiz Upload</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Upload Quizzes (JSON)</h3>
            <form onSubmit={handleBulkQuizUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Course *</label>
                <select required value={bulkQuizCourse} onChange={(e) => setBulkQuizCourse(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                  <option value="">— Select course —</option>
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div
                className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-green-400 transition-colors"
                onClick={() => bulkQuizRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setBulkQuizFile(f); }}
              >
                <input ref={bulkQuizRef} type="file" accept=".json" className="hidden" onChange={(e) => setBulkQuizFile(e.target.files[0])} />
                {bulkQuizFile ? (
                  <div className="flex items-center justify-center gap-2 text-green-700"><CheckCircle size={18} /><span className="text-sm font-medium">{bulkQuizFile.name}</span></div>
                ) : (
                  <div><Upload size={28} className="mx-auto text-gray-300 mb-2" /><p className="text-sm text-gray-500">Click or drag a .json file</p></div>
                )}
              </div>
              {bulkQuizMsg && <p className={`text-sm ${bulkQuizMsg.includes('✓') ? 'text-green-600' : 'text-red-500'}`}>{bulkQuizMsg}</p>}
              <button type="submit" disabled={!bulkQuizFile || !bulkQuizCourse} className="w-full py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-40" style={{ backgroundColor: '#0B3B2C' }}>Upload Quizzes</button>
            </form>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-3">JSON Template</h3>
            <p className="text-xs text-gray-500 mb-3">Download or copy this template, fill in your quiz data, then upload.</p>
            <pre className="bg-gray-50 rounded-lg p-3 text-xs text-gray-700 overflow-x-auto whitespace-pre-wrap border border-gray-100">{template}</pre>
            <button
              onClick={() => { const blob = new Blob([template], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'quiz-template.json'; a.click(); }}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
            >
              <Download size={14} /> Download Template
            </button>
          </div>
        </div>
      </div>
    );
  }

  function MessagingView() {
    const targetStudents = emailForm.target === 'group'
      ? allStudents.filter((s) => groups.find((g) => g.id === emailForm.group_id)?.student_ids?.includes(s.id))
      : emailForm.target === 'course'
        ? (selectedCourse ? students : allStudents)
        : allStudents.filter((s) => emailForm.student_ids.includes(s.id));

    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Message Students</h2>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <form onSubmit={handleSendBulkEmail} className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {[['course', 'By Course'], ['group', 'By Group'], ['individual', 'Select Students']].map(([val, label]) => (
                    <button key={val} type="button" onClick={() => setEmailForm((p) => ({ ...p, target: val }))} className={`py-2 rounded-xl text-sm font-medium border transition-colors ${emailForm.target === val ? 'text-white border-transparent' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`} style={emailForm.target === val ? { backgroundColor: '#0B3B2C' } : {}}>{label}</button>
                  ))}
                </div>

                {emailForm.target === 'course' && (
                  <select value={emailForm.course_id} onChange={(e) => { setEmailForm((p) => ({ ...p, course_id: e.target.value })); const c = courses.find((x) => x.id === e.target.value); if (c) loadCourseContent(c); }} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                    <option value="">— Select course —</option>
                    {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                )}
                {emailForm.target === 'group' && (
                  <select value={emailForm.group_id} onChange={(e) => setEmailForm((p) => ({ ...p, group_id: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                    <option value="">— Select group —</option>
                    {groups.map((g) => <option key={g.id} value={g.id}>{g.name} ({g.student_ids?.length || 0} students)</option>)}
                  </select>
                )}
                {emailForm.target === 'individual' && (
                  <div className="max-h-32 overflow-y-auto border border-gray-100 rounded-lg p-2 space-y-1">
                    {allStudents.map((s) => (
                      <label key={s.id} className="flex items-center gap-2 p-1.5 rounded cursor-pointer hover:bg-gray-50">
                        <input type="checkbox" checked={emailForm.student_ids.includes(s.id)} onChange={() => setEmailForm((p) => ({ ...p, student_ids: p.student_ids.includes(s.id) ? p.student_ids.filter((id) => id !== s.id) : [...p.student_ids, s.id] }))} className="accent-green-700" />
                        <span className="text-xs text-gray-700">{s.first_name} {s.last_name}</span>
                      </label>
                    ))}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Subject *</label>
                  <input required value={emailForm.subject} onChange={(e) => setEmailForm((p) => ({ ...p, subject: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Message *</label>
                  <textarea required rows={6} value={emailForm.body} onChange={(e) => setEmailForm((p) => ({ ...p, body: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" placeholder="Type your message here..." />
                </div>
                {emailMsg && <p className={`text-sm ${emailMsg.includes('✓') ? 'text-green-600' : 'text-red-500'}`}>{emailMsg}</p>}
                <button type="submit" disabled={emailSending || !emailForm.subject || !emailForm.body} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-40" style={{ backgroundColor: '#0B3B2C' }}>
                  <Send size={14} />{emailSending ? 'Sending...' : `Send to ${targetStudents.length} student${targetStudents.length !== 1 ? 's' : ''}`}
                </button>
              </form>
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h3 className="font-semibold text-gray-800 mb-3 text-sm">Recipients Preview</h3>
              {targetStudents.length === 0 ? <p className="text-gray-400 text-xs text-center py-4">Select a target above to preview recipients.</p>
                : <div className="space-y-2 max-h-64 overflow-y-auto">{targetStudents.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 flex-shrink-0">{s.first_name?.[0] || 'S'}</div>
                    <div className="min-w-0"><p className="text-xs font-medium text-gray-800 truncate">{s.first_name} {s.last_name}</p><p className="text-xs text-gray-400 truncate">{s.email}</p></div>
                  </div>
                ))}</div>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function ProfileView() {
    return (
      <div className="max-w-2xl space-y-5">
        <h2 className="text-xl font-bold text-gray-900">My Profile</h2>
        <form onSubmit={handleProfileSave} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border-2 border-gray-200">
                {profileForm.profilePicture ? <img src={profileForm.profilePicture} alt="" className="w-full h-full object-cover" /> : <User size={32} className="text-gray-400" />}
              </div>
              <button type="button" onClick={() => profileFileRef.current?.click()} className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full text-white flex items-center justify-center shadow" style={{ backgroundColor: '#0B3B2C' }}><Upload size={13} /></button>
              <input ref={profileFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleProfileImageUpload(e.target.files[0])} />
            </div>
            <div>
              <p className="font-semibold text-gray-800">{`${profileForm.first_name} ${profileForm.last_name}`.trim() || user?.email}</p>
              <p className="text-sm text-gray-400">{user?.email}</p>
              <p className="text-xs text-gray-400 capitalize mt-0.5">{user?.role || 'teacher'}</p>
            </div>
          </div>

          {/* Basic info */}
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Basic Information</p>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-medium text-gray-600 mb-1">First Name</label><input value={profileForm.first_name} onChange={(e) => setProfileForm((p) => ({ ...p, first_name: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Last Name</label><input value={profileForm.last_name} onChange={(e) => setProfileForm((p) => ({ ...p, last_name: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Phone</label><input value={profileForm.phone} onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">LinkedIn URL</label><input value={profileForm.linkedin_url} onChange={(e) => setProfileForm((p) => ({ ...p, linkedin_url: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" placeholder="https://linkedin.com/in/..." /></div>
            </div>
          </div>

          {/* Professional */}
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Professional Profile</p>
            <div className="space-y-3">
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Bio / About</label><textarea rows={3} value={profileForm.bio} onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" placeholder="Brief professional bio..." /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Education Background</label><textarea rows={2} value={profileForm.education} onChange={(e) => setProfileForm((p) => ({ ...p, education: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" placeholder="Degrees, institutions, years..." /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Professional Experience</label><textarea rows={3} value={profileForm.professional_experience} onChange={(e) => setProfileForm((p) => ({ ...p, professional_experience: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" placeholder="Previous roles, companies, achievements..." /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Specializations / Skills</label><input value={profileForm.specializations} onChange={(e) => setProfileForm((p) => ({ ...p, specializations: e.target.value }))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" placeholder="Cybersecurity, Python, UX Design..." /></div>
            </div>
          </div>

          {profileMsg && <p className={`text-sm font-medium ${profileMsg.includes('success') ? 'text-green-600' : 'text-red-500'}`}>{profileMsg}</p>}
          <button type="submit" disabled={profileSaving} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-semibold disabled:opacity-50" style={{ backgroundColor: '#0B3B2C' }}>
            <Save size={16} />{profileSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    );
  }

  // ─── SIDEBAR ─────────────────────────────────────────────────────────────────

  function SidebarContent({ collapsed }) {
    return (
      <div className="flex flex-col h-full">
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
          <img src="/images/gitb-logo.png" alt="GITB" className="w-8 h-8 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
          {!collapsed && <div><p className="text-white font-bold text-sm">GITB Academy</p><p className="text-green-300 text-xs capitalize">{user?.role || 'Instructor'} Portal</p></div>}
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = activeView === id;
            return (
              <button key={id} onClick={() => { setActiveView(id); setMobileOpen(false); }} title={collapsed ? label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${collapsed ? 'justify-center' : ''}`}
                style={active ? { backgroundColor: '#D4F542', color: '#0B3B2C' } : { color: 'rgba(255,255,255,0.8)' }}>
                <Icon size={18} />{!collapsed && <span>{label}</span>}
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
          <button onClick={handleLogout} title={collapsed ? 'Logout' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-white/10 transition-all ${collapsed ? 'justify-center' : ''}`}
            style={{ color: 'rgba(255,255,255,0.7)' }}>
            <LogOut size={18} />{!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    );
  }

  // ─── LOADING ─────────────────────────────────────────────────────────────────

  if (!contractChecked || (loading && !contractChecked)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-3" style={{ borderColor: '#0B3B2C', borderTopColor: 'transparent' }} />
          <p className="text-gray-500 text-sm">Loading instructor portal...</p>
        </div>
      </div>
    );
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {showContract && <ContractModal user={user} token={token} onSigned={() => setShowContract(false)} />}

      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col fixed top-0 left-0 h-full z-30 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'}`}
        style={{ backgroundColor: '#0B3B2C', backgroundImage: 'url(/images/sidebar.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundBlendMode: 'overlay' }}>
        <SidebarContent collapsed={!sidebarOpen} />
        <button onClick={() => setSidebarOpen((o) => !o)} className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center text-gray-600 hover:text-gray-900 z-10">
          {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} className="fixed inset-0 bg-black/50 z-40 md:hidden" />
            <motion.aside initial={{ x: -288 }} animate={{ x: 0 }} exit={{ x: -288 }} transition={{ type: 'tween', duration: 0.25 }} className="fixed top-0 left-0 h-full w-72 z-50 flex flex-col md:hidden" style={{ backgroundColor: '#0B3B2C' }}>
              <SidebarContent collapsed={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'md:ml-16'}`}>
        <header className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center gap-3">
          <button className="md:hidden p-1.5 rounded-lg text-gray-600 hover:bg-gray-100" onClick={() => setMobileOpen((o) => !o)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h1 className="font-bold text-gray-900 text-base flex-1 capitalize">{navItems.find((n) => n.id === activeView)?.label ?? 'Dashboard'}</h1>
          <button onClick={() => loadData()} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100" title="Refresh"><RefreshCw size={16} /></button>
          <button onClick={() => setActiveView('profile')} className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center border-2 border-gray-200 hover:border-green-700 transition-colors flex-shrink-0">
            {profileForm.profilePicture ? <img src={profileForm.profilePicture} alt="" className="w-full h-full object-cover" /> : <User size={16} className="text-gray-500" />}
          </button>
        </header>

        <main className="flex-1 px-4 md:px-6 py-6">
          {error && (
            <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              <AlertCircle size={16} /><span className="flex-1">{error}</span><button onClick={() => setError('')}><X size={14} /></button>
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.div key={activeView} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
              {activeView === 'overview'   && <OverviewView />}
              {activeView === 'courses'    && <CoursesView />}
              {activeView === 'materials'  && <MaterialsView />}
              {activeView === 'students'   && <StudentsView />}
              {activeView === 'grades'     && <GradesView />}
              {activeView === 'groups'     && <GroupsView />}
              {activeView === 'quizzes'    && <QuizzesView />}
              {activeView === 'messaging'  && <MessagingView />}
              {activeView === 'profile'    && <ProfileView />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
