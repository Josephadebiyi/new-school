# Demo accounts (local preview only)

Test logins for exploring the site. They live only in your browser's local storage —
they are not real accounts and must be removed or replaced with real authentication before launch.
The values come from `src/lib/demo.ts`.

| Role | Where to log in | Email | Password |
|---|---|---|---|
| Student (applicant) | http://localhost:5173/apply/register → "Log in" tab | student.demo@gitb.test | DemoStudent#2026 |
| Admin (back office) | http://localhost:5173/admin/login | admin.demo@gitb.test | DemoAdmin#2026 |

Both login screens also have a **"Preview as …"** button that fills these in for you.

- The demo student starts with a half-finished application (Data Science & AI + Spanish).
- The admin dashboard starts with 6 SAMPLE applications. Anything you submit as a student, or
  through the Internships form, appears there too.
- Admin → "Reset demo data" restores the starting state.
