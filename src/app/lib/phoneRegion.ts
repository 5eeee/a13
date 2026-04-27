/** Регионы для маски телефона в настройках и в формах. */

export type PhoneRegionId = "ru" | "kz" | "by" | "ua";

export const PHONE_REGIONS: { id: PhoneRegionId; label: string; placeholder: string }[] = [
  { id: "ru", label: "Россия +7", placeholder: "+7 (___) ___-__-__" },
  { id: "kz", label: "Казахстан +7", placeholder: "+7 (___) ___-__-__" },
  { id: "by", label: "Беларусь +375", placeholder: "+375 (__) ___-__-__" },
  { id: "ua", label: "Украина +380", placeholder: "+380 (__) ___-__-__" },
];

const MAX_E164 = 15;

function formatRuKzDigits(d: string): string {
  let r = d.replace(/\D/g, "");
  if (r.startsWith("8") && r.length > 1) r = "7" + r.slice(1);
  if (r && !r.startsWith("7") && r.length <= 10 && !r.startsWith("375") && !r.startsWith("380")) r = "7" + r;
  const digits = r.slice(0, 11);
  if (!digits) return "";
  let result = "+7";
  if (digits.length > 1) result += " (" + digits.slice(1, 4);
  if (digits.length > 4) result += ") " + digits.slice(4, 7);
  if (digits.length > 7) result += "-" + digits.slice(7, 9);
  if (digits.length > 9) result += "-" + digits.slice(9, 11);
  return result;
}

function nat375(d: string): string {
  let x = d.replace(/\D/g, "");
  if (x.startsWith("375")) x = x.slice(3);
  return x.slice(0, 9);
}

function formatBy375(nat9: string): string {
  const x = nat9.replace(/\D/g, "");
  if (!x) return "";
  let s = "+375";
  s += " (" + x.slice(0, 2);
  if (x.length < 2) return s;
  s += ") " + x.slice(2, 5);
  if (x.length <= 5) return s;
  s += "-" + x.slice(5, 7);
  if (x.length <= 7) return s;
  s += "-" + x.slice(7, 9);
  return s;
}

function nat380(d: string): string {
  let x = d.replace(/\D/g, "");
  if (x.startsWith("380")) x = x.slice(3);
  return x.slice(0, 9);
}

function formatBy380(nat9: string): string {
  const x = nat9.replace(/\D/g, "");
  if (!x) return "";
  let s = "+380";
  s += " (" + x.slice(0, 2);
  if (x.length < 2) return s;
  s += ") " + x.slice(2, 5);
  if (x.length <= 5) return s;
  s += "-" + x.slice(5, 7);
  if (x.length <= 7) return s;
  s += "-" + x.slice(7, 9);
  return s;
}

/** Маскирование по региону. */
export function formatPhoneByRegion(input: string, region: PhoneRegionId): string {
  if (region === "ru" || region === "kz") return formatRuKzDigits(input);
  if (region === "by") return formatBy375(nat375(input));
  return formatBy380(nat380(input));
}

/** Стартовая строка при фокусе пустого поля. */
export function emptyPhoneFocusValue(region: PhoneRegionId): string {
  if (region === "ru" || region === "kz") return "+7";
  return "";
}

/** Краткая подсказка про длину. */
export function phoneRegionHint(region: PhoneRegionId): string {
  if (region === "ru" || region === "kz") return "10 цифр номера (без +7) или 11 с кодом 7. Скобки и дефисы подставляются сами.";
  if (region === "by") return "9 цифр после кода 375. Формат: +375 (XX) XXX-XX-XX.";
  return "9 цифр после кода 380. Формат: +380 (XX) XXX-XX-XX.";
}

export function inferPhoneRegion(phone: string | undefined): PhoneRegionId | null {
  if (!phone || !phone.trim()) return null;
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("375")) return "by";
  if (d.startsWith("380")) return "ua";
  if (d.startsWith("7") && d.length >= 2) return "ru";
  return null;
}

/** Сохраняем цифры при смене региона, если они подходят под новую маску. */
export function phoneAfterRegionChange(
  currentFormatted: string,
  previousRegion: PhoneRegionId,
  newRegion: PhoneRegionId
): string {
  if (previousRegion === newRegion) return currentFormatted;
  const flat = currentFormatted.replace(/\D/g, "");
  if (newRegion === "ru" || newRegion === "kz") {
    if (flat.startsWith("7") && flat.length === 11) return formatPhoneByRegion(flat, "ru");
    if (flat.length === 10 && flat[0] === "9") return formatPhoneByRegion("7" + flat, "ru");
    if (flat.startsWith("8") && flat.length === 11) return formatPhoneByRegion("7" + flat.slice(1), "ru");
  }
  if (newRegion === "by" && flat.startsWith("375")) return formatPhoneByRegion(flat, "by");
  if (newRegion === "ua" && flat.startsWith("380")) return formatPhoneByRegion(flat, "ua");
  if (newRegion === "by" && !flat.startsWith("375") && flat.length === 9) return formatPhoneByRegion("375" + flat, "by");
  if (newRegion === "ua" && !flat.startsWith("380") && flat.length === 9) return formatPhoneByRegion("380" + flat, "ua");
  if (newRegion === "by" || newRegion === "ua") return "";
  if (newRegion === "ru" || newRegion === "kz") return formatPhoneByRegion("7", "ru");
  return "";
}

/** Ограничение «лишнего» для произвольного ввода (не используем в RU/BY/UA, только справка). */
export function maxNatDigitsForRegion(region: PhoneRegionId): number {
  if (region === "ru" || region === "kz") return 10;
  if (region === "by" || region === "ua") return 9;
  return MAX_E164;
}
