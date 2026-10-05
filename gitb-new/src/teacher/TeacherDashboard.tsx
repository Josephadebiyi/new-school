import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, LogOut } from "lucide-react";
import { Scene, Logo } from "../components/Layout";
import { useAuth } from "../context/AuthContext";

/**
 * Placeholder — the full teacher portal (courses, students, grading, quizzes,
 * contracts) is a large surface still on the previous design and hasn't been
 * ported into the new UI yet. This exists so the real, working login +
 * `/teacher/dashboard` link (already sent in emails) doesn't 404.
 */
export function TeacherDashboard() {
  const { user, logout }: any = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <>
      <Scene />
      <div className="mx-auto max-w-3xl p-4 pt-20 sm:p-8">
        <Link to="/" className="mb-6 flex justify-center">
          <Logo light />
        </Link>
        <div className="glass sheen rounded-[28px] p-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-lime/40">
            <GraduationCap size={24} className="text-forest" />
          </div>
          <h1 className="display text-2xl">Hello, {user?.first_name || "Teacher"}</h1>
          <p className="mt-3 text-sub">
            The teacher portal is being migrated to the new design. Your courses, students and grading tools are not yet available here —
            contact an administrator if you need access now.
          </p>
          <button onClick={handleLogout} className="btn-dark mx-auto mt-6">
            <LogOut size={15} /> Log out
          </button>
        </div>
      </div>
    </>
  );
}
