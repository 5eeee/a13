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

/* ---- CRM Webhook integration ---- */
export async function sendToCRM(data: FormData): Promise<void> {
  const { crmWebhookUrl } = store.getSettings();
  if (!crmWebhookUrl) return;
  try {
    await fetch(crmWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        phone: data.phone,
        email: data.email || "",
        message: data.message || "",
        source: data.source,
        date: new Date().toISOString(),
      }),
    });
  } catch {
    console.warn("CRM webhook failed");
  }
}

/* ---- Email confirmation (via EmailJS or configured service) ---- */
export async function sendEmailConfirmation(email: string, name: string): Promise<void> {
  const { emailServiceId } = store.getSettings();
  if (!emailServiceId || !email) return;
  try {
    await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: emailServiceId,
        template_id: "a13_confirmation",
        user_id: emailServiceId,
        template_params: { to_email: email, to_name: name, company: "Бюро А13" },
      }),
    });
  } catch {
    console.warn("Email confirmation failed");
  }
}

function escapeMarkdown(str: string): string {
  return str.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
}
