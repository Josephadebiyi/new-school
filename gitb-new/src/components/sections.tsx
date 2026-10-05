import { useMemo, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "motion/react";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code2,
  LineChart,
  Megaphone,
  PenTool,
  PlayCircle,
  Quote,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import { courses, categories, faqs, pillars, stats, testimonials, contact } from "../data/site";
import { CourseCard } from "./CourseCard";
import { Sparkle, Star } from "./Sparkle";
import { Accordion, Display, Eyebrow, Reveal } from "./ui";

/* ------------------------------------------------------------------ HERO */
const heroChips = [
  { label: "Cybersecurity", icon: ShieldCheck, pos: "left-[2%] top-[58%]", delay: 0.5 },
  { label: "Web development", icon: Code2, pos: "left-[6%] top-[78%]", delay: 0.65 },
  { label: "UI/UX design", icon: PenTool, pos: "right-[2%] top-[44%]", delay: 0.8 },
  { label: "Data & AI", icon: LineChart, pos: "right-[4%] top-[66%]", delay: 0.95 },
];

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 90]);

  return (
    <section ref={ref} className="relative px-5 pt-10 sm:px-10 sm:pt-14">
      <Star className="absolute left-[6%] top-[22%] hidden h-12 w-5 text-ink md:block" />
      <Star className="absolute right-[7%] top-[12%] hidden h-9 w-4 text-ink md:block" />

      <Reveal className="text-center">
        <Eyebrow>Practical, career-ready education</Eyebrow>
        <Display
          as="h1"
          text="Future-ready [skills] for the [digital] world"
          className="mx-auto mt-6 max-w-6xl text-[clamp(2.4rem,6.4vw,5.6rem)]"
        />
        <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-sub">
          Build practical, globally relevant skills through beginner-friendly programs, expert-led training and
          flexible online learning — with the support to move into a meaningful digital career.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/courses" className="btn-dark">
            Choose a program <ArrowRight size={16} />
          </Link>
          <Link to="/contact" className="btn-ghost">
            Talk to admissions
          </Link>
        </div>
      </Reveal>

      {/* Visual: duotone VR learner on a frosted green stage, neon GITB on the visor */}
      <div className="relative mx-auto mt-10 h-[420px] max-w-5xl sm:h-[540px]">
        <div className="absolute inset-x-[6%] bottom-0 top-[18%] overflow-hidden rounded-[40px] bg-gradient-to-br from-moss via-forest to-ink shadow-[0_40px_80px_-40px_rgba(6,41,31,0.8)]">
          <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_30%,rgba(212,245,66,0.35),transparent_70%)]" />
          <div className="orb-soft absolute -left-10 bottom-[-40px] h-48 w-48 opacity-60" />
          <div className="orb absolute right-[8%] top-[10%] h-20 w-20 opacity-80" />
          <div className="glass-dark absolute bottom-6 right-6 hidden rounded-2xl px-4 py-3 text-left text-white sm:block">
            <p className="text-[11px] uppercase tracking-[0.16em] text-lime">Live + recorded</p>
            <p className="mt-0.5 text-sm font-semibold">Learn from anywhere</p>
          </div>
        </div>
        <div className="orb absolute left-[14%] top-[8%] h-14 w-14" />
        <div className="orb-soft absolute right-[16%] top-[2%] h-10 w-10" />

        <motion.div style={{ y }} className="absolute inset-x-0 bottom-0 mx-auto w-[min(92%,640px)]">
          <div className="relative">
            <img src="/img/hero-vr.png" alt="Learner exploring immersive technology" className="w-full select-none [mask-image:linear-gradient(180deg,#000_52%,transparent_92%)] sm:[mask-image:linear-gradient(180deg,#000_70%,transparent_100%)]" draggable={false} />
            <span
              className="neon absolute left-[44%] top-[9.5%] -rotate-[4deg] text-[clamp(14px,3.2vw,30px)] tracking-wider"
              aria-hidden
            >
              GITB
            </span>
          </div>
        </motion.div>

        {heroChips.map(({ label, icon: Icon, pos, delay }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, type: "spring", stiffness: 220, damping: 18 }}
            className={`absolute ${pos} hidden sm:block`}
          >
            <span className="glass sheen float-mid flex items-center gap-2.5 rounded-xl px-4 py-2.5 font-display text-[13px] uppercase text-ink">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-ink text-lime">
                <Icon size={15} />
              </span>
              {label}
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ STATS */
export function Stats() {
  return (
    <section className="relative px-5 pt-8 sm:px-10">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.06}>
            <div className="glass sheen rounded-2xl px-5 py-5">
              <p className="font-display text-3xl text-ink sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-sm font-medium text-sub">{s.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ COURSES */
export function CoursesSection({ showAll = false }: { showAll?: boolean }) {
  const [cat, setCat] = useState("All programs");
  const [dur, setDur] = useState("Any duration");
  const track = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  const list = useMemo(
    () =>
      courses.filter(
        (c) =>
          (cat === "All programs" || c.category === cat) &&
          (dur === "Any duration" ||
            (dur === "Monthly (languages)" && c.months === 0) ||
            (dur === "Up to 3 months" && c.months > 0 && c.months <= 3) ||
            (dur === "4 – 6 months" && c.months >= 4)),
      ),
    [cat, dur],
  );

  const scroll = (dir: number) => track.current?.scrollBy({ left: dir * 340, behavior: "smooth" });

  return (
    <section id="programs" className="relative px-5 pt-24 sm:px-10">
      <Reveal>
        <Display
          text="[Every] program is a key [to] your next career"
          className="max-w-4xl text-[clamp(1.9rem,3.8vw,3.2rem)]"
        />
      </Reveal>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Select value={cat} onChange={setCat} options={["All programs", ...categories]} />
          <Select value={dur} onChange={setDur} options={["Any duration", "Monthly (languages)", "Up to 3 months", "4 – 6 months"]} />
        </div>
        {!showAll && (
          <div className="flex items-center gap-2">
            <button onClick={() => scroll(-1)} className="glass grid h-11 w-11 place-items-center rounded-xl" aria-label="Previous">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => scroll(1)} className="glass grid h-11 w-11 place-items-center rounded-xl" aria-label="Next">
              <ChevronRight size={18} />
            </button>
            <Link to="/courses" className="btn-ghost">
              See all programs
            </Link>
          </div>
        )}
      </div>

      {showAll ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c, i) => (
            <Reveal key={c.slug} delay={(i % 3) * 0.06}>
              <CourseCard course={c} />
            </Reveal>
          ))}
        </div>
      ) : (
        <>
          <div
            ref={track}
            onScroll={(e) => {
              const el = e.currentTarget;
              setProgress(el.scrollLeft / Math.max(1, el.scrollWidth - el.clientWidth));
            }}
            className="no-scrollbar -mx-5 mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 sm:-mx-10 sm:px-10"
          >
            {list.map((c) => (
              <div key={c.slug} className="w-[82%] shrink-0 snap-start sm:w-[340px]">
                <CourseCard course={c} />
              </div>
            ))}
          </div>
          <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full rounded-full bg-ink transition-[width] duration-200"
              style={{ width: `${Math.max(14, progress * 100)}%` }}
            />
          </div>
        </>
      )}

      {list.length === 0 && <p className="mt-8 text-sub">No programs match these filters yet.</p>}
      <p className="mt-6 text-sm text-sub">
        Professional programs plus Spanish, French and Lithuanian language courses (from €120/month). More programs — including AI & Automation, Data Analytics and Product Design — are announced regularly.{" "}
        <Link to="/contact" className="font-semibold text-ink underline decoration-lime decoration-2 underline-offset-4">
          Ask admissions what's starting next
        </Link>
        .
      </p>
    </section>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="relative">
      <span className="sr-only">Filter</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="chip cursor-pointer appearance-none !bg-chip/80 pr-9 backdrop-blur"
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <ChevronRight size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rotate-90" />
    </label>
  );
}

