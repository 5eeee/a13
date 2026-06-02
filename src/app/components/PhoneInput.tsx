import { useState, useEffect, type ChangeEvent } from "react";
import { formatPhoneByRegion } from "../lib/phoneRegion";
import { phoneDigitCount, phoneHasMinDigits } from "../lib/phone";

const PH = "+7 (___) ___-__-__";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  required?: boolean;
  /** Показать красную рамку, если номер неполный (после попытки отправки). */
  invalid?: boolean;
}

export function PhoneInput({
  value,
  onChange,
  className = "",
  placeholder,
  required,
  invalid = false,
}: PhoneInputProps) {
  const [display, setDisplay] = useState(() => value);
  const [touched, setTouched] = useState(false);
  const ph = placeholder ?? PH;
  const digits = phoneDigitCount(display);
  const showError = (invalid || touched) && required && !phoneHasMinDigits(display);

  useEffect(() => {
    setDisplay(value);
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneByRegion(e.target.value, "ru");
    setDisplay(formatted);
    onChange(formatted);
  };

  const handleFocus = () => {
    if (!display?.trim() || display === "+7") {
      setDisplay("+7");
      onChange("+7");
    }
  };

  const handleBlur = () => {
    setTouched(true);
    if (digits <= 1) {
      setDisplay("");
      onChange("");
    }
  };

  return (
    <div className="space-y-1">
      <input
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={display}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`${className}${showError ? " border-red-400 ring-1 ring-red-200" : ""}`}
        placeholder={ph}
        aria-invalid={showError}
      />
      {showError ? (
        <p className="text-xs text-red-600">Введите номер полностью, например +7 (916) 117-13-50</p>
      ) : null}
    </div>
  );
}
