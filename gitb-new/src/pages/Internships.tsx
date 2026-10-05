import { useMemo, useRef, useState, type DragEvent, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  CalendarRange,
  CheckCircle2,
  FileText,
  Globe2,
  GraduationCap,
  Loader2,
  Sparkles,
  UploadCloud,
  Users,
  X,
} from "lucide-react";
import { CourseArt } from "../components/CourseArt";
import { ContactSection } from "../components/sections";
import { Star } from "../components/Sparkle";
import { Accordion, Display, Eyebrow, Reveal } from "../components/ui";
import { courses } from "../data/site";
import { countries } from "../portal/countries";
import { durations, internshipFaqs, tracks } from "../data/internships";
import { applyToInternship } from "../services/api";

const MAX_MB = 5;
const CV_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export function InternshipsPage() {
  const [track, setTrack] = useState(tracks[0].slug);
  const formRef = useRef<HTMLDivElement>(null);
  const choose = (slug: string) => {
    setTrack(slug);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* hero */}
      <section className="relative px-5 pt-14 sm:px-10 sm:pt-20">
        <Star className="absolute left-[8%] top-24 hidden h-12 w-5 text-ink md:block" />
        <Star className="absolute right-[9%] top-40 hidden h-9 w-4 text-ink md:block" />
        <Reveal className="text-center">
          <Eyebrow>Internships · 3 to 12 months</Eyebrow>
          <Display as="h1" text="Put [your] skills [to] work" className="mx-auto mt-6 max-w-5xl text-[clamp(2.4rem,6vw,5rem)]" />
          <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-sub">
            Gain real experience in the fields we teach — cybersecurity, data & AI, design, web development, project
            management and compliance — guided by mentors, for 3 months up to a full year.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#apply-internship" className="btn-dark">
              Apply for an internship <ArrowRight size={16} />
            </a>
            <a href="#tracks" className="btn-ghost">
              See the tracks
            </a>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { icon: CalendarRange, t: "3 – 12 months", d: "Choose your length" },
            { icon: Users, t: "Mentored", d: "Guided by professionals" },
            { icon: Briefcase, t: "Real projects", d: "Work you can show" },
            { icon: GraduationCap, t: "Open to all", d: "Learners, graduates & external" },
          ].map(({ icon: Icon, t, d }, i) => (
            <Reveal key={t} delay={i * 0.05}>
              <div className="glass sheen rounded-2xl p-5">
                <Icon size={20} className="text-forest" />
                <p className="mt-3 font-display text-lg uppercase">{t}</p>
                <p className="text-sm text-sub">{d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* tracks */}
      <section id="tracks" className="relative px-5 pt-24 sm:px-10">
        <Reveal>
          <Display text="Internship [tracks]" className="text-[clamp(2rem,4vw,3.2rem)]" />
          <p className="mt-4 max-w-2xl text-sub">Each track is linked to a GITB program, so what you learn maps directly to the work you do.</p>
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {tracks.map((t, i) => {
            const program = courses.find((c) => c.slug === t.program);
            return (
              <Reveal key={t.slug} delay={(i % 3) * 0.06}>
                <article className="glass sheen flex h-full flex-col rounded-[26px] p-2.5">
                  <CourseArt kind={t.art} letters={t.letters} />
                  <div className="flex flex-1 flex-col px-3 pb-3 pt-4">
                    <h3 className="font-display text-lg uppercase leading-tight">{t.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-sub">{t.summary}</p>
                    <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-forest">You'll work on</p>
                    <ul className="mt-2 space-y-1.5 text-sm">
                      {t.tasks.map((task) => (
                        <li key={task} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange" />
                          {task}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {t.skills.map((s) => (
                        <span key={s} className="rounded-lg bg-white/70 px-2.5 py-1 text-xs font-semibold">
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                      {program && (
                        <Link to={`/courses/${program.slug}`} className="text-[13px] font-semibold text-sub hover:text-ink">
                          Related program →
                        </Link>
                      )}
                      <button onClick={() => choose(t.slug)} className="btn-dark !px-4 !py-2 text-[13px]">
                        Apply
                      </button>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* how it works */}
      <section className="px-5 pt-24 sm:px-10">
        <div className="relative overflow-hidden rounded-[30px] bg-ink p-7 text-white sm:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(60%_70%_at_90%_10%,rgba(212,245,66,0.22),transparent_70%)]" />
          <h2 className="relative font-display text-2xl uppercase sm:text-3xl">
            How <span className="text-white/45">it</span> works
          </h2>
          <ol className="relative mt-8 grid gap-4 md:grid-cols-4">
            {[
              ["Apply", "Pick a track and length, and upload your CV."],
              ["Review", "Our team reviews your skills and goals."],
              ["Interview", "A short conversation or practical task."],
              ["Start", "Agree your start date and meet your mentor."],
            ].map(([t, d], i) => (
              <li key={t} className="glass-dark rounded-2xl p-5">
                <span className="font-display text-3xl text-lime">0{i + 1}</span>
                <p className="mt-3 font-semibold">{t}</p>
                <p className="mt-1 text-sm text-white/65">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* application form */}
      <div ref={formRef} id="apply-internship" className="scroll-mt-28">
        <ApplicationForm track={track} setTrack={setTrack} />
      </div>

      <section className="px-5 pt-24 sm:px-10">
        <Reveal className="text-center">
          <Display text="Internship [FAQ]" className="text-[clamp(2rem,4vw,3.2rem)]" />
        </Reveal>
        <div className="mx-auto mt-8 max-w-3xl">
          <Accordion items={internshipFaqs} />
        </div>
      </section>
      <ContactSection />
    </>
  );
}

/* ------------------------------------------------------------------ form */
function ApplicationForm({ track, setTrack }: { track: string; setTrack: (s: string) => void }) {
  const [months, setMonths] = useState(6);
  const [cv, setCv] = useState<File | null>(null);
  const [letter, setLetter] = useState<File | null>(null);
  const [cvError, setCvError] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [result, setResult] = useState<{ ref: string; demo: boolean; name: string; email: string } | null>(null);
  const [error, setError] = useState("");
  const selected = useMemo(() => tracks.find((t) => t.slug === track)!, [track]);

  const validate = (f: File | undefined | null) => {
    if (!f) return "Please upload your CV.";
    if (!CV_TYPES.includes(f.type) && !/\.(pdf|docx?)$/i.test(f.name)) return "Upload a PDF or Word document.";
    if (f.size > MAX_MB * 1024 * 1024) return `The file is larger than ${MAX_MB} MB.`;
    return "";
  };

  const pickCv = (f: File | undefined) => {
    const err = validate(f);
    setCvError(err);
    setCv(err ? null : f!);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    pickCv(e.dataTransfer.files?.[0]);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const err = validate(cv);
    if (err) return setCvError(err);
    const data = new FormData(e.currentTarget);
    data.set("track", selected.title);
    data.set("durationMonths", String(months));
    data.set("cv", cv!);
    if (letter) data.set("coverLetter", letter);
    setStatus("sending");
    setError("");
    try {
      const res = await applyToInternship(data);
      setResult({
        ref: res.reference,
        demo: false,
        name: res.name || String(data.get("firstName")),
        email: res.email || String(data.get("email")),
      });
      setStatus("done");
    } catch (x) {
      setError(x instanceof Error ? x.message : "Something went wrong.");
      setStatus("error");
    }
  };

  if (status === "done" && result) {
    return (
      <section className="px-5 pt-24 sm:px-10">
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-[30px] bg-ink p-8 text-white sm:p-12">
          <div className="orb absolute -right-12 -top-12 h-40 w-40 opacity-70" />
          <CheckCircle2 size={44} className="text-lime" />
          <h2 className="mt-5 font-display text-3xl uppercase">Application received</h2>
          <p className="mt-3 text-white/75">
            Thanks, {result.name}. Your application for the <strong>{selected.title.replace(" Intern", "")}</strong> internship ({months} months) is in.
            We'll contact you at {result.email}.
          </p>
          <p className="mt-4 text-sm text-white/60">
            Reference: <span className="font-mono text-lime">{result.ref}</span>
          </p>
          <button
            onClick={() => {
              setStatus("idle");
              setResult(null);
              setCv(null);
              setLetter(null);
            }}
            className="btn-lime mt-8"
          >
            Submit another application
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="relative px-5 pt-24 sm:px-10">
      <Reveal className="text-center">
        <Eyebrow>Application form</Eyebrow>
        <Display text="Apply [for an] internship" className="mt-5 text-[clamp(2rem,4.4vw,3.6rem)]" />
        <p className="mx-auto mt-4 max-w-xl text-sub">Fields marked * are required. It's free to apply.</p>
      </Reveal>

      <form onSubmit={onSubmit} className="mx-auto mt-10 grid max-w-5xl gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          {/* 1. track & duration */}
          <Card n={1} title="Track & duration">
            <label className="block">
              <span className="label">Internship track *</span>
              <select className="field" value={track} onChange={(e) => setTrack(e.target.value)} name="trackSlug">
                {tracks.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.title}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <div className="flex items-baseline justify-between">
                <span className="label">Preferred length *</span>
                <span className="font-display text-lg">
                  {months} <span className="text-sm text-sub">{months === 12 ? "months (1 year)" : "months"}</span>
                </span>
              </div>
              <input
                type="range"
                min={3}
                max={12}
                step={1}
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                className="w-full accent-[#0b3b2c]"
                aria-label="Internship length in months"
              />
              <div className="mt-1 flex justify-between text-xs text-sub">
                {durations.map((d) => (
                  <span key={d} className={d === months ? "font-bold text-ink" : ""}>
                    {d}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-sub">Minimum 3 months, maximum 12 months.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="label">Earliest start date *</span>
                <input type="date" name="startDate" required className="field" min={new Date().toISOString().slice(0, 10)} />
              </label>
              <label className="block">
                <span className="label">Availability per week *</span>
                <select name="hoursPerWeek" required className="field" defaultValue="">
                  <option value="" disabled>
                    Select…
                  </option>
                  <option>Full-time (35–40 h)</option>
                  <option>Part-time (20–30 h)</option>
                  <option>Part-time (10–20 h)</option>
                </select>
              </label>
            </div>
          </Card>

          {/* 2. about you */}
          <Card n={2} title="About you">
            <div className="grid gap-4 sm:grid-cols-2">
              <Text name="firstName" label="First name *" required autoComplete="given-name" />
              <Text name="lastName" label="Last name *" required autoComplete="family-name" />
              <Text name="email" label="Email *" type="email" required autoComplete="email" />
              <Text name="phone" label="Phone / WhatsApp *" type="tel" required autoComplete="tel" placeholder="+370 …" />
              <label className="block">
                <span className="label">Country of residence *</span>
                <select name="country" required className="field" defaultValue="">
                  <option value="" disabled>
                    Select country
                  </option>
                  {countries.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <Text name="city" label="City" autoComplete="address-level2" />
            </div>
          </Card>

          {/* 3. background */}
          <Card n={3} title="Background">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="label">Highest education *</span>
                <select name="education" required className="field" defaultValue="">
                  <option value="" disabled>
                    Select…
                  </option>
                  {["Secondary school", "Vocational", "Bachelor's (in progress)", "Bachelor's degree", "Master's degree", "Other"].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="label">Connection to GITB *</span>
                <select name="gitbStatus" required className="field" defaultValue="">
                  <option value="" disabled>
                    Select…
                  </option>
                  <option>Current GITB learner</option>
                  <option>GITB graduate</option>
                  <option>Not a GITB learner</option>
                </select>
              </label>
            </div>
            <Text name="linkedin" label="LinkedIn profile" type="url" placeholder="https://linkedin.com/in/…" />
            <Text name="portfolio" label="Portfolio, GitHub or Behance" type="url" placeholder="https://…" />
            <label className="block">
              <span className="label">Why this internship? *</span>
              <textarea
                name="motivation"
                required
                minLength={80}
                rows={5}
                className="field resize-y"
                placeholder={`What draws you to the ${selected.title.replace(" Intern", "").toLowerCase()} track, and what would you like to learn?`}
              />
              <span className="mt-1 block text-xs text-sub">At least 80 characters.</span>
            </label>
          </Card>
        </div>

        {/* right column: uploads + submit */}
        <div className="space-y-5 lg:sticky lg:top-28 lg:h-max">
          <Card n={4} title="Upload your CV">
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              className={`flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed p-6 text-center transition ${
                cvError ? "border-orange bg-orange/10" : cv ? "border-forest bg-lime/40" : "border-ink/20 bg-white/40 hover:bg-white/70"
              }`}
            >
              {cv ? <FileText className="text-forest" size={30} /> : <UploadCloud className="text-forest" size={30} />}
              <span className="mt-2 font-semibold">{cv ? cv.name : "Drop your CV here or browse"}</span>
              <span className="text-xs text-sub">
                {cv ? `${(cv.size / 1024 / 1024).toFixed(2)} MB` : `PDF or Word · max ${MAX_MB} MB · required`}
              </span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="sr-only"
                onChange={(e) => pickCv(e.target.files?.[0])}
              />
            </label>
            {cv && (
              <button type="button" onClick={() => setCv(null)} className="flex items-center gap-1 text-xs font-semibold text-sub hover:text-ink">
                <X size={13} /> Remove
              </button>
            )}
            {cvError && <p className="text-sm font-medium text-[#8a3d00]">{cvError}</p>}

            <div>
              <span className="label">Cover letter (optional)</span>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-ink/10 bg-white/50 p-3 text-sm hover:bg-white">
                <FileText size={18} className="text-forest" />
                <span className="flex-1 truncate">{letter ? letter.name : "Attach PDF or Word"}</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setLetter(f && f.size <= MAX_MB * 1024 * 1024 ? f : null);
                  }}
                />
              </label>
            </div>
          </Card>

          <div className="glass-lime sheen space-y-4 rounded-[24px] p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink text-lime">
                <Sparkles size={18} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-ink/70">Your application</p>
                <p className="font-semibold">
                  {selected.title} · {months} months
                </p>
              </div>
            </div>
            <label className="flex items-start gap-2.5 text-sm">
              <input type="checkbox" required name="consent" className="mt-0.5 h-4 w-4 accent-[#0b3b2c]" />
              I agree that GITB stores and processes my data and CV to assess my internship application.
            </label>
            {error && <p className="rounded-xl bg-white/70 p-3 text-sm font-medium text-[#8a3d00]">{error}</p>}
            <button disabled={status === "sending"} className="btn-dark w-full !py-3.5 disabled:opacity-60">
              {status === "sending" ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Sending…
                </>
              ) : (
                <>
                  Submit application <ArrowRight size={16} />
                </>
              )}
            </button>
            <p className="flex items-center gap-2 text-xs text-ink/70">
              <Globe2 size={14} /> Questions? Email admissions@gitb.lt
            </p>
          </div>
        </div>
      </form>
    </section>
  );
}

function Card({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <fieldset className="glass sheen space-y-4 rounded-[24px] p-5 sm:p-6">
      <legend className="sr-only">{title}</legend>
      <div className="flex items-center gap-3">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink font-display text-xs text-lime">{n}</span>
        <h3 className="font-display text-base uppercase">{title}</h3>
      </div>
      {children}
    </fieldset>
  );
}

function Text({
  name,
  label,
  type = "text",
  required,
  autoComplete,
  placeholder,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input name={name} type={type} required={required} autoComplete={autoComplete} placeholder={placeholder} className="field" />
    </label>
  );
}
