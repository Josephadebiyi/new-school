import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu, X, Mail, MapPin } from "lucide-react";
import { contact, nav } from "../data/site";
import { Sparkle } from "./Sparkle";

/** Fixed 3D-style environment: green sky, glossy orbs, frosted glass slabs, reflective floor. */
export function Scene() {
  return (
    <div aria-hidden className="scene fixed inset-0 -z-10 overflow-hidden">
      <div className="orb float-slow absolute left-1/2 top-[-18vh] h-[58vh] w-[58vh] -translate-x-1/2 opacity-90" />
      <div className="orb-soft drift absolute left-[4vw] top-[52vh] h-[22vh] w-[22vh] opacity-80" />
      <div className="orb float-mid absolute right-[5vw] top-[62vh] h-[14vh] w-[14vh] opacity-70" />
      <div className="glass-shape drift absolute left-[-6vw] top-[14vh] h-[46vh] w-[22vw] rotate-[-14deg] rounded-[48px]" />
      <div className="glass-shape float-slow absolute right-[-4vw] top-[24vh] h-[38vh] w-[18vw] rotate-[12deg] rounded-[48px]" />
      <div className="floor absolute inset-x-0 bottom-0 h-[34vh]" />
    </div>
  );
}

export function Logo({ light = false, className = "" }: { light?: boolean; className?: string }) {
  return (
    <img
      src={light ? "/img/logo-white.png" : "/img/logo.png"}
      alt="GITB — Global Institute of Technology and Business"
      className={`h-9 w-auto sm:h-10 ${className}`}
    />
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-5">
      <div className="glass sheen flex items-center justify-between gap-4 rounded-2xl px-4 py-2.5 sm:px-6">
        <Link to="/" aria-label="GITB home">
          <Logo />
        </Link>

        <nav className="hidden items-center rounded-xl bg-chip/70 px-2 py-1.5 lg:flex" aria-label="Main">
          {nav.map((item, i) => (
            <span key={item.to} className="flex items-center">
              {i > 0 && <Sparkle className="mx-1 h-2.5 w-2.5 text-ink" />}
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `rounded-lg px-3.5 py-1.5 text-[13px] font-semibold transition ${
                    isActive ? "bg-white text-ink shadow-sm" : "text-ink/80 hover:text-ink"
                  }`
                }
              >
                {item.label}
              </NavLink>
            </span>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link to="/login" className="btn-ghost !py-2.5">
            Log in
          </Link>
          <Link to="/apply" className="btn-dark !py-2.5">
            Apply now
          </Link>
        </div>

        <button
          className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-white lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="glass mt-2 rounded-2xl p-3 lg:hidden">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block rounded-xl px-4 py-3 font-semibold ${isActive ? "bg-lime" : "hover:bg-white/60"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Link to="/login" className="btn-ghost">
              Log in
            </Link>
            <Link to="/apply" className="btn-dark">
              Apply now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="px-3 pb-3 sm:px-6 sm:pb-6">
      <div className="relative overflow-hidden rounded-[28px] bg-ink px-6 py-10 text-white sm:px-10">
        <div className="orb pointer-events-none absolute -right-24 -top-24 h-64 w-64 opacity-30" />
        <div className="relative grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo light />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/65">
              Practical, career-minded programs in technology and business — fully online, ACTD-accredited.
            </p>
          </div>
          <div>
            <h4 className="font-display text-xs uppercase tracking-wider text-lime">Programs</h4>
            <ul className="mt-4 space-y-2 text-sm text-white/75">
              {["Cybersecurity", "Data Science & AI", "UI/UX Design", "Web Development", "Project Management", "Language courses"].map((p) => (
                <li key={p}>
                  <Link to="/courses" className="hover:text-white">
                    {p}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-display text-xs uppercase tracking-wider text-lime">Quick links</h4>
            <ul className="mt-4 space-y-2 text-sm text-white/75">
              {[
                ["/apply", "Apply now"],
                ["/internships", "Internships"],
                ["/login", "Student log in"],
                ["/testimonials", "Alumni stories"],
                ["/verify-certificate", "Verify a certificate"],
                ["/faq", "FAQ"],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-display text-xs uppercase tracking-wider text-lime">Contact</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/75">
              <li className="flex items-center gap-2">
                <Mail size={15} className="text-lime" />
                <a href={`mailto:${contact.admissions}`} className="hover:text-white">
                  {contact.admissions}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={15} className="text-lime" />
                <a href={`mailto:${contact.info}`} className="hover:text-white">
                  {contact.info}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={15} className="text-lime" />
                {contact.city}
              </li>
              <li className="pl-6 text-white/50">{contact.hours}</li>
            </ul>
            <a
              href={contact.linkedin}
              target="_blank"
              rel="noreferrer"
              className="glass-dark mt-4 inline-grid h-10 w-10 place-items-center rounded-xl"
              aria-label="GITB on LinkedIn"
            >
              <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="currentColor" aria-hidden><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.8v1.5h.06c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.77 2.55 4.77 5.87v5.58h-4v-4.95c0-1.18-.02-2.7-1.7-2.7-1.7 0-1.96 1.28-1.96 2.61v5.04h-4v-11Z"/></svg>
            </a>
          </div>
        </div>
        <div className="relative mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} GITB — Global Institute of Technology and Business</span>
          <span className="flex gap-4">
            <Link to="/contact" className="hover:text-white">
              Contact
            </Link>
            <span>Privacy Policy</span>
            <Link to="/admin/login" className="hover:text-white">
              Staff log in
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}

export function Layout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <>
      <Scene />
      <div className="mx-auto max-w-[1440px] px-2 py-2 sm:px-6 sm:py-8">
        <div className="glass-rim rounded-[30px] p-1.5 sm:rounded-[44px] sm:p-3">
          <div className="panel relative overflow-hidden rounded-[24px] sm:rounded-[34px]">
            <Nav />
            <main>
              <Outlet />
            </main>
            <Footer />
          </div>
        </div>
      </div>
    </>
  );
}
