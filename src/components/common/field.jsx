import { useId } from "react";
import { cn } from "../../util/cn";

/* Accessible form fields — label always linked to control via id (htmlFor). */

export function Input({ label, hint, className = "", id, ...props }) {
  const auto = useId();
  const fid = id || auto;
  return (
    <div className="field">
      {label && <label className="field-label" htmlFor={fid}>{label}</label>}
      <input id={fid} className={cn("field-input", className)} {...props} />
      {hint && <span className="text-xs text-faint">{hint}</span>}
    </div>
  );
}

export function Textarea({ label, hint, className = "", id, ...props }) {
  const auto = useId();
  const fid = id || auto;
  return (
    <div className="field">
      {label && <label className="field-label" htmlFor={fid}>{label}</label>}
      <textarea id={fid} className={cn("field-textarea", className)} {...props} />
      {hint && <span className="text-xs text-faint">{hint}</span>}
    </div>
  );
}

export function Select({ label, children, className = "", id, ...props }) {
  const auto = useId();
  const fid = id || auto;
  return (
    <div className="field">
      {label && <label className="field-label" htmlFor={fid}>{label}</label>}
      <select id={fid} className={cn("field-select", className)} {...props}>
        {children}
      </select>
    </div>
  );
}

/** Floating-label input (placeholder must be " "). */
export function FloatInput({ label, className = "", id, ...props }) {
  const auto = useId();
  const fid = id || auto;
  return (
    <label className="float" htmlFor={fid}>
      <input id={fid} placeholder=" " className={className} {...props} />
      <span>{label}</span>
    </label>
  );
}
