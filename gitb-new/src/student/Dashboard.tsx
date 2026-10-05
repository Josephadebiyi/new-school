import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, Monitor, ClipboardList, CreditCard, User, LogOut,
  Menu, X, CheckCircle, Circle, Play, FileText,
  Link as LinkIcon, File, Clock, Award, AlertCircle, Upload, Save,
  ExternalLink, TrendingUp, BookMarked, XCircle, Loader2, Video, Calendar,
} from "lucide-react";
import { Scene, Logo } from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import { CountryPicker, openFlutterwaveCheckout, type PaymentSession } from "../components/Payment";
import {
  getMyCourses, getMyEnrollments, getCourseMaterials, getCourseQuizzes,
  getQuizById, submitQuiz, getMyQuizResults, markLessonComplete,
  getCourseProgress, createTuitionPayment, updateProfile, uploadFile,
  fetchCourses, studentAddCourse, getMyReferrals, fetchConfig, getMyLiveLessons,
} from "../services/api";

function isYouTube(url: string) {
  return url && (url.includes("youtube.com") || url.includes("youtu.be"));
}
function getYouTubeEmbedUrl(url: string) {
  if (!url) return "";
  const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}
function groupByWeek(materials: any[]) {
  const groups: Record<string, any[]> = {};
  (materials || []).forEach((m) => {
    const week = m.week ?? m.week_number ?? 1;
    if (!groups[week]) groups[week] = [];
    groups[week].push(m);
  });
  return groups;
}
function TypeIcon({ type }: { type: string }) {
  switch ((type || "").toLowerCase()) {
    case "video": return <Play size={14} className="text-forest" />;
    case "pdf": return <FileText size={14} className="text-orange" />;
    case "link": return <LinkIcon size={14} className="text-forest" />;
    default: return <File size={14} className="text-sub" />;
  }
}

