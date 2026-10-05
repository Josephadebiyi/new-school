/** Fixed 3D-style environment: green sky, glossy orbs, frosted glass slabs, reflective floor. */
export function Scene() {
  return (
    <div aria-hidden className="scene fixed inset-0 -z-10 overflow-hidden">
      <div className="orb float-slow absolute left-1/2 top-[-18vh] h-[58vh] w-[58vh] -translate-x-1/2 opacity-90" />
      <div className="orb-soft drift absolute left-[4vw] top-[52vh] h-[22vh] w-[22vh] opacity-80" />
      <div className="orb float-mid absolute right-[5vw] top-[62vh] h-[14vh] w-[14vh] opacity-70" />
      <div className="glass-shape drift absolute left-[-6vw] top-[14vh] h-[46vh] w-[22vw] rotate-[-14deg] rounded-[48px]" />
      <div className="glass-shape float-slow absolute right-[-4vw] top-[24vh] h-[38vh] w-[18vw] rotate-[12deg] rounded-[48px]" />
      <div className="floor absolute inset-x-0 bottom-0 h-[34vh]" />
    </div>
  );
}

export function Logo({ light = false, className = "" }: { light?: boolean; className?: string }) {
  return (
    <img
      src={light ? "/img/logo-white.png" : "/img/logo.png"}
      alt="GITB — Global Institute of Technology and Business"
      className={`h-9 w-auto sm:h-10 ${className}`}
    />
  );
}
