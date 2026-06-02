import { useEffect } from "react";
import { useLocation } from "react-router";
import { trackPageView } from "../lib/analytics";

/** Учёт просмотров страниц после согласия на cookie. */
export function PageViewTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  useEffect(() => {
    const onConsent = () => trackPageView(pathname);
    window.addEventListener("a13-cookie-consent", onConsent);
    return () => window.removeEventListener("a13-cookie-consent", onConsent);
  }, [pathname]);

  return null;
}
