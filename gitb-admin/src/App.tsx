import { Fragment, useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Briefcase,
  Calendar,
  CheckCircle,
  CheckCircle2,
  ClipboardList,
  Clock,
  Edit,
  Euro,
  ExternalLink,
  FileText,
  Inbox,
  LayoutDashboard,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Percent,
  Plus,
  RefreshCw,
  Search,
  Settings as SettingsIcon,
  ShieldCheck,
  Tag,
  Trash2,
  Upload,
  Users,
  Video,
  X,
  XCircle,
} from "lucide-react";
import { Scene, Logo } from "./components/Layout";
import { useAuth } from "./context/AuthContext";
import {
  getApplications, approveApplication, rejectApplication, resendCredentials,
  getInternships, updateInternship,
  getAdminCourses, createCourse, updateCourse, deleteCourse,
  getCourseMaterials, addCourseMaterial, deleteCourseMaterial,
  getAdminCourseQuizzes, adminCreateQuiz, updateQuiz, deleteQuiz,
  getLiveLessons, createLiveLesson, deleteLiveLesson,
  getSystemSettings, updateSystemSettings, uploadFile,
  getCoupons, createCoupon, updateCoupon, deleteCoupon,
  getAdminReferrals, sendTestEmails, seedCourses,
} from "./services/api";

const ADMIN_ROLES = ["admin", "super_admin", "registrar", "staff"];
const PUBLIC_SITE_URL = import.meta.env.VITE_PUBLIC_SITE_URL || "https://gitb.lt";

/* ================================================================ LOGIN */
export function AdminLogin() {
  const { login, isAuthenticated, user }: any = useAuth();
  const nav = useNavigate();
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated && ADMIN_ROLES.includes(user?.role)) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password);
      if (!ADMIN_ROLES.includes(data.user?.role)) {
        setError("This account does not have admissions back-office access.");
        return;
      }
      nav("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Email or password is incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Scene />
      <div className="flex min-h-screen items-center justify-center p-3 sm:p-8">
        <div className="glass-rim w-full max-w-md rounded-[34px] p-2">
          <div className="panel rounded-[28px] p-7 sm:p-9">
            <Logo />
            <p className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-forest">
              <ShieldCheck size={15} /> Staff only
            </p>
            <h1 className="display mt-2 text-3xl">
              Admin <span className="dim">log in</span>
            </h1>
            <form onSubmit={onSubmit} className="mt-7 space-y-4">
              <label className="block">
                <span className="label">Email</span>
                <input className="field" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
              </label>
              <label className="block">
                <span className="label">Password</span>
                <input
                  className="field"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </label>
              {error && <p className="rounded-xl bg-orange/15 p-3 text-sm font-medium text-[#8a3d00]">{error}</p>}
              <button disabled={loading} className="btn-dark w-full !py-3.5 disabled:opacity-60">
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />} Log in
              </button>
            </form>
            <a href={PUBLIC_SITE_URL} className="mt-6 block text-center text-sm font-semibold text-sub hover:text-ink">
              ← Back to gitb.lt
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

/* ================================================================ DASHBOARD */
type Tab = "overview" | "applications" | "internships" | "courses" | "coupons" | "referrals" | "settings";

const APP_STATUSES = ["pending", "approved", "rejected"] as const;
type AppStatusT = (typeof APP_STATUSES)[number];

const statusStyle: Record<string, string> = {
  pending: "bg-[#fff4d6] text-[#8a5a00]",
  approved: "bg-lime text-ink",
  rejected: "bg-[#ffe4e0] text-[#9f1d10]",
  paid: "bg-lime text-ink",
  unpaid: "bg-[#ffe4e0] text-[#9f1d10]",
};

