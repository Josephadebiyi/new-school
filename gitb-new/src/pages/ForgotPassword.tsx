import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import { Scene, Logo } from "../components/Layout";
import { forgotPassword } from "../services/api";

type Status = "idle" | "loading" | "success" | "error";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    setMessage("");
    try {
      await forgotPassword(email);
      setStatus("success");
      setMessage("We've sent a password reset link to your email. Please check your inbox and spam folder.");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "An error occurred. Please try again.");
    }
  };

  return (
    <>
      <Scene />
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="glass-rim w-full max-w-md rounded-[32px] p-2">
          <div className="panel relative rounded-[26px] p-8">
            <Link to="/login" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-sub hover:text-ink">
              <ArrowLeft size={16} /> Back to login
            </Link>
            <Link to="/" className="mb-6 block">
              <Logo />
            </Link>
            <h1 className="display text-3xl">Reset password</h1>
            <p className="mt-2 text-sub">Enter the email on your account and we'll send you a link to reset your password.</p>

            {status === "success" ? (
              <div className="mt-8 text-center">
                <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-lime/40">
                  <CheckCircle2 size={32} className="text-forest" />
                </div>
                <p className="mb-6 text-sub">{message}</p>
                <Link to="/login" className="btn-dark w-full justify-center">
                  Return to login
                </Link>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="mt-8 space-y-4">
                {status === "error" && (
                  <div className="flex items-start gap-3 rounded-xl bg-orange/10 p-4">
                    <AlertCircle className="mt-0.5 shrink-0 text-[#8a3d00]" size={18} />
                    <p className="text-sm text-[#8a3d00]">{message}</p>
                  </div>
                )}
                <label className="block">
                  <span className="label">Email address</span>
                  <div className="relative">
                    <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-sub" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="field !pl-11"
                      placeholder="you@example.com"
                    />
                  </div>
                </label>
                <button type="submit" disabled={status === "loading"} className="btn-dark w-full !py-3.5 disabled:opacity-60">
                  {status === "loading" ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Sending…
                    </>
                  ) : (
                    "Send reset link"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
