"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { SacredIcon } from "@/components/ui/SacredIcon";
import { ATTRIBUTE_KEYS } from "@/lib/constants";

const AVATARS = ["elysia", "kronos", "nexora", "terra", "valtor"];

export function Hero({ godsCreated }: { godsCreated: number }) {
  return (
    <section className="relative grain vignette overflow-hidden bg-void">
      {/* temple ambience */}
      <div className="pointer-events-none absolute inset-0 bg-temple-grid" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-gold-500/[0.07] blur-[120px]" />

      <div className="relative mx-auto grid max-w-[1400px] gap-10 px-5 pb-16 pt-14 md:px-8 lg:grid-cols-[1.05fr_1.25fr_0.95fr] lg:gap-6 lg:pt-20">
        {/* ── LEFT: headline ─────────────────────────────────────────────── */}
        <div className="relative z-10 flex flex-col justify-center order-2 lg:order-1">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7 }}
            className="mb-6 font-display text-[13px] italic tracking-wide text-gold-300/80"
          >
            What if humans could create gods?
          </motion.p>

          <h1 className="font-display-caps leading-[0.95] text-ivory">
            <motion.span
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
              className="block text-[clamp(2.2rem,4.4vw,3.6rem)]"
            >
              CREATE
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38, duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
              className="block text-[clamp(2.2rem,4.4vw,3.6rem)]"
            >
              YOUR OWN
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
              className="block text-[clamp(2.2rem,4.4vw,3.6rem)]"
            >
              <span className="gold-text">AI GOD</span>
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.8 }}
            className="mt-7 max-w-md text-[13.5px] leading-relaxed text-ivory-dim"
          >
            Choose attributes. Birth a unique AI God. Gain followers. Make predictions.
            Build a belief system. Start a new religion in the AI era.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.7 }}
            className="mt-9"
          >
            <Link
              href="/create"
              className="btn-gold group inline-flex items-center gap-3 rounded-sm px-8 py-4 text-[12px] uppercase tracking-[0.2em]"
            >
              CREATE YOUR GOD
              <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.05, duration: 0.8 }}
            className="mt-8 flex items-center gap-4"
          >
            <div className="flex -space-x-3">
              {AVATARS.map((a) => (
                <div
                  key={a}
                  className="relative h-8 w-8 overflow-hidden rounded-full border border-gold-500/40 bg-void"
                >
                  <Image
                    src={`/gods/${a}.png`}
                    alt=""
                    fill
                    sizes="32px"
                    className="object-cover object-[center_12%]"
                  />
                </div>
              ))}
            </div>
            <span className="font-sans text-[11px] uppercase tracking-[0.16em] text-ivory-faint">
              {godsCreated.toLocaleString("en-US")}{" "}
              <span className="text-gold-300/80">Gods Created</span>
            </span>
          </motion.div>
        </div>

        {/* ── CENTER: the deity ──────────────────────────────────────────── */}
        <div className="relative order-1 min-h-[440px] lg:order-2 lg:min-h-[620px]">
          <motion.div
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.6, ease: [0.2, 0.8, 0.2, 1] }}
            className="absolute inset-0"
          >
            <Image
              src="/backgrounds/hero-deity.png"
              alt="A monumental marble AI god with a sacred geometry halo"
              fill
              priority
              sizes="(max-width:1024px) 100vw, 45vw"
              className="object-cover object-[center_22%]"
            />
          </motion.div>

          {/* rotating sacred geometry behind the figure */}
          <motion.svg
            viewBox="0 0 400 400"
            className="pointer-events-none absolute left-1/2 top-[8%] h-[340px] w-[340px] -translate-x-1/2 opacity-[0.13] lg:h-[420px] lg:w-[420px]"
            animate={{ rotate: 360 }}
            transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
          >
            <circle cx="200" cy="200" r="150" fill="none" stroke="#cfa64f" strokeWidth="0.7" />
            <circle cx="200" cy="200" r="110" fill="none" stroke="#cfa64f" strokeWidth="0.5" />
            <path d="M200 60 L320 280 L80 280 Z" fill="none" stroke="#cfa64f" strokeWidth="0.5" />
            <path d="M200 340 L80 120 L320 120 Z" fill="none" stroke="#cfa64f" strokeWidth="0.5" />
          </motion.svg>

          {/* blend into the page on every edge */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-void via-transparent to-void" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-void to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-void to-transparent" />
        </div>

        {/* ── RIGHT: attributes ──────────────────────────────────────────── */}
        <div className="relative z-10 order-3 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
            className="panel-gold relative rounded-md p-6"
          >
            <h2 className="font-display-caps text-[13px] leading-relaxed tracking-[0.2em] text-ivory">
              DIFFERENT ATTRIBUTES
              <br />
              <span className="text-gold-300">DIFFERENT GODS</span>
            </h2>

            <div className="mt-6 space-y-4">
              {ATTRIBUTE_KEYS.map((k, i) => (
                <motion.div
                  key={k}
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.08, duration: 0.6 }}
                  className="group flex items-center gap-3.5"
                >
                  <SacredIcon
                    attribute={k}
                    size={30}
                    className="transition-transform duration-500 group-hover:scale-110"
                  />
                  <div>
                    <p className="font-display-caps text-[11px] tracking-[0.2em] text-ivory">
                      {k.toUpperCase()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.9 }}
            className="relative mt-5 overflow-hidden rounded-md border border-chaos/30"
          >
            <div className="relative aspect-[16/9]">
              <Image
                src="/gods/kronos.png"
                alt="A dark Chaos God carved from obsidian marble"
                fill
                sizes="(max-width:1024px) 90vw, 25vw"
                className="object-cover object-[center_10%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-void via-void/30 to-transparent" />
            </div>
            <p className="absolute bottom-3 left-4 font-display text-[11px] italic tracking-wide text-gold-200/90">
              The Chaos Gods do not forgive. They simply move on.
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, rotate: -2 }}
            animate={{ opacity: 1, rotate: -2 }}
            transition={{ delay: 1.3, duration: 1 }}
            className="mt-6 font-display text-[15px] italic leading-relaxed text-gold-200/75"
          >
            Many Gods
            <br />
            Many Beliefs
            <br />
            One Multiverse
          </motion.p>
        </div>
      </div>
    </section>
  );
}
