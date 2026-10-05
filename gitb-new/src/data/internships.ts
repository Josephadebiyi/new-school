import type { CourseArtKind } from "./site";

export interface InternshipTrack {
  slug: string;
  title: string;
  program: string; // related GITB program slug
  art: CourseArtKind;
  letters: string;
  summary: string;
  tasks: string[];
  skills: string[];
}

/** One internship track per GITB teaching area. Durations: 3–12 months. */
export const tracks: InternshipTrack[] = [
  {
    slug: "cybersecurity",
    title: "Cybersecurity Intern",
    program: "cybersecurity-acceleration",
    art: "cyber",
    letters: "SEC",
    summary: "Support security testing and risk work on real systems under the guidance of security mentors.",
    tasks: ["Vulnerability assessments", "Web & network security testing", "Documenting findings and fixes", "Compliance & risk checklists"],
    skills: ["Networking basics", "Linux", "Curiosity for how systems break"],
  },
  {
    slug: "data-ai",
    title: "Data & AI Intern",
    program: "data-science-ai",
    art: "data",
    letters: "AI",
    summary: "Turn raw data into insight: clean datasets, build analyses and help prototype machine-learning solutions.",
    tasks: ["Data cleaning & analysis in Python", "Dashboards and reporting", "Machine-learning experiments", "Presenting insights to the team"],
    skills: ["Python", "Spreadsheets / SQL", "Analytical thinking"],
  },
  {
    slug: "ui-ux",
    title: "UI/UX Design Intern",
    program: "ui-ux-design",
    art: "uiux",
    letters: "UX",
    summary: "Design interfaces people enjoy using — from research and wireframes to polished prototypes and Webflow builds.",
    tasks: ["User research & usability tests", "Wireframes and prototypes", "UI design in Figma", "Webflow page builds"],
    skills: ["Figma", "Design fundamentals", "A portfolio (even student work)"],
  },
  {
    slug: "web-development",
    title: "Web Development Intern",
    program: "full-stack-web-development",
    art: "web",
    letters: "</>",
    summary: "Ship features in real codebases across the front end and back end, with code reviews from professional developers.",
    tasks: ["Building UI components", "APIs and back-end features", "Bug fixing and testing", "Code reviews and Git workflow"],
    skills: ["HTML, CSS, JavaScript", "Git", "A framework is a plus"],
  },
  {
    slug: "project-management",
    title: "Project Management Intern",
    program: "project-management",
    art: "pm",
    letters: "PM",
    summary: "Keep projects moving: plan sprints, track delivery and coordinate people across teams.",
    tasks: ["Planning and scheduling", "Running stand-ups and retros", "Tracking scope, budget and risks", "Stakeholder updates"],
    skills: ["Organisation", "Clear communication", "Comfort with project tools"],
  },
  {
    slug: "kyc-compliance",
    title: "KYC & Compliance Intern",
    program: "kyc-compliance",
    art: "kyc",
    letters: "KYC",
    summary: "Work on customer due diligence and AML checks using real-world case studies and compliance frameworks.",
    tasks: ["KYC file reviews", "Customer due diligence", "Risk-based assessments", "Fraud and AML red-flag checks"],
    skills: ["Attention to detail", "Interest in finance & regulation", "Good written English"],
  },
];

export const durations = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export const internshipFaqs = [
  {
    q: "How long is an internship?",
    a: "Between 3 months minimum and 12 months maximum. You choose your preferred length when you apply and we confirm it with you before you start.",
  },
  {
    q: "Do I need to be a GITB student?",
    a: "No. GITB learners and graduates are welcome, and so are external applicants with the right foundation for the track.",
  },
  {
    q: "What do I need to apply?",
    a: "Your CV (PDF or Word, max 5 MB) is required. A cover letter and portfolio, GitHub or LinkedIn links are optional but strengthen your application.",
  },
  {
    q: "What happens after I apply?",
    a: "The GITB team reviews your application and contacts you by email about next steps, such as a short interview or task.",
  },
];