export function StudentDashboard() {
  const { user, token, logout, updateUser }: any = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [courses, setCourses] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<any>(null);
  const [myResults, setMyResults] = useState<any[]>([]);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [addingCourse, setAddingCourse] = useState("");
  const [addCourseMsg, setAddCourseMsg] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentModal, setPaymentModal] = useState<any>(null);
  const [paymentCountry, setPaymentCountry] = useState("");
  const [paymentCoupon, setPaymentCoupon] = useState("");
  const [profileForm, setProfileForm] = useState({ first_name: "", last_name: "", phone: "", profilePicture: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quizTimeLeft, setQuizTimeLeft] = useState<number | null>(null);
  const [referrals, setReferrals] = useState<any>(null);
  const [referralCopied, setReferralCopied] = useState(false);
  const [banner, setBanner] = useState<any>(null);
  const [liveLessons, setLiveLessons] = useState<any[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    const status = searchParams.get("payment");
    if (status === "success") {
      setError("");
      setPaymentSuccess(true);
      loadInitial();
      setSearchParams({}, { replace: true });
      setActiveView("dashboard");
    } else if (status === "cancelled") {
      setError("Payment was cancelled. You can try again anytime.");
      setSearchParams({}, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadInitial() {
    setLoading(true); setError("");
    try {
      const [coursesData, enrollData, resultsData, allCoursesData, referralsData, configData, lessonsData] = await Promise.allSettled([
        getMyCourses(token), getMyEnrollments(token), getMyQuizResults(token), fetchCourses(),
        getMyReferrals(token), fetchConfig(), getMyLiveLessons(token),
      ]);
      const c = coursesData.status === "fulfilled" ? coursesData.value : [];
      const e = enrollData.status === "fulfilled" ? enrollData.value : [];
      const r = resultsData.status === "fulfilled" ? resultsData.value : [];
      if (allCoursesData.status === "fulfilled") setAllCourses(Array.isArray(allCoursesData.value) ? allCoursesData.value : []);
      if (referralsData.status === "fulfilled") setReferrals(referralsData.value);
      if (lessonsData.status === "fulfilled") setLiveLessons(Array.isArray(lessonsData.value) ? lessonsData.value : []);
      if (configData.status === "fulfilled" && (configData.value as any)?.dashboardBanner?.imageUrl) setBanner((configData.value as any).dashboardBanner);
      setCourses(c);
      setEnrollments(Array.isArray(e) ? e : []);
      setMyResults(Array.isArray(r) ? r : []);
      if (user) setProfileForm({ first_name: user.first_name || "", last_name: user.last_name || "", phone: user.phone || "", profilePicture: user.profile_picture || user.profilePicture || "" });
      if (c.length > 0) {
        const progressMap: Record<string, number> = {};
        await Promise.allSettled(c.map(async (course: any) => {
          try { const p = await getCourseProgress(token, course.id); progressMap[course.id] = p?.percentage ?? 0; }
          catch { progressMap[course.id] = 0; }
        }));
        setProgress(progressMap);
      }
    } catch { setError("Failed to load dashboard data. Please refresh."); }
    finally { setLoading(false); }
  }

  const loadCourseData = useCallback(async (course: any) => {
    if (!course) return;
    setSelectedCourse(course); setMaterials([]); setQuizzes([]); setSelectedMaterial(null); setActiveQuiz(null); setQuizResult(null);
    try {
      const [matsData, quizData, progressData] = await Promise.allSettled([
        getCourseMaterials(token, course.id), getCourseQuizzes(token, course.id), getCourseProgress(token, course.id),
      ]);
      if (matsData.status === "fulfilled") {
        const completedIds = new Set(
          progressData.status === "fulfilled" ? ((progressData.value as any)?.completed_lesson_ids || []) : [],
        );
        const mats = (Array.isArray(matsData.value) ? matsData.value : []).map((m: any) => ({ ...m, completed: completedIds.has(m.id) }));
        setMaterials(mats);
      }
      if (quizData.status === "fulfilled") setQuizzes(Array.isArray(quizData.value) ? quizData.value : []);
    } catch { /* silently fail */ }
  }, [token]);

  function openStudy(course: any) { loadCourseData(course); setActiveView("study"); setMobileOpen(false); }
  function openQuizzes(course: any) { loadCourseData(course); setActiveView("quizzes"); setMobileOpen(false); }

  async function handleMarkComplete(material: any) {
    if (!selectedCourse) return;
    try {
      await markLessonComplete(token, selectedCourse.id, material.id);
      setMaterials((prev) => prev.map((m) => (m.id === material.id ? { ...m, completed: true } : m)));
      const p = await getCourseProgress(token, selectedCourse.id);
      setProgress((prev) => ({ ...prev, [selectedCourse.id]: p?.percentage ?? 0 }));
    } catch { /* ignore */ }
  }

  function selectMaterial(material: any) { setSelectedMaterial(material); }

  async function startQuiz(quiz: any) {
    try {
      const full = await getQuizById(token, quiz.id);
      setActiveQuiz(full); setQuizAnswers({}); setQuizResult(null);
      const mins = full.time_limit_minutes ?? full.time_limit ?? 0;
      setQuizTimeLeft(mins > 0 ? mins * 60 : null);
    } catch { setError("Failed to load quiz."); }
  }

  useEffect(() => {
    if (quizTimeLeft === null) return;
    if (quizTimeLeft <= 0) { handleSubmitQuiz(); return; }
    timerRef.current = setTimeout(() => setQuizTimeLeft((t) => (t ?? 0) - 1), 1000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizTimeLeft]);

  async function handleSubmitQuiz() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setQuizTimeLeft(null);
    if (!activeQuiz) return;
    try {
      const answers = Object.entries(quizAnswers).map(([question_id, selected_answer]) => ({ question_id, selected_answer }));
      const result = await submitQuiz(token, activeQuiz.id, answers);
      setQuizResult(result); setActiveQuiz(null);
      const r = await getMyQuizResults(token); setMyResults(Array.isArray(r) ? r : []);
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to submit quiz."); }
  }

  function handlePayment(courseIdOrEnrollment: any, explicitPlan: string | null = null) {
    const courseId = typeof courseIdOrEnrollment === "string"
      ? courseIdOrEnrollment
      : courseIdOrEnrollment.course_id || courseIdOrEnrollment.courseId;
    const plan = explicitPlan
      || (typeof courseIdOrEnrollment === "object" ? courseIdOrEnrollment?.payment_plan : null)
      || "one_time";
    setPaymentModal({ courseId, plan, preview: null });
    setPaymentCountry("");
    setPaymentCoupon("");
  }

  async function preparePayment() {
    if (!paymentModal || !paymentCountry) return;
    setPaymentLoading(true); setError("");
    try {
      const data = await createTuitionPayment(token, paymentModal.courseId, paymentModal.plan, paymentCountry, paymentCoupon);
      const payload: any = (data as any)?.data || data;
      if (payload?.fully_covered) {
        setPaymentSuccess(true);
        setPaymentModal(null);
        await loadInitial();
        return;
      }
      setPaymentModal((prev: any) => ({ ...prev, preview: payload }));
    } catch (err) { setError(err instanceof Error ? err.message : "Payment failed. Please try again."); }
    finally { setPaymentLoading(false); }
  }

  function executePayment() {
    const payment: PaymentSession = paymentModal?.preview;
    if (!payment) return;
    setError("");
    try {
      openFlutterwaveCheckout(payment, {
        title: "GITB Tuition Payment",
        description: `Tuition — ${(payment as any).course_title || ""}`,
        onSuccessRef: async () => {
          setPaymentModal(null);
          setPaymentSuccess(true);
          await loadInitial();
        },
        onClose: () => setError("Payment was cancelled. You can try again anytime."),
      });
    } catch (err) { setError(err instanceof Error ? err.message : "Could not open payment window."); }
  }

  async function handleAddCourse(courseId: string) {
    setAddingCourse(courseId); setAddCourseMsg("");
    try {
      await studentAddCourse(token, courseId);
      setAddCourseMsg("Course added! Pay tuition to unlock full access.");
      await loadInitial();
    } catch (err) {
      setAddCourseMsg(err instanceof Error ? err.message : "Failed to add course.");
    } finally { setAddingCourse(""); }
  }

  async function handleProfileImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    try { const data = await uploadFile(token, file); setProfileForm((p) => ({ ...p, profilePicture: data.url })); }
    catch { setProfileMsg("Image upload failed."); }
  }

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault(); setProfileSaving(true); setProfileMsg("");
    try {
      await updateProfile(token, { first_name: profileForm.first_name, last_name: profileForm.last_name, phone: profileForm.phone, profilePicture: profileForm.profilePicture });
      updateUser({ first_name: profileForm.first_name, last_name: profileForm.last_name, phone: profileForm.phone, profilePicture: profileForm.profilePicture });
      setProfileMsg("Profile updated successfully.");
    } catch { setProfileMsg("Failed to update profile."); }
    finally { setProfileSaving(false); }
  }

  function handleLogout() { logout(); navigate("/login"); }
  function formatTimer(s: number) { const m = Math.floor(s / 60); const sec = s % 60; return `${m}:${sec.toString().padStart(2, "0")}`; }

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "browse", label: "Browse Courses", icon: BookOpen },
    { id: "study", label: "Study Room", icon: Monitor },
    { id: "quizzes", label: "Quizzes", icon: ClipboardList },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "profile", label: "Profile", icon: User },
  ];

  // ─── VIEWS ────────────────────────────────────────────────────────────────

  function DashboardView() {
    const total = courses.length;
    const completed = courses.filter((c) => (progress[c.id] ?? 0) >= 100).length;
    const avg = total > 0 ? Math.round(courses.reduce((s, c) => s + (progress[c.id] ?? 0), 0) / total) : 0;
    return (
      <div className="space-y-6">
        <div className="rounded-[24px] bg-ink p-6 text-white">
          <h2 className="font-display text-2xl">Welcome back, {user?.first_name || "Student"}!</h2>
          <p className="mt-1 text-sm text-white/65">Keep up the great work — you're on your way to success.</p>
        </div>
        {banner?.imageUrl && (
          banner.linkUrl ? (
            <a href={banner.linkUrl} target={banner.linkUrl.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="block overflow-hidden rounded-2xl">
              <img src={banner.imageUrl} alt="" className="h-auto w-full" />
            </a>
          ) : (
            <div className="overflow-hidden rounded-2xl">
              <img src={banner.imageUrl} alt="" className="h-auto w-full" />
            </div>
          )
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: "Enrolled Courses", value: total, icon: BookOpen },
            { label: "Completed", value: completed, icon: Award },
            { label: "Avg. Progress", value: `${avg}%`, icon: TrendingUp },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-2xl bg-white/70 p-5">
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-lime/40 text-forest"><Icon size={20} /></div>
              <p className="font-display text-2xl">{value}</p>
              <p className="mt-0.5 text-sm text-sub">{label}</p>
            </div>
          ))}
        </div>
        {(() => {
          const upcoming = liveLessons
            .filter((l) => new Date(l.scheduled_at).getTime() + l.duration_minutes * 60000 >= Date.now())
            .slice(0, 3);
          if (upcoming.length === 0) return null;
          return (
            <div>
              <h3 className="mb-3 font-display text-sm uppercase">Upcoming Live Lessons</h3>
              <div className="space-y-3">
                {upcoming.map((l) => {
                  const start = new Date(l.scheduled_at).getTime();
                  const end = start + l.duration_minutes * 60000;
                  const now = Date.now();
                  const canJoin = now >= start - 10 * 60000 && now <= end;
                  return (
                    <div key={l.id} className="flex flex-wrap items-center gap-4 rounded-2xl bg-white/70 p-4">
                      <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-lime/40"><Video size={18} className="text-forest" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{l.title}</p>
                        <p className="text-xs text-sub">{l.course_title} · <Calendar size={11} className="inline" /> {new Date(l.scheduled_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })} · {l.duration_minutes} min</p>
                      </div>
                      {canJoin ? (
                        <a href={l.meeting_url} target="_blank" rel="noreferrer" className="btn-dark !py-2 text-sm">Join now <ExternalLink size={13} /></a>
                      ) : (
                        <span className="rounded-full bg-chip px-3 py-1.5 text-xs font-semibold text-sub">Opens 10 min before</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
        <div>
          <h3 className="mb-3 font-display text-sm uppercase">My Courses</h3>
          {courses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-ink/15 bg-white/50 p-8 text-center">
              <BookMarked size={40} className="mx-auto mb-3 text-sub/50" />
              <p className="text-sub">You are not enrolled in any courses yet.</p>
              <button onClick={() => navigate("/courses")} className="btn-dark mt-4">Browse Courses</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {courses.map((course) => (
                <div key={course.id} className="overflow-hidden rounded-2xl bg-white/70">
                  {course.img && <img src={course.img} alt={course.title} className="h-36 w-full object-cover" />}
                  <div className="p-4">
                    <h4 className="mb-1 truncate font-semibold">{course.title}</h4>
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-2 flex-1 rounded-full bg-ink/10">
                        <div className="h-2 rounded-full bg-lime transition-all duration-500" style={{ width: `${progress[course.id] ?? 0}%` }} />
                      </div>
                      <span className="whitespace-nowrap text-xs text-sub">{progress[course.id] ?? 0}%</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openStudy(course)} className="btn-dark flex-1 !py-1.5 text-sm">Study</button>
                      <button onClick={() => openQuizzes(course)} className="btn-ghost flex-1 !py-1.5 text-sm">Quizzes</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {myResults.length > 0 && (
          <div>
            <h3 className="mb-3 font-display text-sm uppercase">Recent Quiz Results</h3>
            <div className="divide-y divide-ink/5 rounded-2xl bg-white/70">
              {myResults.slice(0, 5).map((result, i) => (
                <div key={result.id || i} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{result.quiz_title || `Quiz ${i + 1}`}</p>
                    <p className="text-xs text-sub">{result.course_title || ""}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-sm font-bold ${result.passed ? "bg-lime/50 text-forest" : "bg-orange/15 text-[#8a3d00]"}`}>
                    {Math.round(result.percentage ?? result.score ?? 0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {referrals && (
          <div>
            <h3 className="mb-3 font-display text-sm uppercase">Refer a Friend, Earn Tuition Credit</h3>
            <div className="rounded-2xl bg-white/70 p-5">
              <p className="mb-3 text-sm text-sub">
                Share your link. When a friend enrolls and pays their tuition, you earn a {referrals.reward_percent ?? 10}% credit toward your
                own — credits stack and apply automatically to your next payment.
              </p>
              <div className="mb-4 flex flex-col gap-2 sm:flex-row">
                <input readOnly value={referrals.referral_link} className="field flex-1 text-sm" />
                <button
                  onClick={() => { navigator.clipboard.writeText(referrals.referral_link); setReferralCopied(true); setTimeout(() => setReferralCopied(false), 2000); }}
                  className="btn-dark whitespace-nowrap"
                >
                  {referralCopied ? "Copied!" : "Copy Link"}
                </button>
              </div>
              <div className="mb-4 flex items-center justify-between rounded-xl bg-lime/30 px-4 py-3">
                <span className="text-sm font-medium text-ink">Your referral balance</span>
                <span className="font-display text-lg">€{referrals.balance_eur.toFixed(2)}</span>
              </div>
              {referrals.referrals?.length > 0 && (
                <div className="divide-y divide-ink/5">
                  {referrals.referrals.map((r: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-2.5">
                      <div>
                        <p className="text-sm font-medium">{r.referred_name || "Referred student"}</p>
                        <p className="text-xs text-sub">{r.course_title}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${r.status === "rewarded" ? "bg-lime/50 text-forest" : "bg-orange/15 text-[#8a3d00]"}`}>
                        {r.status === "rewarded" ? `+€${r.reward_eur.toFixed(2)}` : "Pending tuition payment"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  function BrowseCoursesView() {
    const enrollmentMap: Record<string, any> = {};
    enrollments.forEach((e) => { enrollmentMap[e.course_id] = e; });

    return (
      <div className="space-y-5">
        <div>
          <h2 className="font-display text-xl">Browse Courses</h2>
          <p className="mt-0.5 text-sm text-sub">Add any course to your dashboard. Pay tuition to unlock full access.</p>
        </div>
        {addCourseMsg && (
          <div className={`rounded-xl px-4 py-3 text-sm font-medium ${addCourseMsg.includes("added") ? "bg-lime/40 text-forest" : "bg-orange/10 text-[#8a3d00]"}`}>{addCourseMsg}</div>
        )}
        {allCourses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink/15 bg-white/50 p-8 text-center">
            <BookOpen size={40} className="mx-auto mb-3 text-sub/50" />
            <p className="text-sub">No courses available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {allCourses.map((course) => {
              const enrollment = enrollmentMap[course.id];
              const isPaid = enrollment?.payment_status === "paid";
              const isPending = enrollment && !isPaid;

              return (
                <div key={course.id} className="flex flex-col overflow-hidden rounded-2xl bg-white/70">
                  <div className="relative">
                    {course.img && <img src={course.img} alt={course.title} className="h-36 w-full object-cover" />}
                    {isPaid && <span className="absolute right-2 top-2 rounded-full bg-lime px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-ink">Enrolled</span>}
                    {isPending && <span className="absolute right-2 top-2 rounded-full bg-orange/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Unpaid</span>}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h4 className="mb-1 truncate font-semibold">{course.title}</h4>
                    <p className="mb-1 text-xs text-sub">{course.category} {course.duration ? `· ${course.duration}` : ""}</p>
                    <p className="mb-3 line-clamp-2 flex-1 text-xs text-sub">{course.description}</p>
                    {course.price?.upfront > 0 && (
                      <p className="mb-3 text-sm font-bold">
                        €{course.price.upfront.toLocaleString()}
                        {course.price.monthly > 0 && <span className="ml-1 text-xs font-normal text-sub">or €{course.price.monthly}/mo</span>}
                      </p>
                    )}
                    {isPaid ? (
                      <button onClick={() => openStudy(courses.find((c) => c.id === course.id) || course)} className="btn-dark w-full text-sm">
                        Open Course
                      </button>
                    ) : isPending ? (
                      <div className="space-y-2">
                        <p className="rounded-lg bg-orange/10 px-3 py-1.5 text-center text-xs text-[#8a3d00]">Added — pay tuition to unlock</p>
                        <div className="flex gap-2">
                          {course.price?.monthly > 0 && (
                            <button onClick={() => handlePayment(course.id, "monthly")} disabled={paymentLoading} className="btn-ghost flex-1 text-xs disabled:opacity-50">
                              {paymentLoading ? "…" : `€${course.price.monthly}/mo`}
                            </button>
                          )}
                          <button onClick={() => handlePayment(course.id, "one_time")} disabled={paymentLoading} className="btn-dark flex-1 text-xs disabled:opacity-50">
                            {paymentLoading ? "…" : course.price?.upfront > 0 ? `€${course.price.upfront} full` : "Pay Tuition"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => handleAddCourse(course.id)} disabled={addingCourse === course.id} className="btn-dark w-full text-sm disabled:opacity-50">
                        {addingCourse === course.id ? "Adding…" : "+ Add to Dashboard"}
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
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-display text-xl">Study Room</h2>
          {courses.length > 0 && (
            <select value={selectedCourse?.id || ""} onChange={(e) => { const c = courses.find((x) => x.id === e.target.value); if (c) loadCourseData(c); }} className="field !w-auto !py-1.5 text-sm">
              <option value="">Select a course</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          )}
        </div>
        {!selectedCourse ? (
          <div className="rounded-2xl border border-dashed border-ink/15 bg-white/50 p-8 text-center"><Monitor size={40} className="mx-auto mb-3 text-sub/50" /><p className="text-sub">Select a course above to start studying.</p></div>
        ) : (() => {
          const enrollment = enrollments.find((e) => e.course_id === selectedCourse.id);
          const isPaid = enrollment?.payment_status === "paid" || !enrollment;
          if (!isPaid) return (
            <div className="rounded-2xl bg-white/70 p-10 text-center">
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-orange/15">
                <CreditCard size={28} className="text-[#8a3d00]" />
              </div>
              <h3 className="mb-2 font-display text-lg">Tuition Payment Required</h3>
              <p className="mx-auto mb-5 max-w-sm text-sm text-sub">Pay your tuition fee to unlock all materials, assignments, and quizzes for <strong>{selectedCourse.title}</strong>.</p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                {selectedCourse.price?.monthly > 0 && (
                  <button onClick={() => handlePayment(selectedCourse.id, "monthly")} disabled={paymentLoading} className="btn-ghost disabled:opacity-50">
                    {paymentLoading ? "Starting…" : `Pay €${selectedCourse.price.monthly}/month`}
                  </button>
                )}
                <button onClick={() => handlePayment(selectedCourse.id, "one_time")} disabled={paymentLoading} className="btn-dark disabled:opacity-50">
                  {paymentLoading ? "Starting…" : selectedCourse.price?.upfront > 0 ? `Pay €${selectedCourse.price.upfront} in full` : "Pay Tuition Now"}
                </button>
              </div>
            </div>
          );
          return (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="space-y-3 lg:col-span-1">
                <div className="rounded-2xl bg-white/70 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm font-bold text-forest">{progress[selectedCourse.id] ?? 0}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-ink/10">
                    <div className="h-2 rounded-full bg-lime transition-all duration-500" style={{ width: `${progress[selectedCourse.id] ?? 0}%` }} />
                  </div>
                </div>
                {weeks.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-ink/15 bg-white/50 p-6 text-center"><p className="text-sm text-sub">No materials available yet.</p></div>
                ) : weeks.map((week) => (
                  <div key={week} className="overflow-hidden rounded-2xl bg-white/70">
                    <div className="bg-ink px-4 py-2 text-xs font-bold uppercase tracking-wider text-white">Week {week}</div>
                    <div className="divide-y divide-ink/5">
                      {weekGroups[week].map((mat) => (
                        <button key={mat.id} onClick={() => selectMaterial(mat)} className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white ${selectedMaterial?.id === mat.id ? "bg-lime/20" : ""}`}>
                          <div className="mt-0.5 flex-shrink-0">{mat.completed ? <CheckCircle size={16} className="text-forest" /> : <Circle size={16} className="text-sub/40" />}</div>
                          <div className="min-w-0">
                            <div className="mb-0.5 flex items-center gap-1.5"><TypeIcon type={mat.type} /><span className="text-xs capitalize text-sub">{mat.type}</span></div>
                            <p className="truncate text-sm font-medium">{mat.title}</p>
                            {mat.description && <p className="mt-0.5 line-clamp-2 text-xs text-sub">{mat.description}</p>}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="lg:col-span-2">
                {!selectedMaterial ? (
                  <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-ink/15 bg-white/50 p-8 text-center"><BookOpen size={40} className="mb-3 text-sub/50" /><p className="text-sub">Select a lesson to begin.</p></div>
                ) : (
                  <div className="overflow-hidden rounded-2xl bg-white/70">
                    <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
                      <div>
                        <div className="mb-0.5 flex items-center gap-2"><TypeIcon type={selectedMaterial.type} /><span className="text-xs capitalize text-sub">{selectedMaterial.type}</span></div>
                        <h3 className="font-semibold">{selectedMaterial.title}</h3>
                      </div>
                      {selectedMaterial.completed
                        ? <span className="flex items-center gap-1 text-sm font-medium text-forest"><CheckCircle size={16} /> Completed</span>
                        : <button onClick={() => handleMarkComplete(selectedMaterial)} className="btn-dark !py-1.5 text-sm"><CheckCircle size={14} /> Mark Done</button>}
                    </div>
                    <div className="p-5">
                      {selectedMaterial.description && <p className="mb-4 text-sm text-sub">{selectedMaterial.description}</p>}
                      {selectedMaterial.type === "video" && selectedMaterial.url && (
                        isYouTube(selectedMaterial.url)
                          ? <div className="aspect-video overflow-hidden rounded-lg bg-black"><iframe src={getYouTubeEmbedUrl(selectedMaterial.url)} title={selectedMaterial.title} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>
                          : <video src={selectedMaterial.url} controls className="w-full rounded-lg bg-black" />
                      )}
                      {selectedMaterial.type === "pdf" && selectedMaterial.url && (
                        <a href={selectedMaterial.url} target="_blank" rel="noopener noreferrer" className="btn-dark inline-flex text-sm"><FileText size={16} /> Open PDF <ExternalLink size={14} /></a>
                      )}
                      {selectedMaterial.type === "link" && selectedMaterial.url && (
                        <a href={selectedMaterial.url} target="_blank" rel="noopener noreferrer" className="btn-dark inline-flex text-sm"><LinkIcon size={16} /> Open Link <ExternalLink size={14} /></a>
                      )}
                      {selectedMaterial.type !== "video" && selectedMaterial.type !== "pdf" && selectedMaterial.type !== "link" && selectedMaterial.url && (
                        <a href={selectedMaterial.url} target="_blank" rel="noopener noreferrer" className="btn-dark inline-flex text-sm"><File size={16} /> Open File <ExternalLink size={14} /></a>
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
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="rounded-2xl bg-white/70 p-8 text-center">
            <div className={`mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full ${passed ? "bg-lime/40" : "bg-orange/15"}`}>
              {passed ? <Award size={40} className="text-forest" /> : <XCircle size={40} className="text-[#8a3d00]" />}
            </div>
            <h3 className="mb-1 font-display text-2xl">{passed ? "Congratulations!" : "Quiz Complete"}</h3>
            <p className="mb-4 text-sub">{passed ? "You passed this quiz." : "You did not reach the passing score."}</p>
            <div className={`mb-2 font-display text-5xl ${passed ? "text-forest" : "text-[#8a3d00]"}`}>{Math.round(pct)}%</div>
            <p className="text-sm text-sub">{quizResult.score} / {quizResult.total_points} points</p>
            {Array.isArray(quizResult.answers) && quizResult.answers.length > 0 && (
              <div className="mt-6 space-y-3 text-left">
                <h4 className="font-display text-xs uppercase">Answer Breakdown</h4>
                {quizResult.answers.map((ans: any, i: number) => (
                  <div key={i} className={`rounded-xl p-4 ${ans.is_correct ? "bg-lime/20" : "bg-orange/10"}`}>
                    <p className="mb-1 text-sm font-medium">Q{i + 1}: {ans.question_text}</p>
                    <p className="text-xs text-sub">Your answer: <span className="font-medium">{ans.selected_answer ?? "(none)"}</span></p>
                    {!ans.is_correct && <p className="mt-0.5 text-xs text-forest">Correct: <span className="font-medium">{ans.correct_answer}</span></p>}
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => { setQuizResult(null); setActiveQuiz(null); }} className="btn-dark mt-6">Back to Quizzes</button>
          </div>
        </div>
      );
    }

    if (activeQuiz) {
      const questions = activeQuiz.questions || [];
      return (
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="flex items-center justify-between rounded-2xl bg-white/70 p-4">
            <h3 className="font-semibold">{activeQuiz.title}</h3>
            {quizTimeLeft !== null && (
              <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold ${quizTimeLeft < 60 ? "bg-orange/15 text-[#8a3d00]" : "bg-lime/40 text-forest"}`}>
                <Clock size={14} />{formatTimer(quizTimeLeft)}
              </div>
            )}
          </div>
          <div className="space-y-4">
            {questions.map((q: any, qi: number) => {
              const options = q.options || q.choices || [];
              return (
                <div key={q.id || qi} className="rounded-2xl bg-white/70 p-5">
                  <p className="mb-3 font-medium"><span className="mr-2 text-sm text-sub">Q{qi + 1}.</span>{q.question || q.text}</p>
                  <div className="space-y-2">
                    {options.map((opt: any, oi: number) => {
                      const optVal = typeof opt === "string" ? opt : opt.text || opt.value;
                      const isSelected = quizAnswers[q.id ?? qi] === optVal;
                      return (
                        <label key={oi} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all ${isSelected ? "border-forest bg-lime/20" : "border-ink/10 hover:bg-white"}`}>
                          <input type="radio" name={`q-${q.id ?? qi}`} value={optVal} checked={isSelected} onChange={() => setQuizAnswers((prev) => ({ ...prev, [q.id ?? qi]: optVal }))} className="accent-[#0b3b2c]" />
                          <span className="text-sm">{optVal}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-3">
            <button onClick={() => { if (timerRef.current) clearTimeout(timerRef.current); setActiveQuiz(null); setQuizTimeLeft(null); }} className="btn-ghost">Cancel</button>
            <button onClick={handleSubmitQuiz} className="btn-dark flex-1">Submit Quiz</button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-display text-xl">Quizzes</h2>
          {courses.length > 0 && (
            <select value={selectedCourse?.id || ""} onChange={(e) => { const c = courses.find((x) => x.id === e.target.value); if (c) loadCourseData(c); }} className="field !w-auto !py-1.5 text-sm">
              <option value="">Select a course</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          )}
        </div>
        {!selectedCourse ? (
          <div className="rounded-2xl border border-dashed border-ink/15 bg-white/50 p-8 text-center"><ClipboardList size={40} className="mx-auto mb-3 text-sub/50" /><p className="text-sub">Select a course to view its quizzes.</p></div>
        ) : quizzes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink/15 bg-white/50 p-8 text-center"><p className="text-sub">No quizzes available for this course yet.</p></div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {quizzes.map((quiz) => {
              const existingResult = myResults.find((r) => r.quiz_id === quiz.id);
              const pct = existingResult?.percentage ?? existingResult?.score;
              const passed = existingResult?.passed ?? (pct != null && pct >= 60);
              return (
                <div key={quiz.id} className="rounded-2xl bg-white/70 p-5">
                  <div className="mb-3 flex items-start justify-between">
                    <div><h4 className="font-semibold">{quiz.title}</h4>{quiz.description && <p className="mt-0.5 text-xs text-sub">{quiz.description}</p>}</div>
                    {existingResult && <span className={`ml-2 flex-shrink-0 rounded-full px-2 py-1 text-xs font-bold ${passed ? "bg-lime/40 text-forest" : "bg-orange/15 text-[#8a3d00]"}`}>{passed ? "Passed" : "Failed"}{pct != null ? ` · ${Math.round(pct)}%` : ""}</span>}
                  </div>
                  <div className="mb-4 flex items-center gap-3 text-xs text-sub">
                    {quiz.time_limit_minutes && <span className="flex items-center gap-1"><Clock size={12} /> {quiz.time_limit_minutes} min</span>}
                  </div>
                  <button onClick={() => startQuiz(quiz)} className="btn-dark w-full text-sm">
                    {existingResult ? "Retake Quiz" : "Start Quiz"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
        {myResults.length > 0 && (
          <div>
            <h3 className="mb-3 mt-6 font-display text-sm uppercase">All My Results</h3>
            <div className="divide-y divide-ink/5 rounded-2xl bg-white/70">
              {myResults.map((r, i) => {
                const pct = r.percentage ?? r.score ?? 0;
                const pass = r.passed ?? pct >= 60;
                return (
                  <div key={r.id || i} className="flex items-center justify-between px-4 py-3">
                    <div><p className="text-sm font-medium">{r.quiz_title || `Quiz ${i + 1}`}</p><p className="text-xs text-sub">{r.course_title || ""}</p></div>
                    <div className="flex items-center gap-2">
                      {pass ? <CheckCircle size={16} className="text-forest" /> : <XCircle size={16} className="text-[#8a3d00]" />}
                      <span className={`text-sm font-bold ${pass ? "text-forest" : "text-[#8a3d00]"}`}>{Math.round(pct)}%</span>
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
        <h2 className="font-display text-xl">Payments</h2>
        {enrollments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink/15 bg-white/50 p-8 text-center"><CreditCard size={40} className="mx-auto mb-3 text-sub/50" /><p className="text-sub">No enrollment payment records found.</p></div>
        ) : (
          <div className="space-y-4">
            {enrollments.map((enrollment, i) => {
              const isPaid = enrollment.payment_status === "paid";
              const isOverdue = enrollment.is_overdue === true;
              const courseName = enrollment.course_title || courses.find((c) => c.id === enrollment.course_id)?.title || `Course ${i + 1}`;
              const plan = enrollment.payment_plan || "one-time";
              const amount = enrollment.amount_due ?? enrollment.balance ?? enrollment.course_price ?? null;
              return (
                <div key={enrollment.id || i} className={`rounded-2xl bg-white/70 p-5 ${isOverdue ? "ring-2 ring-orange/40" : ""}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h4 className="mb-1 font-semibold">{courseName}</h4>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-sub">
                        <span>Plan: <span className="font-medium capitalize text-ink">{plan}</span></span>
                        {amount != null && <span>Amount: <span className="font-medium text-ink">€{Number(amount).toFixed(2)}</span></span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${isPaid ? "bg-lime/40 text-forest" : isOverdue ? "bg-orange/20 text-[#8a3d00]" : "bg-chip text-ink"}`}>
                        {isPaid ? "Paid" : isOverdue ? "Overdue" : "Unpaid"}
                      </span>
                      {!isPaid && (
                        <button disabled={paymentLoading} onClick={() => handlePayment(enrollment)} className="btn-dark !py-2 text-sm disabled:opacity-50">
                          <CreditCard size={14} />{paymentLoading ? "Redirecting…" : "Make Payment"}
                        </button>
                      )}
                    </div>
                  </div>
                  {isOverdue && <div className="mt-3 flex items-center gap-2 text-xs text-[#8a3d00]"><AlertCircle size={14} />Payment overdue. Please pay to maintain course access.</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  function ProfileView() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    return (
      <div className="max-w-lg space-y-5">
        <h2 className="font-display text-xl">My Profile</h2>
        <form onSubmit={handleProfileSave} className="space-y-5 rounded-2xl bg-white/70 p-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-ink/10 bg-chip">
                {profileForm.profilePicture ? <img src={profileForm.profilePicture} alt="Profile" className="h-full w-full object-cover" /> : <User size={32} className="text-sub" />}
              </div>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-ink text-white shadow"><Upload size={13} /></button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleProfileImageUpload} />
            </div>
            <div>
              <p className="font-semibold">{`${profileForm.first_name} ${profileForm.last_name}`.trim() || user?.email}</p>
              <p className="text-sm text-sub">{user?.email}</p>
              <p className="mt-0.5 text-xs capitalize text-sub">{user?.role || "student"}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="label">First Name</span>
              <input type="text" value={profileForm.first_name} onChange={(e) => setProfileForm((p) => ({ ...p, first_name: e.target.value }))} className="field" />
            </label>
            <label className="block">
              <span className="label">Last Name</span>
              <input type="text" value={profileForm.last_name} onChange={(e) => setProfileForm((p) => ({ ...p, last_name: e.target.value }))} className="field" />
            </label>
          </div>
          <label className="block">
            <span className="label">Phone</span>
            <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))} className="field" />
          </label>
          {profileMsg && <p className={`text-sm font-medium ${profileMsg.includes("success") ? "text-forest" : "text-[#8a3d00]"}`}>{profileMsg}</p>}
          <button type="submit" disabled={profileSaving} className="btn-dark w-full disabled:opacity-50">
            <Save size={16} />{profileSaving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>
    );
  }

  // ─── SIDEBAR ──────────────────────────────────────────────────────────────

  function SidebarContent() {
    return (
      <div className="flex h-full flex-col">
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-5">
          <Logo light className="!h-8" />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = activeView === id;
            return (
              <button
                key={id}
                onClick={() => { setActiveView(id); setMobileOpen(false); }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${active ? "bg-lime text-ink" : "text-white/75 hover:bg-white/10"}`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-3">
          <div className="mb-1 px-2 py-2">
            <p className="truncate text-xs font-medium text-white">{`${user?.first_name || ""} ${user?.last_name || ""}`.trim() || user?.email}</p>
            <p className="truncate text-xs text-lime">{user?.email}</p>
          </div>
          <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/70 transition-all hover:bg-white/10">
            <LogOut size={18} /><span>Logout</span>
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <>
        <Scene />
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <Loader2 size={40} className="mx-auto mb-3 animate-spin text-lime" />
            <p className="text-sm text-white/70">Loading your dashboard…</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Scene />
      <div className="mx-auto max-w-[1440px] p-2 sm:p-6">
        <div className="glass-rim rounded-[30px] p-1.5 sm:rounded-[40px] sm:p-2.5">
          <div className="panel flex min-h-[88vh] overflow-hidden rounded-[24px] sm:rounded-[32px]">
            {/* Desktop sidebar */}
            <aside className="hidden w-64 flex-col bg-ink md:flex">
              <SidebarContent />
            </aside>

            {/* Mobile sidebar */}
            {mobileOpen && (
              <>
                <div onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-black/50 md:hidden" />
                <aside className="fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-ink md:hidden">
                  <SidebarContent />
                </aside>
              </>
            )}

            {/* Tuition Payment Modal */}
            {paymentModal && (
              <>
                <div onClick={() => !paymentLoading && setPaymentModal(null)} className="fixed inset-0 z-50 bg-black/50" />
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div className="glass sheen max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[24px] p-6">
                    <h3 className="mb-1 font-display text-lg">Pay Tuition</h3>

                    {!paymentModal.preview ? (
                      <>
                        <p className="mb-5 text-sm text-sub">Select your country of residence to see the amount you'll pay.</p>
                        <CountryPicker country={paymentCountry} onChange={setPaymentCountry} />
                        <div className="mt-4">
                          <label className="label">Coupon Code (optional)</label>
                          <input type="text" value={paymentCoupon} onChange={(e) => setPaymentCoupon(e.target.value.toUpperCase())} placeholder="e.g. SUMMER2026" className="field uppercase" />
                        </div>
                        {error && <p className="mt-4 text-sm font-medium text-[#8a3d00]">{error}</p>}
                        <div className="mt-6 flex gap-3">
                          <button onClick={() => setPaymentModal(null)} disabled={paymentLoading} className="btn-ghost flex-1 disabled:opacity-50">Cancel</button>
                          <button onClick={preparePayment} disabled={paymentLoading || !paymentCountry} className="btn-dark flex-1 disabled:opacity-50">
                            {paymentLoading ? "Calculating…" : "Continue"}
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="mb-4 text-sm text-sub">
                          {paymentModal.preview.total_installments > 1
                            ? `Installment ${paymentModal.preview.installment} of ${paymentModal.preview.total_installments}`
                            : "Full tuition payment"}
                        </p>
                        <div className="mb-4 rounded-2xl bg-ink p-5 text-white">
                          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-white/60">Amount to Pay</p>
                          <p className="font-display text-2xl">{paymentModal.preview.currency} {paymentModal.preview.amount.toLocaleString()}</p>
                          {paymentModal.preview.coupon_discount_applied > 0 && (
                            <p className="mt-1 text-xs text-white/70">Coupon discount applied: -€{paymentModal.preview.coupon_discount_applied.toFixed(2)}</p>
                          )}
                          {paymentModal.preview.referral_discount_applied > 0 && (
                            <p className="mt-1 text-xs text-white/70">Referral balance applied: -€{paymentModal.preview.referral_discount_applied.toFixed(2)}</p>
                          )}
                        </div>
                        {error && <p className="mb-4 text-sm font-medium text-[#8a3d00]">{error}</p>}
                        <div className="flex gap-3">
                          <button onClick={() => setPaymentModal((prev: any) => ({ ...prev, preview: null }))} className="btn-ghost flex-1">Back</button>
                          <button onClick={executePayment} className="btn-dark flex-1">Pay Now</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Main content */}
            <div className="flex min-h-[88vh] flex-1 flex-col">
              <header className="glass sticky top-0 z-20 m-3 flex items-center gap-3 rounded-2xl px-4 py-3 sm:m-5 sm:px-6">
                <button className="rounded-lg p-1.5 hover:bg-white/50 md:hidden" onClick={() => setMobileOpen((o) => !o)}>
                  {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
                <h1 className="flex-1 font-display text-sm uppercase">{navItems.find((n) => n.id === activeView)?.label ?? "Dashboard"}</h1>
                {selectedCourse && (activeView === "study" || activeView === "quizzes") && (
                  <span className="chip hidden !bg-lime sm:flex"><BookOpen size={12} />{selectedCourse.title}</span>
                )}
                <button onClick={() => setActiveView("profile")} className="flex h-8 w-8 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-ink/10 bg-chip hover:border-forest">
                  {profileForm.profilePicture ? <img src={profileForm.profilePicture} alt="" className="h-full w-full object-cover" /> : <User size={16} className="text-sub" />}
                </button>
              </header>

              <main className="flex-1 px-3 pb-6 sm:px-5">
                {paymentSuccess && (
                  <div className="mb-4 flex items-center gap-3 rounded-xl bg-lime/40 px-4 py-3 text-sm text-ink">
                    <CheckCircle size={18} className="flex-shrink-0 text-forest" />
                    <span className="flex-1 font-medium">Payment successful! Your course is now unlocked — click "Open Course" to start learning.</span>
                    <button onClick={() => setPaymentSuccess(false)}><X size={14} /></button>
                  </div>
                )}
                {error && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl bg-orange/10 px-4 py-3 text-sm text-[#8a3d00]">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    <span className="flex-1">{error}</span>
                    <button onClick={() => setError("")}><X size={14} /></button>
                  </div>
                )}
                {activeView === "dashboard" && <DashboardView />}
                {activeView === "browse" && <BrowseCoursesView />}
                {activeView === "study" && <StudyView />}
                {activeView === "quizzes" && <QuizView />}
                {activeView === "payments" && <PaymentsView />}
                {activeView === "profile" && <ProfileView />}
              </main>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
