import { useCallback, useEffect, useState } from "react";

/**
 * Front-end application draft store for the apply portal. There's no
 * account/login gate in front of the wizard (admissions is anonymous, like
 * the rest of GITB's process) — this just autosaves the in-progress
 * application to this browser so a refresh doesn't lose it. The one real
 * submission is the final POST to the backend in the Submit step.
 */
export interface EducationEntry {
  level: string;
  institution: string;
  country: string;
  field: string;
  from: string;
  to: string;
}

export interface LanguageEntry {
  language: string;
  level: string;
}

export interface Application {
  programs: string[]; // ordered by priority
  profile: {
    firstName: string;
    lastName: string;
    dob: string;
    gender: string;
    citizenship: string;
    residence: string;
  };
  contacts: { email: string; phone: string; address: string; city: string; postcode: string; country: string };
  education: EducationEntry[];
  languages: LanguageEntry[];
  documents: { id: string; name: string; type: string; size: number; url: string }[];
  motivation: { why: string; goals: string; source: string };
  languageFormats: Record<string, "standard" | "intensive">;
  feeAcknowledged: boolean;
  declaration: boolean;
  couponCode: string;
  referralCode: string;
  submittedAt?: string;
  reference?: string;
}

export interface PortalState {
  app: Application;
}

const KEY = "gitb-apply-v1";

export const emptyApp = (): Application => ({
  programs: [],
  profile: { firstName: "", lastName: "", dob: "", gender: "", citizenship: "", residence: "" },
  contacts: { email: "", phone: "", address: "", city: "", postcode: "", country: "" },
  education: [],
  languages: [{ language: "English", level: "" }],
  documents: [],
  motivation: { why: "", goals: "", source: "" },
  languageFormats: {},
  feeAcknowledged: false,
  declaration: false,
  couponCode: "",
  referralCode: "",
});

function load(): PortalState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw) as PortalState;
      return { ...saved, app: { ...emptyApp(), ...saved.app } };
    }
  } catch {
    /* storage unavailable — start fresh */
  }
  return { app: emptyApp() };
}

export function usePortal() {
  const [state, setState] = useState<PortalState>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const update = useCallback((fn: (s: PortalState) => PortalState) => setState((s) => fn(structuredClone(s))), []);
  const reset = useCallback(() => setState({ app: emptyApp() }), []);
  return { state, update, reset };
}

/* ---------- section completion (drives the sidebar ticks + checklist) ---------- */
export type SectionId =
  | "programs"
  | "profile"
  | "contacts"
  | "education"
  | "languages"
  | "documents"
  | "motivation"
  | "fees"
  | "submit";

export const sections: { id: SectionId; label: string; hint: string }[] = [
  { id: "programs", label: "Programs", hint: "Choose up to 3 programs in order of preference" },
  { id: "profile", label: "Profile", hint: "Personal details as they appear on your ID" },
  { id: "contacts", label: "Contact details", hint: "How admissions can reach you" },
  { id: "education", label: "Education", hint: "Your previous studies" },
  { id: "languages", label: "Languages", hint: "Programs are taught in English" },
  { id: "documents", label: "Documents", hint: "ID and any certificates" },
  { id: "motivation", label: "Motivation", hint: "Tell us why you're applying" },
  { id: "fees", label: "Fees", hint: "Application fee and tuition" },
  { id: "submit", label: "Checklist & submit", hint: "Review and send your application" },
];

export function isComplete(app: Application, id: SectionId): boolean {
  const p = app.profile;
  const c = app.contacts;
  switch (id) {
    case "programs":
      return app.programs.length > 0;
    case "profile":
      return !!(p.firstName && p.lastName && p.dob && p.citizenship && p.residence);
    case "contacts":
      return !!(c.email && c.phone && c.city && c.country);
    case "education":
      return app.education.some((e) => e.level && e.institution);
    case "languages":
      return app.languages.some((l) => l.language && l.level);
    case "documents":
      return app.documents.some((d) => d.type === "Passport / ID card");
    case "motivation":
      return app.motivation.why.trim().length >= 80;
    case "fees":
      return app.feeAcknowledged;
    case "submit":
      return !!app.submittedAt;
  }
}

export function referenceFor(email: string): string {
  let h = 0;
  for (const ch of email) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return `GITB-${new Date().getFullYear()}-${String(h % 1000000).padStart(6, "0")}`;
}
