import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Check,
  Copy,
  CreditCard,
  FileText,
  Info,
  Search,
  Send,
  UserPlus,
} from "lucide-react";
import { CourseArt } from "../components/CourseArt";
import { Sparkle, Star } from "../components/Sparkle";
import {
  APPLICATION_FEE,
  categories,
  contact,
  courses,
  languageCourses,
  programs,
  type Course,
} from "../data/site";
import { ApplyShell, Badge, useApplyHref } from "./ApplyShell";
import { findLiveCourse, liveTuitionLabel, useLivePricing } from "./useLivePricing";

const TYPES = [
  { id: "all", label: "All types" },
  { id: "program", label: "Professional programs" },
  { id: "language", label: "Language courses" },
] as const;

/* ================================================================ HOME */
export function ApplyHome() {
  const nav = useNavigate();
  const href = useApplyHref();
  const live = useLivePricing();
  const onSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const q = String(f.get("q") || "");
    const type = String(f.get("type") || "all");
    nav(`/apply/courses?${new URLSearchParams({ ...(q && { q }), ...(type !== "all" && { type }) })}`);
  };

  return (
    <ApplyShell>
      {/* hero + search */}
      <section className="relative mx-3 mt-4 overflow-hidden rounded-[28px] sm:mx-5">
        <img src="/img/library-duo.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/75 to-ink/95" />
        <div className="orb absolute -right-12 -top-16 h-56 w-56 opacity-70" />
        <div className="orb-soft absolute -left-10 bottom-10 h-28 w-28 opacity-40" />
        <Sparkle className="absolute left-[12%] top-16 h-6 w-6 text-lime" />
        <Star className="absolute right-[14%] top-28 h-12 w-5 text-white/80" />
        <div className="relative px-5 pb-10 pt-16 text-center text-white sm:px-10 sm:pt-24">
          <h1 className="font-display text-[clamp(2.4rem,6vw,4.8rem)] uppercase leading-none">
            Start <span className="text-white/45">your</span> journey
          </h1>
          <p className="mt-4 text-lg text-white/75">Send your online application easily</p>

          <form onSubmit={onSearch} className="glass-dark mx-auto mt-12 flex max-w-3xl flex-col gap-2 rounded-2xl p-2 sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">What do you want to study?</span>
              <input
                name="q"
                placeholder="What do you want to study?"
                className="h-12 w-full rounded-xl bg-white/95 px-4 text-ink outline-none placeholder:text-sub/70 focus:ring-4 focus:ring-lime/50"
              />
            </label>
            <select name="type" className="h-12 rounded-xl bg-white/95 px-4 text-ink outline-none sm:w-56">
              {TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <button className="btn-lime h-12 !px-6">
              <Search size={17} /> Search
            </button>
          </form>
          <Link to="/apply/courses" className="mt-4 inline-block text-sm font-semibold text-white/80 underline-offset-4 hover:underline">
            More search options
          </Link>
        </div>
      </section>

      {/* featured programmes + info */}
      <section className="grid gap-8 px-5 pt-14 sm:px-10 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <h2 className="display text-3xl">
            Featured <span className="dim">programmes</span>
          </h2>
          {[
            { title: "Professional programs", list: programs },
            { title: "Language courses", list: languageCourses },
          ].map((g) => (
            <div key={g.title} className="mt-8">
              <h3 className="font-display text-sm uppercase tracking-wider text-forest">{g.title}</h3>
              <ul className="mt-3 divide-y divide-ink/10 overflow-hidden rounded-2xl bg-white/60">
                {g.list.map((c) => (
                  <li key={c.slug} className="flex items-center gap-4 px-4 py-3.5 hover:bg-white">
                    <Badge course={c} />
                    <div className="min-w-0 flex-1">
                      <Link to={`/apply/courses/${c.slug}`} className="font-semibold text-ink hover:underline">
                        {c.title}
                      </Link>
                      <p className="text-[13px] text-sub">
                        {c.type === "language" ? "Language course" : "Professional program"}, online · {c.duration}
                        {live && <> · {liveTuitionLabel(findLiveCourse(live, c.slug))}</>}
                      </p>
                    </div>
                    <Link to={href(c.slug)} className="hidden text-[13px] font-bold text-forest hover:underline sm:block">
                      Apply now!
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <aside className="space-y-5">
          <div className="glass sheen rounded-[26px] p-6">
            <h3 className="font-display text-lg uppercase">How to apply</h3>
            <ol className="mt-5 space-y-4">
              {[
                { icon: Search, t: "Find your programme", d: "Search or browse every GITB course." },
                { icon: UserPlus, t: "Register", d: "Create your applicant account." },
                { icon: FileText, t: "Complete the form", d: "Profile, education, documents and motivation." },
                { icon: CreditCard, t: `Pay the €${APPLICATION_FEE} fee`, d: "One-time administrative fee." },
                { icon: Send, t: "Submit", d: "Admissions reviews and contacts you." },
              ].map(({ icon: Icon, t, d }, i) => (
                <li key={t} className="flex gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink text-lime">
                    <Icon size={17} />
                  </span>
                  <span>
                    <span className="font-semibold">
                      <span className="mr-1.5 font-display text-xs text-sub">0{i + 1}</span>
                      {t}
                    </span>
                    <span className="block text-sm text-sub">{d}</span>
                  </span>
                </li>
              ))}
            </ol>
            <Link to="/apply/courses" className="btn-dark mt-6 w-full">
              Find programmes <ArrowRight size={16} />
            </Link>
          </div>
          <FeesCard live={live} />
        </aside>
      </section>
    </ApplyShell>
  );
}

function FeesCard({ live }: { live: ReturnType<typeof useLivePricing> }) {
  const fee = live?.applicationFee ?? APPLICATION_FEE;
  return (
    <div className="glass-lime sheen rounded-[26px] p-6">
      <h3 className="font-display text-lg uppercase">Fees</h3>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-center justify-between gap-3 rounded-xl bg-white/60 px-4 py-3">
          <dt className="font-semibold">Application / administrative fee</dt>
          <dd className="font-display text-lg">€{fee}</dd>
        </div>
        {courses.map((c) => {
          const liveCourse = findLiveCourse(live, c.slug);
          return (
            <div key={c.slug} className="flex items-center justify-between gap-3 rounded-xl bg-white/60 px-4 py-3">
              <dt>
                <span className="font-semibold">{c.title}</span>
                <span className="block text-ink/65">{c.type === "language" ? "Standard / Intensive" : c.category}</span>
              </dt>
              <dd className="whitespace-nowrap text-right font-display text-base">{liveTuitionLabel(liveCourse)}</dd>
            </div>
          );
        })}
      </dl>
      <p className="mt-3 text-xs text-ink/70">Questions about tuition? Contact {contact.admissions}.</p>
    </div>
  );
}

/* ================================================================ FIND PROGRAMMES */
export function ApplyCourses() {
  const [params, setParams] = useSearchParams();
  const href = useApplyHref();
  const live = useLivePricing();
  const [copied, setCopied] = useState(false);
  const q = params.get("q") ?? "";
  const type = (params.get("type") ?? "all") as (typeof TYPES)[number]["id"];
  const picked = params.getAll("cat");
  const specific = picked.length > 0 || params.get("scope") === "specific";

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return courses.filter(
      (c) =>
        (type === "all" || c.type === type) &&
        (!specific || picked.length === 0 || picked.includes(c.category)) &&
        (!needle || `${c.title} ${c.category} ${c.summary}`.toLowerCase().includes(needle)),
    );
  }, [q, type, picked, specific]);

  const setParam = (mut: (p: URLSearchParams) => void) => {
    const next = new URLSearchParams(params);
    mut(next);
    setParams(next, { replace: true });
  };

  return (
    <ApplyShell>
      <section className="px-5 pt-10 sm:px-10">
        <h1 className="display text-4xl sm:text-5xl">
          Find <span className="dim">programmes</span>
        </h1>
        <p className="mt-3 text-sub">
          Once you've found a study opportunity below, click <strong className="text-ink">“Apply now!”</strong> and you'll be taken
          to the right application form.
        </p>

        <div className="glass sheen mt-8 rounded-[26px] p-5 sm:p-6">
          <div className="flex flex-wrap gap-5 text-sm font-semibold">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={!specific}
                onChange={() =>
                  setParam((p) => {
                    p.delete("cat");
                    p.delete("scope");
                  })
                }
                className="h-4 w-4 accent-[#0b3b2c]"
              />
              Search all categories
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={specific}
                onChange={() => setParam((p) => p.set("scope", "specific"))}
                className="h-4 w-4 accent-[#0b3b2c]"
              />
              Choose specific categories
            </label>
          </div>
          {specific && (
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((cat) => {
                const on = picked.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() =>
                      setParam((p) => {
                        const all = p.getAll("cat").filter((x) => x !== cat);
                        p.delete("cat");
                        (on ? all : [...all, cat]).forEach((x) => p.append("cat", x));
                      })
                    }
                    className={`chip ${on ? "!bg-ink !text-white" : "!bg-white/70"}`}
                  >
                    {on && <Check size={14} />} {cat}
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <input
              value={q}
              onChange={(e) => setParam((p) => (e.target.value ? p.set("q", e.target.value) : p.delete("q")))}
              placeholder="Type to search programmes"
              className="field flex-1"
            />
            <select
              value={type}
              onChange={(e) => setParam((p) => (e.target.value === "all" ? p.delete("type") : p.set("type", e.target.value)))}
              className="field sm:w-60"
            >
              {TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="font-semibold">Study format:</p>
              <label className="mt-2 flex items-center gap-2">
                <input type="checkbox" checked readOnly className="h-4 w-4 accent-[#0b3b2c]" /> Online
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[11px]">{courses.length}</span>
              </label>
            </div>
            <div>
              <p className="font-semibold">Programme types:</p>
              <div className="mt-2 flex flex-wrap gap-4">
                {TYPES.slice(1).map((t) => (
                  <span key={t.id} className="flex items-center gap-2">
                    {t.label}
                    <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-[11px]">
                      {courses.filter((c) => c.type === t.id).length}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="font-display text-5xl">{results.length}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-forest">Search results</p>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href).then(() => setCopied(true));
              setTimeout(() => setCopied(false), 1800);
            }}
            className="mt-3 inline-flex items-center gap-2 border-t border-ink/15 pt-3 text-sm font-semibold text-forest"
          >
            <Copy size={14} /> {copied ? "Link copied" : "Copy and share"}
          </button>
        </div>

        <div className="mt-8 space-y-5">
          {results.map((c) => (
            <ResultCard key={c.slug} course={c} applyTo={href(c.slug)} live={findLiveCourse(live, c.slug)} applicationFee={live?.applicationFee ?? APPLICATION_FEE} />
          ))}
          {results.length === 0 && (
            <p className="glass rounded-2xl p-6 text-center text-sub">
              No programmes match your search. Try another word or{" "}
              <button onClick={() => setParams({})} className="font-semibold text-ink underline">
                clear the filters
              </button>
              .
            </p>
          )}
        </div>
      </section>
    </ApplyShell>
  );
}

function ResultCard({ course: c, applyTo, live, applicationFee }: { course: Course; applyTo: string; live: any; applicationFee: number }) {
  return (
    <article className="glass sheen grid gap-5 rounded-[24px] p-5 md:grid-cols-[180px_1fr_260px] md:p-6">
      <div className="text-sm">
        <CourseArt kind={c.art} letters={c.letters} className="!aspect-[4/3] !rounded-2xl" />
        <p className="mt-3 font-semibold">{c.category}</p>
        <p className="text-sub">GITB · Online</p>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <Badge course={c} />
          <Link to={`/apply/courses/${c.slug}`} className="text-lg font-bold text-ink hover:underline">
            {c.title}
          </Link>
        </div>
        <dl className="mt-3 space-y-1 text-sm text-sub">
          <dd>{c.type === "language" ? "Language course" : "Professional program"}, online, {c.duration.toLowerCase()}</dd>
          <dd>Study language: {c.type === "language" ? c.short : "English"}</dd>
          <dd>Study location: Online</dd>
        </dl>
        <p className="mt-3 text-sm">
          Tuition fee: <strong>{liveTuitionLabel(live)}</strong>
        </p>
        <Link to={`/apply/courses/${c.slug}`} className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-chip px-4 py-2.5 pt-2.5 text-sm font-semibold hover:bg-white">
          <Info size={15} /> More information
        </Link>
      </div>
      <div className="space-y-3">
        <Link to={applyTo} className="btn-dark w-full flex-col !items-start !gap-0 !py-3 text-left">
          <span className="text-base">Apply now!</span>
          <span className="text-xs font-medium text-white/65">Online application</span>
        </Link>
        <p className="flex items-start gap-2 text-sm">
          <CreditCard size={16} className="mt-0.5 shrink-0 text-forest" />
          <span>
            <strong>Application fee</strong>
            <span className="block text-sub">€{applicationFee} one-time, administrative</span>
          </span>
        </p>
        <p className="flex items-start gap-2 text-sm">
          <CalendarCheck size={16} className="mt-0.5 shrink-0 text-forest" />
          <span>
            <strong>Start date</strong>
            <span className="block text-sub">Confirmed by admissions after review</span>
          </span>
        </p>
      </div>
    </article>
  );
}

/* ================================================================ COURSE PAGE */
export function ApplyCourse() {
  const { slug } = useParams();
  const href = useApplyHref();
  const live = useLivePricing();
  const c = courses.find((x) => x.slug === slug);
  if (!c)
    return (
      <ApplyShell>
        <p className="p-10 text-center">
          Programme not found. <Link to="/apply/courses">Find programmes</Link>
        </p>
      </ApplyShell>
    );

  const liveCourse = findLiveCourse(live, c.slug);
  const applicationFee = live?.applicationFee ?? APPLICATION_FEE;
  const tiers = Array.isArray(liveCourse?.pricing_tiers) ? liveCourse.pricing_tiers : [];

  const rows: [string, ReactNode][] = [
    ["Study location", "Online (GITB, Vilnius, Lithuania)"],
    ["Type", c.type === "language" ? "Language course, online" : "Professional program, online"],
    ["Nominal duration", c.type === "language" ? "Monthly enrolment" : c.duration],
    ["Study language", c.type === "language" ? c.short : "English"],
    ["Awards", c.certificates.join(" · ")],
    [
      "Tuition fee",
      tiers.length > 0 ? (
        <div className="space-y-2">
          {tiers.map((t: any) => (
            <p key={t.id}>
              <strong>€{t.price_monthly} per month{t.label ? ` — ${t.label}` : ""}</strong>
            </p>
          ))}
        </div>
      ) : liveTuitionLabel(liveCourse) !== "On request — ask admissions" ? (
        <strong>{liveTuitionLabel(liveCourse)}</strong>
      ) : (
        <span>
          On request — email <a href={`mailto:${contact.admissions}`} className="font-semibold underline">{contact.admissions}</a>
        </span>
      ),
    ],
    ["Application fee", <span key="f"><strong>€{applicationFee} one-time</strong> <span className="text-sub">(administrative fee)</span></span>],
    [
      "Entry qualification",
      c.type === "language"
        ? "Open to new learners — tell us your current level in the application."
        : "No tech background required — beginner tracks start from scratch with guided support.",
    ],
    ["What you'll learn", <ul key="m" className="list-disc space-y-1 pl-5">{c.modules.map((m) => <li key={m}>{m}</li>)}</ul>],
    ["Documents", "Passport or national ID card. A CV and previous certificates are optional."],
  ];

  return (
    <ApplyShell>
      <section className="relative mx-3 mt-4 sm:mx-5">
        <CourseArt kind={c.art} letters={c.letters} className="!aspect-[16/6] sm:!aspect-[16/5]" />
      </section>
      <section className="grid gap-8 px-5 pt-8 sm:px-10 lg:grid-cols-[1fr_320px]">
        <div>
          <Link to="/apply/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-sub hover:text-ink">
            <ArrowLeft size={15} /> Back to search
          </Link>
          <div className="mt-4 flex items-center gap-3">
            <Badge course={c} />
            <span className="text-sm text-sub">GITB — Global Institute of Technology and Business · Lithuania, Vilnius</span>
          </div>
          <h1 className="display mt-3 text-3xl sm:text-4xl">{c.title}</h1>
          <p className="mt-4 max-w-2xl leading-relaxed text-sub">{c.summary}</p>

          <dl className="glass sheen mt-8 divide-y divide-ink/10 overflow-hidden rounded-[24px]">
            {rows.map(([k, v]) => (
              <div key={k} className="grid gap-1 px-5 py-4 sm:grid-cols-[200px_1fr] sm:gap-6 sm:px-6">
                <dt className="text-sm font-semibold text-sub">{k}</dt>
                <dd className="text-[15px]">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <aside className="lg:sticky lg:top-28 lg:h-max">
          <div className="rounded-[24px] bg-ink p-5 text-white">
            <Link to={href(c.slug)} className="btn-lime w-full flex-col !items-start !gap-0 !py-3.5 text-left">
              <span className="text-lg">Apply now!</span>
              <span className="text-xs font-medium text-ink/70">Online application</span>
            </Link>
            <div className="mt-5 space-y-4 text-sm">
              <p className="flex gap-3">
                <CreditCard size={17} className="shrink-0 text-lime" />
                <span>
                  <strong>Application fee</strong>
                  <span className="block text-white/60">€{applicationFee} one-time, administrative</span>
                </span>
              </p>
              {tiers.length > 0 && (
                <p className="flex gap-3">
                  <CalendarCheck size={17} className="shrink-0 text-lime" />
                  <span>
                    <strong>From €{Math.min(...tiers.map((t: any) => Number(t.price_monthly) || 0))}/month</strong>
                    <span className="block text-white/60">{tiers.map((t: any) => `${t.label || t.id}: €${t.price_monthly}`).join(" · ")}</span>
                  </span>
                </p>
              )}
              {tiers.length === 0 && liveTuitionLabel(liveCourse) !== "On request — ask admissions" && (
                <p className="flex gap-3">
                  <CalendarCheck size={17} className="shrink-0 text-lime" />
                  <span>
                    <strong>{liveTuitionLabel(liveCourse)}</strong>
                  </span>
                </p>
              )}
              <p className="flex gap-3">
                <Info size={17} className="shrink-0 text-lime" />
                <span className="text-white/70">
                  Questions? <a href={`mailto:${contact.admissions}`} className="font-semibold text-white">{contact.admissions}</a>
                </span>
              </p>
            </div>
          </div>
        </aside>
      </section>
    </ApplyShell>
  );
}
