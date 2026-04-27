import { useEffect } from "react";

/**
 * Блокирует прокрутку фона (body/html) под лайтбоксом и модалками.
 * Компенсирует ширину полосы прокрутки, чтобы контент не сдвигался.
 */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const html = document.documentElement;
    const body = document.body;
    const prevBodyOverflow = body.style.overflow;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyPadding = body.style.paddingRight;
    const prevHtmlPadding = html.style.paddingRight;
    const scrollbarW = Math.max(0, window.innerWidth - html.clientWidth);

    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    if (scrollbarW > 0) {
      const pad = `${scrollbarW}px`;
      body.style.paddingRight = pad;
      html.style.paddingRight = pad;
    }

    return () => {
      body.style.overflow = prevBodyOverflow;
      html.style.overflow = prevHtmlOverflow;
      body.style.paddingRight = prevBodyPadding;
      html.style.paddingRight = prevHtmlPadding;
    };
  }, [locked]);
}
