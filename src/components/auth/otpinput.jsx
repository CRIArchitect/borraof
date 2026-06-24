import { useRef, useCallback } from "react";
import { cn } from "../../util/cn";

/**
 * OTPInput — 6 caixas separadas para código de verificação.
 * - auto-avanço ao digitar, backspace volta para a anterior
 * - colar 6 dígitos preenche tudo de uma vez
 * - aceita somente dígitos
 * Props: { value, onChange(string), length = 6 }
 */
export default function OTPInput({ value = "", onChange, length = 6, autoFocus = true }) {
  const refs = useRef([]);

  const chars = Array.from({ length }, (_, i) => value[i] || "");

  const emit = useCallback(
    (next) => {
      onChange?.(next.slice(0, length));
    },
    [onChange, length]
  );

  const focusAt = (i) => {
    const el = refs.current[i];
    if (el) {
      el.focus();
      el.select?.();
    }
  };

  function handleChange(i, raw) {
    const digit = raw.replace(/\D/g, "").slice(-1);
    const arr = chars.slice();
    arr[i] = digit;
    const next = arr.join("");
    emit(next);
    if (digit && i < length - 1) focusAt(i + 1);
  }

  function handleKeyDown(i, e) {
    if (e.key === "Backspace") {
      e.preventDefault();
      const arr = chars.slice();
      if (arr[i]) {
        arr[i] = "";
        emit(arr.join(""));
      } else if (i > 0) {
        arr[i - 1] = "";
        emit(arr.join(""));
        focusAt(i - 1);
      }
    } else if (e.key === "ArrowLeft" && i > 0) {
      e.preventDefault();
      focusAt(i - 1);
    } else if (e.key === "ArrowRight" && i < length - 1) {
      e.preventDefault();
      focusAt(i + 1);
    }
  }

  function handlePaste(i, e) {
    e.preventDefault();
    const pasted = (e.clipboardData.getData("text") || "").replace(/\D/g, "");
    if (!pasted) return;
    const arr = chars.slice();
    for (let k = 0; k < pasted.length && i + k < length; k++) {
      arr[i + k] = pasted[k];
    }
    const next = arr.join("");
    emit(next);
    const last = Math.min(i + pasted.length, length - 1);
    focusAt(last);
  }

  return (
    <div className="otp" role="group" aria-label={`Código de verificação de ${length} dígitos`}>
      {chars.map((c, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          className={cn("otp-cell", c && "filled")}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={c}
          aria-label={`Dígito ${i + 1} de ${length}`}
          autoFocus={autoFocus && i === 0}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={(e) => handlePaste(i, e)}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
}
