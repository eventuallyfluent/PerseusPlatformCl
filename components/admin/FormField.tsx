type Props = {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  error?: string;
  rows?: number;
  children?: React.ReactNode;
};

const inputStyle = {
  background: "var(--bg-elevated)",
  borderColor: "var(--border)",
  color: "var(--text-primary)",
} as React.CSSProperties;

const inputCls =
  "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2";

export function FormField({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  placeholder,
  hint,
  error,
  rows,
  children,
}: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
        {label}
        {required && <span className="ml-0.5" style={{ color: "var(--danger)" }}>*</span>}
      </label>

      {children ? (
        <select
          id={name}
          name={name}
          defaultValue={String(defaultValue ?? "")}
          className={inputCls}
          style={inputStyle}
        >
          {children}
        </select>
      ) : rows ? (
        <textarea
          id={name}
          name={name}
          rows={rows}
          defaultValue={defaultValue ?? ""}
          placeholder={placeholder}
          required={required}
          className={inputCls}
          style={inputStyle}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          defaultValue={defaultValue ?? ""}
          placeholder={placeholder}
          required={required}
          className={inputCls}
          style={inputStyle}
        />
      )}

      {hint && <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{hint}</p>}
      {error && <p className="text-xs" style={{ color: "var(--danger)" }}>{error}</p>}
    </div>
  );
}
