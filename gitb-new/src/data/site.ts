// All copy is sourced from gitb.lt (Oct 2026). Inconsistencies on the old site were
// resolved here — see README.md → "Content fixes" for what changed and what to verify.

export type CourseArtKind = "cyber" | "kyc" | "uiux" | "data" | "pm" | "web" | "es" | "fr" | "lt";

/** One-time administrative / application fee charged on every application. */
export const APPLICATION_FEE = 25;

export interface PricePlan {
  id: "standard" | "intensive";
  name: string;
  perMonth: number;
  classesPerWeek: number;
}

/** Language course pricing (per month). */
export const languagePlans: PricePlan[] = [
  { id: "standard", name: "Standard", perMonth: 120, classesPerWeek: 2 },
  { id: "intensive", name: "Intensive", perMonth: 220, classesPerWeek: 3 },
];

export interface Course {
  slug: string;
  title: string;
  short: string; // one-line card title
  category: string;
  duration: string;
  months: number;
  letters: string; // watermark on the art block
  art: CourseArtKind;
  summary: string;
  modules: string[];
  certificates: string[];
  badge?: string;
  type: "program" | "language";
}

export const courses: Course[] = [
  {
    slug: "cybersecurity-acceleration",
    title: "Cybersecurity Acceleration Program",
    short: "Cybersecurity",
    category: "Technology",
    duration: "4 months",
    months: 4,
    letters: "SEC",
    art: "cyber",
    summary:
      "Fast-track your path into cybersecurity with hands-on labs, real-world simulations and industry mentors.",
    modules: [
      "Ethical hacking & penetration testing",
      "Security vulnerability assessment",
      "Web & network security testing",
      "Compliance & risk management",
    ],
    certificates: ["GITB Diploma", "CompTIA PenTest+"],
    type: "program",
  },
  {
    slug: "data-science-ai",
    title: "Data Science & AI",
    short: "Data Science & AI",
    category: "Technology & Data",
    duration: "6 months",
    months: 6,
    letters: "AI",
    art: "data",
    summary:
      "Master Python, machine learning and AI to turn raw data into business insight — guided by data scientists and AI engineers from world-class companies.",
    modules: ["Python for data", "Machine learning", "Applied AI", "Turning data into business insight"],
    certificates: ["GITB Diploma"],
    type: "program",
  },
  {
    slug: "ui-ux-design",
    title: "UI/UX & Webflow Design Bootcamp",
    short: "UI/UX Design",
    category: "Design & Technology",
    duration: "3 months",
    months: 3,
    letters: "UX",
    art: "uiux",
    summary:
      "Go from wireframes to polished, hire-worthy prototypes — taught fully online by working designers from top global companies.",
    modules: [
      "UI/UX design principles",
      "Wireframing & prototyping",
      "Webflow website development",
      "User research & usability testing",
    ],
    certificates: ["GITB Diploma", "Google UX Design Certificate"],
    type: "program",
  },
  {
    slug: "full-stack-web-development",
    title: "Full Stack Web Development",
    short: "Web Development",
    category: "Technology",
    duration: "3 months",
    months: 3,
    letters: "</>",
    art: "web",
    summary:
      "Build modern, fully functional web applications from front to back with hands-on projects, real codebases and mentorship from professional developers.",
    modules: ["Front-end development", "Back-end development", "Working in real codebases", "Shipping full applications"],
    certificates: ["GITB Diploma"],
    type: "program",
  },
  {
    slug: "project-management",
    title: "Project Management",
    short: "Project Management",
    category: "Business & Management",
    duration: "4 months",
    months: 4,
    letters: "PM",
    art: "pm",
    summary:
      "Learn the industry-standard methodologies, tools and leadership skills that deliver projects on time, on budget and on scope.",
    modules: ["Industry-standard methodologies", "Project tools", "Leadership skills", "Delivering on time, budget and scope"],
    certificates: ["GITB Diploma"],
    type: "program",
  },
  {
    slug: "kyc-compliance",
    title: "KYC & Compliance Sprint",
    short: "KYC & Compliance",
    category: "Finance & Law",
    duration: "2 months",
    months: 2,
    letters: "KYC",
    art: "kyc",
    summary:
      "Get job-ready in KYC and financial compliance through real-world case studies, regulatory frameworks and mentorship from compliance professionals.",
    modules: [
      "Know Your Customer (KYC)",
      "KYC & AML regulations",
      "Customer due diligence",
      "Risk-based assessment",
      "Fraud detection & prevention",
    ],
    certificates: ["GITB Diploma", "Certified KYC Analyst (CKYCA)"],
    type: "program",
  },
  {
    slug: "spanish",
    title: "Spanish Language Course",
    short: "Spanish",
    category: "Languages",
    duration: "Monthly",
    months: 0,
    letters: "ES",
    art: "es",
    summary:
      "Learn Spanish in live online classes. Choose Standard (2 classes a week) or Intensive (3 classes a week) and enrol month by month.",
    modules: ["Speaking & listening", "Grammar & vocabulary", "Reading & writing", "Everyday and professional situations"],
    certificates: ["GITB course certificate"],
    type: "language",
  },
  {
    slug: "french",
    title: "French Language Course",
    short: "French",
    category: "Languages",
    duration: "Monthly",
    months: 0,
    letters: "FR",
    art: "fr",
    summary:
      "Learn French in live online classes. Choose Standard (2 classes a week) or Intensive (3 classes a week) and enrol month by month.",
    modules: ["Speaking & listening", "Grammar & vocabulary", "Reading & writing", "Everyday and professional situations"],
    certificates: ["GITB course certificate"],
    type: "language",
  },
  {
    slug: "lithuanian",
    title: "Lithuanian Language Course",
    short: "Lithuanian",
    category: "Languages",
    duration: "Monthly",
    months: 0,
    letters: "LT",
    art: "lt",
    summary:
      "Learn Lithuanian in live online classes — ideal if you live, study or work in Lithuania. Choose Standard (2 classes a week) or Intensive (3 classes a week).",
    modules: ["Speaking & listening", "Grammar & vocabulary", "Reading & writing", "Everyday life in Lithuania"],
    certificates: ["GITB course certificate"],
    type: "language",
  },
];

