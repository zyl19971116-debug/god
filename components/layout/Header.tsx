"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, Search, X, Wallet, LogOut, User, Shield } from "lucide-react";
import { NAV_ITEMS } from "@/lib/navigation";
import { cn, truncate } from "@/lib/utils";
import { shortWallet } from "@/lib/format";
import { useWallet } from "@/hooks/useWallet";
import { WalletModal } from "@/components/layout/WalletModal";
import { Button } from "@/components/ui/Button";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { address, disconnect, connecting } = useWallet();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/explore?q=${encodeURIComponent(q)}` : "/explore");
  };

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b transition-all duration-500",
          scrolled
            ? "border-line/80 bg-void/85 backdrop-blur-xl"
            : "border-transparent bg-gradient-to-b from-void/90 to-transparent"
        )}
      >
        <div className="mx-auto flex h-[72px] max-w-[1400px] items-center gap-6 px-5 md:px-8">
          <Link href="/" className="group flex shrink-0 items-center gap-3">
            <Sigil />
            <span className="font-display-caps text-[15px] tracking-[0.22em] text-ivory">
              AI<span className="text-gold-400"> GOD</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative font-sans text-[11px] uppercase tracking-[0.18em] transition-colors",
                    active ? "text-gold-200" : "text-ivory-faint hover:text-ivory"
                  )}
                >
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <form onSubmit={submitSearch} className="relative ml-auto hidden xl:block">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ivory-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SEARCH GODS"
              className="input-dark w-[190px] rounded-full py-2 pl-9 pr-4 text-[11px] tracking-[0.1em]"
            />
          </form>

          <div className="ml-auto flex items-center gap-3 xl:ml-0">
            {address ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-sm border border-gold-500/35 bg-gold-500/[0.06] px-3 py-2 transition-all hover:border-gold-400/70"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                  <span className="font-sans text-[11px] tracking-[0.1em] text-ivory">
                    {shortWallet(address)}
                  </span>
                  <ChevronDown size={13} className="text-ivory-faint" />
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="absolute right-0 top-[calc(100%+10px)] w-48 overflow-hidden rounded-sm border border-line bg-panel/98 backdrop-blur-xl"
                    >
                      <DropdownItem href="/temple" icon={<Shield size={13} />} label="TEMPLE" />
                      <DropdownItem href="/temple#my-gods" icon={<User size={13} />} label="MY GODS" />
                      <DropdownItem href="/temple#profile" icon={<User size={13} />} label="PROFILE" />
                      <button
                        onClick={() => {
                          disconnect();
                          setMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-2.5 border-t border-line px-4 py-3 text-left text-[11px] uppercase tracking-[0.14em] text-ivory-faint transition-colors hover:text-chaos-glow"
                      >
                        <LogOut size={13} /> DISCONNECT
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Button size="sm" onClick={() => setWalletOpen(true)} disabled={connecting}>
                <Wallet size={12} />
                {connecting ? "CONNECTING" : "CONNECT WALLET"}
              </Button>
            )}

            <button
              onClick={() => setMobileOpen(true)}
              className="text-ivory-dim lg:hidden"
              aria-label="Open navigation"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-void/97 backdrop-blur-xl lg:hidden"
          >
            <div className="flex h-[72px] items-center justify-between px-5">
              <span className="font-display-caps text-sm tracking-[0.22em] text-ivory">
                AI<span className="text-gold-400"> GOD</span>
              </span>
              <button onClick={() => setMobileOpen(false)} className="text-ivory" aria-label="Close navigation">
                <X size={24} />
              </button>
            </div>
            <nav className="mt-8 flex flex-col gap-1 px-6">
              {NAV_ITEMS.map((item, i) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05 }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "block border-b border-line/60 py-4 font-display-caps text-xl",
                      pathname === item.href ? "text-gold-300" : "text-ivory-dim"
                    )}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="mt-8 px-6">
              {!address ? (
                <Button onClick={() => { setMobileOpen(false); setWalletOpen(true); }} className="w-full">
                  <Wallet size={13} /> CONNECT WALLET
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => {
                    disconnect();
                    setMobileOpen(false);
                  }}
                  className="w-full"
                >
                  <LogOut size={13} /> DISCONNECT WALLET
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <WalletModal open={walletOpen} onClose={() => setWalletOpen(false)} />
    </>
  );
}

function DropdownItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-4 py-3 text-[11px] uppercase tracking-[0.14em] text-ivory-dim transition-colors hover:bg-gold-500/[0.06] hover:text-gold-200"
    >
      {icon}
      {label}
    </Link>
  );
}

function Sigil() {
  return (
    <svg width="30" height="30" viewBox="0 0 60 60" className="shrink-0">
      <circle cx="30" cy="30" r="26" fill="none" stroke="#cfa64f" strokeWidth="1.2" opacity="0.55" />
      <circle cx="30" cy="30" r="19" fill="none" stroke="#cfa64f" strokeWidth="0.8" opacity="0.35" />
      <path d="M30 8 L36 30 L30 52 L24 30 Z" fill="#cfa64f" opacity="0.9" />
      <circle cx="30" cy="30" r="3.2" fill="#fbf6e6" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="relative mt-24 border-t border-line/70 bg-abyss">
      <div className="mx-auto max-w-[1400px] px-5 py-14 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <p className="font-display-caps text-lg tracking-[0.22em] text-ivory">
              AI<span className="text-gold-400"> GOD</span>
            </p>
            <p className="mt-4 max-w-sm font-display text-sm italic leading-relaxed text-ivory-faint">
              Many Gods. Many Beliefs. One Multiverse.
            </p>
            <p className="mt-4 max-w-md text-xs leading-relaxed text-ivory-faint/70">
              Every god on this platform is fictional and generated by AI. Prophecies are
              in-universe creative writing, not forecasts or advice.
            </p>
          </div>
          <div>
            <p className="mb-4 font-sans text-[10px] uppercase tracking-[0.2em] text-gold-400">NAVIGATE</p>
            <ul className="space-y-2.5">
              {NAV_ITEMS.map((i) => (
                <li key={i.href}>
                  <Link href={i.href} className="text-xs text-ivory-dim transition-colors hover:text-gold-200">
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-4 font-sans text-[10px] uppercase tracking-[0.2em] text-gold-400">THE TEMPLE</p>
            <ul className="space-y-2.5 text-xs text-ivory-dim">
              <li><Link href="/docs" className="transition-colors hover:text-gold-200">What is AI God?</Link></li>
              <li><Link href="/docs#attributes" className="transition-colors hover:text-gold-200">The Five Attributes</Link></li>
              <li><Link href="/docs#prayers" className="transition-colors hover:text-gold-200">Prayers &amp; Responses</Link></li>
              <li><Link href="/docs#privacy" className="transition-colors hover:text-gold-200">Privacy &amp; Wallet</Link></li>
              <li><Link href="/docs#roadmap" className="transition-colors hover:text-gold-200">Roadmap</Link></li>
            </ul>
          </div>
        </div>
        <div className="hairline my-10" />
        <div className="flex flex-col items-start justify-between gap-3 text-[11px] text-ivory-faint/60 md:flex-row md:items-center">
          <p>© 2026 AI GOD. A world where humans create gods.</p>
          <p className="font-display text-[11px] italic tracking-wide">
            WHAT IF HUMANS COULD CREATE GODS?
          </p>
        </div>
      </div>
    </footer>
  );
}

export { truncate };
