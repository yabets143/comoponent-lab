import type { ReactNode } from "react";

export type BadgeVariant = "default" | "accent" | "success" | "error" | "warning";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
}

export function Badge({ variant = "default", children }: BadgeProps) {
  return (
    <span className={`ui-badge ui-badge--${variant}`}>{children}</span>
  );
}
