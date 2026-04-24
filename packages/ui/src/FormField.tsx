import type {
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
} from "react";

interface FieldWrapperProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: ReactNode;
}

export function FieldWrapper({
  label,
  htmlFor,
  required,
  children,
}: FieldWrapperProps) {
  return (
    <div className="ui-field">
      <label className="ui-field__label" htmlFor={htmlFor}>
        {label}
        {required && <span className="ui-field__required"> *</span>}
      </label>
      {children}
    </div>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function Input({ label, id, required, className = "", ...props }: InputProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <FieldWrapper label={label} htmlFor={fieldId} required={required}>
      <input
        id={fieldId}
        className={`ui-field__input ${className}`}
        required={required}
        {...props}
      />
    </FieldWrapper>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export function Textarea({ label, id, required, className = "", ...props }: TextareaProps) {
  const fieldId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <FieldWrapper label={label} htmlFor={fieldId} required={required}>
      <textarea
        id={fieldId}
        className={`ui-field__input ui-field__textarea ${className}`}
        required={required}
        {...props}
      />
    </FieldWrapper>
  );
}
