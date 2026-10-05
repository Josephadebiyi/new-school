import type { CourseArtKind } from "../data/site";
import { Sparkle } from "./Sparkle";

/**
 * Designed artwork for each program (replaces the old text-heavy flyer images).
 * Lime block + giant watermark letters + a glossy dark-green object + sparkles,
 * following the template's course-card treatment.
 */
export function CourseArt({
  kind,
  letters,
  className = "",
  tall = false,
}: {
  kind: CourseArtKind;
  letters: string;
  className?: string;
  tall?: boolean;
}) {
  return (
    <div
      className={`relative isolate overflow-hidden rounded-[22px] bg-gradient-to-br from-[#e6fb8c] via-lime to-lime-2 ${
        tall ? "aspect-[4/3]" : "aspect-[16/10]"
      } ${className}`}
    >
      <span className="watermark absolute -bottom-3 -left-2 text-[clamp(90px,14vw,190px)] tracking-tighter">
        {letters}
      </span>
      <div className="orb-soft absolute -right-6 -top-8 h-28 w-28 opacity-70" />
      <div className="absolute left-[8%] top-[14%] h-16 w-16 rounded-full bg-white/35 blur-[1px]" />
      <Sparkle className="absolute left-[12%] top-[18%] h-7 w-7 text-ink" />
      <Sparkle className="absolute bottom-[16%] right-[10%] h-5 w-5 text-ink" />
      <Sparkle className="absolute right-[26%] top-[12%] h-3.5 w-3.5 text-orange" />
      <svg viewBox="0 0 320 200" className="absolute inset-0 m-auto h-[82%] w-[82%] drop-shadow-[0_18px_22px_rgba(6,41,31,0.35)]">
        <defs>
          <linearGradient id={`g-${kind}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1a7a57" />
            <stop offset="0.55" stopColor="#0c4e3a" />
            <stop offset="1" stopColor="#06291f" />
          </linearGradient>
          <linearGradient id={`h-${kind}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <Art kind={kind} />
      </svg>
    </div>
  );
}

function Art({ kind }: { kind: CourseArtKind }) {
  const body = `url(#g-${kind})`;
  const hi = `url(#h-${kind})`;
  switch (kind) {
    case "cyber":
      return (
        <g>
          <path d="M160 22 L222 46 V104 C222 146 194 170 160 182 C126 170 98 146 98 104 V46 Z" fill={body} />
          <path d="M160 22 L222 46 V70 C190 60 130 60 98 70 V46 Z" fill={hi} />
          <rect x="136" y="96" width="48" height="40" rx="9" fill="#d4f542" />
          <path d="M146 96 V84 a14 14 0 0 1 28 0 V96" stroke="#d4f542" strokeWidth="8" fill="none" strokeLinecap="round" />
          <circle cx="160" cy="112" r="6" fill="#0b3b2c" />
          <rect x="157" y="114" width="6" height="12" rx="3" fill="#0b3b2c" />
          <g stroke="#0b3b2c" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.8">
            <path d="M60 70 H90 M60 70 V50" />
            <path d="M260 120 H232 M260 120 V146" />
            <path d="M64 140 H96" />
          </g>
          <circle cx="60" cy="48" r="6" fill="#0b3b2c" />
          <circle cx="260" cy="148" r="6" fill="#0b3b2c" />
          <circle cx="60" cy="140" r="5" fill="#ffffff" />
        </g>
      );
    case "data":
      return (
        <g>
          <rect x="70" y="40" width="180" height="128" rx="18" fill={body} />
          <rect x="70" y="40" width="180" height="40" rx="18" fill={hi} />
          {[
            [94, 120, 34],
            [124, 100, 54],
            [154, 84, 70],
            [184, 108, 46],
            [214, 70, 84],
          ].map(([x, y, h]) => (
            <rect key={x} x={x} y={y} width="18" height={h} rx="5" fill="#d4f542" />
          ))}
          <path d="M100 108 L133 90 L163 72 L193 96 L223 58" stroke="#ffffff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {[
            [100, 108],
            [133, 90],
            [163, 72],
            [193, 96],
            [223, 58],
          ].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r="5.5" fill="#ffffff" stroke="#0b3b2c" strokeWidth="2" />
          ))}
          <g fill="#0b3b2c">
            <circle cx="268" cy="44" r="9" />
            <circle cx="290" cy="74" r="7" />
            <circle cx="262" cy="96" r="6" />
          </g>
          <path d="M268 44 L290 74 L262 96 M268 44 L262 96" stroke="#0b3b2c" strokeWidth="3" />
        </g>
      );
    case "uiux":
      return (
        <g>
          <rect x="112" y="16" width="96" height="172" rx="20" fill={body} />
          <rect x="112" y="16" width="96" height="60" rx="20" fill={hi} />
          <rect x="124" y="34" width="72" height="44" rx="8" fill="#d4f542" />
          <path d="M132 70 l14-16 10 10 8-8 16 14" stroke="#0b3b2c" strokeWidth="4" fill="none" strokeLinejoin="round" />
          <rect x="124" y="88" width="72" height="9" rx="4.5" fill="#ffffff" />
          <rect x="124" y="104" width="50" height="9" rx="4.5" fill="#ffffff" opacity="0.6" />
          <rect x="124" y="124" width="34" height="34" rx="8" fill="#ffffff" opacity="0.85" />
          <rect x="162" y="124" width="34" height="34" rx="8" fill="#d4f542" opacity="0.9" />
          <path d="M226 128 l50 -50 a10 10 0 0 1 14 14 l-50 50 -20 6 z" fill="#0b3b2c" />
          <path d="M226 128 l-6 20 20 -6" fill="#d4f542" />
          <rect x="44" y="60" width="52" height="34" rx="10" fill="#ffffff" />
          <text x="70" y="83" textAnchor="middle" fontFamily="Audiowide" fontSize="16" fill="#0b3b2c">UI</text>
          <rect x="236" y="30" width="52" height="34" rx="10" fill="#0b3b2c" />
          <text x="262" y="53" textAnchor="middle" fontFamily="Audiowide" fontSize="16" fill="#d4f542">UX</text>
        </g>
      );
    case "web":
      return (
        <g>
          <rect x="58" y="30" width="204" height="140" rx="18" fill={body} />
          <rect x="58" y="30" width="204" height="34" rx="18" fill={hi} />
          <circle cx="80" cy="47" r="5" fill="#ff7f00" />
          <circle cx="96" cy="47" r="5" fill="#d4f542" />
          <circle cx="112" cy="47" r="5" fill="#ffffff" />
          <text x="160" y="128" textAnchor="middle" fontFamily="Audiowide" fontSize="54" fill="#d4f542">
            {"</>"}
          </text>
          <rect x="86" y="142" width="80" height="8" rx="4" fill="#ffffff" opacity="0.7" />
          <rect x="174" y="142" width="58" height="8" rx="4" fill="#d4f542" opacity="0.8" />
          <rect x="230" y="120" width="70" height="56" rx="12" fill="#0b3b2c" />
          <path d="M246 140 h38 M246 152 h26 M246 164 h32" stroke="#d4f542" strokeWidth="5" strokeLinecap="round" />
        </g>
      );
    case "pm":
      return (
        <g>
          <rect x="56" y="32" width="208" height="136" rx="18" fill={body} />
          <rect x="56" y="32" width="208" height="36" rx="18" fill={hi} />
          {[0, 1, 2].map((c) => (
            <g key={c}>
              <rect x={72 + c * 64} y="48" width="54" height="8" rx="4" fill="#ffffff" opacity="0.7" />
              {[0, 1, 2].slice(0, 3 - (c === 2 ? 1 : 0)).map((r) => (
                <rect
                  key={r}
                  x={72 + c * 64}
                  y={66 + r * 30}
                  width="54"
                  height="24"
                  rx="6"
                  fill={c === 2 ? "#d4f542" : r === 0 ? "#d4f542" : "#ffffff"}
                  opacity={c === 1 && r === 2 ? 0.5 : 1}
                />
              ))}
            </g>
          ))}
          <circle cx="250" cy="160" r="26" fill="#0b3b2c" />
          <path d="M238 160 l9 9 17 -18" stroke="#d4f542" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M40 150 a40 40 0 0 1 40 -40" stroke="#0b3b2c" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray="2 10" />
        </g>
      );
    case "es":
    case "fr":
    case "lt": {
      const words = { es: ["¡Hola!", "Gracias"], fr: ["Bonjour!", "Merci"], lt: ["Labas!", "Ačiū"] }[kind];
      return (
        <g>
          <path d="M70 40 h150 a20 20 0 0 1 20 20 v62 a20 20 0 0 1 -20 20 h-96 l-30 26 v-26 h-24 a20 20 0 0 1 -20 -20 v-62 a20 20 0 0 1 20 -20 z" fill={body} />
          <path d="M70 40 h150 a20 20 0 0 1 20 20 v14 c-60 -12 -130 -12 -190 0 v-14 a20 20 0 0 1 20 -20 z" fill={hi} />
          <text x="145" y="104" textAnchor="middle" fontFamily="Audiowide" fontSize="30" fill="#d4f542">
            {words[0]}
          </text>
          <path d="M206 104 h70 a16 16 0 0 1 16 16 v34 a16 16 0 0 1 -16 16 h-10 v20 l-22 -20 h-38 a16 16 0 0 1 -16 -16 v-34 a16 16 0 0 1 16 -16 z" fill="#ffffff" />
          <text x="241" y="144" textAnchor="middle" fontFamily="Audiowide" fontSize="17" fill="#0b3b2c">
            {words[1]}
          </text>
          <circle cx="58" cy="168" r="8" fill="#0b3b2c" />
          <circle cx="82" cy="182" r="5" fill="#ff7f00" />
        </g>
      );
    }
    case "kyc":
      return (
        <g>
          <rect x="60" y="44" width="190" height="120" rx="18" fill={body} />
          <rect x="60" y="44" width="190" height="40" rx="18" fill={hi} />
          <rect x="78" y="66" width="62" height="76" rx="12" fill="#d4f542" />
          <circle cx="109" cy="94" r="14" fill="#0b3b2c" />
          <path d="M86 136 a23 20 0 0 1 46 0" fill="#0b3b2c" />
          <rect x="154" y="72" width="78" height="9" rx="4.5" fill="#ffffff" />
          <rect x="154" y="90" width="58" height="9" rx="4.5" fill="#ffffff" opacity="0.6" />
          <rect x="154" y="108" width="68" height="9" rx="4.5" fill="#ffffff" opacity="0.6" />
          <circle cx="248" cy="138" r="30" fill="none" stroke="#0b3b2c" strokeWidth="9" />
          <circle cx="248" cy="138" r="24" fill="#ffffff" opacity="0.35" />
          <path d="M270 160 l24 24" stroke="#0b3b2c" strokeWidth="12" strokeLinecap="round" />
          <path d="M236 138 l8 8 15 -16" stroke="#0b3b2c" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
  }
}
