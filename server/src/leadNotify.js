/* eslint-disable no-console */
/**
 * Уведомления о заявке: Telegram, SMTP (корпоративная почта), вебхук CRM.
 * Токены и SMTP — только в переменных окружения сервера (не в CMS в браузере).
 */

import nodemailer from "nodemailer";

let transporter = null;
function getTransporter() {
  const host = process.env.SMTP_HOST?.trim();
  if (!host) return null;
  if (transporter) return transporter;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === "1" || process.env.SMTP_SECURE === "true";
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS || "";
  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user ? { user, pass } : undefined,
  });
  return transporter;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function leadText(lead) {
  const lines = [
    "Новая заявка с сайта",
    `ID: ${lead.id}`,
    `Имя: ${lead.name}`,
    `Телефон: ${lead.phone}`,
    lead.email ? `Email: ${lead.email}` : null,
    lead.message ? `Сообщение: ${lead.message}` : null,
    lead.source ? `Источник: ${lead.source}` : null,
    lead.calculation ? `Расчёт/комментарий: ${String(lead.calculation).slice(0, 2000)}` : null,
    lead.region ? `Регион: ${lead.region}` : null,
    lead.floors ? `Этажность: ${lead.floors}` : null,
    `Время: ${new Date(lead.date || Date.now()).toLocaleString("ru-RU")}`,
  ].filter(Boolean);
  return lines.join("\n");
}

/**
 * @param {object} lead — сохранённая заявка
 * @param {object} settings — из cms_documents.settings (часть полей)
 */
export async function forwardLeadNotifications(lead, settings = {}) {
  /** Токены Telegram только из .env сервера — не дублировать в публичном API. */
  const token = (process.env.TELEGRAM_BOT_TOKEN || "").trim();
  const chatId = (process.env.TELEGRAM_CHAT_ID || "").trim();
  const crmUrl = (process.env.CRM_WEBHOOK_URL || settings.crmWebhookUrl || "").trim();
  const toEmail = (process.env.LEAD_TO_EMAIL || settings.email || "").trim() || null;

  const text = leadText(lead);
  const html = `<pre style="font-family:system-ui,sans-serif;white-space:pre-wrap;">${escapeHtml(text)}</pre>`;

  if (token && chatId) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: undefined,
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        console.error("[leads/telegram] HTTP", res.status, t);
      } else {
        console.log("[leads/telegram] sent lead id", lead.id);
      }
    } catch (e) {
      console.error("[leads/telegram]", e);
    }
  } else {
    console.warn("[leads/telegram] пропущено: задайте TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID в .env на сервере");
  }

  const t = getTransporter();
  if (t && toEmail) {
    const from = process.env.SMTP_FROM?.trim() || process.env.SMTP_USER?.trim() || toEmail;
    try {
      await t.sendMail({
        from: `Сайт А13 <${from}>`,
        to: toEmail,
        subject: `Заявка с сайта: ${String(lead.name || "").slice(0, 80)}`.trim() || "Заявка с сайта",
        text,
        html,
      });
      console.log("[leads/mail] sent to", toEmail, "lead id", lead.id);
    } catch (e) {
      console.error("[leads/mail]", e);
    }
  } else {
    if (!t) {
      console.warn("[leads/mail] пропущено: нет SMTP_HOST (см. server/.env.example)");
    } else if (!toEmail) {
      console.warn("[leads/mail] пропущено: нет LEAD_TO_EMAIL и email в настройках CMS");
    }
  }

  if (crmUrl) {
    try {
      const res = await fetch(crmUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: lead.name,
          phone: lead.phone,
          email: lead.email || "",
          message: lead.message || "",
          region: lead.region || "",
          floors: lead.floors || "",
          source: lead.source,
          date: lead.date,
          id: lead.id,
        }),
      });
      if (!res.ok) console.error("[leads/crm] HTTP", res.status, await res.text());
      else console.log("[leads/crm] sent lead id", lead.id);
    } catch (e) {
      console.error("[leads/crm]", e);
    }
  }
}
