import React from "react";

export function SeccionDocumento({
  id,
  children,
  sectionRef,
}: {
  id: string;
  children: React.ReactNode;
  sectionRef: React.RefObject<HTMLElement | null>;
}) {
  return (
    <section id={id} ref={sectionRef} className="doc-section">
      {children}
    </section>
  );
}

type PropiedadesCampoBase = {
  label: string;
  error?: string;
  wrapperClassName?: string;
  onFieldChange?: (label: string) => void;
  sanitize?: (value: string) => string;
};

export function TextInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & PropiedadesCampoBase
) {
  const { label, error, wrapperClassName, className, onFieldChange, onChange, sanitize, ...rest } = props;
  return (
    <label className={`field ${wrapperClassName || ""}`.trim()}>
      <span className="field__label">{label}</span>
      <input
        className={`field__input ${className || ""}`.trim()}
        data-label={label}
        {...rest}
        onChange={(event) => {
          if (sanitize) event.target.value = sanitize(event.target.value);
          onChange?.(event);
          onFieldChange?.(label);
        }}
      />
      {error ? <p className="field-helper field-helper--error">{error}</p> : null}
    </label>
  );
}

export function TextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & PropiedadesCampoBase
) {
  const { label, error, wrapperClassName, className, onFieldChange, onChange, sanitize, ...rest } = props;
  return (
    <label className={`field field--full ${wrapperClassName || ""}`.trim()}>
      <span className="field__label">{label}</span>
      <textarea
        className={`field__input field__textarea ${className || ""}`.trim()}
        data-label={label}
        {...rest}
        onChange={(event) => {
          if (sanitize) event.target.value = sanitize(event.target.value);
          onChange?.(event);
          onFieldChange?.(label);
        }}
      />
      {error ? <p className="field-helper field-helper--error">{error}</p> : null}
    </label>
  );
}

export function SelectField(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & {
    label: string;
    children: React.ReactNode;
    error?: string;
    onFieldChange?: (label: string) => void;
  }
) {
  const { label, children, error, onFieldChange, onChange, ...rest } = props;
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <select
        className="field__input"
        data-label={label}
        {...rest}
        onChange={(event) => {
          onChange?.(event);
          onFieldChange?.(label);
        }}
      >
        {children}
      </select>
      {error ? <p className="field-helper field-helper--error">{error}</p> : null}
    </label>
  );
}

export function CheckboxGrid({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="checkbox-grid">
      {options.map((option) => {
        const checked = value.includes(option);
        return (
          <label key={option} className="check-item">
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onChange(checked ? value.filter((item) => item !== option) : [...value, option])}
            />
            <span>{option}</span>
          </label>
        );
      })}
    </div>
  );
}
