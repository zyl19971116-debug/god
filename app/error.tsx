"use client";

import Link from "next/link";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="font-display-caps text-[10px] tracking-divine text-gold-400">THE SILENCE OF THE GODS</p>
      <h1 className="mt-4 font-display-caps text-3xl text-ivory">SOMETHING WENT WRONG</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ivory-faint">
        The temple archives failed to respond. The gods remain — the connection does not.
      </p>
      <div className="mt-8 flex gap-3">
        <button
          onClick={reset}
          className="btn-gold rounded-sm px-7 py-3 text-[11px] uppercase tracking-[0.18em]"
        >
          TRY AGAIN
        </button>
        <Link href="/" className="btn-ghost rounded-sm px-7 py-3 text-[11px] uppercase tracking-[0.18em]">
          RETURN HOME
        </Link>
      </div>
    </div>
  );
}
