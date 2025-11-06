"use client";
import { useRef, useState } from "react";

export default function CodeBoxes({ length = 6, onComplete }: { length?: number; onComplete?: (code: string) => void }) {
  const [values, setValues] = useState<string[]>(Array.from({ length }, () => ""));
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const setRef = (el: HTMLInputElement | null, i: number) => {
    refs.current[i] = el;
  };

  function onChange(e: React.ChangeEvent<HTMLInputElement>, i: number) {
    const raw = e.target.value;
    const v = (raw.match(/\d/)?.[0] ?? "");
    const next = values.slice();
    next[i] = v;
    setValues(next);
    if (v && i < length - 1) refs.current[i + 1]?.focus();
    const code = next.join("");
    if (onComplete && code.length === length) onComplete(code);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>, i: number) {
    if (e.key === "Backspace" && !values[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  }

  return (
    <div className="otp-grid" role="group" aria-label="One-time passcode">
      {values.map((val, i) => (
        <input
          key={i}
          ref={(el) => setRef(el, i)}
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          className="otp-input"
          value={val}
          onChange={(e) => onChange(e, i)}
          onKeyDown={(e) => onKeyDown(e, i)}
        />)
      )}
    </div>
  );
}

