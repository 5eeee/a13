/* ---- Phone mask input component ---- */

import { useState, type ChangeEvent } from "react";

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (!digits) return "";
  let result = "+7";
  if (digits.length > 1) result += " (" + digits.slice(1, 4);
  if (digits.length > 4) result += ") " + digits.slice(4, 7);
  if (digits.length > 7) result += "-" + digits.slice(7, 9);
  if (digits.length > 9) result += "-" + digits.slice(9, 11);
  return result;
}

function getRawDigits(formatted: string): string {
  return formatted.replace(/\D/g, "");
}

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
}

export function PhoneInput({ value, onChange, className = "", placeholder = "+7 (___) ___-__-__", required }: PhoneInputProps) {
  const [display, setDisplay] = useState(() => formatPhone(value));

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = getRawDigits(e.target.value);
    const formatted = formatPhone(raw.startsWith("8") ? "7" + raw.slice(1) : raw || "7");
    setDisplay(formatted);
    onChange(formatted);
  };

  const handleFocus = () => {
    if (!display) {
      setDisplay("+7");
      onChange("+7");
    }
  };

  return (
    <input
      type="tel"
      value={display}
      onChange={handleChange}
      onFocus={handleFocus}
      className={className}
      placeholder={placeholder}
      required={required}
    />
  );
}
