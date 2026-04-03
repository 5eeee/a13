/* ---- Telegram Bot API integration ---- */

import { store } from "./store";

interface FormData {
  name: string;
  phone: string;
  email?: string;
  message?: string;
  source: string;
}

export async function sendToTelegram(data: FormData): Promise<boolean> {
  const settings = store.getSettings();
  const { telegramBotToken, telegramChatId } = settings;

  if (!telegramBotToken || !telegramChatId) {
    console.warn("Telegram Bot not configured");
    return true; // don't block UX if not configured
  }

  const text = [
    `📩 *Новая заявка с сайта*`,
    ``,
    `👤 Имя: ${escapeMarkdown(data.name)}`,
    `📞 Телефон: ${escapeMarkdown(data.phone)}`,
    data.email ? `📧 Email: ${escapeMarkdown(data.email)}` : null,
    data.message ? `💬 Сообщение: ${escapeMarkdown(data.message)}` : null,
    ``,
    `📍 Источник: ${escapeMarkdown(data.source)}`,
    `🕐 ${new Date().toLocaleString("ru-RU")}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text,
        parse_mode: "Markdown",
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function escapeMarkdown(str: string): string {
  return str.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
}