export const programs = courses.filter((c) => c.type === "program");
export const languageCourses = courses.filter((c) => c.type === "language");

/** Tuition line shown in catalogues and course pages. */
export function tuitionLabel(c: Course): string {
  return c.type === "language" ? `from €${languagePlans[0].perMonth} / month` : "On request — ask admissions";
}

export const categories = Array.from(new Set(courses.map((c) => c.category)));

export const stats = [
  { value: "9+", label: "Programs" },
  { value: "27+", label: "Countries served" },
  { value: "100%", label: "Online" },
  { value: "ACTD", label: "Accredited" },
];

export const pillars = [
  {
    title: "Practical learning",
    body: "Every program is built around applicable skills, guided exercises and projects you can actually talk about in interviews.",
    icon: "target",
  },
  {
    title: "Flexible structure",
    body: "Study around work, school or family with live support, recorded sessions and a pace designed for real life.",
    icon: "clock",
  },
  {
    title: "Career direction",
    body: "We don't stop at teaching. We help you position yourself for internships, freelance work and entry-level roles — with career coaching and interview support.",
    icon: "briefcase",
  },
  {
    title: "Supportive community",
    body: "Learn alongside tutors, mentors and classmates who keep you accountable and make the journey less overwhelming.",
    icon: "users",
  },
] as const;

export const testimonials = [
  {
    name: "Amaka",
    role: "Data Analytics student",
    quote:
      "The biggest difference for me was clarity. I finally understood how to move from learning theory to building work I could confidently present.",
  },
  {
    name: "David",
    role: "Frontend Development student",
    quote:
      "I joined as a complete beginner and the step-by-step teaching made web development feel achievable instead of intimidating.",
  },
  {
    name: "Favour",
    role: "Virtual Assistant student",
    quote:
      "The live sessions, recordings and tutor support helped me stay consistent even while working full time.",
  },
];

export const faqs = [
  {
    q: "Do I need a tech background?",
    a: "No. Our beginner tracks are designed for learners starting from scratch, with clear explanations and guided support.",
  },
  {
    q: "Can I learn while working?",
    a: "Yes. Programs are fully online with flexible formats, recorded sessions and structured guidance for busy professionals.",
  },
  {
    q: "Will I build real projects?",
    a: "Yes. Programs are built around practical assignments, guided exercises and portfolio-ready work that demonstrates real capability.",
  },
  {
    q: "Is there support outside of classes?",
    a: "Yes. Mentorship, accountability, community support and career guidance are a core part of every program.",
  },
  {
    q: "Are GITB certificates accredited?",
    a: "Yes. GITB is accredited by the American Council of Training and Development (ACTD). Every certificate is internationally recognised and can be verified online through our certificate verification page.",
  },
];

export const contact = {
  admissions: "admissions@gitb.lt",
  info: "info@gitb.lt",
  city: "Vilnius, Lithuania",
  hours: "Mon – Fri, 9:00 – 18:00 CET",
  linkedin: "https://www.linkedin.com/company/global-institute-of-tech-and-business/",
};

export const nav = [
  { to: "/courses", label: "Programs" },
  { to: "/why-gitb", label: "Why GITB" },
  { to: "/internships", label: "Internships" },
  { to: "/testimonials", label: "Alumni" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
];
