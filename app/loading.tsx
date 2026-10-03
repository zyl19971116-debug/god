export default function Loading() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center">
      <svg width="56" height="56" viewBox="0 0 100 100" className="animate-spin-slow">
        <circle cx="50" cy="50" r="44" fill="none" stroke="#cfa64f" strokeWidth="1" opacity="0.35" />
        <path d="M50 6 L58 50 L50 94 L42 50 Z" fill="#cfa64f" opacity="0.8" />
        <circle cx="50" cy="50" r="4" fill="#fbf6e6" />
      </svg>
      <p className="mt-6 font-sans text-[10px] uppercase tracking-[0.3em] text-ivory-faint">
        OPENING THE TEMPLE
      </p>
    </div>
  );
}
