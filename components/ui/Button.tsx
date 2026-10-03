"use client";

import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "gold" | "ghost" | "text";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

export function Button({ variant = "gold", size = "md", className, children, ...rest }: Props) {
  const base =
    "relative inline-flex items-center justify-center gap-2 font-sans uppercase tracking-[0.16em] transition-all duration-300 select-none";
  const sizes = {
    sm: "text-[10px] px-4 py-2",
    md: "text-[11px] px-6 py-3",
    lg: "text-[13px] px-9 py-4",
  };
  const variants = {
    gold: "btn-gold rounded-sm",
    ghost: "btn-ghost rounded-sm",
    text: "text-ivory-dim hover:text-gold-200 px-0",
  };
  return (
    <button className={cn(base, sizes[size], variants[variant], className)} {...rest}>
      {children}
    </button>
  );
}
