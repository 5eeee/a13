import { store, type Lead } from "./store";
import { phoneHasMinDigits } from "./phone";

const MAX_FILES = 5;
const MAX_FILE_BYTES = 600_000;
const MAX_TOTAL_DATA_URL_CHARS = 1_500_000;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result ?? ""));
    r.onerror = () => reject(new Error("read"));
    r.readAsDataURL(file);
  });
}

/** Вложения для заявки: мелкие файлы — в data URL, крупные — только имена в message. */
export async function prepareLeadFiles(
  files: File[]
): Promise<{ files: string[]; skippedNames: string[] }> {
  const dataUrls: string[] = [];
  const skippedNames: string[] = [];
  let totalChars = 0;

  for (const file of files.slice(0, MAX_FILES)) {
    if (file.size > MAX_FILE_BYTES) {
      skippedNames.push(`${file.name} (слишком большой)`);
      continue;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      if (dataUrl.length + totalChars > MAX_TOTAL_DATA_URL_CHARS) {
        skippedNames.push(`${file.name} (лимит вложений)`);
        continue;
      }
      dataUrls.push(dataUrl);
      totalChars += dataUrl.length;
    } catch {
      skippedNames.push(file.name);
    }
  }

  return { files: dataUrls, skippedNames };
}

export function validateLeadContacts(name: string, phone: string): string | null {
  if (!name.trim()) return "Укажите имя";
  if (!phoneHasMinDigits(phone)) return "Укажите номер телефона полностью";
  return null;
}

export type SubmitLeadInput = Omit<Lead, "id"> & { attachFiles?: File[] };

/**
 * Отправка заявки на сервер. Бросает Error с текстом для toast при ошибке.
 */
export async function submitLead(input: SubmitLeadInput): Promise<Lead> {
  const err = validateLeadContacts(input.name, input.phone);
  if (err) throw new Error(err);

  let message = input.message ?? "";
  let files = input.files ?? [];

  if (input.attachFiles?.length) {
    const prepared = await prepareLeadFiles(input.attachFiles);
    files = prepared.files;
    if (prepared.skippedNames.length) {
      const note = `\nФайлы (только названия): ${prepared.skippedNames.join(", ")}`;
      message = message ? `${message}${note}` : note.trim();
    }
  }

  const payload: Omit<Lead, "id"> = {
    name: input.name.trim(),
    phone: input.phone.trim(),
    email: (input.email ?? "").trim(),
    message,
    calculation: input.calculation ?? "",
    source: input.source || "Сайт",
    files,
    date: input.date || new Date().toISOString(),
    region: input.region?.trim() || "",
    floors: input.floors?.trim() || "",
  };

  return store.addLead(payload);
}
