import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <section className={`ui-card ${className}`} {...props}>
      {children}
    </section>
  );
}

interface CardTitleProps {
  children: ReactNode;
  size?: "lg" | "md";
}

export function CardTitle({ children, size = "lg" }: CardTitleProps) {
  return (
    <h2 className={`ui-card__title ui-card__title--${size}`}>{children}</h2>
  );
}

export function CardDescription({ children }: { children: ReactNode }) {
  return <p className="ui-card__desc">{children}</p>;
}
