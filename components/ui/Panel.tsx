"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
  gold?: boolean;
}

export function Panel({ children, className, delay = 0, gold = false }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.8, 0.2, 1] }}
      className={cn("relative rounded-md", gold ? "panel-gold" : "panel", className)}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  title,
  subtitle,
  align = "left",
}: {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn("mb-8", align === "center" && "text-center")}>
      <h2 className="font-display-caps text-2xl md:text-3xl text-ivory">{title}</h2>
      {subtitle && <p className="mt-2 text-sm text-ivory-faint">{subtitle}</p>}
      <div className={cn("hairline mt-5", align === "center" && "mx-auto max-w-[180px]")} />
    </div>
  );
}
