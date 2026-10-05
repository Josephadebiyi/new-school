import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";

/** Fade/slide-up on first scroll into view. */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Two-tone display heading like the template ("UNLOCK [YOUR] POTENTIAL").
 * Wrap dimmed words in [brackets]: "Future-ready [skills] for the [digital] world".
 */
export function Display({
  text,
  as: Tag = "h2",
  className = "",
}: {
  text: string;
  as?: "h1" | "h2" | "h3";
  className?: string;
}) {
  const parts = text.split(/(\[[^\]]+\])/g).filter(Boolean);
  return (
    <Tag className={`display ${className}`}>
      {parts.map((p, i) =>
        p.startsWith("[") ? (
          <span key={i} className="dim">
            {p.slice(1, -1)}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </Tag>
  );
}

export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] ${
        light ? "glass-dark text-lime" : "glass text-forest"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-orange" />
      {children}
    </span>
  );
}

export function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="space-y-3">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={it.q} className={`glass sheen rounded-2xl transition ${isOpen ? "ring-2 ring-lime/70" : ""}`}>
            <button
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold sm:px-6"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              {it.q}
              <ChevronDown size={18} className={`shrink-0 transition ${isOpen ? "rotate-180" : ""}`} />
            </button>
            <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden">
                <p className="px-5 pb-5 leading-relaxed text-sub sm:px-6">{it.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function PageHero({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <section className="relative px-5 pb-6 pt-14 text-center sm:px-10 sm:pt-20">
      <Reveal>
        <Eyebrow>{eyebrow}</Eyebrow>
        <Display as="h1" text={title} className="mx-auto mt-6 max-w-5xl text-4xl sm:text-6xl" />
        {intro && <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-sub">{intro}</p>}
      </Reveal>
    </section>
  );
}
