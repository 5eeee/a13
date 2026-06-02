/** Подтверждение на email (EmailJS). Заявки → API → server/src/leadNotify.js */
import { store } from "./store";

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
