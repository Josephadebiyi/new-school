import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { Scene, Logo } from "../components/Layout";
import { Sparkle, Star } from "../components/Sparkle";
import { useAuth } from "../context/AuthContext";

const ROLE_HOME: Record<string, string> = {
  admin: "/admin/dashboard",
  super_admin: "/admin/dashboard",
  registrar: "/admin/dashboard",
  teacher: "/teacher/dashboard",
  lecturer: "/teacher/dashboard",
  staff: "/staff/dashboard",
};

/** Student (and staff/admin) log in — real auth against the backend. */
export function Login() {
  const { login }: any = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password);
      navigate(ROLE_HOME[data.user?.role] || "/student/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please check your details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Scene />
      <div className="flex min-h-screen items-center justify-center p-3 sm:p-8">
        <div className="glass-rim w-full max-w-5xl rounded-[34px] p-2 sm:rounded-[44px] sm:p-3">
          <div className="panel grid overflow-hidden rounded-[28px] sm:rounded-[34px] lg:grid-cols-[1fr_1.05fr]">
            {/* left: brand visual */}
            <div className="relative hidden overflow-hidden bg-ink p-10 text-white lg:block">
              <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_30%_10%,rgba(212,245,66,0.28),transparent_70%)]" />
              <div className="orb absolute -right-16 top-24 h-48 w-48 opacity-80" />
              <div className="orb-soft absolute -left-10 bottom-40 h-28 w-28 opacity-50" />
              <Link to="/" className="relative">
                <Logo light />
              </Link>
              <h1 className="relative mt-16 font-display text-4xl uppercase leading-tight">
                Welcome <span className="text-white/45">back</span> to your <span className="text-lime">learning</span> portal
              </h1>
              <p className="relative z-10 mt-5 max-w-xs text-white/65">
                Course materials, recorded lessons, mentor support and progress — all in one place.
              </p>
              <img
                src="/img/learner.png"
                alt=""
                className="pointer-events-none absolute -bottom-6 right-2 h-[46%] select-none opacity-95"
              />
              <div className="glass-dark absolute bottom-8 left-10 rounded-2xl px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.16em] text-lime">ACTD accredited</p>
                <p className="text-sm font-semibold">Certificates verifiable online</p>
              </div>
              <Sparkle className="absolute right-[42%] top-[44%] h-6 w-6 text-lime" />
            </div>

            {/* right: form */}
            <div className="relative p-6 sm:p-12">
              <Star className="absolute right-10 top-10 hidden h-10 w-4 text-ink sm:block" />
              <Link to="/" className="lg:hidden">
                <Logo />
              </Link>
              <p className="mt-8 text-xs font-bold uppercase tracking-[0.18em] text-forest lg:mt-0">Student log in</p>
              <h2 className="display mt-3 text-3xl sm:text-4xl">
                Log <span className="dim">in</span>
              </h2>
              <p className="mt-3 text-sub">Use the email you enrolled with.</p>

              <form onSubmit={onSubmit} className="mt-8 space-y-4">
                <div>
                  <label className="label" htmlFor="email">
                    Email
                  </label>
                  <div className="relative">
                    <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-sub" />
                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="field !pl-11"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <label className="label" htmlFor="password">
                      Password
                    </label>
                    <Link to="/forgot-password" className="mb-1.5 text-[13px] font-semibold text-forest">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-sub" />
                    <input
                      id="password"
                      type={show ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="field !px-11"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShow((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-sub"
                      aria-label={show ? "Hide password" : "Show password"}
                    >
                      {show ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>
                {error && <p className="rounded-xl bg-orange/10 p-4 text-sm font-medium text-[#8a3d00]" role="alert">{error}</p>}
                <button disabled={loading} className="btn-dark w-full !py-3.5 disabled:opacity-60">
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Logging in…
                    </>
                  ) : (
                    <>
                      Log in <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              <div className="glass sheen mt-8 rounded-2xl p-5">
                <p className="font-semibold">Not a student yet?</p>
                <p className="mt-1 text-sm text-sub">Apply online — save your progress and come back any time.</p>
                <Link to="/apply" className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-forest">
                  Start your application <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
