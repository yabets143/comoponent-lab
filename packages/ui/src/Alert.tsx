import { useState, type ReactNode } from "react";

export type AlertVariant = "error" | "warning" | "success" | "info";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  dismissible?: boolean;
  onRetry?: () => void;
}

export function Alert({
  variant = "error",
  title,
  children,
  dismissible = false,
  onRetry,
}: AlertProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const icons: Record<AlertVariant, string> = {
    error: "✕",
    warning: "⚠",
    success: "✓",
    info: "ℹ",
  };

  return (
    <div className={`ui-alert ui-alert--${variant}`} role="alert">
      <span className="ui-alert__icon">{icons[variant]}</span>
      <div className="ui-alert__body">
        {title && <p className="ui-alert__title">{title}</p>}
        <p className="ui-alert__msg">{children}</p>
        {onRetry && (
          <button className="ui-alert__retry" onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
      {dismissible && (
        <button
          className="ui-alert__close"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
}
