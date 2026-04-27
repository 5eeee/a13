/** Регистрация SW только в production: кэш статики и офлайн-оболочка SPA. */
export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  const base = import.meta.env.BASE_URL;
  const url = `${base}sw.js`.replace(/\/{2,}/g, "/");
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register(url, { scope: base }).catch(() => {
      /* игнорируем: file://, запрет хостинга, старые браузеры */
    });
  });
}