function StatusPill({ s }: { s: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusStyle[s] || "bg-chip text-sub"}`}>{s}</span>;
}

const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—");

export function AdminDashboard() {
  const { user, token, isAuthenticated, logout }: any = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [applications, setApplications] = useState<any[]>([]);
  const [internships, setInternships] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [systemSettings, setSystemSettings] = useState<any>({ application_fee: 50, referral_reward_percent: 10 });
  const [coupons, setCoupons] = useState<any[]>([]);
  const [referralGroups, setReferralGroups] = useState<any[]>([]);

  const [openApp, setOpenApp] = useState<string | null>(null);
  const [openInt, setOpenInt] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AppStatusT>("all");

  // Unified "Manage course" modal: Details / Pricing / Materials / Quizzes / Live Lessons
  const [manageCourse, setManageCourse] = useState<any>(null); // the course being managed, or {} for a new one
  const [manageTab, setManageTab] = useState<"details" | "pricing" | "materials" | "quizzes" | "live">("details");
  const [courseForm, setCourseForm] = useState<any>({});
  const [courseSaving, setCourseSaving] = useState(false);
  const [courseMsg, setCourseMsg] = useState("");
  const [courseImageUploading, setCourseImageUploading] = useState(false);

  const [pricingForm, setPricingForm] = useState<any>({ price: 0, monthly_price: 0, payment_options: ["one_time"], pricing_tiers: [] });
  const [pricingSaving, setPricingSaving] = useState(false);

  const [materials, setMaterials] = useState<any[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [materialForm, setMaterialForm] = useState({ title: "", type: "video", url: "", description: "", week: 1 });
  const [materialUploading, setMaterialUploading] = useState(false);

  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<any>(null); // null = not editing; {} = new quiz

  const [liveLessons, setLiveLessons] = useState<any[]>([]);
  const [liveLessonsLoading, setLiveLessonsLoading] = useState(false);
  const [lessonForm, setLessonForm] = useState({ title: "", description: "", scheduled_at: "", duration_minutes: 60, meeting_url: "" });
  const [lessonSaving, setLessonSaving] = useState(false);

  const [couponForm, setCouponForm] = useState({ code: "", discount_type: "percentage", discount_value: "", max_uses: "", expires_at: "" });
  const [couponMsg, setCouponMsg] = useState("");
  const [couponSaving, setCouponSaving] = useState(false);
  const [expandedReferralCode, setExpandedReferralCode] = useState<string | null>(null);

  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState("");
  const [testEmailSending, setTestEmailSending] = useState(false);
  const [testEmailMsg, setTestEmailMsg] = useState("");
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedMsg, setSeedMsg] = useState("");

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [appsRes, intRes, courseRes, settingsRes, couponRes, referralRes] = await Promise.allSettled([
        getApplications(token), getInternships(token), getAdminCourses(token),
        getSystemSettings(token), getCoupons(token), getAdminReferrals(token),
      ]);
      if (appsRes.status === "fulfilled") setApplications(Array.isArray(appsRes.value) ? appsRes.value : []);
      if (intRes.status === "fulfilled") setInternships(Array.isArray(intRes.value) ? intRes.value : []);
      if (courseRes.status === "fulfilled") setCourses(Array.isArray(courseRes.value) ? courseRes.value : []);
      if (settingsRes.status === "fulfilled") setSystemSettings(settingsRes.value || {});
      if (couponRes.status === "fulfilled") setCoupons(Array.isArray(couponRes.value) ? couponRes.value : []);
      if (referralRes.status === "fulfilled") setReferralGroups(Array.isArray((referralRes.value as any)?.groups) ? (referralRes.value as any).groups : []);
    } catch {
      setError("Failed to load data. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isAuthenticated) { nav("/"); return; }
    if (!ADMIN_ROLES.includes(user?.role)) { nav("/"); return; }
    fetchData();
  }, [isAuthenticated, user, nav, fetchData]);

  const filteredApps = useMemo(() => {
    const n = q.trim().toLowerCase();
    return applications.filter(
      (a) =>
        (statusFilter === "all" || a.status === statusFilter) &&
        (!n || `${a.first_name} ${a.last_name} ${a.email} ${a.course_title || ""}`.toLowerCase().includes(n)),
    );
  }, [applications, q, statusFilter]);

  if (!isAuthenticated) return null;

  const kpis = [
    { label: "Applications", value: applications.length, icon: Inbox },
    { label: "Awaiting review", value: applications.filter((a) => a.status === "pending").length, icon: Clock },
    { label: "Accepted", value: applications.filter((a) => a.status === "approved").length, icon: CheckCircle2 },
    { label: "Fees collected", value: `€${applications.filter((a) => a.payment_status === "paid").reduce((s, a) => s + (Number(a.payment_amount) || 0), 0).toFixed(0)}`, icon: Euro },
    { label: "Internship applications", value: internships.length, icon: Briefcase },
  ];

  const byProgram = useMemo(() => {
    const counts: Record<string, number> = {};
    applications.forEach((a) => { if (a.course_title) counts[a.course_title] = (counts[a.course_title] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [applications]);
  const maxN = Math.max(1, ...byProgram.map(([, n]) => n));

  async function handleApprove(appId: string) {
    if (!confirm("Approve this application? A student account will be created and the welcome email sent.")) return;
    try { await approveApplication(token, appId); fetchData(); } catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
  }
  async function handleReject(appId: string) {
    if (!confirm("Reject this application?")) return;
    try { await rejectApplication(token, appId); fetchData(); } catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
  }
  async function handleResend(appId: string, email: string) {
    if (!confirm(`Resend login credentials to ${email}? This resets their temporary password.`)) return;
    try { const r = await resendCredentials(token, appId); alert(r.message || "Credentials resent."); } catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
  }
  async function updateInt(id: string, patch: any) {
    try { await updateInternship(token, id, patch); fetchData(); } catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
  }

  // ─── COURSE MANAGEMENT (Details / Pricing / Materials / Quizzes / Live Lessons) ───

  function openManageCourse(course: any | null) {
    const c = course || {};
    setManageCourse(c);
    setManageTab("details");
    setCourseMsg("");
    setCourseForm({
      title: c.title || "", slug: c.slug || "", category: c.category || "Technology",
      description: c.description || "", overview: c.overview || "",
      duration_value: c.duration_value || 3, duration_unit: c.duration_unit || "months",
      level: c.level || c.course_type || "Beginner", image_url: c.image_url || "",
      outcomes: Array.isArray(c.outcomes) ? c.outcomes.join("\n") : "",
      certifications: Array.isArray(c.certifications) ? c.certifications.join("\n") : "",
      is_active: c.is_active !== false,
    });
    setPricingForm({
      price: c.price?.upfront ?? (typeof c.price === "number" ? c.price : 0),
      monthly_price: c.monthly_price ?? c.price?.monthly ?? 0,
      payment_options: c.payment_options || ["one_time"],
      pricing_tiers: Array.isArray(c.pricing_tiers) ? c.pricing_tiers.map((t: any) => ({ ...t })) : [],
    });
    setMaterials([]); setQuizzes([]); setLiveLessons([]); setEditingQuiz(null);
    if (c.id) {
      loadMaterials(c.id);
      loadQuizzes(c.id);
      loadLiveLessons(c.id);
    }
  }
  function closeManageCourse() {
    setManageCourse(null);
  }

  async function saveCourseDetails(e: FormEvent) {
    e.preventDefault();
    setCourseSaving(true); setCourseMsg("");
    try {
      const payload = {
        ...courseForm,
        outcomes: courseForm.outcomes.split("\n").map((s: string) => s.trim()).filter(Boolean),
        certifications: courseForm.certifications.split("\n").map((s: string) => s.trim()).filter(Boolean),
      };
      let saved;
      if (manageCourse.id) {
        saved = await updateCourse(token, manageCourse.id, payload);
      } else {
        saved = await createCourse(token, payload);
      }
      setManageCourse(saved);
      setCourseMsg("✓ Saved.");
      fetchData();
    } catch (err) { setCourseMsg(err instanceof Error ? err.message : "Failed to save"); }
    finally { setCourseSaving(false); }
  }

  async function uploadCourseImage(file: File) {
    setCourseImageUploading(true);
    try {
      const data = await uploadFile(token, file);
      setCourseForm((p: any) => ({ ...p, image_url: data.url }));
    } catch (err) { alert(err instanceof Error ? err.message : "Upload failed"); }
    finally { setCourseImageUploading(false); }
  }

  async function handleDeleteCourse(course: any) {
    if (!confirm(`Delete "${course.title}"? This cannot be undone.`)) return;
    try {
      await deleteCourse(token, course.id);
      if (manageCourse?.id === course.id) closeManageCourse();
      fetchData();
    } catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
  }

  async function savePricing(e: FormEvent) {
    e.preventDefault();
    setPricingSaving(true);
    try {
      const saved = await updateCourse(token, manageCourse.id, {
        price: Number(pricingForm.price),
        monthly_price: Number(pricingForm.monthly_price),
        payment_options: pricingForm.payment_options,
        pricing_tiers: pricingForm.pricing_tiers,
      });
      setManageCourse(saved);
      fetchData();
    } catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
    finally { setPricingSaving(false); }
  }
  function togglePaymentOption(opt: string) {
    setPricingForm((p: any) => ({
      ...p,
      payment_options: p.payment_options.includes(opt) ? p.payment_options.filter((o: string) => o !== opt) : [...p.payment_options, opt],
    }));
  }

  // ─── MATERIALS ─────────────────────────────────────────────────────────────

  async function loadMaterials(courseId: string) {
    setMaterialsLoading(true);
    try { setMaterials(await getCourseMaterials(token, courseId)); }
    catch { /* ignore */ }
    finally { setMaterialsLoading(false); }
  }
  async function uploadMaterialFile(file: File) {
    setMaterialUploading(true);
    try {
      const data = await uploadFile(token, file);
      setMaterialForm((p) => ({ ...p, url: data.url }));
    } catch (err) { alert(err instanceof Error ? err.message : "Upload failed"); }
    finally { setMaterialUploading(false); }
  }
  async function handleAddMaterial(e: FormEvent) {
    e.preventDefault();
    try {
      await addCourseMaterial(token, manageCourse.id, materialForm);
      setMaterialForm({ title: "", type: "video", url: "", description: "", week: materialForm.week });
      loadMaterials(manageCourse.id);
    } catch (err) { alert(err instanceof Error ? err.message : "Failed to add material"); }
  }
  async function handleDeleteMaterial(materialId: string) {
    if (!confirm("Remove this material?")) return;
    try { await deleteCourseMaterial(token, manageCourse.id, materialId); loadMaterials(manageCourse.id); }
    catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
  }

  // ─── QUIZZES ───────────────────────────────────────────────────────────────

  async function loadQuizzes(courseId: string) {
    setQuizzesLoading(true);
    try { setQuizzes(await getAdminCourseQuizzes(token, courseId)); }
    catch { /* ignore */ }
    finally { setQuizzesLoading(false); }
  }
  function openNewQuiz() {
    setEditingQuiz({ title: "", description: "", time_limit_minutes: 30, questions: [{ question: "", options: ["", ""], correct_answer: "", points: 1 }] });
  }
  function openEditQuiz(quiz: any) {
    setEditingQuiz({ ...quiz, questions: quiz.questions.map((q: any) => ({ ...q, options: [...q.options] })) });
  }
  async function saveQuiz(e: FormEvent) {
    e.preventDefault();
    try {
      const payload = { ...editingQuiz, course_id: manageCourse.id };
      if (editingQuiz.id) await updateQuiz(token, editingQuiz.id, payload);
      else await adminCreateQuiz(token, payload);
      setEditingQuiz(null);
      loadQuizzes(manageCourse.id);
    } catch (err) { alert(err instanceof Error ? err.message : "Failed to save quiz"); }
  }
  async function handleDeleteQuiz(quizId: string) {
    if (!confirm("Delete this quiz?")) return;
    try { await deleteQuiz(token, quizId); loadQuizzes(manageCourse.id); }
    catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
  }
  function updateQuizQuestion(qi: number, patch: any) {
    setEditingQuiz((p: any) => {
      const questions = [...p.questions];
      questions[qi] = { ...questions[qi], ...patch };
      return { ...p, questions };
    });
  }
  function updateQuizOption(qi: number, oi: number, value: string) {
    setEditingQuiz((p: any) => {
      const questions = [...p.questions];
      const options = [...questions[qi].options];
      options[oi] = value;
      questions[qi] = { ...questions[qi], options };
      return { ...p, questions };
    });
  }

  // ─── LIVE LESSONS ──────────────────────────────────────────────────────────

  async function loadLiveLessons(courseId: string) {
    setLiveLessonsLoading(true);
    try { setLiveLessons(await getLiveLessons(token, courseId)); }
    catch { /* ignore */ }
    finally { setLiveLessonsLoading(false); }
  }
  async function handleCreateLesson(e: FormEvent) {
    e.preventDefault();
    setLessonSaving(true);
    try {
      await createLiveLesson(token, manageCourse.id, lessonForm);
      setLessonForm({ title: "", description: "", scheduled_at: "", duration_minutes: 60, meeting_url: "" });
      loadLiveLessons(manageCourse.id);
    } catch (err) { alert(err instanceof Error ? err.message : "Failed to schedule lesson"); }
    finally { setLessonSaving(false); }
  }
  async function handleDeleteLesson(id: string) {
    if (!confirm("Cancel this live lesson?")) return;
    try { await deleteLiveLesson(token, id); loadLiveLessons(manageCourse.id); }
    catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
  }

  async function handleCreateCoupon(e: FormEvent) {
    e.preventDefault();
    setCouponSaving(true); setCouponMsg("");
    try {
      await createCoupon(token, {
        code: couponForm.code,
        discount_type: couponForm.discount_type,
        discount_value: couponForm.discount_type === "full" ? 0 : Number(couponForm.discount_value),
        max_uses: couponForm.max_uses ? Number(couponForm.max_uses) : null,
        expires_at: couponForm.expires_at || null,
      });
      setCouponForm({ code: "", discount_type: "percentage", discount_value: "", max_uses: "", expires_at: "" });
      setCouponMsg("✓ Coupon created.");
      fetchData();
    } catch (err) { setCouponMsg(err instanceof Error ? err.message : "Failed"); }
    finally { setCouponSaving(false); }
  }
  async function toggleCouponActive(coupon: any) {
    try { await updateCoupon(token, coupon.id, { is_active: !coupon.is_active }); fetchData(); } catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
  }
  async function handleDeleteCoupon(coupon: any) {
    if (!confirm(`Delete coupon "${coupon.code}"? This cannot be undone.`)) return;
    try { await deleteCoupon(token, coupon.id); fetchData(); } catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
  }

  async function saveSettings(e: FormEvent) {
    e.preventDefault();
    setSettingsSaving(true); setSettingsMsg("");
    try {
      await updateSystemSettings(token, systemSettings);
      setSettingsMsg("✓ Settings saved.");
    } catch (err) { setSettingsMsg(err instanceof Error ? err.message : "Failed"); }
    finally { setSettingsSaving(false); }
  }
  async function handleSendTestEmails() {
    setTestEmailSending(true); setTestEmailMsg("");
    try {
      await sendTestEmails(token, user?.email);
      setTestEmailMsg(`✓ Test emails sent to ${user?.email}.`);
    } catch (err) { setTestEmailMsg(err instanceof Error ? err.message : "Failed"); }
    finally { setTestEmailSending(false); }
  }
  async function handleSeedCourses(replace: boolean) {
    if (replace && !confirm("This will DELETE all existing courses and replace them with the 9 standard GITB courses. Continue?")) return;
    setSeedLoading(true); setSeedMsg("");
    try {
      const data = await seedCourses(token, replace);
      setSeedMsg(`✓ ${data.inserted} courses added to the database.`);
      fetchData();
    } catch (err) { setSeedMsg(err instanceof Error ? err.message : "Failed"); }
    finally { setSeedLoading(false); }
  }

  const signOut = () => { logout(); nav("/"); };

  const current = applications.find((a) => a.id === openApp);
  const currentInt = internships.find((i) => i.id === openInt);

  const SIDEBAR: [Tab, string, any][] = [
    ["overview", "Overview", LayoutDashboard],
    ["applications", "Applications", Users],
    ["internships", "Internships", Briefcase],
    ["courses", "Courses", Tag],
    ["coupons", "Coupons", Percent],
    ["referrals", "Referrals", Users],
    ["settings", "Settings", SettingsIcon],
  ];

  return (
    <>
      <Scene />
      <div className="mx-auto max-w-[1500px] p-2 sm:p-5">
        <div className="glass-rim rounded-[30px] p-1.5 sm:rounded-[38px] sm:p-2.5">
          <div className="panel grid min-h-[92vh] overflow-hidden rounded-[24px] sm:rounded-[30px] lg:grid-cols-[250px_1fr]">
            {/* sidebar */}
            <aside className="relative flex flex-col bg-ink p-5 text-white">
              <div className="absolute inset-0 bg-[radial-gradient(80%_40%_at_0%_0%,rgba(212,245,66,0.18),transparent_70%)]" />
              <div className="relative">
                <Logo light className="!h-8" />
                <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.18em] text-lime">Admissions back office</p>
              </div>
              <nav className="relative mt-8 flex-1 space-y-1 overflow-y-auto">
                {SIDEBAR.map(([id, label, Icon]) => (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                      tab === id ? "bg-lime text-ink" : "text-white/75 hover:bg-white/10"
                    }`}
                  >
                    <Icon size={17} /> {label}
                    {id === "applications" && <span className="ml-auto text-xs opacity-70">{applications.length}</span>}
                    {id === "internships" && <span className="ml-auto text-xs opacity-70">{internships.length}</span>}
                  </button>
                ))}
              </nav>
              <div className="relative mt-4 space-y-2 pt-4 text-sm">
                <div className="glass-dark rounded-xl p-3">
                  <p className="text-[11px] uppercase tracking-wider text-white/50">Signed in as</p>
                  <p className="truncate font-semibold">{user?.email}</p>
                </div>
                <button onClick={signOut} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-white/80 hover:bg-white/10">
                  <LogOut size={15} /> Log out
                </button>
              </div>
            </aside>

            {/* main */}
            <main className="min-w-0 overflow-y-auto p-4 sm:p-7">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-forest">GITB Admissions</p>
                  <h1 className="display mt-1 text-3xl capitalize sm:text-4xl">{tab}</h1>
                </div>
                <a href={`${PUBLIC_SITE_URL}/apply`} target="_blank" rel="noreferrer" className="btn-ghost !py-2.5 text-[13px]">
                  Open applicant portal ↗
                </a>
              </div>

              {error && <p className="mt-4 rounded-xl bg-orange/10 p-3 text-sm font-medium text-[#8a3d00]">{error}</p>}
              {loading ? (
                <div className="mt-10 flex justify-center"><Loader2 size={32} className="animate-spin text-forest" /></div>
              ) : (
                <>
                  {tab === "overview" && (
                    <>
                      <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-5">
                        {kpis.map(({ label, value, icon: Icon }, i) => (
                          <div key={label} className={`${i === 0 ? "bg-ink text-white" : "glass sheen"} rounded-2xl p-4`}>
                            <Icon size={18} className={i === 0 ? "text-lime" : "text-forest"} />
                            <p className="mt-3 font-display text-3xl">{value}</p>
                            <p className={`text-sm ${i === 0 ? "text-white/60" : "text-sub"}`}>{label}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-5 grid gap-5 2xl:grid-cols-[1.8fr_1fr]">
                        <Panel title="Latest applications" action={<button onClick={() => setTab("applications")} className="text-sm font-semibold text-forest">View all →</button>}>
                          <AppTable rows={applications.slice(0, 6)} onOpen={setOpenApp} />
                        </Panel>
                        <Panel title="Applications by programme">
                          {byProgram.length === 0 ? (
                            <p className="text-sm text-sub">No applications yet.</p>
                          ) : (
                            <ul className="space-y-3">
                              {byProgram.map(([title, n]) => (
                                <li key={title}>
                                  <div className="flex justify-between text-sm">
                                    <span className="font-medium">{title}</span>
                                    <span className="font-semibold">{n}</span>
                                  </div>
                                  <div className="mt-1.5 h-2 rounded-full bg-ink/10">
                                    <div className="h-full rounded-full bg-forest" style={{ width: `${(n / maxN) * 100}%` }} />
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </Panel>
                      </div>
                    </>
                  )}

                  {tab === "applications" && (
                    <>
                      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                        <label className="relative flex-1">
                          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-sub" />
                          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email or programme" className="field !pl-11" />
                        </label>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="field sm:w-52">
                          <option value="all">All</option>
                          {APP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <Panel title={`${filteredApps.length} application${filteredApps.length === 1 ? "" : "s"}`} className="mt-4">
                        <AppTable rows={filteredApps} onOpen={setOpenApp} onApprove={handleApprove} onReject={handleReject} onResend={handleResend} />
                      </Panel>
                    </>
                  )}

                  {tab === "internships" && (
                    <Panel title={`${internships.length} internship application${internships.length === 1 ? "" : "s"}`} className="mt-6">
                      {internships.length === 0 ? (
                        <p className="py-8 text-center text-sub">
                          No internship applications yet. Submit one from the{" "}
                          <a href={`${PUBLIC_SITE_URL}/internships`} target="_blank" rel="noreferrer" className="font-semibold text-ink underline">Internships page</a>.
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[640px] text-left text-sm">
                            <thead className="text-xs uppercase tracking-wider text-sub">
                              <tr><th className="px-3 py-2">Applicant</th><th className="px-3 py-2">Track</th><th className="px-3 py-2">Length</th><th className="px-3 py-2">CV</th><th className="px-3 py-2">Received</th><th className="px-3 py-2">Status</th></tr>
                            </thead>
                            <tbody className="divide-y divide-ink/10">
                              {internships.map((i) => (
                                <tr key={i.id} onClick={() => setOpenInt(i.id)} className="cursor-pointer hover:bg-white/70">
                                  <td className="px-3 py-3"><p className="font-semibold">{i.first_name} {i.last_name}</p><p className="text-xs text-sub">{i.email}</p></td>
                                  <td className="px-3 py-3">{i.track_title}</td>
                                  <td className="px-3 py-3">{i.duration_months} months</td>
                                  <td className="px-3 py-3"><a href={i.cv_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-forest hover:underline"><FileText size={14} /> {i.cv_name}</a></td>
                                  <td className="px-3 py-3">{fmtDate(i.created_at)}</td>
                                  <td className="px-3 py-3"><StatusPill s={i.status} /></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </Panel>
                  )}

                  {tab === "courses" && (
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-sub">{courses.length} course{courses.length === 1 ? "" : "s"}</p>
                        <button onClick={() => openManageCourse(null)} className="btn-dark text-sm"><Plus size={14} /> New Course</button>
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {courses.map((course) => {
                          const hasPrice = (course.price?.upfront > 0 || course.price?.monthly > 0) || (course.pricing_tiers?.length > 0);
                          return (
                            <div key={course.id} className="glass sheen rounded-2xl p-5">
                              {course.image_url && <img src={course.image_url} alt="" className="mb-3 h-28 w-full rounded-xl object-cover" />}
                              <h4 className="font-semibold">{course.title}</h4>
                              <p className="text-xs text-sub">{course.category}</p>
                              <div className="mt-3 space-y-1 text-sm">
                                {course.pricing_tiers?.length > 0 ? (
                                  course.pricing_tiers.map((t: any) => (
                                    <div key={t.id} className="flex justify-between"><span className="text-sub">{t.label || t.id}:</span><span className="font-medium">€{t.price_monthly}/mo</span></div>
                                  ))
                                ) : (
                                  <>
                                    <div className="flex justify-between"><span className="text-sub">One-time:</span><span className="font-medium">€{course.price?.upfront ?? 0}</span></div>
                                    <div className="flex justify-between"><span className="text-sub">Monthly:</span><span className="font-medium">€{course.price?.monthly ?? 0}/mo</span></div>
                                  </>
                                )}
                              </div>
                              {!hasPrice && <p className="mt-2 rounded-lg bg-orange/10 px-2 py-1 text-xs text-[#8a3d00]">No price set — students can't pay yet</p>}
                              <div className="mt-3 flex gap-2">
                                <button onClick={() => openManageCourse(course)} className="btn-dark flex-1 text-sm"><Edit size={13} /> Manage</button>
                                <button onClick={() => handleDeleteCourse(course)} className="btn bg-orange/10 text-[#9f1d10] hover:bg-orange/20"><Trash2 size={14} /></button>
                              </div>
                            </div>
                          );
                        })}
                        {courses.length === 0 && <p className="text-sub">No courses found — seed the catalog from Settings, or create one above.</p>}
                      </div>
                    </div>
                  )}

                  {tab === "coupons" && (
                    <div className="mt-6 max-w-3xl space-y-5">
                      <p className="text-sm text-sub">Discount codes for tuition installments only — never applies to the registration & application fee.</p>
                      <form onSubmit={handleCreateCoupon} className="glass sheen space-y-4 rounded-2xl p-6">
                        <div className="grid grid-cols-2 gap-4">
                          <label className="block">
                            <span className="label">Coupon Code</span>
                            <input type="text" required value={couponForm.code} onChange={(e) => setCouponForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="SUMMER2026" className="field uppercase" />
                          </label>
                          <label className="block">
                            <span className="label">Discount Type</span>
                            <select value={couponForm.discount_type} onChange={(e) => setCouponForm((p) => ({ ...p, discount_type: e.target.value }))} className="field">
                              <option value="percentage">Partial — Percentage off</option>
                              <option value="fixed">Partial — Fixed € amount off</option>
                              <option value="full">Full — 100% off</option>
                            </select>
                          </label>
                        </div>
                        {couponForm.discount_type !== "full" && (
                          <label className="block">
                            <span className="label">{couponForm.discount_type === "percentage" ? "Discount Percentage (1-100)" : "Discount Amount (€)"}</span>
                            <input type="number" min="0" max={couponForm.discount_type === "percentage" ? 100 : undefined} required value={couponForm.discount_value} onChange={(e) => setCouponForm((p) => ({ ...p, discount_value: e.target.value }))} className="field" />
                          </label>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                          <label className="block">
                            <span className="label">Max Uses (blank = unlimited)</span>
                            <input type="number" min="1" value={couponForm.max_uses} onChange={(e) => setCouponForm((p) => ({ ...p, max_uses: e.target.value }))} className="field" />
                          </label>
                          <label className="block">
                            <span className="label">Expires On (blank = never)</span>
                            <input type="date" value={couponForm.expires_at} onChange={(e) => setCouponForm((p) => ({ ...p, expires_at: e.target.value }))} className="field" />
                          </label>
                        </div>
                        <button type="submit" disabled={couponSaving} className="btn-dark w-full disabled:opacity-50">{couponSaving ? "Creating…" : "Create Coupon"}</button>
                        {couponMsg && <p className={`text-sm font-medium ${couponMsg.startsWith("✓") ? "text-forest" : "text-[#8a3d00]"}`}>{couponMsg}</p>}
                      </form>
                      <div className="overflow-hidden rounded-2xl bg-white/70">
                        <table className="w-full text-sm">
                          <thead className="bg-white/50 text-left text-sub"><tr><th className="px-4 py-3">Code</th><th className="px-4 py-3">Discount</th><th className="px-4 py-3">Uses</th><th className="px-4 py-3">Expires</th><th className="px-4 py-3">Status</th><th className="px-4 py-3"></th></tr></thead>
                          <tbody className="divide-y divide-ink/5">
                            {coupons.length === 0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-sub">No coupons yet.</td></tr>}
                            {coupons.map((c) => {
                              const expired = c.expires_at && new Date(c.expires_at) < new Date();
                              const usedUp = c.max_uses != null && c.used_count >= c.max_uses;
                              return (
                                <tr key={c.id}>
                                  <td className="px-4 py-3 font-mono font-semibold">{c.code}</td>
                                  <td className="px-4 py-3">{c.discount_type === "full" ? "Full (100%)" : c.discount_type === "percentage" ? `${c.discount_value}% off` : `€${c.discount_value} off`}</td>
                                  <td className="px-4 py-3">{c.used_count}{c.max_uses != null ? ` / ${c.max_uses}` : " / ∞"}</td>
                                  <td className="px-4 py-3">{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "Never"}</td>
                                  <td className="px-4 py-3">
                                    {!c.is_active ? <span className="rounded-full bg-chip px-2 py-1 text-xs font-medium">Disabled</span>
                                      : expired || usedUp ? <span className="rounded-full bg-orange/15 px-2 py-1 text-xs font-medium text-[#8a3d00]">{expired ? "Expired" : "Used up"}</span>
                                      : <span className="rounded-full bg-lime/40 px-2 py-1 text-xs font-medium text-forest">Active</span>}
                                  </td>
                                  <td className="px-4 py-3 text-right whitespace-nowrap">
                                    <button onClick={() => toggleCouponActive(c)} className="mr-3 text-xs font-medium text-sub hover:text-ink">{c.is_active ? "Disable" : "Enable"}</button>
                                    <button onClick={() => handleDeleteCoupon(c)} className="text-xs font-medium text-[#9f1d10]">Delete</button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {tab === "referrals" && (
                    <div className="mt-6 max-w-4xl space-y-5">
                      <p className="text-sm text-sub">Every applicant grouped by the referral code they used, and who referred them.</p>
                      <div className="overflow-hidden rounded-2xl bg-white/70">
                        <table className="w-full text-sm">
                          <thead className="bg-white/50 text-left text-sub"><tr><th className="px-4 py-3">Code</th><th className="px-4 py-3">Referrer</th><th className="px-4 py-3">Students</th><th className="px-4 py-3">Rewarded</th><th className="px-4 py-3"></th></tr></thead>
                          <tbody className="divide-y divide-ink/5">
                            {referralGroups.length === 0 && <tr><td colSpan={5} className="px-4 py-6 text-center text-sub">No referral activity yet.</td></tr>}
                            {referralGroups.map((g) => {
                              const expanded = expandedReferralCode === g.referral_code;
                              return (
                                <Fragment key={g.referral_code}>
                                  <tr className="cursor-pointer hover:bg-white" onClick={() => setExpandedReferralCode(expanded ? null : g.referral_code)}>
                                    <td className="px-4 py-3 font-mono font-semibold">{g.referral_code}</td>
                                    <td className="px-4 py-3">{g.referrer ? <>{g.referrer.name} <span className="text-sub">({g.referrer.email})</span></> : <span className="text-sub">Unknown</span>}</td>
                                    <td className="px-4 py-3">{g.total_referred}</td>
                                    <td className="px-4 py-3">€{g.total_rewarded_eur.toFixed(2)}</td>
                                    <td className="px-4 py-3 text-right text-sub">{expanded ? "▲" : "▼"}</td>
                                  </tr>
                                  {expanded && (
                                    <tr>
                                      <td colSpan={5} className="bg-white/40 px-4 pb-4">
                                        <table className="w-full rounded-lg border border-ink/10 bg-white text-xs">
                                          <thead className="bg-chip text-left text-sub"><tr><th className="px-3 py-2">Student</th><th className="px-3 py-2">Course</th><th className="px-3 py-2">Status</th><th className="px-3 py-2">Reward</th></tr></thead>
                                          <tbody className="divide-y divide-ink/5">
                                            {g.students.map((s: any) => (
                                              <tr key={s.application_id}>
                                                <td className="px-3 py-2">{s.name} <span className="text-sub">({s.email})</span></td>
                                                <td className="px-3 py-2">{s.course_title || "—"}</td>
                                                <td className="px-3 py-2 capitalize">{s.application_status}</td>
                                                <td className="px-3 py-2">{s.reward_status === "rewarded" ? `€${s.reward_eur.toFixed(2)}` : s.reward_status.replace(/_/g, " ")}</td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </td>
                                    </tr>
                                  )}
                                </Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {tab === "settings" && (
                    <div className="mt-6 max-w-xl space-y-5">
                      <form onSubmit={saveSettings} className="glass sheen space-y-4 rounded-2xl p-6">
                        <h3 className="font-display text-sm uppercase">Pricing</h3>
                        <label className="block">
                          <span className="label">Application Fee (€)</span>
                          <input type="number" min="0" value={systemSettings.application_fee ?? 50} onChange={(e) => setSystemSettings((p: any) => ({ ...p, application_fee: Number(e.target.value) }))} className="field" />
                        </label>
                        <label className="block">
                          <span className="label">Referral Reward (%)</span>
                          <input type="number" min="0" max="100" value={systemSettings.referral_reward_percent ?? 10} onChange={(e) => setSystemSettings((p: any) => ({ ...p, referral_reward_percent: Number(e.target.value) }))} className="field" />
                        </label>
                        <div className="border-t border-ink/10 pt-4">
                          <span className="label">Student Dashboard Banner URL</span>
                          <input type="text" value={systemSettings.dashboard_banner_image_url || ""} onChange={(e) => setSystemSettings((p: any) => ({ ...p, dashboard_banner_image_url: e.target.value }))} className="field" placeholder="https://…" />
                          <input type="text" value={systemSettings.dashboard_banner_link_url || ""} onChange={(e) => setSystemSettings((p: any) => ({ ...p, dashboard_banner_link_url: e.target.value }))} className="field mt-2" placeholder="/courses (optional link)" />
                        </div>
                        <button type="submit" disabled={settingsSaving} className="btn-dark w-full disabled:opacity-50">{settingsSaving ? "Saving…" : "Save Settings"}</button>
                        {settingsMsg && <p className={`text-sm font-medium ${settingsMsg.startsWith("✓") ? "text-forest" : "text-[#8a3d00]"}`}>{settingsMsg}</p>}
                      </form>
                      <div className="glass sheen space-y-3 rounded-2xl p-6">
                        <h3 className="font-display text-sm uppercase">Course Database</h3>
                        <p className="text-sm text-sub">Seed the database with the 9 standard GITB courses (matching the current site's catalog). Safe to run if courses are empty.</p>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleSeedCourses(false)} disabled={seedLoading} className="btn-dark flex-1 disabled:opacity-50">
                            {seedLoading ? <><RefreshCw size={14} className="animate-spin" /> Working…</> : "Seed Courses (safe)"}
                          </button>
                          <button type="button" onClick={() => handleSeedCourses(true)} disabled={seedLoading} className="btn flex-1 border-2 border-[#9f1d10] text-[#9f1d10] hover:bg-orange/10 disabled:opacity-50">
                            Replace All Courses
                          </button>
                        </div>
                        {seedMsg && <p className={`text-sm font-medium ${seedMsg.startsWith("✓") ? "text-forest" : "text-[#8a3d00]"}`}>{seedMsg}</p>}
                      </div>
                      <div className="glass sheen space-y-3 rounded-2xl p-6">
                        <h3 className="font-display text-sm uppercase">Email System Test</h3>
                        <p className="text-sm text-sub">Send a test email for every notification type to your own address.</p>
                        <button type="button" onClick={handleSendTestEmails} disabled={testEmailSending} className="btn-dark w-full disabled:opacity-50">
                          {testEmailSending ? <><RefreshCw size={14} className="animate-spin" /> Sending…</> : "Send Test Emails"}
                        </button>
                        {testEmailMsg && <p className={`text-sm font-medium ${testEmailMsg.startsWith("✓") ? "text-forest" : "text-[#8a3d00]"}`}>{testEmailMsg}</p>}
                      </div>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>

      {current && (
        <ApplicationDrawer
          rec={current}
          onClose={() => setOpenApp(null)}
          onApprove={() => handleApprove(current.id)}
          onReject={() => handleReject(current.id)}
          onResend={() => handleResend(current.id, current.email)}
        />
      )}
      {currentInt && <InternshipDrawer rec={currentInt} onClose={() => setOpenInt(null)} update={(p) => updateInt(currentInt.id, p)} />}

      {manageCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-deep/50 p-4 backdrop-blur-sm" onClick={closeManageCourse}>
          <div className="panel flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-[24px]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between p-6 pb-0">
              <h2 className="display text-xl">{manageCourse.id ? `Manage — ${manageCourse.title}` : "New Course"}</h2>
              <button onClick={closeManageCourse} className="grid h-9 w-9 place-items-center rounded-xl bg-chip"><X size={16} /></button>
            </div>

            {manageCourse.id && (
              <div className="mt-4 flex gap-1 overflow-x-auto px-6">
                {(["details", "pricing", "materials", "quizzes", "live"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setManageTab(t)}
                    className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold capitalize ${manageTab === t ? "bg-ink text-white" : "bg-chip text-sub hover:text-ink"}`}
                  >
                    {t === "live" ? "Live Lessons" : t}
                  </button>
                ))}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-6">
              {(manageTab === "details" || !manageCourse.id) && (
                <form onSubmit={saveCourseDetails} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="label">Title</span>
                      <input required value={courseForm.title} onChange={(e) => setCourseForm((p: any) => ({ ...p, title: e.target.value }))} className="field" />
                    </label>
                    <label className="block">
                      <span className="label">Slug (used in URLs, blank = auto)</span>
                      <input value={courseForm.slug} onChange={(e) => setCourseForm((p: any) => ({ ...p, slug: e.target.value }))} className="field font-mono" placeholder="cybersecurity-acceleration" />
                    </label>
                    <label className="block">
                      <span className="label">Category</span>
                      <input value={courseForm.category} onChange={(e) => setCourseForm((p: any) => ({ ...p, category: e.target.value }))} className="field" />
                    </label>
                    <label className="block">
                      <span className="label">Level</span>
                      <select value={courseForm.level} onChange={(e) => setCourseForm((p: any) => ({ ...p, level: e.target.value }))} className="field">
                        {["Beginner", "Intermediate", "Advanced", "All Levels"].map((l) => <option key={l}>{l}</option>)}
                      </select>
                    </label>
                    <label className="block">
                      <span className="label">Duration</span>
                      <input type="number" min="1" value={courseForm.duration_value} onChange={(e) => setCourseForm((p: any) => ({ ...p, duration_value: Number(e.target.value) }))} className="field" />
                    </label>
                    <label className="block">
                      <span className="label">Duration unit</span>
                      <select value={courseForm.duration_unit} onChange={(e) => setCourseForm((p: any) => ({ ...p, duration_unit: e.target.value }))} className="field">
                        <option value="months">months</option>
                        <option value="weeks">weeks</option>
                      </select>
                    </label>
                  </div>
                  <label className="block">
                    <span className="label">Short description</span>
                    <textarea rows={2} value={courseForm.description} onChange={(e) => setCourseForm((p: any) => ({ ...p, description: e.target.value }))} className="field resize-y" />
                  </label>
                  <label className="block">
                    <span className="label">Overview (shown on the course detail page)</span>
                    <textarea rows={4} value={courseForm.overview} onChange={(e) => setCourseForm((p: any) => ({ ...p, overview: e.target.value }))} className="field resize-y" />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="label">What you'll learn (one per line)</span>
                      <textarea rows={4} value={courseForm.outcomes} onChange={(e) => setCourseForm((p: any) => ({ ...p, outcomes: e.target.value }))} className="field resize-y" />
                    </label>
                    <label className="block">
                      <span className="label">Certifications (one per line)</span>
                      <textarea rows={4} value={courseForm.certifications} onChange={(e) => setCourseForm((p: any) => ({ ...p, certifications: e.target.value }))} className="field resize-y" />
                    </label>
                  </div>
                  <div>
                    <span className="label">Course image</span>
                    {courseForm.image_url && <img src={courseForm.image_url} alt="" className="mb-2 h-32 w-full rounded-xl object-cover" />}
                    <label className="btn-ghost cursor-pointer">
                      {courseImageUploading ? <><Loader2 size={14} className="animate-spin" /> Uploading…</> : <><Upload size={14} /> Upload image</>}
                      <input type="file" accept="image/*" className="hidden" disabled={courseImageUploading} onChange={(e) => e.target.files?.[0] && uploadCourseImage(e.target.files[0])} />
                    </label>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={courseForm.is_active} onChange={(e) => setCourseForm((p: any) => ({ ...p, is_active: e.target.checked }))} className="h-4 w-4 accent-[#0b3b2c]" />
                    Visible to applicants
                  </label>
                  <button type="submit" disabled={courseSaving} className="btn-dark w-full disabled:opacity-50">{courseSaving ? "Saving…" : manageCourse.id ? "Save Details" : "Create Course"}</button>
                  {courseMsg && <p className={`text-sm font-medium ${courseMsg.startsWith("✓") ? "text-forest" : "text-[#8a3d00]"}`}>{courseMsg}</p>}
                </form>
              )}

              {manageTab === "pricing" && manageCourse.id && (
                <form onSubmit={savePricing} className="space-y-4">
                  {pricingForm.pricing_tiers.length > 0 ? (
                    <div className="space-y-3">
                      <p className="label">Pricing tiers (per month)</p>
                      {pricingForm.pricing_tiers.map((t: any, i: number) => (
                        <div key={t.id} className="flex items-center gap-3">
                          <span className="w-24 text-sm font-medium capitalize">{t.id}</span>
                          <input
                            type="number" min="0" value={t.price_monthly}
                            onChange={(e) => setPricingForm((p: any) => {
                              const tiers = [...p.pricing_tiers];
                              tiers[i] = { ...tiers[i], price_monthly: Number(e.target.value) };
                              return { ...p, pricing_tiers: tiers };
                            })}
                            className="field"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <label className="block">
                        <span className="label">One-time price (€)</span>
                        <input type="number" min="0" value={pricingForm.price} onChange={(e) => setPricingForm((p: any) => ({ ...p, price: e.target.value }))} className="field" />
                      </label>
                      <label className="block">
                        <span className="label">Monthly price (€)</span>
                        <input type="number" min="0" value={pricingForm.monthly_price} onChange={(e) => setPricingForm((p: any) => ({ ...p, monthly_price: e.target.value }))} className="field" />
                      </label>
                      <div>
                        <span className="label">Payment options</span>
                        <div className="flex gap-2">
                          {["one_time", "monthly"].map((opt) => (
                            <button type="button" key={opt} onClick={() => togglePaymentOption(opt)} className={`chip ${pricingForm.payment_options.includes(opt) ? "!bg-lime" : ""}`}>
                              {opt.replace("_", " ")}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  <button type="submit" disabled={pricingSaving} className="btn-dark w-full disabled:opacity-50">{pricingSaving ? "Saving…" : "Save Pricing"}</button>
                </form>
              )}

              {manageTab === "materials" && manageCourse.id && (
                <div className="space-y-5">
                  <form onSubmit={handleAddMaterial} className="space-y-3 rounded-2xl bg-white/70 p-4">
                    <p className="font-display text-xs uppercase">Add material</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input required placeholder="Title" value={materialForm.title} onChange={(e) => setMaterialForm((p) => ({ ...p, title: e.target.value }))} className="field" />
                      <select value={materialForm.type} onChange={(e) => setMaterialForm((p) => ({ ...p, type: e.target.value }))} className="field">
                        {["video", "pdf", "document", "link"].map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <input type="number" min="1" placeholder="Week" value={materialForm.week} onChange={(e) => setMaterialForm((p) => ({ ...p, week: Number(e.target.value) }))} className="field" />
                      <div className="flex gap-2">
                        <input placeholder="URL (YouTube, PDF, link…)" value={materialForm.url} onChange={(e) => setMaterialForm((p) => ({ ...p, url: e.target.value }))} className="field flex-1" />
                        <label className="btn-ghost cursor-pointer whitespace-nowrap">
                          {materialUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                          <input type="file" className="hidden" disabled={materialUploading} onChange={(e) => e.target.files?.[0] && uploadMaterialFile(e.target.files[0])} />
                        </label>
                      </div>
                    </div>
                    <textarea placeholder="Description (optional)" rows={2} value={materialForm.description} onChange={(e) => setMaterialForm((p) => ({ ...p, description: e.target.value }))} className="field resize-y" />
                    <button type="submit" disabled={!materialForm.url} className="btn-dark w-full disabled:opacity-40">Add Material</button>
                  </form>
                  {materialsLoading ? (
                    <Loader2 size={24} className="mx-auto animate-spin text-forest" />
                  ) : materials.length === 0 ? (
                    <p className="text-center text-sm text-sub">No materials yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {materials.map((m) => (
                        <li key={m.id} className="flex items-center gap-3 rounded-xl bg-white/70 p-3">
                          <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg bg-lime/40"><Video size={15} className="text-forest" /></span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{m.title}</p>
                            <p className="text-xs text-sub">Week {m.week} · {m.type}</p>
                          </div>
                          <button onClick={() => handleDeleteMaterial(m.id)} className="p-2 text-sub hover:text-[#9f1d10]"><Trash2 size={15} /></button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {manageTab === "quizzes" && manageCourse.id && (
                <div className="space-y-5">
                  {editingQuiz ? (
                    <form onSubmit={saveQuiz} className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input required placeholder="Quiz title" value={editingQuiz.title} onChange={(e) => setEditingQuiz((p: any) => ({ ...p, title: e.target.value }))} className="field" />
                        <input type="number" min="1" placeholder="Time limit (minutes)" value={editingQuiz.time_limit_minutes} onChange={(e) => setEditingQuiz((p: any) => ({ ...p, time_limit_minutes: Number(e.target.value) }))} className="field" />
                      </div>
                      <textarea placeholder="Description (optional)" rows={2} value={editingQuiz.description} onChange={(e) => setEditingQuiz((p: any) => ({ ...p, description: e.target.value }))} className="field resize-y" />
                      <div className="space-y-4">
                        {editingQuiz.questions.map((q: any, qi: number) => (
                          <div key={qi} className="rounded-2xl bg-white/70 p-4">
                            <div className="mb-2 flex items-center justify-between">
                              <p className="font-display text-xs uppercase">Question {qi + 1}</p>
                              {editingQuiz.questions.length > 1 && (
                                <button type="button" onClick={() => setEditingQuiz((p: any) => ({ ...p, questions: p.questions.filter((_: any, i: number) => i !== qi) }))} className="text-sub hover:text-[#9f1d10]"><Trash2 size={14} /></button>
                              )}
                            </div>
                            <input required placeholder="Question text" value={q.question} onChange={(e) => updateQuizQuestion(qi, { question: e.target.value })} className="field mb-2" />
                            <div className="space-y-2">
                              {q.options.map((opt: string, oi: number) => (
                                <div key={oi} className="flex items-center gap-2">
                                  <input
                                    type="radio" name={`correct-${qi}`} checked={q.correct_answer === opt && opt !== ""}
                                    onChange={() => updateQuizQuestion(qi, { correct_answer: opt })}
                                    className="accent-[#0b3b2c]"
                                  />
                                  <input
                                    placeholder={`Option ${oi + 1}`} value={opt}
                                    onChange={(e) => updateQuizOption(qi, oi, e.target.value)}
                                    className="field flex-1 !py-2"
                                  />
                                  {q.options.length > 2 && (
                                    <button type="button" onClick={() => updateQuizQuestion(qi, { options: q.options.filter((_: string, i: number) => i !== oi) })} className="p-1 text-sub"><X size={14} /></button>
                                  )}
                                </div>
                              ))}
                              <button type="button" onClick={() => updateQuizQuestion(qi, { options: [...q.options, ""] })} className="text-xs font-semibold text-forest">+ Add option</button>
                            </div>
                            <p className="mt-2 text-xs text-sub">Select the radio button next to the correct answer.</p>
                          </div>
                        ))}
                      </div>
                      <button type="button" onClick={() => setEditingQuiz((p: any) => ({ ...p, questions: [...p.questions, { question: "", options: ["", ""], correct_answer: "", points: 1 }] }))} className="btn-ghost w-full">
                        <Plus size={14} /> Add question
                      </button>
                      <div className="flex gap-3">
                        <button type="button" onClick={() => setEditingQuiz(null)} className="btn-ghost flex-1">Cancel</button>
                        <button type="submit" className="btn-dark flex-1">Save Quiz</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <button onClick={openNewQuiz} className="btn-dark w-full"><Plus size={14} /> New Quiz</button>
                      {quizzesLoading ? (
                        <Loader2 size={24} className="mx-auto animate-spin text-forest" />
                      ) : quizzes.length === 0 ? (
                        <p className="text-center text-sm text-sub">No quizzes yet.</p>
                      ) : (
                        <ul className="space-y-2">
                          {quizzes.map((qz) => (
                            <li key={qz.id} className="flex items-center gap-3 rounded-xl bg-white/70 p-3">
                              <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg bg-lime/40"><ClipboardList size={15} className="text-forest" /></span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold">{qz.title}</p>
                                <p className="text-xs text-sub">{qz.questions?.length || 0} questions · {qz.time_limit_minutes} min</p>
                              </div>
                              <button onClick={() => openEditQuiz(qz)} className="p-2 text-sub hover:text-ink"><Edit size={15} /></button>
                              <button onClick={() => handleDeleteQuiz(qz.id)} className="p-2 text-sub hover:text-[#9f1d10]"><Trash2 size={15} /></button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </div>
              )}

              {manageTab === "live" && manageCourse.id && (
                <div className="space-y-5">
                  <form onSubmit={handleCreateLesson} className="space-y-3 rounded-2xl bg-white/70 p-4">
                    <p className="font-display text-xs uppercase">Schedule a live lesson</p>
                    <input required placeholder="Title" value={lessonForm.title} onChange={(e) => setLessonForm((p) => ({ ...p, title: e.target.value }))} className="field" />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="label">Date & time</span>
                        <input required type="datetime-local" value={lessonForm.scheduled_at} onChange={(e) => setLessonForm((p) => ({ ...p, scheduled_at: e.target.value }))} className="field" />
                      </label>
                      <label className="block">
                        <span className="label">Duration (minutes)</span>
                        <input type="number" min="15" value={lessonForm.duration_minutes} onChange={(e) => setLessonForm((p) => ({ ...p, duration_minutes: Number(e.target.value) }))} className="field" />
                      </label>
                    </div>
                    <input required placeholder="Meeting link (Zoom, Google Meet, Teams…)" value={lessonForm.meeting_url} onChange={(e) => setLessonForm((p) => ({ ...p, meeting_url: e.target.value }))} className="field" />
                    <textarea placeholder="Description (optional)" rows={2} value={lessonForm.description} onChange={(e) => setLessonForm((p) => ({ ...p, description: e.target.value }))} className="field resize-y" />
                    <button type="submit" disabled={lessonSaving} className="btn-dark w-full disabled:opacity-50">{lessonSaving ? "Scheduling…" : "Schedule Lesson"}</button>
                  </form>
                  {liveLessonsLoading ? (
                    <Loader2 size={24} className="mx-auto animate-spin text-forest" />
                  ) : liveLessons.length === 0 ? (
                    <p className="text-center text-sm text-sub">No live lessons scheduled.</p>
                  ) : (
                    <ul className="space-y-2">
                      {liveLessons.map((l) => (
                        <li key={l.id} className="flex items-center gap-3 rounded-xl bg-white/70 p-3">
                          <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg bg-lime/40"><Calendar size={15} className="text-forest" /></span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold">{l.title}</p>
                            <p className="text-xs text-sub">{new Date(l.scheduled_at).toLocaleString()} · {l.duration_minutes} min</p>
                          </div>
                          <a href={l.meeting_url} target="_blank" rel="noreferrer" className="p-2 text-sub hover:text-ink"><ExternalLink size={15} /></a>
                          <button onClick={() => handleDeleteLesson(l.id)} className="p-2 text-sub hover:text-[#9f1d10]"><Trash2 size={15} /></button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Panel({ title, action, children, className = "" }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`glass sheen rounded-[22px] p-5 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-sm uppercase">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function AppTable({ rows, onOpen, onApprove, onReject, onResend }: { rows: any[]; onOpen: (id: string) => void; onApprove?: (id: string) => void; onReject?: (id: string) => void; onResend?: (id: string, email: string) => void }) {
  if (rows.length === 0) return <p className="py-8 text-center text-sub">No applications match.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="text-xs uppercase tracking-wider text-sub">
          <tr><th className="px-3 py-2">Applicant</th><th className="px-3 py-2">Programme</th><th className="px-3 py-2">Submitted</th><th className="px-3 py-2">Payment</th><th className="px-3 py-2">Status</th>{onApprove && <th className="px-3 py-2">Actions</th>}</tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {rows.map((r) => (
            <tr key={r.id} className="transition hover:bg-white/70">
              <td className="cursor-pointer px-3 py-3" onClick={() => onOpen(r.id)}>
                <p className="font-semibold">{r.first_name} {r.last_name}</p>
                <p className="text-xs text-sub">{r.email}</p>
              </td>
              <td className="cursor-pointer px-3 py-3" onClick={() => onOpen(r.id)}>{r.course_title}</td>
              <td className="cursor-pointer px-3 py-3" onClick={() => onOpen(r.id)}>{fmtDate(r.created_at)}</td>
              <td className="cursor-pointer px-3 py-3" onClick={() => onOpen(r.id)}><StatusPill s={r.payment_status || "unpaid"} /></td>
              <td className="cursor-pointer px-3 py-3" onClick={() => onOpen(r.id)}><StatusPill s={r.status} /></td>
              {onApprove && (
                <td className="px-3 py-3">
                  {r.status === "pending" ? (
                    <div className="flex items-center gap-2">
                      <button onClick={() => onApprove(r.id)} className="flex items-center gap-1 rounded-lg bg-forest px-3 py-1.5 text-xs font-bold text-white hover:bg-ink"><CheckCircle size={12} /> Accept</button>
                      <button onClick={() => onReject?.(r.id)} className="flex items-center gap-1 rounded-lg bg-[#9f1d10] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#7a1509]"><XCircle size={12} /> Reject</button>
                    </div>
                  ) : r.status === "approved" ? (
                    <button onClick={() => onResend?.(r.id, r.email)} className="flex items-center gap-1 rounded-lg bg-ink px-2.5 py-1.5 text-xs font-bold text-white hover:bg-forest"><RefreshCw size={11} /> Resend</button>
                  ) : null}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Drawer({ title, sub, onClose, children }: { title: string; sub: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink-deep/50 backdrop-blur-sm" onClick={onClose}>
      <div className="panel h-full w-full max-w-xl overflow-y-auto p-6 shadow-2xl sm:rounded-l-[28px]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-forest">{sub}</p>
            <h2 className="display mt-1 text-2xl">{title}</h2>
          </div>
          <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-xl bg-chip" aria-label="Close"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-5 rounded-2xl bg-white/70 p-4">
      <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-sub">{title}</h3>
      {children}
    </section>
  );
}

function Rows({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[130px_1fr] gap-x-3 gap-y-1.5 text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="text-sub">{k}</dt>
          <dd className="font-medium">{v || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

function ApplicationDrawer({ rec, onClose, onApprove, onReject, onResend }: { rec: any; onClose: () => void; onApprove: () => void; onReject: () => void; onResend: () => void }) {
  return (
    <Drawer title={`${rec.first_name} ${rec.last_name}`} sub={rec.course_title || "Application"} onClose={onClose}>
      <div className="mt-5 grid gap-3 rounded-2xl bg-ink p-4 text-white sm:grid-cols-2">
        <div>
          <span className="mb-1 block text-xs text-white/60">Status</span>
          <StatusPill s={rec.status} />
        </div>
        <div>
          <span className="mb-1 block text-xs text-white/60">Application fee</span>
          <StatusPill s={rec.payment_status || "unpaid"} />
        </div>
        {rec.status === "pending" ? (
          <>
            <button onClick={onApprove} className="btn-lime">Approve & create account</button>
            <button onClick={onReject} className="btn bg-white/10 text-white hover:bg-white/20">Reject</button>
          </>
        ) : rec.status === "approved" ? (
          <button onClick={onResend} className="btn-lime sm:col-span-2">Resend login credentials</button>
        ) : null}
        <a href={`mailto:${rec.email}?subject=Your GITB application`} className="btn bg-white/10 text-white hover:bg-white/20 sm:col-span-2"><Mail size={15} /> Email applicant</a>
      </div>

      {Array.isArray(rec.programs) && rec.programs.length > 1 && (
        <Block title="All programme choices (ranked)">
          <ol className="space-y-1 text-sm">
            {rec.programs.map((p: string, i: number) => <li key={p}><strong>{i + 1}.</strong> {p}</li>)}
          </ol>
        </Block>
      )}
      <Block title="Profile & contact">
        <Rows
          rows={[
            ["Name", `${rec.first_name} ${rec.last_name}`],
            ["Date of birth", rec.date_of_birth],
            ["Citizenship", rec.citizenship],
            ["Country", rec.country],
            ["Email", rec.email],
            ["Phone", rec.phone],
            ["City / address", [rec.city, rec.address].filter(Boolean).join(", ")],
          ]}
        />
      </Block>
      {(Array.isArray(rec.education) && rec.education.length > 0) || (Array.isArray(rec.languages) && rec.languages.length > 0) ? (
        <Block title="Education & languages">
          <ul className="space-y-1 text-sm">
            {(rec.education || []).map((e: any, i: number) => (
              <li key={i}><strong>{e.level}</strong> — {e.institution}{e.field && `, ${e.field}`}</li>
            ))}
            {(rec.languages || []).map((l: any, i: number) => (
              <li key={`l${i}`} className="text-sub">{l.language}: {l.level || "—"}</li>
            ))}
          </ul>
        </Block>
      ) : null}
      <Block title="Documents">
        {!Array.isArray(rec.documents) || rec.documents.length === 0 ? (
          <p className="text-sm text-sub">None uploaded.</p>
        ) : (
          <ul className="space-y-1.5 text-sm">
            {rec.documents.map((d: any) => (
              <li key={d.id} className="flex items-center gap-2">
                <FileText size={15} className="text-forest" />
                <a href={d.url} target="_blank" rel="noreferrer" className="hover:underline">{d.name}</a>
                <span className="text-sub">· {d.type}</span>
              </li>
            ))}
          </ul>
        )}
      </Block>
      <Block title="Motivation">
        <p className="whitespace-pre-line text-sm leading-relaxed">{rec.motivation || "—"}</p>
      </Block>
      {(rec.referred_by_code || rec.attached_coupon_code) && (
        <Block title="Referral / coupon">
          <Rows rows={[["Referred by", rec.referred_by_code], ["Coupon", rec.attached_coupon_code]]} />
        </Block>
      )}
      <p className="mt-4 text-xs text-sub">Submitted {new Date(rec.created_at).toLocaleString()}</p>
    </Drawer>
  );
}

const INTERNSHIP_STATUSES = ["Submitted", "Reviewing", "Interview", "Accepted", "Rejected"];

function InternshipDrawer({ rec, onClose, update }: { rec: any; onClose: () => void; update: (p: any) => void }) {
  return (
    <Drawer title={`${rec.first_name} ${rec.last_name}`} sub={rec.reference} onClose={onClose}>
      <div className="mt-5 grid gap-3 rounded-2xl bg-ink p-4 text-white sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs text-white/60">Status</span>
          <select value={rec.status} onChange={(e) => update({ status: e.target.value })} className="field !bg-white !text-ink">
            {INTERNSHIP_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <a href={`mailto:${rec.email}?subject=Your GITB internship application ${rec.reference}`} className="btn-lime self-end"><Mail size={15} /> Email applicant</a>
      </div>
      <Block title="Internship">
        <Rows rows={[["Track", rec.track_title], ["Length", `${rec.duration_months} months`], ["Earliest start", rec.start_date], ["Availability", rec.hours_per_week]]} />
      </Block>
      <Block title="Applicant">
        <Rows rows={[["Email", rec.email], ["Phone", rec.phone], ["Country", rec.country], ["Education", rec.education], ["GITB status", rec.gitb_status], ["LinkedIn", rec.linkedin], ["Portfolio", rec.portfolio]]} />
      </Block>
      <Block title="Files">
        <p className="flex items-center gap-2 text-sm"><FileText size={15} className="text-forest" /><a href={rec.cv_url} target="_blank" rel="noreferrer" className="hover:underline">CV: {rec.cv_name}</a></p>
        {rec.cover_letter_url && <p className="mt-1 flex items-center gap-2 text-sm"><FileText size={15} className="text-forest" /><a href={rec.cover_letter_url} target="_blank" rel="noreferrer" className="hover:underline">Cover letter: {rec.cover_letter_name}</a></p>}
      </Block>
      <Block title="Motivation">
        <p className="whitespace-pre-line text-sm leading-relaxed">{rec.motivation}</p>
      </Block>
      <label className="mt-5 block">
        <span className="label">Internal note</span>
        <textarea value={rec.note || ""} onChange={(e) => update({ note: e.target.value })} rows={3} className="field resize-y" placeholder="Visible to staff only" />
      </label>
      <p className="mt-4 text-xs text-sub">Received {new Date(rec.created_at).toLocaleString()}</p>
    </Drawer>
  );
}
