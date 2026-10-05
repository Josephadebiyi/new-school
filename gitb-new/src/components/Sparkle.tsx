/** Four-point star used as nav separator and decorative accent (from the template). */
export function Sparkle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 0c.7 6.6 2.9 10.4 12 12-9.1 1.6-11.3 5.4-12 12-.7-6.6-2.9-10.4-12-12 9.1-1.6 11.3-5.4 12-12Z" />
    </svg>
  );
}

/** Tall, thin star used floating in sections. */
export function Star({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 48" className={className} fill="currentColor" aria-hidden>
      <path d="M10 0c.6 15 2.2 21.6 10 24-7.8 2.4-9.4 9-10 24-.6-15-2.2-21.6-10-24C7.8 21.6 9.4 15 10 0Z" />
    </svg>
  );
}
