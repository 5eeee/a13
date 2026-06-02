import { useEffect, useRef, useState } from "react";
import {
  OFFICE_ADDRESS,
  PRODUCTION_ADDRESS,
  OFFICE_POINT,
  PRODUCTION_POINT,
  yandexMapWidgetUrl,
} from "../lib/contactsMap";

export function ContactsYandexMap() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [showFrame, setShowFrame] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "preconnect";
    link.href = "https://yandex.ru";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowFrame(true);
          obs.disconnect();
        }
      },
      { rootMargin: "200px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const mapSrc = yandexMapWidgetUrl();

  return (
    <div ref={wrapRef} className="w-full">
      <div className="flex flex-wrap gap-3 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-3 -mt-2">
        <div className="flex items-start gap-2 rounded-xl bg-blue-50 border border-blue-100 px-3 py-2 text-xs text-gray-700 max-w-md">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-600 mt-0.5 shrink-0" />
          <span>
            <strong className="text-gray-900">{OFFICE_POINT.label}:</strong> {OFFICE_ADDRESS}
            <a href={OFFICE_POINT.yandexMapsUrl} target="_blank" rel="noopener noreferrer" className="block text-blue-700 hover:underline mt-0.5">Открыть на карте</a>
          </span>
        </div>
        <div className="flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2 text-xs text-gray-700 max-w-md">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-600 mt-0.5 shrink-0" />
          <span>
            <strong className="text-gray-900">{PRODUCTION_POINT.label}:</strong> {PRODUCTION_ADDRESS}
            <a href={PRODUCTION_POINT.yandexMapsUrl} target="_blank" rel="noopener noreferrer" className="block text-emerald-800 hover:underline mt-0.5">Открыть на карте</a>
          </span>
        </div>
      </div>
      <div className="w-full h-[400px] sm:h-[440px] rounded-t-3xl overflow-hidden bg-slate-100 relative">
        {!showFrame ? (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400">
            Загрузка карты…
          </div>
        ) : (
          <iframe
            src={mapSrc}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            title="Офис и производство Бюро А13"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
}
