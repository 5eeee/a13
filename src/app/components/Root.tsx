import { useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { FloatingBar } from "./FloatingBar";
import { PopupForm } from "./PopupForm";
import { CookieConsent } from "./CookieConsent";
import { PageViewTracker } from "./PageViewTracker";
import { Toaster } from "sonner";
import { store, hydrateStore } from "../lib/store";
import { ScrollToTop } from "./ScrollToTop";
import { hasAnalyticsConsent } from "../lib/analytics";
import { COOKIE_CONSENT_KEY } from "../lib/siteUx";
import { registerServiceWorker } from "../lib/registerServiceWorker";

function YandexMetrika() {
  const loaded = useRef(false);
  useEffect(() => {
    const boot = () => {
      if (loaded.current) return;
      const s = store.getSettings();
      const id = s.yandexMetrikaId?.trim();
      if (!id || !hasAnalyticsConsent()) return;
      loaded.current = true;
      const initOpts = {
        clickmap: s.metrikaClickmap !== false,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: !!s.metrikaWebvisor,
      };
      const script = document.createElement("script");
      script.innerHTML = `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");ym(${JSON.stringify(id)},"init",${JSON.stringify(initOpts)});`;
      document.head.appendChild(script);
    };
    void hydrateStore().then(boot);
    const onConsent = () => boot();
    window.addEventListener("a13-cookie-consent", onConsent);
    return () => window.removeEventListener("a13-cookie-consent", onConsent);
  }, []);
  return null;
}

function LiteModeRoot() {
  useEffect(() => {
    const apply = () => {
      const lite =
        store.getSettings().liteMode ||
        (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
      document.documentElement.classList.toggle("lite-mode", lite);
    };
    apply();
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    mq.addEventListener("change", apply);
    window.addEventListener("a13-store-updated", apply);
    return () => {
      mq.removeEventListener("change", apply);
      window.removeEventListener("a13-store-updated", apply);
    };
  }, []);
  return null;
}

export function Root() {
  const navigate = useNavigate();
  const buffer = useRef("");

  useEffect(() => {
    void hydrateStore();
    if (localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted") {
      registerServiceWorker();
    }
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.isComposing) return;
      const t = e.target;
      if (t instanceof Element && t.closest("input, textarea, select, [contenteditable='true']")) return;
      const ch = e.key;
      if (ch.length !== 1) return;
      buffer.current += ch.toLowerCase();
      if (buffer.current.length > 5) buffer.current = buffer.current.slice(-5);
      if (buffer.current.endsWith("a13")) {
        buffer.current = "";
        navigate("/admin");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-white relative overflow-x-hidden">
      <ScrollToTop />
      <LiteModeRoot />
      <YandexMetrika />
      <PageViewTracker />
      <Toaster position="top-center" richColors />
      <Header />
      <FloatingBar />
      <PopupForm />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CookieConsent />
    </div>
  );
}
