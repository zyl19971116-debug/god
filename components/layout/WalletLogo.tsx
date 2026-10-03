const LOGOS: Record<string, string> = {
  metamask: "/wallets/metamask.svg",
  rabby: "/wallets/rabby.png",
  coinbase: "/wallets/coinbase.ico",
  trust: "/wallets/trust.svg",
  okx: "/wallets/okx.png",
  phantom: "/wallets/phantom.svg",
  brave: "/wallets/brave.png",
};

export function WalletLogo({ id, name }: { id: string; name?: string }) {
  const src = LOGOS[id];

  if (!src) {
    return (
      <span
        aria-hidden="true"
        className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-400 text-[11px] font-bold text-void"
      >
        {(name ?? "W").slice(0, 1).toUpperCase()}
      </span>
    );
  }

  return (
    // These local files come directly from each wallet's official website assets.
    // A plain img preserves SVG, PNG and ICO sources without optimization artifacts.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={`${name ?? id} logo`} className="h-7 w-7 object-contain" />
  );
}
