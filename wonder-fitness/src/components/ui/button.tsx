import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "dark" | "outline" | "ghost" | "soft";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-white shadow-[0_8px_24px_-8px_rgba(255,77,28,.6)] hover:bg-brand-dark focus-visible:ring-brand/40",
  dark: "bg-ink text-white hover:bg-ink-2 focus-visible:ring-ink/30",
  outline: "border border-line bg-white text-ink hover:border-ink/25 hover:bg-surface focus-visible:ring-ink/10",
  ghost: "text-ink/70 hover:bg-ink/5 hover:text-ink focus-visible:ring-ink/10",
  soft: "bg-brand-soft text-brand-dark hover:bg-brand/15 focus-visible:ring-brand/25",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px]",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: CommonProps & ComponentProps<"button">) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold outline-none transition focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: CommonProps & { href: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold outline-none transition focus-visible:ring-4",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </Link>
  );
}
