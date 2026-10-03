import type { Commandment } from "@/types";

interface Props {
  commandments: Commandment[];
  godName: string;
}

export function CommandmentTablet({ commandments, godName }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {commandments.map((c, i) => (
        <div
          key={c.index}
          className="panel manuscript relative overflow-hidden rounded-md p-6 transition-all duration-500 hover:border-gold-500/40 hover:shadow-gold"
        >
          <div className="absolute -right-3 -top-4 select-none font-serif text-[86px] leading-none text-gold-500/[0.06]">
            {c.numeral}
          </div>
          <div className="relative">
            <span className="font-display-caps text-[10px] tracking-divine text-gold-400">{c.numeral}</span>
            <p className="mt-3 font-display text-[15px] leading-relaxed text-ivory">{c.text}</p>
          </div>
          <div className="mt-5 h-px w-full bg-gradient-to-r from-gold-500/30 via-line to-transparent" />
          <p className="mt-3 text-[9px] uppercase tracking-[0.2em] text-ivory-faint/60">
            Carved by {godName}
          </p>
          <span className="sr-only">{i}</span>
        </div>
      ))}
    </div>
  );
}
