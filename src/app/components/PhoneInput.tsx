import { useState, useEffect, type ChangeEvent } from "react";
import { formatPhoneByRegion } from "../lib/phoneRegion";

const PH = "+7 (___) ___-__-__";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
}

export function PhoneInput({ value, onChange, className = "", placeholder, required }: PhoneInputProps) {
  const [display, setDisplay] = useState(() => value);
  const ph = placeholder ?? PH;

  useEffect(() => {
    setDisplay(value);
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneByRegion(e.target.value, "ru");
    setDisplay(formatted);
    onChange(formatted);
  };

  const handleFocus = () => {
    if (!display?.trim()) {
      setDisplay("+7");
      onChange("+7");
    }
  };

  return (
    <input
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      value={display}
      onChange={handleChange}
      onFocus={handleFocus}
      className={className}
      placeholder={ph}
      required={required}
    />
  );
}
