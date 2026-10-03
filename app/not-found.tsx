import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="font-display-caps text-[10px] tracking-divine text-gold-400">UNRECORDED</p>
      <h1 className="mt-4 font-display-caps text-4xl text-ivory">404</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ivory-faint">
        This temple does not exist in any known pantheon. Perhaps it was never created — or the god
        who lived here chose to be forgotten.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="btn-gold rounded-sm px-7 py-3 text-[11px] uppercase tracking-[0.18em]">
          RETURN HOME
        </Link>
        <Link href="/explore" className="btn-ghost rounded-sm px-7 py-3 text-[11px] uppercase tracking-[0.18em]">
          EXPLORE GODS
        </Link>
      </div>
    </div>
  );
}
