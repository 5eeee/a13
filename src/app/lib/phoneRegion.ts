/** Маска телефона (Россия / СНГ). */

export type PhoneRegionId = "ru" | "kz" | "by" | "ua";

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

export function formatPhoneByRegion(input: string, region: PhoneRegionId): string {
  if (region === "ru" || region === "kz") return formatRuKzDigits(input);
  if (region === "by") return formatBy375(nat375(input));
  return formatBy380(nat380(input));
}
