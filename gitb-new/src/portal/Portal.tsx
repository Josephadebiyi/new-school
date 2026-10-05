import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Check,
  CheckCircle2,
  Circle,
  FileUp,
  Inbox,
  Loader2,
  Mail,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Scene, Logo } from "../components/Layout";
import { courses as staticCourses } from "../data/site";
import { countries } from "./countries";
import { isComplete, sections, usePortal, type Application, type SectionId } from "./store";
import { createApplication, fetchConfig, fetchCourses, uploadApplicationDocument } from "../services/api";
import { openFlutterwaveCheckout, type PaymentSession } from "../components/Payment";

/**
 * Applicant workspace modelled on the DreamApply applicant flow:
 * numbered sections in a sidebar, each saved independently, ticks when complete,
 * a live checklist, and a final declaration + submit. No login gate — the
 * draft autosaves to this browser, and the one real network call is the
 * final submit (which also launches the application-fee payment).
 */
export function Portal() {
  const { state, update, reset } = usePortal();
  const [params] = useSearchParams();
  const [active, setActive] = useState<SectionId>("programs");
  const [saved, setSaved] = useState(false);
  const app = state.app;

  useEffect(() => {
    const p = params.get("program");
    if (p && staticCourses.some((c) => c.slug === p) && !app.programs.includes(p) && app.programs.length < 3) {
      update((s) => {
        s.app.programs.push(p);
        return s;
      });
    }
    const ref = params.get("ref");
    if (ref && !app.referralCode) {
      update((s) => {
        s.app.referralCode = ref;
        return s;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 1600);
    return () => clearTimeout(t);
  }, [saved]);

  const done = useMemo(() => sections.filter((s) => s.id !== "submit" && isComplete(app, s.id)).length, [app]);
  const total = sections.length - 1;

  const set = (fn: (a: Application) => void) => {
    update((s) => {
      fn(s.app);
      return s;
    });
    setSaved(true);
  };
  const idx = sections.findIndex((s) => s.id === active);
  const next = () => {
    const n = sections[Math.min(idx + 1, sections.length - 1)];
    setActive(n.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Scene />
      <div className="mx-auto max-w-[1440px] p-2 sm:p-6">
        <div className="glass-rim rounded-[30px] p-1.5 sm:rounded-[40px] sm:p-2.5">
          <div className="panel min-h-[88vh] overflow-hidden rounded-[24px] sm:rounded-[32px]">
            {/* top bar */}
            <header className="glass m-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3 sm:m-5 sm:px-6">
              <div className="flex items-center gap-4">
                <Link to="/apply">
                  <Logo />
                </Link>
                <span className="hidden h-8 w-px bg-ink/15 sm:block" />
                <span className="hidden text-sm font-semibold text-sub sm:block">Applicant portal</span>
                <Link to="/apply/courses" className="hidden text-sm font-semibold text-forest hover:underline md:block">
                  Find programmes
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <a href="mailto:admissions@gitb.lt" className="btn-ghost !px-3 !py-2 text-[13px]">
                  <Inbox size={15} /> <span className="hidden sm:inline">Contact admissions</span>
                </a>
              </div>
            </header>

            <div className="grid gap-5 px-3 pb-6 sm:px-5 lg:grid-cols-[280px_1fr_270px]">
              {/* sidebar */}
              <aside className="glass sheen h-max rounded-[24px] p-3 lg:sticky lg:top-5">
                <p className="px-3 pb-2 pt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-sub">Your application</p>
                <nav className="space-y-1">
                  {sections.map((s, i) => {
                    const ok = isComplete(app, s.id);
                    const on = s.id === active;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setActive(s.id)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                          on ? "bg-ink text-white" : "hover:bg-white/70"
                        }`}
                      >
                        <span
                          className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg font-display text-[11px] ${
                            ok ? "bg-lime text-ink" : on ? "bg-white/15" : "bg-chip"
                          }`}
                        >
                          {ok ? <Check size={14} /> : i + 1}
                        </span>
                        {s.label}
                      </button>
                    );
                  })}
                </nav>
              </aside>

              {/* main */}
              <main className="glass sheen rounded-[24px] p-5 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-forest">
                  Step {idx + 1} of {sections.length}
                </p>
                <h1 className="display mt-2 text-3xl sm:text-4xl">{sections[idx].label}</h1>
                <p className="mt-2 text-sub">{sections[idx].hint}</p>

                <fieldset className="mt-8">
                  {active === "programs" && <Programs app={app} set={set} />}
                  {active === "profile" && <Profile app={app} set={set} />}
                  {active === "contacts" && <Contacts app={app} set={set} />}
                  {active === "education" && <Education app={app} set={set} />}
                  {active === "languages" && <Languages app={app} set={set} />}
                  {active === "documents" && <Documents app={app} set={set} />}
                  {active === "motivation" && <Motivation app={app} set={set} />}
                  {active === "fees" && <Fees app={app} set={set} />}
                  {active === "submit" && (
                    <Submit
                      app={app}
                      set={set}
                      goTo={setActive}
                      onReset={() => {
                        if (confirm("Start a new application? Your current answers on this device will be cleared.")) reset();
                      }}
                    />
                  )}
                </fieldset>

                {active !== "submit" && (
                  <div className="mt-10 flex items-center justify-between border-t border-ink/10 pt-6">
                    <span className={`text-sm font-medium text-forest transition ${saved ? "opacity-100" : "opacity-0"}`}>
                      <CheckCircle2 size={15} className="mr-1 inline" /> Saved
                    </span>
                    <button onClick={next} className="btn-dark">
                      Save & continue <ArrowRight size={16} />
                    </button>
                  </div>
                )}
              </main>

              {/* checklist rail */}
              <aside className="space-y-4 lg:sticky lg:top-5 lg:h-max">
                <div className="rounded-[24px] bg-ink p-5 text-white">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-lime">Progress</p>
                  <p className="mt-2 font-display text-4xl">
                    {done}
                    <span className="text-white/40">/{total}</span>
                  </p>
                  <div className="mt-3 h-2 rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-lime transition-all" style={{ width: `${(done / total) * 100}%` }} />
                  </div>
                  <p className="mt-3 text-sm text-white/60">{done === total ? "Ready to submit" : "Sections complete"}</p>
                </div>
                <div className="glass sheen rounded-[24px] p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-sub">Checklist</p>
                  <ul className="mt-3 space-y-2 text-sm">
                    {sections
                      .filter((s) => s.id !== "submit")
                      .map((s) => (
                        <li key={s.id} className="flex items-center gap-2">
                          {isComplete(app, s.id) ? (
                            <CheckCircle2 size={16} className="text-forest" />
                          ) : (
                            <Circle size={16} className="text-sub/50" />
                          )}
                          <button onClick={() => setActive(s.id)} className="hover:underline">
                            {s.label}
                          </button>
                        </li>
                      ))}
                  </ul>
                </div>
                <div className="glass-lime rounded-[24px] p-5 text-sm">
                  <Mail size={18} />
                  <p className="mt-2 font-semibold">Need help?</p>
                  <p className="mt-1 text-ink/75">
                    admissions@gitb.lt
                    <br />
                    Mon – Fri, 9:00 – 18:00 CET
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- sections */
type Props = { app: Application; set: (fn: (a: Application) => void) => void };

function Grid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="label">
        {label} {required && <span className="text-orange">*</span>}
      </span>
      <input className="field" type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Choice({
  label,
  value,
  onChange,
  options,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="label">
        {label} {required && <span className="text-orange">*</span>}
      </span>
      <select className="field" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

// Standard/Intensive tiers are now sourced live from the backend (Fees step)
// rather than the static languagePlans constant, but Programs still needs a
// simple label list to let the applicant pick a format per language course.
const LANGUAGE_TIER_LABELS: { id: "standard" | "intensive"; name: string; classesPerWeek: number }[] = [
  { id: "standard", name: "Standard", classesPerWeek: 2 },
  { id: "intensive", name: "Intensive", classesPerWeek: 3 },
];

function Programs({ app, set }: Props) {
  const chosen = app.programs.map((s) => staticCourses.find((c) => c.slug === s)!).filter(Boolean);
  const available = staticCourses.filter((c) => !app.programs.includes(c.slug));
  const move = (i: number, d: number) =>
    set((a) => {
      const [x] = a.programs.splice(i, 1);
      a.programs.splice(i + d, 0, x);
    });

  return (
    <div className="space-y-8">
      <div>
        <p className="label">Your choices (in order of priority)</p>
        <p className="mb-3 text-sm text-sub">
          Your <strong>first choice</strong> is what your application fee and tuition are based on. The others are recorded as additional
          interests for admissions.
        </p>
        {chosen.length === 0 && <p className="rounded-xl bg-white/60 p-4 text-sm text-sub">No program selected yet — add one below.</p>}
        <ol className="space-y-2">
          {chosen.map((c, i) => (
            <li key={c.slug} className="flex items-center gap-3 rounded-2xl bg-white/70 p-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-lime font-display text-sm">{i + 1}</span>
              <div className="flex-1">
                <p className="font-semibold">
                  {c.title} {i === 0 && <span className="ml-1 rounded-md bg-ink px-1.5 py-0.5 text-[10px] font-bold text-white">PRIMARY</span>}
                </p>
                <p className="text-sm text-sub">
                  {c.duration} · {c.category} · Online
                </p>
                {c.type === "language" && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {LANGUAGE_TIER_LABELS.map((p) => {
                      const on = (app.languageFormats[c.slug] ?? "standard") === p.id;
                      return (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() => set((a) => void (a.languageFormats[c.slug] = p.id))}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                            on ? "border-ink bg-ink text-white" : "border-ink/15 bg-white/70 hover:border-ink/40"
                          }`}
                        >
                          {p.name} · {p.classesPerWeek}×/week
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <button type="button" disabled={i === 0} onClick={() => move(i, -1)} className="p-2 disabled:opacity-25" aria-label="Move up">
                <ArrowUp size={16} />
              </button>
              <button
                type="button"
                disabled={i === chosen.length - 1}
                onClick={() => move(i, 1)}
                className="p-2 disabled:opacity-25"
                aria-label="Move down"
              >
                <ArrowDown size={16} />
              </button>
              <button
                type="button"
                onClick={() => set((a) => void a.programs.splice(i, 1))}
                className="p-2 text-sub hover:text-ink"
                aria-label="Remove"
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ol>
      </div>
      {app.programs.length < 3 && (
        <div>
          <p className="label">Available programs</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {available.map((c) => (
              <button
                type="button"
                key={c.slug}
                onClick={() => set((a) => void a.programs.push(c.slug))}
                className="flex items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white/50 p-4 text-left transition hover:border-ink/30 hover:bg-white"
              >
                <span>
                  <span className="block font-semibold">{c.title}</span>
                  <span className="text-sm text-sub">{c.duration}</span>
                </span>
                <Plus size={18} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Profile({ app, set }: Props) {
  const p = app.profile;
  return (
    <Grid>
      <Input label="First name(s)" required value={p.firstName} onChange={(v) => set((a) => void (a.profile.firstName = v))} />
      <Input label="Last name" required value={p.lastName} onChange={(v) => set((a) => void (a.profile.lastName = v))} />
      <Input label="Date of birth" type="date" required value={p.dob} onChange={(v) => set((a) => void (a.profile.dob = v))} />
      <Choice
        label="Gender"
        value={p.gender}
        options={["Female", "Male", "Other", "Prefer not to say"]}
        onChange={(v) => set((a) => void (a.profile.gender = v))}
      />
      <Choice label="Citizenship" required value={p.citizenship} options={countries} onChange={(v) => set((a) => void (a.profile.citizenship = v))} />
      <Choice
        label="Country of residence"
        required
        value={p.residence}
        options={countries}
        onChange={(v) => set((a) => void (a.profile.residence = v))}
      />
    </Grid>
  );
}

function Contacts({ app, set }: Props) {
  const c = app.contacts;
  return (
    <Grid>
      <Input label="Email" type="email" required value={c.email} onChange={(v) => set((a) => void (a.contacts.email = v))} />
      <Input
        label="Phone / WhatsApp"
        type="tel"
        required
        placeholder="+370 …"
        value={c.phone}
        onChange={(v) => set((a) => void (a.contacts.phone = v))}
      />
      <div className="sm:col-span-2">
        <Input label="Street address" value={c.address} onChange={(v) => set((a) => void (a.contacts.address = v))} />
      </div>
      <Input label="City" required value={c.city} onChange={(v) => set((a) => void (a.contacts.city = v))} />
      <Input label="Postcode" value={c.postcode} onChange={(v) => set((a) => void (a.contacts.postcode = v))} />
      <Choice label="Country" required value={c.country} options={countries} onChange={(v) => set((a) => void (a.contacts.country = v))} />
    </Grid>
  );
}

function Education({ app, set }: Props) {
  const levels = ["Secondary school", "Vocational", "Bachelor's degree", "Master's degree", "Doctorate", "Other"];
  return (
    <div className="space-y-4">
      {app.education.map((e, i) => (
        <div key={i} className="rounded-2xl bg-white/60 p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-display text-sm uppercase">Entry {i + 1}</p>
            <button type="button" onClick={() => set((a) => void a.education.splice(i, 1))} className="p-1 text-sub hover:text-ink" aria-label="Remove entry">
              <Trash2 size={16} />
            </button>
          </div>
          <Grid>
            <Choice label="Level" required value={e.level} options={levels} onChange={(v) => set((a) => void (a.education[i].level = v))} />
            <Input label="Institution" required value={e.institution} onChange={(v) => set((a) => void (a.education[i].institution = v))} />
            <Input label="Field of study" value={e.field} onChange={(v) => set((a) => void (a.education[i].field = v))} />
            <Choice label="Country" value={e.country} options={countries} onChange={(v) => set((a) => void (a.education[i].country = v))} />
            <Input label="From" type="month" value={e.from} onChange={(v) => set((a) => void (a.education[i].from = v))} />
            <Input label="To (or expected)" type="month" value={e.to} onChange={(v) => set((a) => void (a.education[i].to = v))} />
          </Grid>
        </div>
      ))}
      <button
        type="button"
        onClick={() => set((a) => void a.education.push({ level: "", institution: "", country: "", field: "", from: "", to: "" }))}
        className="btn-ghost"
      >
        <Plus size={16} /> Add education
      </button>
    </div>
  );
}

function Languages({ app, set }: Props) {
  const levels = ["Native", "C2 – Proficient", "C1 – Advanced", "B2 – Upper intermediate", "B1 – Intermediate", "A2 – Elementary", "A1 – Beginner"];
  return (
    <div className="space-y-3">
      {app.languages.map((l, i) => (
        <div key={i} className="flex items-end gap-3">
          <div className="flex-1">
            <Input label="Language" value={l.language} onChange={(v) => set((a) => void (a.languages[i].language = v))} />
          </div>
          <div className="flex-1">
            <Choice label="Level" value={l.level} options={levels} onChange={(v) => set((a) => void (a.languages[i].level = v))} />
          </div>
          <button type="button" onClick={() => set((a) => void a.languages.splice(i, 1))} className="mb-2 p-2 text-sub" aria-label="Remove language">
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => set((a) => void a.languages.push({ language: "", level: "" }))} className="btn-ghost">
        <Plus size={16} /> Add language
      </button>
    </div>
  );
}

function Documents({ app, set }: Props) {
  const types = ["Passport / ID card", "Diploma or transcript", "CV / résumé", "Language certificate", "Other"];
  const [type, setType] = useState(types[0]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const onFile = async (f: File | undefined) => {
    if (!f) return;
    setError("");
    setUploading(true);
    try {
      const result = await uploadApplicationDocument(f);
      set((a) =>
        void a.documents.push({ id: `${Date.now()}-${f.name}`, name: result.name || f.name, type, size: result.size || f.size, url: result.url }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-2 border-dashed border-ink/20 bg-white/40 p-6 text-center">
        <FileUp className="mx-auto text-forest" />
        <p className="mt-2 font-semibold">Upload a document</p>
        <p className="text-sm text-sub">PDF, JPG or PNG · max 5MB · a clear, readable copy</p>
        <div className="mx-auto mt-4 flex max-w-md flex-col gap-2 sm:flex-row">
          <select className="field" value={type} onChange={(e) => setType(e.target.value)} disabled={uploading}>
            {types.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <label className="btn-dark shrink-0 cursor-pointer">
            {uploading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Uploading…
              </>
            ) : (
              "Choose file"
            )}
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                onFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        {error && <p className="mt-3 text-sm font-medium text-orange">{error}</p>}
      </div>
      <ul className="space-y-2">
        {app.documents.map((d, i) => (
          <li key={d.id} className="flex items-center gap-3 rounded-2xl bg-white/70 p-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-lime">
              <FileUp size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{d.name}</p>
              <p className="text-sm text-sub">
                {d.type} · {(d.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button type="button" onClick={() => set((a) => void a.documents.splice(i, 1))} className="p-2 text-sub" aria-label="Remove document">
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>
      <p className="text-sm text-sub">A passport or national ID card is required. Other documents strengthen your application.</p>
    </div>
  );
}

function Motivation({ app, set }: Props) {
  const m = app.motivation;
  return (
    <div className="space-y-5">
      <label className="block">
        <span className="label">
          Why do you want to join this program? <span className="text-orange">*</span>
        </span>
        <textarea rows={6} className="field resize-y" value={m.why} onChange={(e) => set((a) => void (a.motivation.why = e.target.value))} />
        <span className={`mt-1 block text-right text-xs ${m.why.trim().length >= 80 ? "text-forest" : "text-sub"}`}>
          {m.why.trim().length} / 80 characters minimum
        </span>
      </label>
      <label className="block">
        <span className="label">What would you like to achieve after graduating?</span>
        <textarea rows={4} className="field resize-y" value={m.goals} onChange={(e) => set((a) => void (a.motivation.goals = e.target.value))} />
      </label>
      <Choice
        label="How did you hear about GITB?"
        value={m.source}
        options={["Instagram", "LinkedIn", "Facebook", "Search engine", "Friend or colleague", "Event", "Other"]}
        onChange={(v) => set((a) => void (a.motivation.source = v))}
      />
    </div>
  );
}

// Live pricing, fetched from the backend (admin-editable) instead of the
// static APPLICATION_FEE / languagePlans constants — those stay in data/site.ts
// only as pre-fetch placeholders / marketing copy.
function Fees({ app, set }: Props) {
  const [applicationFee, setApplicationFee] = useState<number | null>(null);
  const [liveCourses, setLiveCourses] = useState<Awaited<ReturnType<typeof fetchCourses>>>([]);

  useEffect(() => {
    fetchConfig().then((c) => setApplicationFee(Number(c.applicationFee) || null)).catch(() => {});
    fetchCourses().then(setLiveCourses).catch(() => {});
  }, []);

  const chosen = app.programs.map((s) => staticCourses.find((c) => c.slug === s)!).filter(Boolean);

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl bg-white/70">
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
          <div>
            <p className="font-semibold">Registration & application fee</p>
            <p className="text-sm text-sub">One-time fee, per application — not your tuition</p>
          </div>
          <p className="font-display text-2xl">{applicationFee != null ? `€${applicationFee}` : "…"}</p>
        </div>
        {chosen.map((c, i) => {
          const live = liveCourses.find((lc) => lc.slug === c.slug);
          const tier = live?.pricing_tiers?.length
            ? live.pricing_tiers.find((t: { id: string }) => t.id === (app.languageFormats[c.slug] ?? "standard"))
            : null;
          const hasFlatPrice = live && (live.price?.upfront > 0 || live.price?.monthly > 0);
          return (
            <div key={c.slug} className="flex items-center justify-between gap-4 px-5 py-4 text-sm">
              <div>
                <p className="font-semibold">
                  {c.title} {i === 0 && <span className="ml-1 rounded-md bg-ink px-1.5 py-0.5 text-[10px] font-bold text-white">PRIMARY</span>}
                </p>
                <p className="text-sub">
                  {tier ? `${tier.label} · billed monthly` : i === 0 ? "Tuition confirmed by admissions after review" : "Additional interest"}
                </p>
              </div>
              <p className="whitespace-nowrap font-semibold">
                {tier ? `€${tier.price_monthly} / month` : hasFlatPrice ? `€${live!.price.upfront || live!.price.monthly}` : i === 0 ? "On request" : "—"}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Coupon code (optional)"
          value={app.couponCode}
          placeholder="Tuition discount — not applied to the application fee"
          onChange={(v) => set((a) => void (a.couponCode = v.toUpperCase()))}
        />
        <Input
          label="Referral code (optional)"
          value={app.referralCode}
          placeholder="From a friend who referred you"
          onChange={(v) => set((a) => void (a.referralCode = v.toUpperCase()))}
        />
      </div>

      <p className="rounded-2xl bg-lime/50 p-4 text-sm">
        You'll pay the {applicationFee != null ? `€${applicationFee}` : ""} application fee by card, bank transfer or local payment method on
        the next step. Any coupon code is saved with your application and applies automatically to tuition once you're accepted.
      </p>
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={app.feeAcknowledged}
          onChange={(e) => set((a) => void (a.feeAcknowledged = e.target.checked))}
          className="mt-0.5 h-4 w-4 accent-[#0b3b2c]"
        />
        I understand the application fee and the tuition shown above.
      </label>
    </div>
  );
}

function Submit({ app, set, goTo, onReset }: Props & { goTo: (s: SectionId) => void; onReset: () => void }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [payment, setPayment] = useState<PaymentSession | null>(null);
  const missing = sections.filter((s) => s.id !== "submit" && !isComplete(app, s.id));
  const primary = staticCourses.find((c) => c.slug === app.programs[0]);

  const pay = (session: PaymentSession) => {
    try {
      openFlutterwaveCheckout(session, {
        title: "GITB Registration & Application Fee",
        description: primary ? `One-time application fee — ${primary.title}` : "One-time application fee",
        onSuccessRef: (reference) => navigate(`/apply/success?ref=${reference}`),
        onClose: () => setError("Payment was cancelled. You can try again anytime — your application details are saved."),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open the payment window.");
    }
  };

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      const tier = primary?.type === "language" ? app.languageFormats[primary.slug] ?? "standard" : undefined;
      const session = await createApplication({
        first_name: app.profile.firstName.trim(),
        last_name: app.profile.lastName.trim(),
        email: app.contacts.email.toLowerCase().trim(),
        phone: app.contacts.phone,
        course_id: app.programs[0],
        country: app.profile.residence,
        city: app.contacts.city,
        address: app.contacts.address,
        date_of_birth: app.profile.dob,
        motivation: app.motivation.why,
        referral_code: app.referralCode,
        coupon_code: app.couponCode,
        citizenship: app.profile.citizenship,
        gender: app.profile.gender,
        programs: app.programs,
        education: app.education,
        languages: app.languages,
        documents: app.documents,
        declaration: app.declaration,
        pricing_tier_id: tier,
      });
      set((a) => {
        a.submittedAt = new Date().toISOString();
        a.reference = session.reference;
      });
      setPayment(session);
      pay(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {missing.length > 0 ? (
        <div className="rounded-2xl bg-orange/10 p-5">
          <p className="font-semibold">Complete these sections before submitting:</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {missing.map((s) => (
              <li key={s.id}>
                <button type="button" onClick={() => goTo(s.id)} className="chip !bg-white hover:!bg-lime">
                  {s.label} <ArrowRight size={14} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="rounded-2xl bg-lime/60 p-5 font-semibold">All sections are complete — you're ready to submit.</p>
      )}

      <div className="rounded-2xl bg-white/60 p-5">
        <p className="font-display text-sm uppercase">Summary</p>
        <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <dt className="text-sub">Applicant</dt>
          <dd className="font-semibold">
            {app.profile.firstName} {app.profile.lastName}
          </dd>
          <dt className="text-sub">Programs</dt>
          <dd className="font-semibold">
            {app.programs.map((s) => staticCourses.find((c) => c.slug === s)?.short).join(", ") || "—"}
          </dd>
          <dt className="text-sub">Documents</dt>
          <dd className="font-semibold">{app.documents.length}</dd>
        </dl>
      </div>

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={app.declaration}
          onChange={(e) => set((a) => void (a.declaration = e.target.checked))}
          className="mt-0.5 h-4 w-4 accent-[#0b3b2c]"
        />
        I confirm that the information I have provided is true and complete, and that my documents are genuine.
      </label>

      {error && <p className="rounded-xl bg-orange/10 p-4 text-sm font-medium text-[#8a3d00]">{error}</p>}

      {payment ? (
        <button type="button" onClick={() => pay(payment)} className="btn-dark w-full !py-4">
          Pay application fee <ArrowRight size={16} />
        </button>
      ) : (
        <button
          type="button"
          disabled={missing.length > 0 || !app.declaration || loading}
          onClick={submit}
          className="btn-dark w-full !py-4 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Submitting…
            </>
          ) : (
            <>
              Submit & pay application fee <ArrowRight size={16} />
            </>
          )}
        </button>
      )}

      <button type="button" onClick={onReset} className="btn-ghost w-full !text-sub">
        Start a new application
      </button>
    </div>
  );
}
