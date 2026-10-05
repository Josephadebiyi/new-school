import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Award, BadgeCheck, CalendarClock, Check, GraduationCap, Laptop, Search, Users } from "lucide-react";
import {
  AccreditationSection,
  AlumniSection,
  ContactSection,
  CoursesSection,
  FaqSection,
  Hero,
  InternshipTeaser,
  PortalSection,
  Stats,
  WhySection,
} from "../components/sections";
import { CourseArt } from "../components/CourseArt";
import { CourseCard } from "../components/CourseCard";
import { Display, Eyebrow, PageHero, Reveal } from "../components/ui";
import { Star } from "../components/Sparkle";
import { APPLICATION_FEE, contact, courses, languagePlans } from "../data/site";

export function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <CoursesSection />
      <WhySection />
      <InternshipTeaser />
      <PortalSection />
      <AccreditationSection />
      <AlumniSection />
      <FaqSection />
      <ContactSection />
    </>
  );
}

export function CoursesPage() {
  return (
    <>
      <PageHero
        eyebrow="Programs"
        title="Clear [paths] into [in-demand] careers"
        intro="Industry-led, fully online programs across technology, data, design, business and compliance — each built around real projects and mentor support."
      />
      <div className="-mt-20">
        <CoursesSection showAll />
      </div>
      <FaqSection />
      <ContactSection />
    </>
  );
}

