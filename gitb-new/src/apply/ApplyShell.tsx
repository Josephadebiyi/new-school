import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ExternalLink, Menu, UserRound, X } from "lucide-react";
import { Scene, Logo } from "../components/Layout";
import { contact, type Course } from "../data/site";

/**
 * Where an "Apply now!" button should go. There's no account/login gate in
 * front of the wizard — it's an anonymous flow (like the rest of GITB's
 * admissions process), the draft autosaves to this browser, and the one
 * real account created is the student's, at admin-approval time.
 */
export function useApplyHref() {
  return (slug?: string) => `/apply/portal${slug ? `?program=${slug}` : ""}`;
}

export function Badge({ course }: { course: Course }) {
  return (
    <span
      className={`inline-grid h-6 min-w-11 place-items-center rounded-md px-1.5 font-display text-[10px] ${
        course.type === "language" ? "bg-orange/15 text-[#9a4a00]" : "bg-ink/10 text-ink"
      }`}
    >
      {course.type === "language" ? "LANG" : "PRO"}
    </span>
  );
}

/** Admissions-portal chrome, modelled on DreamApply: menu · institution · sign in / register. */
export function ApplyShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    setOpen(false);
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <>
      <Scene />
      <div className="mx-auto max-w-[1440px] px-2 py-2 sm:px-6 sm:py-6">
        <div className="glass-rim rounded-[30px] p-1.5 sm:rounded-[40px] sm:p-2.5">
          <div className="panel relative min-h-[90vh] overflow-hidden rounded-[24px] sm:rounded-[32px]">
            <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5 sm:pt-4">
              <div className="glass sheen flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 sm:px-5">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setOpen((o) => !o)}
                    className="grid h-10 w-10 place-items-center rounded-xl hover:bg-white/70"
                    aria-label="Menu"
                    aria-expanded={open}
                  >
                    {open ? <X size={21} /> : <Menu size={21} />}
                  </button>
                  <Link to="/apply" className="flex items-center gap-3">
                    <Logo className="!h-8" />
                    <span className="hidden border-l border-ink/15 pl-3 text-sm font-semibold text-sub sm:block">Admissions</span>
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <span className="hidden rounded-xl bg-chip px-3 py-2 text-[13px] font-semibold md:block">EN</span>
                  <Link to="/apply/portal" className="btn-dark !py-2.5">
                    <UserRound size={16} /> My application
                  </Link>
                </div>
              </div>
              {open && (
                <nav className="glass mt-2 grid gap-1 rounded-2xl p-2 sm:max-w-xs">
                  {[
                    ["/apply", "Home"],
                    ["/apply/courses", "Find programmes"],
                    ["/apply/portal", "My application"],
                  ].map(([to, label]) => (
                    <NavLink
                      key={to}
                      to={to}
                      end
                      className={({ isActive }) => `rounded-xl px-4 py-2.5 font-semibold ${isActive ? "bg-lime" : "hover:bg-white/70"}`}
                    >
                      {label}
                    </NavLink>
                  ))}
                  <a href={`mailto:${contact.admissions}`} className="rounded-xl px-4 py-2.5 font-semibold hover:bg-white/70">
                    Contact admissions
                  </a>
                  <Link to="/" className="flex items-center gap-2 rounded-xl px-4 py-2.5 font-semibold text-sub hover:bg-white/70">
                    Back to gitb.lt <ExternalLink size={14} />
                  </Link>
                </nav>
              )}
            </header>

            <main>{children}</main>

            <footer className="mt-16 px-3 pb-3 sm:px-5 sm:pb-5">
              <div className="flex flex-col gap-3 rounded-[22px] bg-ink px-6 py-6 text-sm text-white/65 sm:flex-row sm:items-center sm:justify-between">
                <span className="flex items-center gap-3">
                  <Logo light className="!h-7" /> Admissions · {contact.city}
                </span>
                <span>
                  {contact.admissions} · {contact.hours}
                </span>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
}
