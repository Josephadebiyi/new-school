import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertCircle, ArrowRight, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { Scene, Logo } from "../components/Layout";
import { checkApplicationStatus } from "../services/api";

type Status = "loading" | "success" | "pending" | "error";

/**
 * Lands here after the Flutterwave widget's success callback. The widget's
 * own callback is never trusted alone — this polls the real backend status
 * (webhook + fallback verification) until the application fee is confirmed
 * paid, same mechanism the live site already uses.
 */
export function ApplySuccess() {
  const [params] = useSearchParams();
  const reference = params.get("ref");
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!reference) {
      setStatus("error");
      setMessage("No reference found. If you completed payment, please contact us.");
      return;
    }

    let attempts = 0;
    const MAX_ATTEMPTS = 8;
    const DELAY_MS = 2500;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const poll = () => {
      checkApplicationStatus(reference)
        .then((data: { status: string; payment_status: string }) => {
          if (data.payment_status === "paid" && data.status !== "processing") {
            setStatus("success");
          } else if (attempts < MAX_ATTEMPTS) {
            attempts += 1;
            timer = setTimeout(poll, DELAY_MS);
          } else {
            setStatus("pending");
          }
        })
        .catch(() => {
          if (attempts < MAX_ATTEMPTS) {
            attempts += 1;
            timer = setTimeout(poll, DELAY_MS);
          } else {
            setStatus("pending");
          }
        });
    };

    poll();
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [reference]);

  return (
    <>
      <Scene />
      <div className="mx-auto flex min-h-screen max-w-lg items-center justify-center px-5 py-20">
        <div className="w-full">
          <Link to="/" className="mb-8 flex justify-center">
            <Logo />
          </Link>

          {status === "loading" && (
            <div className="glass sheen rounded-[28px] p-10 text-center">
              <Loader2 size={40} className="mx-auto animate-spin text-forest" />
              <p className="mt-5 text-sub">Confirming your application…</p>
            </div>
          )}

          {status === "success" && (
            <div className="glass sheen rounded-[28px] p-8 text-center sm:p-10">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-lime">
                <CheckCircle2 size={36} className="text-ink" />
              </div>
              <h1 className="display mt-6 text-3xl">Application received!</h1>
              <p className="mt-3 text-sub">
                Your application and application fee have been received. Our admissions team will review your details and contact you with
                the next steps.
              </p>
              <div className="mt-6 space-y-3 rounded-2xl bg-white/70 p-5 text-left">
                <p className="font-display text-xs uppercase">What happens next</p>
                {[
                  "You'll receive a confirmation email shortly",
                  "Our admissions team reviews your submission",
                  "We'll contact you with next steps",
                  "Your learning journey begins once enrollment is confirmed",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ink text-[11px] font-bold text-white">
                      {i + 1}
                    </span>
                    {step}
                  </div>
                ))}
              </div>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link to="/courses" className="btn-ghost flex-1 justify-center">
                  Browse more programs
                </Link>
                <a href="mailto:admissions@gitb.lt" className="btn-dark flex-1 justify-center">
                  Contact admissions <ArrowRight size={14} />
                </a>
              </div>
            </div>
          )}

          {status === "pending" && (
            <div className="glass sheen rounded-[28px] p-8 text-center sm:p-10">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-orange/15">
                <Clock size={36} className="text-[#8a3d00]" />
              </div>
              <h1 className="display mt-6 text-3xl">Payment processing</h1>
              <p className="mt-3 text-sub">
                Your payment is being verified — this usually takes a moment. If you paid successfully, you'll receive a confirmation email
                shortly (check spam too).
              </p>
              <p className="mt-4 text-sm text-sub">
                Still waiting? Email{" "}
                <a href="mailto:admissions@gitb.lt" className="font-semibold text-forest hover:underline">
                  admissions@gitb.lt
                </a>
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button onClick={() => window.location.reload()} className="btn-ghost flex-1 justify-center">
                  Check again
                </button>
                <a href="mailto:admissions@gitb.lt" className="btn-dark flex-1 justify-center">
                  Contact admissions
                </a>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="glass sheen rounded-[28px] p-8 text-center sm:p-10">
              <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-orange/15">
                <AlertCircle size={36} className="text-[#8a3d00]" />
              </div>
              <h1 className="display mt-6 text-3xl">Something went wrong</h1>
              <p className="mt-3 text-sub">{message || "We could not confirm your application status."}</p>
              <p className="mt-2 text-sm text-sub">If you completed payment, contact us and we'll resolve it quickly.</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link to="/apply/portal" className="btn-ghost flex-1 justify-center">
                  Try again
                </Link>
                <a href="mailto:admissions@gitb.lt" className="btn-dark flex-1 justify-center">
                  Contact us
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
