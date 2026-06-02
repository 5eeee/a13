/** Количество цифр в номере. */
export function phoneDigitCount(phone: string): number {
  return phone.replace(/\D/g, "").length;
}

/** Минимум цифр в номере (РФ / СНГ). */
export function phoneHasMinDigits(phone: string, minDigits = 10): boolean {
  return phoneDigitCount(phone) >= minDigits;
}

/** Ссылка tel: из номера в настройках CMS. */
export function telHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "tel:";
  const normalized = digits.startsWith("7") ? digits : `7${digits}`;
  return `tel:+${normalized}`;
}
