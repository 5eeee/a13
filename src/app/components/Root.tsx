import { useEffect, useRef, useState } from "react";
import { Outlet, useNavigate } from "react-router";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { FloatingBar } from "./FloatingBar";
import { PopupForm } from "./PopupForm";
import { CookieConsent } from "./CookieConsent";
import { Toaster } from "sonner";
import { store, hydrateStore } from "../lib/store";
import { ScrollToTop } from "./ScrollToTop";

function YandexMetrika() {
  const loaded = useRef(false);
  useEffect(() => {
    if (loaded.current) return;
    const id = store.getSettings().yandexMetrikaId;
    if (!id) return;
    loaded.current = true;
    const script = document.createElement("script");
    script.innerHTML = `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");ym(${id},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});`;
    document.head.appendChild(script);
  }, []);
  return null;
}

export function Root() {
  const navigate = useNavigate();
  const buffer = useRef("");
  const [cmsReady, setCmsReady] = useState(false);

  useEffect(() => {
    hydrateStore().finally(() => setCmsReady(true));
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

  if (!cmsReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-500 text-sm gap-2">
        <span className="inline-block h-8 w-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        Загрузка данных…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white relative overflow-x-hidden">
      <ScrollToTop />
      <YandexMetrika />
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