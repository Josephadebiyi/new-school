import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { Scene, Logo } from "../components/Layout";
import { resetPassword } from "../services/api";

type Status = "idle" | "loading" | "success" | "error";

export function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setStatus("error");
      setMessage("Password must be at least 8 characters.");
      return;
    }
    if (!token) {
      setStatus("error");
      setMessage("No reset token found. Please request a new password reset link.");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      await resetPassword(token, newPassword);
      setStatus("success");
      setMessage("Your password has been reset successfully. You'll be redirected to the login page shortly.");
      setTimeout(() => navigate("/student-login"), 4000);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <Scene />
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="glass-rim w-full max-w-md rounded-[32px] p-2">
          <div className="panel relative rounded-[26px] p-8">
            <Link to="/" className="mb-6 block">
              <Logo />
            </Link>
            <h1 className="display text-3xl">New password</h1>
            <p className="mt-2 text-sub">Choose a new password for your account.</p>

            {status === "success" ? (
              <div className="mt-8 text-center">
                <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-lime/40">
                  <CheckCircle2 size={32} className="text-forest" />
                </div>
                <p className="text-sub">{message}</p>
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
                  <span className="label">New password</span>
                  <div className="relative">
                    <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-sub" />
                    <input
                      type={show ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="field !px-11"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-sub" aria-label={show ? "Hide password" : "Show password"}>
                      {show ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </label>
                <label className="block">
                  <span className="label">Confirm password</span>
                  <input
                    type={show ? "text" : "password"}
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="field"
                    placeholder="••••••••"
                  />
                </label>
                <button type="submit" disabled={status === "loading"} className="btn-dark w-full !py-3.5 disabled:opacity-60">
                  {status === "loading" ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Resetting…
                    </>
                  ) : (
                    "Reset password"
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