/* ------------------------------------------------------------------ WHY (sticky stacked glass-lime cards) */
const pillarIcons = { target: Target, clock: Clock, briefcase: Briefcase, users: Users };

export function WhySection() {
  return (
    <section id="why" className="relative px-5 pt-28 sm:px-10">
      <Star className="absolute right-[10%] top-24 hidden h-12 w-5 text-ink md:block" />
      <Star className="absolute left-[8%] top-64 hidden h-9 w-4 text-ink md:block" />
      <Reveal className="text-center">
        <Display text="Why [choose] GITB" className="text-[clamp(2.2rem,5vw,4.2rem)]" />
        <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-sub">
          Program quality, real learner support and clear career direction — so you move from curiosity to confidence,
          and from training to opportunity.
        </p>
      </Reveal>

      <div className="mx-auto mt-14 max-w-3xl">
        {pillars.map((p, i) => {
          const Icon = pillarIcons[p.icon];
          return (
            <div key={p.title} className="sticky pb-6" style={{ top: 110 + i * 22 }}>
              <div className="glass-lime sheen relative overflow-hidden rounded-[28px] p-7 sm:p-10">
                <span className="watermark absolute -right-4 -top-6 text-[180px] text-white/40">{String(i + 1).padStart(2, "0")}</span>
                <div className="relative flex gap-5 sm:gap-7">
                  <div className="flex flex-col items-center">
                    <span className="grid h-14 w-14 place-items-center rounded-full bg-ink text-lime shadow-lg">
                      <Icon size={24} />
                    </span>
                    <span className="mt-3 w-px flex-1 bg-ink/25" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl uppercase text-ink sm:text-2xl">{p.title}</h3>
                    <p className="mt-3 max-w-xl leading-relaxed text-ink/80">{p.body}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ INTERNSHIPS TEASER */
export function InternshipTeaser() {
  return (
    <section className="relative px-5 pt-24 sm:px-10">
      <Reveal>
        <div className="glass-lime sheen relative overflow-hidden rounded-[30px] p-7 sm:p-10">
          <span className="watermark absolute -bottom-6 right-4 text-[160px] text-white/45">3–12</span>
          <div className="relative grid items-center gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink/70">New · Internships</p>
              <h2 className="mt-3 font-display text-[clamp(1.6rem,3.4vw,2.6rem)] uppercase leading-tight">
                Put your skills <span className="text-ink/45">to work</span>
              </h2>
              <p className="mt-3 max-w-xl text-ink/80">
                Mentored internships from 3 months to 1 year in cybersecurity, data & AI, design, web development, project
                management and compliance.
              </p>
            </div>
            <Link to="/internships" className="btn-dark">
              Explore internships <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ LEARNING PORTAL */
export function PortalSection() {
  return (
    <section className="relative px-5 pt-24 sm:px-10">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <Reveal>
          <Eyebrow>Learning portal</Eyebrow>
          <Display text="A [connected] digital [learning] experience" className="mt-5 text-[clamp(2rem,4vw,3.4rem)]" />
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-sub">
            Your student portal gives you course materials, recorded sessions, support resources and progress tracking in
            one place — from admission to graduation.
          </p>
          <ul className="mt-6 space-y-3">
            {["Sign in to your learning portal", "Access program materials and support", "Continue your progress from one place"].map(
              (t) => (
                <li key={t} className="flex items-center gap-3 font-medium">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-lime">
                    <Check size={14} />
                  </span>
                  {t}
                </li>
              ),
            )}
          </ul>
          <div className="mt-8 flex gap-3">
            <Link to="/login" className="btn-dark">
              Student log in
            </Link>
            <Link to="/apply" className="btn-ghost">
              Apply now
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="relative">
            <div className="orb absolute -right-6 -top-8 h-24 w-24" />
            <div className="relative overflow-hidden rounded-[30px] bg-ink p-6 text-white shadow-[0_40px_80px_-40px_rgba(6,41,31,0.9)] sm:p-8">
              <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_100%_0%,rgba(212,245,66,0.25),transparent_60%)]" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="font-display text-sm uppercase text-lime">GITB learning portal</p>
                  <p className="mt-1 text-sm text-white/60">Courses, support and progress in one place</p>
                </div>
                <PlayCircle className="text-lime" />
              </div>
              <div className="glass-dark relative mt-6 rounded-2xl p-5">
                <p className="text-sm font-semibold">Continue learning</p>
                <p className="mt-1 text-sm text-white/60">Resume your program and keep your momentum.</p>
                <div className="mt-4 h-2 rounded-full bg-white/10">
                  <div className="h-full w-[64%] rounded-full bg-lime" />
                </div>
              </div>
              <div className="relative mt-4 grid grid-cols-2 gap-4">
                <div className="glass-dark rounded-2xl p-5">
                  <p className="text-sm font-semibold">Recorded lessons</p>
                  <p className="mt-1 text-sm text-white/60">Revisit class content any time.</p>
                </div>
                <div className="rounded-2xl bg-lime p-5 text-ink">
                  <p className="text-sm font-semibold">Mentor support</p>
                  <p className="mt-1 text-sm text-ink/70">Guided check-ins that keep you on track.</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ ACCREDITATION */
export function AccreditationSection() {
  return (
    <section className="relative px-5 pt-24 sm:px-10">
      <Reveal>
        <div className="glass sheen relative overflow-hidden rounded-[30px] p-7 sm:p-10">
          <div className="orb-soft absolute -bottom-16 -right-10 h-56 w-56 opacity-60" />
          <div className="relative grid items-center gap-8 md:grid-cols-[auto_1fr_auto]">
            <div className="grid h-28 w-28 place-items-center rounded-3xl bg-ink shadow-xl">
              <BadgeCheck size={52} className="text-lime" />
            </div>
            <div>
              <Eyebrow>Accreditation</Eyebrow>
              <Display text="Internationally [recognised] qualifications" className="mt-4 text-[clamp(1.6rem,3vw,2.5rem)]" />
              <p className="mt-3 max-w-2xl leading-relaxed text-sub">
                GITB is accredited by the American Council of Training and Development (ACTD), confirming our programs meet
                rigorous international standards for quality, structure and professional relevance.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Link to="/verify-certificate" className="btn-dark">
                Verify a certificate
              </Link>
              <Link to="/why-gitb" className="btn-ghost">
                Learn more
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ ALUMNI (dark) */
export function AlumniSection() {
  return (
    <section id="alumni" className="relative mt-24 overflow-hidden bg-ink px-5 py-20 text-white sm:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(50%_60%_at_85%_20%,rgba(212,245,66,0.18),transparent_70%)]" />
      <Sparkle className="absolute left-[46%] top-[30%] hidden h-8 w-8 text-white md:block" />
      <Sparkle className="absolute right-[4%] top-[62%] hidden h-6 w-6 text-lime md:block" />
      <div className="relative grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <h2 className="font-display text-[clamp(2.2rem,4.6vw,3.8rem)] uppercase leading-[1.05]">
            Proud <span className="text-white/45">of</span>
            <br />
            <span className="text-white/45">our</span> learners
          </h2>
          <p className="mt-6 max-w-md leading-relaxed text-white/65">
            Real stories show how training turns into confidence, capability and progress — from complete beginners to
            professionals learning alongside full-time work.
          </p>
          <Link to="/testimonials" className="btn-lime mt-8">
            Read learner stories <ArrowRight size={16} />
          </Link>
          <div className="relative mt-10 hidden overflow-hidden rounded-[26px] lg:block">
            <img src="/img/classroom-duo.jpg" alt="Learners in a GITB-style classroom" className="h-56 w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
          </div>
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08} className={i === 0 ? "sm:row-span-2" : ""}>
              <figure className={`glass-dark sheen flex h-full flex-col rounded-[26px] p-6 ${i === 0 ? "sm:p-8" : ""}`}>
                <Quote className="text-lime" size={28} />
                <blockquote className={`mt-4 flex-1 leading-relaxed text-white/90 ${i === 0 ? "text-xl" : ""}`}>
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-lime font-display text-lg text-ink">
                    {t.name[0]}
                  </span>
                  <span>
                    <span className="block font-semibold">{t.name}</span>
                    <span className="block text-sm text-white/55">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
          <Reveal delay={0.24}>
            <div className="flex h-full flex-col justify-between rounded-[26px] bg-lime p-6 text-ink">
              <Megaphone />
              <p className="mt-6 font-display text-lg uppercase leading-snug">Your story could be next.</p>
              <Link to="/apply" className="mt-4 inline-flex items-center gap-2 text-sm font-bold">
                Start your application <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ FAQ */
export function FaqSection() {
  return (
    <section id="faq" className="relative px-5 pt-24 sm:px-10">
      <Star className="absolute left-[12%] top-28 hidden h-12 w-5 text-ink md:block" />
      <Reveal className="text-center">
        <Display text="FAQ" className="text-[clamp(2.4rem,5vw,4rem)]" />
        <p className="mx-auto mt-4 max-w-xl text-sub">Clear answers before you apply — about background, time, outcomes and support.</p>
      </Reveal>
      <div className="mx-auto mt-10 max-w-3xl">
        <Accordion items={faqs} />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ CONTACT */
export function ContactSection() {
  const [sent, setSent] = useState(false);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const subject = encodeURIComponent("Website enquiry");
    const body = encodeURIComponent(`${data.get("message")}\n\n— ${data.get("name")} (${data.get("email")})`);
    window.location.href = `mailto:${contact.admissions}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <section id="contact" className="relative overflow-hidden px-5 pb-16 pt-28 sm:px-10">
      <div className="absolute bottom-[-30%] left-1/2 h-[560px] w-[min(900px,120%)] -translate-x-1/2 rounded-full bg-gradient-to-b from-lime to-lime-2 opacity-80 blur-[2px]" />
      <Star className="absolute left-[10%] top-36 hidden h-12 w-5 text-ink md:block" />
      <Star className="absolute right-[12%] top-56 hidden h-14 w-6 text-ink md:block" />
      <Reveal className="relative text-center">
        <Display text="Still [have] questions?" className="text-[clamp(2.2rem,5vw,4.2rem)]" />
        <p className="mx-auto mt-4 max-w-xl text-sub">
          We're here to help. Talk to admissions about programs, schedules and what you can achieve with GITB.
        </p>
      </Reveal>
      <Reveal delay={0.1} className="relative">
        <form onSubmit={onSubmit} className="glass sheen mx-auto mt-10 max-w-2xl space-y-4 rounded-[28px] p-5 sm:p-7">
          <div className="grid gap-4 sm:grid-cols-2">
            <input name="name" required placeholder="Your name" className="field" autoComplete="name" />
            <input name="email" required type="email" placeholder="E-mail" className="field" autoComplete="email" />
          </div>
          <textarea name="message" required placeholder="Message" rows={4} className="field resize-none" />
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <p className="text-sm text-sub">
              Or email <a className="font-semibold text-ink" href={`mailto:${contact.admissions}`}>{contact.admissions}</a>
            </p>
            <button className="btn-dark">{sent ? "Opening your email app…" : "Send message"}</button>
          </div>
        </form>
      </Reveal>
    </section>
  );
}
