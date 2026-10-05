# GITB website (React rebuild)

Rebuild of gitb.lt using the "SYNC" online-school template style (glass panel in a 3D scene,
wide techno display type, lime cards, sparkles) in GITB's own colours.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

Stack: Vite + React 19 + TypeScript + React Router + Tailwind v4 + Motion. Fonts are self-hosted
(Audiowide display, Noto Sans body).

## Pages

| Route | Page |
|---|---|
| `/` | Landing: hero, stats, programs carousel, why GITB, learning portal, accreditation, learner stories, FAQ, contact |
| `/courses`, `/courses/:slug` | Program catalogue with filters + a detail page per program |
| `/why-gitb`, `/testimonials`, `/faq`, `/contact`, `/verify-certificate` | Section pages |
| `/internships` | Internship tracks (one per program), 3–12 month length slider, full application form with CV upload |
| `/login` | Student log in (learning portal) |
| `/apply` | Admissions home (DreamApply layout, modelled on apply.ku.lt): "Start your journey" search, featured programmes by type, how to apply, fees |
| `/apply/courses` | "Find programmes": search, category/type filters, result count, copy-and-share link, result cards with **Apply now!** |
| `/apply/courses/:slug` | Programme page: details table (location, type, duration, language, awards, tuition, application fee, entry, documents) + sticky Apply now! |
| `/admin/login`, `/admin` | Admissions back office: overview KPIs, all applications (search + status filter), detail drawer (status, fee paid, notes, email), internship applications |
| `/apply/register`, `/apply/portal` | Sign in / register, then the application (Programs incl. Standard/Intensive choice for languages → … → Fees → Checklist & submit) |

URLs match the old site, so existing links keep working.

## Demo logins

See **DEMO_ACCOUNTS.md** (student + admin test accounts, local preview only).

## Fees & language courses

- Spanish, French, Lithuanian: **Standard €120/month (2 classes/week)**, **Intensive €220/month (3 classes/week)**.
- **Application / administrative fee: €25**, one-time, shown across the portal and in the Fees step.
- Change prices in one place: `src/data/site.ts` (`languagePlans`, `APPLICATION_FEE`).

## Not connected yet (next phase)

- **Log in** and **apply portal** are front-end only. Applications are saved in the visitor's browser
  (localStorage) and passwords are never stored. Needs an admissions backend / DreamApply API
  before going live.
- **Internship applications** post as multipart form data (all fields + `cv` + optional `coverLetter`)
  to `VITE_INTERNSHIP_ENDPOINT`. Create `.env` with `VITE_INTERNSHIP_ENDPOINT=https://…` pointing at your
  API or a form service (Formspree, Basin, Getform). Without it the form runs in demo mode and sends nothing.
- **Contact form** opens the visitor's email app addressed to admissions@gitb.lt.
- **Certificate verification** explains how to verify by email until it's linked to records.
- Student dashboard: later phase.

## Content fixes vs. the old site

- Removed leftover designer notes shown as headings ("Why this direction works", "A stronger proof
  section builds trust fast", "Scholarship-style CTA", "This section helps…").
- Removed the "2+ learners reached" stat.
- Program names now match their artwork; durations formatted the same everywhere.
- KYC & Compliance: the old card said 2 months but the description said 6 weeks → now 2 months everywhere.
- Removed the EU flag beside the ACTD badge (ACTD is a US body).
- Replaced the text-heavy flyer images with designed program artwork; photos use one green duotone.

## Please confirm before launch

- KYC duration (2 months vs 6 weeks).
- Certificates listed per program (taken from the old flyers): CompTIA PenTest+, Google UX Design
  Certificate, Certified KYC Analyst (CKYCA). Confirm GITB may state these.
- UI/UX "Cohort 2 — Summer 2026" was dropped as out of date; add the next intake dates.
- Learner photos (with consent) for the testimonials, and the real number of learners if you want it shown.
- Privacy Policy page content.
- Tuition for the professional programs (currently "On request"), language-course levels/certificate,
  and how the €25 fee is paid (bank transfer details or card payment).
- Internships: confirm format (remote?), whether they're paid, who reviews applications, and which
  inbox should receive them.