export function CourseDetail() {
  const { slug } = useParams();
  const course = courses.find((c) => c.slug === slug);
  if (!course) return <NotFound />;
  const others = courses.filter((c) => c.slug !== course.slug).slice(0, 3);

  const facts = [
    { icon: CalendarClock, label: "Duration", value: course.type === "language" ? "Monthly enrolment" : course.duration },
    { icon: Laptop, label: "Format", value: "100% online · live + recorded" },
    { icon: Users, label: "Support", value: "Mentors & community" },
    { icon: Award, label: "Accreditation", value: "ACTD-accredited" },
  ];

  return (
    <>
      <section className="relative px-5 pt-10 sm:px-10">
        <Link to="/courses" className="inline-flex items-center gap-2 text-sm font-semibold text-sub hover:text-ink">
          <ArrowLeft size={16} /> All programs
        </Link>
        <div className="mt-6 grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          <Reveal>
            <Eyebrow>{course.category}</Eyebrow>
            <Display as="h1" text={course.title} className="mt-5 text-[clamp(2.1rem,4.6vw,3.8rem)]" />
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-sub">{course.summary}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={`/apply/courses/${course.slug}`} className="btn-dark">
                Apply for this program <ArrowRight size={16} />
              </Link>
              <Link to="/contact" className="btn-ghost">
                Talk to admissions
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <CourseArt kind={course.art} letters={course.letters} tall className="shadow-[0_40px_80px_-40px_rgba(6,41,31,0.6)]" />
          </Reveal>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {facts.map(({ icon: Icon, label, value }) => (
            <div key={label} className="glass sheen rounded-2xl p-5">
              <Icon size={20} className="text-forest" />
              <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-sub">{label}</p>
              <p className="mt-1 font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {course.type === "language" && (
        <section className="px-5 pt-16 sm:px-10">
          <Display text="Choose [your] pace" className="text-3xl sm:text-4xl" />
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {languagePlans.map((p) => (
              <div
                key={p.id}
                className={`${p.id === "intensive" ? "bg-ink text-white" : "glass sheen"} relative overflow-hidden rounded-[28px] p-7 sm:p-9`}
              >
                {p.id === "intensive" && <div className="orb absolute -right-10 -top-10 h-32 w-32 opacity-70" />}
                <p className={`text-xs font-bold uppercase tracking-[0.16em] ${p.id === "intensive" ? "text-lime" : "text-forest"}`}>{p.name}</p>
                <p className="mt-3 font-display text-5xl">
                  €{p.perMonth}
                  <span className="text-lg opacity-60"> / month</span>
                </p>
                <p className={`mt-3 ${p.id === "intensive" ? "text-white/75" : "text-sub"}`}>
                  {p.classesPerWeek} live online classes per week
                </p>
                <Link to={`/apply/courses/${course.slug}`} className={`mt-6 ${p.id === "intensive" ? "btn-lime" : "btn-dark"}`}>
                  Apply — {p.name} <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-sub">One-time application / administrative fee: €{APPLICATION_FEE}.</p>
        </section>
      )}

      <section className="px-5 pt-16 sm:px-10">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <Reveal>
            <div className="glass sheen h-full rounded-[28px] p-7 sm:p-9">
              <h2 className="font-display text-2xl uppercase">What you'll learn</h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {course.modules.map((m, i) => (
                  <li key={m} className="flex items-start gap-3 rounded-2xl bg-white/60 p-4">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-ink font-display text-xs text-lime">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="pt-1 font-medium">{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="glass-lime sheen h-full rounded-[28px] p-7 sm:p-9">
              <GraduationCap />
              <h2 className="mt-4 font-display text-2xl uppercase">You'll graduate with</h2>
              <ul className="mt-5 space-y-3">
                {course.certificates.map((c) => (
                  <li key={c} className="flex items-center gap-3 font-semibold">
                    <BadgeCheck size={20} /> {c}
                  </li>
                ))}
                <li className="flex items-center gap-3 font-semibold">
                  <Check size={20} /> A portfolio of practical project work
                </li>
              </ul>
              <p className="mt-6 text-sm text-ink/70">All GITB certificates can be verified online.</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-5 pt-20 sm:px-10">
        <Display text="[More] programs" className="text-3xl sm:text-4xl" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((c) => (
            <CourseCard key={c.slug} course={c} />
          ))}
        </div>
      </section>
      <ContactSection />
    </>
  );
}

export function WhyPage() {
  return (
    <>
      <PageHero
        eyebrow="Why GITB"
        title="Training designed [for] outcomes"
        intro="Learners want clarity before they commit: can I start from where I am, is it practical, will I be supported, and will it lead somewhere real? Here's how we answer that."
      />
      <section className="px-5 sm:px-10">
        <Reveal>
          <div className="relative overflow-hidden rounded-[30px]">
            <img src="/img/library-duo.jpg" alt="" className="h-[300px] w-full object-cover sm:h-[380px]" />
            <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/40 to-transparent" />
            <div className="absolute inset-y-0 left-0 flex max-w-lg flex-col justify-center p-8 text-white sm:p-12">
              <p className="font-display text-2xl uppercase leading-snug sm:text-3xl">
                From curiosity <span className="text-lime">to confidence.</span>
              </p>
              <p className="mt-4 text-white/75">
                Beginner-friendly paths, hands-on projects, mentorship and career coaching — built into every program.
              </p>
            </div>
          </div>
        </Reveal>
      </section>
      <WhySection />
      <PortalSection />
      <AccreditationSection />
      <ContactSection />
    </>
  );
}

export function TestimonialsPage() {
  return (
    <>
      <PageHero
        eyebrow="Alumni & learners"
        title="Real [learner] stories"
        intro="How practical training translates into confidence, capability and progress."
      />
      <AlumniSection />
      <ContactSection />
    </>
  );
}

export function FaqPage() {
  return (
    <>
      <PageHero eyebrow="Help centre" title="Questions [learners] ask" intro="Everything you need to know before you apply." />
      <div className="-mt-24">
        <FaqSection />
      </div>
      <ContactSection />
    </>
  );
}

export function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to [admissions]"
        intro={`Reach us at ${contact.admissions} or ${contact.info} · ${contact.city} · ${contact.hours}`}
      />
      <div className="-mt-24">
        <ContactSection />
      </div>
    </>
  );
}

export function VerifyPage() {
  const [id, setId] = useState("");
  const [state, setState] = useState<"idle" | "pending">("idle");
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setState("pending");
  };
  return (
    <>
      <PageHero
        eyebrow="Certificate verification"
        title="Verify a [GITB] certificate"
        intro="Employers and institutions can confirm any certificate issued by GITB. Enter the certificate ID printed on the document."
      />
      <section className="relative px-5 pb-20 sm:px-10">
        <Star className="absolute left-[14%] top-0 hidden h-12 w-5 text-ink md:block" />
        <form onSubmit={onSubmit} className="glass sheen mx-auto max-w-xl rounded-[28px] p-6 sm:p-8">
          <label className="label" htmlFor="cert">
            Certificate ID
          </label>
          <div className="flex gap-2">
            <input
              id="cert"
              value={id}
              onChange={(e) => setId(e.target.value.toUpperCase())}
              required
              placeholder="e.g. GITB-2026-000123"
              className="field font-mono"
            />
            <button className="btn-dark shrink-0">
              <Search size={16} /> Verify
            </button>
          </div>
          {state === "pending" && (
            <p className="mt-5 rounded-xl bg-lime/60 p-4 text-sm">
              Online lookup connects to the GITB records system in the next build phase. Until then, email{" "}
              <a className="font-semibold" href={`mailto:${contact.info}?subject=Certificate verification ${id}`}>
                {contact.info}
              </a>{" "}
              with the ID <span className="font-mono font-semibold">{id}</span> and we'll confirm it.
            </p>
          )}
        </form>
      </section>
    </>
  );
}

export function NotFound() {
  return (
    <section className="px-5 py-28 text-center sm:px-10">
      <Display as="h1" text="Page [not] found" className="text-5xl" />
      <p className="mt-4 text-sub">The page you're looking for has moved or doesn't exist.</p>
      <Link to="/" className="btn-dark mt-8">
        Back to home
      </Link>
    </section>
  );
}
